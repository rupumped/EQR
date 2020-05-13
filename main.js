const DEFAULT_ENCODING = '/?Taylor_Doe19830317A+6020180Namoxicillin&ampicillin&bees&=gambling&=acetaminophen&500mg&weekly&pain&insulin&1_unit&before_meals&diabetes&=diabetes&affects_blood_sugar&I_may_be_in_ketoacidosis&=Ann6025551234partner&Lucas4805551234sibling&=';

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
	try {
		person = new Person(updateForm, window.location.href);
	} catch (error) {
		document.getElementById('mainDiv').style.display = 'none';
		document.getElementById('backup').style.display = 'block';
		document.getElementById('goHome').onclick = () => window.location.href = BASE_URL;
	}
} else {
	person = new Person(updateForm, DEFAULT_ENCODING)
}

if (person) {
	updateForm();

	// Set up QR code
	var qrDiv = document.getElementById('qrcode');
	var qrcode = new QRCode(qrDiv);

	// Add generate button to HTML
	var wrapper = document.getElementById('wrapper');
	var errorDiv = document.getElementById('errorDiv');
	var printButtonWrapper = document.getElementById('printButtonWrapper');
	var downloadPageWrapper = document.getElementById('downloadPageWrapper');
	var walletTextH = document.getElementById('walletTextH');
	var code;
	document.getElementById('generate').onclick = function() {
		errorDiv.innerHTML='';
		qrcode.clear();
		var valResult = person.validate();
		if (valResult.result) {
			// Generate QR code
			qrDiv.style.display = 'initial';
			errorDiv.innerHTML='';

			code = BASE_URL + '?' + valResult.encoding;
			console.log(code);
			qrcode.makeCode(code);

			// Add "Print" button
			printButtonWrapper.style.display = 'initial';
			document.getElementById('print').onclick = () => {
				wrapper.style.display = 'none';
				document.getElementById('printPageWrapper').style.display = 'initial';
				document.body.style.backgroundColor = 'white';

				var qrImgV = qrDiv.children[1].cloneNode(true);
				qrImgV.setAttribute('id','qrImgV');
				document.getElementById('walletCardV').appendChild(qrImgV);

				var qrImgH = qrDiv.children[1].cloneNode(true);
				qrImgH.setAttribute('id','qrImgH');
				walletTextH.appendChild(qrImgH);
				walletTextH.innerHTML += ' EMERGENCY MEDICAL INFORMATION<br><br>← SCAN ME'
				window.print();
			}
			document.getElementById('download').onclick = () => {
				wrapper.style.display = 'none';
				downloadPageWrapper.style.display = 'initial';
				document.body.style.backgroundColor = 'white';

				var qrImg = qrDiv.children[1].cloneNode(true);
				downloadPageWrapper.appendChild(qrImg);
			}
		} else {
			printButtonWrapper.style.display = 'none';
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

	var returnFn = () => window.location.href = code;
	document.getElementById('returnFromPrint').onclick = returnFn;
	document.getElementById('returnFromDownload').onclick = returnFn;
}


function fit2page(evt) {
	// Resize Header Font
	var header = document.getElementById('header');
	var headerText = document.getElementById('headerText');
	var help = document.getElementById('help');
	var maxHeaderTextWidth = 0.8*(header.offsetWidth - help.offsetWidth);
	var headerFontSize = 1;
	headerText.style.fontSize = `${headerFontSize}px`;
	while (headerText.offsetWidth<maxHeaderTextWidth) {
		headerText.style.fontSize = `${++headerFontSize}px`;
	}
	headerText.style.fontSize = `${--headerFontSize}px`;
}

// Cross-platform post-load script from https://stackoverflow.com/questions/807878/how-to-make-javascript-execute-after-page-load
if(window.attachEvent) {
    window.attachEvent('onload', fit2page);
} else {
    if(window.onload) {
        var curronload = window.onload;
        var newonload = function(evt) {
            curronload(evt);
            fit2page(evt);
        };
        window.onload = newonload;
    } else {
        window.onload = fit2page;
    }
}