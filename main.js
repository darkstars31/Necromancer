
var config  = require("./config");
var dao 	= require("./dao");
var logger  = config.logger;
var helmet = require("helmet");
var express = require("express");
var app     = express();

app.use(helmet());
app.use(express.json());

console.log(`Necromancer Service is up on port: ${config.express.port}`);

app.post("/v1/deployhook", (req, res, next) => {
	try {
		var undeadRequest = BuildDBGhoul(req.body);
		if(undeadRequest){
			dao.get("crypt").push(undeadRequest).write();
		}
		console.log(`Incoming request has been sent to the crypt. Source Application: ${undeadRequest.sourceApplication}`)	
		logger.info(req.body);
	} catch(e) {
		console.error(`Incoming Request failed; RequestBody: ${req.body.result} Stack:`, e);
		logger.error(req.body.result,e);
	}

	res.send();
	
});

app.get("/crypt", (req,res,next) => {
	let dataset = null;
	console.log(req.query);
	if(Object.entries(req.query).length === 0 && req.query.constructor === Object){
		dataset = dao.get("crypt").value();
	} else {
		dataset = dao.get("crypt").find(req.query).value();
	}
	
	if(!dataset){
		res.status(404).send("Not Found");		
	}
	res.send(dataset);
});


function BuildDBGhoul(requestBody){
	var undeadRequest = JSON.parse(requestBody.result.Message.split("SelfHealing:")[1]);
	var ghoul = {
		sourceApplication: requestBody.result.SourceName,
		url: `${requestBody.result.dest}${undeadRequest.Url}`,
		httpMethod: undeadRequest.HttpMethod,
		payLoad: undeadRequest.JsonPayLoad,
		jsonHeaders: undeadRequest.JsonHeaders,
		jsonFailureStack: undeadRequest.JsonFailureStack,
		date: new Date().toISOString().substring(0,19),
		retryAttempts: 0
	};
	return ghoul;

}

app.listen(config.express.port);