Module.register("MMM-PollenForecast", {
    // Default module config
    defaults: {
        updateInterval: 60 * 60 * 1000, // Update every 1 hour
        retryDelay: 5000,
        station: 'vest', // Default station
        displayedAllergens: [], // Allergens to be displayed. If empty, all are displayed
        stationIds: {
            'vest': 'ffc9a45f-9736-4df0-9036-1cf8a4bb855d',
            'øst': 'c1787861-e2b3-4167-a150-3bca8afc11b4'
        },
        apiBase: 'https://pollentjek.dk/api/middleware/pollen',
    },

    start: function() {
        this.forecast = null;
        this.loaded = false;
        this.sendSocketNotification("FETCH_FORECAST", this.config);
        this.scheduleUpdate();
    },

    getStyles: function () {
        return ["MMM-PollenForecast.css", "https://fonts.googleapis.com/icon?family=Material+Icons"];
    },

getDom: function() {
    var wrapper = document.createElement("div");

    if (!this.loaded) {
        wrapper.innerHTML = "Loading...";
        wrapper.className = "dimmed light small";
        return wrapper;
    }

    if (this.forecast) {
        var table = document.createElement("table");
        table.className = "small";

        this.forecast.forEach(function (allergen) {
            var row = document.createElement("tr");
            table.appendChild(row);

            var iconCell = document.createElement("td");
            var icon = document.createElement("span");
            icon.className = "fas fa-viruses";
            if (allergen.level === 0) {
                icon.style.color = 'gray'; // Color for 'no-data'
                icon.className += ' no-data';
            } else if (allergen.level <= 0.25) {
                icon.style.color = 'green'; // Color for 'very-low'
                icon.className += ' very-low';
            } else if (allergen.level <= 0.5) {
                icon.style.color = 'green'; // Color for 'low'
                icon.className += ' low';
            } else if (allergen.level <= 0.75) {
                icon.style.color = 'yellow'; // Color for 'medium'
                icon.className += ' medium';
            } else {
                icon.style.color = 'red'; // Color for 'high'
                icon.className += ' high';
            }
            iconCell.appendChild(icon);
            row.appendChild(iconCell);

            var nameCell = document.createElement("td");
            nameCell.innerHTML = allergen.name;
            row.appendChild(nameCell);

var levelCell = document.createElement("td");
levelCell.innerHTML = allergen.level.toFixed(2);
console.log(allergen);
row.appendChild(levelCell);

        });

        wrapper.appendChild(table);
    }

    return wrapper;
},

    scheduleUpdate: function(delay) {
        var nextLoad = this.config.updateInterval;
        if (typeof delay !== "undefined" && delay >= 0) {
            nextLoad = delay;
        }

        var self = this;
        setTimeout(function() {
            self.sendSocketNotification("FETCH_FORECAST", self.config);
        }, nextLoad);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "FORECAST_RESULT") {
            this.processForecast(payload);
        }
    },

    processForecast: function(data) {
        this.forecast = data.forecast[0].allergens.filter(allergen => 
            allergen.level > 0 && 
            (this.config.displayedAllergens.length === 0 || this.config.displayedAllergens.includes(allergen.name))
        );
        this.loaded = true;
        this.updateDom(this.config.animationSpeed);
    },
});
