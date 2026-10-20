// Cria (ou promove) um administrador do NaRua no Supabase Auth.
//   npm run criar-admin -- email@exemplo.com
// A senha é digitada no terminal, sem aparecer na tela, e nunca é gravada em arquivo. Usa SUPABASE_URL e
// SUPABASE_SERVICE_ROLE_KEY do arquivo .env. Administrador = usuário com app_metadata.role = "admin".
import readline from "node:readline";
import { createClient } from "@supabase/supabase-js";

try {
  process.loadEnvFile(".env");
} catch {
  /* sem .env: usa as variáveis do ambiente */
}

const SENHA_MINIMA = 10;
const email = (process.argv[2] ?? "").trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Uso: npm run criar-admin -- email@exemplo.com");
  process.exit(1);
}
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.");
  process.exit(1);
}

function perguntarSenha(pergunta) {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY) {
      // sem terminal interativo (ex.: automação): lê a primeira linha da entrada
      const rl = readline.createInterface({ input: process.stdin });
      rl.once("line", (linha) => {
        rl.close();
        resolve(linha);
      });
      return;
    }
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const escrever = rl._writeToOutput.bind(rl);
    rl._writeToOutput = (texto) => (texto.includes(pergunta) ? escrever(texto) : undefined); // oculta o que é digitado
    rl.question(pergunta, (resposta) => {
      rl.close();
      process.stdout.write("\n");
      resolve(resposta);
    });
  });
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const senha = await perguntarSenha(`Senha para ${email} (mín. ${SENHA_MINIMA} caracteres): `);
if (senha.length < SENHA_MINIMA) {
  console.error(`A senha precisa ter ao menos ${SENHA_MINIMA} caracteres.`);
  process.exit(1);
}
if (process.stdin.isTTY && (await perguntarSenha("Repita a senha: ")) !== senha) {
  console.error("As senhas não conferem.");
  process.exit(1);
}

const { error } = await supabase.auth.admin.createUser({
  email,
  password: senha,
  email_confirm: true,
  app_metadata: { role: "admin" },
});

if (!error) {
  console.log(`Administrador criado: ${email}`);
} else if (/already|registered|exists/i.test(error.message)) {
  // já existe: promove a administrador e atualiza a senha
  const { data } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const usuario = data?.users.find((u) => u.email?.toLowerCase() === email);
  if (!usuario) {
    console.error("Usuário já existe, mas não foi possível localizá-lo.");
    process.exit(1);
  }
  const { error: erroAtualizar } = await supabase.auth.admin.updateUserById(usuario.id, {
    password: senha,
    app_metadata: { ...usuario.app_metadata, role: "admin" },
  });
  if (erroAtualizar) {
    console.error(`Falha ao atualizar: ${erroAtualizar.message}`);
    process.exit(1);
  }
  console.log(`Usuário existente promovido a administrador e senha atualizada: ${email}`);
} else {
  console.error(`Falha ao criar: ${error.message}`);
  process.exit(1);
}
