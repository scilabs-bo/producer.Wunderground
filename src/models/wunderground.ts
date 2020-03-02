import { WeatherObserved } from './weather';
import { Point } from './point';

export enum QualityControlStatus {
    Unknown = -1,
    PossiblyIncorrect = 0,
    Passed = 1,
}

export class Observation {
    public stationID = '';
    public latitude: number | null = null;
    public longitude: number | null = null;
    public elevation: number | null = null;
    public neighborhood: string | null = null;
    public country: string | null = null;
    public softwareType: string | null = null;
    public qcStatus: QualityControlStatus = QualityControlStatus.Unknown;
    public observationTime: Date | null = null;
    public realtimeFrequency: number | null = null;
    public solarRadiation: number | null = null;
    public uv: number | null = null;
    public windDirection: number | null = null;
    public humidity: number | null = null;
    public temperature: number | null = null;
    public heatIndex: number | null = null;
    public dewPoint: number | null = null;
    public windChill: number | null = null;
    public windSpeed: number | null = null;
    public windGust: number | null = null;
    public pressure: number | null = null;
    public precipitationRate: number | null = null;
    public precipitationTotal: number | null = null;

    static adapt(rawObservation: RawObservation): Observation {
        const observation = new Observation();
        observation.stationID = rawObservation.stationID;
        observation.latitude = rawObservation.lat;
        observation.longitude = rawObservation.lon;
        observation.elevation = rawObservation.metric_si.elev; // m
        observation.neighborhood = rawObservation.neighborhood;
        observation.country = rawObservation.country;
        observation.softwareType = rawObservation.softwareType;
        observation.qcStatus = rawObservation.qcStatus;
        observation.observationTime =
            rawObservation.obsTimeUtc != null
                ? new Date(rawObservation.obsTimeUtc)
                : null; // obsTimeUtc is ISO formatted datetime
        observation.realtimeFrequency = rawObservation.realtimeFrequency;
        observation.solarRadiation = rawObservation.solarRadiation; // W / m²
        observation.uv = rawObservation.uv; // UV index
        observation.windDirection = rawObservation.winddir; // °
        observation.humidity =
            rawObservation.humidity != null
                ? rawObservation.humidity / 100
                : null; // observation.humidity is between 0 and 100, take care of the percentage sign
        observation.temperature = rawObservation.metric_si.temp; // °C
        observation.heatIndex = rawObservation.metric_si.heatIndex; // °C
        observation.dewPoint = rawObservation.metric_si.dewpt; // °C
        observation.windChill = rawObservation.metric_si.windChill; // °C
        observation.windSpeed =
            rawObservation.metric_si.windSpeed != null
                ? rawObservation.metric_si.windSpeed
                : null; // m / s
        observation.windGust =
            rawObservation.metric_si.windGust != null
                ? rawObservation.metric_si.windGust
                : null; // m / s
        observation.pressure = rawObservation.metric_si.pressure; // mb converted to hPa (factor: 1)
        observation.precipitationRate = rawObservation.metric_si.precipRate; // mm converted to l / m² (factor: 1)
        observation.precipitationTotal = rawObservation.metric_si.precipTotal; // mm converted to l / m² (factor: 1)
        return observation;
    }

    toWeatherObserved(): WeatherObserved {
        const weatherObserved = new WeatherObserved(
            `urn:ngsi-ld:WeatherObserved:${this.stationID}`,
            this.observationTime || new Date(),
            new Point(
                this.latitude || 0,
                this.longitude || 0,
                this.elevation || 0,
            ),
        );
        weatherObserved.dataProvider = new URL(
            'https://api.weather.com/v2/pws/observations/current',
        );

        // Weather data
        weatherObserved.dewPoint =
            this.dewPoint !== null ? this.dewPoint : undefined;
        weatherObserved.temperature =
            this.temperature !== null ? this.temperature : undefined;
        weatherObserved.relativeHumidity =
            this.humidity !== null ? this.humidity : undefined;
        weatherObserved.precipitation =
            this.precipitationRate !== null
                ? this.precipitationRate
                : undefined;
        weatherObserved.windDirection =
            this.windDirection !== null ? this.windDirection : undefined;
        weatherObserved.windSpeed =
            this.windSpeed !== null ? this.windSpeed : undefined;
        weatherObserved.atmosphericPressure =
            this.pressure !== null ? this.pressure : undefined;
        weatherObserved.solarRadiation =
            this.solarRadiation !== null ? this.solarRadiation : undefined;

        return weatherObserved;
    }
}

export class CurrentConditionsResponse {
    public observations: Observation[] = [];

    static adapt(response: {
        observations: RawObservation[];
    }): CurrentConditionsResponse {
        return {
            observations: response.observations.map(obs =>
                Observation.adapt(obs),
            ),
        };
    }
}

type RawObservation = {
    country: string | null;
    epoch: number | null;
    humidity: number | null;
    lat: number | null;
    lon: number | null;
    neighborhood: string | null;
    obsTimeLocal: string | null;
    obsTimeUtc: string | null;
    qcStatus: number;
    realtimeFrequency: number | null;
    softwareType: string | null;
    solarRadiation: number | null;
    stationID: string;
    uv: number | null;
    winddir: number | null;
    metric_si: {
        dewpt: number | null;
        elev: number | null;
        heatIndex: number | null;
        precipRate: number | null;
        precipTotal: number | null;
        pressure: number | null;
        temp: number | null;
        windChill: number | null;
        windGust: number | null;
        windSpeed: number | null;
    };
};
