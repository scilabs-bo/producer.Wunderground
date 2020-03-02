import { Point, NormalizedGeoJson } from './point';
import {
    Normalizable,
    NormalizedObject,
    NormalizedPrimitiveObject,
} from './context';
import { ValueError } from '../exceptions';

// https://github.com/smart-data-models/dataModel.Weather/blob/master/WeatherObserved/doc/spec.md
export class WeatherObserved implements Normalizable {
    public id: string;
    public dataProvider?: URL;
    public name?: string;
    private _location?: Point;
    private _address?: string;
    public dateObserved: Date;
    public source?: string | URL;
    public refDevice?: string;
    public refPointOfInterest?: string;
    public weatherType?: WeatherType[];
    public dewPoint?: number;
    public visibility?: Visibility;
    public temperature?: number;
    private _relativeHumidity?: number;
    public precipitation?: number;
    private _windDirection?: number;
    public windSpeed?: number;
    public atmosphericPressure?: number;
    public pressureTendency?: Tendency | number;
    public solarRadiation?: number;
    public illuminance?: number;
    public streamGauge?: number;
    public snowHeight?: number;

    get location(): Point | undefined {
        return this._location;
    }

    set location(value: Point | undefined) {
        if (value === undefined && this._address === undefined) {
            throw new ValueError(
                'If address is undefined the location property is mandatory.',
            );
        }
        this._location = value;
    }

    get address(): string | undefined {
        return this._address;
    }

    set address(value: string | undefined) {
        if (value === undefined && this._location === undefined) {
            throw new ValueError(
                'If location is undefined the address property is mandatory.',
            );
        }
        this._address = value;
    }

    get relativeHumidity(): number | undefined {
        return this._relativeHumidity;
    }

    set relativeHumidity(value: number | undefined) {
        if (value !== undefined && (value < 0 || value > 1)) {
            throw new ValueError(
                `Relative humidity must be a number between 0 and 1. This is not the case for value '${value}'.`,
            );
        }
        this._relativeHumidity = value;
    }

    get windDirection(): number | undefined {
        return this._windDirection;
    }

    set windDirection(value: number | undefined) {
        if (value !== undefined && (value < 0 || value >= 360)) {
            throw new ValueError(
                `Wind direction is measured in decimal degrees. The value '${value}' is either in another unit or not modulo reduced.`,
            );
        }
        this._windDirection = value;
    }

    constructor(id: string, dateObserved: Date, position: Point | string) {
        this.id = id;
        this.dateObserved = dateObserved;
        if (position instanceof Point) {
            this.location = position;
        } else {
            this.address = position;
        }
    }

    normalize(): NormalizedWeatherObserved {
        return {
            id: this.id,
            type: 'WeatherObserved',
            dataProvider:
                this.dataProvider !== undefined
                    ? { type: 'URL', value: this.dataProvider.href }
                    : undefined,
            name:
                this.name !== undefined
                    ? { type: 'Text', value: this.name }
                    : undefined,
            location:
                this.location !== undefined
                    ? this.location.normalize()
                    : undefined,
            address:
                this.address !== undefined
                    ? { type: 'Text', value: this.address }
                    : undefined,
            dateObserved: {
                type: 'DateTime',
                value: this.dateObserved.toISOString(),
            },
            source:
                this.source !== undefined
                    ? this.source instanceof URL
                        ? { type: 'URL', value: this.source.href }
                        : { type: 'Text', value: this.source }
                    : undefined,
            refDevice:
                this.refDevice !== undefined
                    ? { type: 'Relationship', value: this.refDevice }
                    : undefined,
            refPointOfInterest:
                this.refPointOfInterest !== undefined
                    ? { type: 'Relationship', value: this.refPointOfInterest }
                    : undefined,
            weatherType:
                this.weatherType !== undefined
                    ? { type: 'Text', value: this.weatherType.join() }
                    : undefined,
            dewPoint:
                this.dewPoint !== undefined
                    ? { type: 'Number', value: this.dewPoint }
                    : undefined,
            visibility:
                this.visibility !== undefined
                    ? { type: 'Text', value: this.visibility }
                    : undefined,
            temperature:
                this.temperature !== undefined
                    ? { type: 'Number', value: this.temperature }
                    : undefined,
            relativeHumidity:
                this.relativeHumidity !== undefined
                    ? { type: 'Number', value: this.relativeHumidity }
                    : undefined,
            precipitation:
                this.precipitation !== undefined
                    ? { type: 'Number', value: this.precipitation }
                    : undefined,
            windDirection:
                this.windDirection !== undefined
                    ? { type: 'Number', value: this.windDirection }
                    : undefined,
            windSpeed:
                this.windSpeed !== undefined
                    ? { type: 'Number', value: this.windSpeed }
                    : undefined,
            atmosphericPressure:
                this.atmosphericPressure !== undefined
                    ? { type: 'Number', value: this.atmosphericPressure }
                    : undefined,
            pressureTendency:
                this.pressureTendency !== undefined
                    ? typeof this.pressureTendency === 'number'
                        ? { type: 'Number', value: this.pressureTendency }
                        : { type: 'Text', value: this.pressureTendency }
                    : undefined,
            solarRadiation:
                this.solarRadiation !== undefined
                    ? { type: 'Number', value: this.solarRadiation }
                    : undefined,
            illuminance:
                this.illuminance !== undefined
                    ? { type: 'Number', value: this.illuminance }
                    : undefined,
            streamGauge:
                this.streamGauge !== undefined
                    ? { type: 'Number', value: this.streamGauge }
                    : undefined,
            snowHeight:
                this.snowHeight !== undefined
                    ? { type: 'Number', value: this.snowHeight }
                    : undefined,
        };
    }
}

export enum WeatherType {
    ClearNight = 'clearNight',
    SunnyDay = 'sunnyDay',
    SlightlyCloudy = 'slightlyCloudy',
    PartlyCloudy = 'partlyCloudy',
    Mist = 'mist',
    Fog = 'fog',
    HighClouds = 'highClouds',
    Cloudy = 'cloudy',
    VeryCloudy = 'veryCloudy',
    Overcast = 'overcast',
    LightRainShower = 'lightRainShower',
    Drizzle = 'drizzle',
    LightRain = 'lightRain',
    HeavyRainShower = 'heavyRainShower',
    HeavyRain = 'heavyRain',
    SleetShower = 'sleetShower',
    Sleet = 'sleet',
    HailShower = 'hailShower',
    Hail = 'hail',
    Shower = 'shower',
    LightSnow = 'lightSnow',
    Snow = 'snow',
    HeavySnowShower = 'heavySnowShower',
    HeavySnow = 'heavySnow',
    ThunderShower = 'thunderShower',
    Thunder = 'thunder',
}

export enum Visibility {
    VeryPoor = 'veryPoor',
    Poor = 'poor',
    Moderate = 'moderate',
    Good = 'good',
    VeryGood = 'veryGood',
    Excellent = 'excellent',
}

export enum Tendency {
    Raising = 'raising',
    Falling = 'falling',
    Steady = 'steady',
}

export type NormalizedWeatherObserved = NormalizedObject & {
    id: string;
    dataProvider: NormalizedPrimitiveObject | undefined;
    name: NormalizedPrimitiveObject | undefined;
    location: NormalizedGeoJson | undefined;
    address: NormalizedPrimitiveObject | undefined;
    dateObserved: NormalizedPrimitiveObject;
    source: NormalizedPrimitiveObject | undefined;
    refDevice: NormalizedPrimitiveObject | undefined;
    refPointOfInterest: NormalizedPrimitiveObject | undefined;
    weatherType: NormalizedPrimitiveObject | undefined;
    dewPoint: NormalizedPrimitiveObject | undefined;
    visibility: NormalizedPrimitiveObject | undefined;
    temperature: NormalizedPrimitiveObject | undefined;
    relativeHumidity: NormalizedPrimitiveObject | undefined;
    precipitation: NormalizedPrimitiveObject | undefined;
    windDirection: NormalizedPrimitiveObject | undefined;
    windSpeed: NormalizedPrimitiveObject | undefined;
    atmosphericPressure: NormalizedPrimitiveObject | undefined;
    pressureTendency: NormalizedPrimitiveObject | undefined;
    solarRadiation: NormalizedPrimitiveObject | undefined;
    illuminance: NormalizedPrimitiveObject | undefined;
    streamGauge: NormalizedPrimitiveObject | undefined;
    snowHeight: NormalizedPrimitiveObject | undefined;

    [key: string]:
        | string
        | NormalizedObject
        | NormalizedPrimitiveObject
        | undefined;
};
