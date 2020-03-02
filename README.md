# FIWARE Context Producer for the Weather Underground API

## General

This context producer serves as a bridge between the orion context broker and the weather underground API. This allows one to include weather station data from weather underground in NGSIv2 entities. The context producer is configured via environment variables. The definition of the data model `WeatherObserved` used by the producer is part of the Smart Data Models and can be looked up [here](https://github.com/smart-data-models/dataModel.Weather/blob/master/WeatherObserved/doc/spec.md).

## Getting started

The context provider can be retrieved from the [docker hub](https://hub.docker.com/r/smartcitylab2050/producer.wunderground). Use the following command to spin up a new container named `wunderground`:

```
docker run -d --name wunderground `
    -e DEBUG=producer:* `
    -e PRODUCER_WUNDERGROUND_API_KEY=<API key> `
    -e PRODUCER_WEATHER_STATION_IDS=<Station ids> `
    smartcitylab2050/producer.wunderground
```

For all given station ids there must be an entity with id `urn:ngsi-ld:WeatherObserved:<Station id>` of type `WeatherObserved` created beforehand as the producer will only update already existing entities incrementally.

## Environment variables

The context producer is configured using environment variables. By default, only the `PRODUCER_WUNDERGROUND_API_KEY` and `PRODUCER_WEATHER_STATION_IDS` is required to spin up an instance of the context producer with a poll interval of 60 seconds reporting to http://orion:1026.

| Key                           |    Default Value    | Description                                                               |
| ----------------------------- | :-----------------: | ------------------------------------------------------------------------- |
| PRODUCER_WUNDERGROUND_API_KEY |       _none_        | Weather underground API key                                               |
| PRODUCER_CONTEXT_BROKER_URL   | `http://orion:1026` | Base url of the context broker to report to                               |
| PRODUCER_WEATHER_STATION_IDS  |       _none_        | Comma-separated list of all station ids to monitor                        |
| PRODUCER_POLL_INTERVAL        |        `60`         | Poll interval in seconds                                                  |
| DEBUG                         |       _none_        | Debug log filter (set to `producer:*` to print all producer related logs) |

## Attributes provided

The following attributes can be queried from the context provider. Have a look at the API documentation [here](https://docs.google.com/document/d/1eKCnKXI9xnoMGRRzOL1xPCBihNV2rOet08qpE_gArAY/edit) for more information about the attributes. All attributes with units are converted to SI base units to match the default units of the [WeatherObserved data model](https://github.com/smart-data-models/dataModel.Weather/blob/master/WeatherObserved/doc/spec.md).

-   `atmosphericPressure`
-   `dataProvider`
-   `dewPoint`
-   `location`
-   `precipitation`
-   `relativeHumidity`
-   `solarRadiation`
-   `temperature`
-   `windDirection`
-   `windSpeed`
