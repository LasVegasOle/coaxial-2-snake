// Parameters Events handler
document.getElementById('parameters').addEventListener('change', eventChangeHandler);

function eventChangeHandler(e) {
  if (e.target !== e.currentTarget) {
    drawing(snake_path_maker());  
  }
    e.stopPropagation();
} 


// Drawing
drawing(snake_path_maker());

function drawing(dots) {

  var canvas = document.getElementById('drawing');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
  }

  var snake_width = +document.getElementById("snake_width").value;
  var snake_turns = +document.getElementById("snake_turns").value;
  var snake_turns_length = +document.getElementById("snake_turns_length").value;
  var x = snake_width+snake_turns_length;
  var y = snake_turns_length*snake_turns/2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.moveTo(dots[0][0]+x, dots[0][1]+y);
  
  for (var i = 1; i < dots.length; i++) {
    ctx.lineTo(dots[i][0]+x, dots[i][1]+y);
  }

  ctx.stroke();

}

function turn_points() {

  var points = [];
  const num_segments = 5;
  var angle = 180/num_segments;

  var snake_turns_length = +document.getElementById("snake_turns_length").value;

  for (var i = 1; i <num_segments; i++) {

    var triangle_x = Math.round( 100 * ( snake_turns_length/2 * Math.sin(angle * i * Math.PI / 180) ) ) / 100;
    var triangle_y = Math.round( 100 * ( snake_turns_length/2 * Math.cos(angle * i * Math.PI / 180) ) ) / 100;

    points.push([triangle_x, Math.abs(triangle_y - snake_turns_length/2)]);

  }

  //console.log(points);

  return points;
}

//snake_path_maker();

// This creates an array of positions for all the dots in the pyramid
// each point represents the center base of the dot
function snake_path_maker(){
  var points = [];
  var z = +document.getElementById("initial_height").value;
  var snake_width = +document.getElementById("snake_width").value;
  var snake_turns = +document.getElementById("snake_turns").value;
  var snake_turns_length = +document.getElementById("snake_turns_length").value;
  var x = -snake_width/2;
  var y = -snake_turns_length*snake_turns/2;

  var turn = turn_points();

  var turn_dir = 1;

  points.push([x, y, z]);

  for (var i = 0; i < snake_turns; i++) {
  
    if(i%2){
      turn_dir = -1;
    } else {
      turn_dir = 1;
    }

    x = x + turn_dir * snake_width;

    points.push([x, y, z]);

    for (var j = 0; j < turn.length; j++) {
        points.push([x + turn_dir * turn[j][0], y + turn[j][1], z]);      
    }

    y += snake_turns_length;

    points.push([x, y, z]);

  }

  // Initial point line
  // End point
  // Turn
  // Repeat

  //console.log(points);

  return points;
}

function buildGCode() {

  drawing(snake_path_maker());

	var travel_feedrate = document.getElementById("travel_feedrate").value;
  var build_up_pause = +document.getElementById("build_up_pause").value;
  var release_pause = +document.getElementById("release_pause").value;

  var valve_on = "M42";
  var valve_off = "M43";

  var dots = snake_path_maker();
	// Initial homing position
	var fullGCode ="G28 \n";

  // Go initial location
  fullGCode += "G1 X" + dots[0][0] + " Y" + dots[0][1] + " Z" + dots[0][2] + " F" + travel_feedrate + " \n";

  // open solenoids
  fullGCode += "M42 \n";
  fullGCode += "M44 \n";

  // Build up pressure pause pause
  fullGCode += "G4 S" + build_up_pause + "\n"; 

  // Waiting building pressure

  
	for(var i = 0; i < dots.length; i++) {

    // Move on top of a dot
    // Z = point z + point height

    let xx = (Math.round(100*dots[i][0])/100);
    let yy = (Math.round(100*dots[i][1])/100);
    let zz = (Math.round(100*dots[i][2])/100);

    fullGCode += "G1 X" + xx + " Y" + yy + " Z" + zz + " F" + travel_feedrate + " \n";
	}

  // valve off
  fullGCode += "M43 \n";
  fullGCode += "M45 \n";

  // Release pressure pause
  fullGCode += "G4 S" + release_pause + "\n";

  //  Home printer
	fullGCode += "G28 \n";

  // Disable motors
	fullGCode += "M84 \n";  
  
	return fullGCode;
}

function createFile(){
	var output = getParameters();
	output += buildGCode();
  console.log(output);
	var GCodeFile = new Blob([output], {type: 'text/plain'});
	saveAs(GCodeFile, "coaxial_2_snake" + '.gcode');
}

function getParameters(){
var params = [];
	params += "; GCode generated with Stalactite from www.3digitalcooks.com \n";
	/*params += "; pyramid_initial_height: " + document.getElementById("pyramid_initial_height").value + "\n";
  params += "; pyramid_layer_height: " + document.getElementById("pyramid_layer_height").value + "\n";
	params += "; travel_feedrate: " + document.getElementById("travel_feedrate").value + "\n";
	params += "; travel_z_lift: " + document.getElementById("travel_z_lift").value + "\n"; 
	params += "; dots_per_side: " + document.getElementById("dots_per_side").value + "\n"; 
	params += "; distance_between_dots: " + document.getElementById("distance_between_dots").value + "\n";
	params += "; dot_printing_initial_height: " + document.getElementById("dot_printing_initial_height").value + "\n";
	params += "; dot_printing_final_height: " + document.getElementById("dot_printing_final_height").value + "\n";  
	params += "; dot_time: " + document.getElementById("dot_time").value + "\n";*/

return params;
}
