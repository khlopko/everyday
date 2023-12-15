function createList() {
    const parent = document.getElementById('list')
    if (!parent) {
        return;
    }
    parent.innerHTML = '';
    const items = load();

    if (items.length === 0) {
        const div = document.createElement('div');
        const text = document.createElement('span');
        text.innerHTML = 'No tasks';
        div.appendChild(text);
        parent.appendChild(div);
        return;
    }

    items.forEach((item) => {
        const div = document.createElement('div');
        parent.appendChild(div);
        const done = document.createElement('button');
        done.innerHTML = item.isDone ? 'undo' : 'done';
        done.className = 'primary' + (item.isDone ? ' done' : '');
        done.onclick = () => {
            toggle(item.id);
            createList();
        };
        div.appendChild(done);
        const text = document.createElement('span');
        text.innerHTML = item.name;
        text.className = item.isDone ? 'done' : '';
        div.appendChild(text);
        const remove = document.createElement('button');
        remove.className = 'remove';
        remove.innerHTML = 'remove';
        remove.onclick = () => {
            deleteItem(item.id);
            createList();
        };
        div.appendChild(remove);
    });
}

function add() {
    const input = getInputElement();
    create(input.value);
    createList();
}

function addListener() {
    const input = getInputElement();
    if (!input) {
        return;
    }
    input.addEventListener('keyup', function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            add();
            input.value = '';
        }
    });
}

function getInputElement() {
    return document.getElementById('task-input') as HTMLInputElement;
}

type TaskItem = {
    id: string,
    name: string,
    isDone: boolean,
};

function load(): TaskItem[] {
    const serializedItems = window.localStorage.getItem('tasks') || '[]';
    return JSON.parse(serializedItems);
}

function create(name: string) {
    let items = load();
    items.splice(0, 0, {
        id: Math.random().toString(),
        name,
        isDone: false,
    });
    update(items);
}

function toggle(id: string) {
    const updatedItems = load().map(item => {
        if (item.id === id) {
            item.isDone = !item.isDone;
        }
        return item;
    });
    console.log(updatedItems);
    update(updatedItems);
}

function deleteItem(id: string) {
    const updatedItems = load().filter(item => item.id !== id);
    update(updatedItems);
}

function reset() {
    const updatedItems = load().map(item => {
        item.isDone = false;
        return item;
    });
    update(updatedItems);
    createList();
}

function update(items: TaskItem[]) {
    const serializedItems = JSON.stringify(items);
    window.localStorage.setItem('tasks', serializedItems);
}

addListener();
createList();
