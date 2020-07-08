# WakaTime to Toggl

[![Version][version-src]][version-href]
[![code style: prettier][code-style-src]][code-style-href]
[![Downloads][downloads-src]][downloads-href]

Sync your WakaTime data in Toggl. Works with free accounts

## Prerequisites

-   Get your Wakatime "Secret API Key" in [your account settings](https://wakatime.com/settings/account)
-   Get your Toggl "API Token" at the bottom of [your profile page](https://www.toggl.com/app/profile)

## Option 1 - Run manually on your computer

-   Download and install [Node.js](https://nodejs.org/en/download/)
-   Install **wakatime-to-toggl** with `npm i -g wakatime-to-toggl`
-   Run `wakatime-to-toggl -w <wakatime-api-key> -t <toggl-api-key>` to sync data from yesterday
-   Ideally, run `wakatime-to-toggl` everyday

## Option 2 - Run automatically everyday using Github Actions

-   Fork this repository
-   From your new fork, click on the "Settings" tab on the right
    ![Settings tab](https://user-images.githubusercontent.com/17952318/86905596-9618c800-c112-11ea-819c-137afc644d37.png)

-   Click on "Secrets" in the left menu
-   Click "New Secret" and add your **WakaTime** API Key in a secret named `WAKATIME_API_KEY`
-   Click "New Secret" and add your **Toggl** API Key in a secret named `TOGGL_API_KEY`
    ![Screenshot](https://user-images.githubusercontent.com/17952318/86905384-4934f180-c112-11ea-91cd-7b391cd7e5de.png)

-   Go to the "Actions" tab of your fork and click the green button
    ![Actions](https://user-images.githubusercontent.com/17952318/86906074-4981bc80-c113-11ea-9433-18eb7d5972f7.png)

That's it! **wakatime-to-toggl** will run every day at 2:30 AM UTC, just be patient

You can come back to the "Actions" tab of your fork to see the logs

## Things to know

-   Entries shorter than 2 minutes will be ignored
-   Duplicate entries won't be added if they are detected
-   Projects will be created in your default workspace. You can move them to another workspace if you want
-   Time entries will be created with a default description ("Development"). You can edit it, it won't break duplicates detection

[version-src]: https://runkit.io/bokub/npm-version/branches/master/wakatime-to-toggl?style=flat
[code-style-src]: https://flat.badgen.net/badge/code%20style/prettier/ff69b4
[downloads-src]: https://flat.badgen.net/npm/dm/wakatime-to-toggl
[version-href]: https://www.npmjs.com/package/wakatime-to-toggl
[code-style-href]: https://github.com/prettier/prettier
[downloads-href]: https://www.npmjs.com/package/wakatime-to-toggl
