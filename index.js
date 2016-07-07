'use strict'

var Moo = require("mootools"),
	path = require('path'),
	fs = require('fs'),
	request = require('request');
	//express = require('express'),
	//semver = require('semver'),
	//session = require('express-session');//for passport session
	////bodyParser = require('body-parser'),//json parse

	

var Logger = require('node-express-logger'),
	Authorization = require('node-express-authorization');
	//Authentication = require('node-express-authentication');



module.exports = new Class({
  Implements: [Options, Events],
  
  ON_LOAD_APP: 'onLoadApp',
  ON_USE: 'onUse',
  ON_USE_APP: 'onUseApp',
  
  app: null,
  uri: null,
  
  available_methods: ['put', 'patch', 'post', 'head', 'del', 'delete', 'get'],
  
  logger: null,
  authorization:null,
  //authentication: null,
  
  options: {
			
		id: '',
		path: '',
		
		scheme: 'http',
		url: '127.0.0.1',
		port: 8080,
		
		////logs : { 
			////path: './logs' 
		////},
		logs: null,
		
		//session: {
			////store: new SessionMemoryStore,
			////proxy: true,
			////cookie: { path: '/', httpOnly: true, maxAge: null },
			////cookie : { secure : false, maxAge : (4 * 60 * 60 * 1000) }, // 4 hours
			////session: {store: null, proxy: true, cookie: { path: '/', httpOnly: true, maxAge: null }, secret: 'keyboard cat'},
			//cookie: { path: '/', httpOnly: true, maxAge: null, secure: false },
			//secret: 'keyboard cat',
			//resave: true,
			//saveUninitialized: true
		//},
		
		//authentication: null,
		
		////authentication: {
			////users : [],
			////init: true
		////},
		
		////authorization: {
			////config: null,
			////init: true
		////},
		authorization: null,
		
		//params: {	  
		//},
		
		/**
		 * @content_type regex to restric allowed req.headers['content-type'], if undefined or '', allow all
		 * can be nested inside each route
		 * http://stackoverflow.com/questions/23190659/expressjs-limit-acceptable-content-types
		* */
		//content_type: /text\/plain/,
		
		/*routes: {
			
			get: [
				{
					path: '/:param',
					callbacks: ['check_authentication', 'get'],
					content_type: /text\/plain/,
				},
			],
			post: [
				{
				path: '',
				callbacks: ['', 'post']
				},
			],
			all: [
				{
				path: '',
				callbacks: ['', 'get']
				},
			]
			
		},*/
		
		/*api: {
			
			content_type: /^application\/(?:x-www-form-urlencoded|x-.*\+json|json)(?:[\s;]|$)/,
			
			//path: '/api',
			path: '',
			
			version: '0.0.0',
			
			versioned_path: false, //default false
			
			force_versioned_path: true, //default true, if false & version_path true, there would be 2 routes, filter with content-type
			
			accept_header: 'accept-version',
			
			routes: {
				get: [
					{
					path: '',
					callbacks: ['get_api'],
					content_type: /^application\/(?:x-www-form-urlencoded|x-.*\+json|json)(?:[\s;]|$)/,
					//version: '1.0.1',
					},
					{
					path: ':service_action',
					callbacks: ['get_api'],
					content_type: /^application\/(?:x-www-form-urlencoded|x-.*\+json|json)(?:[\s;]|$)/,
					version: '2.0.0',
					},
					{
					path: ':service_action',
					callbacks: ['get_api'],
					content_type: /^application\/(?:x-www-form-urlencoded|x-.*\+json|json)(?:[\s;]|$)/,
					version: '1.0.1',
					},
				],
				post: [
					{
					path: '',
					callbacks: ['check_authentication', 'post'],
					},
				],
				all: [
					{
					path: '',
					callbacks: ['get'],
					version: '',
					},
				]
				
			},*/
			
			/*doc: {
				'/': {
					type: 'function',
					returns: 'array',
					description: 'Return an array of registered servers',
					example: '{"username":"lbueno","password":"40bd001563085fc35165329ea1ff5c5ecbdbbeef"} / curl -v -L -H "Accept: application/json" -H "Content-type: application/json" -X POST -d \' {"user":"something","password":"app123"}\'  http://localhost:8080/login'

				}
			},
		},*/
  },
  initialize: function(options){
		
		this.setOptions(options);//override default options
		
		//var app = express();
		this.app = request;
		
		this.uri = this.options.scheme+'://'+this.options.url+':'+this.options.port;
		
		////app.use(bodyParser.urlencoded({ extended: false }))
		
		//// parse application/json
		////app.use(bodyParser.json())


		/**
		 * logger
		 *  - start
		 * **/
		if(this.options.logs){
			if(typeof(this.options.logs) == 'class'){
				var tmp_class = this.options.logs;
				this.logger = new tmp_class(this, {});
				this.options.logs = {};
			}
			else if(typeof(this.options.logs) == 'function'){
				this.logger = this.options.logs;
				this.options.logs = {};
			}
			else{
				this.logger = new Logger(this, this.options.logs);
			}
		
			//app.use(this.logger.access());
		}
		/**
		 * logger
		 *  - end
		 * **/
		
		//var SessionMemoryStore = require('express-session/session/memory');//for socket.io / sessions
		
		/**
		 * session
		 *  - start
		 * **/
		//if(this.options.session){
			
			//var sess_middleware = null;
			
			//if(typeof(this.options.session) == 'function'){
				//sess_middleware = this.options.session;
				//this.options.session = {};
			//}
			//else{
				//sess_middleware = session(this.options.session);
			//}
				
			//app.use(sess_middleware);
		//}
		/**
		 * session
		 *  - end
		 * **/
		 
		
		/**
		 * authentication
		 * - start
		 * */
		//if(this.options.authentication && this.options.authentication.init !== false){
			//var authentication = null;
			
			//if(typeof(this.options.authentication) == 'class'){
				//authentication = new this.options.authentication(this, {});
				//this.options.authentication = {};
			//}
			//else if(typeof(this.options.authentication) == 'function'){
				//authentication = this.options.authentication;
				//this.options.authentication = {};
			//}
			//else{
				
				//var MemoryStore = require('node-authentication').MemoryStore;
			
				////----Mockups libs
				//var UsersAuth = require(path.join(__dirname, 'libs/mockups/authentication/type/users'));
				
				//var users = this.options.authentication.users;
				
				//authentication = new Authentication(this, {
										//store: new MemoryStore(users),
										//auth: new UsersAuth({users: users}),
										//passport: {session: (this.options.session) ? true : false}
								  //});
			//}
			
			//this.authentication = authentication;
			
			//if(this.options.authentication.users)//empty users data, as is easy accesible
				//this.options.authentication.users = {};
			
			
		//}
		/**
		 * authentication
		 * - end
		 * */
		
		/**
		 * authorization
		 * - start
		 * */
		 if(this.options.authorization && this.options.authorization.init !== false){
			 var authorization = null;
			 
			 if(typeof(this.options.authorization) == 'class'){
				 authorization = new this.options.authorization({});
				 this.options.authorization = {};
			 }
			 else if(typeof(this.options.authorization) == 'function'){
				authorization = this.options.authorization;
				this.options.authorization = {};
			}
			else if(this.options.authorization.config){
				var rbac = this.options.authorization.config;
				
				if(typeof(this.options.authorization.config) == 'string'){
					//rbac = fs.readFileSync(path.join(__dirname, this.options.authorization.config ), 'ascii');
					rbac = fs.readFileSync(this.options.authorization.config , 'ascii');
					this.options.authorization.config = rbac;
				}
				
				authorization = new Authorization(this, 
					JSON.decode(
						rbac
					)
				);
			}
			
			if(authorization){
				this.authorization = authorization;
				//app.use(this.authorization.session());
			}
		}
		/**
		 * authorization
		 * - end
		 * */
		
		//this.profile('app_init');//start profiling
		
		//if(this.options.api.versioned_path !== true)
			//this.options.api.force_versioned_path = false;

		
		//this.sanitize_params();
		
		this.apply_routes();
		
		//this.apply_api_routes();
		
		
		//this.profile('app_init');//end profiling
		
		//this.log('admin', 'info', 'app started');
		
		
  },
	/**
	* @params
	* @todo should rise an Error???
	* */
  sanitize_params: function(){
	 
		var params = Object.clone(this.options.params);
		
		if(params){
			var app = this.app;
			
			Object.each(params, function(condition, param){
				
				app.param(param, function(req, res, next, str){
					
					if(condition.exec(str) == null)
						req.params[param] = null;
						
					next();
				});
			});
		}
  }.protect(),
  
  //apply_api_routes: function(){
		//var api = this.options.api;
		
		//if(api.routes){
			//var app = this.app;
			
			//Object.each(api.routes, function(routes, verb){//for each HTTP VERB (get/post/...) there is an arry of routes
				
				//var content_type = (typeof(api.content_type) !== "undefined") ? api.content_type : '';
				//var version = (typeof(api.version) !== "undefined") ? api.version : '';
				
				//routes.each(function(route){//each array is a route
					
					//content_type = (typeof(route.content_type) !== "undefined") ? route.content_type : content_type;
					//version = (typeof(route.version) !== "undefined") ? route.version : version;
					
					//var path = '';
					//path += (typeof(api.path) !== "undefined") ? api.path : '';
					
					//var versioned_path = '';
					
					//if(api.versioned_path === true && version != ''){
						//versioned_path = path + '/v'+semver.major(version);
						//versioned_path += (typeof(route.path) !== "undefined") ? '/' + route.path : '';
					//}
					
					//path += (typeof(route.path) !== "undefined") ? '/' + route.path : '';
					
					//var callbacks = [];
					//route.callbacks.each(function(fn){
						//////console.log('apply_api_routes this[func]: '+fn);
						
						////if(content_type != ''){
							////~ callbacks.push(this.check_content_type_api.bind(this));
							//callbacks.push(
								//this.check_content_type.bind(this, 
									//this.check_accept_version.bind(this, 
										//this[fn].bind(this),
										//version),
								//content_type)
							//);
						////}
						////else{
							////callbacks.push(this[fn].bind(this));
						////}
						
						
					//}.bind(this));
					
					////console.log('api path '+path);
					
					//if(api.force_versioned_path){//route only work on api-version path
						//app[verb](versioned_path, callbacks);
					//}
					//else{//route works on defined path
						//if(api.versioned_path === true && version != ''){//route also works on api-version path
							//app[verb](versioned_path, callbacks);
						//}
						//app[verb](path, callbacks);
					//}

				//}.bind(this));

			//}.bind(this));
		//}
  //},
  //check_content_type: function(callback, content_type, req, res, next){
	  
	  //if(this.options.api.force_versioned_path ||//if apt-version path is forced, no checks needed
			//content_type.test(req.get('content-type')) || //check if content-type match
			//!req.get('content-type')){//or if no content-type it specified
			//callback(req, res, next);
	  //}
	  //else{
			//next();
	  //}
  //},
  //check_accept_version: function(callback, version, req, res, next){
	  
	  //var accept_header = (this.options.api.accept_header) ? this.options.api.accept_header : 'accept-version';
	  
	  ////if(version.test(req.headers['accept-version']) || !version){
	  //if(!version ||
		//!req.headers[accept_header] ||
		//semver.satisfies(version, req.headers[accept_header])){
		
		//req.version = version;	
		//callback(req, res, next);
	  //}
	  //else{
			//next();
	  //}
  //},
  apply_routes: function(){
	  
	  //Array.each(this.available_methods, function(method){
			//this[method] = function(){console.log(method); return true;};
		//}.bind(this));
		
		if(this.options.routes){
			//var app = this.app;
			
			Object.each(this.options.routes, function(routes, verb){//for each HTTP VERB (get/post/...) there is an arry of routes
				
				//var content_type = (typeof(this.options.content_type) !== "undefined") ? this.options.content_type : '';
				
				routes.each(function(route){//each array is a route
					//var path = route.path || '';
					////var path = app.path + route.path;
					//content_type = (typeof(route.content_type) !== "undefined") ? route.content_type : content_type;
				
					//////console.log('specific route content-type: '+content_type);	
				
					var callbacks = [];
					route.callbacks.each(function(fn){
						
						console.log('route function: ' + fn);
						
						//if(content_type != ''){
							//callbacks.push(this.check_content_type.bind(this, this[fn].bind(this), content_type));
						//}
						//else{
							callbacks.push(this[fn].bind(this));
						//}
						
					}.bind(this));
					
					console.log(route);
					console.log(callbacks[0]);
					console.log(this.uri+this.options.path+route.path);
					
					//app[verb](route.path, callbacks);
					this[verb] = function(options){
						return this.app[verb](
							Object.merge({
								uri: this.uri+this.options.path+route.path,
							}, options),
							function(err, resp, body){
								Array.each(callbacks, function(callback){
									callback(err, resp, body);
								}.bind(this))
								
							}.bind(this)
						);
					};
					
				}.bind(this));

			}.bind(this));
		}
	//console.log('this.get');
	//console.log(this.get);
  },
  use: function(mount, app){
		//console.log('app');
		//console.log(typeOf(app));
		
		this.fireEvent(this.ON_USE, [mount, app, this]);
		
		if(typeOf(app) == 'class' || typeOf(app) == 'object')
			this.fireEvent(this.ON_USE_APP, [mount, app, this]);
		
		if(typeOf(app) == 'class')
			app = new app();
		
		if(typeOf(app) == 'object'){
			////console.log('extend_app.authorization');
			////console.log(app.options.authorization);
	
			if(this.authorization && app.options.authorization && app.options.authorization.config){
				
				var rbac = fs.readFileSync(app.options.authorization.config , 'ascii');
				app.options.authorization.config = rbac;
				this.authorization.processRules(
					JSON.decode(
						rbac
					)
				);
			}
			
			this.app.use(mount, app.express());
		}
		else{
			this.app.use(mount, app);
		}
  },
  load: function(wrk_dir, options){
		options = options || {};
		
		////console.log('load.options');
		////console.log(options);
		
		fs.readdirSync(wrk_dir).forEach(function(file) {

			var full_path = path.join(wrk_dir, file);
			
			
			if(! (file.charAt(0) == '.')){//ommit 'hiden' files
				////console.log('-------');
				
				////console.log('app load: '+ file);
				var app = null;
				var id = '';//app id
				var mount = '';
				
				if(fs.statSync(full_path).isDirectory() == true){//apps inside dir
					
					////console.log('dir app: '+full_path);
					
					var dir = file;//is dir
					
					fs.readdirSync(full_path).forEach(function(file) {//read each file in directory
						
						if(path.extname(file) == '.js' && ! (file.charAt(0) == '.')){
							
							////console.log('app load js: '+ file);
							app = require(path.join(full_path, file));
							
							if(file == 'index.js'){
								mount = id = dir;
							}
							else{
								id = dir+'.'+path.basename(file, '.js');
								mount = dir+'/'+path.basename(file, '.js');
							}
							
							if(typeOf(app) == 'class'){//mootools class
								////console.log('class app');
								
								this.fireEvent(this.ON_LOAD_APP, [app, this]);
								
								app = new app(options);
								
								/*////console.log('mootols_app.params:');
								////console.log(Object.clone(instance.params));*/
								
								//app = instance.express();
								//id = (instance.id) ? instance.id : id;
								//apps[app.locals.id || id]['app'] = app;
							}
							else{//nodejs module
								////console.log('express app...nothing to do');
							}
							
							mount = '/'+mount;
							
							this.use(mount, app);
							//apps[app.locals.id || id] = {};
							//apps[app.locals.id || id]['app'] = app;
							//apps[app.locals.id || id]['mount'] = mount;
						}

					}.bind(this));//end load single JS files

				}
				else if(path.extname( file ) == '.js'){// single js apps
					////console.log('file app: '+full_path);
					////console.log('basename: '+path.basename(file, '.js'));
					
					app = require(full_path);
					id = path.basename(file, '.js');
					
					if(file == 'index.js'){
						mount = '/';
					}
					else{
						mount = '/'+id;
					}
					
					if(typeOf(app) == 'class'){//mootools class
						
						this.fireEvent(this.ON_LOAD_APP, [app, this]);
						
						app = new app(options);
						//app = instance.express();
						//id = (instance.id) ? instance.id : id;
					}
					else{//nodejs module
						////console.log('express app...nothing to do');
					}
					
					this.use(mount, app);
					//apps[app.locals.id || id] = {};
					//apps[app.locals.id || id]['app'] = app;
					//apps[app.locals.id || id]['mount'] = mount;
				}
				
				
			}
		}.bind(this))
		
		//return apps;
	},
  //express: function(){
	  //return this.app;
  //},
  //404: function(req, res, next, err){
		
		//res.status(404);
		
		//res.format({
			//'text/plain': function(){
				//res.send('Not Found');
			//},

			//'text/html': function(){
				//res.send('Not Found');
			//},

			//'application/json': function(){
				//res.send({error: 'Not Found'});
			//},

			//'default': function() {
				//// log the request and respond with 406
				//res.status(406).send('Not Found '+ err);
			//}
		//});
	//},
  ////required for 'check_authentication', should be 'implement' injected on another module, auto-loaded by authentication?
  //403: function(req, res, next, err){
		
		//res.status(403);
		
		//res.format({
			//'text/plain': function(){
				//res.send(err);
			//},

			//'text/html': function(){
				//res.send(err);
			//},

			//'application/json': function(){
				//res.send(err);
			//},

			//'default': function() {
				//// log the request and respond with 406
				//res.status(406).send('Not Acceptable '+ err);
			//}
		//});
	//},
	////required for 'check_authentication', should be 'implement' injected on another module, auto-loaded by authentication?
	//500: function(req, res, next, err){
		
		//res.status(500);
		
		//res.format({
			//'text/plain': function(){
				//res.send(err);
			//},

			//'text/html': function(){
				//res.send(err);
			//},

			//'application/json': function(){
				//res.send(err);
			//},

			//'default': function() {
				//// log the request and respond with 406
				//res.status(406).send('Not Acceptable '+ err);
			//}
		//});
	//},
	
});
