class SessionManager {
    constructor() {
        this.sessions = new Map();
    }

    getSession(userId) {
        if (!this.sessions.has(userId)) {
            this.sessions.set(userId, {
                currentMenu: 'main',
                history: [],
                operatorMode: false,
                userData: {}
            });
        }
        return this.sessions.get(userId);
    }

    setCurrentMenu(userId, menu) {
        const session = this.getSession(userId);
        session.history.push(session.currentMenu);
        session.currentMenu = menu;
    }

    goBack(userId) {
        const session = this.getSession(userId);
        if (session.history.length > 0) {
            session.currentMenu = session.history.pop();
            return session.currentMenu;
        }
        return 'main';
    }

    setOperatorMode(userId, mode) {
        const session = this.getSession(userId);
        session.operatorMode = mode;
    }

    isOperatorMode(userId) {
        const session = this.getSession(userId);
        return session.operatorMode;
    }

    clearSession(userId) {
        this.sessions.delete(userId);
    }
}

module.exports = new SessionManager();

