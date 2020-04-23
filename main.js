function createFormElement(id,labelText,type,value,noteText='') {
	var label = document.createElement('LABEL');
	label.setAttribute('for', id);
	label.innerHTML = labelText;
	var input = document.createElement('INPUT');
	input.setAttribute('type', type);
	input.setAttribute('id', id);
	input.setAttribute('value', value);
	var note = document.createElement('SMALL');
	note.innerHTML = noteText;
	return {label: label, input: input, note: note};
}

function appendFormElement(element) {
	form.appendChild(element.label);
	form.appendChild(element.input);
	form.appendChild(element.note);
	form.appendChild(document.createElement('BR'));
	form.appendChild(document.createElement('BR'));
}

// Fill in input fields to HTML
var form = document.createElement('FORM');
function updateForm() {
	form.innerHTML = '';

	var nameEl = createFormElement('name', 'Full Name:', 'text', decodeStr(person.name));
	nameEl.input.onchange = () => person.name = encodeStr(nameEl.input.value);
	appendFormElement(nameEl);

	var dobEl = createFormElement('dob', 'Date of Birth:', 'date', `${person.DOB.yr}-${person.DOB.mo}-${person.DOB.da}`);
	dobEl.input.onchange = () => person.DOB = {yr: dobEl.input.value.split('-')[0], mo: dobEl.input.value.split('-')[1], da: dobEl.input.value.split('-')[2]};
	appendFormElement(dobEl);

	var bloodEl = createFormElement('blood', 'Blood Type:', 'text', person.blood);
	bloodEl.input.onchange = () => person.blood = bloodEl.input.value;
	bloodEl.input.setAttribute('pattern','(A|B|AB|O)[+-]')
	appendFormElement(bloodEl);

	var heightEl = createFormElement('height', 'Height (inches):', 'number', person.height);
	heightEl.input.onchange = () => person.height = parseInt(heightEl.input.value);
	heightEl.input.setAttribute('min',0);
	heightEl.input.setAttribute('max',999);
	appendFormElement(heightEl);

	var weightEl = createFormElement('weight', 'Weight (lbs):', 'number', person.weight);
	weightEl.input.onchange = () => person.weight = parseInt(weightEl.input.value);
	weightEl.input.setAttribute('min',0);
	weightEl.input.setAttribute('max',9999);
	appendFormElement(weightEl);

	var allergyEl = createFormElement('allergies', 'Allergies (comma-separated):', 'allergies', person.allergies.join());
	allergyEl.input.onchange = () => {
		var allergies = allergyEl.input.value.split();
		for (let i=0; i<allergies.length; i++) {
			allergies[i] = decodeStr(allergies[i]);
		}
		if (allergies.length==1 && allergies[0]=='') allergies = [];
		person.allergies = allergies;
	};
	appendFormElement(allergyEl);

	var addictionEl = createFormElement('addictions', 'Addictions (comma-separated):', 'addictions', person.addictions.join());
	addictionEl.input.onchange = () => {
		var addictions = addictionEl.input.value.split();
		for (let i=0; i<addictions.length; i++) {
			addictions[i] = decodeStr(addictions[i]);
		}
		person.addictions = addictions;
		if (addictions.length==1 && addictions[0]=='') addictions = [];
	};
	appendFormElement(addictionEl);

	var medsLabel = document.createElement('LABEL');
	medsLabel.innerHTML = 'Medications:';
	form.appendChild(medsLabel);
	form.appendChild(document.createElement('BR'));
	var medsTable = person.getMedsTable();
	form.appendChild(medsTable);

	var condsLabel = document.createElement('LABEL');
	condsLabel.innerHTML = 'Conditions:';
	form.appendChild(condsLabel);
	form.appendChild(document.createElement('BR'));
	var condsTable = person.getConditionsTable();
	form.appendChild(condsTable);

	var contsLabel = document.createElement('LABEL');
	contsLabel.innerHTML = 'Emergency Contacts:';
	form.appendChild(contsLabel);
	form.appendChild(document.createElement('BR'));
	var contsTable = person.getContactsTable();
	form.appendChild(contsTable);
	form.appendChild(document.createElement('BR'));
}

// Initialize Person from URL
var person;
if (window.location.href.includes('/?')) {
	person = new Person(updateForm, window.location.href);
} else {
	person = new Person(updateForm, '/?Taylor_Doe19940301A+0730180bees&peanuts&frogs&=meth&alcohol&=ibuprofin&1_pill&daily&pain&meds&1_shot&weekly&problems&=diabetes&kidneys&idk&heart_probs&badness&idkagain&=ann6025551234&mom4805551234&')
}

updateForm();
document.body.appendChild(form);

// Add generate button to HTML
var generateButton = document.createElement('INPUT');
var qrcode;
var firstGen = true;
generateButton.setAttribute('type','button');
generateButton.setAttribute('value','Generate Emergency QR Code');
generateButton.onclick = function() {
	// Generate QR Code
	if (firstGen) {
		qrcode = new QRCode("qrcode");
	} else {
		qrcode.clear();
	}

	//var code = 'file:///C:/Users/nick/Documents/GitHub/EQR/index.html/?' + person.encode();
	var code = 'https://rupumped.github.io/EQR/?' + person.encode();
	console.log(code);
	qrcode.makeCode(code);
	if (firstGen) {
		document.body.appendChild(document.createElement('BR'));
		document.body.appendChild(document.createElement('BR'));
		document.body.appendChild(document.createTextNode('Use your smartphone to take a picture!'));
	}

	firstGen = false;
};
document.body.appendChild(generateButton);
document.body.appendChild(document.createElement('BR'));
document.body.appendChild(document.createElement('BR'));