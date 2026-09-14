import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("cadastro", "routes/cadastro.tsx"),
  route("painel", "routes/painel._index.tsx"),
  route("painel/:id", "routes/painel.$id.tsx"),
] satisfies RouteConfig;
