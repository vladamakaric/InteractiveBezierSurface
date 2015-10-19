

//origin and direction are vec3, direction is normalized
function Ray(origin, direction){

	var o = origin;
	var d = direction;
	
	function getPosition(t){
		return add(o, scale(t, direction));
	}

	return {o, d, getPosition};
}

function multiplyMatrixByVector(M,v){

	for ( var i = 0; i < u.length; ++i ) {

		for ( var j = 0; j < v.length; ++j ) {
			var sum = 0.0;
			for ( var k = 0; k < u.length; ++k ) {
				sum += u[i][k] * v[k][j];
			}
			result[i].push( sum );
		}
	}
}

function vec3ToRayDistance(v, ray){
	var toV = subtract(v, ray.o);
	var projection = add(ray.o, scale(dot(toV, ray.d), ray.d));
	
	var normalComponent = subtract(projection, v);
	return length(normalComponent);
}



