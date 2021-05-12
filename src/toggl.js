const axios = require('axios');
const ora = require('ora');

const instance = axios.create({
    baseURL: 'https://api.track.toggl.com/api/v8',
    headers: {
        'Content-Type': 'application/json',
    },
});

module.exports = {
    getInfo: async function (apiKey) {
        const spinner = ora(`Fetching Toggl projects...`).start();

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
                const projects = resp.projects ? resp.projects.filter((p) => !p.server_deleted_at) : [];
                const timeEntries = resp.time_entries || [];
                spinner.succeed(
                    `Found ${projects.length} Toggl projects and ${timeEntries.length} recent time entries.`
                );
                return {
                    workspaceId: resp.default_wid,
                    projects: projects,
                    entries: timeEntries,
                };
            })
            .catch((err) => {
                if (err.response) {
                    console.error(err.response.data);
                }
                spinner.fail('Cannot fetch Toggl projects');
                throw new Error(`cannot fetch Toggl projects: ${err}`);
            });
    },
    createProject: async function (name, workspaceId, apiKey) {
        const spinner = ora(`Creating project "${name}" in Toggl...`);
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
            .then((resp) => {
                spinner.succeed(`Created project "${resp.data.data.name}" in Toggl.`);
                return resp.data.data;
            })
            .catch((err) => {
                if (err.response) {
                    console.error(err.response.data);
                }
                spinner.fail(`Cannot create Toggl project "${name}"`);
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
