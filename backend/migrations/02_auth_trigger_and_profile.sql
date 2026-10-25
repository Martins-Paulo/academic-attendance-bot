-- ==============================================================================
-- 🚀 UNIGAG - MIGRATION 02: AUTH TRIGGER, AUTOMATIC PROFILE & RLS HARDENING
-- ==============================================================================
-- Descrição: 
-- 1. Gestão segura de credenciais exclusivamente via schema nativo auth.users
--    (hashing unidirecional seguro com salt via bcrypt/argon2 no Supabase Auth).
-- 2. Trigger automática no PostgreSQL para criação de perfil em public.students.
-- 3. Hardening de Row Level Security (RLS) com auth.uid() para isolamento estrito
--    de dados entre estudantes, bloqueando acesso anônimo aos dados sensíveis.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ESTRUTURA E INTEGRIDADE DO SCHEMA (DDL IDEMPOTENTE)
-- ------------------------------------------------------------------------------

-- Adiciona user_id e avatar na tabela students se não existirem
ALTER TABLE public.students 
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.students 
    ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT 'neutral';

-- Adiciona student_id nas tabelas filhas se não existirem
ALTER TABLE public.subjects 
    ADD COLUMN IF NOT EXISTS student_id BIGINT REFERENCES public.students(id) ON DELETE CASCADE;

ALTER TABLE public.attendances 
    ADD COLUMN IF NOT EXISTS student_id BIGINT REFERENCES public.students(id) ON DELETE CASCADE;

ALTER TABLE public.academic_events 
    ADD COLUMN IF NOT EXISTS student_id BIGINT REFERENCES public.students(id) ON DELETE CASCADE;

-- Backfill para registros legados/demo vinculados ao student ID 1
UPDATE public.subjects SET student_id = 1 WHERE student_id IS NULL;
UPDATE public.attendances SET student_id = 1 WHERE student_id IS NULL;
UPDATE public.academic_events SET student_id = 1 WHERE student_id IS NULL;

-- Garante unicidade de user_id na tabela students (1 perfil por usuário de autenticação)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.students'::regclass 
          AND conname = 'students_user_id_key'
    ) THEN
        ALTER TABLE public.students ADD CONSTRAINT students_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- Índices de integridade e velocidade de junção
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_subjects_student_id ON public.subjects(student_id);
CREATE INDEX IF NOT EXISTS idx_attendances_student_id ON public.attendances(student_id);
CREATE INDEX IF NOT EXISTS idx_events_student_id ON public.academic_events(student_id);

-- ------------------------------------------------------------------------------
-- 2. FUNÇÃO E TRIGGER AUTOMÁTICA DE CRIAÇÃO DE PERFIL (handle_new_user)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_full_name TEXT;
BEGIN
    -- Extrai o nome completo dos metadados brutos enviados no cadastro
    -- Caso não fornecido, adota o prefixo do endereço de e-mail como fallback
    v_full_name := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
        NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
        split_part(NEW.email, '@', 1)
    );

    -- Insere o novo perfil de estudante no schema public
    INSERT INTO public.students (
        user_id,
        name,
        email,
        course,
        semester,
        avatar,
        created_at
    )
    VALUES (
        NEW.id,
        v_full_name,
        NEW.email,
        NULL,
        1,
        'neutral',
        TIMEZONE('utc', NOW())
    )
    ON CONFLICT (user_id) DO UPDATE
    SET 
        name = COALESCE(NULLIF(EXCLUDED.name, ''), public.students.name),
        email = COALESCE(EXCLUDED.email, public.students.email);

    RETURN NEW;
END;
$$;

-- Registra a trigger na tabela auth.users para disparar no cadastro de novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 3. HARDENING DE ROW LEVEL SECURITY (RLS) - MODO DE PRODUÇÃO SEGURO
-- ------------------------------------------------------------------------------

-- Garante que RLS está habilitado em todas as tabelas sensíveis
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_events ENABLE ROW LEVEL SECURITY;

-- Remove políticas de desenvolvimento abertas/permissivas que permitiam acesso anônimo
DROP POLICY IF EXISTS "students_dev_policy" ON public.students;
DROP POLICY IF EXISTS "subjects_dev_policy" ON public.subjects;
DROP POLICY IF EXISTS "attendances_dev_policy" ON public.attendances;
DROP POLICY IF EXISTS "evaluations_dev_policy" ON public.subject_evaluations;
DROP POLICY IF EXISTS "events_dev_policy" ON public.academic_events;

-- Limpeza de políticas de produção anteriores para garantir idempotência
DROP POLICY IF EXISTS "students_prod_policy" ON public.students;
DROP POLICY IF EXISTS "subjects_prod_policy" ON public.subjects;
DROP POLICY IF EXISTS "attendances_prod_policy" ON public.attendances;
DROP POLICY IF EXISTS "evaluations_prod_policy" ON public.subject_evaluations;
DROP POLICY IF EXISTS "events_prod_policy" ON public.academic_events;

-- POLÍTICA 1: Perfil de Estudantes (public.students)
-- Cada estudante autenticado acessa exclusivamente seu próprio registro
CREATE POLICY "students_prod_policy"
ON public.students FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- POLÍTICA 2: Disciplinas (public.subjects)
-- Usuário autenticado acessa apenas disciplinas onde student_id pertence a si
CREATE POLICY "subjects_prod_policy"
ON public.subjects FOR ALL
TO authenticated
USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
)
WITH CHECK (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);

-- POLÍTICA 3: Frequência e Presenças (public.attendances)
-- Usuário autenticado gerencia apenas frequências do seu próprio id de estudante
CREATE POLICY "attendances_prod_policy"
ON public.attendances FOR ALL
TO authenticated
USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
)
WITH CHECK (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);

-- POLÍTICA 4: Critérios de Avaliação e Notas (public.subject_evaluations)
-- Validação em profundidade: avaliação deve pertencer a uma disciplina do estudante
CREATE POLICY "evaluations_prod_policy"
ON public.subject_evaluations FOR ALL
TO authenticated
USING (
    subject_id IN (
        SELECT s.id 
        FROM public.subjects s 
        JOIN public.students st ON s.student_id = st.id 
        WHERE st.user_id = auth.uid()
    )
)
WITH CHECK (
    subject_id IN (
        SELECT s.id 
        FROM public.subjects s 
        JOIN public.students st ON s.student_id = st.id 
        WHERE st.user_id = auth.uid()
    )
);

-- POLÍTICA 5: Eventos Acadêmicos e Entregas (public.academic_events)
-- Usuário autenticado acessa exclusivamente prazos e eventos vinculados à sua conta
CREATE POLICY "events_prod_policy"
ON public.academic_events FOR ALL
TO authenticated
USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
)
WITH CHECK (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);

-- ------------------------------------------------------------------------------
-- FIM DA MIGRAÇÃO 02
-- ------------------------------------------------------------------------------
