//oPoints is a 4*4 array of observable points
function BezierSurfaceModel(startPos, xDiff, zDiff, uSamples, vSamples){

	var self = {};

	self.uSamples = uSamples;
	self.vSamples = vSamples;
	self.controlPoints = getObservableControlPointsForBezierSurface(startPos, xDiff, zDiff, recompute);

	function getCPGrid(){
		return observableControlPointsToVec3Matrix(self.controlPoints);
	}

	var cpGrid = getCPGrid(); 

	function bezierSurfaceSampler(u,v){
		return bezierSurface(u,v, cpGrid);
	}
	
	var surf = parametricSurface(bezierSurfaceSampler, 0, 0, uSamples, vSamples);

	function recompute(){
		var vbuff = surf.attribBuffers.vertex;
		gl.bindBuffer(gl.ARRAY_BUFFER, vbuff.id);
		cpGrid = getCPGrid();
		var vertices =  getParametricSurfaceVertices(bezierSurfaceSampler, uSamples,vSamples);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	}

	self.surface = surf;

	return self;
}

function getObservableControlPointsForBezierSurface(startPos, xDiff, zDiff, callback){

	var oCPoints = [];

	for(var i=0; i<4; i++){
		for(var j=0; j<4; j++){
			var pos = vec3(xDiff*j, 0, zDiff*i);
			oCPoints.push( ObservablePoint(add(pos, startPos), callback));
		}
	}

	return oCPoints;
}

function observableControlPointsToVec3Matrix(oPoints){
	var controlPoints = [];

	oPoints.forEach(function(op, i){
		if(i%4==0)
			controlPoints.push([]);
		
		arrIndx = Math.floor(i/4);
		controlPoints[arrIndx][i%4] = op.position;
	});

	return controlPoints;
}
