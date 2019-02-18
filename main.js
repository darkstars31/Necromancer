
var config  = require('./config');
var dao 	= require('./dao');
var logger  = config.logger;
var app = config.http;


console.log(`Necromancer Service is up on port: ${config.express.port}`);

app.post("/v1/deployhook", (req, res, next) => {
	console.log("One Failed Request has been sent to the crypt.")
	
	logger.info(req.body);
	
});


app.listen(config.express.port);