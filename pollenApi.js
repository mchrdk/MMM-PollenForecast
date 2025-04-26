const https = require("https");
const fs = require("fs");
const path = require("path");
const pollentypes = JSON.parse(fs.readFileSync(path.join(__dirname, "PollenTypes.json"), "utf8"));
const locations = require("./locations.json");

function parsePollenFeed(jsonData, today) {
  const result = [];
  const feedEntries = jsonData.fields;
  for (const entryKey in feedEntries) {
    const entry = feedEntries[entryKey].mapValue.fields;
    const date = entry.date?.stringValue;
    if (date !== today) continue;
    const data = entry.data?.mapValue.fields;
    const allergens = [];
    for (const allergenKey in data) {
      const allergen = data[allergenKey].mapValue.fields;
      const inSeason = allergen.inSeason?.booleanValue || false;
      if (!inSeason) continue;
      allergens.push({
        id: allergenKey,
        pollentype: pollentypes[allergenKey]?.name || allergenKey,
        intervals: pollentypes[allergenKey]?.intervals || null,
        level: parseInt(allergen.level?.integerValue ?? '-1', 10),
        inSeason,
        overrides: allergen.overrides?.arrayValue?.values?.map(v => v.stringValue) || []
      });
    }
    if (allergens.length > 0) {
      result.push({
        date,
        locationId: entryKey,
        location: locations[entryKey]?.name || entryKey,
        region: locations[entryKey]?.region || '',
        allergens
      });
    }
  }
  return result;
}

function requestPollenData(today, callback) {
  const url = "https://www.astma-allergi.dk/umbraco/api/pollenapi/getpollenfeed";
  https.get(url, { headers: { "User-Agent": "MMM-PollenForecast/1.0" } }, (res) => {
    let data = "";
    res.on("data", chunk => { data += chunk; });
    res.on("end", () => {
      try {
        const json = JSON.parse(JSON.parse(data));
        callback(null, json);
      } catch (err) {
        callback(err);
      }
    });
  }).on("error", (err) => {
    callback(err);
  });
}

function requestPollenDataMOCKUP(today, callback) {
  const fs = require("fs");
  const path = require("path");
  const mockFile = path.join(__dirname, "mockPollenFeed.json");
  fs.readFile(mockFile, "utf8", (err, data) => {
    if (err) {
      callback(err);
      return;
    }
    try {
      const json = JSON.parse(data);
      callback(null, json);
    } catch (e) {
      callback(e);
    }
  });
}

module.exports = { parsePollenFeed, requestPollenData, requestPollenDataMOCKUP };