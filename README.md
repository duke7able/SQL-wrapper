# SQL-wrapper
just a basic wrapper to do CRUD operation

# to start
import the connection file in index.js of node server and assign it to global.pool
Ex: 
const createPool = require('./connection')
.
.
.
global.pool = createPool()

# to user transaction
Ex:
const TransactionCRUD = require('./transaction')
.
.
.
const transaction = new TransactionCRUD()
transaction.connection = await transaction.init()
// then do the methods
