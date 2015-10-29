var f = [];
function factorial (n) {
	if (n == 0 || n == 1)
		return 1;
	if (f[n] > 0)
		return f[n];
	return f[n] = factorial(n-1) * n;
} 

function bern3(i,x){
	return (6/(factorial(i)*factorial(3-i)))*Math.pow(x,i)*Math.pow(1-x,3-i);
}

//q is an array of 4 vec3 control points
function bezierCurve(u, q){
	var B = bern3;
	var n = 4;

	var p = vec3(0,0,0);

	for(var i=0; i<n; i++){
		p = add(p, scale(B(i, u), q[i]));

	}

	return p;
};

//q is a matrix of 4x4 vec3 control points
function bezierSurface(u,v, q){

	var B = bern3;
	var n=4;

	var p = vec3(0,0,0);

	for(var i=0; i<n; i++){
		p = add(p, scale(B(i,u), bezierCurve(v, q[i])));
	}

	return p;
}

/////////////////////////////////////////////////////////////////////////////////////
/////////////Temporary code, needs refactoring, derivatives need special cases on surface boundary

function bern3Deriv(i, x){
	var denum = factorial(3-i)*factorial(i);
	var num = 6*(i - 3*x)*Math.pow((1-x), 2-i)*Math.pow(x, i-1);
	return num/denum;
}

function bezierCurveDeriv(u, q){
	var B = bern3Deriv;
	var n = 4;

	var p = vec3(0,0,0);

	for(var i=0; i<n; i++){
		p = add(p, scale(B(i, u), q[i]));

	}

	return p;
};

function bezierSurfaceUDerivative(u,v,q){

	var B;
	var n=4;
	var p = vec3(0,0,0);

	if(u == 0){
		B = bern3;

		for(var i=0; i<n; i++){
			p = add(p, scale(3*B(i,v), subtract(q[1][i], q[0][i])));
		}

		return p;
	}

	if(u.toPrecision(4) == 1){
		B = bern3;

		for(var i=0; i<n; i++){
			p = add(p, scale(3*B(i,v), subtract(q[3][i], q[2][i])));
		}

		return p;
	}

	B = bern3Deriv;

	for(var i=0; i<n; i++){
		p = add(p, scale(B(i,u), bezierCurve(v, q[i])));
	}

	return p;
}

function bezierSurfaceVDerivative(u,v,q){

	var B=bern3;
	var n=4;
	var p = vec3(0,0,0);

	if(v == 0){
		for(var i=0; i<n; i++){
			p = add(p, scale(3*B(i,u), subtract(q[i][1], q[i][0])));
		}

		return p;
	}

	if(v.toPrecision(4) == 1){
		for(var i=0; i<n; i++){
			p = add(p, scale(3*B(i,u), subtract(q[i][3], q[i][2])));
		}

		return p;
	}

	for(var i=0; i<n; i++){
		p = add(p, scale(B(i,u), bezierCurveDeriv(v, q[i])));
	}
	return p;
	
}
