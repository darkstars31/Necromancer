
var config  = require('./config');
var express = require('express');
var log4js  = require('log4js');
var app     = express();
var helmet = require('helmet');
var http = require('request-promise');

var logger = log4js.getLogger('api');
log4js.configure(config.log4jsConfig);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded());

console.info(`Webhook Service is up on port: ${config.express.port}`);

app.post("/v1/webhook", (req, res, next) => {

	var options = {
				method: "POST",
				uri: ``,
				body: {	value1: req.body.search_name },
				json: true
			};
			http(options).then((result)=> {console.log('Notification Triggered: '+ req.body.search_name + ' @ ' + new Date().toUTCString())})
			.catch((e) => { logger.error("Error Sending Notification: " + req.body.search_name)});
			
	res.send("true");
});

app.post("/v1/deployhook", (req, res, next) => {
	console.log(req.body);
	logger.error(req.body);
	var registeredProjects = {
		SplunkWebhook: {
			location: "C:\selfhealing\SplunkWebhook"
		}
	};

	
});


app.listen(config.express.port);