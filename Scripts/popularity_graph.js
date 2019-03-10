var popularityGraphCanvas;
var popularityGraphCtx;

function loadPopularityBlock() {
	loadPopularityGraph();
	loadPopularityCountries();
	updatePopularityBlock();
	document.getElementById("popularitySlider").oninput = updatePopularityBlock;
}

function loadPopularityGraph() {
	popularityGraphCanvas = document.getElementById("popularityGraph");
	popularityGraphCtx = popularityGraphCanvas.getContext("2d");
}

function updatePopularityBlock() {
	updatePopularityGraph();
	resizePopularityCountryContainer();
	document.getElementById("popularitySliderText").innerHTML = "Show Average of " + String(1 + 2 * document.getElementById("popularitySlider").value) + " years: ";
}

function updatePopularityGraph() {
	popularityGraphCtx.clearRect(0, 0, popularityGraphCanvas.width, popularityGraphCanvas.height);
	drawPopularityGraph();
}

function loadPopularityCountries() {
	var inner = "Countries:<br><br>";
	for (var i = 0; i < countryIndexes.length; i++) {
		inner += "<input id='popularityCountry" + String(i) + "' type='checkbox' name='popularity'>" + countryIndexes[i] + "<br>";
	}
	var countryContainer = document.getElementById("popularityCountryContainer");
	countryContainer.innerHTML = inner;

	for (var i = 0; i < countryIndexes.length; i++) {
		document.getElementById("popularityCountry" + String(i)).onchange = updatePopularityBlock;
	}
}

function resizePopularityCountryContainer() {
	var countryContainer = document.getElementById("popularityCountryContainer");
	countryContainer.setAttribute("style", "height:" + String(2.58 * (countryContainer.scrollWidth)) + "px");
}

function drawCountryLabel(x, y, color, text) {

	var size = 35;

	popularityGraphCtx.moveTo(x, y);
	popularityGraphCtx.beginPath();
	popularityGraphCtx.lineTo(x, y);
	popularityGraphCtx.lineTo(x + size, y);
	popularityGraphCtx.lineTo(x + size, y + size);
	popularityGraphCtx.lineTo(x, y + size);
	popularityGraphCtx.closePath();
	
	popularityGraphCtx.fillStyle = color;
	popularityGraphCtx.fill();
	popularityGraphCtx.fillStyle = 'black';

	popularityGraphCtx.font = "35px Gotham Bold";
	popularityGraphCtx.textAlign = "left"
	popularityGraphCtx.fillText(text, x + size + 10, y + size/2 + 12);

}

function drawPopularityGraph() {

	// Get selected countries
	var selectedCountries = [];
	for (var i = 0; i < countryIndexes.length; i++) {
		var checkbox = document.getElementById("popularityCountry" + String(i));
		if (checkbox.checked) {
			selectedCountries.push(countryIndexes[i]);
		}
	}

	// var selectedCountries = ["Australia", "Belgium", "Croatia", "Montenegro", "Russia"];

	// Draw Background
	popularityGraphCtx.fillStyle = '#C4DDD5';
	popularityGraphCtx.fillRect(0, 0, popularityGraphCanvas.width, popularityGraphCanvas.height);
	popularityGraphCtx.fillStyle = 'black';

	// Draw Titles
	popularityGraphCtx.font = "50px Gotham Light";
	popularityGraphCtx.textAlign = "center";
	
	popularityGraphCtx.fillText("Popularity over Time", popularityGraph.width/2, 90);

	// Y Axis
	popularityGraphCtx.fillRect(300, 200, 4, 1040);
	popularityGraphCtx.font = "40px Gotham Bold";
	popularityGraphCtx.textAlign = "center";
	popularityGraphCtx.rotate(-Math.PI/2);
	popularityGraphCtx.fillText("Position in Final", -700, 160);
	popularityGraphCtx.rotate(+Math.PI/2);

	var scoreLabelsPos = [0, 0.5, 1];
	var scoreLabelsName = ["Last", "Mid", "First"];
	popularityGraphCtx.font = "35px Gotham Light";
	popularityGraphCtx.textAlign = "right";
	for (var i = 0; i < scoreLabelsPos.length; i++) {	
		popularityGraphCtx.fillText(scoreLabelsName[i], 290, lerp(1240, 200, scoreLabelsPos[i]) + 10);
	}

	// X Axis
	popularityGraphCtx.fillRect(300, 1240, 1800, 4);
	popularityGraphCtx.font = "40px Gotham Bold";
	popularityGraphCtx.textAlign = "center";
	popularityGraphCtx.fillText("Year", popularityGraph.width/2, 1365);

	var yearLabels = [1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015];
	popularityGraphCtx.font = "35px Gotham Light";
	popularityGraphCtx.textAlign = "center";
	for (var i = 0; i < yearLabels.length; i++) {	
		popularityGraphCtx.fillText(String(yearLabels[i]), lerp(300, 2100, (yearLabels[i] - 1975)/42), 1300);
	}

	var posColors = ["#0000BB", "#333333", "#FF0000", "#777777", "#22AA22"];
	var numberOfSelectedCountries = Math.min(5, selectedCountries.length);

	// Draw Legend

	var altNames = {
		"Bosnia & Herzegovina": "Bos & Herz",
		"Czech Republic": "Czechia",
		"F.Y.R. Macedonia": "Macedonia",
		"Serbia & Montenegro": "Serb & Mont",
		"The Netherlands": "Netherlands",
		"United Kingdom": "UK",
	}

	for (var i = 0; i < numberOfSelectedCountries; i++) {
		var xPos = lerp(popularityGraph.width/2 - 150 * numberOfSelectedCountries, popularityGraph.width/2 + 150 * numberOfSelectedCountries, (i+0.5)/numberOfSelectedCountries) - 90;
		if (selectedCountries[i] in altNames) {
			drawCountryLabel(xPos, 1410, posColors[i], altNames[selectedCountries[i]]);
		}
		else {
			drawCountryLabel(xPos, 1410, posColors[i], selectedCountries[i]);
		}
	}

	// Draw Lines

	var delta = parseInt(document.getElementById("popularitySlider").value);

	for (var i = 0; i < numberOfSelectedCountries; i++) {
		var popularity = getPopularityPerYear(selectedCountries[i]);

		popularityGraphCtx.lineWidth = 4;
		popularityGraphCtx.strokeStyle = posColors[i];

		var startYear = 1975;
		for (var year = 1975; year <= 2017; year++) {
			if (year in popularity) {
				startYear = year;
				break;
			}
		}

		var x = lerp(300, 2100, (startYear - 1975)/42);
		var y = lerp(1240, 200, getAveragePopularity(popularity, startYear, delta) / 1);
		var previousPoint = [x, y];

		popularityGraphCtx.moveTo(x, y);
		popularityGraphCtx.beginPath();

		for (var year = startYear; year <= 2017; year++) {

			// var value = popularity[year];
			// if (popularity[year] == -1) {
			// 	value = 0;
			// }
			// else if (popularity[year] == -2) {
			// 	value = 0;
			// }

			var value = getAveragePopularity(popularity, year, delta);

			var curveAmount = 0.5;
			var x = lerp(300, 2100, (year - 1975)/42);
			var y = lerp(1240, 200, value / 1);
			var c1x = previousPoint[0] + (x - previousPoint[0]) * curveAmount;
			var c1y = previousPoint[1];
			var c2x = x + (previousPoint[0] - x) * curveAmount;
			var c2y = y;

			popularityGraphCtx.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);
			popularityGraphCtx.moveTo(x, y)
			// popularityGraphCtx.lineTo(x, y);
			previousPoint = [x, y];
		}
		// popularityGraphCtx.closePath();
		popularityGraphCtx.stroke();
	}

	popularityGraphCtx.strokeStyle = "#000000";

}