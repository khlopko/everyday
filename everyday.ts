type TaskItem = {
    id: string,
    name: string,
    isDone: boolean,
};

function lastVisit(): Date {
    return new Date(window.localStorage.getItem('last-visit') || '');
}

function recordVisit() {
    window.localStorage.setItem('last-visit', new Date().toISOString());
}

function autoResetInitialConfig() {
    const autoResetValue = window.localStorage.getItem('auto-reset');
    if (autoResetValue === null || autoResetValue === '') {
        window.localStorage.setItem('auto-reset', 'true');
    }
}

function autoResetEnabled(): boolean {
    return window.localStorage.getItem('auto-reset') === 'true';
}

function toggleAutoReset() {
    const isEnabled = autoResetEnabled();
    window.localStorage.setItem('auto-reset', isEnabled ? 'false' : 'true');
    updateAutoResetButton();
}

function refreshItemsIfNewDay() {
    if (!autoResetEnabled()) {
        return;
    }
    const lastVisitDate = lastVisit().getDate();
    const today = new Date().getDate();
    if (lastVisitDate !== today) {
        reset();
        recordVisit();
    }
}

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

function clearAll() {
    update([]);
    createList();
}

function update(items: TaskItem[]) {
    const serializedItems = JSON.stringify(items);
    window.localStorage.setItem('tasks', serializedItems);
}

function toggleLimit() {
    const limit = getLimit();
    if (!limit) {
        window.localStorage.setItem('tasks-limit', '5');
    } else {
        window.localStorage.removeItem('tasks-limit');
    }
}

function getLimit(): number | null {
    const raw = window.localStorage.getItem('tasks-limit');
    if (!raw) {
        return null;
    }
    return parseInt(raw);
}

// MARK: - UI

function createList() {
    const parent = document.getElementById('list');
    if (!parent) {
        return;
    }
    parent.innerHTML = '';
    const items = load();
    if (items.length === 0) {
        parent.appendChild(noTasksElement());
    }
    items.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'bg-slate-200 dark:bg-slate-900 item' + (item.isDone ? ' faded' : '');
        const divWrapper = document.createElement('div');
        divWrapper.className = 'flex flex-row gap-3 max-lg:flex-col max-lg:items-start';
        div.appendChild(divWrapper);
        divWrapper.appendChild(doneButton(item));
        divWrapper.appendChild(taskBody(item));
        divWrapper.appendChild(removeButton(item));
        parent.appendChild(div);
    });
    updateInputAvailability(items.length, getLimit());
}

function doneButton(item: TaskItem): HTMLElement {
    const done = document.createElement('button');
    done.innerHTML = item.isDone ? 'undo' : 'done';
    done.className = 'flex-none primary' + (item.isDone ? ' done' : '');
    done.onclick = () => {
        toggle(item.id);
        createList();
    };
    return done;
}

function taskBody(item: TaskItem): HTMLElement {
    const text = document.createElement('div');
    text.innerHTML = item.name;
    text.className = 'grow body' + (item.isDone ? ' done' : '');
    return text;
}

function removeButton(item: TaskItem): HTMLElement {
    const remove = document.createElement('button');
    remove.className = 'flex-none remove';
    remove.innerHTML = 'remove';
    remove.onclick = () => {
        deleteItem(item.id);
        createList();
    };
    return remove;
}

function noTasksElement(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'item';
    const text = document.createElement('span');
    text.innerHTML = 'No tasks';
    div.appendChild(text);
    return div;
}

function updateAutoResetButton() {
    const autoResetElement = document.getElementById('auto-reset');
    if (!autoResetElement) {
        return;
    }
    const existingChild = autoResetElement.firstChild;
    if (existingChild) {
        autoResetElement.removeChild(existingChild);
    }
    autoResetElement.className = autoResetEnabled() ? 'text-lime-600' : 'red';
    const textParent = document.createElement('b');
    textParent.innerText = autoResetEnabled() ? 'on' : 'off';
    autoResetElement.appendChild(textParent);
}

function getInputElement() {
    return document.getElementById('task-input') as HTMLInputElement;
}

// MARK: - Actions

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
        if (event.key === 'Enter') {
            event.preventDefault();
            add();
            input.value = '';
        }
    });
}

function toggleLimitAction() {
    toggleLimit();
    updateLimitUI();
}

function updateLimitUI() {
    const btn = document.getElementById('limit-tgl') as HTMLButtonElement;
    let limit = getLimit();
    limit = updateInputAvailability(load().length, limit);
    if (limit) {
        btn.innerText = '';
        btn.className = 'text-white';
        let input = document.getElementById('limit-input') as HTMLInputElement | null;
        if (!input) {
            input = document.createElement('input') as HTMLInputElement;
            input.id = 'limit-input';
            input.className = 'bg-lime-600 w-8 rounded px-2';
            input.onchange = (e: Event) => {
                const newLimit = parseInt(e.target.value) || '5';
                window.localStorage.setItem('tasks-limit', newLimit.toString());
                updateLimitUI();
            };
        }
        input.value = limit.toString();
        btn.parentElement?.appendChild(input);
        if (!document.getElementById('limit-off')) {
            const off = document.createElement('button') as HTMLButtonElement;
            off.className = 'text-lime-600 font-bold';
            off.innerText = 'on';
            off.onclick = (_: Event) => { toggleLimitAction(); };
            btn.parentElement?.appendChild(off);
        }
    } else {
        btn.innerText = 'off';
        btn.className = '';
        while ((btn.parentElement?.childElementCount || 0) > 2) {
            btn.parentElement?.lastChild?.remove();
        }
    }
}

function updateInputAvailability(existingTasks: number, limit: number | null): number | null {
    if (!limit) {
        return null;
    }
    const finalLimit = existingTasks <= limit ? limit : existingTasks;
    const mainInput = document.getElementById('task-input') as HTMLInputElement;
    mainInput.disabled = existingTasks >= finalLimit;
    return finalLimit;
}

function onLoad() {
    autoResetInitialConfig();
    updateAutoResetButton();
    refreshItemsIfNewDay();
    recordVisit();
    updateLimitUI();
}

addListener();
onLoad();
createList();

