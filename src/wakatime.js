const axios = require('axios');

module.exports = {
    getActivity: async function (day, apiKey) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        return axios
            .get('https://wakatime.com/api/v1/users/current/durations', {
                params: {
                    date: date.toISOString().substr(0, 10),
                    api_key: apiKey,
                },
            })
            .then((resp) => resp.data.data)
            .then((entries) => entries.filter((e) => e.duration >= 120))
            .catch((err) => {
                throw new Error(`cannot fetch Wakatime entries: ${err}`);
            });
    },
};
