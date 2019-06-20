const mysql = require('mysql')

const connection = () => {
  const connect = mysql.createConnection({
    host: URL,
    user: USERNAME,
    password: PASSWORD,
    database: DATABASE_NAME,
    timezone: 'Z',
  })
  return connect
}

module.exports = connection
