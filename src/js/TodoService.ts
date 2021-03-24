import { Todo } from '../interfaces/Todo';
import { TodoDTO } from '../interfaces/TodoDTO';
const ADRESSE_SERVER = "https://todo-g4.cleverapps.io/todos";
export default class TodoService {
	constructor() {

	}
	async addTodos(todo: Todo) {
		const body = JSON.stringify({
			state: 'PENDING',
			name: todo.name
		});

		const res = await fetch(ADRESSE_SERVER, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body
		});
		todo = await res.json();
		return todo;
	}


	async getTodos() {
		const res = await fetch(ADRESSE_SERVER, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		let todos = await res.json();
		todos = todos.map((item: TodoDTO) => {
			var todo = {
				'id': item._id,
				'completed': item.state == 'PENDING' ? false : true,
				'name': item.name
			}
			return todo;
		});
		return todos;
	}


	/* 
	* Delete all or completed todos to the database
	*/
	async deleteTodos(type: string) {
		await fetch(ADRESSE_SERVER + `/${type}`, {
			method: 'DELETE',
			headers: {
				'Content-type': 'application/json'
			}
		});
	}


	/* 
	* Change todos by id to the database delete or put
	*/
	async changeById(id: string, type: string) {
		const res = await fetch(ADRESSE_SERVER + `/${id}`, {
			method: type,
			headers: {
				'Content-Type': 'application/json'
			}
		});
		return res;
	}
}