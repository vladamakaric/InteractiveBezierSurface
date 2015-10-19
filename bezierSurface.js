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

	var p = scale(B(0, u), q[0]);

	for(var i=1; i<n; i++){
		p = add(p, scale(B(i, u), q[i]));

	}

	//point on the curve
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
