import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import todoRouter from './routes/todoRoutes.ts';

process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

const app = express();

app.use(cors());
app.use(express.json());

app.use('/todos', todoRouter);

app.listen(3333, '0.0.0.0', () => {
    console.log("Servidor rodando na porta 3333");
});

// Keep process alive hack
setInterval(() => { }, 10000);

export default app;