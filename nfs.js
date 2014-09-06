var os = require('os');

if(os.platform().indexOf('darwin')==-1){
	/*IF PLATFORM == WINDOWS*/
	var request = require('request');
	var spawn = require('child_process').spawn;
	var exec = require('child_process').exec;
	var syncExec = require('execsync-ng');

	var EverythingExecutable;	
	var isReady = false;

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
			request('http://127.0.0.3:1024/?search='+encodeURIComponent(query)+'&json=1&path_column=1&count=10', function(error,response, body){
				var results = JSON.parse(body);
				results.query = query;
				for(var i in results.results){
					curResult = results.results[i];
					if(curResult.type =='folder'){
						results.results[i].icon = undefined;
						continue;
					}
					var icon = syncExec.exec('"'+module.exports.PATH+'IconExtractor.exe" "'+curResult.path+'\\'+curResult.name+'"');
					if(icon.stdout.indexOf('folder') == -1 && icon.stdout.indexOf('noargs') == -1 && icon.stdout.indexOf('notfound') == -1){
						results.results[i].icon = icon.stdout.replace('\n','');
					} else {
						results.results[i].icon = undefined;
					}
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



} else {

/*IF PLATFORM IS MAC*/
	var exec = require('child_process').exec;
	var path = require('path');
	var fs = require('fs');
	var syncExec = require('execsync-ng');

	var executable;
	module.exports = {
		PATH : './exec/',
		MAX_RESULTS : 20,
		setPath : function(path){
			return true;
		},
		getPath : function(){
			return true;
		},
		search : function(query,callback){
			var $this = this;
			exec('mdfind -name '+query, function(error, stdout, stderr){
				var results = stdout.split('\n');
				var resultsObj = {};
				resultsObj.totalResults = results.length-1;
				resultsObj.results = [];
				resultsObj.query = query;
				for(var i in results){
					if(i == $this.MAX_RESULTS){
						break;
					}
					if(results[i].trim() == "" || results[i] == " " || results[i] == undefined)
						continue;
					var result = {};
					result['name'] = path.basename(results[i]);
					result.path = path.dirname(results[i]);
					if(fs.statSync(results[i]).isDirectory()){
						result.type = 'folder';
					} else {
						result.type = 'file';
					}
					var icon = syncExec.exec('"'+module.exports.PATH+'IconExtractor" "'+result.path+'/'+result.name+'"');
					
					if(icon.stdout.indexOf('nofile')==-1)
						result.icon = 'data:image/Png;base64,'+icon.stdout.split(' ')[3].replace('\n','');
					else
						result.icon = undefined;
					/*if(icon.stdout.indexOf('folder') == -1 && icon.stdout.indexOf('noargs') == -1 && icon.stdout.indexOf('notfound') == -1){
						results.results[i].icon = icon.stdout.replace('\n','');
					} else {
						results.results[i].icon = undefined;
					}*/
					resultsObj.results.push(result);
				}
				callback(resultsObj);
			});
		}

	};




}

