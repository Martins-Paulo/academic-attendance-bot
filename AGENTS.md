Aqui está o escopo completo e detalhado do projeto **UniGag**, estruturado em Markdown com todas as diretrizes de engenharia, arquitetura, regras de negócio, integração via WhatsApp e o painel Web.

---

# 🚀 Escopo de Projeto & Especificação Técnica — UniGag

O **UniGag** é um gestor acadêmico completo voltado para estudantes universitários. A plataforma combina um **Dashboard Web interativo** para controle visual de disciplinas, notas e faltas com uma **Integração Omnichannel via WhatsApp**, utilizando Agentes de IA para validação de frequência por mensagens de texto e atendimento a dúvidas.

---

## 🛠️ Stack Tecnológica

| Camada / Módulo | Tecnologia / Ferramenta | Detalhes & Uso |
| --- | --- | --- |
| **Framework Web** | Next.js 16 (App Router) | Renderização híbrida (SSR/CSR), rotas dinâmicas e Turbopack. |
| **Linguagem Principal** | TypeScript / React | Tipagem estática rigorosa para modelos acadêmicos e componentes. |
| **Backend & Banco** | Supabase (PostgreSQL) | Banco de dados relacional, autenticação, Row Level Security (RLS) e Realtime. |
| **Estilização** | CSS Modules / Tailwind CSS | Temas reativos (*Light*, *Gag Mode*, *PSA*, *Pride*) e suporte a acessibilidade. |
| **Biblioteca de Ícones** | Lucide React | Ícones minimalistas para navegação e indicadores visuais. |
| **Automação WhatsApp** | Evolution API / Baileys | Gateway de integração para envio/recebimento de mensagens HTTP/Webhooks. |
| **Orquestração de IA** | LangChain / Vercel AI SDK | Gerenciamento de memória, busca contextual e chamadas de ferramentas. |
| **Modelo de Linguagem** | Google Gemini 1.5 Flash / Pro | Agente conversacional para interpretação de mensagens do WhatsApp e RAG. |

---

## 🏗️ Arquitetura Atual do Sistema

```
                         +-----------------------------------+
                         |      Usuário final (WhatsApp)     |
                         +-----------------+-----------------+
                                           |
                                           v
                         +-----------------+-----------------+
                         |    Evolution API (WhatsApp)       |
                         +-----------------+-----------------+
                                           |
                                      (Webhooks)
                                           |
                                           v
+-----------------------------------------------------------------------------------+
| Node.js / Next.js Serverless Routes (/api/whatsapp/webhook)                       |
|                                                                                   |
|  +----------------------------+             +----------------------------------+  |
|  |   Agente IA (Gemini)       |             |  Engine de Frequência & Registro |  |
|  | - Atendimento a dúvidas    |             | - Mapeamento de intenção         |  |
|  | - Consulta de notas/faltas |             | - Lançamento automático no banco |  |
|  +--------------+-------------+             +-----------------+----------------+  |
+-----------------|---------------------------------------------|-------------------+
                  |                                             |
                  +---------------------+-----------------------+
                                        |
                                        v
                         +--------------+--------------------+
                         |   Supabase PostgreSQL Database    |
                         |  (subjects, attendances, evals)   |
                         +--------------+--------------------+
                                        ^
                                        | (Sincronização / Client)
                                        |
                         +--------------+--------------------+
                         |   Painel Web (UniGag Next.js App) |
                         |  - Dashboard e Calculadoras       |
                         |  - Avatares Reativos              |
                         |  - Gerenciamento de Entregas      |
                         +-----------------------------------+

```

---

## 📱 Módulo 1: WhatsApp Bot & Agente de IA

### 1. Validação e Registro Automático de Presença

* **Reconhecimento de Intenção:** O bot processa mensagens como *"Tô na aula de Banco de Dados"*, *"Faltei Estruturas hoje"* ou *"Lança presença pra mim"*.
* **Mapeamento de Horário:** Confere o dia da semana e o horário atual para associar automaticamente a presença à disciplina correta da grade do aluno.
* **Confirmação e Tolerância:** Solicita confirmação caso haja ambiguidade em dias com mais de uma aula cadastrada.
* **Notificação Proativa:** Envia lembretes diários nos horários de aula: *"Você esteve presente em Inteligência Artificial hoje?"* com botões de resposta rápida (`Sim`, `Não`, `Aula Cancelada`).

### 2. Agente de IA Conversacional (Atendimento ao Aluno)

* **Suporte do App (FAQ):** Responde dúvidas sobre o funcionamento do UniGag (*"Como funciona o cálculo de média?"*, *"Onde configuro meu limite de faltas?"*).
* **Consultas Acadêmicas por Texto:**
* *"Quantas faltas ainda posso ter em Cálculo 2?"*
* *"Quanto preciso tirar na P3 para passar em Banco de Dados?"*
* *"Qual minha próxima entrega da semana?"*


* **Memória de Contexto:** Guarda o histórico da conversa para manter o fluxo sem exigir que o estudante repita o nome da disciplina.

---

## 💻 Módulo 2: Aplicação Web (Dashboard do Estudante)

### 1. Visão Geral (Dashboard)

* **Métricas Principais (Top Cards):**
* **Frequência Geral:** Porcentagem consolidada de presenças com filtro por matéria.
* **Limite de Faltas:** Alerta em tempo real de matérias em estado crítico (margem $\le 3$ faltas).
* **Média do Semestre / No Momento:** Alternância entre a média ponderada geral do semestre e a média em tempo real de uma disciplina selecionada.
* **Próxima Entrega:** Card interativo com a entrega/prova mais urgente e botão de conclusão rápida.


* **Avatares Expressivos Reativos:** Personagens animados por disciplina que alteram sua expressão facial (Confiante, Feliz, Preocupado, Crítico) com base na saúde da frequência do aluno.

### 2. Calculadora do Aluno (*"Quanto preciso tirar?"*)

* **Critérios Flexíveis:** Suporte a Médias Ponderadas Livres, Média Simples Aritmética e Teoria/Prática (60/40).
* **Entrada de Notas:** Aceita números decimais com vírgula ou ponto (ex: `8,5`, `7.2`), mantendo o campo limpo sem grudar zeros indesejados.
* **Projeção de Meta:** Exibe a média necessária nas avaliações restantes para atingir a nota final desejada (ex: `7,0`).

### 3. Gerenciamento de Entregas e Calendário

* **Central de Trabalhos:** Listagem de provas, seminários, artigos e projetos com status de pendente/concluído e vínculo com disciplinas.
* **Filtros e Exclusão:** Modal expandido para visualização de datas limite e exclusão de entregáveis antigos.

### 4. Acessibilidade e Personalização

* **Seletor de Temas:** Alternância instantânea entre os modos *Neutro (Claro)*, *Gag Mode (Escuro)*, *PSA* e *Pride*.
* **Escala de Texto:** Ajuste dinâmico de tipografia (`A`, `A+`, `A++`) para melhor legibilidade.

---

## 📋 Regras de Negócio Fundamentais

1. **Cálculo da Média Parcial Proporcional:**

$$\text{Média Atual} = \frac{\sum (\text{Nota} \times \text{Peso})}{\sum \text{Pesos Concluídos}}$$



Apenas avaliações com nota já lançada entram no denominador do cálculo parcial.
2. **Limite de Faltas Padrão:**
* O limite máximo de faltas permitido por disciplina é calculado por padrão em **25%** do total de horas/aulas cadastradas ($Total \times 0.25$).


3. **Persistência e Sincronização:**
* Qualquer nota, presença ou entrega atualizada via WhatsApp deve refletir instantaneamente no Dashboard Web e vice-versa.


4. **Tratamento de Decimais:**
* Todas as notas gravadas no banco PostgreSQL utilizam o formato `NUMERIC(4,2)` para garantir precisão e conversão transparente entre vírgulas e pontos.



---

## 📐 Diretrizes de Engenharia e Boas Práticas

* **Modularidade de Código:** Manter componentes React desacoplados. Modais, cards e seletores devem residir em subpastas dedicadas em `src/components/`.
* **Atualização Otimista da UI:** Operações de presença e nota devem atualizar o estado local imediatamente, exibindo toasts informativos enquanto a query do Supabase é processada em segundo plano.
* **Segurança de Dados (RLS):** Garantir que todas as tabelas do Supabase (`subjects`, `attendances`, `subject_evaluations`, `academic_events`) possuam regras de RLS restringindo o acesso apenas ao usuário autenticado (`auth.uid() = student_id`).
* **Tratamento de Erros no WhatsApp:** Em caso de falha de parsing ou instabilidade de API, o bot deve responder de forma amigável e oferecer botões/opções numéricas para o aluno selecionar o comando correto.