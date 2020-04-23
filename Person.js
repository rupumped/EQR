const REGEX = {
	NAME: '[A-Za-z_\\.\\-]+',
	BLOOD: '(?:A|B|AB|O)[+-]',
	HEIGHT: '\\d{3}',
	WEIGHT: '\\d{4}',
	TEXT: '[\\w\\.\\-]+'
}
const NAME_ERROR_MSG = ' must only contain English letters, spaces, periods, and hyphens. At this time, we cannot encode other special characters or numbers.';
const TEXT_ERROR_MSG = ' must only contain English letters, numbers, spaces, periods, and hyphens. At this time, we cannot encode other special characters.';

function Person(update, url) {
	this.update = update;

	url = url.substring(url.indexOf('/?')+2);
	// TODO: Add support for all unicode letters \p{L}. Currently, Firefox does not support this.
	var re = new RegExp('('+REGEX.NAME+')' + '(\\d{4})(\\d{2})(\\d{2})' + '('+REGEX.BLOOD+')' + '('+REGEX.HEIGHT+')' + '('+REGEX.WEIGHT+')' + '((?:'+REGEX.TEXT+'\\&)*)' + '=((?:'+REGEX.TEXT+'\\&)*)' + '=((?:(?:'+REGEX.TEXT+'\\&){4})*)' + '=((?:(?:'+REGEX.TEXT+'\\&){3})*)' + '=((?:'+REGEX.NAME+'\\d+\\&)*)=');
	//                   Name                 DOB                                Blood Type            Height                 Weight                 Allergies                    = Addictions                  = Medications                        = Medical Conditions                 = Emergency Contacts           =
	var data = url.match(re);
	var i=1;
	this.name = data[i++];
	this.DOB = {
		yr: data[i++],
		mo: data[i++],
		da: data[i++]
	};
	this.blood = data[i++];
	this.height = parseInt(data[i++]);
	this.weight = parseInt(data[i++]);

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

	var contacts = data[i++].match(new RegExp(REGEX.NAME+'\\d+\\&', 'g'));
	this.contacts = [];
	if (contacts) contacts.forEach(element => {
		this.contacts.push({
			name: element.match(new RegExp(REGEX.NAME, 'g'))[0],
			number: element.match(/\d+/g)[0]
		});
	});
}

Person.prototype.encode = function() {
	var str = `${this.name}${this.DOB.yr}${this.DOB.mo}${this.DOB.da}${this.blood}${pad(this.height,3)}${pad(this.weight,4)}`;
	this.allergies.forEach(allergen => str+=allergen+'&');
	str+='=';
	this.addictions.forEach(addiction => str+=addiction+'&');
	str+='=';
	this.medications.forEach(med => str+=`${med.name}&${med.dose}&${med.freq}&${med.reason}&`);
	str+='=';
	this.conditions.forEach(med => str+=`${med.name}&${med.effect}&${med.relevance}&`);
	str+='=';
	this.contacts.forEach(med => str+=`${med.name}${med.number}&`);
	str+='=';
	return str;
}

Person.prototype.remove = function(what, index) {
	switch (what) {
		case 'medication':
			this.medications.splice(index, 1);
			break;
		case 'condition':
			this.conditions.splice(index, 1);
			break;
		case 'contact':
			this.contacts.splice(index, 1);
			break;
		default:
			alert('Error: What should I remove?');
	}
	this.update();
}

Person.prototype.getMedsTable = function() {
	var thisPerson = this;
	var medsTable = document.createElement('TABLE');
	var medsTbody = document.createElement('TBODY');

	var headerTR = document.createElement('TR');
	var td_0_0 = document.createElement('TD');
	headerTR.appendChild(td_0_0);
	var td_0_1 = document.createElement('TD');
	td_0_1.appendChild(document.createTextNode('Name'));
	headerTR.appendChild(td_0_1);
	var td_0_2 = document.createElement('TD');
	td_0_2.appendChild(document.createTextNode('Dosage'));
	headerTR.appendChild(td_0_2);
	var td_0_3 = document.createElement('TD');
	td_0_3.appendChild(document.createTextNode('Frequency'));
	headerTR.appendChild(td_0_3);
	var td_0_4 = document.createElement('TD');
	td_0_4.appendChild(document.createTextNode('Reason'));
	headerTR.appendChild(td_0_4);
	medsTbody.appendChild(headerTR);

	var iic = new Array(this.medications.length);
	for (let i=0; i<this.medications.length; i++) {
		var tr = document.createElement('TR');

		var td_0 = document.createElement('TD');
		var closeButton = document.createElement('INPUT');
		closeButton.setAttribute('type','button');
		closeButton.setAttribute('value','X');
		closeButton.onclick = function() {
			thisPerson.remove('medication',i);
		}
		td_0.appendChild(closeButton);
		tr.appendChild(td_0);

		iic[i] = [];

		iic[i].push(getInputInCell(decodeStr(this.medications[i].name)));
		iic[i][0].input.onchange = () => this.medications[i].name = encodeStr(iic[i][0].input.value);
		tr.appendChild(iic[i][0].cell);

		iic[i].push(getInputInCell(decodeStr(this.medications[i].dose)));
		iic[i][1].input.onchange = () => this.medications[i].dose = encodeStr(iic[i][1].input.value);
		tr.appendChild(iic[i][1].cell);

		iic[i].push(getInputInCell(decodeStr(this.medications[i].freq)));
		iic[i][2].input.onchange = () => this.medications[i].freq = encodeStr(iic[i][2].input.value);
		tr.appendChild(iic[i][2].cell);

		iic[i].push(getInputInCell(decodeStr(this.medications[i].reason)));
		iic[i][3].input.onchange = () => this.medications[i].reason = encodeStr(iic[i][3].input.value);
		tr.appendChild(iic[i][3].cell);

		medsTbody.appendChild(tr);
	}

	var lastRow = document.createElement('TR');
	for (let i=0; i<medsTbody.rows[0].cells.length-1; i++) lastRow.appendChild(document.createElement('TD'));
	var lastCell = document.createElement('TD');
	var addButton = document.createElement('INPUT');
	addButton.setAttribute('type','button');
	addButton.setAttribute('value','Add Medication');
	addButton.onclick = () => {
		thisPerson.medications.push({name: 'Name', dose: 'Dosage', freq: 'Frequency', reason: 'Reason'});
		thisPerson.update();
	}
	lastCell.appendChild(addButton);
	lastRow.appendChild(lastCell);
	medsTbody.appendChild(lastRow);

	medsTable.appendChild(medsTbody);
	return medsTable;
}

Person.prototype.getConditionsTable = function() {
	var thisPerson = this;
	var medsTable = document.createElement('TABLE');
	var medsTbody = document.createElement('TBODY');

	var headerTR = document.createElement('TR');
	var td_0_0 = document.createElement('TD');
	headerTR.appendChild(td_0_0);
	var td_0_1 = document.createElement('TD');
	td_0_1.appendChild(document.createTextNode('Name'));
	headerTR.appendChild(td_0_1);
	var td_0_2 = document.createElement('TD');
	td_0_2.appendChild(document.createTextNode('What does it do to the body?'));
	headerTR.appendChild(td_0_2);
	var td_0_3 = document.createElement('TD');
	td_0_3.appendChild(document.createTextNode('Relevance during emergency'));
	headerTR.appendChild(td_0_3);
	medsTbody.appendChild(headerTR);

	var iic = new Array(this.conditions.length);
	for (let i=0; i<this.conditions.length; i++) {
		var tr = document.createElement('TR');

		var td_0 = document.createElement('TD');
		var closeButton = document.createElement('INPUT');
		closeButton.setAttribute('type','button');
		closeButton.setAttribute('value','X');
		closeButton.onclick = function() {
			thisPerson.remove('condition',i);
		}
		td_0.appendChild(closeButton);
		tr.appendChild(td_0);

		iic[i] = [];

		iic[i].push(getInputInCell(decodeStr(this.conditions[i].name)));
		iic[i][0].input.onchange = () => this.conditions[i].name = encodeStr(iic[i][0].input.value);
		tr.appendChild(iic[i][0].cell);

		iic[i].push(getInputInCell(decodeStr(this.conditions[i].effect)));
		iic[i][1].input.onchange = () => this.conditions[i].effect = encodeStr(iic[i][1].input.value);
		tr.appendChild(iic[i][1].cell);

		iic[i].push(getInputInCell(decodeStr(this.conditions[i].relevance)));
		iic[i][2].input.onchange = () => this.conditions[i].relevance = encodeStr(iic[i][2].input.value);
		tr.appendChild(iic[i][2].cell);

		medsTbody.appendChild(tr);
	}

	var lastRow = document.createElement('TR');
	for (let i=0; i<medsTbody.rows[0].cells.length-1; i++) lastRow.appendChild(document.createElement('TD'));
	var lastCell = document.createElement('TD');
	var addButton = document.createElement('INPUT');
	addButton.setAttribute('type','button');
	addButton.setAttribute('value','Add Condition');
	addButton.onclick = () => {
		thisPerson.conditions.push({name: 'Name', effect: 'Effect', relevance: 'Relevance'});
		thisPerson.update();
	}
	lastCell.appendChild(addButton);
	lastRow.appendChild(lastCell);
	medsTbody.appendChild(lastRow);

	medsTable.appendChild(medsTbody);
	return medsTable;
}

Person.prototype.getContactsTable = function() {
	var thisPerson = this;
	var medsTable = document.createElement('TABLE');
	var medsTbody = document.createElement('TBODY');

	var headerTR = document.createElement('TR');
	var td_0_0 = document.createElement('TD');
	headerTR.appendChild(td_0_0);
	var td_0_1 = document.createElement('TD');
	td_0_1.appendChild(document.createTextNode('Name'));
	headerTR.appendChild(td_0_1);
	var td_0_2 = document.createElement('TD');
	td_0_2.appendChild(document.createTextNode('Phone Number'));
	headerTR.appendChild(td_0_2);
	medsTbody.appendChild(headerTR);

	var iic = new Array(this.contacts.length);
	for (let i=0; i<this.contacts.length; i++) {
		var tr = document.createElement('TR');

		var td_0 = document.createElement('TD');
		var closeButton = document.createElement('INPUT');
		closeButton.setAttribute('type','button');
		closeButton.setAttribute('value','X');
		closeButton.onclick = function() {
			thisPerson.remove('contact',i);
		}
		td_0.appendChild(closeButton);
		tr.appendChild(td_0);

		iic[i] = [];

		iic[i].push(getInputInCell(decodeStr(this.contacts[i].name)));
		iic[i][0].input.onchange = () => this.contacts[i].name = encodeStr(iic[i][0].input.value);
		tr.appendChild(iic[i][0].cell);

		var thisNumber = this.contacts[i].number;
		if (thisNumber.length===10) {
			thisNumber = `${this.contacts[i].number.substring(0,3)}-${this.contacts[i].number.substring(3,6)}-${this.contacts[i].number.substring(6,10)}`;
		}
		iic[i].push(getInputInCell(thisNumber));
		iic[i][1].input.pattern='[\\d\\-\\(\\) ]+'
		iic[i][1].input.onchange = () => this.contacts[i].number = iic[i][1].input.value.match(/\d/g).join('');
		tr.appendChild(iic[i][1].cell);

		medsTbody.appendChild(tr);
	}

	var lastRow = document.createElement('TR');
	for (let i=0; i<medsTbody.rows[0].cells.length-1; i++) lastRow.appendChild(document.createElement('TD'));
	var lastCell = document.createElement('TD');
	var addButton = document.createElement('INPUT');
	addButton.setAttribute('type','button');
	addButton.setAttribute('value','Add Contact');
	addButton.onclick = () => {
		thisPerson.contacts.push({name: 'Name', number: '4805551234'});
		thisPerson.update();
	}
	lastCell.appendChild(addButton);
	lastRow.appendChild(lastCell);
	medsTbody.appendChild(lastRow);

	medsTable.appendChild(medsTbody);
	return medsTable;
}

Person.prototype.validate = function() {
	var result = true;
	var errors = [];
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
	if (this.height<0 || this.height>999 || !Number.isInteger(this.height)) {
		result = false;
		errors.push(`Height "${this.height}" must a whole number between 0 and 999.`);
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
			errors.push(`Condition #${i+1} name "${decodeStr(med.name)}"${TEXT_ERROR_MSG}`);
		}
		aMatch = med.effect.match(REGEX.TEXT);
		if (!aMatch || aMatch.length!==1 || aMatch[0]!==med.effect) {
			result = false;
			errors.push(`Condition #${i+1} effect "${decodeStr(med.effect)}"${TEXT_ERROR_MSG}`);
		}
		aMatch = med.relevance.match(REGEX.TEXT);
		if (!aMatch || aMatch.length!==1 || aMatch[0]!==med.relevance) {
			result = false;
			errors.push(`Condition #${i+1} relevance "${decodeStr(med.relevance)}"${TEXT_ERROR_MSG}`);
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
	});

	// Final Check
	if (result) {
		try {
			var encoding = '/?' + person.encode();
			var newPerson = new Person(this.update, encoding);
			var newEncoding = '/?' + newPerson.encode();
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

	return {result: result, errors: errors};
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