var MAIN_DIV = document.getElementById('mainDiv');

var devicePixelRatio = 1;//window.devicePixelRatio || 1;
var dpi_x = document.getElementById('testdiv').offsetWidth * devicePixelRatio;
var dpi_y = document.getElementById('testdiv').offsetHeight * devicePixelRatio;
var dpi = (dpi_x+dpi_y)/2;
console.log(dpi); // 240 or 96 dpi

function createSpacer() {
	var spacer = document.createElement('DIV');
	spacer.className += ' spacer';
	return spacer;
}

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

	// Name
	var nameEl = createFormElement('name', 'Full Name:', 'text', decodeStr(person.name));
	nameEl.input.onchange = () => person.name = encodeStr(nameEl.input.value);
	nameEl.input.required = true;
	appendFormElement(nameEl);

	// DOB
	var dobEl = createFormElement('dob', 'Date of Birth:', 'date', `${person.DOB.yr}-${person.DOB.mo}-${person.DOB.da}`);
	dobEl.input.onchange = () => person.DOB = {yr: dobEl.input.value.split('-')[0], mo: dobEl.input.value.split('-')[1], da: dobEl.input.value.split('-')[2]};
	dobEl.input.required = true;
	appendFormElement(dobEl);

	// Blood Type
	var bloodEl = createFormElement('blood', 'Blood Type:', 'text', person.blood);
	bloodEl.input.onchange = () => {
		bloodEl.input.value = bloodEl.input.value.toUpperCase();
		person.blood = bloodEl.input.value;
	}
	bloodEl.input.setAttribute('pattern','(A|B|AB|O)[+-]');
	bloodEl.input.setAttribute('id','bloodInput');
	bloodEl.input.required = true;
	appendFormElement(bloodEl);

	// Height
	var heightLabel = document.createElement('LABEL');
	heightLabel.innerHTML = 'Height:';
	form.appendChild(heightLabel);
	var heightInputFt = document.createElement('INPUT');
	heightInputFt.setAttribute('type', 'number');
	heightInputFt.setAttribute('value', person.height.ft);
	heightInputFt.setAttribute('min',0);
	heightInputFt.setAttribute('max',9);
	heightInputFt.setAttribute('id','heightInputFt');
	heightInputFt.required = true;
	heightInputFt.onchange = () => person.height.ft = parseInt(heightInputFt.value);
	form.appendChild(heightInputFt);
	var heightLabelFt = document.createElement('LABEL');
	heightLabelFt.className += ' unit';
	heightLabelFt.innerHTML = `&nbsp;ft.&nbsp;&nbsp;`;
	form.appendChild(heightLabelFt);
	var heightInputIn = document.createElement('INPUT');
	heightInputIn.setAttribute('type', 'number');
	heightInputIn.setAttribute('value', person.height.in);
	heightInputIn.setAttribute('min',0);
	heightInputIn.setAttribute('max',11);
	heightInputIn.setAttribute('id','heightInputIn');
	heightInputIn.required = true;
	heightInputIn.onchange = () => person.height.in = parseInt(heightInputIn.value);
	form.appendChild(heightInputIn);
	var heightLabelIn = document.createElement('LABEL');
	heightLabelIn.className += ' unit';
	heightLabelIn.innerHTML = `&nbsp;in.`;
	form.appendChild(heightLabelIn);
	var heightNote = document.createElement('SMALL');
	heightNote.innerHTML = '';
	form.appendChild(heightNote);
	form.appendChild(document.createElement('BR'));
	form.appendChild(document.createElement('BR'));

	// Weight
	var weightEl = createFormElement('weight', 'Weight (lbs):', 'number', person.weight);
	weightEl.input.onchange = () => person.weight = parseInt(weightEl.input.value);
	weightEl.input.setAttribute('id','weightInput')
	weightEl.input.setAttribute('min',0);
	weightEl.input.setAttribute('max',9999);
	weightEl.input.required = true;
	appendFormElement(weightEl);

	var suicideEl = createFormElement('suicide', 'Past suicide attempt(s):', 'checkbox', '');
	suicideEl.input.checked = person.suicide;
	suicideEl.input.onchange = () => person.suicide = suicideEl.input.checked;
	appendFormElement(suicideEl);

	var listsTableWrapper = document.createElement('DIV');
	listsTableWrapper.className += ' tableWrapper';
	var listsTable = document.createElement('TABLE');
	listsTable.setAttribute('id','listsTable');
	var listsTbody = document.createElement('TBODY');
	// Allergies
	var allergyEl = createFormElement('allergies', 'Allergies (comma-separated):', 'allergies', decodeStr(person.allergies.join()));
	allergyEl.input.onchange = () => {
		var allergies = myTrim(allergyEl.input.value,'[\\s,]').split(',');
		for (let i=0; i<allergies.length; i++) {
			allergies[i] = encodeStr(allergies[i]);
		}
		if (allergies.length==1 && allergies[0]=='') allergies = [];
		person.allergies = allergies;
	};
	allergyEl.input.className += ' list';
	var allergyTR = document.createElement('TR');
	var allergyLabelTD = document.createElement('TD');
	allergyLabelTD.setAttribute('id','allergyLabelTD');
	allergyLabelTD.appendChild(allergyEl.label);
	allergyTR.appendChild(allergyLabelTD);
	var allergyInputTD = document.createElement('TD');
	allergyInputTD.appendChild(allergyEl.input);
	allergyTR.appendChild(allergyInputTD);
	listsTbody.appendChild(allergyTR);

	// Addictions
	var addictionEl = createFormElement('addictions', 'Addictions (comma-separated):', 'addictions', decodeStr(person.addictions.join()));
	addictionEl.input.onchange = () => {
		var addictions = myTrim(addictionEl.input.value,'[\\s,]').split(',');
		for (let i=0; i<addictions.length; i++) {
			addictions[i] = encodeStr(addictions[i]);
		}
		if (addictions.length==1 && addictions[0]=='') addictions = [];
		person.addictions = addictions;
	};
	addictionEl.input.className += ' list';
	addictionTR = document.createElement('TR');
	var addictionLabelTD = document.createElement('TD');
	addictionLabelTD.setAttribute('id','addictionLabelTD');
	addictionLabelTD.appendChild(addictionEl.label);
	addictionTR.appendChild(addictionLabelTD);
	var addictionInputTD = document.createElement('TD');
	addictionInputTD.appendChild(addictionEl.input);
	addictionTR.appendChild(addictionInputTD);
	listsTbody.appendChild(addictionTR);

	listsTable.appendChild(listsTbody);
	listsTableWrapper.appendChild(listsTable);
	form.appendChild(listsTableWrapper);
	form.appendChild(createSpacer());

	// Medications
	var medsLabel = document.createElement('LABEL');
	medsLabel.className += ' tableLabel';
	medsLabel.innerHTML = 'Medications:';
	form.appendChild(medsLabel);
	form.appendChild(document.createElement('BR'));
	var medsTable = person.getMedsTable();
	form.appendChild(medsTable);

	// Conditions
	form.appendChild(createSpacer());
	var condsLabel = document.createElement('LABEL');
	condsLabel.className += ' tableLabel';
	condsLabel.innerHTML = 'Medical Conditions:';
	form.appendChild(condsLabel);
	form.appendChild(document.createElement('BR'));
	var condsTable = person.getConditionsTable();
	form.appendChild(condsTable);

	// Contacts
	form.appendChild(createSpacer());
	var contsLabel = document.createElement('LABEL');
	contsLabel.className += ' tableLabel';
	contsLabel.innerHTML = 'Emergency Contacts:';
	form.appendChild(contsLabel);
	form.appendChild(document.createElement('BR'));
	var contsTable = person.getContactsTable();
	form.appendChild(contsTable);
	form.appendChild(createSpacer());
}

// Initialize Person from URL
var person;
if (window.location.href.includes('/?')) {
	person = new Person(updateForm, window.location.href);
} else {
	person = new Person(updateForm, '/?Taylor_Doe19830317A+6020180Namoxicillin&ampicillin&bees&=gambling&=acetaminophen&500mg&weekly&pain&insulin&1_unit&before_meals&diabetes&=diabetes&affects_blood_sugar&I_may_be_in_ketoacidosis&=Ann6025551234partner&Lucas4805551234sibling&=')
}

updateForm();
MAIN_DIV.appendChild(form);
MAIN_DIV.appendChild(createSpacer());

// Set up QR code
var qrDiv = document.getElementById('qrcode');
var qrSize = 5/2.54*dpi;
var qrcode = new QRCode(qrDiv, {
	width:qrSize,
	height:qrSize
});

// Add generate button to HTML
var errorDiv = document.createElement('DIV');
var generateButton = document.createElement('INPUT');
generateButton.setAttribute('type','button');
generateButton.setAttribute('value','Generate Emergency QR Code');
generateButton.onclick = function() {
	errorDiv.innerHTML='';
	qrcode.clear();
	var valResult = person.validate();
	if (valResult.result) {
		// Generate QR code
		qrDiv.style.display = 'initial';
		errorDiv.innerHTML='';
		//var code = 'file:///C:/Users/nick/Documents/GitHub/EQR/index.html/?' + valResult.encoding;
		var code = 'https://rupumped.github.io/EQR/?' + valResult.encoding;
		console.log(code);
		qrcode.makeCode(code);

		// Add "Print" button
		var printButton = document.createElement('INPUT');
		printButton.className += ' bigButton';
		printButton.setAttribute('type','button');
		printButton.setAttribute('value','Get Printable Version');
		printButton.onclick = () => {
			document.body.innerHTML = '';
			document.body.style.backgroundColor = 'white';
			document.body.style.color = 'black';
			var walletCardV = document.createElement('DIV');
			walletCardV.setAttribute('id','walletCardV');

			var walletCardText = document.createElement('P');
			walletCardText.innerHTML = 'EMERGENCY MEDICAL INFORMATION<br><br>SCAN ME';
			walletCardText.className += ' walletText';
			walletCardV.appendChild(walletCardText);

			walletCardV.appendChild(qrDiv);
			document.body.appendChild(walletCardV);
		};
		MAIN_DIV.appendChild(createSpacer());
		MAIN_DIV.appendChild(printButton);
	} else {
		qrDiv.style.display = 'none';
		errorDiv.appendChild(document.createTextNode('Error! QR code cannot be generated:'));
		errorDiv.appendChild(document.createElement('BR'));
		errorDiv.appendChild(document.createElement('BR'));
		valResult.errors.forEach(msg => {
			errorDiv.appendChild(document.createTextNode(msg));
			errorDiv.appendChild(document.createElement('BR'));
		});
		errorDiv.appendChild(document.createElement('BR'));
		errorDiv.appendChild(document.createTextNode('Please fix the above errors and try again.'))
	}
};
generateButton.className += ' bigButton';
MAIN_DIV.appendChild(generateButton);
MAIN_DIV.appendChild(document.createElement('BR'));
MAIN_DIV.appendChild(document.createElement('BR'));
MAIN_DIV.appendChild(errorDiv);
MAIN_DIV.removeChild(qrDiv);
MAIN_DIV.appendChild(qrDiv);