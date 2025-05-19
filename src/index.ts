// src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './services/prisma';
import authRoutes from './routes/auth.routes';
import eventRoutes from './routes/events.routes';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);

app.get('/', (req, res) => {
  res.send('Senac Eventos Cultural API rodando 🚀');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

// logo após app.listen(...)
async function testDatabaseConnection() {
    try {
      const users = await prisma.user.findMany();
      console.log('Conexão com banco OK. Usuários:', users);
    } catch (err) {
      console.error('Erro ao conectar com o banco:', err);
    }
}
  testDatabaseConnection();
