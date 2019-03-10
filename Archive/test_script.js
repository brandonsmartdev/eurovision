// function getLanguagesInYear(year) {
	
// 	var languages = {};
// 	var yearName = String(year) + 'f';
	
// 	var lines = secondDatabase.split('\n');
// 	for (var i = 0; i < lines.length; i++) {
// 		var parts = lines[i].split(',');
// 		if (parts[0] == yearName) {
// 			languages[parts[2]] = parts[4];
// 		}
// 	}

// 	console.log(languages);

// }

// getLanguagesInYear(1999);

// function getCountries() {

// 	var countries = [];
// 	var lines = secondDatabase.split('\n');
// 	for (var i = 0; i < lines.length; i++) {
// 		var parts = lines[i].split(',');
// 		if (countries.indexOf(parts[2]) <= -1 && parts[2] != "Country") {
// 			countries.push(parts[2]);
// 		}
// 	}

// 	countries.sort();

// 	console.log(countries);

// }

// function getLanguages() {

// 	var languages = [];
// 	var lines = secondDatabase.split('\n');
// 	for (var i = 0; i < lines.length; i++) {
// 		var parts = lines[i].split(',');
// 		if (languages.indexOf(parts[4]) <= -1 && parts[4] != "Language") {
// 			languages.push(parts[4]);
// 		}
// 	}

// 	languages.sort();

// 	console.log(languages);

// }

// getLanguages();

// printTime();
// var lines = secondDatabase.split('\n');
// for (var i = 0; i < lines.length; i++) {
// 	var parts = lines[i].split(',');
// 	if (parts[0] == '2014f' && parts[2] == 'Germany') {
// 		console.log(parts[4]);
// 		break;
// 	}
// }
// printTime();

// function printTime() {
// 	var d = new Date();
// 	var n = d.getTime();
// 	console.log(n);
// }

//console.log("done");