let geoData;
let projection;

function setup() {
    createCanvas(windowWidth, windowHeight);
    noLoop();
    angleMode(DEGREES);

    // load the data
    d3.json("./data/wettstein-buildings.geojson").then((csv) => {
        geoData = csv["features"];

        drawBuildings();
    });

    projection = d3
        .geoMercator()
        .center([7.6034, 47.5609]) // 47.56097879772118, 7.603443546087081, Basel
        .scale(10000000) // adjust the scale for the map size
        .translate([width / 2, height / 2]); // center the map
}

function drawBuildings() {
    background(240);
    noStroke();
    fill(0);

    if (geoData && geoData.length) {
        geoData.forEach((item) => {
            // get geometry data
            let geometryData = item["geometry"];

            if (geometryData["type"] == "MultiPolygon") {
                // this geojson is very weird as the coordinates are inside multiple arrays...
                let coordinatesArray = geometryData["coordinates"][0][0];
                // console.log(coordinatesArray);

                beginShape();
                coordinatesArray.forEach((coordinates) => {
                    let projected = projection(coordinates);
                    let x = projected[0];
                    let y = projected[1];
                    console.log(x, y)
                    vertex(x, y);
                });
                endShape(CLOSE);
            }

        });
    }
}
