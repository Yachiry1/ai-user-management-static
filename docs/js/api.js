(function attachApi() {
    const staticEndpoints = {
        '/users': 'users.json',
        '/cocktails': 'cocktails.json',
        '/kb/stats': 'kb-stats.json',
        '/ai/answers': 'ai-answer.json',
        '/auth/session': 'auth-session.json',
    };
    const baseUrl = window.MIXOLOGY_API_BASE_URL || 'api';
    const isStaticApi = baseUrl === 'api';

    const normalizeEndpoint = (endpoint) => endpoint.replace(/^\/+/, '');

    const getUrl = (endpoint) => {
        const path = isStaticApi
            ? staticEndpoints[endpoint]
            : normalizeEndpoint(endpoint);

        return `${baseUrl}/${path}`;
    };

    const getOptions = (options) => {
        if (isStaticApi) {
            return {
                headers: {
                    Accept: 'application/json',
                },
                method: 'GET',
            };
        }

        const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
        const fetchOptions = {
            ...options,
            headers,
            method: options.method || 'GET',
        };

        if (fetchOptions.body && typeof fetchOptions.body !== 'string') {
            fetchOptions.body = JSON.stringify(fetchOptions.body);
        }

        return fetchOptions;
    };

    const parseJson = async (response) => {
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        return response.json();
    };

    const request = async (endpoint, options = {}) => {
        const response = await fetch(getUrl(endpoint), getOptions(options));

        return parseJson(response);
    };

    window.MixologyApi = {
        askAi(question) {
            return request('/ai/answers', {
                body: {
                    question,
                },
                method: 'POST',
            });
        },
        createUser(user) {
            return request('/users', {
                body: user,
                method: 'POST',
            });
        },
        getCocktails() {
            return request('/cocktails');
        },
        getStats() {
            return request('/kb/stats');
        },
        getUsers() {
            return request('/users');
        },
        login(credentials) {
            return request('/auth/session', {
                body: credentials,
                method: 'POST',
            });
        },
    };
}());
