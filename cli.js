#!/usr/bin/env node
'use strict';

const meow = require('meow');
const syncActivity = require('./src/sync');

const cli = meow(
    `
    Usage
      $ wakatime-to-toggl -w <wakatime-api-key> -t <toggl-api-key>
 
    Options
      --wakatime, -w  Your Wakatime api key
      --toggl,    -t  Your Toggl api key
      --day,      -d  The day to fetch. 0 is today, 1 is yesterday... Default: 1
`,
    {
        flags: {
            wakatime: {
                type: 'string',
                alias: 'w',
                isRequired: true,
            },
            toggl: {
                type: 'string',
                alias: 't',
                isRequired: true,
            },
            day: {
                type: 'number',
                alias: 'd',
                default: 1,
            },
        },
    }
);

syncActivity(cli.flags.wakatime, cli.flags.toggl, cli.flags.day);
