import * as tasks from './tasks.js';
export class UIActions {
    constructor() {
        this.model = new tasks.Everyday();
    }
    init() {
        this.addListener();
        this.model.autoResetInitialConfig();
        this.updateAutoResetButton();
        this.refreshItemsIfNewDay();
        this.model.recordVisit();
        this.updateLimitUI();
        this.createList();
    }
    addListener() {
        const input = this.getInputElement();
        if (!input) {
            return;
        }
        input.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.add();
                input.value = '';
            }
        });
    }
    refreshItemsIfNewDay() {
        if (!this.model.autoResetEnabled()) {
            return;
        }
        const lastVisitDate = this.model.lastVisit().getDate();
        const today = new Date().getDate();
        if (lastVisitDate !== today) {
            this.reset();
            this.model.recordVisit();
        }
    }
    toggleAutoReset() {
        this.model.toggleAutoReset();
        this.updateAutoResetButton();
    }
    updateAutoResetButton() {
        const autoResetElement = document.getElementById('auto-reset');
        if (!autoResetElement) {
            return;
        }
        const existingChild = autoResetElement.firstChild;
        if (existingChild) {
            autoResetElement.removeChild(existingChild);
        }
        autoResetElement.className = this.model.autoResetEnabled() ? 'text-lime-600' : 'red';
        const textParent = document.createElement('b');
        textParent.innerText = this.model.autoResetEnabled() ? 'on' : 'off';
        autoResetElement.appendChild(textParent);
    }
    reset() {
        this.model.reset();
        this.createList();
    }
    createList() {
        const parent = document.getElementById('list');
        if (!parent) {
            return;
        }
        parent.innerHTML = '';
        const items = this.model.load();
        if (items.length === 0) {
            parent.appendChild(this.noTasksElement());
        }
        items.forEach((item) => {
            const div = this.makeTaskRow(item);
            parent.appendChild(div);
        });
        this.updateInputAvailability(items.length, this.model.getLimit());
    }
    noTasksElement() {
        const div = document.createElement('div');
        div.className = 'item';
        const text = document.createElement('span');
        text.innerHTML = 'No tasks';
        div.appendChild(text);
        return div;
    }
    makeTaskRow(item) {
        const div = document.createElement('div');
        div.className = 'bg-slate-200 dark:bg-slate-900 item' + (item.isDone ? ' faded' : '');
        const divWrapper = document.createElement('div');
        divWrapper.className = 'flex flex-row gap-3 max-lg:flex-col max-lg:items-start';
        div.appendChild(divWrapper);
        divWrapper.appendChild(this.doneButton(item));
        divWrapper.appendChild(this.taskBody(item));
        divWrapper.appendChild(this.removeButton(item));
        return div;
    }
    doneButton(item) {
        const done = document.createElement('button');
        done.innerHTML = item.isDone ? 'undo' : 'done';
        done.className = 'flex-none primary' + (item.isDone ? ' done' : '');
        done.onclick = () => {
            this.model.toggle(item.id);
            this.createList();
        };
        return done;
    }
    taskBody(item) {
        const text = document.createElement('div');
        text.innerHTML = item.name;
        text.className = 'grow body' + (item.isDone ? ' done' : '');
        return text;
    }
    removeButton(item) {
        const remove = document.createElement('button');
        remove.className = 'flex-none remove';
        remove.innerHTML = 'remove';
        remove.onclick = () => {
            this.model.deleteItem(item.id);
            this.createList();
        };
        return remove;
    }
    add() {
        const input = this.getInputElement();
        this.model.create(input.value);
        this.createList();
    }
    clearAll() {
        this.model.update([]);
        this.createList();
    }
    getInputElement() {
        return document.getElementById('task-input');
    }
    toggleLimitAction() {
        this.model.toggleLimit();
        this.updateLimitUI();
    }
    updateLimitUI() {
        var _a, _b, _c, _d;
        const btn = document.getElementById('limit-tgl');
        let limit = this.model.getLimit();
        limit = this.updateInputAvailability(this.model.load().length, limit);
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
        const input = document.getElementById('limit-input') || this.makeLimitInput(btn.parentElement);
        input.value = limit.toString();
        if (!document.getElementById('limit-off')) {
            (_d = btn.parentElement) === null || _d === void 0 ? void 0 : _d.appendChild(this.makeOffLimitButton());
        }
    }
    makeLimitInput(parent) {
        const input = document.createElement('input');
        input.id = 'limit-input';
        input.className = 'bg-lime-600 w-8 rounded px-2';
        input.onchange = (e) => {
            const newLimit = parseInt(e.target.value) || '5';
            window.localStorage.setItem('tasks-limit', newLimit.toString());
            this.updateLimitUI();
        };
        parent === null || parent === void 0 ? void 0 : parent.appendChild(input);
        return input;
    }
    makeOffLimitButton() {
        const off = document.createElement('button');
        off.className = 'text-lime-600 font-bold';
        off.innerText = 'on';
        off.onclick = (_) => { this.toggleLimitAction(); };
        return off;
    }
    updateInputAvailability(existingTasks, limit) {
        const mainInput = document.getElementById('task-input');
        if (!limit) {
            mainInput.disabled = false;
            return null;
        }
        const finalLimit = existingTasks <= limit ? limit : existingTasks;
        mainInput.disabled = existingTasks >= finalLimit;
        return finalLimit;
    }
}
