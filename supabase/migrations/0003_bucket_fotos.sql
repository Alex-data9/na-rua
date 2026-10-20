-- Bucket privado para a foto da pessoa cadastrada (dado sensível — LGPD).
-- Sem policies em storage.objects: só o servidor (service role) lê e grava; o navegador recebe URLs assinadas
-- de curta duração. pessoa.foto_url guarda o CAMINHO do objeto no bucket (ex.: "<id da pessoa>.jpg"), não uma URL.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', false, 2097152, array['image/jpeg'])
on conflict (id) do nothing;

comment on column pessoa.foto_url is 'Caminho do objeto no bucket privado "fotos" (não é uma URL pública)';
