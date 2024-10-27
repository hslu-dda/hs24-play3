// Global Variables
let data = [];

function setup() {
    createCanvas(400, 400);
    angleMode(DEGREES);

    // load the data
    d3.csv("./data/CSV017.CSV").then((csv) => {
        console.log(csv);
        data = csv;
        drawViz();
    });
}

function drawViz() {
    background(240);

    let stepX = width / 4; // since each line will have 5 points
    let rowCount = 5;
    let yOffset = 30; // vertical offset for each new line

    // Iterate over the data in chunks of 5
    for (let i = 0; i < data.length; i += rowCount) {
        beginShape();
        noFill();
        stroke(0);
        strokeWeight(10);

        // Draw one line with the current 5 items
        let x = 0;
        for (let j = 0; j < rowCount && i + j < data.length; j++) {
            // get the current position of the array by adding the count of both loops
            let dataIndex = i + j;
            // the MicOutput is a string
            let value = int(data[dataIndex]["MicOutput"]);
            // Map input values (0, 250) to output values (0, 50)
            let yValue = map(value, 0, 250, 0, 90);
            // calculate the y position
            let y = yOffset * (i / rowCount + 1) - yValue;
            vertex(x, y);
            x += stepX;
        }

        endShape();
    }
}
