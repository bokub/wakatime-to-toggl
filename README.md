# WakaTime to Toggl

[![Build Status](https://flat.badgen.net/github/checks/bokub/wakatime-to-toggl?label=build)](https://github.com/bokub/wakatime-to-toggl/actions/workflows/run.yml?query=branch%3Amaster)
[![Version](https://gradgen.bokub.workers.dev/npm/v/wakatime-to-toggl?gradient=b65cff,11cbfa&style=flat&label=version)](https://github.com/bokub/wakatime-to-toggl/releases)
[![Downloads](https://flat.badgen.net/npm/dm/wakatime-to-toggl?color=orange)](https://www.npmjs.com/package/wakatime-to-toggl)
[![Code style](https://flat.badgen.net/badge/code%20style/prettier/ff69b4)](https://github.com/bokub/prettier-config)

Automatically import your [WakaTime](https://wakatime.com/) data into [Toggl](https://toggl.com/)

- Works with free accounts
- Can be automated with GitHub Actions

<p align="center">
  <img width="639" height="238" src="https://user-images.githubusercontent.com/17952318/90114480-10acb700-dd53-11ea-9c67-5700705214e5.gif">
</p>

## Prerequisites

- Get your WakaTime API key in [your settings](https://wakatime.com/settings/api-key)
- Get your Toggl "API Token" at the bottom of [your profile page](https://track.toggl.com/profile)

## Option 1 - Run manually on your computer

1.  Download and install [Node.js](https://nodejs.org/en/download/)
2.  Install **wakatime-to-toggl** with `npm i -g wakatime-to-toggl`
3.  Run the following command to sync data from yesterday: `wakatime-to-toggl -w <wakatime-api-key> -t <toggl-api-key>`
4.  Ideally, run **wakatime-to-toggl** everyday

## Option 2 - Run automatically everyday using GitHub Actions

1. Fork this repository
2. From your new fork, go to **Settings > Secrets and variables > Actions**
3. Add the following secrets using the **New repository secret** button:

- `TOGGL_API_KEY`: Your Toggl API Key
- `WAKATIME_API_KEY`: Your Wakatime API Key
  ![Screenshot](https://user-images.githubusercontent.com/17952318/86905384-4934f180-c112-11ea-91cd-7b391cd7e5de.png)

4. Go to **Settings > Environments**, click **New environment**, name it `toggl-cooldown`, tick **Wait timer**, set it to `60` minutes and save. On free GitHub plans, wait timers only exist on public repositories, so keep your fork public
5. Go to the **Actions** tab of your fork and enable workflows

That's it! The **Sync WakaTime to Toggl** workflow will run every day at 2:30 AM UTC. To change the time, edit the `cron` line in `.github/workflows/sync.yml`

You can come back to the **Actions** tab later to see the logs

### Toggl rate limits

Toggl's free plan allows 30 API requests per hour, and **wakatime-to-toggl** sends one request per time entry. When a run hits the limit, the workflow schedules a new run for the same date. The `toggl-cooldown` environment delays that run by 60 minutes, without using Actions minutes. Entries already sent are detected as duplicates and skipped. Duplicate detection only sees Toggl's recent time entries, so a retry for an old date can add the same entries twice. The workflow gives up after 24 attempts

To sync a specific day by hand, run the **Sync WakaTime to Toggl** workflow from the **Actions** tab and fill in the date (`YYYY-MM-DD`)

## Things to know

- Entries shorter than 2 minutes will be ignored. This duration is configurable
- Duplicate entries won't be added if they are detected
- Projects will be created in your default workspace. You can move them to another workspace if you want
- Time entries will be created with a default description ("Development"). You can edit it, it won't break duplicates detection
- Archived toggl projects will be automatically unarchived. You can instead choose to ignore them using the `--skip-archived` option

## Detailed usage

```bash
$ wakatime-to-toggl --help

  Usage
    $ wakatime-to-toggl -w <wakatime-api-key> -t <toggl-api-key>

  Options
    --wakatime,       -w  Your Wakatime api key
    --toggl,          -t  Your Toggl api key
    --day,            -d  The day to fetch. 0 is today, 1 is yesterday... Default: 1
    --date                The exact date to fetch (YYYY-MM-DD). Overrides --day
    --min-duration    -m  Minimum duration (in seconds) of entries to sync. Default: 120
    --skip-archived   -s  Skip archived Toggl projects. Default: false
```
