/** Data model for T4 page **/

module.exports = function (data) {

    // Dependencies
    var Promise = require('promise'),
        fetch = require('node-fetch');

    // Define the address of my data API
    var baseAPIUrl = 'http://localhost:8082',
        dataEndpoint = '/data?uri=';

    // Array of resolved data
    var resolvedData = [];

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

    // Resolve breadcrumb
    function getBreadcrumb(path) {
        // var breadcrumbArr = path.split('/'),
        //     i,
        //     tempArray = [];
        //
        // for (i = 0; i < breadcrumbArr.length; i++) {
        //     console.log(breadcrumbArr[i]);
        //     if ((breadcrumbArr[i] !== 'bulletins') || (breadcrumbArr[i] !== '') || (breadcrumbArr[i] !== breadcrumbArr[breadcrumbArr.length])) {
        //         tempArray.push(breadcrumbArr[i]);
        //     } else if ((breadcrumbArr[i] !== '')) {
        //         tempArray.push('Home')
        //     }
        // }

        // console.log(tempArray);
    }
    getBreadcrumb(data.uri);


    // var breadcrumb = createBreadcrumb(data.url);
    // console.log(breadcrumb);
    // var createBreadcrumb = function() {
    //
    //     // return new Promise(function() {
    //     //     fetch(baseAPIUrl + '/taxonomy').then(function(res) {
    //     //         return res.json();
    //     //     }).then(function(response) {
    //     //
    //     //     }).catch(function(err) {
    //     //         console.log(err);
    //     //     })
    //     // });
    // };

    // /* Our data model for passing back to the template for rendering */
    var pageDataModel = data;
    // // Add in array for resolved sections (ie time series data)
    // // pageDataModel.sectionsResolved = [];
    //
    /* Resolving headline data */
    var dataCount = data.sections.length,
        i = 0,
        dataPromises = [];
    // //
    // // for (i; i < dataCount; i++) {
    // //     var thisPromise = resolveData("https://www.ons.gov.uk" + data.sections[i].statistics.uri + '/data');
    // //     dataPromises.push(thisPromise);
    // //     thisPromise.then(function (response) {
    // //         var resolvedData = {
    // //             title: response.description.title,
    // //             uri: response.uri,
    // //             data: {
    // //                 years: response.years,
    // //                 quarters: response.quarters,
    // //                 months: response.months
    // //             }
    // //         };
    // //         pageDataModel.sectionsResolved.push(resolvedData);
    // //     }).catch(function (err) {
    // //         console.log(err);
    // //     })
    // // }
    //
    // var updatedDataModel = new Promise(function(resolve, reject){
    //     Promise.all(dataPromises).then(function () {
    //         resolve(pageDataModel);
    //     }, function (reason) {
    //         console.log(reason);
    //         reject(reason);
    //     });
    // });

    // Resolve navigation
    var navigation = resolveData(baseAPIUrl + '/taxonomy');
    dataPromises.push(navigation);
    navigation.then(function(navigationJson) {
        pageDataModel['taxonomy'] = navigationJson;
    });


    var updatedDataModel = new Promise(function(resolve, reject){
        Promise.all(dataPromises).then(function () {
            resolve(pageDataModel);
        }, function (reason) {
            console.log(reason);
            reject(reason);
        });
    });

    // var updateDataModel = new Promise(function(resolve, reject) {
    //     resolve(pageDataModel);
    // });

    // Return the promise for resolving and updating the data model
    return updatedDataModel;
};
