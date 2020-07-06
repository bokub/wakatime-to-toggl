const axios = require('axios');

const instance = axios.create({
    baseURL: 'https://www.toggl.com/api/v8',
    headers: {
        'Content-Type': 'application/json',
    },
});

module.exports = {
    getInfo: async function (apiKey) {
        return instance
            .get('me', {
                params: {
                    with_related_data: true,
                },
                headers: {
                    'Content-Type': 'application/json',
                },
                auth: {
                    username: apiKey,
                    password: 'api_token',
                },
            })

            .then((resp) => resp.data.data)
            .then((resp) => {
                return {
                    workspaceId: resp.default_wid,
                    projects: resp.projects.filter((p) => !p.server_deleted_at),
                    entries: resp.time_entries || [],
                };
            })
            .catch((err) => {
                if (err.response) {
                    console.error(err.response.data);
                }
                throw new Error(`cannot fetch Toggl projects: ${err}`);
            });
    },
    createProject: async function (name, workspaceId, apiKey) {
        return instance
            .post(
                'projects',
                {
                    project: {
                        name: name,
                        wid: workspaceId,
                    },
                },
                {
                    auth: {
                        username: apiKey,
                        password: 'api_token',
                    },
                }
            )
            .then((resp) => resp.data.data)
            .catch((err) => {
                if (err.response) {
                    console.error(err.response.data);
                }
                throw new Error(`cannot create Toggl project ${name}: ${err}`);
            });
    },
    addEntry: async function (projectId, start, duration, apiKey) {
        return instance
            .post(
                'time_entries',
                {
                    time_entry: {
                        description: 'Development',
                        duration: duration,
                        start: start,
                        pid: projectId,
                        created_with: 'wakatime-to-toggl',
                    },
                },
                {
                    auth: {
                        username: apiKey,
                        password: 'api_token',
                    },
                }
            )
            .then((resp) => resp.data.data)
            .catch((err) => {
                if (err.response) {
                    console.error(err.response.data);
                }
                throw new Error(`cannot create Toggl entry : ${err}`);
            });
    },
};
