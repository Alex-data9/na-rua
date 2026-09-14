-- Schema inicial do projeto Na Rua
-- Fonte: página "Arquitetura do Sistema" e "Requisitos" no Notion do projeto.
-- Rastreabilidade dos campos até os requisitos (RF01, RF01a-c, RF02-RF13) fica
-- documentada no Backlog do Notion — não duplicar aqui.

create extension if not exists "pgcrypto";

create type status_acompanhamento as enum (
  'novo',
  'em_acompanhamento',
  'busca_familiar',
  'vinculado_a_servico'
);

create table pessoa (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  apelido text,
  idade int,
  cidade_nascimento text,
  estado_nascimento text,
  estado_civil text,
  nome_pais text,
  documentos text[],
  nis text,
  foto_url text,
  dorme text,
  tempo_rua text,
  motivo text[],
  contato_familia text,
  renda text[],
  moradia_anterior text,
  moradia_atual text,
  redes_apoio text,
  referencia text not null, -- RF04: equipamento de referência (CRAS/CREAS/abrigo), nunca domicílio
  agente text,
  telefone text,
  status status_acompanhamento not null default 'novo',
  campanha_pop_rua boolean not null default false, -- RF11
  consentimento_lgpd boolean not null default false, -- RNF04
  assinatura_confirmada boolean not null default false, -- RF06
  obs text,
  data_cadastro timestamptz not null default now(),
  ultima_atualizacao timestamptz not null default now()
);

create table nota (
  id uuid primary key default gen_random_uuid(),
  pessoa_id uuid not null references pessoa(id) on delete cascade,
  texto text not null,
  autor text not null,
  ts timestamptz not null default now()
);

create index nota_pessoa_id_idx on nota(pessoa_id);
create index pessoa_status_idx on pessoa(status);
create index pessoa_ultima_atualizacao_idx on pessoa(ultima_atualizacao);

-- RNF01/RNF03: acesso restrito a usuários autenticados (login único via Supabase Auth).
alter table pessoa enable row level security;
alter table nota enable row level security;

create policy "authenticated_read_pessoa" on pessoa
  for select using (auth.role() = 'authenticated');
create policy "authenticated_write_pessoa" on pessoa
  for insert with check (auth.role() = 'authenticated');
create policy "authenticated_update_pessoa" on pessoa
  for update using (auth.role() = 'authenticated');

create policy "authenticated_read_nota" on nota
  for select using (auth.role() = 'authenticated');
create policy "authenticated_write_nota" on nota
  for insert with check (auth.role() = 'authenticated');
