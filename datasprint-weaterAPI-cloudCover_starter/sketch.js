// Grid of dots resolution
let res = 4;

// Hamburg
let latHamburg = 53.5511; // Latitude for Hamburg
let longHamburg = 9.9937; // Longitude for Hamburg
let hamburgCloudLevel = 90; // Some Cloud Level

function setup() {
    createCanvas(800, 800);
    frameRate(25);
    textFont("Andale Mono"); // https://developer.apple.com/fonts/system-fonts/?q=mono
}

function draw() {
    let noiseLevel = 255;

    // Draw Hamburg Clouds
    let noiseScaleHam = 0.005;

    for (let y = 0; y < height; y += res) {
        // Iterate from left to right.
        for (let x = 0; x < width; x += res) {
            let nx = noiseScaleHam * x;
            let ny = noiseScaleHam * y;
            let nt = noiseScaleHam * frameCount;

            // Compute the noise value.
            let c = noiseLevel * noise(nx, ny, nt);
            noFill();
            strokeWeight(res);
            stroke(c);
            point(x, y);
        }
    }

    // Legend
    noStroke();
    fill(0);
    rect(6, 6, 220, 20);
    fill(255);
    textSize(12);
    text("Hamburg Cloud Coverage: " + hamburgCloudLevel, 13, 20);
}
