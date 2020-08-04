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

var gui, stats;

function setup(){
    createCanvas(640, 480);
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
    // video.hide();

    x = lastX = width/2.0;
    y = lastY = height/2.0;
    hue = random(0,255);

    handpose = ml5.handpose(video, modelReady);


    // setup gui
    gui = new dat.gui.GUI();
    gui.add(settings, 'debug');
    gui.add(settings, 'alphaFade').min(0).max(255);
    gui.add(settings, 'saturation').min(0).max(255);
    gui.add(settings, 'brightness').min(0).max(255);
  
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
  // image(video, 0, 0, width, height);
  noStroke();
  fill(255, 255,255, settings.alphaFade);
  rect(0,0,width, height);
  fill(255);

    // We can call both functions to draw all keypoints and the skeletons
    if ( settings.debug )
        drawKeypoints();
    else {
        if (predictions.length > 0 ){
            // console.log(predictions);
            // flip + draw
            // x = x * .95 + .05 * (width - predictions[0].landmarks[0][0]);
            // y = y * .95 + .05 * predictions[0].landmarks[0][1];
            x = width - predictions[0].landmarks[0][0];
            y = predictions[0].landmarks[0][1];
            
            var c = HSVtoRGB(hue, settings.saturation, settings.brightness);
            fill(c.r,c.g,c.b);
            noStroke();
            ellipse(x,y,4,4);

            stroke(hue,80,100);
            strokeWeight(abs(lastX-x));

            // or draw lines
            line(x,y, lastX, lastY);
            lastX = x; lastY = y;
            hue += .1;
        } else {
        }
    }
    // stats.end();
}

function modelReady() {
  console.log("Model ready!");
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