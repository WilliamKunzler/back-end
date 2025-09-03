//
import express from "express";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import cors from "cors";
import { group, Looker40SDK } from "@looker/sdk";
import { NodeSession, NodeSettingsIniFile } from "@looker/sdk-node";

// Configuração do Looker SDK
// const session = new NodeSession({
//   iniFile: "./looker.ini", // coloque o caminho do seu arquivo looker.ini
//   section: "Looker", // seção dentro do ini
// });

const settings = new NodeSettingsIniFile("Looker", "./looker.ini");
const session = new NodeSession(settings);
const sdk = new Looker40SDK(session);

const app = express();

// Configura CORS
app.use(
  cors({
    origin: "https://b92d1986c24a.ngrok-free.app",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());

// // "Banco fake"
// const users = [
//   { id: 1, email: "teste@email.com", password: "123456", nome: "Isael" },
//   { id: 2, email: "outro@email.com", password: "654321", nome: "Maria" },
// ];

// Chave secreta JWT
// const SECRET = "meuSegredoSuperSeguro";

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // const user = users.find((u) => u.email === email && u.password === password);

  // if (!user) {
  //   return res.status(401).json({ message: "Credenciais inválidas" });
  // }

  // const user = users.find((u) => u.email === email && u.password === password);
  // if (!user) {
  //   return res.status(401).json({ message: "Credenciais inválidas" });
  // }

  try {
    // Parâmetros de sessão embed Looker
    // const ssoEmbedParams = {
    //   session_length: 300,
    //   force_logout_login: false,
    //   external_user_id: String(user.id),
    //   first_name: user.nome,
    //   group_ids: ["13"]
    // };

    // try {
    //   const me = await sdk.ok(sdk.me());
    //   console.log("Conseguiu autenticar no Looker como:", me.display_name);
    // } catch (err) {
    //   console.error("Falha ao autenticar no Looker:", err);
    // }

    // Gera sessão cookieless
    // const response = await sdk.acquire_embed_cookieless_session(ssoEmbedParams);


    // Gera token JWT local também (opcional, para proteger rotas próprias)
    // const token = jwt.sign({ id: user.id, email: user.email }, SECRET, {
    //   expiresIn: "1h",
    // });

    return res.json({
      status: "success",
      message: "Login bem-sucedido",
      // authentication_token: response,
      // jwt_token: token, // nosso token para rotas internas
    });
  } catch (err) {
    console.error("Erro ao gerar sessão Looker:", err);
    return res.status(500).json({ message: "Erro no servidor" });
  }
});

// Middleware para verificar JWT local
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token não fornecido" });

  jwt.verify(token, (err, user) => {
    if (err) return res.status(403).json({ message: "Token inválido" });
    req.user = user;
    next();
  });
}

// Exemplo de rota protegida
app.get("/dashboard", authenticateToken, (req, res) => {
  res.json({ message: `Bem-vindo, usuário ${req.user.email}!` });
});

// app.get("/tokens", async (req, res) => {
//   // const { email, password } = req.body;

//   // const user = users.find((u) => u.email === email && u.password === password);



//   try {

//     let response = await sdk.ok(sdk.acquire_embed_cookieless_session(
//       {
//         session_length: 300,
//         force_logout_login: false,
//         external_user_id: "101",
//         first_name: "Fulano",
//         group_ids: ['13'],
//         embed_domain: 'http://localhost:5173/dashboard'
//       }))

//     console.log("Sessão Looker gerada:", response);
//     return res.json({
//       status: "success",
//       message: "Login bem-sucedido",
//       authentication_token: response,
//     });
//   } catch (err) {
//     console.error("Erro ao gerar sessão Looker:", err);
//     return res.status(500).json({ message: "Erro no servidor" });
//   }
// })

app.get('/acquire-embed-session', async (req, res) => {
  try {
    const user = {
      external_user_id: "1",
      first_name: "Usuario",
      last_name: "Simples",
      session_length: 3600,
      force_logout_login: false,
      group_ids: ["13"]
    };

    // const teste = await sdk.ok(sdk.me());
    // console.log("Conseguiu autenticar no Looker como:", teste)


    const response = await sdk.ok(
      sdk.acquire_embed_cookieless_session(user)
    );

    // const teste = JSON.stringify({
    //   "session_reference_token": response.session_reference_token,
    //   "navigation_token": response.navigation_token,
    //   "api_token": response.api_token
    // })

    // console.log("Sessão Looker gerada:", teste);

    res.json({
      api_token: response.api_token,
      api_token_ttl: response.api_token_ttl,
      authentication_token: response.authentication_token,
      authentication_token_ttl: response.authentication_token_ttl,
      navigation_token: response.navigation_token,
      navigation_token_ttl: response.navigation_token_ttl,
      session_reference_token: response.session_reference_token,
      session_reference_token_ttl: response.session_reference_token_ttl,
    });
  } catch (err) {
    console.error('Falha ao adquirir sessão de incorporação:', err);
    res.status(400).send({ message: err.message });
  }
});

// app.put('/generate-embed-tokens', async (req, res) => {
//   try {

//     console.log("to aqui")
//     const { api_token, navigation_token } = req.body
//     const session_reference_token = req.session?.session_reference_token

//     if (!session_reference_token) {
//       return res.json({ session_reference_token_ttl: 0 }) // sessão expirada
//     }

//     const response = await sdk.ok(
//       sdk.generate_tokens_for_cookieless_session(
//         { api_token, navigation_token, session_reference_token },
//       )
//     )

//     res.json({
//       api_token: response.api_token,
//       api_token_ttl: response.api_token_ttl,
//       navigation_token: response.navigation_token,
//       navigation_token_ttl: response.navigation_token_ttl,
//       session_reference_token_ttl: response.session_reference_token_ttl,
//     })
//   } catch (err) {
//     console.error('Erro ao gerar tokens:', err.message)
//     res.status(400).send({ message: err.message })
//   }
// })


app.get('/auth', async (req, res) => {
  const user = {
    "target_url": "https://clusterdesign.cloud.looker.com/extensions/cl_ecommerce_demo_extension_v2::demo_v3/",
    "external_user_id": "1",
    "first_name": "Usuario",
    "last_name": "Simples",
    "session_length": 3600,
    "force_logout_login": false,
    "group_ids": ["13"]
  }
  let response = await sdk.ok(sdk.create_sso_embed_url(user))
  res.json({ response })
})

// Inicia servidor
app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
