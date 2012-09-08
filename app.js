
/**
 * Module dependencies.
 */

var express = require('express')
  , MongoDB = require('mongodb')
  , routes  = {
		index: require('./routes/index'),
		report: require('./routes/report')
	};

var app = module.exports = express.createServer();
var db = null;

// Configuration

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(function(req, res, next) {
		// attach db to req so routes have access to it
		req.db = db;
		next();
	});
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

	var mongoServer = new MongoDB.Server( 'localhost', 27017 );
	db = MongoDB.Db( 'badtxtr', mongoServer );
	db.open(function(err) {
		// establish our connection to the database
		app.listen(3000, function(){
		  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
		});
	});
});
/*
app.configure('development', function(){
  
});

app.configure('production', function(){
  app.use(express.errorHandler());
});
*/

// Routes
app.post( '/report/', routes.report.submit );
app.get( '/fetch/', routes.report.fetch );

app.get( '/', routes.index.show );


