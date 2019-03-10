var countryIndexes = [
"Albania",
"Andorra",
"Armenia",
"Australia",
"Austria",
"Azerbaijan",
"Belarus",
"Belgium",
"Bosnia & Herzegovina",
"Bulgaria",
"Croatia",
"Cyprus",
"Czech Republic",
"Denmark",
"Estonia",
"F.Y.R. Macedonia",
"Finland",
"France",
"Georgia",
"Germany",
"Greece",
"Hungary",
"Iceland",
"Ireland",
"Israel",
"Italy",
"Latvia",
"Lithuania",
"Luxembourg",
"Malta",
"Moldova",
"Monaco",
"Montenegro",
"Morocco",
"Norway",
"Poland",
"Portugal",
"Romania",
"Russia",
"San Marino",
"Serbia",
"Serbia & Montenegro",
"Slovakia",
"Slovenia",
"Spain",
"Sweden",
"Switzerland",
"The Netherlands",
"Turkey",
"Ukraine",
"United Kingdom",
"Yugoslavia"
];

var languageColors = {
"Albanian": "#02a9ea", // Diff
"Belarusian": "#faff00", // Diff
"Bosnian": "#fc4b23", // Diff
"Bulgarian": "#db995a", // Diff
"Corsican": "#db9c43", // Diff
"Croatian": "#feff85", // Diff
"English": "#9999FF", // Diff
"Estonian": "#22FF22", // Diff
"Finnish": "#d86c00", // Diff
"French": "#FF5555", // Diff
"German": "#ffb8bd", // Diff
"Greek": "#00FFFF", // Diff
"Hebrew": "#654236", // Diff
"Hungarian": "#99032b", // Diff Change
"Icelandic": "#875747", // Diff
"Imaginary": "#e8ffae", // Diff
"Italian": "#0B662B", // Diff
"Macedonian": "#877547", // Diff
"Montenegrin": "#5f0f40", // Diff Change
"Multiple": "#FFA500", // Diff
"Norwegian": "#d6d4a0", // Diff
"Polish": "#0f4c5c", // Diff
"Portugese": "#00FF00", // Diff
"Romanian": "#ffbb5b", // Diff
"Russian": "#ADD8A6", // Diff
"Samogitian": "#427525", // Diff
"Serbian": "#548687", // Diff
"Slovene": "#56445d", // Diff
"Spanish": "#FFFF00", // Diff
"Styrian": "#00FF00", // Diff
"Turkish": "#ef8354", // Diff
};

function getVotesFromCountry(country, startYear, endYear, useJury, useTelevoting, useSemiFinals) {

	var givenScores = [];
	var maxScores = [];
	for (var i = 0; i < countryIndexes.length; i++) {
		givenScores.push(0);
		maxScores.push(0);
	}

	var lines = firstDatabase.split('\n');
	for (var i = 0; i < lines.length; i++) {
		var parts = lines[i].split(',');
		if (parts[4] == country) { // If the voting country is the one desired
			if (parseInt(parts[0]) >= startYear && parseInt(parts[0]) <= endYear) { // If its in the desired year range
				if ((parts[3] == 'J' && useJury) || (parts[3] == 'T' && useTelevoting)) { // If the voting type is correct
					if ((parts[1] == 'f') || useSemiFinals) { // If the final/semi-final type is correct
						index = countryIndexes.indexOf(parts[5]);
						givenScores[index] += parseInt(parts[6]);
						maxScores[index] += 12;
					}
				}
			}
		}
	}

	var fractions = [];
	for (var i = 0; i < countryIndexes.length; i++) {
		if (maxScores[i] === 0) {
			fractions.push(-1);
		}
		else {
			fractions.push(givenScores[i]/maxScores[i]);
		}
	}

	return fractions;

}


function getVotesToCountry(country, startYear, endYear, useJury, useTelevoting, useSemiFinals) {

	var givenScores = [];
	var maxScores = [];
	for (var i = 0; i < countryIndexes.length; i++) {
		givenScores.push(0);
		maxScores.push(0);
	}

	var lines = firstDatabase.split('\n');
	for (var i = 0; i < lines.length; i++) {
		var parts = lines[i].split(',');
		if (parts[5] == country) { // If the receiving country is the one desired
			if (parseInt(parts[0]) >= startYear && parseInt(parts[0]) <= endYear) { // If its in the desired year range
				if ((parts[3] == 'J' && useJury) || (parts[3] == 'T' && useTelevoting)) { // If the voting type is correct
					if ((parts[1] == 'f') || useSemiFinals) { // If the final/semi-final type is correct
						index = countryIndexes.indexOf(parts[4]);
						givenScores[index] += parseInt(parts[6]);
						maxScores[index] += 12;
					}
				}
			}
		}
	}

	var fractions = [];
	for (var i = 0; i < countryIndexes.length; i++) {
		if (maxScores[i] === 0) {
			fractions.push(-1);
		}
		else {
			fractions.push(givenScores[i]/maxScores[i]);
		}
	}

	return fractions;

}

// function getPopularityPerYear(country) {

// 	var maxVotes = {};
// 	var popularity = {};
// 	var attended = {};

// 	var lines = firstDatabase.split('\n');
// 	for (var i = 0; i < lines.length; i++) {
// 		var parts = lines[i].split(',');
// 		if (parts[5] == country) { // If the receiving country is the one desired
// 			var year = parseInt(parts[0]);
// 			if (!(year in attended)) {
// 				attended[year] = "sf";
// 			}
// 			if (parts[1] == 'f') { // If it is a final
// 				attended[year] = "f";
// 				if (!(year in maxVotes)) {
// 					maxVotes[year] = 0;
// 					popularity[year] = 0;
// 				}
// 				maxVotes[year] += 58;
// 				popularity[year] += parseInt(parts[6]);
// 			}
// 		}
// 	}

// 	var results = {};
// 	for (var year = 1975; year <= 2017; year++) {
// 		if (!(year in attended)) {
// 			results[year] = -2;
// 		}
// 		else if (attended[year] == "sf") {
// 			results[year] = -1;
// 		}
// 		else {
// 			results[year] = popularity[year]/maxVotes[year];
// 		}
// 	}

// 	console.log(results);
// 	return results;

// }


function getPopularityPerYear(country) {

	var maxPosition = {};
	var position = {};
	var attended = {};

	// Get Max Position and Achieved Position In Each Final

	var lines = secondDatabase.split('\n');
	for (var i = 0; i < lines.length; i++) {
		var parts = lines[i].split(',');
		var yearName = parts[0];
		if (yearName.slice(-2) != "sf") {
			var year = parseInt(yearName.slice(0, 4));
			if (!(year in maxPosition)) {
				maxPosition[year] = 0;
			}
			maxPosition[year] = Math.max(maxPosition[year], parseInt(parts[3]));
			if (parts[2] == country) {
				position[year] = parseInt(parts[3]);
			}
		}
	}

	// Create final dictionary

	var hasStarted = false;
	var results = {};
	for (var year = 1975; year <= 2017; year++) {
		if (!(year in position)) {
			if (hasStarted) {
				results[year] = 0;
			}
		}
		else {
			results[year] = 1 - ((position[year]-1)/(maxPosition[year]-1));
			hasStarted = true;
		}
	}

	//console.log(results);
	return results;

}


function getAveragePopularity(popularity, year, delta) {
	var sum = 0;
	var count = 0;
	for (var i = year - delta; i <= year + delta; i++) {
		if (i in popularity) {

			var value = popularity[i];
			if (value == -1) {
				value = 0;
			}
			else if (value == -2) {
				value = 0;
			}

			sum += value;
			count += 1;
		}
	}
	return sum/count;
}

function getLanguagesInYear(year) {
	
	var languages = {};
	var yearName = String(year) + 'f';
	
	var lines = secondDatabase.split('\n');
	for (var i = 0; i < lines.length; i++) {
		var parts = lines[i].split(',');
		if (parts[0] == yearName) {
			languages[parts[2]] = parts[4];
		}
	}

	return languages;

}

function getUniqueLanguagesInYear(year) {

	var languages = {};
	var yearName = String(year) + 'f';
	
	var lines = secondDatabase.split('\n');
	for (var i = 0; i < lines.length; i++) {
		var parts = lines[i].split(',');
		if (parts[0] == yearName) {
			if (!(parts[4] in languages)) {
				languages[parts[4]] = 1;
			}
			else {
				languages[parts[4]]++;
			}
		}
	}

	var outputLanguages = [];
	for (key in languages) {
		outputLanguages.push([key, languages[key]]);
	}

	outputLanguages.sort(sortFunction);

	return outputLanguages;

}

function getLanguagesForCountry(country) {

	var languages = {};
	
	var lines = secondDatabase.split('\n');
	for (var i = 0; i < lines.length; i++) {
		var parts = lines[i].split(',');
		if (parts[2] == country && parts[4] != '-' && parts[0].substr(-2) != 'sf') {
			languages[parts[0]] = parts[4];
		}
	}

	return languages;

}

function getLanguageOccurence(country) {

	var languages = getLanguagesForCountry(country);

	var differentLanguages = {};
	for (var key in languages) {
		if (languages[key] in differentLanguages != true) {
			differentLanguages[languages[key]] = 0;
		}
		differentLanguages[languages[key]]++;
	}

	var sortedLanguages = [];
	for (var key in differentLanguages) {
		sortedLanguages.push([key, differentLanguages[key]]);
	}
	sortedLanguages.sort(sortFunction);

	return sortedLanguages;

}

function sortFunction(a, b) {
	if (a[1] === b[1]) {
        return 0;
    }
    else {
        return (a[1] > b[1]) ? -1 : 1;
    }
}

function hexToRGB(hex) {

	var output = []

	var r = parseInt(hex.substring(1,3),16);
	var g = parseInt(hex.substring(3,5),16);
	var b = parseInt(hex.substring(5,7),16);

	output.push(r);
	output.push(g);
	output.push(b);

	return output;

}

function lerp(a, b, val) {
	return a + (b-a) * val;
}

function logistic(x, L, k, o) {
	return (L / (1.0 + Math.exp(-k * (x - o))));
}