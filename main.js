var gl;
var t = 0;


var texture;
var texture2;

var sharedUniforms;


var phongProgram;
var primitiveProgram;

var lightModel;

var lightPosition = [0, 60, 0];
var bezierSurf;
var coordSys;

var mouseRay;
var camera;

function Camera(eye, dir, up, vFov, aspect, near, far){

	var V = lookAt(eye, add(eye,dir), up);
	var VInv = inverse(V);
	var P = perspective(vFov, aspect, near, far);

	function changeView(newEye, newDir, newUp){
		eye = newEye || eye;
		dir = newDir || dir;
		up = newUp || up;

		V = lookAt(eye, add(eye,dir), up);
	}

	function zoom(f){
		changeView(add(eye, scale(f,dir)), dir, up);
	}

	function getViewMatrix(){
		return V;
	}

	function getPerspectiveMatrix(){
		return P;
	}

	function pan(imagePlaneDelta){
		console.log(imagePlaneDelta);
		var smor = vec4(imagePlaneDelta.x, imagePlaneDelta.y, 0.0,0.0);
		var delta = mult(V, vec4(1,0,0,0));


		console.log(delta);
		var deltaV3 = vec3(delta[0], delta[1], delta[2]);
		changeView(add(eye, scale(10,deltaV3)), dir, up);
	}

	return {eye, dir, up, vFov, aspect,
		getPerspectiveMatrix,
		getViewMatrix,
		zoom,
		pan
	};
}

window.onload = function init()
{
	var canvas = document.getElementById( "gl-canvas" );

	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { alert( "WebGL isn't available" ); }

	gl.viewport( 0, 0, canvas.width, canvas.height );

	gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
	gl.enable(gl.DEPTH_TEST);

	
	camera = Camera(vec3(100,100,100), vec3(-1,-1,-1), vec3(0,1,0), 60,  canvas.width/canvas.height, 10,1000); 

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
		vertex: {name: "aVertexPosition_ms"},
		color: {name: "aColor"}
	},
	{});

	// useProgram(gl, phongProgram);
    //
	// bindUniformsToProgram(sharedUniforms, phongProgram.id, gl);

	lightModel = Tetrahedron(gl);

	var q = [
				[vec3(0,0,0), vec3(10,0,0), vec3(20,0,0), vec3(30,0,0)],
				[vec3(0,0,10), vec3(10,0,10), vec3(20,0,10), vec3(30,50,10)],
				[vec3(0,0,20), vec3(10,0,20), vec3(20,0,20), vec3(30,50,20)],
				[vec3(0,0,30), vec3(10,0,30), vec3(20,0,30), vec3(30,0,30)]
			];

	bezierSurf = parametricSurface(function(u,v){ return bezierSurface(u,v,q);}, 0, 0, 30,30);
	coordSys = CoordSys(gl);
	
	texture = loadTexture(gl,"metal2.jpg");
	texture2 = loadTexture(gl,"wood2.jpg");

	setUpEventHandling(canvas);
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

	M = mult(translate(lightPosition[0], lightPosition[1], lightPosition[2]), scalem(5,5,5));

	sharedUniforms.M.set(flatten(M));

	setProgramAttributes(gl, lightModel, primitiveProgram); 
	drawObject(gl, lightModel);

	sharedUniforms.M.set(flatten(scalem(1,1,1)));
	setProgramAttributes(gl, bezierSurf, primitiveProgram);
	drawObject(gl, bezierSurf);

	sharedUniforms.M.set(flatten(scalem(10,10,10)));
	setProgramAttributes(gl, coordSys, primitiveProgram);
	gl.lineWidth(2);
	drawObject(gl, coordSys);

	requestAnimFrame( render );
}
