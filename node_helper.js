const NodeHelper = require("node_helper");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

module.exports = NodeHelper.create({
    socketNotificationReceived: function (notification, payload) {
        if (notification === "FETCH_FORECAST") {
            this.fetchForecast(payload);
        }
    },

    fetchForecast: function (config) {
        const stationId = config.stationIds[config.station];
        const url = config.apiBase + '/' + stationId;
        const self = this;

        const forecastRequest = new XMLHttpRequest();
        forecastRequest.open("GET", url, true);
        forecastRequest.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    self.sendSocketNotification("FORECAST_RESULT", JSON.parse(this.responseText));
                } else if (this.status === 401) {
                    Log.error("MMM-PollenForecast: Incorrect stationId.");
                } else {
                    Log.error("MMM-PollenForecast: Could not load forecast.");
                }
            }
        };
        forecastRequest.send();
    },
});
