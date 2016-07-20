/** Data model for T4 page **/

module.exports = function (data) {

    // Dependencies
    var Promise     = require('promise'),
        fetch       = require('node-fetch'),
        slugify     = require('slug'),
        markdownIt      = require('markdown-it')({
            breaks: true
        });

    // Define the address of my data API
    var baseAPIUrl = 'http://localhost:8082';

    // Set markdown options


    // Our function to resolve any data we need from another page
    var resolveData = function (url) {
        return new Promise(function (resolve, reject) {
            console.time('resolve');
            fetch(url)
                .then(function (res) {
                    console.timeEnd('resolve');
                    console.time('turn to json');
                    return res.json();
                }).then(function (responseJSON) {
                    console.timeEnd('turn to json');
                    resolve(responseJSON);
                }).catch(function (response) {
                    reject(response);
                });
        });
    };

    var pageDataModel = data;
    var dataPromises = [],
        buildNavPromises = [];

    /* UPDATE PAGE DATA OBJECT */

    // Breadcrumb
    var getBreadcrumb = resolveData(baseAPIUrl + '/parents?uri=' + data.uri);
    buildNavPromises.push(getBreadcrumb);

    // Navigation
    var getNavigation = resolveData(baseAPIUrl + '/taxonomy?depth=2');
    buildNavPromises.push(getNavigation);

    // Build navigation object
    var buildNavigation = new Promise(function(resolve, reject) {
        Promise.all(buildNavPromises).then(function (value) {
            var breadcrumbJson = value[0],
                navigationJson = value[1],
                i;

            for (i = 0; i < navigationJson.length; i++) {

                // Add flag whether navigation node is part of the active page path
                if (navigationJson[i].type === 'taxonomy_landing_page') {
                    navigationJson[i].isCurrentPage = navigationJson[i].uri == breadcrumbJson[1].uri;
                }

                // Do this for the children too
                if (navigationJson[i].children) {
                    var childI;
                    for (childI = 0; childI < navigationJson[i].children.length; childI++) {
                        if (navigationJson[i].children[childI].uri == breadcrumbJson[2].uri) {
                            navigationJson[i].children[childI].isCurrentPage = true;
                        } else {
                            navigationJson[i].children[childI].isCurrentPage = false;
                        }
                    }
                }
            }

            pageDataModel['globalNav'] = navigationJson;
            pageDataModel['breadcrumb'] = breadcrumbJson;
            resolve();
        }, function (reason) {
            console.log(reason);
            reject(reason);
        });
    });
    dataPromises.push(buildNavigation);

    // Set uri of latest release and previous releases list
    var uriArray = data.uri.split('/');
    uriArray.pop();
    var bulletinSeriesUri = uriArray.join('/');
    pageDataModel['latestReleaseUri'] = bulletinSeriesUri + '/latest';
    pageDataModel['previousReleasesUri'] = bulletinSeriesUri + '/previousReleases';

    //Build section ids & render makrdown
    var noOfSections = pageDataModel.sections.length,
        i;
    for (i = 0; i < noOfSections; i++) {
        pageDataModel.sections[i].slug = slugify(pageDataModel.sections[i].title).toLowerCase();
        pageDataModel.sections[i].html = markdownIt.render(pageDataModel.sections[i].markdown);
    }

    // Format dates
    var releaseDate = new Date(pageDataModel.description.releaseDate),
        monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    pageDataModel.description.formattedReleaseDate = releaseDate.getDate() + ' ' + monthNames[releaseDate.getMonth()] + ' ' + releaseDate.getFullYear();


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
