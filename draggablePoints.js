//accepts array of observable points
function DraggablePoints(opArr){

	var self = {};

		
	self.points = opArr;
	self.closestPoint = undefined;
	self.dragging = false;

	self.deactivate = function(){
		self.closestPoint = undefined;
		self.dragging = false;
	}

	self.updateClosestPointToRay = function(ray, mousePos_ndc){

		var cp = undefined;
		var maxDist = 20;
		var minDist = Infinity;

		opArr.forEach(function(op){
			var dist = vec3ToRayDistance(op.position, ray);

			if(dist < minDist && dist < maxDist){
				minDist = dist;
				cp = op;
			}
		});


		self.closestPoint = cp;

		if(cp)
			updateClosestPointGimbal(mousePos_ndc);
	};

	function getDraggablePointState(mousePos_ndc, redLS, greenLS, blueLS){
		var dList = [redLS.distanceToVec(mousePos_ndc), greenLS.distanceToVec(mousePos_ndc), blueLS.distanceToVec(mousePos_ndc)];

		var maxDist = 0.05;

		closest = _.reduce(dList, function(memo, d, i){ 
			if(d < memo.dist) 
				return {dist:d, i: i+1};
			return memo;
		}, {i: 0, dist: maxDist});

		return closest.i;
	}

	self.getNormalizedCPLocation = function(){
		var toCP = normalize(subtract(self.closestPoint.position, camera.eye));
		return add(scale(60, toCP), camera.eye);
	}


	function updateClosestPointGimbal(mousePos_ndc){
		var gimbalSize = 5;
		var fixCP = self.getNormalizedCPLocation();

		var red = vec2(camera.worldToNDC(add(fixCP, vec3(gimbalSize, 0,0))));
		var green = vec2(camera.worldToNDC(add(fixCP, vec3(0, gimbalSize,0))));
		var blue = vec2(camera.worldToNDC(add(fixCP, vec3(0, 0, gimbalSize))));
		var origin = vec2(camera.worldToNDC(fixCP));

		var redLS = LineSegment(red, origin);
		var greenLS = LineSegment(green, origin);
		var blueLS = LineSegment(blue, origin);

		self.closestPoint.state = getDraggablePointState(mousePos_ndc, redLS, greenLS, blueLS);
		// console.log(redLS.distanceToVec(mousePos_ndc));
	}
	
	return self;
}

function ObservablePoint(position){
	var self = {};
	var changeListener = function(){};

	Object.defineProperty(self, "position", {
		get: function() { return position; },
		set: function(pos) { position = pos; changeListener(); }
	});

	return self;
}


