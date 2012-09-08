
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = {
		index: require('./routes/index'),
		report: require('./routes/report')
	};

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
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
app.get( '/', routes.index.show );

app.listen(3000, function(){
  console.log(routes);
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
