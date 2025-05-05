
# 🎭 Senac Eventos Cultural – Backend

Este é o backend da aplicação **Senac Eventos Cultural**, um sistema web para cadastro e gerenciamento de eventos culturais.

---

## 📚 O que é este projeto?

Plataforma com dois tipos de usuários:

- **Organizador**: pode cadastrar eventos (com nome, descrição, localidade, banner e valor).
- **Participante**: pode visualizar eventos e se inscrever.
- Os organizadores podem ver a lista de inscritos e gerenciar seus eventos.

---

## 🚀 Tecnologias utilizadas

- **Node.js + Express**
- **Prisma ORM**
- **PostgreSQL (via Railway)**
- **JWT + bcrypt**
- **TypeScript**

---

## 🗂 Estrutura de Pastas

Abaixo está a estrutura principal do projeto e para que serve cada pasta/arquivo:

```
senac-eventos-cultural-backend/
├── src/
│   ├── controllers/        # Onde ficam as regras de negócio (cadastro, login, etc.)
│   ├── routes/             # Onde definimos os caminhos da API (ex: /auth/login)
│   ├── middlewares/        # Códigos que rodam antes de chegar na rota (como proteger com token)
│   ├── services/           # Serviços reutilizáveis, como conexão com o banco
│   └── index.ts            # Arquivo principal que inicia o servidor
├── prisma/
│   └── schema.prisma       # Arquivo que define o modelo do banco de dados
├── .env.example            # Modelo de variáveis de ambiente (como a URL do banco)
├── package.json            # Lista de pacotes usados no projeto
├── tsconfig.json           # Configurações do TypeScript
└── README.md               # Este arquivo que você está lendo agora
```

Essa organização ajuda a manter o código limpo, dividido por responsabilidades. Mesmo que você não entenda tudo no começo, com o tempo vai perceber como facilita trabalhar em equipe e manter o código saudável.


## 🪂 Como rodar este projeto localmente?

### 1. 🍴 Faça o fork do repositório

1. Clique no botão **Fork** no canto superior direito.
2. Crie uma cópia no seu GitHub pessoal.

### 2. 📥 Clone o repositório

No terminal:

```bash
git clone https://github.com/seu-usuario/senac-eventos-cultural-backend.git
cd senac-eventos-cultural-backend
```

### 3. 📦 Instale as dependências

```bash
npm install
```

---

## 🛠️ Configurando o banco de dados (Railway)

### 1. Acesse [https://railway.app](https://railway.app)
- Crie sua conta gratuitamente (pode usar GitHub).

### 2. Crie um novo projeto:
- Clique em **"New Project"** > **"Provision PostgreSQL"**
- Aguarde a criação do banco.

### 3. Pegue a string de conexão:
- Vá em **"Connect"** > **"PostgreSQL"**
- Copie o valor da variável chamada `DATABASE_URL`

---

## 🔐 Configurando variáveis de ambiente

### 1. Veja o arquivo `.env.example`:

```env
DATABASE_URL= # string do seu banco do Railway aqui
JWT_SECRET=sua_chave_super_secreta
```

### 2. Crie um novo arquivo `.env` na raiz do projeto (copie o exemplo):

```bash
cp .env.example .env
```

Cole a string que você copiou do Railway no campo `DATABASE_URL`.

Exemplo:

```env
DATABASE_URL=postgresql://usuario:senha@host:porta/db
JWT_SECRET=senac123
```

---

## 🧬 Rodando as migrações do banco

```bash
npx prisma migrate dev --name init

npx prisma generate
```

---

## ▶️ Iniciando o servidor

```bash
npm run dev
```

A API ficará disponível em:

```
http://localhost:3333/
```

---

## ✅ Rotas disponíveis até agora

- `GET /` → Rota teste da API

---

## 🧑‍💻 Próximos passos para desenvolvimento

- CRUD de eventos (organizador)
- Inscrição em eventos (participante)
- Visualização e gerenciamento de inscritos
- Upload de banners com Cloudinary
- Integração com pagamento (futuramente)

---

## 💬 Dúvidas?

Fale com seu professor ou envie uma *issue* neste repositório.

---
