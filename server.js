//Immport req modules
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
    password: '',
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
            // Implement logic to view all departments from the database
            break;
          case 'View all roles':
            // Implement logic to view all roles from the database
            break;
          case 'View all employees':
            // Implement logic to view all employees from the database
            break;
          case 'Add a department':
            // Implement logic to add a department to the database
            break;
          case 'Add a role':
            // Implement logic to add a role to the database
            break;
          case 'Add an employee':
            // Implement logic to add an employee to the database
            break;
          case 'Update an employee role':
            // Implement logic to update an employee's role in the database
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

//Starts the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Start the menu-based application
displayMenu();
