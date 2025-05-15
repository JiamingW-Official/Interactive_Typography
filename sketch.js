'use strict';

let font, points = [];
const words  = ['inspiration','curiosity','resiliency'];
const quotes = [
  "“Inspiration exists, but it has to find us working.” – Picasso",
  "“Curiosity is the wick in the candle of learning.” – William Arthur Ward",
  "“Resiliency is accepting your new reality.” – Elizabeth Edwards"
];

let wordIndex      = 0;
let sampleFactor   = 0.1;
let fontSize       = 300;
let effectMode     = 0;
const effectNames  = ['Repulsion','Wavy','Perlin Noise','Ripple','Spiral',
                       'Magnetic Pull','Distortion Ripple','Swirl','Bubble Expansion'];

let trails = [];
const trailLifetime  = 100;
const cursorDiameter = 40;

function preload(){
  font = loadFont('Lagency-Regular.otf');
}

function setup(){
  createCanvas(windowWidth, windowHeight);
  noCursor();
  textFont(font);
  generatePoints();
}

function generatePoints(){
  let w = words[wordIndex],
      b = font.textBounds(w,0,0,fontSize),
      x = width/2 - b.w/2,
      y = height/2 + b.h/2;
  points = font.textToPoints(w, x, y, fontSize, { sampleFactor });
}

function draw(){
  // 1. 背景
  if(wordIndex === 2){
    drawSoftInteractiveBackground(30, 15);
  } else if(wordIndex === 0){
    drawTilesBackground(50,10,'rect',[290,180,60]);
  } else {
    drawTilesBackground(60,12,'ellipse',[30,200,120]);
  }

  // 2. 拖尾
  let now = millis();
  trails.push({ x:mouseX, y:mouseY, t:now });
  trails = trails.filter(tr => now - tr.t <= trailLifetime);
  for(let tr of trails){
    let α = 1 - (now - tr.t)/trailLifetime;
    drawGradient(tr.x, tr.y, cursorDiameter, α);
  }

  // 3. 点阵文字 & 特效
  noStroke();
  let t = now/1000, cx = width/2, cy = height/2;
  for(let pt of points){
    let x=pt.x, y=pt.y, ox=0, oy=0;

    // 通用九种效果
    switch(effectMode){
      case 0: {
        let d = dist(x,y,mouseX,mouseY);
        if(d<100){
          let f = map(d,0,100,50,0),
              a = atan2(y-mouseY, x-mouseX);
          ox = cos(a)*f;
          oy = sin(a)*f;
        }
        break;
      }
      case 1: {
        let wave = sin(t*2 + x*0.03 + y*0.03)*6;
        ox = map(mouseX,0,width,-15,15) + wave;
        oy = map(mouseY,0,height,-15,15) + wave;
        break;
      }
      case 2: {
        let nf = noise(x*0.01 + t, y*0.01 + t);
        ox = map(nf,0,1,-mouseX*0.03,mouseX*0.03);
        oy = map(nf,0,1,-mouseY*0.03,mouseY*0.03);
        break;
      }
      case 3: {
        let d = dist(x,y,mouseX,mouseY),
            rip = sin(t*5 - d*0.1)*5,
            a   = atan2(y-mouseY, x-mouseX);
        ox = cos(a)*rip;
        oy = sin(a)*rip;
        break;
      }
      case 4: {
        // X/Y 方向独立收缩/扩张
        ox = sin(t + x*0.01) * 10;
        oy = cos(t + y*0.01) * 10;
        break;
      }
      case 5: {
        let d = dist(x,y,mouseX,mouseY);
        if(d<100){
          let f = map(d,0,100,0.5,0);
          ox = (mouseX - x)*f;
          oy = (mouseY - y)*f;
        }
        break;
      }
      case 6: {
        let d = dist(x,y,mouseX,mouseY),
            f = sin(d/20 - t*3) * map(d,0,200,10,0),
            a = atan2(y-mouseY, x-mouseX);
        ox = cos(a)*f;
        oy = sin(a)*f;
        break;
      }
      case 7: {
        let d = dist(x,y,mouseX,mouseY);
        if(d<150){
          let swirl = map(d,0,150,PI/3,0),
              a     = atan2(y-mouseY, x-mouseX) + swirl;
          ox = (cos(a)*d - (x-mouseX)) * 0.5; // 强度减半
          oy = (sin(a)*d - (y-mouseY)) * 0.5;
        }
        break;
      }
      case 8: {
        let d = dist(x,y,mouseX,mouseY);
        if(d<100){
          let f = map(d,0,100,15,0),
              a = atan2(y-mouseY, x-mouseX);
          ox = cos(a)*f;
          oy = sin(a)*f;
        }
        break;
      }
    }

    // 填色：curiosity 反色，resiliency 黑，其余白
    if(wordIndex === 1){
      let c = get(x,y);
      fill(255 - red(c), 255 - green(c), 255 - blue(c));
    } else if(wordIndex === 2){
      fill(0);
    } else {
      fill(255);
    }

    ellipse(x + ox, y + oy, 4, 4);
  }

  // 4. UI 注释
  drawUI();
  // 5. Quote
  drawQuote();
  // 6. 自定义光标
  fill(255);
  noStroke();
  ellipse(mouseX, mouseY, 10, 10);
}

function drawUI(){
  textFont(font);
  textSize(22);
  textLeading(26);
  textAlign(LEFT, TOP);

  let txt =
    "<- / -> : Switch Word\n" +
    "ENTER     : Change Effect\n" +
    "UP / DOWN : Adjust Density";

  if(wordIndex === 2){
    fill(0);
  } else if(wordIndex === 1){
    let bg = get(10,10);
    fill(255-red(bg),255-green(bg),255-blue(bg));
  } else {
    fill(255);
  }
  noStroke();
  text(txt, 10, 10);
}

function drawQuote(){
  textFont(font);
  textSize(20);
  textAlign(CENTER, BOTTOM);

  if(wordIndex === 2){
    fill(0);
  } else if(wordIndex === 1){
    let bg = get(width/2, height-40);
    fill(255-red(bg),255-green(bg),255-blue(bg));
  } else {
    fill(80);
  }
  noStroke();
  text(quotes[wordIndex], width/2, height-30);
}

function keyPressed(){
  if(keyCode === RIGHT_ARROW){
    wordIndex = (wordIndex + 1) % words.length; generatePoints();
  } else if(keyCode === LEFT_ARROW){
    wordIndex = (wordIndex + words.length - 1) % words.length; generatePoints();
  } else if(keyCode === ENTER){
    effectMode = (effectMode + 1) % effectNames.length;
  } else if(keyCode === UP_ARROW){
    sampleFactor = constrain(sampleFactor - 0.01, 0.05, 0.2); generatePoints();
  } else if(keyCode === DOWN_ARROW){
    sampleFactor = constrain(sampleFactor + 0.01, 0.05, 0.2); generatePoints();
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  generatePoints();
}

// 前两页背景
function drawTilesBackground(maxCols, maxRows, shape, hsv){
  let [h1,h2,h3] = hsv;
  let mX = constrain(mouseX,0,width),
      mY = constrain(mouseY,0,height);
  let cols = int(map(mX,0,width,1,maxCols)),
      rows = int(map(mY,0,height,1,maxRows));
  colorMode(HSB,360,100,100,100);
  background(0,0,100);
  let w=width/cols, h=height/rows, idx=0;
  for(let y=0;y<rows;y++){
    for(let x=0;x<cols;x++){
      let t = cols>1 ? (idx%cols)/(cols-1) : 0;
      let c1 = lerpColor(color(h1,100,100),color(h2,100,100),t),
          c2 = lerpColor(color(h2,100,100),color(h3,100,100),t);
      fill(lerpColor(c1,c2, y/(rows-1||1)));
      if(shape==='rect') rect(x*w,y*h,w,h);
      else ellipse(x*w+w/2,y*h+h/2,w,h);
      idx++;
    }
  }
  colorMode(RGB,255);
}

// 最后一页：30×15 灰度交互网格
function drawSoftInteractiveBackground(maxCols, maxRows){
  background(255);
  let mX = constrain(mouseX,0,width),
      mY = constrain(mouseY,0,height);
  let cols = int(map(mX,0,width,1,maxCols)),
      rows = int(map(mY,0,height,1,maxRows));
  let w = width/cols, h = height/rows;
  noStroke();
  for(let yy=0; yy<rows; yy++){
    for(let xx=0; xx<cols; xx++){
      // 灰度 t
      let t = ((cols>1?xx/(cols-1):0) + (rows>1?yy/(rows-1):0)) * 0.5;
      let shade = lerp(220,255,t);
      fill(shade);
      rect(xx*w, yy*h, w+1, h+1);
    }
  }
}

// 拖尾渐变
function drawGradient(cx, cy, d, α=1){
  let r = d/2;
  for(let i=r; i>0; i--){
    let inter = map(i,0,r,0,1);
    let c1 = color(200,150,255,200*α),
        c2 = color(50,100,255,0);
    fill(lerpColor(c1,c2,inter));
    noStroke();
    ellipse(cx,cy,i*2,i*2);
  }
}