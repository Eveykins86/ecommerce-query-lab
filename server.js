//Immport req modules
const express = require('express');
const mysql = require('mysql2');
//Creates Epress application
const PORT = process.env.PORT || 3001;
const app = express();
//Sets up middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
//Connects to the ecommerce_db database
const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ecommerce_db'
  },
  console.log(`Connected to the ecommerce_db database.`)
);

//Starts the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
