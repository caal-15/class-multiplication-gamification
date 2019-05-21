const knex = require('knex');
const path = require('path');

const conf = require('./conf.json');

conf.connection.filename = path.join(__dirname, conf.connection.filename);

module.exports = knex(conf);
