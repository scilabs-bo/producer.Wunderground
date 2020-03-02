import Debug from 'debug';
import config from './config';
import workerFarm from 'worker-farm';
import { NormalizedWeatherObserved } from './models/weather';

const debug = Debug('producer:main');
const workers = workerFarm(require.resolve('./worker'));

let previousObservations: { [key: string]: NormalizedWeatherObserved } = {};

debug('Starting context producer for the weather underground platform');
debug(
    "Configured to produce context information for the station ids '%s'",
    config.get('weatherStations'),
);
debug(
    'Delivering context information every %s seconds to the context broker under %s',
    config.get('pollInterval'),
    config.get('broker'),
);

setInterval(invokeWorkers, config.get('pollInterval') * 1000);
invokeWorkers();

function invokeWorkers() {
    debug('Invoking workers for all configured weather stations');
    if (config.get('weatherStations')) {
        config
            .get('weatherStations')
            .split(',')
            .forEach(stationId => {
                workers(
                    stationId.trim(),
                    previousObservations[stationId],
                    (err: any, current: NormalizedWeatherObserved) => {
                        if (err) {
                            debug(
                                'Worker for station id %s produced an error while running',
                                stationId,
                            );
                            debug(err);
                        } else {
                            previousObservations[stationId] = current;
                        }
                    },
                );
            });
    }
}
