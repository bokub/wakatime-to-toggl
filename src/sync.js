const wakaTime = require('./wakatime');
const toggl = require('./toggl');
const ora = require('ora');

module.exports = async function (flags) {
    // Call WakaTime and Toggl APIs
    const wakaTimeActivity = await wakaTime.getActivity(flags.day, flags.minDuration, flags.wakatime);
    const togglInfo = await toggl.getInfo(flags.toggl);

    // List all WakaTime projects
    const wakaTimeProjects = Object.keys(
        wakaTimeActivity.reduce((acc, act) => {
            acc[act.project] = act;
            return acc;
        }, {})
    );

    // Find which projects are not in Toggl yet
    const projectsToCreate = wakaTimeProjects.filter(
        (p) => !togglInfo.projects.find((t) => t.name.toLowerCase() === p.toLowerCase())
    );

    // Create projects in Toggl
    for (const project of projectsToCreate) {
        const created = await toggl.createProject(project, togglInfo.workspaceId, flags.toggl);
        togglInfo.projects.push(created);
        await sleep(1000); // One request / second to avoid hitting the limit
    }

    const projectIds = togglInfo.projects.reduce((acc, p) => {
        acc[p.name.toLowerCase()] = p.id;
        return acc;
    }, {});

    // Add WakaTime entries to Toggl
    let added = 0;
    let duplicates = 0;
    let projects = {};
    const spinner = ora('Adding entries to Toggl...').start();
    for (const entry of wakaTimeActivity) {
        const projectId = projectIds[entry.project.toLowerCase()];
        if (!projectId) {
            throw new Error(`project "${entry.project}" doesn't exist in Toggl`);
        }
        const start = new Date(Math.round(entry.time) * 1000).toISOString();
        const duration = Math.round(entry.duration);
        if (alreadyExists(projectId, start, duration, togglInfo.entries)) {
            duplicates++;
            spinner.text = `Added ${added}/${wakaTimeActivity.length} entries to Toggl... Found ${duplicates} duplicates`;
            continue;
        }

        await toggl.addEntry(projectId, start, duration, flags.toggl);
        spinner.text = `Added ${added}/${wakaTimeActivity.length} entries to Toggl...`;
        if (duplicates > 0) {
            spinner.text += ` Found ${duplicates} duplicates`;
        }
        projects[projectId] = true;
        added++;
        await sleep(1000); // One request / second to avoid hitting the limit
    }
    spinner.succeed(
        `Added ${added} time entries to ${
            Object.keys(projects).length
        } project(s). ${duplicates} entries were already in Toggl.`
    );
};

function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

function alreadyExists(projectId, start, duration, entries) {
    return Boolean(
        entries.find(
            (entry) =>
                entry.start.substr(0, 19) === start.substr(0, 19) &&
                entry.duration === duration &&
                entry.pid === projectId
        )
    );
}
