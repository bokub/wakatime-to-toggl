# WakaTime to Toggl

## Usage

-   Get your Wakatime "Secret API Key" in [your account settings](https://wakatime.com/settings/account)
-   Get your Toggl "API Token" at the bottom of [your profile page](https://www.toggl.com/app/profile)
-   Install wakatime-to-toggl with `npm i -g wakatime-to-toggl`
-   Run `wakatime-to-toggl -w <wakatime-api-key> -t <toggl-api-key>` everyday
-   Run `wakatime-to-toggl --help` for more advanced usage

## Things to know

-   Entries shorter than 2 minutes will be ignored
-   Duplicate entries won't be added if they are detected
-   If you rename projects created by wakatime-to-toggl, they will be created again with their old name
-   wakatime-to-toggl will create projects in your default workspace. You can move them safely
-   Time entries will be created with a default description. You can edit it safely
