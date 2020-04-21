function Person(url) {
	var data = url.substring(url.indexOf('/?')+2);
	this.weight = parseInt(data.substring(0,3));
	this.height = parseInt(data.substring(3,5));
	console.log(this.encode());
}

Person.prototype.encode = function() {
	return '' + this.weight + this.height;
}