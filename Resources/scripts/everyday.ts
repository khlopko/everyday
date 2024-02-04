import * as tasks from './tasks.js';


export class UIActions {
    private model: tasks.Everyday;

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

    private addListener() {
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

    private refreshItemsIfNewDay() {
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

    private updateAutoResetButton() {
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
        items.forEach((item: tasks.TaskItem) => {
            const div = this.makeTaskRow(item);
            parent.appendChild(div);
        });
        this.updateInputAvailability(items.length, this.model.getLimit());
    }

    noTasksElement(): HTMLElement {
        const div = document.createElement('div');
        div.className = 'item';
        const text = document.createElement('span');
        text.innerHTML = 'No tasks';
        div.appendChild(text);
        return div;
    }

    private makeTaskRow(item: tasks.TaskItem): HTMLElement {
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

    private doneButton(item: tasks.TaskItem): HTMLElement {
        const done = document.createElement('button');
        done.innerHTML = item.isDone ? 'undo' : 'done';
        done.className = 'flex-none primary' + (item.isDone ? ' done' : '');
        done.onclick = () => {
            this.model.toggle(item.id);
            this.createList();
        };
        return done;
    }

    private taskBody(item: tasks.TaskItem): HTMLElement {
        const text = document.createElement('div');
        text.innerHTML = item.name;
        text.className = 'grow body' + (item.isDone ? ' done' : '');
        return text;
    }

    private removeButton(item: tasks.TaskItem): HTMLElement {
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

    private getInputElement() {
        return document.getElementById('task-input') as HTMLInputElement;
    }

    toggleLimitAction() {
        this.model.toggleLimit();
        this.updateLimitUI();
    }

    private updateLimitUI() {
        const btn = document.getElementById('limit-tgl') as HTMLButtonElement;
        let limit = this.model.getLimit();
        limit = this.updateInputAvailability(this.model.load().length, limit);
        if (!limit) {
            btn.innerText = 'off';
            btn.className = '';
            while ((btn.parentElement?.childElementCount || 0) > 2) {
                btn.parentElement?.lastChild?.remove();
            }
            return;
        }
        btn.innerText = '';
        btn.className = 'text-white';
        const input = document.getElementById('limit-input') as HTMLInputElement || this.makeLimitInput(btn.parentElement);
        input.value = limit.toString();
        if (!document.getElementById('limit-off')) {
            btn.parentElement?.appendChild(this.makeOffLimitButton());
        }
    }

    private makeLimitInput(parent: HTMLElement | null): HTMLInputElement {
        const input = document.createElement('input') as HTMLInputElement;
        input.id = 'limit-input';
        input.className = 'bg-lime-600 w-8 rounded px-2';
        input.onchange = (e: Event) => {
            const newLimit = parseInt(e.target.value) || '5';
            window.localStorage.setItem('tasks-limit', newLimit.toString());
            this.updateLimitUI();
        };
        parent?.appendChild(input);
        return input;
    }

    private makeOffLimitButton(): HTMLButtonElement {
        const off = document.createElement('button') as HTMLButtonElement;
        off.className = 'text-lime-600 font-bold';
        off.innerText = 'on';
        off.onclick = (_: Event) => { this.toggleLimitAction(); };
        return off;
    }

    private updateInputAvailability(existingTasks: number, limit: number | null): number | null {
        const mainInput = document.getElementById('task-input') as HTMLInputElement;
        if (!limit) {
            mainInput.disabled = false;
            return null;
        }
        const finalLimit = existingTasks <= limit ? limit : existingTasks;
        mainInput.disabled = existingTasks >= finalLimit;
        return finalLimit;
    }
}

