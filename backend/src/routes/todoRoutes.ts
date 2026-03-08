import  express  from 'express';
import {getTodos, createTodo, deleteTodo, updateTodo} from '../controllers/todoController.ts';
import { authMiddleware } from '../middlewares/authMiddleware.ts';

const todoRouter = express.Router();

todoRouter.use((req, res, next) => {
    authMiddleware(req, res, next);
})

todoRouter.get('/', getTodos);

todoRouter.post('/', createTodo);

todoRouter.delete('/:id', deleteTodo);

todoRouter.patch('/:id', updateTodo);

export default todoRouter;