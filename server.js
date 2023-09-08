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

//Display main menu options
const mainMenueChoises =[
  'View All departments',
  'View all roles',
  'View all employees',
  'View employees by manager',
  'Add a department',
  'Delete a department',
  'Add a role',
  'Delete a role',
  'Add an employee',
  'Delete an employee',
  'Update an employee role',
  'Update an employee manager',
  'View departmet udget',
  'Exit'
];

function displayMenu() {
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'choice',
          message: 'Select an option:',
          choices: [
            ...mainMenueChoises, 'Exit'
          ],
        },
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
          case 'Delete a department':
            deleteDepartment();
            break;
          case 'Add a role':
            addRole();
            break;
          case 'Delete a role':
            deleteRole();
            break;
          case 'Add an employee':
            addEmployee();
            break;
          case 'Delete an employee':
            deleteEmployee();
            break;
          case 'Update an employee role':
            updateEmployeeRole();
            break;
          case 'Update an employee manager':
            updateEmployeeManager();
            break;
          case 'View department budget':
            viewDepartmentBudget();
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

function returnToMainMenu() {
    displayMenu(); // Display the main menu again
  }

  inquirer
  .prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'Select an option:',
      choices: mainMenueChoises
    }
  ])
  .then((answers) => {
    if (answers.choice === 'Back to Main Menu') {
      returnToMainMenu(); // Return to the main menu
      return; // Exit this function
    }
  });

// Function to view all Departments
  function viewAllDepartments() {
    const departmentsQuery = "SELECT * from departments"
    db.query(departmentsQuery, (err, results) => {
      if (err) throw err;
      console.table(results);
      displayMenu();s
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

// Function to view employees by manager
function viewEmployeesByManager() {
  const managerQuery = 'SELECT id, CONCAT(first_name, " ", last_name) AS managerName FROM employee WHERE manager_id IS NULL';

  db.query(managerQuery, (err, managers) => {
    if (err) {
      console.error('Error fetching managers:', err);
      displayMenu();
      return;
    }

    // Prompt the user to select a manager
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'managerId',
          message: 'Select a manager to view their direct reports:',
          choices: [
            'Back to Main Menu', // Separate option to go back
            ...managers.map((manager) => ({
              name: manager.managerName,
              value: manager.id
            }))
          ]
        }
      ])
      .then((managerAnswers) => {
        const selectedManagerId = managerAnswers.managerId;

        if (selectedManagerId === 'Back to Main Menu') {
          displayMenu(); // Handle going back to the main menu
          return;
        }

        // Fetch employees who report to the selected manager
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

        db.query(employeeQuery, [selectedManagerId], (err, employees) => {
          if (err) {
            console.error('Error fetching employees:', err);
            displayMenu();
            return;
          }
          console.log(`Employees reporting to ${managers.find((manager) => manager.id === selectedManagerId).managerName}:`);
          console.table(employees);
          displayMenu();
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

    //Function to delete a department
function deleteDepartment() {
  const departmentsQuery = 'SELECT id, title FROM role';

  db.query(departmentsQuery, (err, departments) => {
    if (err) {
      console.error('Error fetching departments:', err);
      displayMenu();
      return;
    }

  inquirer
    .prompt([
      {
        type: 'list',
        name: 'departmentName',
        message: 'Select a department to delete:',
        choices: [
          'Back to Main Menu', // Separate option to go back
          ...departments.map((department) => ({
            name: department.title,
            value: department.id
          }))
        ]
      }
    ])
    .then((roleAnswers) => {
      const selectedDepartmentId = roleAnswers.departmentName;

      if (selectedDepartmentId === 'Back to Main Menu') {
        displayMenu(); // Handle going back to the main menu
        return;
      }

      //Delete the selected department from the database
      const deleteQuery = 'DELETE FROM departments WHERE id = ?';
      db.query(deleteQuery, [roleId], (err, result) => {
        if (err) {
          console.error('Error deleting department:', err);
        } else {
          console.log('Department deleted successfully!');
        }
        displayMenu();
      });
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
        if (selectedManagerId === 'Back to Main Menu') {
          displayMenu(); // Handle going back to the main menu
          return;
        }
  
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

  //Function to delete a role
function deleteRole() {
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
        name: 'roleTitle',
        message: 'Select a role to delete:',
        choices: [
          'Back to Main Menu', // Separate option to go back
          ...roles.map((role) => ({
            name: role.title,
            value: role.id
          }))
        ]
      }
    ])
    .then((roleAnswers) => {
      const roleId = roleAnswers.roleId;

      //Delete the selected role from the database
      const deleteQuery = 'DELETE FROM role WHERE id = ?';
      db.query(deleteQuery, [roleId], (err, result) => {
        if (err) {
          console.error('Error deleting role:', err);
        } else {
          console.log('Role deleted successfully!');
        }
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

//Function to delete an employee
function deleteEmployee() {
  const employeeQuery = 'SELECT id, CONCAT(first_name, " ", last_name) AS employeeName FROM employee'

  db.query(employeeQuery, (err, employees) => {
    if (err) {
      console.error('Error fetching employees:', err);
      displayMenu();
      return;
    }

  inquirer
    .prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: 'Select an employee to delete:',
        choices: [
          'Back to Main Menu', // Separate option to go back
          ...employees.map((employee) => ({
            name: employee.employeeName,
            value: employee.id
          }))
        ]
      }
    ])
    .then((employeeAnswers) => {
      const employeeId = employeeAnswers.employeeId;
      if (employeeId === 'Back to Main Menu') {
        displayMenu(); // Handle going back to the main menu
        return;
      }

      //Delete the selected employee from the database
      const deleteQuery = 'DELETE FROM employee WHERE id = ?';
      db.query(deleteQuery, [employeeId], (err, result) => {
        if (err) {
          console.error('Error deleting employee:', err);
        } else {
          console.log('Employee deleted successfully!');
        }
        displayMenu();
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

function viewDepartmentBudget() {
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
          type: 'list',
          name: 'departmentId',
          message: 'Select a department to view its budget:',
          choices: departments.map((department) => ({
            name: department.name,
            value: department.id
          }))
        }
      ])
      .then((departmentAnswers) => {
        const departmentId = departmentAnswers.departmentId;

        //Calculate the total department budget (sum of salaries)
        const budgetQuery = `
        SELECT SUM(r.salary) AS total_budget
        FROM employee e
        LEFT JOIN role r ON e.role_id = r.id
        WHERE r.department_id =?
        `;

        db.query(budgetQuery, [departmentId], (err, result) => {
          if (err) {
            console.error('Error calculating department budget:', err);
          } else {
            const totalBudget = result[0].total_budget;
            console.log(`Total budget for ${departments.find((dept) => dept.id === departmentId).name}: $${totalBudget}`);
          }
          displayMenu();
        });
      });
  });
}

//Start the menu-based application
displayMenu();

//Starts the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
