import { getActivity } from './wakatime.js';
import { addEntry, createProject, getInfo, unarchiveProject } from './toggl.js';
import ora from 'ora';

export default async function (flags) {
  // Call WakaTime and Toggl APIs
  const wakaTimeActivity = await getActivity(flags.day, flags.minDuration, flags.wakatime);
  const togglInfo = await getInfo(flags.toggl);

  // List all WakaTime projects
  const wakaTimeProjects = Object.keys(Object.fromEntries(wakaTimeActivity.map((act) => [act.project, act])));

  // Find which projects are not in Toggl yet
  const projectsToCreate = wakaTimeProjects.filter(
    (p) => !togglInfo.projects.find((t) => t.name.toLowerCase() === p.toLowerCase()),
  );

  // Create projects in Toggl
  for (const project of projectsToCreate) {
    const created = await createProject(project, togglInfo.workspaceId, flags.toggl);
    togglInfo.projects.push(created);
    await sleep(1000); // One request / second to avoid hitting the limit
  }

  const projects = Object.fromEntries(togglInfo.projects.map((p) => [p.name.toLowerCase(), p]));

  // Add WakaTime entries to Toggl
  let added = 0;
  let duplicates = 0;
  let addedProjects = {};
  const spinner = ora('Adding entries to Toggl...').start();
  for (const entry of wakaTimeActivity) {
    const project = projects[entry.project.toLowerCase()];
    if (!project) {
      throw new Error(`project "${entry.project}" doesn't exist in Toggl`);
    }
    const start = new Date(Math.round(entry.time) * 1000).toISOString();
    const duration = Math.round(entry.duration);
    if (alreadyExists(project.id, start, duration, togglInfo.entries)) {
      duplicates++;
      spinner.text = `Added ${added}/${wakaTimeActivity.length} entries to Toggl... Found ${duplicates} duplicates`;
      continue;
    }

    // Skip archived projects if skipArchived flag is set
    if (project.active === false && flags.skipArchived) {
      spinner.text = `Skipping archived project "${entry.project}"...`;
      continue;
    }

    try {
      // Check if project is archived and unarchive if needed
      if (project.active === false && !addedProjects[project.id]) {
        spinner.text = `Unarchiving project "${entry.project}"...`;
        await unarchiveProject(project.id, togglInfo.workspaceId, flags.toggl);
      }

      // Add entry to project
      await addEntry(project.id, togglInfo.workspaceId, start, duration, flags.toggl);
    } catch (err) {
      spinner.fail(`Failed to add entry for project "${entry.project}"`);
      throw new Error(`${err.message} (Project: "${entry.project}", Start: ${start}, Duration: ${duration}s)`);
    }
    spinner.text = `Added ${added}/${wakaTimeActivity.length} entries to Toggl...`;
    if (duplicates > 0) {
      spinner.text += ` Found ${duplicates} duplicates`;
    }
    addedProjects[project.id] = true;
    added++;
    await sleep(1000); // One request / second to avoid hitting the limit
  }
  spinner.succeed(`Added ${added} time entries to ${Object.keys(addedProjects).length} project(s).`);
  if (duplicates > 0) {
    ora(`${duplicates} entries were already in Toggl.`).info();
  }
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function alreadyExists(projectId, start, duration, entries) {
  return Boolean(
    entries.find(
      (entry) =>
        entry.start.substr(0, 19) === start.substr(0, 19) && entry.duration === duration && entry.pid === projectId,
    ),
  );
}
