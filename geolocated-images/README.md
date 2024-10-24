# Geolocated Images

1. Enable Location Services for the Camera:

	•	Go to Settings on your iPhone.
	•	Scroll down and tap on Privacy.
	•	Select Location Services.
	•	Make sure Location Services is turned on.
	•	Scroll down and find the Camera app.
	•	Select While Using the App to allow the Camera to access your location when you’re taking photos.

2. Take Photos with the Camera App:

	•	Open the Camera app and take photos as usual.
	•	The iPhone will automatically add geolocation metadata (GPS coordinates) to the photos you take, provided Location Services is enabled for the Camera app.

3. Check if Coordinates Are Included:

	•	Open the Photos app and select a photo.
	•	Swipe up or tap the “i” (info) button to see the photo’s metadata.
	•	If GPS coordinates are saved, you will see a map with the location where the photo was taken, along with latitude and longitude information.

4. Export Photos with Metadata:

When exporting or sharing these photos, ensure that the GPS metadata is preserved. This can be done by:

	•	Sharing photos directly from the Photos app.
	•	Sending the photo as a file (e.g., via AirDrop or email) rather than uploading to social media platforms, which sometimes strip metadata.

5. If necessary turn .HEIC files into .JPG files with Apple Preview.

6. Copy paste your images into the images folder
7. Use terminal to create a text file were all image names are placed to create an array to load all images: `ls | sed 's/^/"/;s/$/"/' | paste -sd, - > filenames.txt`
8. Copy paste the filenames into `let imageArray = [...]` in `sketch.js` (check of there is not also "filenames.txt" part of the array, this leads to an error).
