let geoImages = [];
let imageFiles = [
    "IMG_2448.jpeg",
    "IMG_2449.jpeg",
    "IMG_2450.jpeg",
    "IMG_2451.jpeg",
    "IMG_2452.jpeg",
    "IMG_2453.jpeg",
    "IMG_2454.jpeg",
    "IMG_2455.jpeg",
    "IMG_2456.jpeg",
    "IMG_2457.jpeg",
    "IMG_2458.jpeg",
    "IMG_2459.jpeg",
    "IMG_2460.jpeg",
    "IMG_2461.jpeg",
    "IMG_2462.jpeg",
    "IMG_2463.jpeg",
    "IMG_2464.jpeg",
    "IMG_2465.jpeg",
    "IMG_2466.jpeg",
    "IMG_2467.jpeg",
    "IMG_2468.jpeg",
    "IMG_2469.jpeg",
    "IMG_2470.jpeg",
    "IMG_2471.jpeg",
    "IMG_2472.jpeg",
    "IMG_2473.jpeg",
    "IMG_2474.jpeg",
    "IMG_2475.jpeg",
    "IMG_2476.jpeg",
    "IMG_2477.jpeg",
];

// Setup D3 projection
let projection = d3.geoMercator()
    .center([8.284194444444445, 47.069375])
    .scale(10000000)
    .translate([400, 400]);

async function setup() {
    createCanvas(800, 800);

    for (let i = 0; i < imageFiles.length; i++) {
        let path = './images/' + imageFiles[i];
        let imageData = await loadImageWithExif(path);
        geoImages[i] = imageData;
    }

    console.log("geoImages", geoImages);
    noLoop();
}


function draw() {
    background(220);

    // Draw each image at its geographic position
    for (let i = 0; i < geoImages.length; i++) {
        let geoImg = geoImages[i];
        // Convert geographic coordinates to screen position
        let pos = projection([geoImg.longitude, geoImg.latitude]);

        let x = pos[0];
        let y = pos[1];

        // scale the image
        let sc = 0.2;
        let w = geoImg.img.width * sc;
        let h = geoImg.img.height * sc;

        // Draw image centered at its position
        image(geoImg.img,x, y,w,h);
    }
}


function loadImageWithExif(path) {
    return new Promise((resolve, reject) => {
        loadImage(path, (img) => {
            let tempImg = document.createElement('img');
            tempImg.src = path;

            tempImg.onload = function () {
                EXIF.getData(tempImg, function () {
                    let lat = EXIF.getTag(this, "GPSLatitude");
                    let long = EXIF.getTag(this, "GPSLongitude");

                    let latitude = lat ? convertDMSToDD(lat) : null;
                    let longitude = long ? convertDMSToDD(long) : null;

                    resolve({
                        img: img,
                        latitude: latitude,
                        longitude: longitude,
                        filename: path.split('/').pop()
                    });
                });
            };

            tempImg.onerror = () => reject(new Error('Failed to load image'));
        });
    });
}

// Helper function to convert GPS coordinates from DMS to decimal degrees
function convertDMSToDD(dms) {
    return dms[0] + dms[1] / 60 + dms[2] / 3600;
}

