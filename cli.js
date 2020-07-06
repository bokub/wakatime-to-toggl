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
        },
    }
);
/*
{
    input: ['unicorns'],
    flags: {rainbow: true},
    ...
}
*/

syncActivity(cli.flags.wakatime, cli.flags.toggl);
