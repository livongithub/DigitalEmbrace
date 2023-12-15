let handpose;
let video;
let predictions = [];
let thumb = [];
let index = [];
let ready = false;

let distanceBetFingers;
let mapColor;
let mapSize;

let angle = 0;
let r = 5
let incrament = 0.01

function setup() {
  createCanvas(2400, 1200);
  video = createCapture(VIDEO);
  video.size(width, height);

  frameRate(15)

  handpose = ml5.handpose(video, modelReady);

  handpose.on("predict", (results) => {
    predictions = results;
  });

  video.hide();
}

function modelReady() {
  console.log("Model ready!");
  ready = true;
}

function draw() {
    translate(-10, -10)
  background(0, 30);
  fill(220);
  r = map(distanceBetFingers, 15, 160, 15, 5)
  mapSize = map(distanceBetFingers, 15, 160, 10, 5)
  if(isNaN(mapSize)){
    mapSize = 5
  }
    if(isNaN(r)){
    r = 5
  }
  noStroke()
  fill(220, 120)
  for(j=0; j<width/2+1; j++){
    for(i=0; i<height/2+2; i++){
        let x = r*cos(angle+(j/10))
        let y = r*sin(angle+(i/10))
      
      ellipse(j*20+x, i*20+y, mapSize)
    }
  } 
  incrament = map(distanceBetFingers, 15, 160, 0.1, 0.01)
  if(isNaN(incrament)){
    incrament = 0.01
  }
  angle += incrament

  noFill()
  stroke(255)
  drawKeypoints();
}

function drawKeypoints() {
  for (let i = 0; i < predictions.length; i += 1) {
    const prediction = predictions[i];

    thumb = prediction.annotations.thumb[3];
    index = prediction.annotations.indexFinger[3];

    ellipse(thumb[0], thumb[1], 10, 10);
    ellipse(index[0], index[1], 10, 10);
  }
  if (ready && thumb.length > 2 && index.length > 2) {
    distanceBetFingers = dist(thumb[0], thumb[1], index[0], index[1])
    
    // console.log(predictions)
    // console.log(distanceBetFingers)
  }
}
