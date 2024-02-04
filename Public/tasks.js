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
    autoResetEnabled() {
        return this.getAutoReset() === 'true';
    }
    getAutoReset() {
        return window.localStorage.getItem('auto-reset');
    }
    reset() {
        const updatedItems = this.load().map((item) => {
            item.isDone = false;
            return item;
        });
        this.update(updatedItems);
    }
    lastVisit() {
        return new Date(window.localStorage.getItem('last-visit') || '');
    }
    recordVisit() {
        window.localStorage.setItem('last-visit', new Date().toISOString());
    }
    load() {
        const serializedItems = window.localStorage.getItem('tasks') || '[]';
        return JSON.parse(serializedItems).filter((item) => !item.backlog);
    }
    create(name) {
        let items = this.load();
        items.splice(0, 0, {
            id: Math.random().toString(),
            name,
            isDone: false,
        });
        this.update(items);
    }
    toggle(id) {
        const updatedItems = this.load().map(item => {
            if (item.id === id) {
                item.isDone = !item.isDone;
            }
            return item;
        });
        this.update(updatedItems);
    }
    deleteItem(id) {
        const updatedItems = this.load().filter(item => item.id !== id);
        this.update(updatedItems);
    }
    update(items) {
        const serializedItems = JSON.stringify(items);
        window.localStorage.setItem('tasks', serializedItems);
    }
    toggleLimit() {
        const limit = this.getLimit();
        if (!limit) {
            window.localStorage.setItem('tasks-limit', '5');
        }
        else {
            window.localStorage.removeItem('tasks-limit');
        }
    }
    getLimit() {
        const raw = window.localStorage.getItem('tasks-limit');
        if (!raw) {
            return null;
        }
        return parseInt(raw);
    }
}
