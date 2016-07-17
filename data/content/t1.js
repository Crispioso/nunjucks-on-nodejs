/** Data model for T1 page **/

var Promise	= require('promise'),
	fetch 	= require('node-fetch');

module.exports = function (data) {
	var dataModel = {
	  "intro": {
	    "title": "",
	    "markdown": ""
	  },
	  "headlineFigures": [
	    {
	      "title": "",
	      "uri": "",
	      "data": []
	    }
	  ],
	  "serviceMessage": "",
	  "type": "",
	  "uri": "",
	  "description": {
	    "title": "",
	    "summary": "",
	    "keywords": [
	      "statistics",
	      "economy",
	      "census",
	      "population",
	      "inflation",
	      "employment"
	    ],
	    "metaDescription": "",
	    "unit": "",
	    "preUnit": "",
	    "source": ""
	  }
	};

	var resolveData = function(url) {
		return new Promise(function(resolve, reject) {
			fetch(url)
				.then(function(res) {
		        return res.json();
		    }).then(function(responseJSON) {
		        return responseJSON;
		    }).catch(function(response) {
		    	console.log(response);
		    	res.send('Error');
		    });
		});
	};

	var promise = new Promise(function(resolve, reject) {
		resolveData('https://www.ons.gov.uk/economy/data')
		.then(function(res) {
			console.log(res);
		}).catch(function(response) {
			console.log("Error resolving uri: ", response)
		});
	});

	return promise;
}