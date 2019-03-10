var geographycanvas;
var geographygl;
var geographyprogram;

var geographyGraphCanvas;
var geographyGraphCtx;
var geographySelectedCountry;

function loadGeographyMap() {

	geographycanvas = document.getElementById('geographyMap');
	geographygl = geographycanvas.getContext('webgl');

	var vertexScript = `
		attribute vec2 a_position;
		void main() {
			gl_Position = vec4(a_position, 0, 1);
		}
	`;

	var fragmentScript = `
		precision mediump float;
		uniform vec4 u_countryColors[53];
		uniform sampler2D u_texture;
		void main() {

			vec2 texCoord = vec2(gl_FragCoord.x/2000.0, 1.0-gl_FragCoord.y/1500.0);
			vec4 col = texture2D(u_texture, texCoord);

			int index = int(floor(255.0 * col.a/4.0 + 0.5));

			for (int k = 0; k <= 51; ++k) {
				if (index == k) {
					col = u_countryColors[k];
				}
			}

			gl_FragColor = col;

			//vec4 newCol = mix(col, vec4(1.0, 1.0, 1.0, 2.0) - col, b);
			//gl_FragColor = newCol;
		}
	`;
	
	var buffer = geographygl.createBuffer();
	geographygl.bindBuffer(geographygl.ARRAY_BUFFER, buffer);
	geographygl.bufferData(
		geographygl.ARRAY_BUFFER,
		new Float32Array([
			-1.0, -1.0,
			1.0, -1.0,
			-1.0, 1.0,
			-1.0, 1.0,
			1.0, -1.0,
			1.0, 1.0]),
		geographygl.STATIC_DRAW
	);


	var vertexShader = geographygl.createShader(geographygl.VERTEX_SHADER);
	geographygl.shaderSource(vertexShader, vertexScript);
	geographygl.compileShader(vertexShader);

	var fragmentShader = geographygl.createShader(geographygl.FRAGMENT_SHADER);
	geographygl.shaderSource(fragmentShader, fragmentScript);
	geographygl.compileShader(fragmentShader);

	geographyprogram = geographygl.createProgram();
	geographygl.attachShader(geographyprogram, vertexShader);
	geographygl.attachShader(geographyprogram, fragmentShader);
	geographygl.linkProgram(geographyprogram);
	geographygl.useProgram(geographyprogram);
	
	geographygl.viewport(0, 0, geographygl.drawingBufferWidth, geographygl.drawingBufferHeight);

	geographyAddMap();
	updateGeographyMap();

	geographycanvas.addEventListener("mouseup", selectGeographyCountry, true);

	document.getElementById("geographyTowards").addEventListener("mouseup", geographyTowardsSelect, true);
	document.getElementById("geographyAway").addEventListener("mouseup", geographyAwaySelect, true);

}

function geographyTowardsSelect() {
	document.getElementById("geographyDirectionTowards").checked = true;
	document.getElementById("geographyTowards").style.backgroundColor = "#d8ffdd";
	document.getElementById("geographyDirectionAway").checked = false;
	document.getElementById("geographyAway").style.backgroundColor = "#ffd8dd";
	updateGeographyBlock();
}

function geographyAwaySelect() {
	document.getElementById("geographyDirectionTowards").checked = false;
	document.getElementById("geographyTowards").style.backgroundColor = "#ffd8dd";
	document.getElementById("geographyDirectionAway").checked = true;
	document.getElementById("geographyAway").style.backgroundColor = "#d8ffdd";
	updateGeographyBlock();
}

function geographyAddMap() {

	var euroElement = document.getElementById("euroImage");

	var tex = geographygl.createTexture();
	geographygl.bindTexture(geographygl.TEXTURE_2D, tex);
	geographygl.texImage2D(geographygl.TEXTURE_2D, 0, geographygl.RGBA, geographygl.RGBA, geographygl.UNSIGNED_BYTE, euroElement);

	geographygl.texParameteri(geographygl.TEXTURE_2D, geographygl.TEXTURE_WRAP_S, geographygl.CLAMP_TO_EDGE);
	geographygl.texParameteri(geographygl.TEXTURE_2D, geographygl.TEXTURE_WRAP_T, geographygl.CLAMP_TO_EDGE);
	geographygl.texParameteri(geographygl.TEXTURE_2D, geographygl.TEXTURE_MIN_FILTER, geographygl.LINEAR);

	var samplerLocation = geographygl.getUniformLocation(geographyprogram, "u_texture");
	var unit = 1;
	geographygl.activeTexture(geographygl.TEXTURE0 + unit);
	geographygl.bindTexture(geographygl.TEXTURE_2D, tex);

	geographygl.uniform1i(samplerLocation, unit);

	geographygl.texParameterf(geographygl.TEXTURE_2D, geographygl.TEXTURE_MIN_FILTER, geographygl.NEAREST);
	geographygl.texParameterf(geographygl.TEXTURE_2D, geographygl.TEXTURE_MAG_FILTER, geographygl.NEAREST);
	
}

function updateGeographyMap() {
	var mode = "Towards";
	if (document.getElementById("geographyDirectionAway").checked) {
		mode = "Away";
	}
	geographySetArray(geographySelectedCountry, mode, 1975, 2017, true, true, true);
	geographyRender();
}

function updateGeographyBlock() {
	updateGeographyMap();
	updateGeographyGraph();
}

document.getElementById("geographyDirectionTowards").onchange = updateGeographyBlock;
document.getElementById("geographyDirectionAway").onchange = updateGeographyBlock;

function updateGeographyGraph() {
	resizeGeographyGraphContainer();
	geographyGraphCtx.clearRect(0, 0, geographyGraphCanvas.width, geographyGraphCanvas.height);
	drawGeographyGraph();
}

function geographySetArray(country, direction, startYear, endYear, useJury, useTelevoting, useSemiFinals) {
	
	var arrLocation = geographygl.getUniformLocation(geographyprogram, "u_countryColors");

	var values = [];
	for (var i = 0; i < 53 * 4; i++) {
		values.push(1.0);
	}

	var fractionOfVotes;
	if (direction === "Towards") {
		fractionOfVotes = getVotesToCountry(country, startYear, endYear, useJury, useTelevoting, useSemiFinals);
	}
	else {
		fractionOfVotes = getVotesFromCountry(country, startYear, endYear, useJury, useTelevoting, useSemiFinals);
	}

	var countryIndex = countryIndexes.indexOf(country);

	for (i = 0; i < countryIndexes.length; i++) {
		if (i === countryIndex) {
			values[i * 4 + 0] = 0.0;
			values[i * 4 + 1] = 1.0;
			values[i * 4 + 2] = 0.0;
		}
		else if (fractionOfVotes[i] < 0) {
			values[i * 4 + 0] = 1.0;
			values[i * 4 + 1] = 1.0;
			values[i * 4 + 2] = 1.0;
		}
		else {
			// var val = logistic(fractionOfVotes[i], 1, 13, 0.3);
			values[i * 4 + 0] = fractionOfVotes[i] * 1.3;
			values[i * 4 + 1] = 0.0; // fractionOfVotes[i] * 0.2 * 1.3
			values[i * 4 + 2] = 0.0; // fractionOfVotes[i] * 0.2 * 1.3
		}
	}
	
	geographygl.uniform4fv(arrLocation, values);

}

function geographyRender() {

	geographygl.clearColor(1.0, 0.0, 0.0, 1.0);
	geographygl.clear(geographygl.COLOR_BUFFER_BIT);
	
	positionLocation = geographygl.getAttribLocation(geographyprogram, "a_position");
	geographygl.enableVertexAttribArray(positionLocation);
	geographygl.vertexAttribPointer(positionLocation, 2, geographygl.FLOAT, false, 0, 0);

	geographygl.drawArrays(geographygl.TRIANGLES, 0, 6);

}

function selectGeographyCountry(e) {

    var euroCanvas = document.getElementById("euroCanvas");
    var ctx = euroCanvas.getContext("2d");
	
	var x = e.pageX - this.offsetLeft; 
    var y = e.pageY - this.offsetTop;
    x = (x/languagecanvas.scrollWidth) * euroCanvas.width;
    y = (y/languagecanvas.scrollHeight) * euroCanvas.height;
    
    var pixelData = ctx.getImageData(x, y, 1, 1).data;
    var countryIndex = Math.round(pixelData[3]/4.0);

    if (countryIndex <= 51) {
	    var country = countryIndexes[countryIndex];
	    geographySelectedCountry = country;
	    // console.log(country);
    }

    updateGeographyBlock();

}

function loadGeographyBlock() {
	geographySelectedCountry = "Australia";
	loadGeographyMap();
	loadGeographyGraph();
	geographyTowardsSelect();
}

function loadGeographyGraph() {

	geographyGraphCanvas = document.getElementById("geographyGraph");
	geographyGraphCtx = geographyGraphCanvas.getContext("2d");

	updateGeographyGraph();

}

function resizeGeographyGraphContainer() {
	var graphContainer = document.getElementById("geographyGraphContainer");
	graphContainer.setAttribute("style", "height:" + String(1.54 * (graphContainer.scrollWidth)) + "px");
}


function drawGeographyGraph() {

	var altNames = {
		"Bosnia & Herzegovina": "Bos & Herz",
		"Czech Republic": "Czechia",
		"F.Y.R. Macedonia": "Macedonia",
		"Serbia & Montenegro": "Serb & Mont",
		"The Netherlands": "Netherlands",
		"United Kingdom": "UK",
	}

	var mode = "Towards";
	if (document.getElementById("geographyDirectionAway").checked) {
		mode = "Away";
	}
	var startYear = 1975;
	var endYear = 2017;

	var fractionOfVotes;
	if (mode === "Towards") {
		fractionOfVotes = getVotesToCountry(geographySelectedCountry, startYear, endYear, true, true, true);
	}
	else {
		fractionOfVotes = getVotesFromCountry(geographySelectedCountry, startYear, endYear, true, true, true);
	}

	var numberOfEntries = 0;
	var resultsArray = [];
	for (var i = 0; i < fractionOfVotes.length; i++) {
		if (fractionOfVotes[i] >= 0 && i != countryIndexes.indexOf(geographySelectedCountry)) {
			resultsArray.push([i, fractionOfVotes[i]]);
			numberOfEntries++;
		}
	}
	resultsArray.sort(sortFunction);

	geographyGraphCanvas.height = 290 + numberOfEntries * 60;

	// Draw Background
	geographyGraphCtx.fillStyle = '#C4DDD5';
	// geographyGraphCtx.fillStyle = '#B8D6CC';
	// geographyGraphCtx.fillStyle = '#88BBAA';
	geographyGraphCtx.fillRect(0, 0, geographyGraphCanvas.width, geographyGraphCanvas.height);
	geographyGraphCtx.fillStyle = 'black';

	// Draw Titles
	geographyGraphCtx.font = "50px Gotham Light";
	geographyGraphCtx.textAlign = "center";
	
	geographyGraphCtx.fillText("Country: " + geographySelectedCountry, geographyGraph.width/2, 90);
	geographyGraphCtx.font = "35px Gotham Bold";
	if (mode == "Towards") {
		geographyGraphCtx.fillText("Votes to " + geographySelectedCountry + " (1975-2017)", geographyGraph.width/2, 160);
	}
	else {
		geographyGraphCtx.fillText("Votes from " + geographySelectedCountry + " (1975-2017)", geographyGraph.width/2, 160);
	}
	geographyGraphCtx.font = "30px Gotham Bold";
	geographyGraphCtx.fillText("(As a percentage of votes given in relevant years)", geographyGraph.width/2, 210);
	geographyGraphCtx.font = "35px Gotham Bold";

	// Country Graph
	
	var currentPos = 0;
	var barHeight = 50;

	for (var i = 0; i < resultsArray.length; i++) {
		var yPos = 290 + currentPos * 60;
		geographyGraphCtx.textAlign = "right";
		if (countryIndexes[resultsArray[i][0]] in altNames) {
			geographyGraphCtx.fillText(altNames[countryIndexes[resultsArray[i][0]]], 280, yPos);
		}
		else {
			geographyGraphCtx.fillText(countryIndexes[resultsArray[i][0]], 280, yPos);
		}
		geographyGraphCtx.fillRect(300, (yPos - 13) - barHeight/2, 500 * resultsArray[i][1], barHeight);
		geographyGraphCtx.textAlign = "left";
		geographyGraphCtx.fillText((100*resultsArray[i][1]*12/58).toFixed(1) + "%", 500 * resultsArray[i][1] + 330, yPos - 2);
		currentPos++;

	}

	geographyGraphCtx.fillRect(300, 240, 4, 15 + currentPos * 60); // y-axis


}