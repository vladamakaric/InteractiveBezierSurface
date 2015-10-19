function setUpEventHandling(canvas){

	var angleInput = document.getElementById("angle");
	// angleInput.value = fovy;

	angleInput.oninput = function(){
		// fovy = angleInput.value;
	}

	canvas.onmousewheel = function (event){
		var wheel = event.wheelDelta/120;
		cameraDistance+=wheel;
		cameraDistance = Math.max(cameraDistance, 0);
	}

	document.onkeydown = checkKey;

	function checkKey(e) {
		e = e || window.event;
		lightSpeed = 3;

		switch(e.keyCode){
			case 38: 
				cameraY +=5; 
				break;
			case 40: 
				cameraY -=5; 
				break;

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
				lightPosition[2] += lightSpeed;
				keyW = true;
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
