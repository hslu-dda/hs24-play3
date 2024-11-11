// Using the Tomorrow.io cloudCover API
// cloudCover = The fraction of the sky obscured by clouds when observed from a particular location

let apiKey = "YOUR_API_KEY";
let res = 4;

// Hamburg
let latHamburg = 53.5511; // Latitude for Hamburg
let longHamburg = 9.9937; // Longitude for Hamburg
let hamburgCloudLevel = 90;

// URL Hamburg
// https://docs.tomorrow.io/reference/realtime-weather
// let hamburgQuery = `https://api.tomorrow.io/v4/weather/realtime?location=${latHamburg},${longHamburg}&apikey=${apiKey}`
let hamburgQuery = `https://api.openweathermap.org/data/3.0/onecall?lat=${latHamburg}&lon=${longHamburg}&appid=${apiKey}`

function setup() {
    createCanvas(800, 800);
    frameRate(25);
    textFont("Andale Mono"); // https://developer.apple.com/fonts/system-fonts/?q=mono
}

function mousePressed(){
  fetchCloudCover();
}

function fetchCloudCover() {
    // fetch hamburg
    d3.json(hamburgQuery)
        .then((data) => {
            console.log(data);

            // Extract the cloud cover from API response
            hamburgCloudLevel = data.data.values.cloudCover;
            console.log("Current cloude level Hamburg: ", hamburgCloudLevel);

        })
        .catch((error) => {
            console.error("Error fetching cloud cover data:", error);
        });
}

function draw() {
    let noiseLevel = 255;

    // Draw Hamburg Clouds
    let noiseScaleHam = map(hamburgCloudLevel, 0, 100, 0.0, 0.005);

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

    // Hamburg
    fill(0);
    rect(6, 6, 220, 20);
    fill(255);
    textSize(12);
    text("Hamburg Cloud Coverage: " + hamburgCloudLevel, 13, 20);
}
