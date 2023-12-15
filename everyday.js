function createList() {
    var parent = document.getElementById('list');
    if (!parent) {
        return;
    }
    parent.innerHTML = '';
    var items = load();
    if (items.length === 0) {
        var div = document.createElement('div');
        var text = document.createElement('span');
        text.innerHTML = 'No tasks';
        div.appendChild(text);
        parent.appendChild(div);
        return;
    }
    items.forEach(function (item) {
        var div = document.createElement('div');
        parent.appendChild(div);
        var done = document.createElement('button');
        done.innerHTML = item.isDone ? 'undo' : 'done';
        done.className = 'primary' + (item.isDone ? ' done' : '');
        done.onclick = function () {
            toggle(item.id);
            createList();
        };
        div.appendChild(done);
        var text = document.createElement('span');
        text.innerHTML = item.name;
        text.className = item.isDone ? 'done' : '';
        div.appendChild(text);
        var remove = document.createElement('button');
        remove.className = 'remove';
        remove.innerHTML = 'remove';
        remove.onclick = function () {
            deleteItem(item.id);
            createList();
        };
        div.appendChild(remove);
    });
}
function add() {
    var input = getInputElement();
    create(input.value);
    createList();
}
function addListener() {
    var input = getInputElement();
    if (!input) {
        return;
    }
    input.addEventListener('keyup', function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            add();
            input.value = '';
        }
    });
}
function getInputElement() {
    return document.getElementById('task-input');
}
function load() {
    var serializedItems = window.localStorage.getItem('tasks') || '[]';
    return JSON.parse(serializedItems);
}
function create(name) {
    var items = load();
    items.splice(0, 0, {
        id: Math.random().toString(),
        name: name,
        isDone: false,
    });
    update(items);
}
function toggle(id) {
    var updatedItems = load().map(function (item) {
        if (item.id === id) {
            item.isDone = !item.isDone;
        }
        return item;
    });
    console.log(updatedItems);
    update(updatedItems);
}
function deleteItem(id) {
    var updatedItems = load().filter(function (item) { return item.id !== id; });
    update(updatedItems);
}
function update(items) {
    var serializedItems = JSON.stringify(items);
    window.localStorage.setItem('tasks', serializedItems);
}
addListener();
createList();
