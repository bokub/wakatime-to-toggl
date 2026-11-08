import axios from 'axios';
import ora from 'ora';
import prettyMs from 'pretty-ms';

let instance = axios.create({
  baseURL: 'https://api.track.toggl.com/api/v9',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Toggl answers 402 when the hourly API quota of the plan is used up
export class TogglQuotaError extends Error {
  name = 'TogglQuotaError';
}

function togglError(err, context) {
  const errorDetails = err.response?.data || err.message || err;
  const errorMessage = typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails);
  if (err.response?.status === 402) {
    const resetsIn = Number(err.response.headers?.['x-toggl-quota-resets-in']);
    const resetNote = resetsIn ? ` (quota resets in ${prettyMs(resetsIn * 1000, { verbose: true })})` : '';
    return new TogglQuotaError(`Toggl API quota reached while trying to ${context}: ${errorMessage}${resetNote}`);
  }
  return new Error(`cannot ${context}: ${errorMessage}`);
}

export function getInfo(apiKey) {
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

    .then((resp) => resp.data)
    .then((resp) => {
      const projects = resp.projects ? resp.projects.filter((p) => !p.server_deleted_at) : [];
      const timeEntries = resp.time_entries || [];
      spinner.succeed(`Found ${projects.length} Toggl projects and ${timeEntries.length} recent time entries.`);
      return {
        workspaceId: resp.default_workspace_id,
        projects: projects,
        entries: timeEntries,
      };
    })
    .catch((err) => {
      spinner.fail('Cannot fetch Toggl projects');
      throw togglError(err, 'fetch Toggl projects');
    });
}
export async function createProject(name, workspaceId, apiKey) {
  const spinner = ora(`Creating project "${name}" in Toggl...`);
  return instance
    .post(
      `workspaces/${workspaceId}/projects`,
      {
        name: name,
        active: true,
      },
      {
        auth: {
          username: apiKey,
          password: 'api_token',
        },
      },
    )
    .then((resp) => {
      spinner.succeed(`Created project "${resp.data.name}" in Toggl.`);
      return resp.data;
    })
    .catch((err) => {
      spinner.fail(`Cannot create Toggl project "${name}"`);
      throw togglError(err, `create Toggl project "${name}"`);
    });
}
export async function addEntry(projectId, workspaceId, start, duration, apiKey) {
  return instance
    .post(
      `workspaces/${workspaceId}/time_entries`,
      {
        description: 'Development',
        duration: duration,
        start: start,
        project_id: projectId,
        workspace_id: workspaceId,
        created_with: 'wakatime-to-toggl',
      },
      {
        auth: {
          username: apiKey,
          password: 'api_token',
        },
      },
    )
    .then((resp) => resp.data)
    .catch((err) => {
      throw togglError(err, `create Toggl entry for project ID ${projectId}`);
    });
}
export async function unarchiveProject(projectId, workspaceId, apiKey) {
  return instance
    .put(
      `workspaces/${workspaceId}/projects/${projectId}`,
      {
        active: true,
      },
      {
        auth: {
          username: apiKey,
          password: 'api_token',
        },
      },
    )
    .then((resp) => resp.data)
    .catch((err) => {
      throw togglError(err, `unarchive Toggl project ID ${projectId}`);
    });
}
