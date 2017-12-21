'use strict'

var Moo = require("mootools"),
	path = require('path'),
	fs = require('fs'),
	request = require('request'),
	pathToRegexp = require('path-to-regexp'),
	semver = require('semver');
	
	//Layer = require('express/lib/router/layer');//express Layer
	//express = require('express'),
	
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
  
  ON_CONNECT: 'onConnect',
  ON_CONNECT_ERROR: 'onConnectError',
  
  //app: null,
  //uri: null,
  request: null,
  
  api: {},
  
  available_methods: ['put', 'patch', 'post', 'head', 'del', 'delete', 'get'],
  
  logger: null,
  authorization:null,
  //authentication: null,
  _merged_apps: {},
  
  options: {
			
		id: '',
		path: '',
		
		scheme: 'http',
		url: '127.0.0.1',
		port: 8080,
		
		//request: {
		//},
		
		headers: {},
		
		jar: false,
		////logs : { 
			////path: './logs' 
		////},
		logs: null,
		
		authentication: null,
		
		//authentication: {
			//username: 'user',
			//password: 'pass',
			//sendImmediately: true,
			//bearer: 'bearer,
			//basic: false
		//},
		
		////authorization: {
			////config: null,
			////init: true
		////},
		authorization: null,
		
		
		content_type: 'text/plain',
		gzip: true,
		
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
		
		api: {
			
			content_type: 'application/json',
			
			path: '',
			
			version: '0.0.0',
			
			versioned_path: false, //default false
			
			//accept_header: 'accept-version', //implement?
			
			/*routes: {
				get: [
					{
					path: '',
					callbacks: ['get_api'],
					content_type: 'application/x-www-form-urlencoded',
					//version: '1.0.1',
					},
					{
					path: ':service_action',
					callbacks: ['get_api'],
					version: '2.0.0',
					},
					{
					path: ':service_action',
					callbacks: ['get_api'],
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
			},*/
		},
  },
  initialize: function(options){
		
		this.setOptions(options);//override default options
		
		this.request = request;
		

		/**
		 * logger
		 *  - start
		 * **/
		if(this.options.logs){
			//console.log('----instance----');
			//console.log(this.options.logs);
			
			if(typeof(this.options.logs) == 'class'){
				var tmp_class = this.options.logs;
				this.logger = new tmp_class(this, {});
				this.options.logs = {};
			}
			else if(typeof(this.options.logs) == 'function'){
				this.logger = this.options.logs;
				this.options.logs = {};
			}
			//else if(this.options.logs.instance){//winston
				//this.logger = this.options.logs;
				//this.options.logs = {};
			//}
			else{
				this.logger = new Logger(this, this.options.logs);
				//app.use(this.logger.access());
			}
			
			//app.use(this.logger.access());
			
			//console.log(this.logger.instance);
		}
		
		if(this.logger)
			this.logger.extend_app(this);
		
		/**
		 * logger
		 *  - end
		 * **/
		
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
		
		if(this.options.api && this.options.api.routes)
			this.apply_routes(this.options.api.routes, true);
		
		this.apply_routes(this.options.routes, false);
		
		
  },
  apply_routes: function(routes, is_api){
		var uri = '';
		
		if(this.options.authentication &&
			this.options.authentication.basic &&
			(this.options.authentication.user || this.options.authentication.username) &&
			(this.options.authentication.pass || this.options.authentication.password))
		{
			var user = this.options.authentication.user || this.options.authentication.username;
			var passwd = this.options.authentication.pass || this.options.authentication.password;
			uri = this.options.scheme+'://'+user+':'+passwd+'@'+this.options.url+':'+this.options.port;
		}
		else{
			uri = this.options.scheme+'://'+this.options.url+':'+this.options.port;
		}
		
		
		var instance = null;
		var api = this.options.api;
		
		if(is_api){
			//path = ((typeof(api.path) !== "undefined") ? this.options.path+api.path : this.options.path).replace('//', '/');
			instance = this.api;
		}
		else{
			//path = (typeof(this.options.path) !== "undefined") ? this.options.path : '';
			instance = this;
		}
			
		Array.each(this.available_methods, function(verb){
			
			/**
			 * @callback_alt if typeof function, gets executed instead of the method asigned to the matched route (is an alternative callback, instead of the default usage)
			 * */
			instance[verb] = function(verb, original_func, options, callback_alt){
				//console.log('---gets called??---')
				//console.log(arguments);
				
				var request;//the request object to return
				
				var path = '';
				if(is_api){
					path = ((typeof(api.path) !== "undefined") ? this.options.path+api.path : this.options.path).replace('//', '/');
				}
				else{
					path = (typeof(this.options.path) !== "undefined") ? this.options.path : '';
				}
				
				
				options = options || {};
				
				if(options.auth === false || options.auth === null){
					delete options.auth;
				}
				else if(!options.auth &&
					this.options.authentication &&
					(this.options.authentication.user || this.options.authentication.username) &&
					(this.options.authentication.pass || this.options.authentication.password))
				{
					options.auth = this.options.authentication;
				}
				
				var content_type = '';
				var version = '';
				
				if(is_api){
					content_type = (typeof(api.content_type) !== "undefined") ? api.content_type : '';
					version = (typeof(api.version) !== "undefined") ? api.version : '';
				}
				else{
					content_type = (typeof(this.options.content_type) !== "undefined") ? this.options.content_type : '';
				}
				
				var gzip = this.options.gzip || false;
				
				if(routes[verb]){
					var uri_matched = false;
					
					Array.each(routes[verb], function(route){
						
						content_type = (typeof(route.content_type) !== "undefined") ? route.content_type : content_type;
						gzip = route.gzip || false;
						
						var keys = []
						var re = pathToRegexp(route.path, keys);
						
						//console.log('route path: '+route.path);
						////console.log(re.exec(options.uri));
						//console.log('options.uri: '+options.uri);
						//console.log(path);
						//console.log('--------');
							
						if(options.uri != null && re.test(options.uri) == true){
							uri_matched = true;
							
							var callbacks = [];
							
							/**
							 * if no callbacks defined for a route, you should use callback_alt param
							 * */
							if(route.callbacks && route.callbacks.length > 0){
								route.callbacks.each(function(fn){
									//console.log('route function: ' + fn);
									
									//if the callback function, has the same name as the verb, we had it already copied as "original_func"
									if(fn == verb){
										callbacks.push(original_func.bind(this));
									}
									else{
										callbacks.push(this[fn].bind(this));
									}
									
								}.bind(this));
							}
							
							if(is_api){
								//var versioned_path = '';
								if(api.versioned_path === true && version != ''){
									path = path + '/v'+semver.major(version);
									//path += (typeof(route.path) !== "undefined") ? '/' + route.path : '';
								}
								else{
									//path += (typeof(route.path) !== "undefined") ? '/' + route.path : '';
								}
							}
							
							//if(!is_api){
								path += '/'+options.uri;
							//}
							
							path = path.replace('//', '/');
							
							if(path == '/')
								path = '';
							
							
								
							//console.log(path+options.uri);
							//console.log('PATH');
							//console.log(options.uri);
							//console.log(options.uri);
							
							var merged = {};
							Object.merge(
								merged,
								options,
								{ headers: this.options.headers },
								{
									baseUrl: uri,
									//uri: path+options.uri,
									uri: path,
									gzip: gzip,
									headers: {
										'Content-Type': content_type
									},
									jar: this.options.jar
								}
							);
							
							console.log(merged);
							
							request = this.request[verb](
								merged,
								function(err, resp, body){
									//console.log('--default callback---');
									//console.log(arguments);
									
									if(err){
										this.fireEvent(this.ON_CONNECT_ERROR, {options: merged, uri: options.uri, route: route.path, error: err });
									}
									else{
										this.fireEvent(this.ON_CONNECT, {options: merged, uri: options.uri, route: route.path, response: resp, body: body });
									}
									
									if(typeof(callback_alt) == 'function' || callback_alt instanceof Function){
										callback_alt(err, resp, body, {options: merged, uri: options.uri, route: route.path });
									}
									else{
										Array.each(callbacks, function(callback){
											//console.log(callback);
											callback(err, resp, body, {options: merged, uri: options.uri, route: route.path });
										}.bind(this))
									}
									
								}.bind(this)
							);
						}
						
					}.bind(this));
					
					if(!uri_matched)
						throw new Error('No routes matched for URI: '+uri+path+options.uri);
				}
				else{
					//console.log(routes);
					throw new Error('No routes defined for method: '+verb.toUpperCase());
					
				}
				
				return request;
				
			}.bind(this, verb, this[verb]);//copy the original function if there are func like this.get, this.post, etc

		}.bind(this));
		
	},
	use: function(mount, app){
		//console.log('app');
		//console.log(typeOf(app));
		//console.log(mount);
		
		this.fireEvent(this.ON_USE, [mount, app, this]);
		
		if(typeOf(app) == 'class' || typeOf(app) == 'object')
			this.fireEvent(this.ON_USE_APP, [mount, app, this]);
		
		//if(typeOf(app) == 'class')
			//app = new app();
		
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
			
			//this.app.use(mount, app.express());
		}
		else{
			//this.app.use(mount, app);
		}
		
		//var merged = this._merge(mount, app);
		//Object.merge(this._merged_apps, this._merge(mount, app));
		
		//console.log(this._merged_apps);
		
		//Object.append(this, this._merge(mount, app));
		//console.log(this._merge(mount, app));
		var to_append = this._merge(mount, app);
		
		//console.log(Object.keys(to_append)[0]);
		
		var key = Object.keys(to_append)[0];
		if(this[key]){//an app has beend loaded on that key
			var tmp = this[key];
			if(typeOf(tmp) == 'object'){
				//var tmpObj = {};
				//tmpObj[key] = tmp;
				
				//console.log(to_append);
				//console.log(tmp);
				delete this[key];
				
				Object.append(to_append[key], tmp);
				//Object.each(tmp, function(value, tmpKey){
					//console.log(value);
					////Object.append(to_append[tmpKey], value);
				//});
				
				
				
			}
			
			Object.append(this, to_append);
			//console.log('TYPEOF');
			//console.log(to_append);
			//console.log(tmp);
		}
		else{
			//console.log(to_append);	
			Object.append(this, to_append);
		}
		
  },
  _merge: function(mount, app){
		//console.log('--mount--');
		//console.log(mount);
		//console.log(Object.getLength(mount));
		
		if(Object.getLength(mount) > 0){
			Object.each(mount, function(value, key){
				//console.log('--KEY--');
				//console.log(key);
				//console.log(value);
				
				mount[key] = this._merge(value, app);
				
			}.bind(this));
			
			return mount;
		}
		else{
			return app;
		}
	},
  load: function(wrk_dir, options){
		options = options || {};
		
		options.scheme = options.scheme || this.options.scheme;
		options.url = options.url || this.options.url;
		options.port = options.port || this.options.port;
		options.authentication = options.authentication || this.options.authentication;
		options.jar = options.jar || this.options.jar;
		options.gzip = options.gzip || this.options.gzip;
		
		//console.log('load.options');
		//console.log(options);
		
		fs.readdirSync(wrk_dir).forEach(function(file) {

			var full_path = path.join(wrk_dir, file);
			
			
			if(! (file.charAt(0) == '.')){//ommit 'hiden' files
				//console.log('-------');
				
				//console.log('app load: '+ file);
				var app = null;
				var id = '';//app id
				var mount = {};
				
				if(fs.statSync(full_path).isDirectory() == true){//apps inside dir
					
					////console.log('dir app: '+full_path);
					
					var dir = file;//is dir
					
					
					fs.readdirSync(full_path).forEach(function(file) {//read each file in directory
						
						var app_path = this.options.path;
						
						if(path.extname(file) == '.js' && ! (file.charAt(0) == '.')){
							
							////console.log('app load js: '+ file);
							app = require(path.join(full_path, file));
							
							mount[dir] = {};
							if(file == 'index.js'){
								//mount = id = dir;
								//mount[dir] = {};
								app_path += dir;
							}
							else{
								//id = dir+'.'+path.basename(file, '.js');
								//mount = dir+'/'+path.basename(file, '.js');
								mount[dir][path.basename(file, '.js')] = {};
								app_path += dir+'/'+path.basename(file, '.js');
							}
							
							if(typeOf(app) == 'class'){//mootools class
								////console.log('class app');
								
								this.fireEvent(this.ON_LOAD_APP, [app, this]);
								
								//if(app.options.path)
									//app_path = this.options.path+app.options.path;
								
								options.path = app_path;
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
							
							//mount = '/'+mount;
							
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
						//mount = '/';
					}
					else{
						//mount = '/'+id;
						mount[id] = {};
						app_path += '/'+id;
					}
					
					if(typeOf(app) == 'class'){//mootools class
						
						this.fireEvent(this.ON_LOAD_APP, [app, this]);
						
						//if(app.options.path)
							//app_path = this.options.path+app.options.path;
								
						options.path = app_path;
								
						app = new app(options);
						//app = instance.express();
						//id = (instance.id) ? instance.id : id;
					}
					else{//nodejs module
						////console.log('express app...nothing to do');
					}
					
					//console.log(mount);
					this.use(mount, app);
					
					//apps[app.locals.id || id] = {};
					//apps[app.locals.id || id]['app'] = app;
					//apps[app.locals.id || id]['mount'] = mount;
				}
				
				
			}
		}.bind(this))
		
		//console.log(this._merged_apps);
		Object.append(this, this._merged_apps);
		
		//return apps;
	},
  
	
});


