import axios from 'axios';
import ora from 'ora';
import prettyMs from 'pretty-ms';

export async function getActivity(day, minDuration, apiKey) {
  const date = new Date();
  date.setDate(date.getDate() - day);
  const strDate = date.toISOString().substr(0, 10);
  const spinner = ora(`Fetching WakaTime data for the ${strDate}...`).start();

  return axios
    .get('https://wakatime.com/api/v1/users/current/durations', {
      params: {
        date: strDate,
        api_key: apiKey,
      },
    })
    .then((resp) => resp.data.data)
    .then((entries) => {
      const filtered = entries.filter((e) => e.duration >= minDuration);
      spinner.succeed(`Found ${entries.length} WakaTime entries for the ${strDate}.`);
      if (filtered.length < entries.length) {
        ora(
          `${entries.length - filtered.length} entries are shorter than ${prettyMs(1000 * minDuration, {
            verbose: true,
          })} and will be ignored.`,
        ).info();
      }
      return filtered;
    })
    .catch((err) => {
      spinner.fail('Cannot fetch Wakatime entries');
      throw new Error(`cannot fetch Wakatime entries: ${err}`);
    });
}
