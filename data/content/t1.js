/** Data model for T1 page **/

module.exports = function (data) {

    // Dependencies
    var Promise = require('promise'),
        fetch = require('node-fetch');

    // Define the address of my data API
    var baseAPIUrl = 'http://localhost:8082',
        dataEndpoint = '/data?uri=';

    // Our function to resolve any data we need from another page
    var resolveData = function (url) {
        return new Promise(function (resolve, reject) {
            fetch(url)
                .then(function (res) {
                    return res.json();
                }).then(function (responseJSON) {
                resolve(responseJSON);
            }).catch(function (response) {
                reject(response);
            });
        });
    };

    /* Our data model for passing back to the template for rendering */
    var pageDataModel = data;
    // Add in array for resolved sections (ie time series data)
    pageDataModel.sectionsResolved = [];

    /* Resolving headline data */
    var dataCount = data.sections.length,
        i = 0,
        dataPromises = [];

    for (i; i < dataCount; i++) {
        console.log(baseAPIUrl + dataEndpoint + data.sections[i].statistics.uri);
        var thisPromise = resolveData(baseAPIUrl + dataEndpoint + data.sections[i].statistics.uri);
        dataPromises.push(thisPromise);
        thisPromise.then(function (response) {
            var resolvedData = {
                title: response.description.title,
                uri: response.uri,
                data: {
                    years: response.years,
                    quarters: response.quarters,
                    months: response.months
                }
            };
            pageDataModel.sectionsResolved.push(resolvedData);
        }).catch(function (err) {
            console.log(err);
        })
    }

    var updatedDataModel = new Promise(function(resolve, reject){
        Promise.all(dataPromises).then(function () {
            resolve(pageDataModel);
        }, function (reason) {
            console.log(reason);
            reject(reason);
        });
    });

    // Return the promise for resolving and updating the data model
    return updatedDataModel;
};