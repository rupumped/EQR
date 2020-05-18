const REGEX = {
	NAME: '[A-Za-z_\\.\\-]+',
	BLOOD: '(?:A|B|AB|O)[+-]',
	HEIGHT: '\\d{3}',
	WEIGHT: '\\d{4}',
	TEXT: '[\\w\\.\\-]+'
}
const NAME_ERROR_MSG = ' must only contain English letters, spaces, periods, and hyphens. It cannot be left blank. At this time, we cannot encode other special characters or numbers.';
const TEXT_ERROR_MSG = ' must only contain English letters, numbers, spaces, periods, and hyphens. It cannot be left blank. At this time, we cannot encode other special characters.';
const TESTSPAN = document.getElementById('testSpan');
const EM_SIZE = document.getElementById('testem').offsetWidth;
const TEST_TABLE_INPUT = document.getElementById('testTableInput');

function Person(update, url) {
	this.update = update;

	url = url.substring(url.indexOf('/?')+2);
	// TODO: Add support for all unicode letters \p{L}. Currently, Firefox does not support this.
	var re = new RegExp('('+REGEX.NAME+')' + '(\\d{4})(\\d{2})(\\d{2})' + '('+REGEX.BLOOD+')' + '('+REGEX.HEIGHT+')' + '('+REGEX.WEIGHT+')' + '([YN])' + '((?:'+REGEX.TEXT+'\\&)*)' + '=((?:'+REGEX.TEXT+'\\&)*)' + '=((?:(?:'+REGEX.TEXT+'\\&){4})*)' + '=((?:(?:'+REGEX.TEXT+'\\&){3})*)' + '=((?:'+REGEX.NAME+'\\d+'+REGEX.NAME+'\\&)*)=');
	//                   Name                 DOB                          Blood Type            Height                 Weight                 Suicide    Allergies                    = Addictions                  = Medications                        = Medical Conditions                 = Emergency Contacts                       =
	var data = url.match(re);
	var i=1;
	this.name = data[i++];
	this.DOB = {
		yr: data[i++],
		mo: data[i++],
		da: data[i++]
	};
	this.blood = data[i++];

	var heightStr = data[i++];
	this.height = { ft: parseInt(heightStr.substring(0,1)), in: parseInt(heightStr.substring(1,3)) };
	this.weight = parseInt(data[i++]);

	this.suicide = data[i++]==='Y';

	var allergies = data[i++].match(new RegExp('('+REGEX.TEXT+')\\&', 'g'));
	this.allergies = [];
	if (allergies) allergies.forEach(element => this.allergies.push(element.substring(0,element.length-1)));

	var addictions = data[i++].match(new RegExp('('+REGEX.TEXT+')\\&', 'g'));
	this.addictions = [];
	if (addictions) addictions.forEach(element => this.addictions.push(element.substring(0,element.length-1)));

	var medications = data[i++].match(new RegExp('(?:'+REGEX.TEXT+'\\&){4}', 'g'));
	this.medications = [];
	if (medications) medications.forEach(element => {
		var medData = element.match(new RegExp('('+REGEX.TEXT+')\\&', 'g'));
		this.medications.push({
			name: medData[0].substring(0,medData[0].length-1),
			dose: medData[1].substring(0,medData[1].length-1),
			freq: medData[2].substring(0,medData[2].length-1),
			reason: medData[3].substring(0,medData[3].length-1)
		});
	});

	var conditions = data[i++].match(new RegExp('(?:'+REGEX.TEXT+'\\&){3}', 'g'))
	this.conditions = [];
	if (conditions) conditions.forEach(element => {
		var medData = element.match(new RegExp('('+REGEX.TEXT+')\\&', 'g'));
		this.conditions.push({
			name: medData[0].substring(0,medData[0].length-1),
			effect: medData[1].substring(0,medData[1].length-1),
			relevance: medData[2].substring(0,medData[2].length-1)
		});
	});

	var contacts = data[i++].match(new RegExp(REGEX.NAME+'\\d+'+REGEX.NAME+'\\&', 'g'));
	this.contacts = [];
	if (contacts) contacts.forEach(element => {
		var nameAndRelation = element.match(new RegExp(REGEX.NAME, 'g'));
		this.contacts.push({
			name: nameAndRelation[0],
			number: element.match(/\d+/g)[0],
			relation: nameAndRelation[1]
		});
	});
}

Person.prototype.encode = function() {
	var str = `${this.name}${this.DOB.yr}${this.DOB.mo}${this.DOB.da}${this.blood}${this.height.ft}${pad(this.height.in,2)}${pad(this.weight,4)}`;
	str+= this.suicide ? 'Y' : 'N';
	this.allergies.forEach(allergen => str+=allergen+'&');
	str+='=';
	this.addictions.forEach(addiction => str+=addiction+'&');
	str+='=';
	this.medications.forEach(med => str+=`${med.name}&${med.dose}&${med.freq}&${med.reason}&`);
	str+='=';
	this.conditions.forEach(med => str+=`${med.name}&${med.effect}&${med.relevance}&`);
	str+='=';
	this.contacts.forEach(med => str+=`${med.name}${med.number}${med.relation}&`);
	str+='=';
	return str;
}

function getTextWidth(str) {
	TESTSPAN.innerHTML = `<p>${str}</p>`;
	return TESTSPAN.offsetWidth+EM_SIZE;
}

function updateColumnWidths(table) {
	var tbody = table.children[0];
	var hr = tbody.children[0];
	hr.children[0].style.width = `${document.getElementById('testCloseButton').offsetWidth}px`;				// Set width of first column to be that of the close button.
	var sumWidth = document.getElementById('testCloseButton').offsetWidth;									// Initialize sumWidth using the width of the first column.
	for (let c=1; c<hr.children.length; c++) {																// For each remaining column in the table:
		var maxWidth = getTextWidth(hr.children[c].textContent);											// Initialize maxWidth with the width of the header row element in this column
		for (let r=1; r<tbody.children.length-1; r++) {														// For each remaining row until the last:
			maxWidth = Math.max(maxWidth, getTextWidth(tbody.children[r].children[c].children[0].value));	// Reset the maxWidth if the width of the text in this row is greater than the current maxWidth.
		}
		hr.children[c].style.width = `${maxWidth}px`;

		sumWidth+= maxWidth;
	}
	var targetWidth = document.getElementById('form').offsetWidth-1;
	if (sumWidth<targetWidth){
		var splitDiff = Math.floor((targetWidth-sumWidth)/(hr.children.length-1));
		sumWidth = parseInt(hr.children[0].style.width);
		for (let c=1; c<hr.children.length; c++) {
			sumWidth+= parseInt(hr.children[c].style.width)+splitDiff;
			hr.children[c].style.width = `${parseInt(hr.children[c].style.width)+splitDiff}px`;
		}
		hr.children[hr.children.length-1].style.width = `${parseInt(hr.children[hr.children.length-1].style.width)+targetWidth-sumWidth}px`;
		sumWidth = targetWidth;
		table.style.tableLayout = 'auto';
	} else {
		table.style.tableLayout = 'fixed';
	}

	table.style.width = `${sumWidth}px`;
}

/**
 * Constructs HTML table for EQR form.
 *
 * Builds a medications, conditions, or contacts table for the EQR form.
 *
 * @param  {Object[]} cols Array of column objects containing 'title', 'fieldname'
 * @param  {Object[]} arr  The array to represent in the table. Field names must correspond to the fieldname values in cols.
 * @return {Object}        HTML table element.
 */
Person.prototype.getTable = function(cols, arr) {
	// Initialize table and body
	var thisPerson = this;
	var medsTable = document.createElement('TABLE');
	var medsTbody = document.createElement('TBODY');
	
	// Create header row
	var headerTR = document.createElement('TR');
	var td_0_0 = document.createElement('TH');
	headerTR.appendChild(td_0_0);
	for (let c=0; c<cols.length; c++) {
		var td = document.createElement('TH');
		td.appendChild(document.createTextNode(cols[c].title));
		headerTR.appendChild(td);
	}
	medsTbody.appendChild(headerTR);

	// Make a new row for each medication
	var iic = new Array(arr.length);
	for (let i=0; i<arr.length; i++) {
		var tr = document.createElement('TR');

		// Add close button in first column to allow user to remove entry
		var td_0 = document.createElement('TD');
		var closeButton = document.createElement('INPUT');
		closeButton.setAttribute('type','image');
		closeButton.setAttribute('src',BASE_URL+'close_button.png');
		closeButton.onclick = function() {
			arr.splice(i, 1);
			thisPerson.update();
		}
		closeButton.className += ' close';
		td_0.appendChild(closeButton);
		tr.appendChild(td_0);

		iic[i] = [];

		// Add attributes of each entry
		for (let c=0; c<cols.length; c++) {
			if (cols[c].title === 'Phone Number') {
				var thisNumber = arr[i][cols[c].fieldname];
				if (thisNumber.length===10) {
					thisNumber = `${arr[i][cols[c].fieldname].substring(0,3)}-${arr[i][cols[c].fieldname].substring(3,6)}-${arr[i][cols[c].fieldname].substring(6,10)}`;
				}
				iic[i].push(getInputInCell(thisNumber));
				iic[i][c].input.pattern='[\\d\\-\\(\\) ]+'
				iic[i][c].input.oninput = () => {
					arr[i][cols[c].fieldname] = iic[i][c].input.value.match(/\d/g).join('');
					updateColumnWidths(medsTable);
				}
			} else {
				iic[i].push(getInputInCell(decodeStr(arr[i][cols[c].fieldname])));
				iic[i][c].input.oninput = () => {
					arr[i][cols[c]] = encodeStr(iic[i][c].input.value);
					updateColumnWidths(medsTable);
				}
			}
			iic[i][c].input.required = true;
			tr.appendChild(iic[i][c].cell);
		}

		medsTbody.appendChild(tr);
	}

	var lastRow = document.createElement('TR');
	lastRow.appendChild(document.createElement('TD'));
	var lastCell = document.createElement('TD');
	var addButton = document.createElement('INPUT');
	addButton.setAttribute('type','image');
	addButton.setAttribute('src',BASE_URL+'add_button.png');
	addButton.onclick = () => {
		var entry = {};
		cols.forEach(el => entry[el.fieldname] = encodeStr(el.title) );
		arr.push(entry);
		thisPerson.update();
	}
	addButton.className += ' add';
	lastCell.appendChild(addButton);
	lastRow.appendChild(lastCell);
	for (let i=0; i<medsTbody.rows[0].cells.length-2; i++) lastRow.appendChild(document.createElement('TD'));
	medsTbody.appendChild(lastRow);

	medsTable.appendChild(medsTbody);
	updateColumnWidths(medsTable);
	return medsTable;
}

Person.prototype.validate = function() {
	var result = true;
	var errors = [];
	var encoding = '';
	var aMatch = [];

	// Name
	aMatch = this.name.match(new RegExp(REGEX.NAME));
	if (!aMatch || aMatch.length!==1 || aMatch[0]!==this.name) {
		result = false;
		errors.push(`Full name "${decodeStr(this.name)}"${NAME_ERROR_MSG}`);
	}

	// Blood Type
	aMatch = this.blood.match(new RegExp(REGEX.BLOOD));
	if (!aMatch || aMatch.length!==1 || aMatch[0]!==this.blood) {
		result = false;
		errors.push(`Blood type "${this.blood}" must begin with O, A, B, or AB; end with + or -; and contain no other characters.`);
	}

	// Height
	if (this.height.ft<0 || this.height.ft>9 || !Number.isInteger(this.height.ft) || this.height.in<0 || this.height.in>11 || !Number.isInteger(this.height.in)) {
		result = false;
		errors.push(`Height must be a valid height between 0'0" and 9'11".`);
	}

	// Weight
	if (this.weight<0 || this.weight>9999 || !Number.isInteger(this.weight)) {
		result = false;
		errors.push(`Weight "${this.weight}" must a whole number between 0 and 9999.`);
	}

	// Allergies
	this.allergies.forEach((allergen, i) => {
		aMatch = allergen.match(REGEX.TEXT);
		if (!aMatch || aMatch.length!==1 || aMatch[0]!==allergen) {
			result = false;
			errors.push(`Allergen #${i+1} "${decodeStr(allergen)}"${TEXT_ERROR_MSG}`);
		}
	});

	// Addictions
	this.addictions.forEach((addiction, i) => {
		aMatch = addiction.match(REGEX.TEXT);
		if (!aMatch || aMatch.length!==1 || aMatch[0]!==addiction) {
			result = false;
			errors.push(`Addiction #${i+1} "${decodeStr(addiction)}"${TEXT_ERROR_MSG}`);
		}
	});

	// Medications
	this.medications.forEach((med,i) => {
		aMatch = med.name.match(REGEX.TEXT);
		if (!aMatch || aMatch.length!==1 || aMatch[0]!==med.name) {
			result = false;
			errors.push(`Medication #${i+1} name "${decodeStr(med.name)}"${TEXT_ERROR_MSG}`);
		}
		aMatch = med.dose.match(REGEX.TEXT);
		if (!aMatch || aMatch.length!==1 || aMatch[0]!==med.dose) {
			result = false;
			errors.push(`Medication #${i+1} dosage "${decodeStr(med.dose)}"${TEXT_ERROR_MSG}`);
		}
		aMatch = med.freq.match(REGEX.TEXT);
		if (!aMatch || aMatch.length!==1 || aMatch[0]!==med.freq) {
			result = false;
			errors.push(`Medication #${i+1} frequency "${decodeStr(med.freq)}"${TEXT_ERROR_MSG}`);
		}
		aMatch = med.reason.match(REGEX.TEXT);
		if (!aMatch || aMatch.length!==1 || aMatch[0]!==med.reason) {
			result = false;
			errors.push(`Medication #${i+1} reason "${decodeStr(med.reason)}"${TEXT_ERROR_MSG}`);
		}
	});

	// Conditions
	this.conditions.forEach((med,i) => {
		aMatch = med.name.match(REGEX.TEXT);
		if (!aMatch || aMatch.length!==1 || aMatch[0]!==med.name) {
			result = false;
			errors.push(`Medical Condition #${i+1} name "${decodeStr(med.name)}"${TEXT_ERROR_MSG}`);
		}
		aMatch = med.effect.match(REGEX.TEXT);
		if (!aMatch || aMatch.length!==1 || aMatch[0]!==med.effect) {
			result = false;
			errors.push(`Medical Condition #${i+1} effect "${decodeStr(med.effect)}"${TEXT_ERROR_MSG}`);
		}
		aMatch = med.relevance.match(REGEX.TEXT);
		if (!aMatch || aMatch.length!==1 || aMatch[0]!==med.relevance) {
			result = false;
			console.log(aMatch)
			errors.push(`Medical Condition #${i+1} relevance "${decodeStr(med.relevance)}"${TEXT_ERROR_MSG}`);
		}
	});

	// Contacts
	this.contacts.forEach((med,i) => {
		aMatch = med.name.match(REGEX.NAME);
		if (!aMatch || aMatch.length!==1 || aMatch[0]!==med.name) {
			result = false;
			errors.push(`Contact #${i+1} name "${decodeStr(med.name)}"${NAME_ERROR_MSG}`);
		}
		aMatch = med.number.match('\\d+');
		if (!aMatch || aMatch.length!==1 || aMatch[0]!==med.number) {
			result = false;
			errors.push(`Contact #${i+1} phone number "${med.number}" must only include numbers, hyphens, parentheses, and spaces. It cannot be left blank.`);
		}
		aMatch = med.relation.match(REGEX.NAME);
		if (!aMatch || aMatch.length!==1 || aMatch[0]!==med.relation) {
			result = false;
			errors.push(`Contact #${i+1} relationship "${decodeStr(med.relation)}"${NAME_ERROR_MSG}`);
		}
	});

	// Final Check
	if (result) {
		try {
			encoding = person.encode();
			var newPerson = new Person(this.update, '/?'+encoding);
			var newEncoding = newPerson.encode();
			if (encoding !== newEncoding) {
				result = false;
				errors.push(`Unknown error. Encoding can't be replicated. Encoding 1: "${encoding}" Encoding 2: "${newEncoding}`);
			}
		} catch (error) {
			result = false;
			errors.push(`Unknown error. Error message: ${error}`);
			console.error(error);
		}
	}

	return {result: result, errors: errors, encoding: encoding};
}

function getInputInCell(value) {
	var td = document.createElement('TD');
	var input = document.createElement('INPUT');
	input.setAttribute('type','text');
	input.setAttribute('value',value);
	td.appendChild(input);
	return {cell: td, input: input};
}

function decodeStr(str) {
	return myTrim(str,'[\\s_,]').split('_').join(' ');
}

function encodeStr(str) {
	return myTrim(str,'[\\s_,]').split(' ').join('_');
}