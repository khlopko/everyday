function lastVisit() {
    return new Date(window.localStorage.getItem('last-visit') || '');
}
function recordVisit() {
    window.localStorage.setItem('last-visit', new Date().toISOString());
}
function autoResetInitialConfig() {
    var autoResetValue = window.localStorage.getItem('auto-reset');
    if (autoResetValue === null || autoResetValue === '') {
        window.localStorage.setItem('auto-reset', 'true');
    }
}
function autoResetEnabled() {
    return window.localStorage.getItem('auto-reset') === 'true';
}
function toggleAutoReset() {
    var isEnabled = autoResetEnabled();
    window.localStorage.setItem('auto-reset', isEnabled ? 'false' : 'true');
    updateAutoResetButton();
}
function refreshItemsIfNewDay() {
    if (!autoResetEnabled()) {
        return;
    }
    var lastVisitDate = lastVisit().getDate();
    var today = new Date().getDate();
    if (lastVisitDate !== today) {
        reset();
        recordVisit();
    }
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
function toggleLimit() {
    var limit = getLimit();
    if (!limit) {
        window.localStorage.setItem('tasks-limit', '5');
    }
    else {
        window.localStorage.removeItem('tasks-limit');
    }
}
function getLimit() {
    var raw = window.localStorage.getItem('tasks-limit');
    if (!raw) {
        return null;
    }
    return parseInt(raw);
}
// MARK: - UI
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
        div.className = 'bg-slate-200 dark:bg-slate-900 item' + (item.isDone ? ' faded' : '');
        var divWrapper = document.createElement('div');
        divWrapper.className = 'flex flex-row gap-3 max-lg:flex-col max-lg:items-start';
        div.appendChild(divWrapper);
        divWrapper.appendChild(doneButton(item));
        divWrapper.appendChild(taskBody(item));
        divWrapper.appendChild(removeButton(item));
        parent.appendChild(div);
    });
    updateInputAvailability(items.length, getLimit());
}
function doneButton(item) {
    var done = document.createElement('button');
    done.innerHTML = item.isDone ? 'undo' : 'done';
    done.className = 'flex-none primary' + (item.isDone ? ' done' : '');
    done.onclick = function () {
        toggle(item.id);
        createList();
    };
    return done;
}
function taskBody(item) {
    var text = document.createElement('div');
    text.innerHTML = item.name;
    text.className = 'grow body' + (item.isDone ? ' done' : '');
    return text;
}
function removeButton(item) {
    var remove = document.createElement('button');
    remove.className = 'flex-none remove';
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
function updateAutoResetButton() {
    var autoResetElement = document.getElementById('auto-reset');
    if (!autoResetElement) {
        return;
    }
    var existingChild = autoResetElement.firstChild;
    if (existingChild) {
        autoResetElement.removeChild(existingChild);
    }
    autoResetElement.className = autoResetEnabled() ? 'text-lime-600' : 'red';
    var textParent = document.createElement('b');
    textParent.innerText = autoResetEnabled() ? 'on' : 'off';
    autoResetElement.appendChild(textParent);
}
function getInputElement() {
    return document.getElementById('task-input');
}
// MARK: - Actions
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
function toggleLimitAction() {
    toggleLimit();
    updateLimitUI();
}
function updateLimitUI() {
    var _a, _b, _c, _d;
    var btn = document.getElementById('limit-tgl');
    var limit = getLimit();
    limit = updateInputAvailability(load().length, limit);
    if (!limit) {
        btn.innerText = 'off';
        btn.className = '';
        while ((((_a = btn.parentElement) === null || _a === void 0 ? void 0 : _a.childElementCount) || 0) > 2) {
            (_c = (_b = btn.parentElement) === null || _b === void 0 ? void 0 : _b.lastChild) === null || _c === void 0 ? void 0 : _c.remove();
        }
        return;
    }
    btn.innerText = '';
    btn.className = 'text-white';
    var input = document.getElementById('limit-input') || makeLimitInput(btn.parentElement);
    input.value = limit.toString();
    if (!document.getElementById('limit-off')) {
        (_d = btn.parentElement) === null || _d === void 0 ? void 0 : _d.appendChild(makeOffLimitButton());
    }
}
function makeLimitInput(parent) {
    var input = document.createElement('input');
    input.id = 'limit-input';
    input.className = 'bg-lime-600 w-8 rounded px-2';
    input.onchange = function (e) {
        var newLimit = parseInt(e.target.value) || '5';
        window.localStorage.setItem('tasks-limit', newLimit.toString());
        updateLimitUI();
    };
    parent === null || parent === void 0 ? void 0 : parent.appendChild(input);
    return input;
}
function makeOffLimitButton() {
    var off = document.createElement('button');
    off.className = 'text-lime-600 font-bold';
    off.innerText = 'on';
    off.onclick = function (_) { toggleLimitAction(); };
    return off;
}
function updateInputAvailability(existingTasks, limit) {
    var mainInput = document.getElementById('task-input');
    if (!limit) {
        mainInput.disabled = false;
        return null;
    }
    var finalLimit = existingTasks <= limit ? limit : existingTasks;
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
