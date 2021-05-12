# WakaTime to Toggl

[![Version][version-src]][version-href]
[![code style: prettier][code-style-src]][code-style-href]
[![Downloads][downloads-src]][downloads-href]
[![CI][ci-src]][ci-href]

Sync your WakaTime data in Toggl

-   Works with free accounts
-   Can be automated with Github Actions

<p align="center">
  <img width="639" height="238" src="https://user-images.githubusercontent.com/17952318/90114480-10acb700-dd53-11ea-9c67-5700705214e5.gif">
</p>

## Prerequisites

-   Get your Wakatime API key in [your settings](https://wakatime.com/settings/api-key)
-   Get your Toggl "API Token" at the bottom of [your profile page](https://track.toggl.com/profile)

## Option 1 - Run manually on your computer

1.  Download and install [Node.js](https://nodejs.org/en/download/)
2.  Install **wakatime-to-toggl** with `npm i -g wakatime-to-toggl`
3.  Run the following command to sync data from yesterday: `wakatime-to-toggl -w <wakatime-api-key> -t <toggl-api-key>`
4.  Ideally, run **wakatime-to-toggl** everyday

## Option 2 - Run automatically everyday using Github Actions

1. Fork this repository
2. From your new fork, go to **Settings > Secrets**
3. Add the following secrets using the **New secret** button:

-   `TOGGL_API_KEY`: Your Toggl API Key
-   `WAKATIME_API_KEY`: Your Wakatime API Key
    ![Screenshot](https://user-images.githubusercontent.com/17952318/86905384-4934f180-c112-11ea-91cd-7b391cd7e5de.png)

4. Go to the **Actions** tab of your fork
5. Click **set up a workflow yourself**
6. Copy-paste this workflow:

```yaml
name: Run wakatime-to-toggl everyday
on:
    schedule:
        - cron: 30 2 * * * # Everyday at 02:30 AM UTC. You can change it according to your timezone
jobs:
    run:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/setup-node@v1
              with:
                  node-version: 12
            - run: npx wakatime-to-toggl -w "$WAKATIME_API_KEY" -t "$TOGGL_API_KEY"
              env:
                  TOGGL_API_KEY: '${{ secrets.TOGGL_API_KEY }}'
                  WAKATIME_API_KEY: '${{ secrets.WAKATIME_API_KEY }}'
```

7. Click **Start commit** then **Commit new file** to save

That's it! **wakatime-to-toggl** will run every day at 2:30 AM UTC (unless you changed it in the workflow)

You can come back to the **Actions** tab later to see the logs

## Things to know

-   Entries shorter than 2 minutes will be ignored. This duration is configurable
-   Duplicate entries won't be added if they are detected
-   Projects will be created in your default workspace. You can move them to another workspace if you want
-   Time entries will be created with a default description ("Development"). You can edit it, it won't break duplicates detection

## Detailed usage

```bash
$ wakatime-to-toggl --help

  Usage
    $ wakatime-to-toggl -w <wakatime-api-key> -t <toggl-api-key>

  Options
    --wakatime,       -w  Your Wakatime api key
    --toggl,          -t  Your Toggl api key
    --day,            -d  The day to fetch. 0 is today, 1 is yesterday... Default: 1
    --min-duration    -m  Minimum duration (in seconds) of entries to sync. Default: 120
```

[version-src]: https://runkit.io/bokub/npm-version/branches/master/wakatime-to-toggl?style=flat
[code-style-src]: https://flat.badgen.net/badge/code%20style/prettier/ff69b4
[downloads-src]: https://flat.badgen.net/npm/dm/wakatime-to-toggl?color=orange
[ci-src]: https://flat.badgen.net/travis/bokub/wakatime-to-toggl
[version-href]: https://www.npmjs.com/package/wakatime-to-toggl
[code-style-href]: https://github.com/bokub/prettier-config
[downloads-href]: https://www.npmjs.com/package/wakatime-to-toggl
[ci-href]: https://travis-ci.org/bokub/wakatime-to-toggl
