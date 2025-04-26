/* MagicMirror
 * Node Helper: MMM-PollenForecast
 */

const NodeHelper = require("node_helper");
const Log = require("logger");
const fs = require("fs");
const path = require("path");
const pollentypes = JSON.parse(fs.readFileSync(path.join(__dirname, "PollenTypes.json"), "utf8"));
const locations = require("./locations.json");
const { parsePollenFeed, requestPollenData: requestPollenData } = require("./pollenApi");

module.exports = NodeHelper.create({
  start: function () {
    Log.info(this.name + " node_helper started.");
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "POLLEN_GET_DATA") {
      this.getPollenData(payload);
    }
  },

  getPollenData: function (config) {
    let todayDate = new Date();
    // Normalize to DD-MM-YYYY with leading zeros, using UTC for robustness
    const pad = n => n.toString().padStart(2, '0');
    let today = `${pad(todayDate.getUTCDate())}-${pad(todayDate.getUTCMonth() + 1)}-${todayDate.getUTCFullYear()}`;
    if (config && config.today) today = config.today; // allow override for testing
    const tryDate = (dateStr, cb) => {
      requestPollenData(dateStr, (err, json) => {
        if (err) {
          cb(err, []);
          return;
        }
        try {
          const parsedFeed = parsePollenFeed(json, dateStr);
          // Filter by location if provided
          let filtered = parsedFeed;
          if (config && config.location) {
            filtered = filtered.filter(e => e.locationId === config.location);
          }
          // Filter by pollenTypeWhitelist if provided
          if (config && Array.isArray(config.pollenTypeWhitelist) && config.pollenTypeWhitelist.length > 0) {
            filtered = filtered.map(e => ({
              ...e,
              allergens: e.allergens.filter(a =>
                config.pollenTypeWhitelist.includes(a.id) ||
                config.pollenTypeWhitelist.includes(a.pollentype) ||
                (typeof a.pollentype === 'object' && config.pollenTypeWhitelist.includes(a.pollentype.name))
              )
            })).filter(e => e.allergens.length > 0);
          }
          const allergens = filtered.length > 0 ? filtered[0].allergens : [];
          cb(null, allergens);
        } catch (err) {
          cb(err, []);
        }
      });
    };
    tryDate(today, (err, allergens) => {
      if (!err && allergens && allergens.length > 0) {
        this.sendSocketNotification("POLLEN_DATA", allergens);
      } else {
        // Try yesterday
        let yesterdayDate = new Date(todayDate.getTime() - 24 * 60 * 60 * 1000);
        let yesterday = `${pad(yesterdayDate.getUTCDate())}-${pad(yesterdayDate.getUTCMonth() + 1)}-${yesterdayDate.getUTCFullYear()}`;
        tryDate(yesterday, (yErr, yAllergens) => {
          if (!yErr && yAllergens && yAllergens.length > 0) {
            this.sendSocketNotification("POLLEN_DATA", yAllergens);
          } else {
            // Don't show anything (send empty array)
            this.sendSocketNotification("POLLEN_DATA", []);
          }
        });
      }
    });
  }
});
