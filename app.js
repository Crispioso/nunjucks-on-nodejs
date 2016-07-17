/** NodeJS server **/

var express     = require('express'),
    app         = express(),
    nunjucks    = require('nunjucks') ,
    fetch 		= require('node-fetch'),
    Promise		= require('promise');

fetch.Promise 	= require('bluebird');

// Import data models for pages
var t1 = require('./data/content/t1.js');

// Define port to run server on
var port = 9000 ;

// Configure Nunjucks
var _templates = 'templates';
nunjucks.configure( _templates, {
    autoescape: true,
    cache: false,
    express: app
});

// Set Nunjucks as rendering engine for pages with .html suffix
app.engine( 'html', nunjucks.render ) ;
app.set( 'view engine', 'html' ) ;

function buildPageModel() {
	t1().then(function(response) {
			console.log(response);
		}).catch(function(err) {
			console.log(err);
		});
};

function renderPage(res, path) {
	var url = "https://www.ons.gov.uk" + (path ? path + '/data' : '/data');

	fetch(url)
	    .then(function(res) {
	    	// console.log(res.json());
	        return res.json();
	    }).then(function(json) {
	    	buildPageModel();
	        res.render('index.html', json);
	    }).catch(function(response) {
	    	console.log(response);
	    	res.send('Error');
	    });
}

function returnData(res, path) {
	var url = "https://www.ons.gov.uk" + (path ? path + '/data' : '/data');

	console.log('Call to API');

	fetch(url)
	    .then(function(res) {
	        return res.json();
	    }).then(function(json) {
	        res.send(json);
	    }).catch(function(response) {
	    	console.log(response);
	    	res.send('Error');
	    });
}

// Response to GET at root
app.get( '/', function( req, res ) {
	renderPage(res);
});

// Handle request for favicon
app.get( '/favicon.ico', function( req, res ) {
	console.log('no favicon');
});

// Get static pattern library files
app.use("/node_modules/sixteens", express.static(__dirname + '/node_modules/sixteens'));

// Respond to request to /data enpoint
app.get('*/data', function(req, res) {
	returnData(res, req.originUrl);
});

// Respond to all GET requests by rendering relevant data ONS API
app.get( '/*', function( req, res ) {
	var path =  req.originalUrl;
	console.log(path);
	renderPage(res, path);
});

// Start server
app.listen( port ) ;
console.log( 'Listening on port %s...', port ) ;