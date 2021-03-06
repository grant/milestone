#!/bin/env node
// Import New Relic monitoring
require('newrelic');


 //  OpenShift sample Node application
var express = require('express'),
    fs = require('fs'),
    http = require('http'),
    url = require('url'),
    request = require('request'),
    dataProcessing = require('./data-processing'),
    coursera = require('./coursera'),
    Parse = require('parse-api').Parse;

var APP_ID = "APP_ID";
var MASTER_KEY = "MASTER_KEY";

// Needed to avoid UNABLE_TO_VERIFY_LEAF_SIGNATURE
// see http://stackoverflow.com/questions/18461979/node-js-error-with-ssl-unable-to-verify-leaf-signature
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var app = new Parse(APP_ID, MASTER_KEY);

var GitHubApi = require("github");

var github = new GitHubApi({
    // required
    version: "3.0.0",
    // optional
    timeout: 5000
});

github.authenticate({
    type: "oauth",
    token: "ab318f2ae66271313791fd19766770900dc30055"
});

/**
 *  Define the sample application.
 */
var SampleApp = function () {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.												 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function () {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP || process.env.IP;
        self.port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        }
    };
    
    self.cacheCourseraCourseList = function() {
        
        coursera.fetchCourseList(github);
    }

    /*  ================================================================  */
    /*  App server functions (main app logic here).					   */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function () {
        self.routes = {};

        self.routes['/AddSearchQuery'] = function (req, res) {

            app.find('userInfo', {
                UserID: res.req.query['userID']
            }, function (err, response) {

                response.results[0].SearchTerms.push(res.req.query['searchTerm']);

                app.update('userInfo',
                    response.results[0].objectId, {
                        SearchTerms: response.results[0].SearchTerms
                    },
                    function (err, response) {

                        // in response we will get the time at which we updated this data.
                    });
            });

            res.send("");
        };

        /*
		 *  getUserSearchQueries
			----------------------------------
			returns the searchQueries of a particular user.
		 *  requestType : tells what you need. The number of occurences or the items themselves.
						  It can be "count" or "item"
		 *
		 *  searchItem  : tells what item to search for . If it is set to * than it will consider all the items.
		 *
		 *
		*/
        self.routes['/getUserSearchQueries'] = function (req, res) {

            app.find('userInfo', {
                UserID: res.req.query['userID']
            }, function (err, response) {

                if (res.req.query['requestType'] == "count" && res.req.query['searchItem'] == "*") {
                    console.log(response.results[0].SearchTerms.length);
                    res.send(response.results[0].SearchTerms.length);
                } else if (res.req.query['requestType'] == "count" && res.req.query['searchItem'] != "*") {
                    var count = 0;
                    for (var i = 0; i < response.results[0].SearchTerms.length; i++) {
                        if (response.results[0].SearchTerms[i] == res.req.query['searchItem']) {
                            count++;
                        }
                    }
                    console.log(count);
                    res.send(count);
                } else if (res.req.query['requestType'] == "items" && res.req.query['searchItem'] == "*") {
                    res.send(response.results[0].SearchTerms);
                    console.log(response.results[0].SearchTerms);
                }
            });

        }

        self.routes['/AddUserInfo'] = function (req, res) {

            app.find('userInfo', {
                UserID: res.req.query['userID']
            }, function (err, response) {

                // If we will not do this , the searchTerm array can be updated to new which will result
                // in losing all the other searchterms that user searched for

                if (response.results.length == 0) {
                    // if there is no such person in Parse Database than insert one.

                    var user = {
                        UserID: res.req.query['userID'],
                        UserName: res.req.query['username'],
                        SearchTerms: Array(),
                    };

                    app.insert('userInfo', user, function (err, response) {
                        res.send(response);
                    });
                }
            });
            res.send("");
        };
        
        self.routes['/api/coursera/search'] = function (req, res) {
               var keyword = req.query.keyword;
               res.send(coursera.searchCourse(keyword));
        }

        self.routes['/api'] = function (req, res) {
            var view = res;
            // Setup
            var url_parts = url.parse(req.url, true);
            var params = url_parts.query;
            // Response
            var query = params.query;
            
            // Save search terms to Google Docs see htpp://goo.gl/jiFbXO for results
            request({
                url: 'https://script.google.com/macros/s/AKfycbxpsFuwDlkrXIpBxWh-pIeAhTz4Qk2qa6MYOii0qbeG7keDKmQ/exec?Query=' + encodeURIComponent(query) + '&IPAddress=' + req.ip
            });
            
            view.contentType('json');
            var gists = res;

            var found = false;
            
            var lowerCaseQuery = query.toLowerCase();
            var index = {};
            var INDEX_GIST_ID = "b3ebe9e3d4be62623cd8"; // ID of the index file: https://gist.github.com/milestoneapp/b3ebe9e3d4be62623cd8
            
            github.gists.get({
                id: INDEX_GIST_ID
            }, function (err, res) {
                if (err) console.log(err);
                index = JSON.parse(res.files.index.content);
                
                if (lowerCaseQuery in index) {
                    // If gist is there for the search query, then use its data
                    var cacheGistId = index[lowerCaseQuery];
                    github.gists.get({
                        id: cacheGistId
                    }, function (err, res) {
                        if (err) console.log(err);
                        var cachedArkSearchResults = JSON.parse(res.files.milestone.content);
                        var curation = "";
                        if ("curation" in res.files) {
                            curation = res.files.curation.content;
                        }
                        view.send({searchResults: cachedArkSearchResults, curation: curation});
                    });
                } else {
                    // if gist doesn't exist then do a new ark search query and cache results in a gist and add gist ID to the index
                    request({
                        url: 'https://testapi.ark.com/strong-search?raw.headline=' + query,
                        headers: {
                            api_token: "446fbc1c-29c9-46a0-be25-3d77f1538a68",
                            index: "li_idx",
                            page: 0,
                            size: 500
                        },
                        timeout: 10000
                    },
                    function (err, response, body) {
                        if (err) throw err;
                        var result = dataProcessing.process(JSON.parse(body));
                        // Create gist
                        github.gists.create({
                            description: lowerCaseQuery,
                            public: "false",
                            files: {
                                'milestone': {
                                    "content": JSON.stringify(result)
                                }
                            }
                        }, function (err, gist) {
                            if (err) console.log(err);
                            index[lowerCaseQuery] = gist.id;
                            github.gists.edit({
                                id: INDEX_GIST_ID,
                                files: {
                                    'index': {
                                        "content": JSON.stringify(index)
                                    }
                                }
                            }, function (err, gist) {
                                if (err) console.log(err);
                                
                            });
                        });
                        view.send({searchResults: result, curation: ""});
                    });
                }
            });

        };
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function () {
        self.createRoutes();
        self.app = express();
        self.app.set('view engine', 'hbs');
        self.app.use(express.static(__dirname + '/static'));
        self.app.enable('trust proxy')

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function () {
        self.setupVariables();
        
        // Store the list of coursera courses
        self.cacheCourseraCourseList();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function () {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function () {
            console.log('%s: Node server started on %s:%d ...',
                Date(Date.now()), self.ipaddress, self.port);
        });
    };

}; /*  Sample Application.  */

/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();
zapp.createRoutes();