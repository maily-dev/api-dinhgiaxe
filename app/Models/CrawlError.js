'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class CrawlError extends Model {
    static get table() {
        return '04_02_crawl_errors'
    }
}

module.exports = CrawlError
