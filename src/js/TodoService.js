const ADRESSE_SERVER = "https://todo-g4.cleverapps.io/todos";
export default class TodoService {
	constructor() {

	}
	async addTodos(todo) {
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
		todos = todos.map((item) => {
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
	async deleteTodos(type) {
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
	async changeById(id, type) {
		const res = await fetch(ADRESSE_SERVER + `/${id}`, {
			method: type,
			headers: {
				'Content-Type': 'application/json'
			}
		});
		return res;
	}
}