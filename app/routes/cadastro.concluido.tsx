import { Link, useSearchParams } from "react-router";
import type { Route } from "./+types/cadastro.concluido";
import { Alerta } from "~/components/Alerta";
import { classeBotao } from "~/components/Botao";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Cadastro enviado — NaRua" }, { name: "robots", content: "noindex" }];
}

// Página pública: não mostra nenhum dado pessoal, só o código do cadastro (número sequencial, sem identificar ninguém).
export default function CadastroConcluido() {
  const [params] = useSearchParams();
  const codigo = /^\d{1,9}$/.test(params.get("codigo") ?? "") ? params.get("codigo") : null;

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-10 md:py-16">
      <p className="rotulo-tecnico">Cadastro</p>
      <h1 className="titulo-display text-4xl md:text-5xl">
        Cadastro enviado<span className="text-sinal-500">.</span>
      </h1>
      <Alerta tipo="sucesso">
        As informações foram registradas com sucesso{codigo ? <> (código <strong>{codigo}</strong>)</> : null}.
      </Alerta>
      {params.get("foto") === "falhou" && (
        <Alerta tipo="erro">O cadastro foi salvo, mas não foi possível guardar a foto. Ela não ficou registrada.</Alerta>
      )}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link to="/cadastro" className={classeBotao("primario")}>
          Fazer outro cadastro
        </Link>
        <Link to="/" className={classeBotao("secundario")}>
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
