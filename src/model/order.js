const connection = require('../config/mysql')

module.exports = {
    getAllOrder: () => {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM order`), (error, result) => {
                !error ? resolve(result) : reject(new Error(error))
            }
        })
    },
    getOrderById: (id) => {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM order WHERE order_id = ?`, id, (error, result) => {
                !error ? resolve(result) : reject(new Error(error))
            })
        })
    },
    postOrder: (setData) => {
        return new Promise((resolve, reject) => {
            connection.query(`INSERT INTO history SET ?`, setData, (error, result) => {
                if (!error) {
                    const newResult = {
                        order_id: result.insertId,
                        ...setData
                    }
                    resolve(result)
                } else {
                    reject(new Error(error))
                }
            })
        })
    }
}