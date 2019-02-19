

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
	console.log("One Failed Request has been sent to the crypt.")
	var undeadRequest = JSON.parse(req.body.result.Message.split("SelfHealing:")[1]);	
	dao.get("crypt").push(undeadRequest).write();
	var item = dao.get("crypt").find({ method: "PATCH"}).value();
	console.log(item);
	logger.info(req.body);
	res.send();
	
});


app.listen(config.express.port);