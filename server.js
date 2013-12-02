#!/bin/env node
 //  OpenShift sample Node application
var express = require('express'),
    fs = require('fs'),
    http = require('http'),
    url = require('url'),
    request = require('request'),
    dataProcessing = require('./data-processing'),
    Parse = require('parse-api').Parse;

var APP_ID = "APP_ID";
var MASTER_KEY = "MASTER_KEY";

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


    /**
     *  Populate the cache.
     */
    self.populateCache = function () {
        if (typeof self.zcache === "undefined") {
            self.zcache = {
                indexHTML: ''
            };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function (key) {
        return self.zcache[key];
    };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function (sig) {
        if (typeof sig === "string") {
            console.log('%s: Received %s - terminating sample app ...', Date(Date.now()), sig);
            process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()));
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function () {
        //  Process on exit and signals.
        process.on('exit', function () {
            self.terminator();
        });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
            'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function (element, index, array) {
            process.on(element, function () {
                self.terminator(element);
            });
        });
    };


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

        // New index
        self.routes['/'] = function (req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html'));
        };

        self.routes['/api'] = function (req, res) {
            var view = res;
            // Setup
            var url_parts = url.parse(req.url, true);
            var params = url_parts.query;
            // Response
            var query = params.query;
            // Log query
            request({
                url: 'https://script.google.com/macros/s/AKfycbxpsFuwDlkrXIpBxWh-pIeAhTz4Qk2qa6MYOii0qbeG7keDKmQ/exec?Query=' + encodeURIComponent(query)
            });
            view.contentType('json');
            //Get all gists 
            github.gists.getAll({}, function (err, res) {
                if (err) throw err;
                var gists = res;

                var found = false;
                for (var i = 0; i < gists.length; i++) {
                    var current = gists[i];
                    // If gist is there
                    if (current.description == query) {
                        found = true;
                        var queryId = current.id;
                        github.gists.get({
                            id: queryId
                        }, function (err, res) {
                            if (err) console.log(err);
                            view.send(res.files.milestone.content);
                        });
                    }
                    // gist doesn't exist
                    if (!found && i == gists.length - 1) {
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
                                    description: query,
                                    public: "false",
                                    files: {
                                        'milestone': {
                                            "content": JSON.stringify(result)
                                        }
                                    }
                                }, function (err, gist) {
                                    if (err) console.log(err);
                                });
                                view.send(result);
                            });
                    }
                }

            }); // End gists getAll

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
        self.populateCache();
        self.setupTerminationHandlers();

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