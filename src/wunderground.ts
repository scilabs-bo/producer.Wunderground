import Debug from 'debug';
import { URL } from 'url';
import config from './config';
import {
    Observation,
    CurrentConditionsResponse,
    QualityControlStatus,
} from './models/wunderground';
import { WundergroundAPIError } from './exceptions';
import got, { HTTPError } from 'got';

// Setup debug for logging
const debug = Debug('producer:wunderground');

// Currently only current conditions endpoint is implemented
export async function getCurrentConditions(
    stationId: string,
): Promise<Observation> {
    debug(
        "Requesting current conditions for station id '%s' from weather underground API",
        stationId,
    );
    const endpointUrl = constructEndpointUrl(stationId);
    try {
        let apiResponse = await got(endpointUrl.toString()).json();

        const adaptedResponse = CurrentConditionsResponse.adapt(
            apiResponse as any,
        );
        warnOnQCError(stationId, adaptedResponse);
        return adaptedResponse.observations[0];
    } catch (e) {
        if (e instanceof HTTPError)
            throw new WundergroundAPIError(
                e.response.statusCode,
                `Request to wunderground api failed with status code ${e.response.statusCode}`,
            );
        throw e;
    }
}

function constructEndpointUrl(stationId: string): URL {
    const url = new URL('https://api.weather.com/v2/pws/observations/current');
    url.searchParams.append('stationId', stationId);
    url.searchParams.append('format', 'json');
    url.searchParams.append('numericPrecision', 'decimal');
    url.searchParams.append('units', 's'); // Metric SI units
    url.searchParams.append('apiKey', config.get('key'));
    return url;
}

function warnOnQCError(
    stationId: string,
    adaptedResponse: CurrentConditionsResponse,
) {
    if (
        adaptedResponse.observations[0].qcStatus !== QualityControlStatus.Passed
    ) {
        debug(
            'The observation from station %s might be incorrect, quality control reported non-passing status %d',
            stationId,
            adaptedResponse.observations[0].qcStatus,
        );
    }
}
