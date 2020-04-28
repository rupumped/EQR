// Get screen DPI
var devicePixelRatio = 1;//window.devicePixelRatio || 1;
var dpi_x = document.getElementById('testdiv').offsetWidth * devicePixelRatio;
var dpi_y = document.getElementById('testdiv').offsetHeight * devicePixelRatio;
var dpi = (dpi_x+dpi_y)/2;

function setFormElement(id, value, onchange) {
	var el = document.getElementById(id);
	el.setAttribute('value',value);
	el.onchange = onchange;
}

// Fill in input fields to HTML
function updateForm() {
	setFormElement('name', decodeStr(person.name), () => person.name = encodeStr(document.getElementById('name').value));
	setFormElement('dob', `${person.DOB.yr}-${person.DOB.mo}-${person.DOB.da}`, () => {
		var dobArr = document.getElementById('dob').value.split('-');
		person.DOB = { yr: dobArr[0], mo: dobArr[1], da: dobArr[2] };
	});
	setFormElement('blood', person.blood, () => {
		document.getElementById('blood').value = document.getElementById('blood').value.toUpperCase();
		person.blood = document.getElementById('blood').value;
	});
	setFormElement('heightFt', person.height.ft, () => person.height.ft = parseInt(document.getElementById('heightFt').value));
	setFormElement('heightIn', person.height.in, () => person.height.in = parseInt(document.getElementById('heightIn').value));
	setFormElement('weight', person.weight, () => person.weight = parseInt(document.getElementById('weight').value));
	setFormElement('suicide', person.suicide, () => person.suicide = document.getElementById('suicide').checked);
	setFormElement('allergies', decodeStr(person.allergies.join()), () => {
		let allergies = myTrim(document.getElementById('allergies').value,'[\\s,]').split(',');
		for (let i=0; i<allergies.length; i++) {
			allergies[i] = encodeStr(allergies[i]);
		}
		if (allergies.length==1 && allergies[0]=='') allergies = [];
		person.allergies = allergies;
	});
	setFormElement('addictions', decodeStr(person.addictions.join()), () => {
		let addictions = myTrim(document.getElementById('addictions').value,'[\\s,]').split(',');
		for (let i=0; i<addictions.length; i++) {
			addictions[i] = encodeStr(addictions[i]);
		}
		if (addictions.length==1 && addictions[0]=='') addictions = [];
		person.addictions = addictions;
	});


	document.getElementById('medicationsTableWrapper').innerHTML = '';
	document.getElementById('medicationsTableWrapper').appendChild(person.getMedsTable());

	document.getElementById('conditionsTableWrapper').innerHTML = '';
	document.getElementById('conditionsTableWrapper').appendChild(person.getConditionsTable());

	document.getElementById('contactsTableWrapper').innerHTML = '';
	document.getElementById('contactsTableWrapper').appendChild(person.getContactsTable());
}

// Initialize Person from URL
var person;
if (window.location.href.includes('/?')) {
	person = new Person(updateForm, window.location.href);
} else {
	person = new Person(updateForm, '/?Taylor_Doe19830317A+6020180Namoxicillin&ampicillin&bees&=gambling&=acetaminophen&500mg&weekly&pain&insulin&1_unit&before_meals&diabetes&=diabetes&affects_blood_sugar&I_may_be_in_ketoacidosis&=Ann6025551234partner&Lucas4805551234sibling&=')
}

updateForm();

// Set up QR code
var qrDiv = document.getElementById('qrcode');
var qrcode = new QRCode(qrDiv);

// Add generate button to HTML
var errorDiv = document.getElementById('errorDiv');
var generateButton = document.getElementById('generate');
var printButtonWrapper = document.getElementById('printButtonWrapper');
var printButton = document.getElementById('print');
var code;
generateButton.onclick = function() {
	errorDiv.innerHTML='';
	qrcode.clear();
	var valResult = person.validate();
	if (valResult.result) {
		// Generate QR code
		qrDiv.style.display = 'initial';
		errorDiv.innerHTML='';
		//code = 'file:///C:/Users/nick/Documents/GitHub/EQR/index.html/?' + valResult.encoding;
		code = 'https://rupumped.github.io/EQR/?' + valResult.encoding;
		console.log(code);
		qrcode.makeCode(code);

		// Add "Print" button
		printButtonWrapper.style.display = 'initial';
		printButton.onclick = () => {
			document.getElementById('wrapper').style.display = 'none';
			document.getElementById('printPageWrapper').style.display = 'initial';
			document.body.style.backgroundColor = 'white';

			var qrImgV = qrDiv.children[1].cloneNode(true);
			qrImgV.setAttribute('id','qrImgV');
			document.getElementById('walletCardV').appendChild(qrImgV);

			var qrImgH = qrDiv.children[1].cloneNode(true);
			qrImgH.setAttribute('id','qrImgH');
			document.getElementById('walletTextH').appendChild(qrImgH);
			document.getElementById('walletTextH').innerHTML += ' EMERGENCY MEDICAL INFORMATION<br><br>← SCAN ME'
		}
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

var returnButton = document.getElementById('return');
returnButton.onclick = function() {
	window.location.href = code;
}