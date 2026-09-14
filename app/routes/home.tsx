import type { Route } from "./+types/home";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Na Rua" },
    {
      name: "description",
      content: "Cadastro digital e acompanhamento de pessoas em situação de rua.",
    },
  ];
}

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto p-6 text-center space-y-6">
      <h1 className="text-3xl font-semibold">🏙️ Na Rua</h1>
      <p className="text-gray-600 dark:text-gray-300">
        Ferramenta de cadastro digital e acompanhamento de pessoas em situação de rua.
      </p>
      <div className="flex justify-center gap-4">
        <Link to="/cadastro" className="px-5 py-2 rounded bg-emerald-600 text-white">
          Novo cadastro
        </Link>
        <Link to="/painel" className="px-5 py-2 rounded border">
          Painel de acompanhamento
        </Link>
      </div>
    </main>
  );
}
