const _ = require('lodash')
/**
 * NOT to be used every where, ony corner cases like JOINS to be done here
 * @param {STRING} query query string
 */
const customQuery = function(query) {
  return new Promise(function(resolve, reject) {
    global.pool.getConnection(function(err, connection) {
      if (err) {
        reject(err)
      }
      if (connection) {
        connection.query(query, (error, results) => {
          connection.release()
          if (error) {
            reject(error)
          } else {
            resolve(results)
          }
        })
        connection.on('error', function(err) {
          reject(err)
        })
      } else {
        reject(new Error('connection object not found'))
      }
    })
  })
}

const select = function(where, notEq, columns = [], isLike = false, tableName) {
  return new Promise(function(resolve, reject) {
    const table = tableName || 'user'
    const selectedColumns = columns.length ? columns.join(',') : '*'
    let whereClause = ''
    if (!_.isEmpty(where)) {
      for (let key in where) {
        whereClause += ' ' + key + " = '" + where[key] + "' and"
      }
    }
    if (!_.isEmpty(notEq)) {
      for (const key in notEq) {
        whereClause += ' ' + key + " <> '" + notEq[key] + "' and"
      }
    }
    if (!_.isEmpty(isLike)) {
      if (whereClause !== '') {
        whereClause += '('
      }
      for (let key in isLike) {
        whereClause += ' ' + key + " LIKE '%" + isLike[key] + "%' or"
      }
    }
    if (whereClause !== '') {
      if (_.isEmpty(isLike) && whereClause.length > 4) {
        whereClause = ' WHERE' + whereClause.slice(0, whereClause.length - 4)
      } else if (!_.isEmpty(isLike) && whereClause.length > 3) {
        whereClause =
          ' WHERE' + whereClause.slice(0, whereClause.length - 3) + ')'
      }
    }
    global.pool.getConnection(function(err, connection) {
      if (err) {
        reject(err)
      }
      if (connection) {
        connection.query(
          'SELECT ' + selectedColumns + ' From ' + table + whereClause,
          (error, results) => {
            connection.release()
            if (error) {
              reject(error)
            } else {
              resolve(results)
            }
          }
        )
        connection.on('error', function(err) {
          reject(err)
        })
      } else {
        reject(new Error('connection object not found'))
      }
    })
  })
}

const insert = function(data, tableName) {
  return new Promise(function(resolve, reject) {
    if (_.isEmpty(data)) {
      reject(new Error('data should be compulsory passed for insert query'))
    }
    const table = tableName || 'user'
    global.pool.getConnection(function(err, connection) {
      if (err) {
        reject(err)
      }
      if (connection) {
        connection.query(
          'INSERT INTO ' + table + ' SET ?',
          data,
          (error, results) => {
            connection.release()
            if (error) {
              reject(error)
            } else {
              resolve(results.insertId)
            }
          }
        )
        connection.on('error', function(err) {
          reject(err)
        })
      } else {
        reject(new Error('connection object not found'))
      }
    })
  })
}

const update = function(where, data, tableName) {
  return new Promise(function(resolve, reject) {
    if (_.isEmpty(data)) {
      reject(new Error('data should be compulsory passed for update query'))
    }
    if (_.isEmpty(where)) {
      reject(new Error('where should be compulsory passed for update query'))
    }
    const table = tableName || 'user'
    let updateValues = ''
    for (let key in data) {
      updateValues += ' ' + key + " = '" + data[key] + "' ,"
    }
    updateValues = updateValues.slice(0, updateValues.length - 2)
    let whereClause = ''
    for (let key in where) {
      whereClause += ' ' + key + " = '" + where[key] + "' and"
    }
    whereClause = whereClause.slice(0, whereClause.length - 4)
    const updateQuery =
      'UPDATE ' + table + ' SET' + updateValues + ' WHERE' + whereClause
    global.pool.getConnection(function(err, connection) {
      if (err) {
        reject(err)
      }
      if (connection) {
        connection.query(updateQuery, (error, results) => {
          connection.release()
          if (error) {
            reject(error)
          } else {
            resolve(results)
          }
        })
        connection.on('error', function(err) {
          reject(err)
        })
      } else {
        reject(new Error('connection object not found'))
      }
    })
  })
}
module.exports = {
  select,
  insert,
  update,
  customQuery,
}
