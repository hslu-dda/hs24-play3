// Global Variables
let data = [];
let projection;
let minMaxRSSI;
let rssiScale;

function setup() {
    createCanvas(windowWidth, windowHeight);
    noLoop();
    angleMode(DEGREES);

    // load the data
    d3.csv("./data/datalog_4151_9844.csv").then((csv) => {
        console.log(csv);
        // data = csv

        // remove duplicate networks
        data = uniqueNetworks(csv);

        // get the min/max RSSI from a custom function
        minMaxRSSI = findMinMaxRSSI(data);

        // Create a d3 scale to map rssi to circle diameter (min 10, max 50 as example)
        rssiScale = d3
            .scaleSqrt()
            .domain([minMaxRSSI.min, minMaxRSSI.max]) // Input: range of RSSI values
            .range([0, -90]); // Output: diameter range (e.g., 10px to 50px)

        redraw();
    });

    projection = d3
        .geoMercator()
        .center([7.6034, 47.5609]) // 47.56097879772118, 7.603443546087081, Basel
        .scale(10000000) // adjust the scale for the map size
        .translate([width / 2, height / 2]); // center the map
}

function draw() {
    background(240);

    if (data.length) {
        data.forEach((network) => {
            // get coordinates & translate in x, y
            const coordinates = [network[" longitude"], network[" latitude"]];
            let projected = projection(coordinates);
            let x = projected[0] + random(1, 10);
            let y = projected[1] + random(1, 10);

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
            // point()

            // let diameter = rssiScale(network[" rssi"]); // Get the circle's diameter based on rssi
            // console.log(diame5r)

            // fill(0, 0, 255, 50);
            // ellipse(x, y, diameter, diameter); // Draw the network
            // fill(0, 0, 0);
            // text(network[" ssid"], x + 10, y); // Add a label next to the point
        });
    }
}

// a function that makes sure that every network only appears once
function uniqueNetworks(data) {
    // Create a Map to track unique objects by the key
    const uniqueMap = new Map();

    // loop over all networks
    data.forEach((network) => {
        // check if the network name is already in the map
        if (!uniqueMap.has(network[" ssid"])) {
            // if it is not part of the map, add the item
            uniqueMap.set(network[" ssid"], network);
        }
    });
    // convert the map back to an array
    const uniqueNetworks = Array.from(uniqueMap.values());
    // return the filtered data back o setup
    return uniqueNetworks;
}

function findMinMaxRSSI(data) {
    // Ensure the array is not empty
    if (data.length === 0) {
        return { min: null, max: null };
    }

    // Use the first element as a starting point for comparison
    let minObj = data[0];
    let maxObj = data[0];

    data.forEach((item) => {
        const rssiValue = parseInt(item[" rssi"], 10); // Parse the "rssi" string as an integer

        if (rssiValue < parseInt(minObj[" rssi"], 10)) {
            minObj = item; // Update min if current rssi is lower
        }

        if (rssiValue > parseInt(maxObj[" rssi"], 10)) {
            maxObj = item; // Update max if current rssi is higher
        }
    });
    // the higher the number (e.g. -97) the bader the signal, hence higher number = min
    return { min: minObj[" rssi"], max: maxObj[" rssi"] };
}
