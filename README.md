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

- `/cadastro` — wizard de cadastro (RF01–RF06, RNF08)
- `/painel` — indicadores, busca e filtro por status (RF07–RF09)
- `/painel/:id` — detalhe da pessoa, histórico de anotações e atualização de status

### Build de produção

```bash
npm run build
```

## Próximos passos

- Autenticação (Supabase Auth) e controle de acesso por profissional (RNF03).
- Upload de foto para reconhecimento (RF01b) via Supabase Storage, com
  consentimento explícito antes de produção.
- Fluxo de solicitação de busca por familiares via ONG/órgão validador (RF10).
- Gerar diagramas de arquitetura reais (skill `vibecode-architecture`) apontando
  para este repositório, substituindo os diagramas planejados no Notion.

---

Baseado em: [Notion — Projeto Na Rua](https://app.notion.com/p/3cdceaf0578f8116adbfd2e8912ae2df)
