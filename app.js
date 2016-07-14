/** NodeJS server **/

var express     = require('express'),
    app         = express(),
    nunjucks    = require('nunjucks') ,
    fetch 		= require('node-fetch');

fetch.Promise 	= require('bluebird');

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

function renderPage(res, path) {
	var url = "https://www.ons.gov.uk" + (path ? path + '/data' : '/data');

	fetch(url)
	    .then(function(res) {
	        return res.json();
	    }).then(function(json) {
	        res.render('index.html', json);
	    }).catch(function(response) {
	    	console.log(response);
	    	res.send('Error');
	    });
}

// Response to GET at root
app.get( '/', function( req, res ) {
	console.log('root');
	renderPage(res);
});

// Respond to all GET requests by rendering relevant data ONS API
app.get( '/*', function( req, res ) {
	console.log(req.originalUrl);
	var path =  req.originalUrl;
	renderPage(res, path);
});

// Start server
app.listen( port ) ;
console.log( 'Listening on port %s...', port ) ;