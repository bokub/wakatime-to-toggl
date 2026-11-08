#!/usr/bin/env node

import meow from 'meow';
import syncActivity from './src/sync.js';
import { TogglQuotaError } from './src/toggl.js';

// Exit code for a used-up Toggl quota, so CI can retry later (EX_TEMPFAIL)
const EXIT_TOGGL_QUOTA = 75;

const cli = meow(
  `
    Usage
      $ wakatime-to-toggl -w <wakatime-api-key> -t <toggl-api-key>
 
    Options
      --wakatime,       -w  Your Wakatime api key
      --toggl,          -t  Your Toggl api key
      --day,            -d  The day to fetch. 0 is today, 1 is yesterday... Default: 1
      --date                The exact date to fetch (YYYY-MM-DD). Overrides --day
      --min-duration    -m  Minimum duration (in seconds) of entries to sync. Default: 120
      --skipArchived,   -s  Skip archived Toggl projects. Default: false 
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
      date: {
        type: 'string',
      },
      minDuration: {
        type: 'number',
        shortFlag: 'm',
        default: 120,
      },
      skipArchived: {
        type: 'boolean',
        shortFlag: 's',
        default: false,
      },
    },
    importMeta: import.meta,
  },
);

if (cli.flags.date && !isValidDate(cli.flags.date)) {
  console.error(`Invalid --date "${cli.flags.date}". Expected format: YYYY-MM-DD.`);
  process.exit(1);
}

function isValidDate(date) {
  // Round-trip rejects impossible dates like 2026-02-30, which Date would roll over
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }
  const parsed = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(date);
}

syncActivity(cli.flags).catch((err) => {
  if (err instanceof TogglQuotaError) {
    console.error(err.message);
    process.exit(EXIT_TOGGL_QUOTA);
  }
  console.error(err);
  process.exit(1);
});
