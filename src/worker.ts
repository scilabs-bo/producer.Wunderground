import { WorkerCallback } from 'worker-farm';
import Debug from 'debug';
import { getCurrentConditions } from './wunderground';
import { WeatherObserved, NormalizedWeatherObserved } from './models/weather';
import config from './config';
import got from 'got/dist/source';
import { URL } from 'url';

const debug = Debug('producer:worker');

module.exports = async function (
    stationId: string,
    previous: NormalizedWeatherObserved,
    callback: WorkerCallback,
) {
    debug("Worker for station id '%s' started successfully", stationId);
    try {
        let currentConditions = await getCurrentConditions(stationId);
        let current = currentConditions.toWeatherObserved();
        await reportToBroker(stationId, current, previous);
        callback(null, current.normalize(), null, null);
    } catch (e) {
        callback(e, null, null, null);
    }
};

async function reportToBroker(
    stationId: string,
    current: WeatherObserved,
    previous: NormalizedWeatherObserved,
) {
    let update = prepareUpdate(current, previous);
    if (update) {
        debug(
            "Delivering WeatherObserved object for station id '%s' to broker",
            stationId,
        );
        let updateUrl = buildUpdateUrl(stationId);
        await got(updateUrl.toString(), {
            method: 'POST',
            json: update[0],
        });
        for (let i = 0; i < update[1].length; i++) {
            let deleteAttribUrl = buildDeleteAttribUrl(stationId, update[1][i]);
            await got(deleteAttribUrl.toString(), {
                method: 'DELETE',
            });
        }
    }
}

function prepareUpdate(
    current: WeatherObserved,
    previous: NormalizedWeatherObserved,
): [Partial<NormalizedWeatherObserved>, string[]] | null {
    if (!previous) {
        let updateRequestBody = current.normalize();
        // ID and type are not allowed to be updated by this producer
        delete updateRequestBody.id;
        delete updateRequestBody.type;
        return [updateRequestBody, []];
    }
    if (current.id !== previous.id) {
        debug(
            "Mismatch between ids '%s' and '%s'. Unable to prepare update this interval",
            current.id,
            previous.id,
        );
        return null;
    }
    if (
        current.dateObserved.getTime() ===
        new Date(previous.dateObserved.value).getTime()
    ) {
        debug(
            "Nothing to update as the observation '%s' has not yet been updated",
            current.id,
        );
        return null;
    }

    let updateRequestBody: Partial<NormalizedWeatherObserved> = {};
    let currentNormalized = current.normalize();

    // Check for new and updated attributes
    for (let prop in currentNormalized) {
        if (
            currentNormalized.hasOwnProperty(prop) &&
            currentNormalized[prop] !== undefined &&
            (!previous.hasOwnProperty(prop) ||
                JSON.stringify(currentNormalized[prop]) !==
                    JSON.stringify(previous[prop]))
        ) {
            updateRequestBody[prop] = currentNormalized[prop];
        }
    }

    let removedAttributes: Array<string> = [];
    // Check for removed (or null / undefined) attributes
    for (let prop in previous) {
        if (
            previous.hasOwnProperty(prop) &&
            previous[prop] !== undefined &&
            (!currentNormalized.hasOwnProperty(prop) ||
                currentNormalized[prop] === undefined)
        ) {
            removedAttributes.push(prop);
        }
    }

    // Make sure ID and type are not returned
    delete updateRequestBody.id;
    delete updateRequestBody.type;
    return [updateRequestBody, removedAttributes];
}

function buildUpdateUrl(stationId: string) {
    return new URL(
        '/v2/entities/urn:ngsi-ld:WeatherObserved:' + stationId + '/attrs',
        config.get('broker'),
    );
}

function buildDeleteAttribUrl(stationId: string, attribute: string) {
    return new URL(
        '/v2/entities/urn:ngsi-ld:WeatherObserved:' +
            stationId +
            '/attrs/' +
            attribute,
        config.get('broker'),
    );
}
