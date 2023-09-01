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
            'View employees by manager',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Update an employee manager',
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
          case 'View employees by manager':
            viewEmployeesByManager();
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
          case 'Update an employee manager':
            updateEmployeeManager();
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

// Function to view all Departments
  function viewAllDepartments() {
    const departmentsQuery = "SELECT * from departments"
    db.query(departmentsQuery, (err, results) => {
      if (err) throw err;
      console.table(results);
      displayMenu();
    })
  }

// Function to view all Roles
  function viewAllRoles() {
    const rolesQuery = "SELECT * from role"
    db.query(rolesQuery, (err, results) => {
      if (err) throw err;
      console.table(results);
      displayMenu();
    })
  }

// Function to view all employees
  function viewAllEmployees() {
    const query = `
    SELECT 
      e.id AS Employee_ID, 
      e.first_name AS First_Name, 
      e.last_name AS Last_Name, 
      r.title AS Title, 
      d.name AS Department, 
      r.salary AS Salary, 
      CONCAT(m.first_name, ' ', m.last_name) AS Manager
    FROM employee e
    LEFT JOIN role r ON e.role_id = r.id
    LEFT JOIN departments d ON r.department_id = d.id
    LEFT JOIN employee m ON e.manager_id = m.id;
  `;
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching employees:', err);
      } else {
      console.table(results);
      }
      displayMenu();
    });
  }

  //Function to view wmployees by manager
  function viewEmployeesByManager() {
    const managerQuery = 'SELECT id, CONCAT(first_name, " ", last_name) AS managerName FROM employee WHERE manager_id IS NULL';

    db.query(managerQuery, (err, managers) => {
      if (err) {
        console.error('Error fetching managers:', err);
        displayMenu();
        return;
      }

      //Promt the user to select a manager
      inquirer
        .prompt([
          {
            type: 'list',
            name: 'managerId',
            message: 'Select a manager to view their direct reports:',
            choices: managers.map((manager) => ({
              name: manager.managerName,
              value: manager.id
            }))
          }
        ])
        .then((managerAnswers) => {
          const managerId = managerAnswers.managerId;

          //Fetch employees who report to the selected manager
          const employeeQuery = `
          SELECT 
            e.id,
            e.first_name,
            e.last_name,
            r.title AS Title,
            d.name AS Department,
            r.Salary
          FROM employee e
          LEFT JOIN role r ON e.role_id = r.id
          LEFT JOIN departments d ON r.department_id = d.id
          WHERE e.manager_id = ?
        `;

          db.query(employeeQuery, [managerId], (err, employees) => {
          if (err) {
            console.error('Error fetching employees:', err);
            displayMenu();
            return;
          }
          console.log(`Employees reporting to ${managers.find((manager) => manager.id === managerId).managerName}:`);
          console.table(employees);
          displayMenu()
          });
        });
    });

  }

  //Function to add new Department
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

  // Function to add new Role
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

  // Function to add new employee
  function addEmployee() {
    const roleQuery = 'SELECT id, title FROM role';
    const employeeQuery = 'SELECT id, CONCAT(first_name, " ", last_name) AS manager FROM employee';
    
    db.query(roleQuery, (err, roles) => {
      if (err) {
        console.error('Error fetching roles:', err);
        displayMenu();
        return;
      }
  
      db.query(employeeQuery, (err, employees) => {
        if (err) {
          console.error('Error fetching employees:', err);
          displayMenu();
          return;
        }

  inquirer
    .prompt([
      {
        type: 'input',
        name: 'firstName',
        message: 'Enter the new employee FIRST name:',
        validate: function (value) {
          if (value.trim() !== '') {
            return true;
          }
          return 'Please enter a valid name.';
        }
      },
      {
        type: 'input',
        name: 'lastName',
        message: 'Enter the new employee LAST name:',
        validate: function (value) {
          if (value.trim() !== '') {
            return true;
          }
          return 'Please enter a valid name.';
        }
      },
      {
        type: 'list',
        name: 'roleId',
        message: 'Select the role for this employee:',
        choices: roles.map((role) => ({
          name: role.title,
          value: role.id
        }))
      },
      {
        type: 'list',
        name: 'managerId',
        message: 'Select the manager for this employee:',
        choices: employees.map((employee) => ({
          name: employee.manager,
          value: employee.id
        }))
      }
    ])
    
    .then((answers) => {
       // Get the First, Last, and role ID entered by the user
      const firstName = answers.firstName;
      const lastName = answers.lastName;
      const roleId = answers.roleId;
      const managerId = answers.managerId;

      // Insert the new employee into the database
      const sql = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)';
      db.query(sql, [firstName, lastName, roleId, managerId], (err, result) => {
        if (err) {
          console.error('Error adding employee:', err);
        } else {
          console.log(`New employee '${firstName} ${lastName}' added successfully!`);
        }
        // Call displayMenu() to show the menu again
        displayMenu();
      });
    });
  });
});
}


//Function to update employee role
function updateEmployeeRole() {
  const employeeQuery = 'SELECT id, CONCAT(first_name, " ", last_name) AS employeeName FROM employee';

  db.query(employeeQuery, (err, employees) => {
    if (err) {
      console.error('Error fetching employees:', err);
      displayMenu();
      return;
    }

    //Prompt the user to select an employee
  
    inquirer
      .prompt ([
        {
          type: 'list',
          name: 'employeeId',
          message: 'Select the employee to update:',
          choices: employees.map((employee) => ({
            name: employee.employeeName,
            value: employee.id
          }))
        }
      ])
      .then((employeeAnswers) => {
        const employeeId = employeeAnswers.employeeId;

        //Fetch the list of roles from the database
        const roleQuery = 'SELECT id, title FROM role';

        db.query(roleQuery, (err, roles) => {
          if (err) {
            console.error('Error fetching roles:', err);
            displayMenu();
            return;
          }

          inquirer
            .prompt([
              {
                type: 'list',
                name: 'roleId',
                message: 'Select the new role for the employee:',
                choices: roles.map((role) => ({
                  name: role.title,
                  value: role.id
                }))
              }
            ])
            .then((roleAnswers) => {
              const roleId = roleAnswers.roleId;

              //Update the employee's role in the database
              const updateQuery = 'UPDATE employee SET role_id = ? WHERE id = ?';
              db.query(updateQuery, [roleId, employeeId], (err, result) => {
                if (err) {
                  console.error('Error updating employee role:', err);
                } else {
                  console.log('Employee\'s role updated successfully!')
                }
                displayMenu();
              });
            });
      });
    });
  });
}

// Function to update employee's manager
function updateEmployeeManager() {
  const employeeQuery = 'SELECT id, CONCAT(first_name, " ", last_name) AS employeeName FROM employee';

  db.query(employeeQuery, (err, employees) => {
    if (err) {
      console.error('Error fetching employees:', err);
      displayMenu();
      return;
    }

    //Prompt the user to select an employee
  
    inquirer
      .prompt ([
        {
          type: 'list',
          name: 'employeeId',
          message: 'Select the employee to update:',
          choices: employees.map((employee) => ({
            name: employee.employeeName,
            value: employee.id
          }))
        }
      ])
      .then((employeeAnswers) => {
        const employeeId = employeeAnswers.employeeId;

        //Fetch the list of managers from employees
        const managerQuery = 'SELECT id, CONCAT(first_name, " ", last_name) AS managerName FROM employee WHERE id <> ?';

        db.query(managerQuery, [employeeId], (err, managers) => {
          if (err) {
            console.error('Error fetching managers:', err);
            displayMenu();
            return;
          }

          inquirer
            .prompt([
              {
                type: 'list',
                name: 'managerId',
                message: 'Select the new manager for the employee:',
                choices: managers.map((manager) => ({
                  name: manager.managerName,
                  value: manager.id
                }))
              }
            ])
            .then((managerAnswers) => {
              const managerId = managerAnswers.managerId;

              //Update the employee's manager in the database
              const updateQuery = 'UPDATE employee SET manager_id = ? WHERE id = ?';
              db.query(updateQuery, [managerId, employeeId], (err, result) => {
                if (err) {
                  console.error('Error updating employee manager:', err);
                } else {
                  console.log('Employee\'s manager updated successfully!')
                }
                displayMenu();
              });
            });
      });
    });
  });
}
  

//Starts the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Start the menu-based application
displayMenu();
