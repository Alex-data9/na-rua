-- Só o servidor do NaRua (chave de serviço, que ignora RLS) acessa pessoa e nota.
-- As políticas antigas liberavam leitura/escrita para QUALQUER usuário "authenticated" do Supabase Auth; com o login
-- de administradores isso permitiria ler os dados fora do sistema usando a API REST. RLS continua ligado e, sem
-- políticas, anon e authenticated ficam sem acesso. Quem é administrador é decidido pelo app (app_metadata.role).
drop policy if exists "authenticated_read_pessoa" on pessoa;
drop policy if exists "authenticated_write_pessoa" on pessoa;
drop policy if exists "authenticated_update_pessoa" on pessoa;
drop policy if exists "authenticated_read_nota" on nota;
drop policy if exists "authenticated_write_nota" on nota;
