console.log('ml5 version:', ml5.version);

// Hand trackin'
var handpose;
var video;
var predictions = [];
var scaleFactor = 0.25;

var settings = {
  debug:false,
  alphaFade:50,
  saturation:255,
  brightness:100
};
var hue = 0;
var x = 0, y = 0;
var lastX = 0, lastY = 0;
var startRadius = 75;
var bigRadius = 100;

var gui, stats;
var chillColor, activeColor;
var circles = [];

/**
 * Quick dumb class
 */
function Circle (){
  this.x = 0;
  this.y = 0;
  this.color = null;
  this.active = false;
}

Circle.prototype.draw = function(){
  noStroke();
  if ( !this.active ){
    fill(chillColor);
    this.radius = this.radius * .75 + startRadius * .25;
  } else {
    fill(activeColor);
    this.radius = this.radius * .9 + bigRadius * .1;
  }
  ellipse(this.x, this.y, this.radius, this.radius);
  fill(255);

  // reset
  this.active = false;
}

Circle.prototype.hit = function(x,y){
  return x >= this.x - this.radius 
    && x <= this.x + this.radius 
    && y >= this.y - this.radius 
    && y <= this.y + this.radius;
}

/**
 * Setup
 */
function setup(){
  createCanvas(640, 480);

  chillColor = color(150);
  activeColor = color(50,200,50);

  var constraints = {
    video: {
      mandatory: {
        minWidth: width * scaleFactor,
        minHeight: height * scaleFactor
      },
      optional: [{ maxFrameRate: 60 }]
    },
    audio: false
  };
  video = createCapture(constraints);
  // video.size(width, height);

  // Hide the video element, and just show the canvas
  video.hide();

  x = lastX = width/2.0;
  y = lastY = height/2.0;
  hue = random(0,255);

  handpose = ml5.handpose(video, modelReady);
  
  // setup circles
  var nCircles = 4;
  var cen = {x:width/2, y:height/2};
  var p = 60;
  var r = startRadius;
  var t = nCircles*r + (nCircles-2)*p;

  for (var i=0; i<nCircles; i++){
    circles[i] = new Circle();
    circles[i].x = cen.x - t/2.0 + i*r + i*p;
    circles[i].y = cen.y;
    circles[i].radius = r;
  }

  // setup gui
  gui = new dat.gui.GUI();
  gui.add(settings, 'debug');
  // gui.add(settings, 'chillColor').min(0).max(255);
  // gui.add(settings, 'saturation').min(0).max(255);
  // gui.add(settings, 'brightness').min(0).max(255);

  // stats = new Stats();
  // document.body.appendChild( stats.dom );

  // This sets up an event that fills the global variable "predictions"
  // with an array every time new hand poses are detected
  handpose.on("predict", results => {
    predictions = results;
  });
}


function draw() {
  // stats.begin();
  image(video, 0, 0, width, height);
  // noStroke();
  // fill(255, 255,255, settings.alphaFade);
  // rect(0,0,width, height);
  // fill(255);

  for (let i = 0; i < predictions.length; i += 1) {
    const prediction = predictions[i];
    for (let j = 0; j < prediction.landmarks.length; j += 1) {
      const keypoint = prediction.landmarks[j];
      

      for (var k=0; k<circles.length; k++){
          var h = circles[k].hit(keypoint[0], keypoint[1]);
          if ( h ){
            circles[k].active = true;
            break;
          }
      }
    }
  }

  for (var i=0; i<circles.length; i++){
    circles[i].draw();
  }

  // We can call both functions to draw all keypoints and the skeletons
  if ( settings.debug )
      drawKeypoints();
  // stats.end();
}

function modelReady() {
  console.log("Model ready!");
  select("#loading").style("opacity", 0);
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  for (let i = 0; i < predictions.length; i += 1) {
    const prediction = predictions[i];
    for (let j = 0; j < prediction.landmarks.length; j += 1) {
      const keypoint = prediction.landmarks[j];
      
      var c = HSVtoRGB(hue, settings.saturation, settings.brightness);
      fill(c.r,c.g,c.b);
      // fill(0, 255, 0);
      noStroke();
      ellipse(keypoint[0], keypoint[1], 10, 10);
      hue += .1;
    }
  }
}

function HSVtoRGB(h, s, v) {
  // laziness
  if (h > 1){
    h = h/255;
    s = s/255;
    v = v/255;
  }

  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1) {
      s = h.s, v = h.v, h = h.h;
  }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
  }
  return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
  };
}