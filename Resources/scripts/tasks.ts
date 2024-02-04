export type TaskItem = {
    id: string,
    name: string,
    isDone: boolean,
    backlog?: boolean,
};

export class Everyday {
    toggleAutoReset() {
        const isEnabled = this.autoResetEnabled();
        window.localStorage.setItem('auto-reset', isEnabled ? 'false' : 'true');
    }

    autoResetInitialConfig() {
        const autoResetValue = this.getAutoReset();
        if (autoResetValue === null || autoResetValue === '') {
            window.localStorage.setItem('auto-reset', 'true');
        }
    }

    autoResetEnabled(): boolean {
        return this.getAutoReset() === 'true';
    }

    private getAutoReset(): string | null {
        return window.localStorage.getItem('auto-reset');
    }

    reset() {
        const updatedItems = this.load().map((item: TaskItem) => {
            item.isDone = false;
            return item;
        });
        this.update(updatedItems);
    }

    lastVisit(): Date {
        return new Date(window.localStorage.getItem('last-visit') || '');
    }

    recordVisit() {
        window.localStorage.setItem('last-visit', new Date().toISOString());
    }

    load(): TaskItem[] {
        const serializedItems = window.localStorage.getItem('tasks') || '[]';
        return JSON.parse(serializedItems).filter((item: TaskItem) => !item.backlog);
    }

    create(name: string) {
        let items = this.load();
        items.splice(0, 0, {
            id: Math.random().toString(),
            name,
            isDone: false,
        });
        this.update(items);
    }

    toggle(id: string) {
        const updatedItems = this.load().map(item => {
            if (item.id === id) {
                item.isDone = !item.isDone;
            }
            return item;
        });
        this.update(updatedItems);
    }

    deleteItem(id: string) {
        const updatedItems = this.load().filter(item => item.id !== id);
        this.update(updatedItems);
    }

    update(items: TaskItem[]) {
        const serializedItems = JSON.stringify(items);
        window.localStorage.setItem('tasks', serializedItems);
    }

    toggleLimit() {
        const limit = this.getLimit();
        if (!limit) {
            window.localStorage.setItem('tasks-limit', '5');
        } else {
            window.localStorage.removeItem('tasks-limit');
        }
    }

    getLimit(): number | null {
        const raw = window.localStorage.getItem('tasks-limit');
        if (!raw) {
            return null;
        }
        return parseInt(raw);
    }
}
