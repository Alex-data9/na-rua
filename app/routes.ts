import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  // Aberto a todos
  route("cadastro", "routes/cadastro.tsx"),
  route("cadastro/concluido", "routes/cadastro.concluido.tsx"),
  // Acesso de administrador
  route("login", "routes/login.tsx"),
  route("sair", "routes/sair.tsx"),
  route("painel", "routes/painel._index.tsx"),
  route("painel/:id", "routes/painel.$id.tsx"),
] satisfies RouteConfig;
