# 🏙️ Na Rua

Cadastro digital e acompanhamento de pessoas em situação de rua — cadastro em
wizard (etapas + barra de progresso) e painel/dashboard para agentes de campo.

Projeto baseado no artigo acadêmico "Projeto Na Rua: A Importância do Cadastro
Digital na População em Situação de Rua" (Veiga; Nascimento, CIESA), no Guia de
Cadastramento de Pessoas em Situação de Rua (MDS/Senarc, 2015) e no Guia Inclua
Pop Rua (Ministério dos Direitos Humanos e Cidadania). Backlog, requisitos
(RF01-RF13, RNF01-RNF08) e cronograma são geridos no Notion do projeto — os
comentários no código referenciam os IDs de requisito para rastreabilidade.

## Stack

- **React Router v7** (framework mode, ex-Remix) — `app/routes`, `app/models`, `app/components`, `app/utils`
- **Supabase** (Postgres gerenciado, Auth, Storage) — ver `supabase/migrations/0001_init.sql`
- **Vercel** — deploy/hosting
- **Tailwind CSS**

## Getting Started

### Instalação

```bash
npm install
```

### Banco de dados (Supabase)

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Rode a migration em `supabase/migrations/0001_init.sql` (SQL editor do
   Supabase ou `supabase db push` com o CLI).
3. Copie `.env.example` para `.env` e preencha `SUPABASE_URL` e
   `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API).

### Desenvolvimento

```bash
npm run dev
```

Aplicação disponível em `http://localhost:5173`. Rotas principais:

- `/cadastro` — wizard de 5 etapas conforme o Formulário Suplementar 2 do MDS (RF01–RF06, RNF08)
- `/painel` — indicadores, busca e filtro por status (RF07–RF09)
- `/painel/:id` — detalhe da pessoa, histórico de anotações e atualização de status

### Formatos de dados aceitos

Validação no navegador (feedback imediato) e no servidor (decisão final) — `app/utils/validators.ts` e `app/utils/cadastro.ts`.
Documentos e telefone são gravados só com dígitos e exibidos com máscara.

| Campo | Formato |
|---|---|
| CPF (pessoa e entrevistador) | `000.000.000-00`, dígitos verificadores válidos, sem sequência repetida. O CPF do entrevistador é obrigatório |
| NIS/PIS/PASEP | `000.00000.00-0`, 11 dígitos com dígito verificador (módulo 11); opcional |
| Telefone | DDD válido + celular `(92) 99999-9999` (começa com 9) ou fixo `(92) 3333-4444` (começa com 2 a 5); aceita `+55` |
| Nome completo | letras, espaço, apóstrofo, ponto e hífen, até 70 caracteres; um só nome apenas para quem não tem CPF nem RG |
| Data da entrevista | válida, não futura, a partir de 2000 |
| Setor censitário | 15 caracteres (código do IBGE); opcional |
| Dias por semana (2.04) | 0 a 7 por local, soma entre 1 e 7 |
| Múltipla escolha (2.06, 2.10, 2.11, 2.13) | ao menos uma opção; "não sabe", "não respondeu" e "nenhum" não combinam com outras |
| Assinatura | PNG desenhado na tela; a do responsável familiar é obrigatória |

### Build de produção

```bash
npm run build
```

## Próximos passos

- Limpar os cadastros de teste antigos (nis/telefone fora do formato) e então adicionar no banco
  `check (nis ~ '^\d{11}$')` e `check (telefone ~ '^\d{10,11}$')`; remover as colunas de texto livre antigas
  (`dorme`, `tempo_rua`, `motivo`, `contato_familia`, `renda`, `documentos`) depois do deploy.
- Formulário Principal do Cadastro Único (nome, data de nascimento, escolaridade, renda etc.) e lista de
  componentes da família (Bloco 3), citada na questão 2.08.
- Autenticação (Supabase Auth) e controle de acesso por profissional (RNF03).
- Upload de foto para reconhecimento (RF01b) via Supabase Storage, com
  consentimento explícito antes de produção.
- Fluxo de solicitação de busca por familiares via ONG/órgão validador (RF10).
- Gerar diagramas de arquitetura reais (skill `vibecode-architecture`) apontando
  para este repositório, substituindo os diagramas planejados no Notion.

---

Baseado em: [Notion — Projeto Na Rua](https://app.notion.com/p/3cdceaf0578f8116adbfd2e8912ae2df)
