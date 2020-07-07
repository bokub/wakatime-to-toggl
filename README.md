# WakaTime to Toggl

Send your WakaTime data to Toggl

Works with free accounts

## Usage

-   Get your Wakatime "Secret API Key" in [your account settings](https://wakatime.com/settings/account)
-   Get your Toggl "API Token" at the bottom of [your profile page](https://www.toggl.com/app/profile)
-   Install wakatime-to-toggl with `npm i -g wakatime-to-toggl`
-   Run `wakatime-to-toggl -w <wakatime-api-key> -t <toggl-api-key>` everyday
-   Run `wakatime-to-toggl --help` for more advanced usage

## Things to know

-   Entries shorter than 2 minutes will be ignored
-   Duplicate entries won't be added if they are detected
-   Projects will be created in your default workspace. You can move them to another workspace if you want
-   Time entries will be created with a default description ("Development"). You can edit it, it won't break duplicates detection
