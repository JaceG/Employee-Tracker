const client = require('./db');

const viewAllDepartments = async () => {
	const res = await client.query('SELECT * FROM department');
	console.table(res.rows);
};

const viewAllRoles = async () => {
	const res = await client.query(
		'SELECT role.id, role.title, department.name AS department, role.salary FROM role JOIN department ON role.department_id = department.id'
	);
	console.table(res.rows);
};

const viewAllEmployees = async () => {
	const res = await client.query(
		`SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, 
    CONCAT(m.first_name, ' ', m.last_name) AS manager 
    FROM employee e 
    JOIN role r ON e.role_id = r.id 
    JOIN department d ON r.department_id = d.id 
    LEFT JOIN employee m ON e.manager_id = m.id`
	);
	console.table(res.rows);
};

module.exports = {
	viewAllDepartments,
	viewAllRoles,
	viewAllEmployees,
};
