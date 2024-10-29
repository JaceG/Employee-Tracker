const inquirer = require('inquirer');
const {
	viewAllDepartments,
	viewAllRoles,
	viewAllEmployees,
	viewEmployeesByDepartment,
	viewEmployeesByManager,
	viewDepartmentBudget,
	addDepartment,
	addRole,
	addEmployee,
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
					'View employees by manager',
					'View employees by department',
					'View total utilized budget of a department',
					'Add a department',
					'Add a role',
					'Add an employee',
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
				case 'View employees by manager':
					viewEmployeesByManagerPrompt();
					break;
				case 'View employees by department':
					viewEmployeesByDepartmentPrompt();
					break;
				case 'View total utilized budget of a department':
					viewDepartmentBudgetPrompt();
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
				case 'Exit':
					console.log('Goodbye!');
					process.exit();
			}
		});
};

// Prompt to view employees by manager
const viewEmployeesByManagerPrompt = () => {
	viewAllEmployees().then((employees) => {
		const managerChoices = employees.map((manager) => ({
			name: `${manager.first_name} ${manager.last_name}`,
			value: manager.id,
		}));

		inquirer
			.prompt([
				{
					type: 'list',
					name: 'manager_id',
					message: 'Select a manager to view their employees:',
					choices: managerChoices,
				},
			])
			.then((answer) => {
				viewEmployeesByManager(answer.manager_id).then(mainMenu);
			})
			.catch((err) => {
				console.error('Error selecting manager:', err);
				mainMenu();
			});
	});
};

// Prompt to view employees by department
const viewEmployeesByDepartmentPrompt = () => {
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
					message: 'Select a department to view its employees:',
					choices: departmentChoices,
				},
			])
			.then((answer) => {
				viewEmployeesByDepartment(answer.department_id).then(mainMenu);
			})
			.catch((err) => {
				console.error('Error selecting department:', err);
				mainMenu();
			});
	});
};

// Prompt to view total utilized budget of a department
const viewDepartmentBudgetPrompt = () => {
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
					message: 'Select a department to view its total budget:',
					choices: departmentChoices,
				},
			])
			.then((answer) => {
				viewDepartmentBudget(answer.department_id).then(mainMenu);
			})
			.catch((err) => {
				console.error('Error selecting department:', err);
				mainMenu();
			});
	});
};

// Add department prompt
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

// Add role prompt
const addRolePrompt = () => {
	viewAllDepartments().then((departments) => {
		const departmentChoices = departments.map((dept) => ({
			name: dept.name,
			value: dept.id,
		}));

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
					type: 'list',
					name: 'department_id',
					message: 'Select the department for the new role:',
					choices: departmentChoices,
				},
			])
			.then((role) => {
				addRole(role.title, role.salary, role.department_id).then(
					mainMenu
				);
			});
	});
};

// Add employee prompt
const addEmployeePrompt = () => {
	viewAllRoles().then((roles) => {
		const roleChoices = roles.map((role) => ({
			name: role.title,
			value: role.id,
		}));

		viewAllEmployees().then((managers) => {
			const managerChoices = managers.map((manager) => ({
				name: `${manager.first_name} ${manager.last_name}`,
				value: manager.id,
			}));
			managerChoices.push({ name: 'None', value: null });

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
						type: 'list',
						name: 'role_id',
						message: "Select the employee's role:",
						choices: roleChoices,
					},
					{
						type: 'list',
						name: 'manager_id',
						message: "Select the employee's manager (if any):",
						choices: managerChoices,
					},
				])
				.then((employee) => {
					addEmployee(
						employee.firstName,
						employee.lastName,
						employee.role_id,
						employee.manager_id
					).then(mainMenu);
				});
		});
	});
};

// Start the application
mainMenu();
