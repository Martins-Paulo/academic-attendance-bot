# 📋 Guia de Validação de Ponta a Ponta (E2E) e Ciclo de Vida — UniGag

Este documento apresenta o checklist e o guia de execução dos testes de ciclo de vida e reatividade no **UniGag**, cobrindo o fluxo completo sem necessidade de recarregar a página (**Zero F5**).

---

## 🛠️ 1. Testes Automatizados de Ciclo de Vida (Backend / Supabase)

O script automatizado [`backend/test_lifecycle_e2e.py`](file:///home/paulo-cesar/Documentos/academic-attendance-bot/backend/test_lifecycle_e2e.py) valida todo o ciclo de vida acadêmico diretamente contra a API do Supabase.

### Como Executar:
```bash
# A partir da raiz do projeto:
backend/venv/bin/python3 backend/test_lifecycle_e2e.py
```

### Escopo Coberto pelo Teste Automatizado:
1. **Criação de Disciplina:** Inserção de disciplina com carga horária e limite de faltas.
2. **Registro de Frequência:** Registro de 7 presenças e 3 faltas.
3. **Hardening de Segurança / Constraints:** Tentativa de inserção de status fora do enum (`present`, `absence`, `justified`, `cancelled`), validando que o banco bloqueia violações.
4. **Critérios de Avaliação:** Inserção de avaliações com pesos percentuais e notas decimais.
5. **Validação Matemática Estrita:**
   - **Margem de Faltas:** `max_absences - absences` (ex: $15 - 3 = 12$).
   - **Porcentagem de Presença:** $\frac{7}{7+3} \times 100 = 70.0\%$.
   - **Média Parcial Ponderada:** $\frac{\sum (\text{Nota} \times \text{Peso})}{\sum \text{Pesos Concluídos}} = \frac{(8.5 \times 0.4) + (7.0 \times 0.4)}{0.80} = 7.75$.
   - **Projeção de Meta:** Nota necessária na avaliação pendente para atingir média final 7.0 ($4.00$).
6. **Ciclo de Eventos:** Criação de entrega, alternância para concluída e exclusão.
7. **Cleanup Idempotente:** Limpeza automática dos dados temporários criados.

---

## 🖥️ 2. Guia de Validação Manual no Frontend (Navegador)

Com o servidor rodando em `http://localhost:3000`:

### Cenário 1: Criação de Disciplina e Reatividade Instantânea
1. No dashboard, clique em **"+ Nova matéria"** ou abra pelo menu.
2. Preencha os campos no `ModalCourse`:
   - **Nome:** `Sistemas Distribuídos`
   - **Código:** `SO-401`
   - **Total de Aulas:** `64`
   - **Limite de Faltas:** `16`
3. Clique em **"Cadastrar Disciplina"**.
4. **Validação esperada (Sem F5):**
   - O modal fecha imediatamente.
   - O toast *"Disciplina criada com sucesso!"* é exibido.
   - O card da nova disciplina surge na grade com avatar padrão, 0 faltas e status "Seguro".

### Cenário 2: Registro de Presença/Falta e Alerta Crítico
1. No card da disciplina criada (ou em qualquer disciplina existente), clique no botão rápido **"+ Falta"** ou abra o modal **"Registrar Aula"**.
2. Registre 3 faltas consecutivas.
3. **Validação esperada (Sem F5):**
   - O contador de faltas no card incrementa em tempo real.
   - O card de métrica **"Frequência Geral"** no topo recalcula sua porcentagem instantaneamente.
   - Abra o modal **"Limites e Faltas"** (clicando no card de LIMITE DE FALTAS):
     - A disciplina exibirá a margem atualizada ($16 - 3 = 13$ restantes).
     - Se as faltas ultrapassarem o limiar (margem $\le 3$ ou $\ge 75\%$), a badge muda para **"Em Risco"** e o Avatar reativo altera sua expressão emocional para Preocupado/Crítico.

### Cenário 3: Configuração de Critérios e Cálculo de Média
1. Na seção lateral da **Calculadora**, selecione a disciplina desejada.
2. Clique em **"Editar Critérios"**.
3. Escolha o preset **"Média Ponderada"** ou adicione itens manualmente:
   - `P1` (Peso 40%, Nota `8,5`)
   - `P2` (Peso 40%, Nota `7,0`)
   - `Projeto` (Peso 20%, sem nota)
4. Clique em **"Salvar Critérios"**.
5. **Validação esperada (Sem F5):**
   - O toast confirma a sincronização.
   - O card da Calculadora exibe imediatamente:
     - **Média Parcial Atual:** `7,8`
     - **Meta (7,0):** *"Precisa tirar 4,0 no Projeto"*
     - **Pontos Garantidos:** `6,2 de 10,0`.

### Cenário 4: Ciclo de Entregas (Otimista)
1. No card **"PRÓXIMA ENTREGA"**, verifique a entrega mais urgente.
2. Clique no botão verde **"Concluir"**:
   - A entrega é marcada como concluída em 0ms.
   - O card atualiza instantaneamente para a próxima entrega pendente (ou "Nenhuma" caso não haja outras).
3. Abra a lista completa de eventos clicando em **"Ver todas"**:
   - Clique no ícone de lixeira para excluir uma entrega.
   - A entrega desaparece da lista imediatamente (remoção otimista).
   - O toast *"Entrega removida com sucesso."* é exibido.

---

## 🔒 3. Hardening de Banco de Dados (Instruções de Migração SQL)

O script [`backend/migrations/01_security_hardening_rls.sql`](file:///home/paulo-cesar/Documentos/academic-attendance-bot/backend/migrations/01_security_hardening_rls.sql) contém todo o DDL, constraints e políticas de segurança.

### Como aplicar no Supabase:
1. Abra o painel do seu projeto no **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Acesse a aba **SQL Editor**.
3. Copie e cole o conteúdo de `backend/migrations/01_security_hardening_rls.sql`.
4. Clique em **Run**.
5. Por padrão, o script ativa o **Modo Desenvolvimento** com RLS ativado e políticas permissivas para o frontend local.
6. Quando o módulo de autenticação com login (`auth.users`) for promovido para produção, basta descomentar a seção **`OPÇÃO B: MODO PRODUÇÃO COM auth.uid()`** e executá-la para isolamento estrito por usuário.
