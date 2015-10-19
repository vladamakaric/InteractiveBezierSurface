
//position relative to canvas
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}


function viewPortToNDC(pos, w, h){
	var x = 2*pos.x/w -1;
	var y = -(2*pos.y/h -1);

	return {x,y};
}

function rayVectorFromNDC(pos, fov, aspect){
    var z = -1.0 / Math.tan( radians(fovy) / 2 );
	var x = pos.x*aspect;
	var y = pos.y;
	return vec3(x,y,z);
}

function setUpEventHandling(canvas){

	var angleInput = document.getElementById("angle");
	// angleInput.value = fovy;

	angleInput.oninput = function(){
		// fovy = angleInput.value;
	}

	canvas.onclick = function(event){
		var pos = getMousePos(canvas, event);

		pos = viewPortToNDC(pos, canvas.width, canvas.height);
		console.log(pos.x + "  " + pos.y);
	}

	canvas.onmousewheel = function (event){






		var wheel = event.wheelDelta/120;

		camera.zoom(wheel);
	}

	document.onkeydown = checkKey;

	function checkKey(e) {
		e = e || window.event;
		lightSpeed = 3;

		switch(e.keyCode){
			case 68: //d
				lightPosition[0] += lightSpeed;
				keyD = true;
				break;
			case 83: //s
				lightPosition[2] -= lightSpeed;
				keyS = true;
				break;
			case 65: //a
				lightPosition[0] -= lightSpeed;
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
