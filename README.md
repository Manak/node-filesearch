node-filesearch
===============

NodeJS module to aid in file searching on Mac(uses Spotlight Search) &amp; Windows(uses Everything Search)

Example
===============
#### CODE

```javascript
var x = require('node-filesearch');
x.search('.doc',function(results){
	console.log(results);
});
```
#### results

```javascript
results = {
	totalResults : 1, //total number of results on hard disk regardless of max result limit
	results:{
		type:'folder', //could be folder/file,
		name:'troll.doc', //filename
		path:'C://Users', //location of file
	}
}
```
