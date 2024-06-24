// Function to update the satellite image
function updateImage() {
    // URL of the new image with a cache-busting query parameter
    const imageUrl = 'https://inderaja.bmkg.go.id/IMAGE/HIMA/H08_EH_Jatim.png?' + new Date().getTime();

    // Fetch the new image
    fetch(imageUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob();
        })
        .then(blob => {
            const objectURL = URL.createObjectURL(blob);
            const imgElement = document.getElementById('dynamicImage');
            imgElement.src = objectURL;
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}
setInterval(updateImage, 10000);

// Update the live time in the footer
function updateDateTime() {
    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const day = days[now.getDay()];
    const time = now.toLocaleTimeString('id-ID', {hour12: false }).replace(/\./g, ':');
    const date = now.toLocaleDateString('id-ID');
    
    const dateTimeString = ` ${day}, ${date}, ${time} WIB`;
    document.getElementById("live-time").innerText = dateTimeString;
}
updateDateTime();
setInterval(updateDateTime, 1000);

// MQTT Client Configuration
const client = new Paho.MQTT.Client("broker.hivemq.com", 8000, "clientId");
client.onMessageArrived = onMessageArrived;
client.connect({ onSuccess: onConnect });
function onConnect() {
    console.log("Connected to MQTT broker");
    client.subscribe("kec/tanggulangin/pump-status");
}

function onMessageArrived(message) {
    const data = JSON.parse(message.payloadString);
    document.getElementById("water-level").textContent = data.waterLevel + " cm";
    document.getElementById("pump-status").textContent = data.pumpStatus ? "ON" : "OFF";
    document.getElementById("status").textContent = data.status;
}