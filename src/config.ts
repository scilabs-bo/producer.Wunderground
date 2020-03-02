import convict from 'convict';

const config = convict({
    key: {
        doc: 'Wunderground API key',
        format(val: string) {
            if (!/^[a-f0-9]{32}$/.test(val)) {
                throw new Error(
                    'Weather Underground API keys are 32 character hex strings',
                );
            }
        },
        default: '',
        env: 'PRODUCER_WUNDERGROUND_API_KEY',
    },
    broker: {
        doc: 'Context broker url',
        format: 'url',
        default: 'http://orion:1026',
        env: 'PRODUCER_CONTEXT_BROKER_URL',
    },
    weatherStations: {
        doc:
            'A comma-separated list of wunderground weather station ids to produce context information for',
        format: String,
        default: '',
        env: 'PRODUCER_WEATHER_STATION_IDS',
    },
    pollInterval: {
        doc:
            'Poll interval used when gathering context data from weather underground',
        format: 'nat',
        default: 60,
        env: 'PRODUCER_POLL_INTERVAL',
    },
});
// Validate configuration before exporting to prevent configuration errors
config.validate({ strict: true });
export default config;
