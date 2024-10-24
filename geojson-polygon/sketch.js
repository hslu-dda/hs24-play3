let geoData;
let projection;

function setup() {
    createCanvas(windowWidth, windowHeight);
    noLoop();
    angleMode(DEGREES);

    // load the data
    d3.json("./data/wettstein-buildings.geojson").then((csv) => {
        geoData = csv["features"];

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

    if (geoData && geoData.length) {
        geoData.forEach((element) => {
            let coordinates = element.geometry.coordinates[0][0]; // MultiPolygon, first set of coordinates

            beginShape();
            coordinates.forEach((coord) => {
                // let projected = projection(coordinates);

                // let x = projected[coord[0]] + random(1, 10);
                // let y = projected[coord[1]] + random(1, 10);

                // let x = coord[0] * scaleX + offsetX; // Longitude to X
                // let y = -coord[1] * scaleY + offsetY; // Latitude to Y (invert Y axis)
                // vertex(x, y);
            });
            endShape(CLOSE);
        });
    }
}
