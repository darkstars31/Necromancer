
var express = require('express');
var app     = express();
var helmet = require('helmet');
var log4js = require('log4js');
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded());

var config = {
	express: {
		port: 7777
	},
	http: app
}

config.log4jsConfig = {
        appenders: { api: { type: 'file', filename: 'api.log' } },
        categories: { default: { appenders: ['api'], level: 'error' } }
	}

config.logger = log4js.getLogger('api');
log4js.configure(config.log4jsConfig);
	
// Console Log Override to include Timestamps
originalLog = console.log;console.log = function(){var args=[].slice.call(arguments); originalLog.apply(console.log,[getCurrentDateString()].concat(args));};
function getCurrentDateString(){return(new Date()).toISOString().substring(0,19)+' ::';};

module.exports = config;