// Global Variables
let data = [];

function setup() {
    createCanvas(800, 800);
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
    noFill();
    stroke(0);
    strokeWeight(2);

    let y = height / 2;
    let x = 0;
    let stepX = width / data.length;

    beginShape();
    data.forEach((item) => {
        // the MicOutput is a string
        let value = int(item["MicOutput"]);
        // Map input values (0, 250) to output values (0, 50)
        let yValue = map(value, 0, 250, 0, 200);
        // y = y - yValue;
        vertex(x, y - yValue);
        x += stepX;
    });
    endShape();
}
