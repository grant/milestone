#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs = require('fs');
var http = require('http');
var url = require('url');
var request = require('request');
var dataProcessing = require('./data-processing');

var Parse = require('parse-api').Parse;

var APP_ID = "APP_ID";
var MASTER_KEY = "MASTER_KEY";

var app = new Parse(APP_ID, MASTER_KEY);

var oldIndexHTML = 'oldindex.html';

/**
 *  Define the sample application.
 */
var SampleApp = function() {

	//  Scope.
	var self = this;


	/*  ================================================================  */
	/*  Helper functions.												 */
	/*  ================================================================  */

	/**
	 *  Set up server IP address and port # using env variables/defaults.
	 */
	self.setupVariables = function() {
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
	self.populateCache = function() {
		if (typeof self.zcache === "undefined") {
			self.zcache = { oldIndexHTML: '' };
		}

		//  Local cache for static content.
        self.zcache[oldIndexHTML] = fs.readFileSync(oldIndexHTML);
		self.zcache['index.html'] = fs.readFileSync('index.html');
	};


	/**
	 *  Retrieve entry (content) from cache.
	 *  @param {string} key  Key identifying content to retrieve from cache.
	 */
	self.cache_get = function(key) { return self.zcache[key]; };


	/**
	 *  terminator === the termination handler
	 *  Terminate server on receipt of the specified signal.
	 *  @param {string} sig  Signal to terminate on.
	 */
	self.terminator = function(sig){
		if (typeof sig === "string") {
		   console.log('%s: Received %s - terminating sample app ...', Date(Date.now()), sig);
		   process.exit(1);
		}
		console.log('%s: Node server stopped.', Date(Date.now()) );
	};


	/**
	 *  Setup termination handlers (for exit and a list of signals).
	 */
	self.setupTerminationHandlers = function(){
		//  Process on exit and signals.
		process.on('exit', function() { self.terminator(); });

		// Removed 'SIGPIPE' from the list - bugz 852598.
		['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
		 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
		].forEach(function(element, index, array) {
			process.on(element, function() { self.terminator(element); });
		});
	};


	/*  ================================================================  */
	/*  App server functions (main app logic here).					   */
	/*  ================================================================  */

	/**
	 *  Create the routing table entries + handlers for the application.
	 */
	self.createRoutes = function() {
		self.routes = { };

		self.routes['/AddSearchQuery'] = function(req, res) {

			app.find('userInfo',{UserID:res.req.query['userID']}, function (err, response) {

				response.results[0].SearchTerms.push(res.req.query['searchTerm']);

				app.update('userInfo',
                    response.results[0].objectId,
                    {SearchTerms:response.results[0].SearchTerms},
                    function(err,response){

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
		self.routes['/getUserSearchQueries'] = function(req, res) {

			app.find('userInfo',{UserID:res.req.query['userID']}, function (err, response) {

					if(res.req.query['requestType'] == "count" && res.req.query['searchItem']=="*")
					{
						console.log(response.results[0].SearchTerms.length);
						res.send(response.results[0].SearchTerms.length);
					}
					else if(res.req.query['requestType'] == "count" && res.req.query['searchItem']!="*")
					{
						var count = 0;
						for(var i=0;i<response.results[0].SearchTerms.length;i++)
						{
							if(	response.results[0].SearchTerms[i] == res.req.query['searchItem'])
							{
								count++;
							}
						}
						console.log(count);
						res.send(count);
					}
					else if(res.req.query['requestType'] == "items" && res.req.query['searchItem']=="*")
					{
						res.send(response.results[0].SearchTerms);
						console.log(response.results[0].SearchTerms);
					}
				});

		}

		self.routes['/AddUserInfo'] = function(req, res) {

			app.find('userInfo',{UserID:res.req.query['userID']}, function (err, response) {

				// If we will not do this , the searchTerm array can be updated to new which will result
				// in losing all the other searchterms that user searched for

				 if(response.results.length==0) {
					 // if there is no such person in Parse Database than insert one.

					var user = {
						UserID	  : res.req.query['userID'],
						UserName	: res.req.query['username'],
						SearchTerms : Array(),
					};

					app.insert('userInfo', user, function (err, response) {
					  res.send(response);
					});
				 }
			});
			res.send("");
		};

        // Old index
        self.routes['/oldindex.html'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get(oldIndexHTML) );
        };

        // New index
		self.routes['/'] = function(req, res) {
			res.setHeader('Content-Type', 'text/html');
			res.send(self.cache_get('index.html') );
		};

		self.routes['/api'] = function(req, res) {
			// Setup
			var url_parts = url.parse(req.url, true);
			var params = url_parts.query;

			// Response
			var query = params.query;

			// Save query
			request(
            {
                url : 'https://script.google.com/macros/s/AKfycbxpsFuwDlkrXIpBxWh-pIeAhTz4Qk2qa6MYOii0qbeG7keDKmQ/exec?Query=' + encodeURIComponent(query)
            });

			request(
            {
                url : 'https://testapi.ark.com/strong-search?raw.headline=' + query,
                headers : {
                    api_token: "446fbc1c-29c9-46a0-be25-3d77f1538a68",
                    index: "li_idx",
                    page: 0,
                    size: 50
                },
                timeout: 5000
            },
            function (err, response, body) {
                if (err) throw err;
                var result = dataProcessing.process(JSON.parse(body));
                res.contentType('json');
                // Uncomment this out to get real data
                // result = {"industries":[{"name":"aviation and aerospace","count":33},{"name":"defense and space","count":23},{"name":"marketing and advertising","count":7},{"name":"airlines/aviation","count":6},{"name":"accounting","count":4}],"location":[{"name":"houston, texas area","count":8},{"name":"cologne area, germany","count":6},{"name":"united states","count":3},{"name":"united kingdom","count":3},{"name":"beijing city, china","count":3}],"schools":[{"name":"florida state university","count":3},{"name":"lewis and clark college","count":2},{"name":"santa clara university","count":2},{"name":"imperial college london","count":2},{"name":"fontys hogescholen","count":2}],"majors":[{"name":"physics","count":5},{"name":"mechanical engineering","count":4},{"name":"aerospace engineering","count":3},{"name":"electrical engineering","count":2},{"name":"computer science","count":2}],"degrees":[{"name":"bs","count":8},{"name":"ms","count":5},{"name":"ba","count":4},{"name":"phd","count":4},{"name":"bachelor of science (bs)","count":3}],"titles":[{"name":"astronaut","count":63},{"name":"intern","count":6},{"name":"creative director","count":5},{"name":"engine and game structure engineer supervisor","count":4},{"name":"founder","count":4}],"companies":[{"name":"nasa","count":34},{"name":"rare ltd / microsoft","count":10},{"name":"self-employed","count":8},{"name":"nasa johnson space center","count":5},{"name":"dancing astronaut","count":4}],"skills":[{"name":"social media","count":12},{"name":"space systems","count":12},{"name":"spacecraft","count":10},{"name":"aerospace","count":9},{"name":"systems engineering","count":8}]};
                res.send(result);
            });
		};
	};


	/**
	 *  Initialize the server (express) and create the routes and register
	 *  the handlers.
	 */
	self.initializeServer = function() {
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
	self.initialize = function() {
		self.setupVariables();
		self.populateCache();
		self.setupTerminationHandlers();

		// Create the express server and routes.
		self.initializeServer();
	};


	/**
	 *  Start the server (starts up the sample application).
	 */
	self.start = function() {
		//  Start the app on the specific interface (and port).
		self.app.listen(self.port, self.ipaddress, function() {
			console.log('%s: Node server started on %s:%d ...',
						Date(Date.now() ), self.ipaddress, self.port);
		});
	};

};   /*  Sample Application.  */

/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();
zapp.createRoutes();