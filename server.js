const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const mqtt = require('mqtt');
const fs = require('fs');
const app = express();

// Enable CORS for specific IP address (127.0.0.1) / 特定の IP アドレス (127.0.0.1) に対して CORS を有効にする
const corsOptions = {
  origin: ['http://192.168.11.3', 'http://127.0.0.1'],  // Allow requests from this address / このアドレスからのリクエストを許可する
methods: 'GET',
};
app.use(cors(corsOptions)); // Apply CORS middleware globally /CORS ミドルウェアをグローバルに適用する


//MQTT PART 
// Set up MQTT client and connect to the broker / MQTT クライアントをセットアップしてブローカーに接続する
const mqttBrokerUrl = 'http://192.168.11.3'; // Replace with your broker's URL / ブローカーの URL に置き換えます
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
    console.log(`Message sent to topic "${topic}": ${mode}`);
    res.send(`Message sent to topic "${topic}"`);
  });
});



//MYSQL PART

  
// Create a connection to MySQL to an IP address /IP アドレスへの MySQL への接続を作成する
const db = mysql.createConnection({
  host: '192.168.11.3',     
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


// Query to get from one timestamp to another
// Query example ---  GET /getList?robotID=rpi_1&startime=2024-11-01T00:00:00&endtime=2024-11-30T23:59:59 
app.get('/getList', (req, res) => {
  const { robotID, startime, endtime } = req.query;

  // Check for missing parameters
  if (!robotID || !startime || !endtime) {
    return res.status(400).send({ 
      error: 'Missing required query parameters. Please provide robotID, startime, and endtime.' 
    });
  }

  // Validate date format (assuming ISO 8601 format)
  const isValidDate = (date) => !isNaN(Date.parse(date));
  if (!isValidDate(startime) || !isValidDate(endtime)) {
    return res.status(400).send({ 
      error: 'Invalid date format. Please use a valid ISO 8601 date format (e.g., 2024-11-01T00:00:00).' 
    });
  }

  // Validate that startime is before endtime
  if (new Date(startime) >= new Date(endtime)) {
    return res.status(400).send({ 
      error: 'Invalid time range. startime must be earlier than endtime.' 
    });
  }

  // Prepare and execute the query
  const query = `
    SELECT * 
    FROM sensorreading 
    WHERE robotId = ? 
    AND timestamp BETWEEN ? AND ?`;
  
  db.query(query, [robotID, startime, endtime], (err, result) => {
    if (err) {
      console.error('Database query failed:', err);
      return res.status(500).send({ 
        error: 'Database query failed. Please try again later.' 
      });
    }

    // If no results found, return an appropriate message
    if (result.length === 0) {
      return res.status(404).send({ 
        message: 'No records found for the given robotID and time range.' 
      });
    }

    // Success: Return the query result
    res.json(result);
  });
});


// Start the server on port 3000 / ポート 3000 でサーバーを起動します
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

