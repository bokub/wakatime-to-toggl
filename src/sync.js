const wakaTime = require('./wakatime');
const toggl = require('./toggl');

module.exports = async function (wakaTimeApiKey, togglApiKey) {
    // Call WakaTime and Toggl APIs
    const [wakaTimeActivity, toggleInfo] = await Promise.all([
        wakaTime.getYesterdayActivity(wakaTimeApiKey),
        toggl.getInfo(togglApiKey),
    ]);

    // List all WakaTime projects
    const wakaTimeProjects = Object.keys(
        wakaTimeActivity.reduce((acc, act) => {
            acc[act.project] = act;
            return acc;
        }, {})
    );

    // Find which projects are not in Toggl yet
    const projectsToCreate = wakaTimeProjects.filter(
        (p) => !toggleInfo.projects.find((t) => t.name.toLowerCase() === p.toLowerCase())
    );

    // Create projects in Toggl
    for (const project of projectsToCreate) {
        const created = await toggl.createProject(project, toggleInfo.workspaceId, togglApiKey);
        console.info(`created the following project in Toggl: ${created.name}`);
        toggleInfo.projects.push(created);
        await sleep(1000); // One request / second to avoid hitting the limit
    }

    const projectIds = toggleInfo.projects.reduce((acc, p) => {
        acc[p.name.toLowerCase()] = p.id;
        return acc;
    }, {});

    // Add WakaTime entries to Toggl
    for (const entry of wakaTimeActivity) {
        const projectId = projectIds[entry.project];
        if (!projectId) {
            throw new Error(`project "${entry.project}" doesn't exist in Toggl`);
        }
        await toggl.addEntry(projectId, Math.round(entry.time), Math.round(entry.duration), togglApiKey);
        await sleep(1000); // One request / second to avoid hitting the limit
    }
    console.info(`added ${wakaTimeActivity.length} time entries to ${wakaTimeProjects.length} project(s)`);
};

function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}
