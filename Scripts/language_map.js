var languagecanvas;
var languagegl;
var languageprogram;

var languageGraphCanvas;
var languageGraphCtx;
var languageSelectedCountry;

var slider = document.getElementById("languageSlider");

function loadLanguageMap() {

	languagecanvas = document.getElementById('languageMap');
	languagegl = languagecanvas.getContext('webgl');

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
	
	var buffer = languagegl.createBuffer();
	languagegl.bindBuffer(languagegl.ARRAY_BUFFER, buffer);
	languagegl.bufferData(
		languagegl.ARRAY_BUFFER,
		new Float32Array([
			-1.0, -1.0,
			1.0, -1.0,
			-1.0, 1.0,
			-1.0, 1.0,
			1.0, -1.0,
			1.0, 1.0]),
		languagegl.STATIC_DRAW
	);


	var vertexShader = languagegl.createShader(languagegl.VERTEX_SHADER);
	languagegl.shaderSource(vertexShader, vertexScript);
	languagegl.compileShader(vertexShader);

	var fragmentShader = languagegl.createShader(languagegl.FRAGMENT_SHADER);
	languagegl.shaderSource(fragmentShader, fragmentScript);
	languagegl.compileShader(fragmentShader);

	languageprogram = languagegl.createProgram();
	languagegl.attachShader(languageprogram, vertexShader);
	languagegl.attachShader(languageprogram, fragmentShader);
	languagegl.linkProgram(languageprogram);
	languagegl.useProgram(languageprogram);
	
	languagegl.viewport(0, 0, languagegl.drawingBufferWidth, languagegl.drawingBufferHeight);

	languageAddMap();
	updateLanguageMap();

	languagecanvas.addEventListener("mouseup", selectLanguageCountry, true);

}

function languageAddMap() {

	var euroElement = document.getElementById("euroImage");

	var tex = languagegl.createTexture();
	languagegl.bindTexture(languagegl.TEXTURE_2D, tex);
	languagegl.texImage2D(languagegl.TEXTURE_2D, 0, languagegl.RGBA, languagegl.RGBA, languagegl.UNSIGNED_BYTE, euroElement);

	languagegl.texParameteri(languagegl.TEXTURE_2D, languagegl.TEXTURE_WRAP_S, languagegl.CLAMP_TO_EDGE);
	languagegl.texParameteri(languagegl.TEXTURE_2D, languagegl.TEXTURE_WRAP_T, languagegl.CLAMP_TO_EDGE);
	languagegl.texParameteri(languagegl.TEXTURE_2D, languagegl.TEXTURE_MIN_FILTER, languagegl.LINEAR);

	var samplerLocation = languagegl.getUniformLocation(languageprogram, "u_texture");
	var unit = 1;
	languagegl.activeTexture(languagegl.TEXTURE0 + unit);
	languagegl.bindTexture(languagegl.TEXTURE_2D, tex);

	languagegl.uniform1i(samplerLocation, unit);

	languagegl.texParameterf(languagegl.TEXTURE_2D, languagegl.TEXTURE_MIN_FILTER, languagegl.NEAREST);
	languagegl.texParameterf(languagegl.TEXTURE_2D, languagegl.TEXTURE_MAG_FILTER, languagegl.NEAREST);
	
}

function updateLanguageMap() {
	var year = Math.round(slider.value);
	languageSetArray(year);
	languageRender();
}

function languageSetArray(year) {
	
	var arrLocation = languagegl.getUniformLocation(languageprogram, "u_countryColors");

	var values = [];
	for (var i = 0; i < 53 * 4; i++) {
		values.push(1.0);
	}

	var languagesUsed = getLanguagesInYear(year);

	for (i = 0; i < countryIndexes.length; i++) {
		if (countryIndexes[i] in languagesUsed) {
			var country = countryIndexes[i];
			var language = languagesUsed[country];
			var color = languageColors[language];
			var rgb = hexToRGB(color);
			values[i * 4 + 0] = rgb[0]/255;
			values[i * 4 + 1] = rgb[1]/255;
			values[i * 4 + 2] = rgb[2]/255;
			// if (languagesUsed[countryIndexes[i]] == "English") {
			// 	values[i * 4 + 0] = 0.0;
			// 	values[i * 4 + 1] = 0.0;
			// }
		}
	}
	
	languagegl.uniform4fv(arrLocation, values);

}

function languageRender() {

	// window.requestAnimationFrame(languageRender);

	languagegl.clearColor(1.0, 0.0, 0.0, 1.0);
	languagegl.clear(languagegl.COLOR_BUFFER_BIT);
	
	positionLocation = languagegl.getAttribLocation(languageprogram, "a_position");
	languagegl.enableVertexAttribArray(positionLocation);
	languagegl.vertexAttribPointer(positionLocation, 2, languagegl.FLOAT, false, 0, 0);

	languagegl.drawArrays(languagegl.TRIANGLES, 0, 6);

}

function updateLanguageGraph() {
	languageGraphCtx.clearRect(0, 0, languageGraphCanvas.width, languageGraphCanvas.height);
	drawLanguageGraph();
}

function updateLanguageBlock() {
	updateLanguageMap();
	updateLanguageGraph();
	document.getElementById("languageSliderText").innerHTML = "Year: " + String(slider.value);
}

function selectLanguageCountry(e) {

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
	    languageSelectedCountry = country;
	    // console.log(country);
    }

    updateLanguageBlock();

}

slider.oninput = updateLanguageBlock;

function loadLanguageBlock() {
	languageSelectedCountry = "Australia";
	loadLanguageMap();
	loadLanguageGraph();
	document.getElementById("languageSliderText").innerHTML = "Year: " + String(slider.value);
}

function loadLanguageGraph() {

	languageGraphCanvas = document.getElementById("languageGraph");
	languageGraphCtx = languageGraphCanvas.getContext("2d");

	drawLanguageGraph();

}

function drawLanguageLabel(x, y, color, language) {

	var size = 35;

	languageGraphCtx.moveTo(x, y);
	languageGraphCtx.beginPath();
	languageGraphCtx.lineTo(x, y);
	languageGraphCtx.lineTo(x + size, y);
	languageGraphCtx.lineTo(x + size, y + size);
	languageGraphCtx.lineTo(x, y + size);
	languageGraphCtx.closePath();
	
	languageGraphCtx.fillStyle = color;
	languageGraphCtx.fill();
	languageGraphCtx.fillStyle = 'black';
	languageGraphCtx.lineWidth = 3;
	languageGraphCtx.stroke();

	languageGraphCtx.font = "30px Gotham Bold";
	languageGraphCtx.textAlign = "left"
	languageGraphCtx.fillText(language, x + size + 10, y + size/2 + 12);

}

function drawLanguageGraph() {

	var year = slider.value;

	// Draw Background
	languageGraphCtx.fillStyle = '#C4DDD5';
	languageGraphCtx.fillRect(0, 0, languageGraphCanvas.width, languageGraphCanvas.height);
	languageGraphCtx.fillStyle = 'black';

	// Draw Legend
	languageGraphCtx.font = "50px Gotham Light";
	languageGraphCtx.textAlign = "center";
	
	languageGraphCtx.fillText("Year: " + String(year), languageGraph.width/2, 90);

	var uniqueLanguages = getUniqueLanguagesInYear(year);
	
	for (var i = 0; i < uniqueLanguages.length; i++) {
		drawLanguageLabel(50 + Math.floor(i/3) * 320, 155 + (i%3) * 70, languageColors[uniqueLanguages[i][0]], uniqueLanguages[i][0] + " " + "(" + String(uniqueLanguages[i][1]) + ")");
	}
	
	// Divider
	languageGraphCtx.fillRect(0, 400, languageGraphCanvas.width, 4);

	// Country Graph
	languageGraphCtx.font = "50px Gotham Light";
	languageGraphCtx.textAlign = "center";
	languageGraphCtx.fillText("Country: " + languageSelectedCountry, languageGraph.width/2, 490);
	languageGraphCtx.font = "35px Gotham Bold";
	languageGraphCtx.fillText("Number of Entries For Each Language", languageGraph.width/2, 560);

	var languagesForCountry = getLanguageOccurence(languageSelectedCountry);

	if (languagesForCountry.length === 0) {
		languageGraphCtx.font = "35px Gotham Bold";
		languageGraphCtx.fillText(languageSelectedCountry + " hasn't participated in a final since 1999", languageGraph.width/2, 950);
		languageGraphCtx.font = "35px Gotham Bold";
	}

	else {

		languageGraphCtx.fillRect(250, 630, 4, 800); // y-axis

		var maxCount = languagesForCountry[0][1];
		var barHeight = 60;
		
		for (var i = 0; i < languagesForCountry.length; i++) {
			var yPos = lerp(650, 1400, ((i+0.5)/languagesForCountry.length));
			languageGraphCtx.textAlign = "right";
			languageGraphCtx.fillText(languagesForCountry[i][0], 230, yPos);
			languageGraphCtx.fillRect(250, (yPos - 13) - barHeight/2, 500 * (languagesForCountry[i][1] / maxCount), barHeight);
			languageGraphCtx.textAlign = "left";
			languageGraphCtx.fillText(languagesForCountry[i][1], 500 * (languagesForCountry[i][1] / maxCount) + 280, yPos - 2);
		}
		
	}


	// console.log(languagesForCountry);



}