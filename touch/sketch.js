var inc = 0.1;
var scl = 10;
var cols, rows;
var zoff = 0; //Z-axis offset for Perlin noise.
var fr;
var particles = [];
var flowfield;

let handpose;
let video;
let predictions = [];

function setup() {
  createCanvas(2400, 1200);
  cols = floor(width / scl);
  rows = floor(height / scl);
  //Calculates the number of columns and rows
  fr = createP('');
  //Creates a paragraph element and assigns it to the fr variable for displaying the frame rate.

  flowfield = new Array(cols * rows);
  //Initializes the flowfield array with a length equal to the product of columns and rows.

  for (var i = 0; i < 800; i++) {
    particles[i] = new Particle();
  }

  video = createCapture(VIDEO);
  video.size(width, height);

  video.hide();

  // Load the handpose model
  handpose = ml5.handpose(video, modelReady);

 
  handpose.on('predict', function (results) {
    predictions = results;
  });
   // Listen to predictions
  
  background(255);
  noStroke();
}

function modelReady() {
  console.log('Model ready!');
}

function draw() {
  //image(video, 0, 0, width, height);

  if (predictions.length > 0) {
    let hand = predictions[0].landmarks;
    //Retrieves the landmarks of the first detected hand from the predictions. hand is an array containing the positions of various hand landmarks.
    
   let topY = hand[0][1];
let bottomY = hand[9][1]; 

    console.log('Top Y:', topY);
console.log('Bottom Y:', bottomY);
    
    // Get the y-coordinates of the top and bottom of the hand

    let handMovement = topY - bottomY;
    // Check if the hand is moving upwards or downwards

    var yoff = 0;
    for (var y = 0; y < rows; y++) {
      //Starts an outer loop that iterates through each row of the flow field.
      
      var xoff = 0;
      for (var x = 0; x < cols; x++) {
        //Starts an inner loop that iterates through each column of the flow field within the current row.
        
        var index = x + y * cols;
        //Calculates an index for the current position in the flow field based on the column ans row and the total number of columns
        
        var angle = noise(xoff, yoff, zoff) * TWO_PI * 4;
        //Generates Perlin noise at the current position in 3D space and scale it by 2pi x 4-> for the angle 
        
        var v = p5.Vector.fromAngle(angle);
        //2D vector for angle
        
        v.setMag(1);
        //vector has magnitude of one 
        
        flowfield[index] = v;
        xoff += inc;
      }
      yoff += inc;

      zoff += 0.0003;
    }
    
    for (let y = 0; y < rows; y++) {
  let xoff = 0;
  for (let x = 0; x < cols; x++) {
    const index = x + y * cols;

    // additional randomness 
    const additionalRandomness = random(-5, 2);
    const angle = noise(xoff, yoff, zoff) * TWO_PI * 4 + additionalRandomness;

    const v = p5.Vector.fromAngle(angle);
    v.setMag(1);
    flowfield[index] = v;

    xoff += inc;
  }
  yoff += inc;

  zoff += 0.0003;
}

    for (var i = 0; i < particles.length; i++) {
      particles[i].follow(flowfield);
      particles[i].update();
      particles[i].edges();
      particles[i].show();
    }
    //The particles follow the generated flow field, get updated, check for edges, and are then displayed.

     // Respond to hand movement
    if (handMovement < -10) {
      // Hand is moving up
      increaseInc();
      console.log('Hand is moving up');
    } else if (handMovement > 10) {
      // Hand is moving down
      decreaseInc();
      console.log('Hand is moving down');
    }
  }
  // fr.html(floor(frameRate()));
}
  

// functions to modify the inc variable based on hand movements
function increaseInc() {
  inc += 10;
}

function decreaseInc() {
  inc = 0;
}


class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    //position of particles initialized w/ random positions
    this.vel = createVector(0, 0);
    //velocity of particle set to 0 vector 
    this.acc = createVector(0, 0);
    //accleration of particle set to 0 vector
    this.maxSpeed = 2;
    //max. speed that can be reached
    this.prevPos = this.pos.copy();
    //previous positin of particle 
  }

  update() {
    this.vel.add(this.acc);
    //adds accleration to velocity 
    this.vel.limit(this.maxSpeed);
    //limits vel to max speed 
    this.pos.add(this.vel);
    //adds vel to position, updating pos 
    this.acc.mult(0);
    //after updating vel- reset accleration 
  }

  applyForce(force) {
    this.acc.add(force);
  }

  follow(flowfield) {
    let x = floor(this.pos.x / scl);
    let y = floor(this.pos.y / scl);
    //Calculates the grid cell coordinates of flow field based on the current pos \and the scl
    let index = x + y * cols;
    let force = flowfield[index];
    // direction of flow at the current position of the particle.
    this.applyForce(force);
  }


  show() {
    stroke(0, 15);
    strokeWeight(2);
    line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
    this.updatePrev();
  }

  updatePrev() {
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
  }

  edges() {
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }
}
