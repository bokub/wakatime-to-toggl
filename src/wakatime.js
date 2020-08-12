const axios = require('axios');
const ora = require('ora');

module.exports = {
    getActivity: async function (day, apiKey) {
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
                const filtered = entries.filter((e) => e.duration >= 120);
                spinner.succeed(`Found ${entries.length} WakaTime entries for the ${strDate}.`);
                if (filtered.length < entries.length) {
                    spinner.text += `${
                        entries.length - filtered.length
                    } of them are shorter than 2 minutes and will be ignored.`;
                }
                return filtered;
            })
            .catch((err) => {
                spinner.fail('Cannot fetch Wakatime entries');
                throw new Error(`cannot fetch Wakatime entries: ${err}`);
            });
    },
};
