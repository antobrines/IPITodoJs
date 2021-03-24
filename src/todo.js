"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var cross_svg_1 = require("./assets/cross.svg");
var delete_svg_1 = require("./assets/delete.svg");
var TodoService_1 = require("./js/TodoService");
TodoService_1["default"] = new TodoService_1["default"]();
var todos;
TodoService_1["default"].getTodos().then(function (todoList) {
    todos = todoList;
    render();
});
var FILTER = {
    ALL: 0,
    PENDING: 1,
    COMPLETED: 2
};
var filter = FILTER.ALL;
var button = document.querySelector('button');
var input = document.querySelector('input');
button.addEventListener('click', addTodoItem);
input.addEventListener('keypress', function (evt) {
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
    var newTodo = {
        id: Math.random(),
        name: input.value,
        completed: false
    };
    todos.push(newTodo);
    input.value = '';
    input.focus();
    TodoService_1["default"].addTodos(newTodo).then(function () {
        TodoService_1["default"].getTodos().then(function (todoList) {
            todos = todoList;
            render();
        });
    });
}
var list = document.querySelector('.list');
var count = document.querySelector('.count');
/**
 * Render all todos to the DOM
 */
function render() {
    // Clean the list
    list.innerHTML = '';
    var filteredTodo = getFilteredTodos();
    var todoEls = filteredTodo.map(createTodoNode);
    todoEls.forEach(function (t) { return list.appendChild(t); });
    count.innerHTML = todoEls.length + " items " + (filter === FILTER.COMPLETED ? 'completed' : 'left');
}
/**
 * Returns the todo list filtered accordingly to the selected filter
 */
function getFilteredTodos() {
    if (filter === FILTER.ALL) {
        return todos;
    }
    return todos.filter(function (t) { return t.completed === (filter === FILTER.COMPLETED); });
}
function createCheckboxNode(todo) {
    var div = document.createElement('div');
    var label = document.createElement('label');
    var checkbox = document.createElement('input');
    label.htmlFor = todo.id;
    label.innerHTML = cross_svg_1["default"];
    checkbox.id = todo.id;
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    div.appendChild(checkbox);
    div.appendChild(label);
    return {
        checkboxDiv: div,
        checkbox: checkbox
    };
}
/**
 * Create an DOM node to display
 * @param {Todo} t The item to create a node for
 */
function createTodoNode(t) {
    var todoEl = document.createElement('div');
    todoEl.classList.add('todo');
    var _a = createCheckboxNode(t), checkboxDiv = _a.checkboxDiv, checkbox = _a.checkbox;
    var content = document.createElement('span');
    content.innerText = t.name;
    var deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = delete_svg_1["default"];
    deleteBtn.classList.add('btn-icon');
    checkbox.addEventListener('change', function (event) {
        todos = todos.map(function (item) { return item.id !== t.id
            ? item
            : __assign(__assign({}, item), { completed: event.target.checked }); });
        // méthod PUT
        TodoService_1["default"].changeById(t.id, 'PUT').then(function () {
            render();
        });
    });
    deleteBtn.addEventListener('click', function () {
        todos = todos.filter(function (i) { return i.id !== t.id; });
        render();
        // delete
        TodoService_1["default"].changeById(t.id, 'DELETE');
    });
    todoEl.appendChild(checkboxDiv);
    todoEl.appendChild(content);
    todoEl.appendChild(deleteBtn);
    return todoEl;
}
// Initialise filters
var filters = document.querySelectorAll('[name=filter');
filters.forEach(function (f) { return f.addEventListener('change', function (evt) {
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
}); });
var deleteCompBtn = document.querySelector('#delete-completed');
deleteCompBtn.addEventListener('click', function () {
    todos = todos.filter(function (t) { return t.completed === false; });
    // DELETE /todos/completed
    TodoService_1["default"].deleteTodos('completed');
    render();
});
