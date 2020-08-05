'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Token extends Model {
    static get table() {
        return '02_02_tokens'
    }
    // account() {
    //   return this.belongsTo('App/Models/User', 'account_id')
    // }
}

module.exports = Token
