import  express  from 'express';
import {getTodos, createTodo, deleteTodo, updateTodo} from '../controllers/todoController.ts';

const todoRouter = express.Router();

todoRouter.get('/', getTodos);

todoRouter.post('/', createTodo);

todoRouter.delete('/:id', deleteTodo);

todoRouter.patch('/:id', updateTodo);

export default todoRouter;