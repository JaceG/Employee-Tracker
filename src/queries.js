const client = require('./db');

// View all departments
const viewAllDepartments = async () => {
	try {
		const res = await client.query('SELECT * FROM department');
		console.table(res.rows);
		return res.rows;
	} catch (err) {
		console.error('Failed to retrieve departments:', err);
		return [];
	}
};

// View all roles
const viewAllRoles = async () => {
	try {
		const res = await client.query(`
			SELECT role.id, role.title, department.name AS department, role.salary 
			FROM role 
			JOIN department ON role.department_id = department.id
		`);
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
			SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, m.first_name AS manager 
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

// Add a department and return its ID
const addDepartment = async (name) => {
	try {
		const res = await client.query(
			'INSERT INTO department (name) VALUES ($1) RETURNING id',
			[name]
		);
		const newDepartmentId = res.rows[0].id;
		console.log(`Department '${name}' added successfully.`);
		return newDepartmentId;
	} catch (err) {
		console.error('Failed to add department:', err);
		throw err;
	}
};

// Add a role and return its ID
const addRole = async (title, salary, department_id) => {
	try {
		const res = await client.query(
			'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3) RETURNING id',
			[title, salary, department_id]
		);
		const newRoleId = res.rows[0].id;
		console.log(`Role '${title}' added successfully.`);
		return newRoleId;
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
				`Error: Role ID ${role_id} does not exist. Please ensure you enter a valid role ID.`
			);
		} else if (err.constraint === 'employee_manager_id_fkey') {
			console.error(
				`Error: Manager ID ${manager_id} does not exist. Please ensure you enter a valid manager ID.`
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
		// Delete employees linked to roles in the department
		await client.query(
			'DELETE FROM employee WHERE role_id IN (SELECT id FROM role WHERE department_id = $1)',
			[department_id]
		);

		// Delete roles linked to the department
		await client.query('DELETE FROM role WHERE department_id = $1', [
			department_id,
		]);

		// Delete the department itself
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
	addDepartment,
	addRole,
	addEmployee,
	updateEmployeeRole,
	deleteDepartmentCascade,
	deleteRole,
	deleteEmployee,
};
