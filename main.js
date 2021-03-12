const DEFAULT_ENCODING = '?Taylor_Doe19830317A+6020180Namoxicillin&ampicillin&bees&=gambling&=acetaminophen&500mg&weekly&pain&insulin&1_unit&before_meals&diabetes&=diabetes&affects_blood_sugar&I_may_be_in_ketoacidosis&=Ann6025551234partner&Lucas4805551234sibling&=';

/**
 * Assigns HTML element with specified value and onchange event handler.
 *
 * Used by updateForm to edit elements.
 *
 * @param  {String} id        ID of HTML element to set.
 * @param  {String} value     Value to assign to element.
 * @param  {Object} onchange  Function triggered on change event.
 */
function setFormElement(id, value, onchange) {
	var el = document.getElementById(id);
	el.setAttribute('value',value);
	el.onchange = onchange;
}

/**
 * Fill in input fields to HTML.
 *
 * Returns a table cell with a text input box inside of it. Used by getTable.
 *
 * @param  {String} value  Value to put in the HTML input element.
 * @return {Object}        Object with two attributes: td, the table cell, and input, the input element contained in the td.
 */
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
	document.getElementById('medicationsTableWrapper').appendChild(person.getTable(
		[ {title: 'Name', fieldname: 'name'}, {title: 'Dosage', fieldname: 'dose'}, {title: 'Frequency', fieldname: 'freq'}, {title: 'Reason', fieldname: 'reason'} ],
		person.medications));

	document.getElementById('conditionsTableWrapper').innerHTML = '';
	document.getElementById('conditionsTableWrapper').appendChild(person.getTable(
		[ {title: 'Name', fieldname: 'name'}, {title: 'Symptoms', fieldname: 'effect'}, {title: 'Relevance During Emergency', fieldname: 'relevance'} ],
		person.conditions));

	document.getElementById('contactsTableWrapper').innerHTML = '';
	document.getElementById('contactsTableWrapper').appendChild(person.getTable(
		[ {title: 'Name', fieldname: 'name'}, {title: 'Phone Number', fieldname: 'number'}, {title: 'Relationship', fieldname: 'relation'} ],
		person.contacts));
}

// Initialize Person from URL.
var person;
// If the URL contains an encoding
if (window.location.href.includes('?')) {
	// Try to construct a Person using it, and display error if it fails.
	try {
		person = new Person(updateForm, window.location.href);
	} catch (error) {
		document.getElementById('mainDiv').style.display = 'none';
		document.getElementById('backup').style.display = 'block';
		document.getElementById('goHome').onclick = () => window.location.href = BASE_URL + FORM_NAME;
	}
// If the URL does not contain an encoding, use default encoding.
} else {
	person = new Person(updateForm, DEFAULT_ENCODING)
}

// As long as there wasn't an error constructing the Person
if (person) {
	updateForm();

	// Initialize all fields to clear when clicked for the first time
	['name', 'dob', 'blood', 'heightFt', 'heightIn', 'weight', 'allergies', 'addictions'].forEach(id => {
		var el = document.getElementById(id);
		el.hasBeenClicked = false;
		el.onclick = () => {
			if (!el.hasBeenClicked) {
				el.hasBeenClicked = true;
				el.setAttribute('placeholder', el.value);
				el.value = '';
			}
		}
	});

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

			code = BASE_URL + FORM_NAME + '?' + valResult.encoding;
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

/**
 * Fit the header text, "Emergency Medical Information," to span the whole page.
 *
 * Resizes the form title text to barely fill the width of the form.
 *
 * @param  {Object} evt  Event object. This is unused, but required for fit2page to be assigned to the onload event.
 */
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

	if (person) updateForm();
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
window.addEventListener('resize', fit2page);
window.addEventListener('orientationchange', fit2page);
screen.orientationchange = fit2page;