

async function loadRobotIds(initflag) {
    try {
        const response = await fetch("http://localhost:3000/getRobotId");
        if (!response.ok) throw new Error(`Failed to fetch robot IDs: ${response.status}`);
        const robotIds = await response.json();

        const dynamicTable = document.getElementById("dynamicTable");
        if (initflag) {
            dynamicTable.innerHTML = ""; // Clear existing rows
        }

        robotIds.sort((a, b) => {
            if (a.robotId === "Rpi__1") return -1;
            if (b.robotId === "Rpi__1") return 1;
            return 0;
        });

        for (const item of robotIds) {
            if (initflag) {
                createGraphRow(item.robotId , dynamicTable);
            }

            
        }
    } catch (error) {
        console.error("Error loading robot IDs:", error);
    }
}

async function fetchSensorID(robotId, dynamicTable) {
    try {
        const response = await fetch(`http://localhost:3000/getSensorId?robotId=${robotId}`);
        if (!response.ok) throw new Error(`Failed to fetch sensor IDs for ${robotId}: ${response.status}`);
        const sensorIds = await response.json();

        // sensorIds.forEach(sensor => {
           

            
        // });
    } catch (error) {
        console.error(`Error fetching sensor IDs for robotId ${robotId}:`, error);
        return null;
    }
}

window.onload = async function () {
    try {
        const initflag = true;
        await loadRobotIds(initflag);
        // const myLineChart = createChart('myChart', 'line', ['Jan', 'Feb', 'Mar'], [10, 20, 15]);
    } catch (error) {
        console.error("Error during initialization:", error);
    }
};

function createGraphRow(robotId , dynamicTable) {
    const row = document.createElement("tr");
    const row2 = document.createElement("tr");
    row.innerHTML = `
        <td rowspan="2">${robotId}</td>
        <td id="temperature-${robotId}">--</td>
        <td rowspan="2">--</td>
    `;
    dynamicTable.appendChild(row);
    row2.innerHTML = `
        <td id="humidity-${robotId}">--</td>
    `;
    dynamicTable.appendChild(row2);
}

function initgraph(){

}
setInterval(async function () {
    try {
        const initflag = false;
        
    } catch (error) {
        console.error("Error updating readings:", error);
    }
}, 1000);

function loadGrouping(robotId ,sensorId){

};
