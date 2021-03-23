import cross from './assets/cross.svg';
import deleteIcon from './assets/delete.svg';
// https://todo-g1.cleverapps.io/api/
// https://slides.com/mrman/deck-175ec9#/7/3
// let todos = JSON.parse(localStorage.getItem('todos')) || [];
let todos = [];
const ADRESSE_SERVER = "https://todo-g1.cleverapps.io/todos";

async function getTodos() {
    const res = await fetch(ADRESSE_SERVER, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    todos = await res.json();
    todos = todos.map((item) => {
        var todo = {
            'id': item._id,
            'completed': item.state == 'PENDING' ? false : true,
            'name': item.name
        }
        return todo;
    });
    render();
}
getTodos();

const FILTER = {
    ALL: 0,
    PENDING: 1,
    COMPLETED: 2
}
let filter = FILTER.ALL;

/**
 * Save the todo list to the bdd.
 */
async function addTodos() {
    // localStorage.setItem('todos', JSON.stringify(todos));
    // faire un post pour save tout les todos : > tableau todos 

    const body = JSON.stringify({
        state: 'PENDING',
        name: todos.slice(-1)[0].name
    });

    const res = await fetch(ADRESSE_SERVER, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body
    });
    const todo = await res.json();
    return todo;

}

/* 
* Delete all or completed todos to the database
*/

async function deleteTodos(type) {
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

async function changeById(id, type) {
    const res = await fetch(ADRESSE_SERVER + `/${id}`, {
        method: type,
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return res;
}


const button = document.querySelector('button');
const input = document.querySelector('input');

button.addEventListener('click', addTodoItem)
input.addEventListener('keypress', evt => {
    if (evt.key === 'Enter') {
        addTodoItem();
    }
});

/**
 * Add a todo with the current input value.
 */
function addTodoItem() {
    if (!input.value || input.value.length <= 0) {
        // Early exit
        return;
    }

    todos.push({
        id: Math.random(),
        name: input.value,
        completed: false
    });

    input.value = '';
    input.focus();

    addTodos();
    getTodos();
    render();
}

const list = document.querySelector('.list');
const count = document.querySelector('.count');

/**
 * Render all todos to the DOM
 */
function render() {
    // Clean the list
    list.innerHTML = '';
    const filteredTodo = getFilteredTodos();
    const todoEls = filteredTodo.map(createTodoNode);
    todoEls.forEach(t => list.appendChild(t));
    count.innerHTML = `${todoEls.length} items ${filter === FILTER.COMPLETED ? 'completed' : 'left'}`;
}

/**
 * Returns the todo list filtered accordingly to the selected filter
 */
function getFilteredTodos() {
    if (filter === FILTER.ALL) {
        return todos;
    }
    return todos.filter(t => t.completed === (filter === FILTER.COMPLETED));
}

function createCheckboxNode(todo) {
    const div = document.createElement('div');
    const label = document.createElement('label');
    const checkbox = document.createElement('input');

    label.htmlFor = todo.id;
    label.innerHTML = cross;

    checkbox.id = todo.id;
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;

    div.appendChild(checkbox);
    div.appendChild(label);

    return {
        checkboxDiv: div,
        checkbox
    }
}

/**
 * Create an DOM node to display
 * @param {Todo} t The item to create a node for
 */
function createTodoNode(t) {
    const todoEl = document.createElement('div');
    todoEl.classList.add('todo');

    const { checkboxDiv, checkbox } = createCheckboxNode(t);
    const content = document.createElement('span');
    content.innerText = t.name;

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = deleteIcon;
    deleteBtn.classList.add('btn-icon');

    checkbox.addEventListener('change', event => {
        todos = todos.map(item => item.id !== t.id
            ? item
            : { ...item, completed: event.target.checked });
        render();
        // méthod PUT
        changeById(t.id, 'PUT');
    });

    deleteBtn.addEventListener('click', () => {
        console.table(todos);
        todos = todos.filter(i => i.id !== t.id);
        console.table(todos);
        render();
        // delete
        changeById(t.id, 'DELETE');
        // saveTodos();
    });

    todoEl.appendChild(checkboxDiv);
    todoEl.appendChild(content);
    todoEl.appendChild(deleteBtn);

    return todoEl;
}

// Initialise filters
const filters = document.querySelectorAll('[name=filter');
filters.forEach(f => f.addEventListener('change', evt => {
    switch (evt.target.value) {
        case 'all':
            filter = FILTER.ALL;
            break;
        case 'completed':
            filter = FILTER.COMPLETED;
            break;
        case 'pending':
            filter = FILTER.PENDING;
            break;
        default:
            throw new Error('Filtre inconnu.');
    }
    render();
}));

const deleteCompBtn = document.querySelector('#delete-completed');
deleteCompBtn.addEventListener('click', () => {
    todos = todos.filter(t => t.completed === false);
    // DELETE /todos/completed
    deleteTodos('completed');
    // saveTodos();
    render();
});
