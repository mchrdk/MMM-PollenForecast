# MMM-PollenForecast

This is a MagicMirror² module that displays pollen forecast information on your smart mirror. It retrieves data from the Pollentjek API (https://pollentjek.dk/api/middleware/pollen) and provides a visual representation of pollen levels for various allergens.

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

| Option              | Description                                                                     |
| ------------------- | ------------------------------------------------------------------------------- |
| `updateInterval`    | Update interval for fetching new data, specified in milliseconds.               |
| `retryDelay`        | Delay before retrying a failed API request, specified in milliseconds.           |
| `station`           | The default station to retrieve pollen forecast data for.                       |
| `displayedAllergens`| An array of allergens to be displayed. If empty, all allergens will be displayed.|
| `stationIds`        | An object that maps station names to their respective station IDs.               |
| `apiBase`           | The base URL of the Pollentjek API.                                             |

### Default Configuration

The following is the default configuration for MMM-PollenForecast:

```javascript
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
}
```

## Dependencies

This module requires the following dependencies:

- [xmlhttprequest](https://www.npmjs.com/package/xmlhttprequest)

These dependencies will be automatically installed when running the `npm install` command in the module's directory.

## Usage

Once installed and configured, the MMM-PollenForecast module will display the pollen forecast information on your MagicMirror².

The module will automatically fetch the forecast data at the specified `updateInterval` and display the allergens according to their respective pollen levels.

## License

This module is licensed under the [MIT License](LICENSE).

## Credits

- MMM-PollenForecast was created by [Your Name](https://github.com/mchrdk).

## Acknowledgements

- This module uses data from the Pollentjek API (https://pollentjek.dk/api/middleware/pollen).