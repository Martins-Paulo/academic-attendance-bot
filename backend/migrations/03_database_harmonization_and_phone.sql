-- ==============================================================================
-- 🚀 UNIGAG MIGRATION 03: HARMONIZAÇÃO DO BANCO, TELEFONE E SEGURANÇA
-- ==============================================================================
-- 1. Suporte a mapeamento de telefone para integração com WhatsApp Bot
-- 2. Atualização de restrições de status (inclusão de 'justified')
-- 3. Constraint de unicidade para prevenir chamadas duplicadas no mesmo dia
-- 4. ON DELETE CASCADE em cascata para integridade referencial
-- 5. Chaves estrangeiras com auth.users em amizades (Gag Squad)
-- 6. Índices de performance para RLS e consultas analíticas
-- ==============================================================================

-- 1. Adicionar telefone para mapeamento dinâmico do bot WhatsApp
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS phone text UNIQUE;

-- 2. Atualizar CHECK constraint de attendances para incluir 'justified'
ALTER TABLE public.attendances 
DROP CONSTRAINT IF EXISTS attendances_status_check;

ALTER TABLE public.attendances 
ADD CONSTRAINT attendances_status_check 
CHECK (status = ANY (ARRAY['present'::text, 'absence'::text, 'justified'::text, 'cancelled'::text]));

-- 3. Impedir presenças duplicadas no mesmo dia para a mesma disciplina
DO $$ BEGIN IF NOT EXISTS ( SELECT 1 FROM pg_constraint WHERE conname = 'uq_attendance_student_subject_date' ) THEN ALTER TABLE public.attendances ADD CONSTRAINT uq_attendance_student_subject_date UNIQUE (student_id, subject_id, date); END IF; END $$;

-- 4. Adicionar ON DELETE CASCADE em todas as Foreign Keys filhas
ALTER TABLE public.subjects 
DROP CONSTRAINT IF EXISTS subjects_student_id_fkey,
ADD CONSTRAINT subjects_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

ALTER TABLE public.attendances 
DROP CONSTRAINT IF EXISTS attendances_student_id_fkey,
DROP CONSTRAINT IF EXISTS attendances_subject_id_fkey,
ADD CONSTRAINT attendances_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE,
ADD CONSTRAINT attendances_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;

ALTER TABLE public.academic_events 
DROP CONSTRAINT IF EXISTS academic_events_student_id_fkey,
DROP CONSTRAINT IF EXISTS academic_events_subject_id_fkey,
ADD CONSTRAINT academic_events_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE,
ADD CONSTRAINT academic_events_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;

ALTER TABLE public.subject_evaluations 
DROP CONSTRAINT IF EXISTS subject_evaluations_subject_id_fkey,
ADD CONSTRAINT subject_evaluations_subject_id_fkey 
FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;

-- 5. Foreign Keys na tabela de amizades (Gag Squad)
ALTER TABLE public.friendships 
DROP CONSTRAINT IF EXISTS friendships_requester_fkey,
DROP CONSTRAINT IF EXISTS friendships_addressee_fkey,
ADD CONSTRAINT friendships_requester_fkey FOREIGN KEY (requester_id) REFERENCES auth.users(id) ON DELETE CASCADE,
ADD CONSTRAINT friendships_addressee_fkey FOREIGN KEY (addressee_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 6. Criação de índices para otimização de RLS e consultas frequentes
CREATE INDEX IF NOT EXISTS idx_subjects_student_id ON public.subjects(student_id);
CREATE INDEX IF NOT EXISTS idx_attendances_query ON public.attendances(student_id, subject_id, date);
CREATE INDEX IF NOT EXISTS idx_evaluations_subject_id ON public.subject_evaluations(subject_id);
CREATE INDEX IF NOT EXISTS idx_events_lookup ON public.academic_events(student_id, event_date);
CREATE INDEX IF NOT EXISTS idx_students_phone ON public.students(phone);
