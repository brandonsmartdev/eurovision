var canvas;
var gl;
var buffer;

var vertexShader;
var fragmentShader;

window.onload = init;

function init() {

	canvas = document.getElementById('glScreen');
	gl = canvas.getContext('webgl');
	canvas.width = 640;
	canvas.height = 480;

	buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([
			-1.0, -1.0,
			1.0, -1.0,
			-1.0, 1.0,
			-1.0, 1.0,
			1.0, -1.0,
			1.0, 1.0]),
		gl.STATIC_DRAW
	);

	var vertexScript = `
		attribute vec2 a_position;
		void main() {
			gl_Position = vec4(a_position, 0, 1);
		}
	`;

	vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vertexScript);
	gl.compileShader(vertexShader);

	var fragmentScript = `
		precision mediump float;
		uniform float b;
		void main() {
			gl_FragColor = vec4(gl_FragCoord.x / 640.0, gl_FragCoord.y / 480.0, b, 1);
		}
	`;

	fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fragmentScript);
	gl.compileShader(fragmentShader);

	program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.useProgram(program);
	
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

	render();

}

function render() {

	window.requestAnimationFrame(render, canvas);

	gl.clearColor(1.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	positionLocation = gl.getAttribLocation(program, "a_position");
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.TRIANGLES, 0, 6);

}

var slider = document.getElementById("test-slider");

slider.oninput = function() {
	
	positionLocation = gl.getUniformLocation(program, "b");
	gl.uniform1f(positionLocation, this.value/100.0);

}