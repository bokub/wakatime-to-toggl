#!/usr/bin/env node

import meow from 'meow';
import syncActivity from './src/sync.js';

const cli = meow(
  `
    Usage
      $ wakatime-to-toggl -w <wakatime-api-key> -t <toggl-api-key>
 
    Options
      --wakatime,       -w  Your Wakatime api key
      --toggl,          -t  Your Toggl api key
      --day,            -d  The day to fetch. 0 is today, 1 is yesterday... Default: 1
      --min-duration    -m  Minimum duration (in seconds) of entries to sync. Default: 120
`,
  {
    flags: {
      wakatime: {
        type: 'string',
        shortFlag: 'w',
        isRequired: true,
      },
      toggl: {
        type: 'string',
        shortFlag: 't',
        isRequired: true,
      },
      day: {
        type: 'number',
        shortFlag: 'd',
        default: 1,
      },
      minDuration: {
        type: 'number',
        shortFlag: 'm',
        default: 120,
      },
    },
    importMeta: import.meta,
  },
);

syncActivity(cli.flags);
