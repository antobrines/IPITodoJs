// @ts-ignore
import cross from './assets/cross.svg';
// @ts-ignore
import deleteIcon from './assets/delete.svg';
import TodoService from './js/TodoService';
import { Todo } from './interfaces/Todo';

function findOrThrow(selector: string) {
    const el = document.querySelector(selector);
    if (!el) {
        throw new Error(`No element found for selector: ${selector}`);
    }
    return el;
}

let todoService = new TodoService();

let todos: Todo[];
todoService.getTodos().then((todoList) => {
    todos = todoList;
    render();
});

const FILTER = {
    ALL: 0,
    PENDING: 1,
    COMPLETED: 2
}
let filter = FILTER.ALL;

const button = findOrThrow('button');
const input = findOrThrow('input') as HTMLInputElement;
button.addEventListener('click', addTodoItem);
input.addEventListener('keypress', event => {
    if (event.key === 'Enter') {
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
    const newTodo: Todo = {
        id: String(Math.random()),
        name: input.value,
        completed: false
    };

    todos.push(newTodo);

    input.value = '';
    input.focus();

    todoService.addTodos(newTodo).then(() => {
        todoService.getTodos().then((todoList) => {
            todos = todoList
            render();
        });
    });

}

const list = findOrThrow('.list');
const count = findOrThrow('.count');

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

function createCheckboxNode(todo: Todo) {
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
function createTodoNode(t: Todo) {
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
            : { ...item, completed: (event.target as HTMLInputElement).checked });
        // méthod PUT
        todoService.changeById(t.id, 'PUT').then(() => {
            render();
        });

    });

    deleteBtn.addEventListener('click', () => {
        todos = todos.filter(i => i.id !== t.id);
        render();
        // delete
        todoService.changeById(t.id, 'DELETE');
    });

    todoEl.appendChild(checkboxDiv);
    todoEl.appendChild(content);
    todoEl.appendChild(deleteBtn);

    return todoEl;
}

// Initialise filters
const filters = document.querySelectorAll('[name=filter');
filters.forEach(f => f.addEventListener('change', event => {
    switch ((event.target as HTMLInputElement).value) {
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

const deleteCompBtn = findOrThrow('#delete-completed');
deleteCompBtn.addEventListener('click', () => {
    todos = todos.filter(t => t.completed === false);
    // DELETE /todos/completed
    todoService.deleteTodos('completed');
    render();
});