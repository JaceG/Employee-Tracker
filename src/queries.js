const { EMPLOYEE, DEPARTMENT, ROLE } = require('./constants');
const client = require('./db');

// View all departments
const viewAllDepartments = async (show = true) => {
	try {
		const res = await client.query(
			`SELECT id AS ${DEPARTMENT.id}, name AS ${DEPARTMENT.department} FROM department`
		);
		if (show) {
			console.table(res.rows);
		}
		return res.rows;
	} catch (err) {
		console.error('Failed to retrieve departments:', err);
		return [];
	}
};

// View all roles
const viewAllRoles = async () => {
	try {
		const res = await client.query(
			`SELECT role.id AS ${ROLE.id}, role.title AS ${ROLE.role}, department.name AS ${ROLE.department}, role.salary AS ${ROLE.salary}
			FROM role
			JOIN department ON role.department_id = department.id
		`
		);
		console.table(res.rows);
		return res.rows;
	} catch (err) {
		console.error('Failed to retrieve roles:', err);
		return [];
	}
};

// View all employees
const viewAllEmployees = async () => {
	try {
		const res = await client.query(`
			SELECT e.id AS ${EMPLOYEE.id}, e.first_name AS ${EMPLOYEE.first}, e.last_name AS ${EMPLOYEE.last}, r.title AS ${EMPLOYEE.role}, d.name AS ${EMPLOYEE.name}, r.salary AS ${EMPLOYEE.salary}, m.first_name AS ${EMPLOYEE.manager}
			FROM employee e 
			JOIN role r ON e.role_id = r.id 
			JOIN department d ON r.department_id = d.id 
			LEFT JOIN employee m ON e.manager_id = m.id
		`);
		console.table(res.rows);
		return res.rows;
	} catch (err) {
		console.error('Failed to retrieve employees:', err);
		return [];
	}
};

// View employees by department
const viewEmployeesByDepartment = async (department_id) => {
	try {
		const res = await client.query(
			`
			SELECT e.id, e.first_name AS first, e.last_name AS last, r.title AS role, r.salary 
			FROM employee e
			JOIN role r ON e.role_id = r.id
			WHERE r.department_id = $1
		`,
			[department_id]
		);

		if (res.rows.length > 0) {
			console.table(res.rows);
		} else {
			console.log('No employees found for the selected department.');
		}
		return res.rows;
	} catch (err) {
		console.error('Failed to retrieve employees by department:', err);
		return [];
	}
};

// View employees by manager
const viewEmployeesByManager = async (manager_id) => {
	try {
		const res = await client.query(
			`
			SELECT e.id, e.first_name AS first, e.last_name AS last, r.title AS role, d.name AS department, r.salary
			FROM employee e
			JOIN role r ON e.role_id = r.id
			JOIN department d ON r.department_id = d.id
			WHERE e.manager_id = $1
		`,
			[manager_id]
		);

		if (res.rows.length > 0) {
			console.table(res.rows);
		} else {
			console.log('No employees found for the selected manager.');
		}
		return res.rows;
	} catch (err) {
		console.error('Failed to retrieve employees by manager:', err);
		return [];
	}
};

// View total utilized budget of a department
const viewDepartmentBudget = async (department_id) => {
	try {
		const res = await client.query(
			`
			SELECT d.name AS department, SUM(r.salary) AS total_budget
			FROM employee e
			JOIN role r ON e.role_id = r.id
			JOIN department d ON r.department_id = d.id
			WHERE d.id = $1
			GROUP BY d.name
		`,
			[department_id]
		);

		if (res.rows.length > 0) {
			console.log(
				`Total utilized budget for ${res.rows[0].department}: $${res.rows[0].total_budget}`
			);
		} else {
			console.log('No employees found for the selected department.');
		}
		return res.rows;
	} catch (err) {
		console.error('Failed to retrieve total utilized budget:', err);
		return [];
	}
};

// Add a department
const addDepartment = async (name) => {
	try {
		const res = await client.query(
			'INSERT INTO department (name) VALUES ($1) RETURNING id',
			[name]
		);
		console.log(`Department '${name}' added successfully.`);
		return res.rows[0].id;
	} catch (err) {
		console.error('Failed to add department:', err);
		throw err;
	}
};

// Add a role
const addRole = async (title, salary, department_id) => {
	try {
		const res = await client.query(
			'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3) RETURNING id',
			[title, salary, department_id]
		);
		console.log(`Role '${title}' added successfully.`);
		return res.rows[0].id;
	} catch (err) {
		console.error('Failed to add role:', err);
		throw err;
	}
};

// Add an employee
const addEmployee = async (firstName, lastName, role_id, manager_id) => {
	try {
		await client.query(
			'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
			[firstName, lastName, role_id, manager_id]
		);
		console.log(`Employee '${firstName} ${lastName}' added successfully.`);
	} catch (err) {
		if (err.constraint === 'employee_role_id_fkey') {
			console.error(
				`Error: Role ID ${role_id} does not exist. Please enter a valid role ID.`
			);
		} else if (err.constraint === 'employee_manager_id_fkey') {
			console.error(
				`Error: Manager ID ${manager_id} does not exist. Please enter a valid manager ID.`
			);
		} else {
			console.error('Failed to add employee:', err);
		}
	}
};

// Update an employee's role
const updateEmployeeRole = async (employee_id, new_role_id) => {
	try {
		await client.query('UPDATE employee SET role_id = $1 WHERE id = $2', [
			new_role_id,
			employee_id,
		]);
		console.log('Employee role updated successfully.');
	} catch (err) {
		console.error('Failed to update employee role:', err);
	}
};

// Delete a department and cascade delete roles and employees
const deleteDepartmentCascade = async (department_id) => {
	try {
		await client.query(
			'DELETE FROM employee WHERE role_id IN (SELECT id FROM role WHERE department_id = $1)',
			[department_id]
		);
		await client.query('DELETE FROM role WHERE department_id = $1', [
			department_id,
		]);
		await client.query('DELETE FROM department WHERE id = $1', [
			department_id,
		]);
		console.log(
			'Department, its roles, and associated employees deleted successfully.'
		);
	} catch (err) {
		console.error('Failed to delete department:', err);
	}
};

// Delete a role
const deleteRole = async (role_id) => {
	try {
		await client.query('DELETE FROM role WHERE id = $1', [role_id]);
		console.log('Role deleted successfully.');
	} catch (err) {
		console.error('Failed to delete role:', err);
	}
};

// Delete an employee
const deleteEmployee = async (employee_id) => {
	try {
		await client.query('DELETE FROM employee WHERE id = $1', [employee_id]);
		console.log('Employee deleted successfully.');
	} catch (err) {
		console.error('Failed to delete employee:', err);
	}
};

module.exports = {
	viewAllDepartments,
	viewAllRoles,
	viewAllEmployees,
	viewEmployeesByDepartment,
	viewEmployeesByManager,
	viewDepartmentBudget,
	addDepartment,
	addRole,
	addEmployee,
	updateEmployeeRole,
	deleteDepartmentCascade,
	deleteRole,
	deleteEmployee,
};
