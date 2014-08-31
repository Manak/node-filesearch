var request = require('request');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

var EverythingExecutable;	
var isReady = false;
var searchExecutable;
module.exports = {
	PATH : './exec/',
	MAX_RESULTS : 20,
	setPath : function(path){
		this.PATH = path;
		return true;
	},
	getPath : function(){
		if(this.PATH !== undefined)
			return this.PATH;
		else
			return false;
	},
	search : function(query,callback){
		request('http://127.0.0.3:1024/?search='+encodeURIComponent(query)+'&json=1&path_column=1&count=10&date_modified_column=1', function(error,response, body){
			var results = JSON.parse(body);
			/*Convert LDAP Timestamp to EPOCH(ms since epoch)*/
			for(var i in results.results){
				results.results[i]['date_modified'] = Math.round((results.results[i]['date_modified'] - 11644473600) / 10000000);
			}
			callback(results);
		});
	}

};

var init = function(){
	EverythingExecutable = exec(module.exports.PATH+'everything.exe', ['-startup','-config Everything.ini']);

	EverythingExecutable.on('close',function(){
		isReady = false;
	});

	isReady = true;
}

init();