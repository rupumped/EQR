function Person(update, url) {
	this.update = update;

	url = url.substring(url.indexOf('/?')+2);
	// TODO: Add support for all unicode letters \p{L}. Currently, Firefox does not support this.
	var re = /([A-Za-z_]+)([0-9]{4})([0-9]{2})([0-9]{2})((?:A|B|AB|O)[+-])([0-9]{3})([0-9]{4})((?:[A-Za-z0-9_]+\&)*)=((?:[A-Za-z0-9_]+\&)*)=((?:[A-Za-z0-9_]+\&[A-Za-z0-9_]+\&[A-Za-z0-9_]+\&[A-Za-z0-9_]+\&)*)=((?:[A-Za-z0-9_]+\&[A-Za-z0-9_]+\&[A-Za-z0-9_]+\&)*)=((?:[A-Za-z_]+[0-9]+\&)*)/
	//         Name        DOB                           Blood Type        Height    Weight    Allergies            = Addictions           = Medications                                                       = Medical Conditions                                 = Emergency Contacts
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

	var allergies = data[i++].match(/([A-Za-z0-9_]+)\&/g);
	this.allergies = [];
	allergies.forEach(element => this.allergies.push(element.substring(0,element.length-1)));

	var addictions = data[i++].match(/([A-Za-z0-9_]+)\&/g);
	this.addictions = [];
	addictions.forEach(element => this.addictions.push(element.substring(0,element.length-1)));

	var medications = data[i++].match(/([A-Za-z0-9_]+\&[A-Za-z0-9_]+\&[A-Za-z0-9_]+\&[A-Za-z0-9_]+)\&/g)
	//                                  Name         & Dosage       & Frequency    & Reason
	this.medications = [];
	medications.forEach(element => {
		var medData = element.match(/([A-Za-z0-9_]+)\&/g);
		this.medications.push({
			name: medData[0].substring(0,medData[0].length-1),
			dose: medData[1].substring(0,medData[1].length-1),
			freq: medData[2].substring(0,medData[2].length-1),
			reason: medData[3].substring(0,medData[3].length-1)
		});
	});

	var conditions = data[i++].match(/([A-Za-z0-9_]+\&[A-Za-z0-9_]+\&[A-Za-z0-9_]+)\&/g)
	//                                 Name         & Effect       & Relevance
	this.conditions = [];
	conditions.forEach(element => {
		var medData = element.match(/([A-Za-z0-9_]+)\&/g);
		this.conditions.push({
			name: medData[0].substring(0,medData[0].length-1),
			effect: medData[1].substring(0,medData[1].length-1),
			relevance: medData[2].substring(0,medData[2].length-1)
		});
	});

	var contacts = data[i++].match(/([A-Za-z]+[0-9]+)\&/g);
	//                               Name     Number
	this.contacts = [];
	contacts.forEach(element => {
		this.contacts.push({
			name: element.match(/[A-Za-z]+/g)[0],
			number: element.match(/[0-9]+/g)[0]
		});
	});
	
	console.log(this.encode());
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
		iic[i][0].input.onchange = () => this.medications[i].name = decodeStr(iic[i][0].input.value);
		tr.appendChild(iic[i][0].cell);

		iic[i].push(getInputInCell(decodeStr(this.medications[i].dose)));
		iic[i][1].input.onchange = () => this.medications[i].dose = decodeStr(iic[i][1].input.value);
		tr.appendChild(iic[i][1].cell);

		iic[i].push(getInputInCell(decodeStr(this.medications[i].freq)));
		iic[i][2].input.onchange = () => this.medications[i].freq = decodeStr(iic[i][2].input.value);
		tr.appendChild(iic[i][2].cell);

		iic[i].push(getInputInCell(decodeStr(this.medications[i].reason)));
		iic[i][3].input.onchange = () => this.medications[i].reason = decodeStr(iic[i][3].input.value);
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
		iic[i][0].input.onchange = () => this.conditions[i].name = decodeStr(iic[i][0].input.value);
		tr.appendChild(iic[i][0].cell);

		iic[i].push(getInputInCell(decodeStr(this.conditions[i].effect)));
		iic[i][1].input.onchange = () => this.conditions[i].effect = decodeStr(iic[i][1].input.value);
		tr.appendChild(iic[i][1].cell);

		iic[i].push(getInputInCell(decodeStr(this.conditions[i].relevance)));
		iic[i][2].input.onchange = () => this.conditions[i].relevance = decodeStr(iic[i][2].input.value);
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
		iic[i][0].input.onchange = () => this.contacts[i].name = decodeStr(iic[i][0].input.value);
		tr.appendChild(iic[i][0].cell);

		iic[i].push(getInputInCell(`${this.contacts[i].number.substring(0,3)}-${this.contacts[i].number.substring(3,6)}-${this.contacts[i].number.substring(6,10)}`));
		iic[i][1].input.pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
		iic[i][1].input.onchange = () => this.contacts[i].number = iic[i][1].input.value.split('-').join('');
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

function getInputInCell(value) {
	var td = document.createElement('TD');
	var input = document.createElement('INPUT');
	input.setAttribute('type','text');
	input.setAttribute('value',value);
	td.appendChild(input);
	return {cell: td, input: input};
}

function decodeStr(str) {
	return str.replace('_',' ');
}

function encodeStr(str) {
	return str.trim().replace(' ','_');
}