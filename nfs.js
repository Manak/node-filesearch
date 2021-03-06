var os = require('os');

if(os.platform().indexOf('darwin')==-1){
	/*IF PLATFORM == WINDOWS*/
	var request = require('request');
	var spawn = require('child_process').spawn;
	var exec = require('child_process').exec;
	var async = require('async');

	var EverythingExecutable;	
	var isReady = false;

	module.exports = {
		PATH : __dirname + '/exec/',
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
		getIcon: function(path,cb){
			exec('"'+module.exports.PATH+'IconExtractor.exe" "'+path+'"',[],function(err, stdout,stderr){
				cb(stdout);
			});
		},
		search : function(query,callback){
			request('http://127.0.0.3:1024/?search='+encodeURIComponent(query)+'&json=1&path_column=1&count=10', function(error,response, body){
				var results = JSON.parse(body);
				results.query = query;
				var asyncIconArr = [];
				for(var i in results.results){
					(function(curResult){
						asyncIconArr.push(function(cb){
							exec('"'+module.exports.PATH+'IconExtractor.exe" "'+curResult.path+'\\'+curResult.name+'"',[],function(err, stdout,stderr){
								cb(stderr,stdout);
							});
						})
					})(results.results[i]);
					// var icon = syncExec.exec('"'+module.exports.PATH+'IconExtractor.exe" "'+curResult.path+'\\'+curResult.name+'"');
					// if(icon.stdout.indexOf('folder') == -1 && icon.stdout.indexOf('noargs') == -1 && icon.stdout.indexOf('notfound') == -1){
					// 	results.results[i].icon = icon.stdout.replace('\n','');
					// } else {
					// 	results.results[i].icon = undefined;
					// }
				}
				async.parallelLimit(asyncIconArr, 6, function(err,xresults){
					for(var i in xresults){
						var icon = xresults[i];
						if(icon.indexOf("notfound") !== -1 || icon.indexOf("noargs") !== -1 || icon.indexOf('folder')!==-1){
							results.results[i].icon = undefined;
						} else {
							results.results[i].icon =icon.replace(['\r\n'],'');
						}
					}
					callback(results);
				});
			});
}

};

var init = function(){
	EverythingExecutable = exec(module.exports.PATH+'everything.exe -admin -startup -config "'+ module.exports.PATH+'Everything.ini" -minimized',[]);

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
	var async = require('async');

	var executable;
	module.exports = {
		PATH : __dirname + '/exec/',
		MAX_RESULTS : 20,
		setPath : function(path){
			return true;
		},
		getPath : function(){
			return true;
		},
		getIcon: function(path,cb){
			
			exec('"'+module.exports.PATH+'IconExtractor" "'+path+'"',[],function(err, stderr,stdout){
				var icon = stdout;
				if(icon.indexOf("nofile") !== -1){
					icon = undefined;
				} else if(icon.split(' ')[3] !== undefined){
					icon = 'data:image/Png;base64,'+icon.split(' ')[3].replace('\n','');
				} else {
					icon = undefined;
				}
				cb(icon);
			});
		},
		search : function(query,callback){
			var $this = this;
			exec('mdfind -name "'+query+'"', function(error, stdout, stderr){
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
					// var icon = syncExec.exec('"'+module.exports.PATH+'IconExtractor" "'+result.path+'/'+result.name+'"');
					
					// if(icon.stdout.indexOf('nofile')==-1)
					// 	result.icon = 'data:image/Png;base64,'+icon.stdout.split(' ')[3].replace('\n','');
					// else
					// 	result.icon = undefined;

					resultsObj.results.push(result);
				}
				var asyncIconArr =[];
				for(var i in resultsObj.results){
					(function(result){
						asyncIconArr.push(function(cb){
							console.log(result.name);
							exec('"'+module.exports.PATH+'IconExtractor" "'+result.path+'/'+result.name+'"',[],function(err, stderr,stdout){
								cb(stderr,stdout);
							});
						});
					})(resultsObj.results[i]);
				}
				async.parallelLimit(asyncIconArr, 6, function(err,results){
					console.log(results);
					for(var i in results){
						var icon = results[i];
						if(icon.indexOf("nofile") !== -1){
							resultsObj.results[i].icon = undefined;
						} else if(icon.split(' ')[3] !== undefined){
							resultsObj.results[i].icon = 'data:image/Png;base64,'+icon.split(' ')[3].replace('\n','');
						} else {
							resultsObj.results[i].icon = undefined;
						}
					}
					callback(resultsObj);
				});
			});
}

};




}


