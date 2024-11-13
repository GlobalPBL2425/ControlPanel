const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// Enable CORS for specific IP address (127.0.0.1) / 特定の IP アドレス (127.0.0.1) に対して CORS を有効にする
const corsOptions = {
    origin: ['http://192.168.11.3', 'http://127.0.0.1'],  // Allow requests from this address / このアドレスからのリクエストを許可する
  methods: 'GET',
};
app.use(cors(corsOptions)); // Apply CORS middleware globally /CORS ミドルウェアをグローバルに適用する
  
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

// Define the route to get latest data / 
// ie getLatest?RobotID=Rpi__1&type=temperature
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
  const { robotID, type , func} = req.query;
  const allowedFunctions = ['AVG', 'MIN', 'MAX']

  if (robotID && type && func) {
    if (!allowedFunctions.includes(func.toUpperCase())) {
      return res.status(400).send({ error: 'Invalid function' });
    }
    // Use parameterized query to avoid SQL injection
    const query = `
      SELECT ${func}(${mysql.escapeId(type)}) 
      FROM sensorreading 
      WHERE robotId = ? 
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



// Start the server on port 3000 / ポート 3000 でサーバーを起動します
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

