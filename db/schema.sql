DROP DATABASE IF EXISTS ecommerce_db;
CREATE DATABASE ecommerce_db;

USE ecommerce_db;

CREATE TABLE departments (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL,
);

CREATE TABLE role (
    id INT PRIMARY KEY
    title: VARCHAR(30)
    salary: DECIMAL
    department_id: INT
);

CREATE TABLE employee (
    id INT PRIMARY KEY
    first_name: VARCHAR(30)
    last_name: VARCHAR(30)
    role_id: INT
    manager_id: INT
)