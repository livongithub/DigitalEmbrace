let video;
let classifier;

let poseNet;
let pose;

let label = 'waiting';

// Arrays for unique noise offsets for each particle
let xOffsets = [];
let yOffsets = [];
let numParticles = 500; // Number of particles

// Load the model
function preload() {
  classifier = ml5.imageClassifier('https://teachablemachine.withgoogle.com/models/_WCdGFQLI/');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);

  classifyVideo();

  // Initialize unique noise offsets for each particle
  for (let i = 0; i < numParticles; i++) {
    xOffsets[i] = random(0, 1000); // Random initial offsets for x
    yOffsets[i] = random(0, 1000); // Random initial offsets for y
  }
}

function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
  }
}

function modelLoaded() {
  console.log('poseNet is ready');
}

function classifyVideo() {
  classifier.classify(video, gotResults);
}

function draw() {
  background(51, 70);
  // translate(-75, -75)
  // image(video, 0, 0, width, height);

  textSize(32);
  fill(255);
  textAlign(CENTER, CENTER);
  // text(label, width / 2, height - 16);

  if (pose) {
    let noiseFactor = 0.002;
    let attractionStrength = 0.01; // Control attraction strength
    let bodyCenterX = (pose.leftShoulder.x + pose.rightShoulder.x) / 2;
    let bodyCenterY = (pose.leftShoulder.y + pose.rightShoulder.y) / 2;

    for (let i = 0; i < numParticles; i++) {
      let x = map(noise(xOffsets[i]), 0, 1, 0, width+150);
      let y = map(noise(yOffsets[i]), 0, 1, 0, height+150);

      if (label === 'arms-in') {
        // Calculate direction towards the body center
        let dirX = random(bodyCenterX-100, bodyCenterX+100) - x;
        let dirY = random(bodyCenterY-100, bodyCenterY+100) - y;
        let distance = sqrt(dirX * dirX + dirY * dirY);
        dirX /= distance; // Normalize direction
        dirY /= distance;

        if (distance > 10) { // Threshold to start applying small movements
          // Steer particles towards the body center
          xOffsets[i] += attractionStrength * dirX;
          yOffsets[i] += attractionStrength * dirY;
        } else {
          // Apply small, random movements around the center
          xOffsets[i] += 0.01
          yOffsets[i] += random(-0.01, 0.01);
        }
      } else {
        xOffsets[i] += noiseFactor;
        yOffsets[i] += noiseFactor;
      }
      noStroke()
      fill(255);
      ellipse(x, y, 5);
    }
  }
}

function gotResults(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  label = results[0].label;
  classifyVideo();
}
