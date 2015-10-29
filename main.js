var gl;
var t = 0;


var texture;
var texture2;

var sharedUniforms;


var phongProgram;
var primitiveProgram;

var lightModel;

var lightPosition;

var camera;
var draggablePoints;
var gimbal;
var BSM;

window.onload = function init()
{
	var fovy = 60;
	var canvas = document.getElementById( "gl-canvas" );

	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { alert( "WebGL isn't available" ); }

	gl.viewport( 0, 0, canvas.width, canvas.height );

	gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
	gl.enable(gl.DEPTH_TEST);

	lightPosition = ObservablePoint(vec3(0,60,0));
	camera = Camera(vec3(100,100,100), vec3(-1,-1,-1), vec3(0,1,0), fovy,  canvas.width/canvas.height, 1,1000); 

	draggablePoints = DraggablePoints([ObservablePoint(vec3(100,100,-100))]);
	draggablePoints.addObservablePoints([lightPosition]);

	BSM = BezierSurfaceModel(vec3(-15,0,-15), 10, 10, 20, 20);
	draggablePoints.addObservablePoints(BSM.controlPoints);

	phongProgram = ShaderProgram(gl, "phong-vshader", "phong-fshader", {
		normal: {name: "aNormal_ms"},
		vertex: {name: "aVertexPosition_ms"},
		texcoord: {name: "aTexcoord"}
	}, 
	{
		lightPosition_ws : {name: "uLightPosition_ws", setter: gl.uniform3fv},
		N: {name: "N", setter: setMat3fv(gl)}
	}
	);

	sharedUniforms = {
		P: {name: "P", setter: setMat4fv(gl)},
		M: {name: "M", setter: setMat4fv(gl)},
		V: {name: "V", setter: setMat4fv(gl)}
	};

	primitiveProgram = ShaderProgram(gl, "primitive-vshader", "primitive-fshader", {
		vertex: {name: "aVertexPosition_ms"}
	},
	{ 
		color: {name: "uColor", setter: gl.uniform4fv}
	});

	// useProgram(gl, phongProgram);
    //
	// bindUniformsToProgram(sharedUniforms, phongProgram.id, gl);

	lightModel = Tetrahedron(gl);

	coordSys = CoordSys(gl);
	
	texture = loadTexture(gl,"metal2.jpg");
	texture2 = loadTexture(gl,"wood2.jpg");

	var origin = vec3(0,0,0);

	gimbal = {
		r: Line(gl, origin, vec3(1,0,0)),
		g: Line(gl, origin, vec3(0,1,0)),
		b: Line(gl, origin, vec3(0,0,1))
	};

	setUpEventHandling(canvas, fovy);
	render();
};

function setUniformData(uniforms, data){
	Object.keys(data).forEach(function(k){
		uniforms[k].set(data[k]);
	});
}

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT  | gl.DEPTH_BUFFER_BIT);
	t+=0.009;

	var M;
	var P = camera.getPerspectiveMatrix();
	var V = camera.getViewMatrix();

	var sharedUniformData = {P: flatten(P),
							 V: flatten(V)};


	unloadProgram(primitiveProgram, gl);
	useProgram(gl, phongProgram, sharedUniforms, sharedUniformData);
	phongProgram.uniforms.lightPosition_ws.set(flatten(lightPosition.position));
	M = scalem(1,1,1);
	phongProgram.uniforms.N.set(flatten(getNormalTransformMat3(V,M)));
	sharedUniforms.M.set(flatten(M));
	gl.bindTexture(gl.TEXTURE_2D, texture2);

	setProgramAttributes(gl, BSM.surface , phongProgram);
	drawObject(gl, BSM.surface);


	unloadProgram(phongProgram, gl);

	////////////////////////////////////////////////////
	useProgram(gl, primitiveProgram, sharedUniforms, sharedUniformData);

	primitiveProgram.uniforms.color.set([1,1,1,1]);

	setProgramAttributes(gl, lightModel, primitiveProgram); 

	gl.lineWidth(1);

	// if(draggablePoints.closestPoint)
	draggablePoints.points.forEach(function(dp){
		M = mult(translate(dp.position[0], dp.position[1], dp.position[2]), scalem(2,2,2));
		sharedUniforms.M.set(flatten(M));
		drawObject(gl, lightModel);
	});


	gl.disable(gl.DEPTH_TEST);

	if(draggablePoints.closestPoint){
		gl.lineWidth(2);
		drawGimbal(gl, sharedUniforms, primitiveProgram, draggablePoints.getNormalizedCPLocation(), 5, draggablePoints.closestPoint.state);
	}

	gl.enable(gl.DEPTH_TEST);


	requestAnimFrame( render );
}



function drawGimbal(gl, sharedUniforms, program, pos, size, state){

	function toggleThickLine(i){
		if(state == i)
			gl.lineWidth(5);
		else
			gl.lineWidth(2);
	}

	var M = mult(translate(pos[0],pos[1], pos[2]), scalem(size,size, size));
	sharedUniforms.M.set(flatten(M));

	toggleThickLine(1);
	
	program.uniforms.color.set([1,0,0,1]);
	setProgramAttributes(gl, gimbal.r, primitiveProgram);
	drawObject(gl, gimbal.r);

	toggleThickLine(2);

	program.uniforms.color.set([0,1,0,1]);
	setProgramAttributes(gl, gimbal.g, primitiveProgram);
	drawObject(gl, gimbal.g);


	toggleThickLine(3);
	program.uniforms.color.set([0,0,1,1]);
	setProgramAttributes(gl, gimbal.b, primitiveProgram);
	drawObject(gl, gimbal.b);
}






