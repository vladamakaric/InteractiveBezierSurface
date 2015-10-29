var gl;
var t = 0;


var texture;
var texture2;

var sharedUniforms;


var phongProgram;
var primitiveProgram;

var lightModel;

var lightPosition;
var bezierSurf;
var coordSys;

var mouseRay;
var camera;

var mouseRay;

var draggablePoints;

var gimbal;

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

	draggablePoints = DraggablePoints([ObservablePoint(vec3(100,100,-100)), lightPosition]);

	// phongProgram = ShaderProgram(gl, "phong-vshader", "phong-fshader", {
	// 	normal: {name: "aNormal_ms"},
	// 	vertex: {name: "aVertexPosition_ms"},
	// 	texcoord: {name: "aTexcoord"}
	// }, 
	// {
	// 	lightPosition_ws : {name: "uLightPosition_ws", setter: gl.uniform3fv},
	// 	N: {name: "N", setter: setMat3fv(gl)}
	// }
	// );

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

	var q = [
				[vec3(0,0,0), vec3(10,0,0), vec3(20,0,0), vec3(30,0,0)],
				[vec3(0,0,10), vec3(10,0,10), vec3(20,0,10), vec3(30,-50,10)],
				[vec3(0,0,20), vec3(10,0,20), vec3(20,0,20), vec3(30,50,20)],
				[vec3(0,0,30), vec3(10,0,30), vec3(20,0,30), vec3(30,0,30)]
			];

	bezierSurf = parametricSurface(function(u,v){ return bezierSurface(u,v,q);}, 0, 0, 30,30);
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

	var sharedUniformData = {P: flatten(camera.getPerspectiveMatrix()),
							 V: flatten(camera.getViewMatrix())};

	// useProgram(gl, phongProgram, sharedUniforms, sharedUniformData);
	// phongProgram.uniforms.lightPosition_ws.set(flatten(lightPosition));


	// ////////////////////////////////////////////////////
	// gl.bindTexture(gl.TEXTURE_2D, texture2);
	// setProgramAttributes(gl, cone, phongProgram); 
    //
	// M = mult(translate(60, 0, 0), scalem(20,50,20));
	// sharedUniforms.M.set(flatten(M));
	// phongProgram.uniforms.N.set(flatten(getNormalTransformMat3(V,M)));
	// drawObject(gl, cone);
    //
	// M = mult(translate(-60, 0, 0), scalem(20,50,20));
	// sharedUniforms.M.set(flatten(M));
	// phongProgram.uniforms.N.set(flatten(getNormalTransformMat3(V,M)));
	// drawObject(gl, cone);
    //
	// ///////////////////////////////////////////
	// gl.bindTexture(gl.TEXTURE_2D, texture);
	// setProgramAttributes(gl, surface, phongProgram); 
	// M = mult(translate(0, 0, 20), scalem(1,1,1));
	// sharedUniforms.M.set(flatten(M));
	// phongProgram.uniforms.N.set(flatten(getNormalTransformMat3(V,M)));
	// drawObject(gl, surface);
	// ////////////////////
    //
	// setProgramAttributes(gl, surface2, phongProgram); 
	// M = mult(translate(0, 0, -50), scalem(1,1,1));
	// sharedUniforms.M.set(flatten(M));
	// phongProgram.uniforms.N.set(flatten(getNormalTransformMat3(V,M)));
	// drawObject(gl, surface);
	// ///////////////////

	unloadProgram(primitiveProgram, gl);


	useProgram(gl, primitiveProgram, sharedUniforms, sharedUniformData);

	primitiveProgram.uniforms.color.set([1,1,1,1]);

	setProgramAttributes(gl, lightModel, primitiveProgram); 

	gl.lineWidth(1);

	draggablePoints.points.forEach(function(dp){
		M = mult(translate(dp.position[0], dp.position[1], dp.position[2]), scalem(5,5,5));
		sharedUniforms.M.set(flatten(M));
		drawObject(gl, lightModel);
	});

	sharedUniforms.M.set(flatten(scalem(1,1,1)));
	setProgramAttributes(gl, bezierSurf, primitiveProgram);
	drawObject(gl, bezierSurf);

	// sharedUniforms.M.set(flatten(scalem(10,10,10)));
	// setProgramAttributes(gl, coordSys, primitiveProgram);
	// gl.lineWidth(2);
	// drawObject(gl, coordSys);
    //
	


	if(draggablePoints.closestPoint){

		gl.lineWidth(2);
		drawGimbal(gl, sharedUniforms, primitiveProgram, draggablePoints.getNormalizedCPLocation(), 5, null);
	}

	



	// if(mouseRay){
	// 	var endP = add(mouseRay.o, scale(20, mouseRay.d));
    //
	// 	var line = Line(gl, endP, add(mouseRay.o, scale(100, mouseRay.d)));
    //
	// 	setProgramAttributes(gl, line, primitiveProgram);
	// 	sharedUniforms.M.set(flatten(scalem(1,1,1)));
	// 	drawObject(gl, line);
	// }

	requestAnimFrame( render );
}

function drawGimbal(gl, sharedUniforms, program, pos, size, state){

	var M = mult(translate(pos[0],pos[1], pos[2]), scalem(size,size, size));
	sharedUniforms.M.set(flatten(M));

	program.uniforms.color.set([1,0,0,1]);
	setProgramAttributes(gl, gimbal.r, primitiveProgram);
	drawObject(gl, gimbal.r);

	program.uniforms.color.set([0,1,0,1]);
	setProgramAttributes(gl, gimbal.g, primitiveProgram);
	drawObject(gl, gimbal.g);

	program.uniforms.color.set([0,0,1,1]);
	setProgramAttributes(gl, gimbal.b, primitiveProgram);
	drawObject(gl, gimbal.b);
}






