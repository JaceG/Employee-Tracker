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
	deleteDepartmentCascade,
	deleteRole,
	deleteEmployee,
} = require('./queries');
const { EMPLOYEE, DEPARTMENT, ROLE } = require('./constants');

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

// Prompt to view employees by manager
const viewEmployeesByManagerPrompt = () => {
	viewAllEmployees().then((employees) => {
		const managerChoices = employees.map((manager) => ({
			name: `${manager[EMPLOYEE.first]} ${manager[EMPLOYEE.last]}`,
			value: manager[EMPLOYEE.id],
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
			name: dept[DEPARTMENT.department],
			value: dept[DEPARTMENT.id],
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
			name: dept[DEPARTMENT.department],
			value: dept[DEPARTMENT.id],
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
const addDepartmentPrompt = async (createRole = false) => {
	await viewAllDepartments();

	return inquirer
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
			return addDepartment(answer.name).then((id) => {
				if (createRole) return id;
				return mainMenu();
			});
		});
};

// Add role prompt
const addRolePrompt = async (createEmployee = false) => {
	const departments = await viewAllDepartments(false);
	const departmentChoices = departments.map((dept) => ({
		name: dept.department,
		value: dept.id,
	}));
	await viewAllRoles();

	return inquirer

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
				choices: [
					...departmentChoices,
					{
						name: 'Create new department',
						value: null,
					},
				],
			},
		])
		.then(async (role) => {
			let departmentId = role.department_id;
			if (role.department_id === null) {
				departmentId = await addDepartmentPrompt(true);
			}
			return addRole(role.title, role.salary, departmentId).then((id) => {
				if (createEmployee) {
					return id;
				} else {
					return mainMenu();
				}
			});
		});
};

// Add employee prompt
const addEmployeePrompt = () => {
	viewAllRoles().then((roles) => {
		const roleChoices = roles.map((role) => ({
			name: role[ROLE.role],
			value: role[ROLE.id],
		}));

		viewAllEmployees().then(async (managers) => {
			const managerChoices = managers.map((manager) => ({
				name: `${manager[EMPLOYEE.first]} ${manager[EMPLOYEE.last]}`,
				value: manager[EMPLOYEE.id],
			}));

			managerChoices.push({ name: 'None', value: null });

			const employee = await inquirer.prompt([
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
					choices: [
						...roleChoices,
						{
							name: 'Create new role',
							value: null,
						},
					],
				},
				// {
				// 	type: 'list',
				// 	name: 'manager_id',
				// 	message: "Select the employee's manager (if any):",
				// 	choices: managerChoices,
				// },
			]);

			let role = employee.role_id;

			if (employee.role_id === null) {
				role = await addRolePrompt(true);
			}

			const createRole = await inquirer.prompt([
				{
					type: 'list',
					name: 'manager_id',
					message: "Select the employee's manager (if any):",
					choices: managerChoices,
				},
			]);
			await addEmployee(
				employee.firstName,
				employee.lastName,
				role,
				createRole.manager_id
			);
			mainMenu();
		});
	});
};

const deleteDepartmentPrompt = async () => {
	const departments = await viewAllDepartments();
	const departmentChoices = departments.map((dept) => ({
		name: dept.department,
		value: dept.id,
	}));

	return inquirer
		.prompt([
			{
				type: 'list',
				name: 'department_id',
				message: 'Select the department:',
				choices: departmentChoices,
			},
		])
		.then(async (answer) => {
			const isConfirmedResponse = await inquirer.prompt([
				{
					type: 'confirm',
					name: 'is_confirm',
					message:
						'Deleting a department will also delete employees and their roles, continue?',
				},
			]);
			if (isConfirmedResponse.is_confirm)
				return deleteDepartmentCascade(answer.department_id).then(
					mainMenu
				);
			return mainMenu();
		});
};

const deleteRolePrompt = async () => {
	const roles = await viewAllRoles();
	const roleChoices = roles.map((role) => ({
		name: role[ROLE.role],
		value: role[ROLE.id],
	}));

	return inquirer
		.prompt([
			{
				type: 'list',
				name: 'role_id',
				message: 'Select the role:',
				choices: roleChoices,
			},
		])
		.then(async (answer) => {
			const isConfirmedResponse = await inquirer.prompt([
				{
					type: 'confirm',
					name: 'is_confirm',
					message:
						'Deleting a role will also delete thier employees, continue?',
				},
			]);
			if (isConfirmedResponse.is_confirm)
				return deleteRole(answer.role_id).then(mainMenu);
			return mainMenu();
		});
};

const deleteEmployeePrompt = async () => {
	const employees = await viewAllEmployees();
	const employeeChoices = employees.map((manager) => ({
		name: `${manager[EMPLOYEE.first]} ${manager[EMPLOYEE.last]}`,
		value: manager[EMPLOYEE.id],
	}));

	return inquirer
		.prompt([
			{
				type: 'list',
				name: 'employee_id',
				message: 'Select the employee:',
				choices: employeeChoices,
			},
		])
		.then(async (answer) => {
			const isConfirmedResponse = await inquirer.prompt([
				{
					type: 'confirm',
					name: 'is_confirm',
					message: 'Deleting an employee, continue?',
				},
			]);
			if (isConfirmedResponse.is_confirm)
				return deleteEmployee(answer.employee_id).then(mainMenu);
			return mainMenu();
		});
};

// Start the application
mainMenu();
