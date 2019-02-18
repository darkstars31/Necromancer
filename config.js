var config = {
	express: {
		port: 7777
	}
	
}
config.log4jsConfig = {
        appenders: { api: { type: 'file', filename: 'api.log' } },
        categories: { default: { appenders: ['api'], level: 'error' } }
        }

module.exports = config;