function createFloatArrayBuffer(gl, elSize, array){
	var arrBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, arrBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
	return {id: arrBuffer, elSize: elSize};
}

function loadTexture(gl,filename){

	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
				  new Uint8Array([255, 0, 0, 255]));

	var image = new Image();
	image.src = filename;
	image.onload = function(){
	  gl.bindTexture(gl.TEXTURE_2D, texture);
	  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	  gl.generateMipmap(gl.TEXTURE_2D);
	}

	return texture;
}

function getNormalTransformMat3(V,M){
	return normalMatrix(mult(V,M), true);
}

function concatenateArrOfArrs(arroarr){
	var arr = [];
	arroarr.forEach(function(a){
		arr = arr.concat(a);
	});

	return arr;
}

function getIndicesForGridMeshTriangleStrip(m, n){
	var indices = [];

	for(i=0; i<m-1; i++){

		for(j=0; j<n; j++){
			indices.push(i*n + j);
			indices.push((i+1)*n + j);

			if(j==n-1 && i!=m-2){
				indices.push((i+1)*n + j);
				indices.push((i+1)*n);
			}
		}
	}

	return indices;
}

function CoordSys(gl){

	var vertexBuffer = createFloatArrayBuffer(gl, 3,[
		//x
		1.0,0.0,0.0, 
		0.0,0.0,0.0,
		//y
		0.0,0.0,0.0,
		0.0,1.0,0.0,
		//z
		0.0,0.0,0.0,
		0.0,0.0,1.0
	]);

	var colorBuffer = createFloatArrayBuffer(gl, 4, [
		1.0, 0.0, 0.0, 1.0, 
		1.0, 0.0, 0.0, 1.0, 

		0.0, 1.0, 0.0, 1.0, 
		0.0, 1.0, 0.0, 1.0, 

		0.0, 0.0, 1.0, 1.0, 
		0.0, 0.0, 1.0, 1.0
	]);

	var attribBuffers = {vertex: vertexBuffer, color: colorBuffer};

	return {attribBuffers,  nVerts: 6, primtype: gl.LINES};
}


function parametricSurface(surf, uPderiv, vPderiv, uSamples, vSamples){
	var du = 1/(uSamples-1);
	var dv = 1/(vSamples-1);
	var i,j;

	var vertices = [];
	// var texCoords = [];
	// var normals = [];
	var colors = [];
	var indices = [];

	for(i=0; i<uSamples; i++){
		var u = i*du;

		for(j=0; j<vSamples; j++){
			var v = j*dv;

			// var xTan = vec3(1, xPderiv(x,y), 0);
			// var yTan = vec3(0, yPderiv(x,y), 1);
            //
			// var normal = cross(yTan, xTan);
			// normals.push(normal);
			// texCoords.push(j*dx/width, i*dy/height);

			var p = surf(u,v);
			vertices.push(p[0], p[1], p[2]);
		}
	}

	// normals = concatenateArrOfArrs(normals);

	indices = getIndicesForGridMeshTriangleStrip(uSamples,vSamples);

	var colors = [];

	for(var i=0; i<vertices.length/3; i++){
		colors.push(Math.random(), Math.random(), Math.random(), 1);
	}

	var colorBuffer = createFloatArrayBuffer(gl, 4, colors);
	var vertexBuffer = createFloatArrayBuffer(gl, 3, vertices);
	console.log(vertices);


	var indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

	var attribBuffers = {vertex: vertexBuffer,
				   color: colorBuffer
				   };

	return {indxBuffer:indexBuffer,attribBuffers,  
		nVerts:vertices.length, nIndices:indices.length, primtype: gl.TRIANGLE_STRIP};
}

function Surface(func, xPderiv, yPderiv, width, height, wsamples, hsamples){
	var dx = width/(wsamples-1);
	var dy = height/(hsamples-1);
	var i,j;

	var vertices = [];
	var texCoords = [];
	var normals = [];
	var indices = [];

	for(i=0; i<hsamples; i++){
		var y = i*dy - height/2;

		for(j=0; j<wsamples; j++){
			var x = j*dx - width/2;

			var xTan = vec3(1, xPderiv(x,y), 0);
			var yTan = vec3(0, yPderiv(x,y), 1);

			var normal = cross(yTan, xTan);
			normals.push(normal);
			texCoords.push(j*dx/width, i*dy/height);
			vertices.push(x, func(x,y), y);
		}
	}

	normals = concatenateArrOfArrs(normals);

	for(i=0; i<hsamples-1; i++){

		for(j=0; j<wsamples; j++){
			indices.push(i*wsamples + j);
			indices.push((i+1)*wsamples + j);

			if(j==wsamples-1 && i!=hsamples-2){
				indices.push((i+1)*wsamples + j);
				indices.push((i+1)*wsamples);
			}
		}
	}


	var normalBuffer = createFloatArrayBuffer(gl, 3, normals);
	var texCoordBuffer = createFloatArrayBuffer(gl, 2, texCoords);
	var vertexBuffer = createFloatArrayBuffer(gl, 3, vertices);

	var indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

	var attribBuffers = {vertex: vertexBuffer,
				   normal: normalBuffer,
				   texcoord: texCoordBuffer};

	return {indxBuffer:indexBuffer,attribBuffers,  
		nVerts:vertices.length, nIndices:indices.length, primtype: gl.TRIANGLE_STRIP};
}



function Tetrahedron(gl){
	var theta = Math.PI*2/3;
	var apex = [0,1,0];
	var v1 = [1,0,0];
	var v2 = [Math.cos(theta),0,Math.sin(theta)];
	var v3 = [Math.cos(2*theta),0,Math.sin(2*theta)];

	var vertBuff = createFloatArrayBuffer(gl, 3, concatenateArrOfArrs([
			v1,
			v2,
			v3,
			v1,
			apex,
			v2,
			apex,
			v3
			]));

	var colBuff = createFloatArrayBuffer(gl, 4, [
			1,1,1,1,
			1,1,1,1,
			1,1,1,1,
			1,1,1,1,
			1,1,1,1,
			1,1,1,1,
			1,1,1,1,
			1,1,1,1
			]);

	var attribBuffers = {vertex: vertBuff,
				   color: colBuff};

	return {attribBuffers,  nVerts: 8, primtype: gl.LINE_STRIP};
}


function createCube(gl) {

	var normalBuffer = createFloatArrayBuffer(gl, 3, [
			0,0,1.0,
			0,0,1.0,
			0,0,1.0,
			0,0,1.0,

			0,0,-1.0,
			0,0,-1.0,
			0,0,-1.0,
			0,0,-1.0,

			0,1.0,0,
			0,1.0,0,
			0,1.0,0,
			0,1.0,0,

			0,-1.0,0,
			0,-1.0,0,
			0,-1.0,0,
			0,-1.0,0,

			1.0,0,0,
			1.0,0,0,
			1.0,0,0,
			1.0,0,0,

			-1.0,0,0,
			-1.0,0,0,
			-1.0,0,0,
			-1.0,0,0
				]);

	var vertexBuffer = createFloatArrayBuffer(gl, 3, [
		// Front face
		-1.0, -1.0, 1.0,
		1.0, -1.0, 1.0,
		1.0, 1.0, 1.0,
		-1.0, 1.0, 1.0,

		// Back face
		-1.0, -1.0, -1.0,
		-1.0, 1.0, -1.0,
		1.0, 1.0, -1.0,
		1.0, -1.0, -1.0,

		// Top face
		-1.0, 1.0, -1.0,
		-1.0, 1.0, 1.0,
		1.0, 1.0, 1.0,
		1.0, 1.0, -1.0,

		// Bottom face
		-1.0, -1.0, -1.0,
		1.0, -1.0, -1.0,
		1.0, -1.0, 1.0,
		-1.0, -1.0, 1.0,

		// Right face
		1.0, -1.0, -1.0,
		1.0, 1.0, -1.0,
		1.0, 1.0, 1.0,
		1.0, -1.0, 1.0,

		// Left face
		-1.0, -1.0, -1.0,
		-1.0, -1.0, 1.0,
		-1.0, 1.0, 1.0,
		-1.0, 1.0, -1.0
			]);


	var texCoordBuffer = createFloatArrayBuffer( gl, 2, [
				0,1, 
				1,1,
				1,0,
				0,0,

				0,1, 
				1,1,
				1,0,
				0,0,

				0,1, 
				1,1,
				1,0,
				0,0,

				0,1, 
				1,1,
				1,0,
				0,0,

				0,1, 
				1,1,
				1,0,
				0,0,

				0,1, 
				1,1,
				1,0,
				0,0
					]);

	var cubeIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);

	var cubeIndices = [
		0, 1, 2,      0, 2, 3,    // Front face
		4, 5, 6,      4, 6, 7,    // Back face
		8, 9, 10,     8, 10, 11,  // Top face
		12, 13, 14,   12, 14, 15, // Bottom face
		16, 17, 18,   16, 18, 19, // Right face
		20, 21, 22,   20, 22, 23  // Left face
			];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

	//imena buffer-a odgovaraju imenima atributa u js objektu koji 
	//predstavlja shader program, da bi se lako povezali
	var attribBuffers = {vertex: vertexBuffer,
				   normal: normalBuffer,
				   texcoord: texCoordBuffer};

	var cube = {indxBuffer:cubeIndexBuffer,attribBuffers,  
		nVerts:24, nIndices:36, primtype: gl.TRIANGLES};

	return cube;
}
