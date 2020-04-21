function getNumericInput(label,prompt) {
	var label = document.createTextNode(label);

	var input = document.createElement('INPUT');
	input.setAttribute('type','number');
	input.setAttribute('value',prompt);

	var span = document.createElement('SPAN');
	span.appendChild(label);
	span.appendChild(input);

	var element = document.createElement('DIV');
	element.appendChild(span);
	return element;
}

var person;
if (window.location.href.includes('/?')) {
	person = new Person(window.location.href);
} else {
	person = new Person('/?18074')
}

document.body.appendChild(getNumericInput('Weight (lbs): ', person.weight));
document.body.appendChild(getNumericInput('Height (in): ', person.height));

var generateButton = document.createElement('INPUT');
generateButton.setAttribute('type','button');
generateButton.setAttribute('value','Generate Emergency QR Code');
generateButton.onclick = function() { 
	var qrcode = new QRCode("qrcode");
	qrcode.makeCode('https://rupumped.github.io/EQR/index.html/?' + person.encode);
};
document.body.appendChild(generateButton);