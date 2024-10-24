// images to be loaded
let imageArray = [
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

// array to hold image-object containing file name and long/lat
let imageData = [];

function setup() {
    createCanvas(400, 400);

    imageArray.forEach((filename) => {
        // js image load function, p5 imageLoad strips metadata
        imageLoader(filename);
    });
}

function draw() {
    if (imageArray.length == imageData.length) {
        console.log(imageData);
        noLoop();
    }
}

// Function to load an image from a URL
function imageLoader(filename) {
    let img = new Image();
    img.crossOrigin = "Anonymous"; // Allow cross-origin resource sharing if necessary
    // When image is loaded, extract metadata
    img.onload = function () {
        extractMetadata(img);
    };
    img.src = "./images/" + filename; // Load image from URL
    img.filename = filename; // to add to object and maybe load later with p5 loadImage
}

// Extract EXIF metadata, including GPS coordinates
function extractMetadata(img) {
    EXIF.getData(img, function () {
        let lat = EXIF.getTag(this, "GPSLatitude");
        let lon = EXIF.getTag(this, "GPSLongitude");

        if (lat && lon) {
            let latitude = convertDMSToDD(
                lat[0],
                lat[1],
                lat[2],
                EXIF.getTag(this, "GPSLatitudeRef")
            );
            let longitude = convertDMSToDD(
                lon[0],
                lon[1],
                lon[2],
                EXIF.getTag(this, "GPSLongitudeRef")
            );

            // construct costum image object && add to imageData array
            const newImgObj = {
                filename: img.filename,
                latitude: latitude,
                longitude: longitude,
            };
            imageData.push(newImgObj);
        } else {
            console.log("No GPS data found");
        }
    });
}

// Convert GPS coordinates from DMS to Decimal Degrees (DD)
function convertDMSToDD(degrees, minutes, seconds, direction) {
    let dd = degrees + minutes / 60 + seconds / 3600;
    if (direction === "S" || direction === "W") {
        dd = dd * -1;
    }
    return dd;
}
