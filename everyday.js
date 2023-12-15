function createList() {
    var parent = document.getElementById('list');
    if (!parent) {
        return;
    }
    parent.innerHTML = '';
    var items = load();
    if (items.length === 0) {
        parent.appendChild(noTasksElement());
    }
    items.forEach(function (item) {
        var div = document.createElement('div');
        div.className = 'item' + (item.isDone ? ' faded' : '');
        var divWrapper = document.createElement('div');
        divWrapper.className = 'flex';
        div.appendChild(divWrapper);
        divWrapper.appendChild(doneButton(item));
        divWrapper.appendChild(taskBody(item));
        divWrapper.appendChild(removeButton(item));
        parent.appendChild(div);
    });
}
function doneButton(item) {
    var done = document.createElement('button');
    done.innerHTML = item.isDone ? 'undo' : 'done';
    done.className = 'primary' + (item.isDone ? ' done' : '');
    done.onclick = function () {
        toggle(item.id);
        createList();
    };
    return done;
}
function taskBody(item) {
    var text = document.createElement('span');
    text.innerHTML = item.name;
    text.className = item.isDone ? 'done' : '';
    return text;
}
function removeButton(item) {
    var remove = document.createElement('button');
    remove.className = 'remove';
    remove.innerHTML = 'remove';
    remove.onclick = function () {
        deleteItem(item.id);
        createList();
    };
    return remove;
}
function noTasksElement() {
    var div = document.createElement('div');
    div.className = 'item';
    var text = document.createElement('span');
    text.innerHTML = 'No tasks';
    div.appendChild(text);
    return div;
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
        if (event.key === 'Enter') {
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
function reset() {
    var updatedItems = load().map(function (item) {
        item.isDone = false;
        return item;
    });
    update(updatedItems);
    createList();
}
function clearAll() {
    update([]);
    createList();
}
function update(items) {
    var serializedItems = JSON.stringify(items);
    window.localStorage.setItem('tasks', serializedItems);
}
addListener();
createList();
