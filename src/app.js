const inquirer = require('inquirer');
const {
	viewAllDepartments,
	viewAllRoles,
	viewAllEmployees,
} = require('./queries');

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
				case 'Exit':
					console.log('Goodbye!');
					process.exit();
			}
		});
};

mainMenu();
