let res = 4;

function setup() {
  createCanvas(800, 800);
  frameRate(25);

}

function draw() {
  let noiseLevel = 255;
  let noiseScale = 0.005;

  for (let y = 0; y < height; y += res) {
    // Iterate from left to right.
    for (let x = 0; x < width; x += res) {

      let nx = noiseScale * x;
      let ny = noiseScale * y;
      let nt = noiseScale * frameCount;

      // Compute the noise value.
      let c = noiseLevel * noise(nx, ny, nt);

      // let c = random(255);
      strokeWeight(res);
      stroke(c);
      point(x, y);
    }
  }

}