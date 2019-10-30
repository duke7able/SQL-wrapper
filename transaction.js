const _ = require('lodash')

class TransactionCRUD {
  constructor() {
    this.connection = false
  }

  async init() {
    return new Promise(function(resolve, reject) {
      global.pool.getConnection(function(err, connect) {
        if (err) {
          reject(err)
        }
        resolve(connect)
      })
    }).then(connection => {
      return new Promise(function(resolve, reject) {
        connection.beginTransaction(err => {
          if (err) {
            console.log('error : ', err)
            reject(new Error(err))
          } else {
            resolve(connection)
          }
        })
      })
    })
  }
  /**
   * NOT to be used every where, ony corner cases like JOINS to be done here
   * @param {STRING} query query string
   */
  async customQuery(query) {
    const connection = this.connection
    const self = this
    return new Promise(function(resolve, reject) {
      if (!connection) {
        reject(new Error('Error in customQuery Wrapper : connection not found'))
      }
      connection.query(query, (error, results) => {
        if (error) {
          console.log(error, query)
          self._rollback(error)
          reject(error)
        } else {
          resolve(results)
        }
      })
      connection.on('error', function(err) {
        self._rollback(err)
        reject(err)
      })
    })
  }

  async select(where, notEq, columns = [], isLike = false, tableName) {
    const connection = this.connection
    const self = this
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
      if (!connection) {
        reject(new Error('Error in customQuery Wrapper : connection not found'))
      }
      connection.query(
        'SELECT ' + selectedColumns + ' From ' + table + whereClause,
        (error, results) => {
          if (error) {
            console.log(
              error,
              'SELECT ' + selectedColumns + ' From ' + table + whereClause
            )
            self._rollback(error)
            reject(error)
          } else {
            resolve(results)
          }
        }
      )
      connection.on('error', function(err) {
        self._rollback(err)
        reject(err)
      })
    })
  }

  async insert(data, tableName) {
    const connection = this.connection
    const self = this
    return new Promise(function(resolve, reject) {
      if (!connection) {
        reject(new Error('Error in Insert Wrapper : connection not found'))
      }
      if (_.isEmpty(data)) {
        reject(new Error('data should be compulsory passed for insert query'))
      }
      const table = tableName || 'user'
      connection.query(
        'INSERT INTO ' + table + ' SET ?',
        data,
        (error, results) => {
          if (error) {
            self._rollback(error)
            reject(error)
          } else {
            resolve(results.insertId)
          }
        }
      )
      connection.on('error', function(err) {
        self._rollback(err)
      })
    })
  }

  async update(where, data, tableName) {
    const connection = this.connection
    const self = this
    return new Promise(function(resolve, reject) {
      if (!connection) {
        reject(new Error('Error in update Wrapper : connection not found'))
      }
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

      connection.query(updateQuery, (error, results) => {
        if (error) {
          self._rollback(error)
          reject(error)
        } else {
          resolve(results)
        }
      })
      connection.on('error', function(err) {
        self._rollback(err)
        reject(err)
      })
    })
  }

  async _rollback(error) {
    if (this.connection) {
      console.log('rollback db transaction : ', error)
      this.connection.rollback()
      this.connection.release()
    } else {
      return new Error(
        'Error in rollback Wrapper : this.connection not found error : ' + error
      )
    }
  }

  async commit() {
    if (this.connection) {
      this.connection.commit(err => {
        if (err) {
          this._rollback(err)
        } else {
          this.connection.release()
        }
      })
    } else {
      return new Error('Error in commit Wrapper : this.connection not found')
    }
  }
}

module.exports = TransactionCRUD
