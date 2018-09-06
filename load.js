'use strict'
	
module.exports = function(App){
	
	App = require('node-app/load')(App);
	var AppHttpClient = new Class({
		Extends: App,
		
		load: function(wrk_dir, options){
			options = options || {};
			
			var get_options = function(options){
				options.scheme = options.scheme || this.options.scheme;
				options.host = options.host || this.options.host;
				options.port = options.port || this.options.port;
				options.authentication = options.authentication || this.options.authentication;
				options.jar = options.jar || this.options.jar;
				options.gzip = options.gzip || this.options.gzip;
				
				/**
				 * subapps will re-use main app logger
				 * */
				
				if(this.logger)	
					options.logs = this.logger;
				
				return options;
			
			}.bind(this);
			
			this.parent(wrk_dir, get_options(options));
			
			
		},
	})
	
	

	return AppHttpClient
}

