function safelyGetProperty(name, dict) {
	var property = getComputedStyle(document.body).getPropertyValue(name);
	if (!property) throw `Property "${name}" is not defined in the CSS.`;
	var propArr = property.match(/([\d\.]+)(.*)/);
	var val = propArr[1];
	var unit = propArr[2];
	if (!dict.hasOwnProperty(unit)) throw `Property unit "${unit}" is not defined in dict.`;
	return val*dict[unit];
}