import express from 'express';
import cors from 'cors';
import todoRouter from './routes/todoRoutes.ts';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/todos', todoRouter);

app.listen(3333, '0.0.0.0', () => {
    console.log("Servidor rodando em http://192.168.5.13:3333");
});

export default app;