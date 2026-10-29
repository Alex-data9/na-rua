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
      <div className="flex flex-wrap items-center justify-between gap-6">
        <h1 className="titulo-display text-5xl md:text-6xl">
          Cadastro enviado<span aria-hidden="true" className="text-poste-500">.</span>
        </h1>
        {/* carimbo da caderneta (decorativo: a mesma informação está no aviso abaixo) */}
        <span
          aria-hidden="true"
          className="carimbo carimbo-animado border-placa-600 text-placa-600 dark:border-placa-500 dark:text-placa-500"
        >
          <span>NaRua</span>
          <span className="font-display text-xl tracking-[0.06em]">Cadastro concluído</span>
          {codigo && <span>Nº {codigo}</span>}
        </span>
      </div>
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
