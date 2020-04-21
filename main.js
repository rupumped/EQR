function getNumericInput(label,prompt,id) {
	var label = document.createTextNode(label);

	var input = document.createElement('INPUT');
	input.setAttribute('type','number');
	input.setAttribute('value',prompt);
	input.setAttribute('id',id);

	var span = document.createElement('SPAN');
	span.appendChild(label);
	span.appendChild(input);

	var element = document.createElement('DIV');
	element.appendChild(span);
	return element;
}

// Initialize Person from URL
var person;
if (window.location.href.includes('/?')) {
	person = new Person(window.location.href);
} else {
	person = new Person('/?18073')
}

// Fill in input fields to HTML
document.body.appendChild(getNumericInput('Weight (lbs): ', person.weight, 'weight'));
document.body.appendChild(getNumericInput('Height (in): ', person.height, 'height'));

// Add generate button to HTML
var generateButton = document.createElement('INPUT');
var qrcode;
var firstGen = true;
generateButton.setAttribute('type','button');
generateButton.setAttribute('value','Generate Emergency QR Code');
generateButton.onclick = function() {
	// Reconstruct person from input fields
	person.weight = parseInt(document.getElementById('weight').value);
	person.height = parseInt(document.getElementById('height').value);

	// Generate QR Code
	if (firstGen) {
		qrcode = new QRCode("qrcode");
	} else {
		qrcode.clear();
	}
	firstGen = false;
	//qrcode.makeCode('file:///C:/Users/nick/Documents/GitHub/EQR/index.html/?' + person.encode());
	qrcode.makeCode('https://rupumped.github.io/EQR/index.html/?' + person.encode());
};
document.body.appendChild(generateButton);