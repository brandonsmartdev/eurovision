var headerCanvas;
var headergl;
var headerProgram;

function createHeaderText() {

	var textCanvas = document.getElementById("header-text");
	var ctx = textCanvas.getContext("2d");
	
	ctx.font = "20px Gotham Bold";
	ctx.textAlign = "center"
	ctx.fillText("VOTING IN THE", textCanvas.scrollWidth/2, 38);	

	var img = document.getElementById("euroLogo");
	ctx.drawImage(img, textCanvas.scrollWidth/2 - img.width/2, 85 - img.height/2)

}

function renderHeader(timestamp) {

	var positionLocation = headergl.getUniformLocation(headerProgram, "time");
	headergl.uniform1f(positionLocation, timestamp/1000.0);
	
	headergl.clearColor(1.0, 0.0, 0.0, 1.0);
	headergl.clear(headergl.COLOR_BUFFER_BIT);
	
	positionLocation = headergl.getAttribLocation(headerProgram, "a_position");
	headergl.enableVertexAttribArray(positionLocation);
	headergl.vertexAttribPointer(positionLocation, 2, headergl.FLOAT, false, 0, 0);

	headergl.drawArrays(headergl.TRIANGLES, 0, 6);

	// window.requestAnimationFrame(renderHeader);

}

function resizeHeader() {

	var positionLocation = headergl.getUniformLocation(headerProgram, "width");
	headergl.uniform1f(positionLocation, headerCanvas.scrollWidth);

	var positionLocation = headergl.getUniformLocation(headerProgram, "height");
	headergl.uniform1f(positionLocation, headerCanvas.scrollHeight);

}

function loadHeader() {

	var vertexScript = `
		attribute vec2 a_position;
		void main() {
			gl_Position = vec4(a_position, 0, 1);
		}
	`;

	var fragmentScript = `
precision mediump float;
const float PI = 3.141592;
uniform float width;
uniform float height;
uniform float time;

// Hash functions by Dave Hoskins: https://www.shadertoy.com/view/4djSRW

vec2 hash22(vec2 p) {
	vec3 p3 = fract(vec3(p.xyx) * vec3(443.897, 441.423, 437.195));
    p3 += dot(p3, p3.yzx+19.19);
    return fract((p3.xx+p3.yz)*p3.zy);
}

vec3 hash33(vec3 p3) {
	p3 = fract(p3 * vec3(443.897, 441.423, 437.195));
    p3 += dot(p3, p3.yxz+19.19);
    return fract((p3.xxy + p3.yxx)*p3.zyx);

}

// 3D Perlin Noise Implementation

vec3 fade3(vec3 t) {
	return t*t*t*(t*(t*6.0-15.0)+10.0);
}

vec3 getGradient3D(vec3 p) {
	return normalize(-1.0 + 2.0 * hash33(p));
}

float perlin3D(vec3 p) {
	
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = fade3(f);
    
    float value000 = dot(getGradient3D(i + vec3(0.0, 0.0, 0.0)), f - vec3(0.0, 0.0, 0.0));
	float value100 = dot(getGradient3D(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0));
	float value010 = dot(getGradient3D(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0));
	float value110 = dot(getGradient3D(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0));
	float value001 = dot(getGradient3D(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0));
	float value101 = dot(getGradient3D(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0));
	float value011 = dot(getGradient3D(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0));
	float value111 = dot(getGradient3D(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0));

	return mix(
		mix(
			mix(value000, value100, u.x),
			mix(value010, value110, u.x),
			u.y),
		mix(
			mix(value001, value101, u.x),
			mix(value011, value111, u.x),
			u.y),
		u.z);

}

// Returns the position of the closest voronoi point

vec2 voronoiCells2D(vec2 p) {
	
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    float minDist = 5.0;
    vec2 closestPoint = vec2(0.0, 0.0);
    
    for (int j = -1; j <= 1; j++) {
        for (int k = -1; k <= 1; k++) {
        	vec2 relativeCell = vec2(float(j), float(k));
            vec2 voroPoint = hash22(i + relativeCell);
            float dist = distance(f, relativeCell + voroPoint);
            if (dist < minDist) {
            	minDist = dist;
                closestPoint = i + relativeCell + voroPoint;
            }
        }
    }
    
    return closestPoint;

}

void main() {
    
    float voronoiScale = 0.025;
    float perlinScale = 0.2;
    float speed = 0.3;
    
    // Gets the position of the closest voronoi point
    vec2 coord = vec2(gl_FragCoord.x * voronoiScale * width / 1000.0, gl_FragCoord.y * voronoiScale * height / 1000.0);
    vec2 voroPoint = voronoiCells2D(coord);

    // Uses that point to create a color using perlin noise
    float val = perlin3D(vec3(voroPoint * perlinScale, time * speed));
    val = val * 0.5 + 0.5;
    //vec3 col = vec3(val);

    vec3 colA = vec3(0.3, 0.3, 0.7);
    vec3 colB = vec3(0.5, 0.5, 1.0);
    vec3 col = mix(colA, colB, val);
    
    gl_FragColor = vec4(col, 1.0);
}
	`;

	headerCanvas = document.getElementById('header-background');
	headergl = headerCanvas.getContext('webgl');

	var buffer = headergl.createBuffer();
	headergl.bindBuffer(headergl.ARRAY_BUFFER, buffer);
	headergl.bufferData(
		headergl.ARRAY_BUFFER,
		new Float32Array([
			-1.0, -1.0,
			1.0, -1.0,
			-1.0, 1.0,
			-1.0, 1.0,
			1.0, -1.0,
			1.0, 1.0]),
		headergl.STATIC_DRAW
	);

	var vertexShader = headergl.createShader(headergl.VERTEX_SHADER);
	headergl.shaderSource(vertexShader, vertexScript);
	headergl.compileShader(vertexShader);

	var fragmentShader = headergl.createShader(headergl.FRAGMENT_SHADER);
	headergl.shaderSource(fragmentShader, fragmentScript);
	headergl.compileShader(fragmentShader);

	headerProgram = headergl.createProgram();
	headergl.attachShader(headerProgram, vertexShader);
	headergl.attachShader(headerProgram, fragmentShader);
	headergl.linkProgram(headerProgram);
	headergl.useProgram(headerProgram);
	
	headergl.viewport(0, 0, headergl.drawingBufferWidth, headergl.drawingBufferHeight);

	var positionLocation = headergl.getUniformLocation(headerProgram, "width");
	headergl.uniform1f(positionLocation, headerCanvas.scrollWidth);
	
	var positionLocation = headergl.getUniformLocation(headerProgram, "height");
	headergl.uniform1f(positionLocation, headerCanvas.scrollHeight);
	
	renderHeader(0);

	createHeaderText();

}