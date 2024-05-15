// const { Client } = require('pg');
// let DB_URI;
// if(process.env.NODE_ENV === 'test'){
//     DB_URI = 'postgresql://biztime_test';
// }else{
//     DB_URI = 'postgresql:///biztime';
// }
// let db = new Client({
//     connectionString: DB_URI
// });
// db.connect();
// module.exports = db;

const { Client } = require('pg');

let DB_URI;

if (process.env.NODE_ENV === 'test') {
    DB_URI = 'postgresql://localhost:5432/biztime_test';
} else {
    DB_URI = 'postgresql://localhost:5432/biztime';
}

const db = new Client({
    connectionString: DB_URI
});

db.connect(err => {
    if (err) {
        console.error('Connection error', err.stack);
    } else {
        console.log('Connected to the database');
    }
});

module.exports = db;