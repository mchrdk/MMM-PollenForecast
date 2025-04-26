# MMM-PollenForecast

This is a MagicMirror² module that displays pollen forecast information on your smart mirror. It retrieves data from the Astma-Allergi pollen API and provides a visual representation of pollen levels for various allergens.

## Installation

1. Navigate to the `modules` folder of your MagicMirror² installation.
2. Run the following command to clone the module repository:
   ```
   git clone https://github.com/mchrdk/MMM-PollenForecast.git
   ```
3. Install the required dependencies by running the following command:
   ```
   cd MMM-PollenForecast
   npm install
   ```

## Configuration

To use this module, add it to the modules array in the `config/config.js` file of your MagicMirror² installation.

```javascript
{
    module: "MMM-PollenForecast",
    position: "<desired_position>",
    config: {
        // Configuration options
    }
}
```

### Options

The following configuration options are available for MMM-PollenForecast:

| Option                 | Description                                                                                 |
|------------------------|---------------------------------------------------------------------------------------------|
| `updateInterval`       | Update interval for fetching new data, specified in milliseconds.                           |
| `retryDelay`           | Delay before retrying a failed API request, specified in milliseconds.                      |
| `location`             | The location key to retrieve pollen forecast data for (see `locations.json` for options).   |
| `pollenTypeWhitelist`  | An array of allergen IDs or names to be displayed. If empty, all allergens will be shown.   |

### Default Configuration

The following is the default configuration for MMM-PollenForecast:

```javascript
defaults: {
    updateInterval: 60 * 60 * 1000, // Update every 1 hour
    retryDelay: 5000,
    location: "48", // Default location key (e.g., 48 = Copenhagen)
    pollenTypeWhitelist: [], // Allergens to be displayed. If empty, all are displayed
    displayedAllergens: [],
    animationSpeed: 1000
}
```

## Data Source

This module fetches pollen data from the Astma-Allergi pollen API (https://www.astma-allergi.dk/umbraco/api/pollenapi/getpollenfeed). The data is processed and filtered based on your configuration.

## Code Structure

- The code for requesting and parsing pollen data is separated into `pollenApi.js` for maintainability.
- The main module logic is in `MMM-PollenForecast.js` and `node_helper.js`.

## Usage

Once installed and configured, the MMM-PollenForecast module will display the pollen forecast information on your MagicMirror². The module will automatically fetch the forecast data at the specified `updateInterval` and display the allergens according to their respective pollen levels.

## License

This module is licensed under the [MIT License](LICENSE).

## Credits

- MMM-PollenForecast was created by [Your Name](https://github.com/mchrdk).

## Acknowledgements

- This module uses data from the Astma-Allergi pollen API (https://www.astma-allergi.dk/umbraco/api/pollenapi/getpollenfeed).