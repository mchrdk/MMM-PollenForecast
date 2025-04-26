/* global Module, Log */

Module.register("MMM-PollenForecast", {
    defaults: {
        updateInterval: 60 * 60 * 1000, // 1 hour
        retryDelay: 5000,
        location: "48", // Default location key (e.g., 48 = Copenhagen)
        pollenTypeWhitelist: [], // If empty, show all
        displayedAllergens: [],
        animationSpeed: 1000
    },

    start: function () {
        Log.info(this.name + " started.");
        this.forecast = [];
        this.loaded = false;
        this.getData();
        this.scheduleUpdate();
    },

    getStyles: function () {
        return ["MMM-PollenForecast.css"];
    },

    getIntervalLabel: function(level, intervals) {
        if (!intervals || typeof level !== 'number' || isNaN(level)) return "?";
        if (level <= intervals[0]) return "Ingen";
        if (level <= intervals[1]) return "Lav";
        if (level <= intervals[2]) return "Moderat";
        if (level <= intervals[3]) return "Høj";
        if (level > intervals[3]) return "Meget høj";
        return "?";
    },

    getLevelClass: function(level, intervals) {
        if (!intervals || typeof level !== 'number' || isNaN(level)) return "pollen-no-data";
        if (level <= intervals[0]) return "pollen-very-low";
        if (level <= intervals[1]) return "pollen-low";
        if (level <= intervals[2]) return "pollen-medium";
        if (level <= intervals[3]) return "pollen-high";
        if (level > intervals[3]) return "pollen-high";
        return "pollen-no-data";
    },

    getAllergenRow: function(allergen) {
        const row = document.createElement("tr");
        row.className = "small";
        let name = allergen.pollentype;
        if (typeof name === "object" && name.name) {
            name = name.name;
        }
        name = name || allergen.id;
        const intervals = allergen.intervals;
        const label = this.getIntervalLabel(allergen.level, intervals);

        // Allergen name
        const nameCell = document.createElement("td");
        nameCell.className = "align-left allergen-name";
        nameCell.textContent = name;
        row.appendChild(nameCell);

        // Level
        const levelCell = document.createElement("td");
        levelCell.className = "align-center allergen-level";
        levelCell.textContent = allergen.level;
        row.appendChild(levelCell);

        // Label
        const labelCell = document.createElement("td");
        labelCell.className = "align-right allergen-label";
        labelCell.textContent = label;
        row.appendChild(labelCell);

        return row;
    },

    getAllergenIconUrl: function(name) {
        // Use the lowercase, no-space version of the name for the icon URL
        const base = "https://www.astma-allergi.dk/resources/pollen-icons/";
        // Remove special chars and spaces, add 'Icon.png'
        let iconName = name.toLowerCase().replace(/[^a-zæøå0-9]/gi, "").replace(/ /g, "");
        return `${base}${iconName}Icon.png`;
    },

    getAllergenLine: function(allergen) {
        let name = allergen.pollentype;
        if (typeof name === "object" && name.name) {
            name = name.name;
        }
        name = name || allergen.id;
        const intervals = allergen.intervals;
        const label = this.getIntervalLabel(allergen.level, intervals);
        const levelClass = this.getLevelClass(allergen.level, intervals);
        const iconUrl = this.getAllergenIconUrl(name);
        return { text: `${name}(${allergen.level}) ${label}`, className: levelClass, iconUrl };
    },

    getDom: function () {
        const wrapper = document.createElement("div");

        if (!this.loaded) {
            wrapper.innerHTML = "Loading...";
            wrapper.className = "dimmed light small";
            return wrapper;
        }

        if (!this.forecast.length) {
            wrapper.innerHTML = "No pollen data available.";
            return wrapper;
        }

        this.forecast.forEach((allergen) => {
            const lineInfo = this.getAllergenLine(allergen);
            const line = document.createElement("div");
            line.className = `small ${lineInfo.className}`;
            // Add icon
            const icon = document.createElement("img");
            icon.src = lineInfo.iconUrl;
            icon.alt = "";
            icon.style.width = "20px";
            icon.style.height = "20px";
            icon.style.verticalAlign = "middle";
            icon.style.marginRight = "6px";
            line.appendChild(icon);
            // Add text
            line.appendChild(document.createTextNode(lineInfo.text));
            wrapper.appendChild(line);
        });
        return wrapper;
    },

    getData: function () {
        Log.info(this.name + ": Requesting pollen data...");
        this.sendSocketNotification("POLLEN_GET_DATA", {
            location: this.config.location,
            pollenTypeWhitelist: this.config.pollenTypeWhitelist
        });
    },

    scheduleUpdate: function (delay) {
        let nextLoad = this.config.updateInterval;
        if (typeof delay !== "undefined" && delay >= 0) {
            nextLoad = delay;
        }
        setTimeout(() => {
            this.getData();
        }, nextLoad);
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "POLLEN_DATA") {
            this.processForecast(payload);
        } else if (notification === "POLLEN_ERROR") {
            Log.error(this.name + ": Error fetching pollen data: " + payload);
            this.loaded = true;
            this.forecast = [];
            this.updateDom(this.config.animationSpeed);
        }
    },

    processForecast: function (data) {
        // Data is already filtered by node_helper
        if (Array.isArray(data)) {
            this.forecast = data;
        } else {
            this.forecast = [];
        }
        this.loaded = true;
        this.updateDom(this.config.animationSpeed);
    }
});
