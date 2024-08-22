// Refresh on first load
window.onload = function () {
  if (!window.location.hash) {
    window.location = window.location + "#loaded";
    window.location.reload();
  }
};

// Refresh satelit img
function refreshImage() {
  var img = document.getElementById("satelit");
  var currentSrc = img.src;
  // Add a query parameter to the URL to force reload
  img.src = currentSrc.split("?")[0] + "?t=" + new Date().getTime();
  console.log("Image refreshed at " + new Date().toLocaleTimeString());
}

// Refresh the image every 5 minutes (300000 milliseconds)
setInterval(refreshImage, 300000);

// Optional: immediately refresh the image on page load
refreshImage();

//Parsing data mas fajar
$(document).ready(function () {
  var previousHazardLevel = null;
  var soundPlayedForCurrentHazard = false;

  // Define the function to fetch and parse the JSON
  function fetchJSON() {
    fetch("http://36.95.156.55/hires_wilper/point_forecast/sda_tgulangin.json")
      .then((response) => response.json())
      .then((data) => {
        // Extract the data from the JSON
        var statusText = data.narasi; // Assuming the JSON contains a 'narasi' field for status text
        var hazardLevel = data.cat; // Assuming the JSON contains a 'forecast' field for hazard level

        // Update the text of the status indicator
        $("#status-indicator-satellite").text(statusText);

        // Change the background color based on the hazard level
        var backgroundColor;
        if (hazardLevel === "1") {
          backgroundColor = "green";
        } else if (hazardLevel === "2") {
          backgroundColor = "orange";
        } else if (hazardLevel === "3") {
          backgroundColor = "red";
        } else {
          backgroundColor = "green"; // Default color if level is unknown
        }

        $(".status-indicator-satellite").css({
          "background-color": backgroundColor,
          color: "white", // Set the text color to white
        });

        // Play sound effect if hazard level changes
        if (hazardLevel !== previousHazardLevel) {
          var audio = new Audio(
            "http://36.95.156.55/hires_wilper/point_forecast/sda_tgulangin.mp3"
          );
          audio.play();
          previousHazardLevel = hazardLevel;
          soundPlayedForCurrentHazard = true;
        } else {
          soundPlayedForCurrentHazard = false;
        }
      })
      .catch((error) => {
        console.log("Failed to fetch JSON. Retrying...");
      });
  }

  // Call the function initially
  fetchJSON();

  // Set an interval to retry fetching every 5 minutes (300,000 ms)
  setInterval(fetchJSON, 300000);
});

// Parsing csv files from BMKG Open Data
$(document).ready(function () {
  const csvUrl =
    "https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/CSV/kecamatanforecast-jawatimur.csv";

  const weatherDescriptions = {
    0: "Cerah",
    100: "Cerah",
    1: "Cerah Berawan",
    101: "Cerah Berawan",
    2: "Cerah Berawan",
    102: "Cerah Berawan",
    3: "Berawan",
    103: "Berawan",
    4: "Berawan Tebal",
    104: "Berawan Tebal",
    5: "Udara Kabur",
    10: "Asap",
    45: "Kabut",
    60: "Hujan Ringan",
    61: "Hujan Sedang",
    63: "Hujan Lebat",
    80: "Hujan Lokal",
    95: "Hujan Petir",
    97: "Hujan Petir",
  };

  const weatherIcons = {
    0: "img/cerah.png",
    100: "img/cerah.png",
    1: "img/cerah_berawan.png",
    101: "img/cerah_berawan.png",
    2: "img/cerah_berawan.png",
    102: "img/cerah_berawan.png",
    3: "img/berawan.png",
    103: "img/berawan.png",
    4: "img/berawan_tebal.png",
    104: "img/berawan_tebal.png",
    5: "img/kabut.png",
    10: "img/kabut.png",
    45: "img/kabut.png",
    60: "img/hujan_ringan.png",
    61: "img/hujan_sedang.png",
    63: "img/hujan_lebat.png",
    80: "img/hujan_lebat.png",
    95: "img/hujan_petir.png",
    97: "img/hujan_petir.png",
  };

  function findClosestInterval(rows, currentTimeUTC) {
    const interval = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
    const currentIntervalStart = new Date(
      Math.floor(currentTimeUTC.getTime() / interval) * interval
    );

    // Find the closest interval that is <= currentTimeUTC
    return rows.reduce((closest, row) => {
      const rowTimeUTC = new Date(row[1] + " UTC");
      return rowTimeUTC <= currentTimeUTC && rowTimeUTC > closest
        ? rowTimeUTC
        : closest;
    }, new Date(0));
  }

  function updateWeatherData() {
    console.log("Starting updateWeatherData function"); // Log start of the function

    Papa.parse(csvUrl, {
      download: true,
      delimiter: ";",
      complete: function (results) {
        console.log("CSV data parsed:", results); // Log parsed CSV data

        const rows = results.data.filter((row) => row[0] === "5008664");
        console.log("Filtered rows with ID 5008664:", rows); // Log filtered rows

        if (rows.length > 0) {
          const currentTimeUTC = new Date();
          console.log("Current UTC time:", currentTimeUTC); // Log current time

          const closestRowTime = findClosestInterval(rows, currentTimeUTC);
          console.log("Closest row time:", closestRowTime); // Log closest interval time

          const closestRow = rows.find(
            (row) =>
              new Date(row[1] + " UTC").getTime() === closestRowTime.getTime()
          );
          console.log("Closest row data:", closestRow); // Log closest row data

          if (closestRow) {
            const kodeCuaca = closestRow[8];
            const suhu = closestRow[7];
            const kelembaban = closestRow[6];

            const weatherDescription =
              weatherDescriptions[kodeCuaca] || "Unknown weather code";
            const weatherIcon =
              weatherIcons[kodeCuaca] || "path/to/default_image.jpg";

            console.log("Weather description:", weatherDescription); // Log weather description
            console.log("Temperature:", suhu); // Log temperature
            console.log("Humidity:", kelembaban); // Log humidity

            $("#cuaca").text(weatherDescription);
            $("#suhu").text(`${suhu}°C`);
            $("#kelembaban").text(`${kelembaban}%`);
            $("#weather-icon").attr("src", weatherIcon);
          } else {
            console.log(
              "No matching data found for the closest time interval."
            ); // Log no matching data
            $("#cuaca").text(
              "No matching data found for the closest time interval."
            );
            $("#suhu").text("N/A");
            $("#kelembaban").text("N/A");
            $("#weather-icon").attr("src", "");
          }
        } else {
          console.log("Row with ID 5008664 not found."); // Log row not found
          $("#cuaca").text("Row with ID 5008664 not found.");
          $("#suhu").text("N/A");
          $("#kelembaban").text("N/A");
          $("#weather-icon").attr("src", "path/to/default_image.jpg");
        }
      },
      error: function (error) {
        console.error("Error parsing CSV file:", error); // Log error
        $("#cuaca").text("Error parsing CSV file.");
        $("#suhu").text("Error");
        $("#kelembaban").text("Error");
        $("#weather-icon").attr("src", "path/to/default_image.jpg");
      },
    });
  }

  // Update the weather data immediately on page load
  updateWeatherData();

  // Set an interval to update the weather data every hour (3600000 milliseconds)
  setInterval(updateWeatherData, 3600000);
});

// MQTT broker URL
const brokerUrl = "wss://broker.emqx.io:8084/mqtt";

// Create a client instance
const client = new Paho.MQTT.Client(
  brokerUrl,
  "clientId" + new Date().getTime()
);

// Topic to subscribe to
const topic = "KKNSTMKG15/parameter";

// Set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// Connect the client
client.connect({
  onSuccess: onConnect,
  onFailure: onFailure,
  useSSL: false, // Use SSL if your broker supports it
});

// Called when the client connects
function onConnect() {
  console.log("Connected to broker");
  client.subscribe(topic, {
    onSuccess: onSubscribeSuccess,
    onFailure: onSubscribeFailure,
  });
}

// Called when the client fails to connect
function onFailure(response) {
  console.log("Connection failed: " + response.errorMessage);
  setTimeout(
    () => client.connect({ onSuccess: onConnect, onFailure: onFailure }),
    1000
  ); // Retry connection
}

// Called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost: " + responseObject.errorMessage);
    setTimeout(
      () => client.connect({ onSuccess: onConnect, onFailure: onFailure }),
      1000
    ); // Retry connection
  }
}

// Called when a message arrives
function onMessageArrived(message) {
  console.log("Received message:", message.payloadString);
  const data = JSON.parse(message.payloadString);

  // Update each data container based on received data
  updateTMAData(data.TMA);
  updatePumpStatusData(data.PumpStatus);
  updateHazardLevelData(data.HazardLevel);
}

// Function to update TMA data display
function updateTMAData(tma) {
  const tmaDataDiv = document.getElementById("tma-data");
  tmaDataDiv.innerHTML = `Tinggi Muka Air: ${tma} cm`;
}

// Function to update Pump Status data display
function updatePumpStatusData(status) {
  const pumpStatusText = document.getElementById("pump-status-text");
  const pumpStatusIcon = document.getElementById("pump-status-icon");
  const imgSrc = status === 1 ? "img/on.png" : "img/off.png";
  const statusText = status === 1 ? "Status Pompa: " : "Status Pompa: ";

  pumpStatusText.textContent = statusText + " ";
  pumpStatusIcon.src = imgSrc;
  pumpStatusIcon.alt = statusText; // Update the alt attribute for better accessibility

  // Optionally change background color
  const pumpStatusDataDiv = document.getElementById("pump-status-data");
  pumpStatusDataDiv.style.backgroundColor = status === 1 ? "azure" : "azure";
}

let soundPlayed = false; // Flag to track if the sound has been played

// Function to update Hazard Level data display
function updateHazardLevelData(level) {
  const hazardLevelDataDiv = document.getElementById("hazard-level-data");
  const hazardLevelText = document.getElementById("hazard-level-text");
  const pumpSound1 = document.getElementById("pump-sound-1");
  const pumpSound2 = document.getElementById("pump-sound-2");
  let levelText, backgroundColor;

  switch (level) {
    case 3:
      levelText = "BAHAYA";
      backgroundColor = "red";
      if (!soundPlayed) {
        pumpSound2.play(); // Play sound for "BAHAYA"
        soundPlayed = true; // Set the flag to true
      }
      break;
    case 2:
      levelText = "WASPADA";
      backgroundColor = "orange";
      if (!soundPlayed) {
        pumpSound1.play(); // Play sound for "WASPADA"
        soundPlayed = true; // Set the flag to true
      }
      break;
    case 1:
      levelText = "AMAN";
      backgroundColor = "green";
      soundPlayed = false; // Reset the flag when the level is "AMAN"
      break;
    default:
      levelText = "ERROR";
      backgroundColor = "black";
      soundPlayed = false; // Reset the flag for unknown levels
      break;
  }
  hazardLevelText.style.color = "white";
  hazardLevelText.style.textShadow = "2px 2px 0px black";
  hazardLevelText.textContent = `Peringatan Banjir: ${levelText}`;
  hazardLevelDataDiv.style.backgroundColor = backgroundColor;
}

// Called when the client subscribes successfully
function onSubscribeSuccess() {
  console.log("Subscribed to topic");
}

// Called when the client fails to subscribe
function onSubscribeFailure(response) {
  console.log("Subscription failed: " + response.errorMessage);
}

// Update the live time in the footer
function updateDateTime() {
  const now = new Date();
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const day = days[now.getDay()];
  const time = now
    .toLocaleTimeString("id-ID", { hour12: false })
    .replace(/\./g, ":");
  const date = now.toLocaleDateString("id-ID");

  const dateTimeString = ` ${day}, ${date}, ${time} WIB`;
  document.getElementById("live-time").innerText = dateTimeString;
}
updateDateTime();
setInterval(updateDateTime, 1000);
