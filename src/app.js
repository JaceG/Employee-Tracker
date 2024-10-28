const inquirer = require('inquirer');
const {
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
} = require('./queries');

// Main menu function
const mainMenu = () => {
	inquirer
		.prompt([
			{
				type: 'list',
				name: 'option',
				message: 'What would you like to do?',
				choices: [
					'View all departments',
					'View all roles',
					'View all employees',
					'Add a department',
					'Add a role',
					'Add an employee',
					'Update an employee role',
					'Delete a department',
					'Delete a role',
					'Delete an employee',
					'Exit',
				],
			},
		])
		.then((answer) => {
			switch (answer.option) {
				case 'View all departments':
					viewAllDepartments().then(mainMenu);
					break;
				case 'View all roles':
					viewAllRoles().then(mainMenu);
					break;
				case 'View all employees':
					viewAllEmployees().then(mainMenu);
					break;
				case 'Add a department':
					addDepartmentPrompt();
					break;
				case 'Add a role':
					addRolePrompt();
					break;
				case 'Add an employee':
					addEmployeePrompt();
					break;
				case 'Update an employee role':
					updateEmployeeRolePrompt();
					break;
				case 'Delete a department':
					deleteDepartmentPrompt();
					break;
				case 'Delete a role':
					deleteRolePrompt();
					break;
				case 'Delete an employee':
					deleteEmployeePrompt();
					break;
				case 'Exit':
					console.log('Goodbye!');
					process.exit();
			}
		});
};

// Add Department Prompt
const addDepartmentPrompt = () => {
	inquirer
		.prompt([
			{
				type: 'input',
				name: 'name',
				message: 'Enter the name of the new department:',
				validate: (input) =>
					input ? true : 'Department name cannot be empty.',
			},
		])
		.then((answer) => {
			addDepartment(answer.name).then(mainMenu);
		});
};

// Add Role Prompt
const addRolePrompt = () => {
	inquirer
		.prompt([
			{
				type: 'input',
				name: 'title',
				message: 'Enter the title of the new role:',
				validate: (input) =>
					input ? true : 'Role title cannot be empty.',
			},
			{
				type: 'input',
				name: 'salary',
				message: 'Enter the salary for the new role:',
				validate: (input) =>
					!isNaN(input) && input
						? true
						: 'Please enter a valid number.',
			},
			{
				type: 'input',
				name: 'department_id',
				message: 'Enter the department ID for the new role:',
				validate: (input) =>
					!isNaN(input) && input
						? true
						: 'Please enter a valid department ID.',
			},
		])
		.then((answers) => {
			addRole(answers.title, answers.salary, answers.department_id).then(
				mainMenu
			);
		});
};

// Add Employee Prompt
const addEmployeePrompt = () => {
	inquirer
		.prompt([
			{
				type: 'input',
				name: 'firstName',
				message: "Enter the employee's first name:",
				validate: (input) =>
					input ? true : 'First name cannot be empty.',
			},
			{
				type: 'input',
				name: 'lastName',
				message: "Enter the employee's last name:",
				validate: (input) =>
					input ? true : 'Last name cannot be empty.',
			},
			{
				type: 'input',
				name: 'role_id',
				message: "Enter the employee's role ID:",
				validate: (input) =>
					!isNaN(input) && input
						? true
						: 'Please enter a valid role ID.',
			},
			{
				type: 'input',
				name: 'manager_id',
				message: 'Enter the manager ID (or leave blank if none):',
				validate: (input) =>
					input === '' || !isNaN(input)
						? true
						: 'Please enter a valid number or leave blank.',
			},
		])
		.then((answers) => {
			const managerId = answers.manager_id
				? parseInt(answers.manager_id)
				: null;
			addEmployee(
				answers.firstName,
				answers.lastName,
				parseInt(answers.role_id),
				managerId
			).then(mainMenu);
		});
};

// Update Employee Role Prompt
const updateEmployeeRolePrompt = () => {
	viewAllEmployees().then((employees) => {
		const employeeChoices = employees.map((emp) => ({
			name: `${emp.first_name} ${emp.last_name}`,
			value: emp.id,
		}));
		inquirer
			.prompt([
				{
					type: 'list',
					name: 'employee_id',
					message: 'Select the employee to update:',
					choices: employeeChoices,
				},
				{
					type: 'input',
					name: 'new_role_id',
					message: 'Enter the new role ID:',
					validate: (input) =>
						!isNaN(input) && input
							? true
							: 'Please enter a valid role ID.',
				},
			])
			.then((answers) => {
				updateEmployeeRole(
					answers.employee_id,
					parseInt(answers.new_role_id)
				).then(mainMenu);
			});
	});
};

// Delete Department Prompt
const deleteDepartmentPrompt = () => {
	viewAllDepartments().then((departments) => {
		const departmentChoices = departments.map((dept) => ({
			name: dept.name,
			value: dept.id,
		}));
		inquirer
			.prompt([
				{
					type: 'list',
					name: 'department_id',
					message: 'Select the department to delete:',
					choices: departmentChoices,
				},
				{
					type: 'confirm',
					name: 'confirmDelete',
					message:
						'Deleting this department will also delete all its roles and employees. Continue?',
					default: false,
				},
			])
			.then((answers) => {
				if (answers.confirmDelete) {
					deleteDepartmentCascade(answers.department_id).then(
						mainMenu
					);
				} else {
					console.log('Department deletion cancelled.');
					mainMenu();
				}
			});
	});
};

// Delete Role Prompt
const deleteRolePrompt = () => {
	viewAllRoles().then((roles) => {
		const roleChoices = roles.map((role) => ({
			name: role.title,
			value: role.id,
		}));
		inquirer
			.prompt([
				{
					type: 'list',
					name: 'role_id',
					message: 'Select the role to delete:',
					choices: roleChoices,
				},
			])
			.then((answer) => {
				deleteRole(answer.role_id).then(mainMenu);
			});
	});
};

// Delete Employee Prompt
const deleteEmployeePrompt = () => {
	viewAllEmployees().then((employees) => {
		const employeeChoices = employees.map((emp) => ({
			name: `${emp.first_name} ${emp.last_name}`,
			value: emp.id,
		}));
		inquirer
			.prompt([
				{
					type: 'list',
					name: 'employee_id',
					message: 'Select the employee to delete:',
					choices: employeeChoices,
				},
			])
			.then((answer) => {
				deleteEmployee(answer.employee_id).then(mainMenu);
			});
	});
};

// Start the application
mainMenu();
