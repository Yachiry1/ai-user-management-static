(function attachApp() {
    const state = {
        cocktails: [],
        currentRoute: 'dashboard',
        stats: null,
        users: [],
    };

    const select = (selector, root = document) => root.querySelector(selector);
    const selectAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));
    const api = () => window.MixologyApi;

    const clear = (element) => {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    };

    const createElement = (tagName, className, text) => {
        const element = document.createElement(tagName);

        if (className) {
            element.className = className;
        }

        if (text) {
            element.textContent = text;
        }

        return element;
    };

    const setStatus = (message, type = 'success') => {
        const region = select('#status-region');

        region.hidden = !message;
        region.className = `status-region alert alert-${type}`;
        region.textContent = message || '';
    };

    const setBusy = (isBusy) => {
        selectAll('button').forEach((button) => {
            button.toggleAttribute('disabled', isBusy);
        });
    };

    const getItems = (payload) => payload.items || [];

    const renderStatCard = (label, value) => {
        const card = createElement('article', 'stat-card');
        const heading = createElement('h3', '', label);
        const text = createElement('p', '', String(value));

        card.append(heading, text);

        return card;
    };

    const renderMetrics = () => {
        const dashboardMetrics = select('#dashboard-metrics');

        clear(dashboardMetrics);
        dashboardMetrics.append(
            renderStatCard('Users', state.users.length),
            renderStatCard('Recipes', state.cocktails.length),
            renderStatCard('Embedding coverage', state.stats.embeddingCoverage),
        );
    };

    const renderUserCard = (user) => {
        const card = createElement('article', 'user-card');
        const title = createElement('h3', '', user.username);
        const role = createElement('span', 'role-badge', user.role);
        const roleLine = createElement('p');
        const email = createElement('p', '', user.email);
        const status = createElement('p', '', `Status: ${user.status}`);

        roleLine.append(role);
        card.append(title, roleLine, email, status);

        return card;
    };

    const renderUsers = () => {
        const tableBody = select('#users-table-body');
        const cardList = select('#users-card-list');
        const dashboardUsers = select('#dashboard-users');
        const rows = document.createDocumentFragment();

        clear(tableBody);
        clear(cardList);
        clear(dashboardUsers);

        state.users.forEach((user) => {
            const row = document.createElement('tr');

            [user.username, user.email, user.role, user.status].forEach((value) => {
                const cell = document.createElement('td');

                cell.textContent = value;
                row.append(cell);
            });

            rows.append(row);
            cardList.append(renderUserCard(user));
        });

        tableBody.append(rows);
        state.users.slice(0, 2).forEach((user) => dashboardUsers.append(renderUserCard(user)));
    };

    const renderCocktailCard = (cocktail) => {
        const card = createElement('article', 'cocktail-card');
        const image = document.createElement('img');
        const body = document.createElement('article');
        const title = createElement('h3', '', cocktail.name);
        const description = createElement('p', '', cocktail.description);
        const ingredients = createElement('p', '', cocktail.ingredients.join(', '));

        image.src = cocktail.image;
        image.alt = cocktail.name;
        body.append(title, description, ingredients);
        card.append(image, body);

        return card;
    };

    const renderCocktails = () => {
        const list = select('#cocktail-list');
        const dashboardCocktails = select('#dashboard-cocktails');

        clear(list);
        clear(dashboardCocktails);
        state.cocktails.forEach((cocktail) => list.append(renderCocktailCard(cocktail)));
        state.cocktails
            .slice(0, 2)
            .forEach((cocktail) => dashboardCocktails.append(renderCocktailCard(cocktail)));
    };

    const renderStats = () => {
        const list = select('#stats-list');
        const sync = select('#stats-sync');

        clear(list);
        list.append(
            renderStatCard('Recipes indexed', state.stats.recipesIndexed),
            renderStatCard('Failed chunks', state.stats.failedChunks),
            renderStatCard('Embedding coverage', state.stats.embeddingCoverage),
        );
        sync.textContent = state.stats.lastSync;
    };

    const renderDashboard = () => {
        renderMetrics();
        renderUsers();
        renderCocktails();
    };

    const renderAiAnswer = (payload) => {
        const answer = select('#ai-answer');
        const sources = select('#ai-sources');

        clear(answer);
        clear(sources);
        answer.append(createElement('p', '', payload.answer));
        getItems(payload.sources).forEach((source) => {
            const item = createElement('article', 'source-item');
            const title = createElement('h4', '', source.title);
            const score = createElement('p', '', `Relevance score: ${source.score}`);

            item.append(title, score);
            sources.append(item);
        });
    };

    const loadDashboard = async () => {
        setBusy(true);
        setStatus('Loading data...', 'warning');

        try {
            const [usersPayload, cocktailsPayload, statsPayload] = await Promise.all([
                api().getUsers(),
                api().getCocktails(),
                api().getStats(),
            ]);

            state.users = getItems(usersPayload);
            state.cocktails = getItems(cocktailsPayload);
            state.stats = statsPayload;
            renderDashboard();
            renderStats();
            setStatus('Data synchronized');
        } catch (error) {
            setStatus(error.message, 'error');
        } finally {
            setBusy(false);
        }
    };

    const loadUsers = async () => {
        setBusy(true);
        setStatus('Loading users...', 'warning');

        try {
            const payload = await api().getUsers();

            state.users = getItems(payload);
            renderUsers();
            renderMetrics();
            setStatus('Users synchronized');
        } catch (error) {
            setStatus(error.message, 'error');
        } finally {
            setBusy(false);
        }
    };

    const loadCocktails = async () => {
        setBusy(true);
        setStatus('Loading cocktails...', 'warning');

        try {
            const payload = await api().getCocktails();

            state.cocktails = getItems(payload);
            renderCocktails();
            renderMetrics();
            setStatus('Cocktails synchronized');
        } catch (error) {
            setStatus(error.message, 'error');
        } finally {
            setBusy(false);
        }
    };

    const loadStats = async () => {
        setBusy(true);
        setStatus('Loading stats...', 'warning');

        try {
            state.stats = await api().getStats();
            renderStats();
            renderMetrics();
            setStatus('Stats synchronized');
        } catch (error) {
            setStatus(error.message, 'error');
        } finally {
            setBusy(false);
        }
    };

    const navigate = (route) => {
        state.currentRoute = route;
        selectAll('[data-view]').forEach((view) => {
            const isActive = view.dataset.view === route;

            view.toggleAttribute('hidden', !isActive);
            view.classList.toggle('is-active', isActive);
        });
        selectAll('[data-route]').forEach((button) => {
            button.classList.toggle('is-active', button.dataset.route === route);
        });
    };

    const getRouteFromHash = () => window.location.hash.replace('#', '') || 'dashboard';

    const handleRoute = () => {
        const route = getRouteFromHash();

        navigate(route);
    };

    const handleNavigation = (event) => {
        const button = event.target.closest('[data-route]');

        if (button) {
            window.location.hash = button.dataset.route;
        }
    };

    const handleCreateUser = async (event) => {
        event.preventDefault();
        setBusy(true);

        try {
            const formData = new FormData(event.target);
            const user = {
                email: formData.get('email'),
                id: Date.now(),
                role: formData.get('role'),
                status: 'Active',
                username: formData.get('username'),
            };

            await api().createUser(user);
            state.users = state.users.concat(user);
            renderUsers();
            renderMetrics();
            event.target.reset();
            setStatus('User created');
        } catch (error) {
            setStatus(error.message, 'error');
        } finally {
            setBusy(false);
        }
    };

    const handleAsk = async (event) => {
        event.preventDefault();
        setBusy(true);
        setStatus('Generating answer...', 'warning');

        try {
            const formData = new FormData(event.target);
            const payload = await api().askAi(formData.get('question'));

            renderAiAnswer(payload);
            setStatus('Answer received');
        } catch (error) {
            setStatus(error.message, 'error');
        } finally {
            setBusy(false);
        }
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        setBusy(true);

        try {
            const formData = new FormData(event.target);
            const session = await api().login({
                email: formData.get('email'),
                password: formData.get('password'),
            });

            select('#session-summary').textContent = `${session.displayName} signed in as ${session.role}`;
            setStatus('Session started');
        } catch (error) {
            setStatus(error.message, 'error');
        } finally {
            setBusy(false);
        }
    };

    const handleActions = (event) => {
        const button = event.target.closest('[data-action]');

        if (!button) {
            return;
        }

        if (button.dataset.action === 'refresh-users') {
            loadUsers();
        }

        if (button.dataset.action === 'refresh-cocktails') {
            loadCocktails();
        }

        if (button.dataset.action === 'refresh-stats') {
            loadStats();
        }
    };

    const bindEvents = () => {
        select('.site-nav').addEventListener('click', handleNavigation);
        select('#create-user-form').addEventListener('submit', handleCreateUser);
        select('#ask-form').addEventListener('submit', handleAsk);
        select('#login-form').addEventListener('submit', handleLogin);
        document.addEventListener('click', handleActions);
        window.addEventListener('hashchange', handleRoute);
    };

    const init = () => {
        bindEvents();
        handleRoute();
        loadDashboard();
    };

    document.addEventListener('DOMContentLoaded', init);
}());
