let apiKey = "YOUR_API_KEY";

// Grid of dots resolution
let res = 4;

// Hamburg
let latHamburg = 53.5511; // Latitude for Hamburg
let longHamburg = 9.9937; // Longitude for Hamburg
let hamburgCloudLevel = 90; // Some Cloud Level

let hamburgQuery = `https://api.tomorrow.io/v4/weather/realtime?location=${latHamburg},${longHamburg}&apikey=${apiKey}`

let latKandy = "7.278878132924524";
let longKandy = "80.64157326884815";
let kandyCloudLevel = 0;

let kandyQuery = `https://api.tomorrow.io/v4/weather/realtime?location=${latKandy},${longKandy}&apikey=${apiKey}`


function setup() {
    createCanvas(800, 800);
    frameRate(25);
    textFont("Andale Mono"); // https://developer.apple.com/fonts/system-fonts/?q=mono
}

function mousePressed(){
    // call the API
    getWeather();
}

// Function to call the tomorrow.io API
function getWeather(){
    d3.json(kandyQuery).then(res => {
        console.log(res);
        kandyCloudLevel = res.data.values.cloudCover;
        console.log(kandyCloudLevel)
    })
}

function draw() {
    let noiseLevel = 255;

    // Draw Hamburg Clouds
    // map(hamburgCloudLevel, )
    let noiseScaleHam = map(kandyCloudLevel, 0, 100, 0.0001, 0.05);

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
    text("Kandy Cloud Coverage: " + kandyCloudLevel, 13, 20);
}
