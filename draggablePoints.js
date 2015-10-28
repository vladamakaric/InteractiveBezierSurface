//accepts array of observable points
function DraggablePoints(opArr){

	var self = {};

	self.points = opArr;
	self.closestPoint = undefined;
	self.updateClosestPointToRay = function(ray){

		var cp = _.min(opArr, function(op){
			return vec3ToRayDistance(op.position, ray);
		});

		self.closestPoint = cp;
	};
	
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


