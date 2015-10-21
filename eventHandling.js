
//position relative to canvas
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();

    return vec2(evt.clientX - rect.left, evt.clientY - rect.top);
}


function viewPortToNDC(pos, w, h){
	var x = 2*pos[0]/w -1;
	var y = -(2*pos[1]/h -1);

	return vec2(x,y);
}

function rayVectorFromNDC(pos, fov, aspect){
    var z = -1.0 / Math.tan( radians(fovy) / 2 );
	var x = pos[0]*aspect;
	var y = pos[1];
	return vec3(x,y,z);
}

function getCentralizedCoords(v, w, h){
	return vec2(v[0] - w/2, -(v[1] - h/2));
}

function getSphereIntercept(v, w, h){
	var r = h/2;
	var l = length(v);

	if(r<l)
		return vec3(0,0,0);
	else{
		var x = v[0];
		var y = v[1];
		
		var z = -Math.sqrt(r*r - x*x - y*y);

		return vec3(x,y,z);
	}
}



function PinchRotateMS(msm){
	var self = BaseMouseState(msm);

	self.mousemove = function(){
			var deltaDrag = subtract(msm.mousePos, msm.prevMousePos);

			console.log(msm.mousePos);

			if(length(deltaDrag)>0.1){
				var start = getSphereIntercept(msm.prevMousePos, msm.width, msm.height);
				var end = getSphereIntercept(msm.mousePos, msm.width, msm.height);
				var angle = Math.acos(dot(normalize(start), normalize(end)));
				var axis = cross(start, end);
				camera.rotateAroundWSOrigin(angle, axis);
			}
	}

	return self;
}


function BaseMouseState(msm){
	return {
		mousemove: function(){},
		mouseup: function(){
			msm.currentState = BaseMouseState(msm);
		},
		mousedown: function(){
			msm.currentState = PinchRotateMS(msm);
		},
		mousewheel: function(delta){
			camera.zoom(delta);
		},
		mousemove: function(){}
	};
}

//positions are viewport centralized
function MouseStateMachine(w,h){

	var self = {};

	self.width = w;
	self.height = h;
	self.mousePos = undefined;
	self.prevMousePos = undefined;
	self.currentState = BaseMouseState(self);

	self.mousemove = function(pos){
		self.mousePos = pos;
		console.log(self.mousePos);
		self.currentState.mousemove();
		self.prevMousePos = pos;
	}

	 self.mousedown = function(pos){
		self.mousePos = self.prevMousePos = pos;
		self.currentState.mousedown();
	}

	self.mouseup= function(pos){
		self.currentState.mouseup();
	}

	self.mousewheel = function(delta){
		self.currentState.mousewheel(delta);
	}

	return self;
}

function setUpEventHandling(canvas){

	var msm = MouseStateMachine(canvas.width, canvas.height);

	var angleInput = document.getElementById("angle");
	// angleInput.value = fovy;

	function getCentralizedMousePos(event){
		return getCentralizedCoords(getMousePos(canvas, event), canvas.width, canvas.height);
	}

	angleInput.oninput = function(){
		// fovy = angleInput.value;
	}

	canvas.onmouseup = function(event){
		msm.mouseup();
	}

	canvas.onmousedown = function(event){
		var pos = getCentralizedMousePos(event);
		msm.mousedown(pos);
	}

	canvas.onmousemove = function(event){
		var pos = getCentralizedMousePos(event);
		msm.mousemove(pos);
	}

	canvas.onmousewheel = function (event){
	  var direction = (event.detail<0 || event.wheelDelta>0) ? 1 : -1;
	  msm.mousewheel(direction);
	}

	document.onkeydown = checkKey;

	function checkKey(e) {
		e = e || window.event;
		lightSpeed = 3;

		switch(e.keyCode){
			case 68: //d
				camera.pan({x: 1, y:0});
				keyD = true;
				break;
			case 83: //s

				camera.pan({x: 0, y:-1});
				keyS = true;
				break;
			case 65: //a
				camera.pan({x: -1, y:0});
				keyA = true;
				break;
			case 87: //w
				camera.pan({x: 0, y:1});
				break;
			case 74: //j
				lightPosition[1] -= lightSpeed;
				keyW = true;
				break;
			case 75: //k
				lightPosition[1] += lightSpeed;
				keyW = true;
				break;
		}
	}
}
