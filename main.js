
var config  	= require("./config");
var _dao 		= require("./dao");
var process 	= require('process')
var _httpClient	= require("request-promise");
var uuid 		= require('uuid');
var childProc = require('child_process');
var _logger  	= config._logger;
var helmet 		= require("helmet");
var express 	= require("express");
var app     	= express();

app.use(helmet(),express.json());

console.log(`Necromancer Service is up on port: ${config.express.port}`);

app.post("/v1/crypt", (req, res, next) => {
	try{
		if(!req.body.destination){
			req.body.destination = req.headers.host;
		}
		console.log(req.body);
		var undeadRequest = BuildDBGhoul(req.body);
		if(undeadRequest){
			_dao.get("crypt").push(undeadRequest).write();
		}
		console.log(`Incoming request [${undeadRequest.uid}] has been sent to the crypt. Source Application: ${undeadRequest.sourceApplication}`)	
		_logger.info(req.body);
	} catch(e) {
		console.error(`Incoming Request failed; RequestBody: ${req.body.result} Stack:`, e);
		_logger.error(req.body.result,e);
	}

	res.send();
});

app.post("/v1/deployhook", (req, res, next) => {
	try {
		var unprocessedGhoul = JSON.parse(req.body.result.Message.split("SelfHealing:")[1]);
		unprocessedGhoul.destination = requestBody.result.dest[0];
		unprocessedGhoul.sourceName = requestBody.result.SourceName;
		var undeadRequest = BuildDBGhoul(unprocessedGhoul);
		if(undeadRequest){
			_dao.get("crypt").push(undeadRequest).write();
		}
		console.log(`Incoming request [${undeadRequest.uid}] has been sent to the crypt. Source Application: ${undeadRequest.sourceApplication}`)	
		_logger.info(req.body);
	} catch(e) {
		console.error(`Incoming Request failed; RequestBody: ${req.body.result} Stack:`, e);
		_logger.error(req.body.result,e);
	}

	res.send();
	
});

app.get("/crypt", (req,res,next) => {
	let dataset = null;
	if(Object.entries(req.query).length === 0 && req.query.constructor === Object){
		dataset = _dao.get("crypt").value();
	} else {
		dataset = _dao.get("crypt").find(req.query).value();
	}
	
	if(!dataset){
		res.status(404).send("Not Found");		
	}
	res.send(dataset);
});

app.get("/resurrect", (req,res,next) => {
	var cryptDB = _dao.get("crypt").value();
	console.log(`Resurrecting ${cryptDB.length} Ghouls from the Crypt.`);
	let successfullyProcessed = 0;
	let failedProcessed = 0;
	cryptDB.forEach( (item,index) => {
		ProcessGhoul(item).then((result) => {
			_dao.get("crypt").remove(item).write();
			successfullyProcessed++;
		}).catch( err => {
			failedProcessed++;
			_dao.get("crypt").find(item).assign({ retryAttempts: item.retryAttempts + 1}).write();			
			_logger.error(`Failed to send request [${item.uid}] to ${item.url} because StatusCode: ${err.statusCode} ${err.response.statusMessage}`);
		}).finally(() =>{
			if(index == cryptDB.length -1){
				res.send({SuccessfulRequests: successfullyProcessed, FailedRequests: failedProcessed });
			}
		});		
	});
});

app.get("/self-update", (req,res,next) => {
	_logger.info(`Self-Update Initiated. Getting Latest from Github and restarting the service.`);
	childProc.exec('C:\selfhealing\Necromancer\GetLatest.bat', function(err, stdout, strerr) {});
	res.send();
});

function ProcessGhoul(item) {
	let httpOptions = {
		method: item.httpMethod,
		uri: "https://"+item.url,
		body: item.JsonPayLoad,
		json: true
	};
	if(item.jsonHeaders){
		httpOptions.headers = item.jsonHeaders;
	}
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
	return _httpClient(httpOptions);
}

function BuildDBGhoul(unprocessedRequest) {
	let ghoul = {
		uid: uuid.v1(),
		sourceApplication: unprocessedRequest.SourceName,
		url:  buildUrl(unprocessedRequest),
		httpMethod: unprocessedRequest.HttpMethod,
		payLoad: unprocessedRequest.JsonPayLoad,
		jsonHeaders: unprocessedRequest.JsonHeaders != null ? unprocessedRequest.JsonHeaders : {},
		jsonFailureStack: unprocessedRequest.JsonFailureStack,
		date: new Date().toISOString().substring(0,19),
		retryAttempts: 0
	};
	return ghoul;
}

function buildUrl(unprocessedRequest){
	if(unprocessedRequest.destination.charAt(unprocessedRequest.destination.length - 1) != "/" && unprocessedRequest.Url.charAt(0) != "/"){
		unprocessedRequest.destination += "/";
	}
	return unprocessedRequest.destination + unprocessedRequest.Url;
}




app.listen(config.express.port);