// Using the Tomorrow.io cloudCover API
// cloudCover = The fraction of the sky obscured by clouds when observed from a particular location

let apiKey = "YOUR_API_KEY";
let res = 4;

// Lucerne
let latLU = 47.0502; // Latitude for Lucerne
let longLU = 8.3093; // Longitude for Lucerne
let lucerneCloudLevel = 24;

// Hamburg
let latHamburg = 53.5511; // Latitude for Hamburg
let longHamburg = 9.9937; // Longitude for Hamburg
let hamburgCloudLevel = 90;

// URL Lucerne
let lucerneQuery = `https://api.tomorrow.io/v4/timelines?location=${latLU},${longLU}&fields=cloudCover&timesteps=current&units=metric&apikey=${apiKey}`;
let hamburgQuery = `https://api.tomorrow.io/v4/timelines?location=${latHamburg},${longHamburg}&fields=cloudCover&timesteps=current&units=metric&apikey=${apiKey}`;


function setup() {
    createCanvas(800, 800);
    frameRate(25);
    textFont("Andale Mono"); // https://developer.apple.com/fonts/system-fonts/?q=mono
}

function mousePressed(){
  fetchCloudCover();
}

function fetchCloudCover() {
    // fetch lucerne
    d3.json(lucerneQuery)
        .then((data) => {
            console.log(data);

            // Extract the cloud cover from API response
            lucerneCloudLevel =
                data.data.timelines[0].intervals[0].values.cloudCover;
            console.log("Current cloude level Lucerne: ", lucerneCloudLevel);

        })
        .catch((error) => {
            console.error("Error fetching cloud cover data:", error);
        });

    // fetch hamburg
    d3.json(hamburgQuery)
        .then((data) => {
            console.log(data);

            // Extract the cloud cover from API response
            hamburgCloudLevel =
                data.data.timelines[0].intervals[0].values.cloudCover;
            console.log("Current cloude level Hamburg: ", hamburgCloudLevel);

        })
        .catch((error) => {
            console.error("Error fetching cloud cover data:", error);
        });
}

function draw() {
    let noiseLevel = 255;

    // the noise scale should go from 0.0 (no clouds) to 0.005 (very cloudy)
    // the values from the api go from 0 (no clouds) tp 100 (very cloudy)
    let noiseScaleLU = map(lucerneCloudLevel, 0, 100, 0.0, 0.005);

    // Draw Lucerne Clouds
    for (let y = 0; y < height; y += res) {
        // Iterate from left to right.
        for (let x = 0; x < width / 2; x += res) {
            let nx = noiseScaleLU * x;
            let ny = noiseScaleLU * y;
            let nt = noiseScaleLU * frameCount;

            // Compute the noise value.
            let c = noiseLevel * noise(nx, ny, nt);
            noFill();
            strokeWeight(res);
            stroke(c);
            point(x, y);
        }
    }

    // Draw Hamburg Clouds
    let noiseScaleHam = map(hamburgCloudLevel, 0, 100, 0.0, 0.005);

    for (let y = 0; y < height; y += res) {
        // Iterate from left to right.
        for (let x = 0; x < width / 2; x += res) {
            let nx = noiseScaleHam * x;
            let ny = noiseScaleHam * y;
            let nt = noiseScaleHam * frameCount;

            // Compute the noise value.
            let c = noiseLevel * noise(nx, ny, nt);
            noFill();
            strokeWeight(res);
            stroke(c);
            point(x + width / 2, y);
        }
    }

    // Legend
    noStroke();

    // Lucerne
    fill(0);
    rect(6, 6, 220, 20);
    fill(255);
    textSize(12);
    text("Lucerne Cloud Coverage: " + lucerneCloudLevel, 13, 20);

    // Hamburg
    fill(0);
    rect(6 + width / 2, 6, 220, 20);
    fill(255);
    textSize(12);
    text("Hamburg Cloud Coverage: " + hamburgCloudLevel, 13 + width / 2, 20);
}
