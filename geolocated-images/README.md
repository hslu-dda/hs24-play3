# Geolocated Images

1. Copy paste your images into the images folder
2. Use terminal to create a text file were all image names are placed to create an array to load all images: `ls | sed 's/^/"/;s/$/"/' | paste -sd, - > filenames.txt`
3. Copy paste the filenames into `let imageArray = [...]` in `sketch.js` (check of there is not also "filenames.txt" part of the array, this leads to an error).
