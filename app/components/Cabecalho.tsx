import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigation } from "react-router";

// Só rotas que existem de fato. Acrescentar aqui quando houver novas páginas.
const ITENS_NAVEGACAO = [
  { to: "/", rotulo: "Início", end: true },
  { to: "/cadastro", rotulo: "Novo cadastro", end: false },
  { to: "/painel", rotulo: "Painel de acompanhamento", end: false },
] as const;

const ITEM = "flex min-h-11 items-center rounded px-3 text-sm font-medium border-b-2 transition-colors";
const ITEM_ATIVO = "border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100";
const ITEM_INATIVO = "border-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800";

function ListaNavegacao({ className }: { className: string }) {
  return (
    <ul className={className}>
      {ITENS_NAVEGACAO.map((i) => (
        <li key={i.to}>
          <NavLink to={i.to} end={i.end} className={({ isActive }) => `${ITEM} ${isActive ? ITEM_ATIVO : ITEM_INATIVO}`}>
            {i.rotulo}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

export function Cabecalho() {
  const [aberto, setAberto] = useState(false);
  const { pathname } = useLocation();
  const carregando = useNavigation().state === "loading";
  const botao = useRef<HTMLButtonElement>(null);

  useEffect(() => setAberto(false), [pathname]);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAberto(false);
        botao.current?.focus();
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aberto]);

  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-gray-900"
      >
        Ir para o conteúdo
      </a>
      <div role="status" aria-live="polite" className="h-1">
        {carregando && (
          <>
            <span className="sr-only">Carregando página…</span>
            <div className="h-1 w-full animate-pulse bg-emerald-600" />
          </>
        )}
      </div>
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2">
        <Link to="/" className="flex min-h-11 items-center gap-2 rounded" aria-label="NaRua — ir para a página inicial">
          <span aria-hidden="true" className="text-xl">🏙️</span>
          <span className="leading-tight">
            <span className="block text-lg font-semibold">NaRua</span>
            <span className="block text-xs text-gray-600 dark:text-gray-300">Cadastro e acompanhamento</span>
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden md:block">
          <ListaNavegacao className="flex gap-1" />
        </nav>

        <button
          ref={botao}
          type="button"
          className="flex min-h-11 items-center rounded border border-gray-300 px-3 text-sm font-medium md:hidden dark:border-gray-700"
          aria-expanded={aberto}
          aria-controls="menu-movel"
          onClick={() => setAberto((a) => !a)}
        >
          {aberto ? "Fechar menu" : "Menu"}
        </button>
      </div>

      {aberto && (
        <nav id="menu-movel" aria-label="Navegação principal" className="border-t border-gray-200 px-4 py-2 md:hidden dark:border-gray-800">
          <ListaNavegacao className="flex flex-col gap-1" />
        </nav>
      )}
    </header>
  );
}
