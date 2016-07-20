/** NodeJS server **/

var express     = require('express'),
    app         = express(),
    nunjucks    = require('nunjucks'),
    fetch 		= require('node-fetch'),
    Promise		= require('promise');

fetch.Promise 	= require('bluebird');

// Import data models for pages
var t1 = require('./data/content/t1.js');
var t4 = require('./data/content/t4.js');

// Define port to run server on
var port = 9000 ;

// Define the address of my data API
var baseAPIUrl = 'http://localhost:8082',
    dataEndpoint = '/data?uri=';

// Configure Nunjucks
var _templates = 'templates';
nunjucks.configure( _templates, {
    autoescape: true,
    cache: false,
    express: app
});

// Set Nunjucks as rendering engine for pages with .html suffix
app.engine( 'html', nunjucks.render );
app.set( 'view engine', 'html' );

// Controller for which template page data to resolve and load into template
function pageDataController(json) {
	return new Promise(function(resolve, reject) {
		var templateData;

		switch (json.type) {
			case 'home_page': {
				t1(json).then(function(pageDataModel) {
					templateData = pageDataModel;
					resolve(templateData);
				});
				break;
			}
            case 'bulletin': {
                t4(json).then(function(pageDataModel) {
                    templateData = pageDataModel;
                    resolve(templateData);
                });
                break;
            }
			default: {
				console.log('no template for page type "' + json.type + '"');
				templateData = json;
				resolve(templateData);
			}
		}
	});
}

// Functions to render HTML or raw data
function renderPage(res, path) {
    var cleanPath = path ? path : '/';
    var url = baseAPIUrl + dataEndpoint + cleanPath;

	fetch(url)
	    .then(function(res) {
	        return res.json();
	    }).then(function(json) {
			pageDataController(json).then(function(resolvedData) {
				res.render('index.html', resolvedData);
			});
	    }).catch(function(response) {
	    	console.log(response);
	    	res.send('Error');
	    });
}

function returnData(res, path) {
    var cleanPath = path ? path.replace('/data', '') : '/';
    var url = baseAPIUrl + dataEndpoint + cleanPath;

	console.log('Call to public API');

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

function returnTemplateData(res, path) {
    var cleanPath = path ? path.replace('/templatedata', '') : '/';
    var url = baseAPIUrl + dataEndpoint + cleanPath;

	console.log('Call to template data API');

	fetch(url)
		.then(function(res) {
			return res.json();
		}).then(function(json) {
			pageDataController(json).then(function(resolvedData) {
				res.send(resolvedData);
			});
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
    res.send('favicon here');
});

// Get static files
app.use("/node_modules/sixteens", express.static(__dirname + '/node_modules/sixteens'));
app.use("/assets", express.static(__dirname + '/assets'));

// Respond to requst to /templatedata endpoint (ie data being used in template)
app.get('*/templatedata', function(req, res) {
	returnTemplateData(res, req.originalUrl);
});

// Respond to request to /data endpoint
app.get('*/data', function(req, res) {
	returnData(res, req.originalUrl);
});

// Respond to all GET requests by rendering relevant data ONS API
app.get( '/*', function( req, res ) {
	var path =  req.originalUrl;
	console.log('Navigating to: ' + path);
	renderPage(res, path);
});

// Start server
app.listen( port ) ;
console.log( 'Listening on port %s...', port ) ;