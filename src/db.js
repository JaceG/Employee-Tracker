const { Client } = require('pg');

const client = new Client({
	host: 'localhost',
	user: 'your_user',
	password: 'your_password',
	database: 'your_database',
});

client.connect((err) => {
	if (err) {
		console.error('Connection error', err.stack);
	} else {
		console.log('Connected to the database');
	}
});

module.exports = client;
