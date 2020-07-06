const axios = require('axios');

module.exports = {
    getYesterdayActivity: async function (apiKey) {
        const date = new Date();
        date.setDate(date.getDate() - 1);
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
                throw new Error('Cannot fetch Wakatime entries:' + err);
            });
    },
};
