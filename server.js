const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const mqtt = require('mqtt');
const fs = require('fs');
const app = express();

// Enable CORS for specific IP address (127.0.0.1) / 特定の IP アドレス (127.0.0.1) に対して CORS を有効にする
const corsOptions = {
  origin: ['http://192.168.11.2', 'http://127.0.0.1'],  // Allow requests from this address / このアドレスからのリクエストを許可する
methods: 'GET',
};
app.use(cors(corsOptions)); // Apply CORS middleware globally /CORS ミドルウェアをグローバルに適用する


//MQTT PART 
// Set up MQTT client and connect to the broker / MQTT クライアントをセットアップしてブローカーに接続する
const mqttBrokerUrl = 'mqtt://test.mosquitto.org'; // Replace with your broker's URL / ブローカーの URL に置き換えます
const client = mqtt.connect(mqttBrokerUrl);


// MQTT connection events / MQTT接続イベント
client.on('connect', () => {
  console.log('Connected to MQTT broker');
});

client.on('error', (err) => {
  console.error('MQTT connection error:', err);
});

// Define an endpoint to send control mode to specific robot IDs
// 特定のロボットIDに制御モードを送信するエンドポイントを定義する
app.get('/sendMode',(req,res) =>{

  // Extract robotID and mode parameters from the query string / クエリ文字列から robotID と mode パラメータを取得します
  const { robotID, mode } = req.query;

  // Define the MQTT topic dynamically based on the robot ID / ロボットIDに基づいて動的にMQTTトピックを定義します
  const topic = `GPBL2425/SensorArray_1/${robotID}/controlType`;

  const allowedModes = ['auto', 'timer'];  

  if (!allowedModes.includes(mode)) {
    return res.status(400).send({ error: 'Invalid type' });
  }


  client.publish(topic, mode, (err) => {
    // Publish the mode to the specified MQTT topic / 指定されたMQTTトピックにモードを公開します
    if (err) {
      console.error('Failed to publish message:', err);
      return res.status(500).send('Failed to send MQTT message');
    }
    console.log(`JSON message sent to topic "${topic}": ${messageString}`);
    res.send(`JSON message sent to topic "${topic}"`);
  });
});



//MYSQL PART

  
// Create a connection to MySQL to an IP address /IP アドレスへの MySQL への接続を作成する
const db = mysql.createConnection({
  host: '192.168.11.2',     
  user: 'root',          
  password: 'GPBL2425',   
  database: 'gpbl2425',
  port: 3306
});

// Connect to MySQL database / MySQLデータベースに接続する
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Define a route to get sensor data / センサーデータを取得するルートを定義する
app.get('/getSensorData', (req, res) => {
  const query = 'SELECT * FROM sensorreading'; 
  console.log(query);
  
  db.query(query, (err, result) => {
    if (err) {
        console.error('Database query failed:', err);
      res.status(500).send({ error: 'Database query failed' });
      return;
    }


    console.log('Database result:', result);
    res.json(result);  // Send data back as JSON / データを JSON として送り返す
  });
});


// Define a route to get sensor temperature data / センサー温度データを取得するルートを定義する
app.get('/getSensorTemp', (req, res) => {
  const query = 'SELECT * FROM sensorreading'; 
  console.log(query);
  
  db.query(query, (err, result) => {
    if (err) {
        console.error('Database query failed:', err);
      res.status(500).send({ error: 'Database query failed' });
      return;
    }


    console.log('Database result:', result);
    res.json(result);  // Send data back as JSON / データを JSON として送り返す
  });
});

// Define a route to get sensor humidity data / センサーの湿度データを取得するルートを定義する
app.get('/getSensorHumd', (req, res) => {
  const query = 'SELECT * FROM sensorreading'; 
  console.log(query);
  
  db.query(query, (err, result) => {
    if (err) {
        console.error('Database query failed:', err);
      res.status(500).send({ error: 'Database query failed' });
      return;
    }


    console.log('Database result:', result);
    res.json(result);  // Send data back as JSON / データを JSON として送り返す
  });
});

// Define a route to get each distinct robot ID / それぞれのロボットIDを取得するためのルートを定義する
app.get('/getRobotId', (req, res) => {
  const query = 'SELECT DISTINCT robotId FROM sensorreading'; 
  console.log(query);
  
  db.query(query, (err, result) => {
    if (err) {
        console.error('Database query failed:', err);
      res.status(500).send({ error: 'Database query failed' });
      return;
    }


    console.log('Database result:', result);
    res.json(result); 

  });
});

// Define the route to get latest data / 最新データを取得するためのルートを定義する
// ie getLatest?robotID=Rpi__1&type=temperature
app.get('/getLatest', (req, res) => {
  const { robotID, type } = req.query;

  if (robotID && type) {
    // Use parameterized query to avoid SQL injection
    const query = `
      SELECT ${mysql.escapeId(type)} 
      FROM sensorreading 
      WHERE robotId = ? 
      ORDER BY timestamp DESC 
      LIMIT 1
    `;
    
    console.log(query);

    // Execute the query with parameters
    db.query(query, [robotID], (err, result) => {
      if (err) {
        console.error('Database query failed:', err);
        res.status(500).send({ error: 'Database query failed' });
        return;
      }
      console.log('Database result:', result);
      res.json(result);
    });
  } else {
    res.status(400).send({ error: 'Missing RobotID or type' });
  }
});


// Define the route to get average of data / 
// ie getFunc?robotID=Rpi__1&type=temperature&func=MAX
app.get('/getFunc', (req, res) => {
  const { robotID, type, func } = req.query;

  // Define valid columns and functions
  const allowedFunctions = ['AVG', 'MIN', 'MAX'];
  const allowedTypes = ['temperature', 'humidity'];  // Add more valid types (columns) here

  // Validate the input parameters
  if (!robotID || !type || !func) {
    return res.status(400).send({ error: 'Missing RobotID, type, or func' });
  }

  if (!allowedFunctions.includes(func.toUpperCase())) {
    return res.status(400).send({ error: 'Invalid function' });
  }

  if (!allowedTypes.includes(type)) {
    return res.status(400).send({ error: 'Invalid type' });
  }

  // Use parameterized query to avoid SQL injection
  const query = `
    SELECT ${func.toUpperCase()}(${type}) 
    FROM sensorreading 
    WHERE robotId = ?
  `;

  console.log(query);       

  // Execute the query with parameters
  db.query(query, [robotID], (err, result) => {
    if (err) {
      console.error('Database query failed:', err);
      return res.status(500).send({ error: 'Database query failed' });
    }
    console.log('Database result:', result);
    res.json(result);
  });
});


// Start the server on port 3000 / ポート 3000 でサーバーを起動します
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

