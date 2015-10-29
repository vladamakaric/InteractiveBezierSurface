function Camera(eye, dir, up, vFov, aspect, near, far){

	var V = lookAt(eye, add(eye,dir), up);
	var VInv = inverse(V);
	var P = perspective(vFov, aspect, near, far);
	var self = {};

	self.eye = eye;
	self.dir = dir;
	self.up = up;
	self.vFov = vFov;
	self.aspect = aspect;

	function changeView(newEye, newDir, newUp){
		self.eye = newEye || self.eye;
		self.dir = newDir || self.dir;
		self.up = newUp || self.up;

		V = lookAt(self.eye, add(self.eye,self.dir), self.up);
		VInv = inverse(V);
	}

	self.zoom = function(f){
		changeView(add(self.eye, scale(f,self.dir)), self.dir, self.up);
	}

	self.getViewMatrix = function(){
		return V;
	}

	self.worldToNDC = function(pos_ws){
		var WtoNDC = mult(P, V);
		var pos_clip = mult(WtoNDC, vec4(pos_ws, 1));
		return dehomogenize(pos_clip);
	}

	self.getPerspectiveMatrix = function(){
		return P;
	}

	self.getRayFromNDCPos = function(p_ndc){
		var rdir_cs = rayVectorFromNDC(p_ndc, self.vFov, self.aspect);
		var rdir_ws = vec3(mult(VInv, vec4(rdir_cs,0)));

		return Ray(self.eye, normalize(rdir_ws));
	}

	self.getInvViewMatrix = function(){
		return VInv;
	}


	self.rotateAroundWSOrigin = function(angle, axis_cs){
		var axis_ws = mult(VInv, vec4(axis_cs,0));	

		var R = rotate((180/Math.PI)*angle, axis_ws);
		newEye = vec3(mult(R, vec4(self.eye, 1)));
		newDir = vec3(mult(R, vec4(self.dir,0)));
		newUp = vec3(mult(R, vec4(self.up,0)));

		changeView(newEye, newDir, newUp);
	}

	return self;
}

