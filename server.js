//Immport req modules
const express = require('express');
const inquirer = require('inquirer');
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
    password: 'IloveAHB!23',
    database: 'ecommerce_db'
  },
  console.log(`Connected to the ecommerce_db database.`)
);

function displayMenu() {
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'choice',
          message: 'Select an option:',
          choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Exit'
          ]
        }
      ])
      .then((answers) => {
        switch (answers.choice) {
          case 'View all departments':
            viewAllDepartments();
            break;
          case 'View all roles':
            viewAllRoles();
            break;
          case 'View all employees':
            viewAllEmployees();
            break;
          case 'Add a department':
            addDepartment();
            break;
          case 'Add a role':
            addRole();
            break;
          case 'Add an employee':
            addEmployee();
            break;
          case 'Update an employee role':
            updateEmployeeRole();
            break;
          case 'Exit':
            console.log('Goodbye!');
            process.exit(0);
          default:
            console.log('Invalid choice.');
            displayMenu();
        }
      });
  }

  function viewAllDepartments() {
    const departmentsQuery = "SELECT * from departments"
    db.query(departmentsQuery, (err, results) => {
      if (err) throw err;
      console.table(results);
    })
    displayMenu()
  }

  function viewAllRoles() {
    const rolesQuery = "SELECT * from role"
    db.query(rolesQuery, (err, results) => {
      if (err) throw err;
      console.table(results);
      displayMenu();
    })
  }

  function viewAllEmployees() {
    const employeesQuery = "SELECT * from departments"
    db.query(employeesQuery, (err, results) => {
      if (err) throw err;
      console.table(results);
      displayMenu();
    })
  }

  function addDepartment() {
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'departmentName',
          message: 'Enter the name of the new department:',
          validate: function (value) {
            if (value.trim() !== '') {
              return true;
            }
            return 'Please enter a valid department name.';
          }
        }
      ])
      .then((answers) => {
        // Get the department name entered by the user
        const departmentName = answers.departmentName;
  
        // Insert the new department into the database
        const sql = 'INSERT INTO departments (name) VALUES (?)';
        db.query(sql, [departmentName], (err, result) => {
          if (err) {
            console.error('Error adding department:', err);
          } else {
            console.log(`New department '${departmentName}' added successfully!`);
          }
          // Call displayMenu() to show the menu again
          displayMenu();
        });
      });
  }

  function addRole() {
      // Fetch the list of departments from the database
  const departmentQuery = 'SELECT id, name FROM departments';
  db.query(departmentQuery, (err, departments) => {
    if (err) {
      console.error('Error fetching departments:', err);
      displayMenu();
      return;
    }

    inquirer
      .prompt([
        {
          type: 'input',
          name: 'roletTitle',
          message: 'Enter the title of the new role:',
          validate: function (value) {
            if (value.trim() !== '') {
              return true;
            }
            return 'Please enter a valid role title.';
          }
        },
        {
          type: 'input',
          name: 'roleSalary',
          message: 'Enter annual salary amount',
          validate: function (value) {
            if (parseFloat(value) > 0 || parseFloat(value) === 0) {
              return true;
            }
            return 'Please enter a valid salary amount.';
          }
        },
        {
          type: 'list',
          name: 'departmentId',
          message: 'Select the department for this role:',
          choices: departments.map((department) => ({
            name: department.name,
            value: department.id
          }))
        }
      ])
      .then((answers) => {
         // Get the role title, salary, and department ID entered by the user
        const roleTitle = answers.roletTitle;
        const roleSalary = parseFloat(answers.roleSalary);
        const departmentId = answers.departmentId;
  
        // Insert the new role into the database
        const sql = 'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)';
        db.query(sql, [roleTitle, roleSalary, departmentId], (err, result) => {
          if (err) {
            console.error('Error adding role:', err);
          } else {
            console.log(`New role '${roleTitle}' added successfully!`);
          }
          // Call displayMenu() to show the menu again
          displayMenu();
        });
      });
  });
  }

  function addDepartment() {
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'departmentName',
          message: 'Enter the name of the new department:',
          validate: function (value) {
            if (value.trim() !== '') {
              return true;
            }
            return 'Please enter a valid department name.';
          }
        }
      ])
      .then((answers) => {
        // Get the department name entered by the user
        const departmentName = answers.departmentName;
  
        // Insert the new department into the database
        const sql = 'INSERT INTO departments (name) VALUES (?)';
        db.query(sql, [departmentName], (err, result) => {
          if (err) {
            console.error('Error adding department:', err);
          } else {
            console.log(`New department '${departmentName}' added successfully!`);
          }
          // Call displayMenu() to show the menu again
          displayMenu();
        });
      });
  }
  

//Starts the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Start the menu-based application
displayMenu();
