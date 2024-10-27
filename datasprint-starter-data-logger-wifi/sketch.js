// Global Variables
let data = [];
let projection;
let minMaxRSSI;
let minRSSI = -97;
let maxRSSI = -65;
let rssiScale;

function setup() {
    createCanvas(windowWidth, windowHeight);
    noLoop();
    angleMode(DEGREES);

    // load the data
    d3.csv("./data/datalog_4151_9844.csv").then((csv) => {
        console.log("data loaded", csv);
        data = csv;

        // Create a d3 scale to map rssi to the angle of the line 
        // (min 0 = points to the right, max 90 = points upwards)
        rssiScale = d3
            .scaleSqrt()
            .domain([minRSSI, maxRSSI]) // Input: range of RSSI values
            .range([0, -90]); // Output: angle 0-90

        drawNetworks();
    });

    projection = d3
        .geoMercator()
        .center([7.6034, 47.5609]) // 47.56097879772118, 7.603443546087081, Basel
        .scale(10000000) // adjust the scale for the map size
        .translate([width / 2, height / 2]); // center the map
}

function drawNetworks() {
    background(240);

    if (data.length) {
        data.forEach((network) => {
            // get coordinates & translate in x, y
            const coordinates = [network[" longitude"], network[" latitude"]];
            let projected = projection(coordinates);
            let x = projected[0];
            let y = projected[1];

            let r = 100;
            let angle = rssiScale(network[" rssi"]);
            let dx = cos(angle) * r;
            let dy = sin(angle) * r;

            strokeWeight(1);
            stroke(0);
            line(x, y, x + dx, y + dy);

            strokeWeight(2);
            stroke(255, 0, 0);
            point(x, y);
        });
    }
}

