const inquirer = require('inquirer');
const {
	viewAllDepartments,
	viewAllRoles,
	viewAllEmployees,
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
			addDepartment(answer.name).then(() => {
				console.log(`Department '${answer.name}' added successfully.`);
				mainMenu();
			});
		});
};

// Add Role Prompt
const addRolePrompt = (departmentChoices, employeeData) => {
	if (!departmentChoices) {
		viewAllDepartments().then((departments) => {
			departmentChoices = departments.map((dept) => ({
				name: dept.name,
				value: dept.id,
			}));

			departmentChoices.push({
				name: 'Create a new department',
				value: 'new_department',
			});

			// Proceed to role creation prompt
			createRolePrompt(departmentChoices, employeeData);
		});
	} else {
		createRolePrompt(departmentChoices, employeeData);
	}
};

// Create Role Prompt (used internally by addRolePrompt)
const createRolePrompt = (departmentChoices, employeeData) => {
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
				message:
					'Select the department for the new role or create a new one:',
				choices: departmentChoices,
			},
		])
		.then((roleAnswers) => {
			if (roleAnswers.department_id === 'new_department') {
				addDepartmentPrompt(roleAnswers, employeeData);
			} else {
				addRole(
					roleAnswers.title,
					roleAnswers.salary,
					roleAnswers.department_id
				).then((roleId) => {
					employeeData.role_id = roleId; // Set the new role ID
					selectManagerAndAddEmployee(employeeData, []);
				});
			}
		});
};

// Add Employee Prompt
const addEmployeePrompt = () => {
	viewAllRoles().then((roles) => {
		let roleChoices = roles.map((role) => ({
			name: role.title,
			value: role.id,
		}));

		roleChoices.push({ name: 'Create a new role', value: 'new_role' });

		viewAllDepartments().then((departments) => {
			let departmentChoices = departments.map((dept) => ({
				name: dept.name,
				value: dept.id,
			}));

			departmentChoices.push({
				name: 'Create a new department',
				value: 'new_department',
			});

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
							message:
								"Select the employee's role or create a new one:",
							choices: roleChoices,
						},
					])
					.then((answers) => {
						if (answers.role_id === 'new_role') {
							addRolePrompt(departmentChoices, answers);
						} else {
							selectManagerAndAddEmployee(
								answers,
								managerChoices
							);
						}
					});
			});
		});
	});
};

// Select Manager and Add Employee
const selectManagerAndAddEmployee = (employeeData, managerChoices) => {
	// Add a "No Manager" option if the list is empty or explicitly as a choice
	if (
		managerChoices.length === 0 ||
		!managerChoices.some((choice) => choice.name === 'None')
	) {
		managerChoices.push({ name: 'None', value: null });
	}

	inquirer
		.prompt([
			{
				type: 'list',
				name: 'manager_id',
				message: 'Select the manager (if any):',
				choices: managerChoices,
			},
		])
		.then((managerAnswer) => {
			addEmployee(
				employeeData.firstName,
				employeeData.lastName,
				employeeData.role_id,
				managerAnswer.manager_id
			)
				.then(() => {
					console.log(
						`Employee '${employeeData.firstName} ${employeeData.lastName}' added successfully.`
					);
					mainMenu();
				})
				.catch((err) => {
					console.error('Error adding employee:', err);
					mainMenu();
				});
		})
		.catch((err) => {
			console.error('Error in manager selection:', err);
			mainMenu();
		});
};

// Start the application
mainMenu();
