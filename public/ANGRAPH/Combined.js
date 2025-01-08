

async function loadRobotIds() {
    try {
        const response = await fetch("http://localhost:3000/getRobotId");
        if (!response.ok) throw new Error(`Failed to fetch robot IDs: ${response.status}`);
        const robotIds = await response.json();

        const dynamicTable = document.getElementById("dynamicTable");
      

        robotIds.sort((a, b) => {
            if (a.robotId === "Rpi__1") return -1;
            if (b.robotId === "Rpi__1") return 1;
            return 0;
        });

        for (const item of robotIds) {
            await fetchSensorID(item.robotId, dynamicTable);
        }
    } catch (error) {
        console.error("Error loading robot IDs:", error);
    }
}

async function fetchSensorID(robotId, compostTable) {
    try {
        const response = await fetch(`http://localhost:3000/getSensorId?robotId=${robotId}`);
        if (!response.ok) throw new Error(`Failed to fetch sensor IDs for ${robotId}: ${response.status}`);
        const sensorIds = await response.json();

        sensorIds.forEach(sensor => {
           

            
        });
    } catch (error) {
        console.error(`Error fetching sensor IDs for robotId ${robotId}:`, error);
    }
}

window.onload = async function () {
    try {
        const initflag = true;
        await loadRobotIds();
        // const myLineChart = createChart('myChart', 'line', ['Jan', 'Feb', 'Mar'], [10, 20, 15]);
    } catch (error) {
        console.error("Error during initialization:", error);
    }
};

setInterval(async function () {
    try {
        const initflag = false;
        await updateReadings(initflag);
    } catch (error) {
        console.error("Error updating readings:", error);
    }
}, 1000);

function loadGrouping(robotId ,sensorId){
    timeSlider(robotId, sensorId);
    loadGraphData(robotId ,sensorId,'temperature')
    loadGraphData(robotId ,sensorId,'humidity')
};

function initTempGraph(robotId, sensorArray, dataArray){

};


function r