var x = require('./nfs.js');
x.search('Invoice.doc',function(results){
	console.log(results);
});
x.search('fifa.exe',function(results){
	console.log(results);
});


