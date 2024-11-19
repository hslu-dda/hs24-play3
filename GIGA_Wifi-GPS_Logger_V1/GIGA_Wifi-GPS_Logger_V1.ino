/*
  A Data Logger that detects WiFi Signals and collects them with their GPS position in a CSV file.
  Developed for the Play 3 Module «Mapping Cities» @ Data Design + Art, HSLU
  By Max Frischknecht, October 2024
*/

/* Wifi Globals **************************************************************************/
#include <WiFi.h>


/* GPS Globals ***************************************************************************/
#include <TinyGPS++.h>
static const uint32_t GPSBaud = 9600;
TinyGPSPlus gps;  // The TinyGPSPlus object

// Define the time interval for checking the GPS connection (10 seconds)
const unsigned long GPS_CHECK_INTERVAL = 15000;  // <--- Change this Value to have a refreshrate wich changes every .... millis()
unsigned long lastGPSTestTime = 0;              // Track when the last check was performed


/* USB Card & CSV Globals *****************************************************************/
// USB Card max Size: 32GB ---> FAT32 Formatted

#include <Arduino_USBHostMbed5.h>
#include <DigitalOut.h>
#include <FATFileSystem.h>

USBHostMSD msd;
mbed::FATFileSystem usb("usb");

char filename[64];       // File path for the CSV
String DataString = "";  // Holds the data to be written to the USB

// Global variable to hold the CSV header
const char* csvHeader = "date, time, latitude, longitude, ssid, rssi, channel, encryptionType\n";  // Header as a global variable


/* Display Globals ***********************************************************************/

#include "Arduino_GigaDisplay_GFX.h"
GigaDisplay_GFX display;  // create the object

// define the DD+A colors using the RGB565 format
// >>> https://rgbcolorpicker.com/565
#define BLACK 0x0000
#define WHITE 0xffff
#define YELLOW 0xc7c6
#define RED 0xf800
#define BLUE 0x7c5f


/*****************************************************************************************/
/* Start Setup ***************************************************************************/
/*****************************************************************************************/

void setup() {

  /* IDE Serial for Debugging ***************************************/
  // Serial.begin(115200);
  // while (!Serial)
  //   ;

  /* GPS Setup *****************************************************/
  Serial1.begin(GPSBaud);


  /* Display Setup *************************************************/
  display.begin();
  display.fillScreen(BLACK);
  printDDAHeader();
  printToDisplay("Waiting for USB...", 10, 100, WHITE);


  /* USB Setup ****************************************************/
  // Enable the USB-A port
  pinMode(PA_15, OUTPUT);
  digitalWrite(PA_15, HIGH);

  // Establish a connection with the USB Mass Storage Device (MSD)
  msd.connect();

  // Wait till the USB is detected and connected
  while (!msd.connect()) {
    delay(1000);
  }

  // Proceed once the usb is detected and connected
  Serial.println("Mounting USB device...");
  printToDisplay("Mounting USB device...", 10, 130, WHITE);

  // Mount USB and check if success
  int err = usb.mount(&msd);
  if (err) {
    Serial.print("Error mounting USB device");
    printToDisplay("Error mounting USB device", 10, 160, RED);
    Serial.println(err);
    // infinite loop when error
    while (1)
      ;
  }
  Serial.print("Mounting done!");
  printToDisplay("Mounting done!", 10, 160, WHITE);


  /* CSV Setup ****************************************************/
  // File Initialization
  createCSVFile();


  /* WIFI Setup ***************************************************/
  // check for the WiFi module:
  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println("Communication with WiFi module failed!");
    printToDisplay("Communication with WiFi module failed!", 10, 190, RED);
    // don't continue
    while (true)
      ;
  }


  // reset screen
  display.fillScreen(BLACK);
}




/*****************************************************************************************/
/* Start Loooping ************************************************************************/
/*****************************************************************************************/

void loop() {
  // Continuously read data from the GPS module
  while (Serial1.available() > 0) {
    char c = Serial1.read();
    gps.encode(c);  // Process the incoming GPS data
  }

  // Check the GPS connection every GPS_CHECK_INTERVAL (10 seconds)
  if (millis() - lastGPSTestTime >= GPS_CHECK_INTERVAL) {
    lastGPSTestTime = millis();  // Update the last test time

    if (gps.charsProcessed() < 10) {
      Serial.println(F("No GPS detected: check wiring...."));
      Serial.println(gps.charsProcessed());
    } else {
      Serial.println(F("GPS is working and data is being received."));
      if (gps.location.isValid()) {
        networkLogger();  // <--- MAIN WORKHORSE
      } else {
        // print to display: Waiting for GPS...
        printDDAHeader();
        clearLowerScreen();
        Serial.print(F("No GPS yet..."));
        printToDisplay("No GPS yet...", 10, 100, WHITE);
      }
      Serial.println();
    }

    // Reset the charsProcessed count for the next interval test
    gps.charsProcessed();  // Optional: You can reset this if you want to track it per interval
  }
}


/*****************************************************************************************/
/* Scanning & Logging Networks ***********************************************************/
/*****************************************************************************************/

void networkLogger() {
  // gps is here, scan for nearby networks
  printDDAHeader();
  clearLowerScreen();
  Serial.println("Scanning...");
  printToDisplay("Scanning...", 10, 100, WHITE);

  int numSsid = WiFi.scanNetworks();
  if (numSsid == -1) {
    Serial.println("Couldn't get a WiFi connection");
    printToDisplay("Couldn't get a WiFi connection", 10, 130, RED);
    while (true)
      ;
  }

  // No networks found, no need to open/write to the file
  if (numSsid == 0) {
    Serial.println("No networks found.");
    printToDisplay("No networks found.", 10, 130, RED);
    return;
  }

  // print the list of networks seen:
  String message = "Found " + String(numSsid) + " networks";
  Serial.print(message);
  printToDisplay(message, 10, 130, WHITE);  // Pass the combined string to the display

  // Open the CSV file once before writing the scan results
  Serial.println("Re-opening CSV...");
  FILE* f = fopen(filename, "a");
  if (f == NULL) {
    Serial.print("Failed to open file: ");
    Serial.println(strerror(errno));
    return;
  }

  // Y-coordinate starts after the header
  int yPos = 200;  // Adjust based on font size and initial display
  display.setTextSize(2);
  display.setTextColor(WHITE);

  // print the network number and name for each network found:
  for (int thisNet = 0; thisNet < numSsid; thisNet++) {

    // Wifi data
    int rssi = WiFi.RSSI(thisNet);                      // Get signal strength (RSSI)
    int channel = WiFi.channel(thisNet);                // Get the channel number
    const char* ssid = WiFi.SSID(thisNet);              // Get the SSID as a string, this is needed for USB
    int encryptionType = WiFi.encryptionType(thisNet);  // Get the encryption type
    const char* encryptionStr = getEncryptionType(encryptionType);

    // Location Data
    String latitudeString = String(gps.location.lat(), 6);
    String longitudeString = String(gps.location.lng(), 6);
    // Convert to C-style strings (const char*)
    const char* latitude = latitudeString.c_str();
    const char* longitude = longitudeString.c_str();

    // Date/Time Data
    char date[12];  // Create a char array to hold the date string
    sprintf(date, "%02d/%02d/%04d", gps.date.month(), gps.date.day(), gps.date.year());
    char timeStr[13];  // Create a char array to hold the time string (HH:MM:SS.CS format)
    sprintf(timeStr, "%02d:%02d:%02d.%02d", gps.time.hour(), gps.time.minute(), gps.time.second(), gps.time.centisecond());


    /* Print Network ****************************************************/
    Serial.print("Location: ");
    Serial.print(latitude);
    Serial.print(F(","));
    Serial.print(longitude);
    Serial.print(" Signal: ");
    Serial.print(rssi);
    Serial.print(" dBm\tChannel: ");
    Serial.print(channel);
    Serial.print("\tEncryption: ");
    Serial.print(encryptionStr);
    Serial.print("\t\tSSID: ");
    Serial.println(ssid);
    Serial.println();

    Serial.print(F("Date/Time: "));
    Serial.print(gps.date.month());
    Serial.print(F("/"));
    Serial.print(gps.date.day());
    Serial.print(F("/"));
    Serial.print(gps.date.year());

    Serial.print(F(" "));
    Serial.print(gps.time.hour());
    Serial.print(F(":"));
    if (gps.time.minute() < 10) Serial.print(F("0"));
    Serial.print(gps.time.minute());
    Serial.print(F(":"));
    if (gps.time.second() < 10) Serial.print(F("0"));
    Serial.print(gps.time.second());
    Serial.print(F("."));
    if (gps.time.centisecond() < 10) Serial.print(F("0"));
    Serial.print(gps.time.centisecond());
    Serial.println();

    /* Display Network **************************************************/
    display.setTextColor(YELLOW);
    display.setCursor(10, yPos);
    display.print("* " + String(ssid));  // Convert ssid to String for display
    display.setTextColor(WHITE);
    display.setCursor(10, yPos + 20);
    display.print("  Location: " + String(latitude) + ", " + String(longitude));
    display.setCursor(10, yPos + 40);
    display.print("  " + String(rssi) + " dBm / Channel " + String(channel));
    display.setCursor(10, yPos + 60);
    display.print("  Encryption: " + String(encryptionStr));

    // Increase Y-coordinate to move to the next line
    yPos += 100;  // Adjust based on your text size

    /* Save Network *****************************************************/
    Serial.println("updating csv...");
    // int writeEr = fprintf(f, "%s,%s,%d,%d,%s,%s\n", longitude, latitude, rssi, channel, ssid, encryptionStr);
    int writeEr = fprintf(f, "%s,%s,%s,%s,%s,%d,%d,%s\n", date, timeStr, latitude, longitude, ssid, rssi, channel, encryptionStr);
    // Check if writing was success
    if (writeEr < 0) {
      Serial.println("Fail writing :(");
      error("error:", strerror(errno), -errno);
    }
  }
  // Close the file and check for errors
  Serial.println("File closing");
  int err = fclose(f);
  if (err < 0) {
    Serial.print("fclose error: ");
    Serial.print(strerror(errno));
    Serial.print(" (");
    Serial.print(-errno);
    Serial.println(")");
  } else {
    // Confirm successful closure
    Serial.println("File updated & closed successfully");
  }

  Serial.println();
}


/*****************************************************************************************/
/* Display Message ***********************************************************************/
/*****************************************************************************************/

// to print general messages below the header
void printToDisplay(String message, int x, int y, uint16_t color) {
  // Display the current message
  display.setTextSize(3);
  display.setCursor(x, y);  // Set the position for the text, 10/100
  display.setTextColor(color);
  display.print(message);  // Print the passed message
}

// to print the found networks in a smaller font
// starting at y = 200
void printNetworks(String message, int x, int y, uint16_t color) {
  // Display the current message
  display.setTextSize(2);
  display.setCursor(x, y);  // Set the position for the text, 10/100
  display.setTextColor(color);
  display.print(message);  // Print the passed message
}

void printDDAHeader() {
  // display the DD+A Header
  display.setTextSize(3);     // adjust text size between 1 an 80, value seems to be *10
  display.setCursor(10, 10);  //x,y
  display.setTextColor(BLUE);
  display.print("Data Design + Art");
  display.setCursor(10, 40);  // 10 offset + 30 size = 40
  display.setTextColor(YELLOW);
  display.print("Play 3 Wifi Data Logger");
}

void clearLowerScreen() {
  int x = 0;             // Start from the leftmost side
  int y = 70;            // Start clearing from y = 100
  int width = 480;       // Full width of the display
  int height = 800 - y;  // Height from y = 160 to the bottom (240 is the screen height)
  display.fillRect(x, y, width, height, BLACK);
}


/*****************************************************************************************/
/* Generate Filename Using Millis() ******************************************************/
/*****************************************************************************************/

void generateUniqueFilename() {
  // Use millis() to generate a unique filename
  unsigned long timestamp = millis();
  long randomNumber = random(1000, 9999);  // Generate a 4-digit random number
  sprintf(filename, "/usb/datalog_%lu_%ld.csv", timestamp, randomNumber);
  Serial.print("Generated filename: ");
  Serial.println(filename);
}

/*****************************************************************************************/
/* Initialize CSV File *******************************************************************/
/*****************************************************************************************/

// Function to create the file and write the header
void createCSVFile() {

  // Generate a unique filename using millis()
  generateUniqueFilename();

  Serial.println("Creating CSV file...");
  Serial.println(filename);
  printToDisplay("Creating CSV file...", 10, 100, RED);


  // Open the file in write mode ("w+"), creating it if it doesn't exist
  FILE* f = fopen(filename, "w+");
  if (f == NULL) {
    Serial.print("Failed to open file: ");
    Serial.println(strerror(errno));
    return;
  }

  // Write the header to the CSV file
  Serial.println("Creating CSV Header");
  int writeEr = fprintf(f, "%s", csvHeader);
  // Check if writing was success
  if (writeEr < 0) {
    Serial.println("Fail writing :(");
    error("error:", strerror(errno), -errno);
  }

  // Ensure that data is written to the file by flushing the buffer
  // fflush(f) can ensure that data is saved periodically even before the file is closed.
  fflush(f);

  // Close the file and check for errors
  Serial.println("File closing");
  int err = fclose(f);
  if (err < 0) {
    Serial.print("fclose error: ");
    Serial.print(strerror(errno));
    Serial.print(" (");
    Serial.print(-errno);
    Serial.println(")");
  } else {
    // Confirm successful closure
    Serial.println("CSV File initialized & closed successfully");
    printToDisplay("CSV File initialized & closed successfully", 10, 100, RED);
  }
}


/*****************************************************************************************/
/* Network Helper Function ***************************************************************/
/*****************************************************************************************/
const char* getEncryptionType(int thisType) {
  // Return the corresponding C-style string based on encryption type:
  switch (thisType) {
    case ENC_TYPE_WEP:
      return "WEP";
    case ENC_TYPE_WPA:
      return "WPA";
    case ENC_TYPE_WPA2:
      return "WPA2";
    case ENC_TYPE_NONE:
      return "None";
    case ENC_TYPE_AUTO:
      return "Auto";
    case ENC_TYPE_WPA3:
      return "WPA3";
    case ENC_TYPE_UNKNOWN:
    default:
      return "Unknown";
  }
}
