const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// Enable CORS for specific IP address (127.0.0.1) / 特定の IP アドレス (127.0.0.1) に対して CORS を有効にする
const corsOptions = {
    origin: ['http://192.168.11.4', 'http://127.0.0.1'],  // Allow requests from this address / このアドレスからのリクエストを許可する
  methods: 'GET',
};
app.use(cors(corsOptions)); // Apply CORS middleware globally /CORS ミドルウェアをグローバルに適用する
  
// Create a connection to MySQL to Wei Hanh's IP address /IP アドレスへの MySQL への接続を作成する
const db = mysql.createConnection({
  host: '192.168.11.4',     
  user: 'root',          
  password: 'GPBL2425',   
  database: 'testdb',
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


// Start the server on port 3000 / ポート 3000 でサーバーを起動します
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

