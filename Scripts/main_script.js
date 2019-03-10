window.onload = function() {
	createEuroCanvas();
	loadHeader();
	loadGeographyBlock();
	loadPopularityBlock();
	loadLanguageBlock();
}

window.onresize = windowResize;

function createEuroCanvas() {
	var euroCanvas = document.getElementById("euroCanvas");
	var euroImage = document.getElementById("euroImage");
	var ctx = euroCanvas.getContext("2d");
	ctx.drawImage(euroImage, 0, 0, euroCanvas.width, euroCanvas.height);
}

function windowResize() {
	resizeHeader();
	resizeGeographyGraphContainer();
	resizePopularityCountryContainer();
}