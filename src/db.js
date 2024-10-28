const { Client } = require('pg');

const client = new Client({
	host: 'localhost',
	user: 'postgres',
	password: '1313',
	database: 'employee_tracker',
});

client.connect((err) => {
	if (err) {
		console.error('Connection error', err.stack);
	} else {
		console.log('Connected to the database as superuser');
	}
});

module.exports = client;
