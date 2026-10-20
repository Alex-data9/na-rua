import { redirect } from "react-router";
import type { Route } from "./+types/sair";
import { sairDaSessao } from "~/utils/sessao.server";

// Só POST (botão "Sair" do cabeçalho): um link GET poderia deslogar alguém por engano (ex.: imagem em outra página).
export async function loader() {
  return redirect("/");
}

export async function action({ request }: Route.ActionArgs) {
  return redirect("/", { headers: { "Set-Cookie": await sairDaSessao(request) } });
}
