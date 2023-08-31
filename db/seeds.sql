-- Inserting data into the "departments" table
INSERT INTO departments (id, name)
VALUES (1, 'HR'),
       (2, 'Sales'),
       (3, 'Engineering'),
       (4, 'Finance'),
       (5, 'Legal');

-- Inserting data into the "role" table
INSERT INTO role (id, title, salary, department_id)
VALUES (1, 'Salesperson', 80000, 2),
       (2, 'Lead Engineer', 150000, 3),
       (3, 'Software Engineer', 120000, 3),
       (4, 'Account Manager', 160000, 4),
       (5, 'Legal Team Lead', 250000, 5),
       (6, 'Lawyer', 190000, 5),
       (7, 'HR Manager', 100000, 1);

-- Inserting data into the "employee" table
INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (1, 'Mike', 'Chan', 2, 1),
       (2, 'Ashley', 'Rodriguez', 3, null),
       (3, 'Kevin', 'Tupik', 3, 2),
       (4, 'Kunal', 'Singh', 4, null),
       (5, 'Malia', 'Brown', 4, 4),
       (6, 'Sarah', 'Lourd', 5, null),
       (7, 'Tom', 'Allen', 5, 6),
       (8, 'Cathy', 'Utes', 1, 7);
