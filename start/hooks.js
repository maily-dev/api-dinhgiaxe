const { hooks } = require("@adonisjs/ignitor")
const Helpers = use("Helpers")
hooks.after.providersBooted(() => {
    const Validator = use('Validator')
    const Database = use('Database')

    const existsFn = async (data, field, message, args, get) => { // kiểm tra có tồn tại không, nếu tồn tại không lỗi
        const value = get(data, field)
        if (!value) {
            return
        }

        const [table, column] = args
        const row = await Database.table(table)
            .where(column, value)
            .first()

        if (!row) {
            throw message
        }
    }

    Validator.extend('exists', existsFn)
})

hooks.after.providersBooted(() => { // kiểm tra đã tồn tại hay không, nếu tồn tại lỗi
    const Validator = use('Validator')
    const Database = use('Database')

    const existsFn = async (data, field, message, args, get) => {
        const value = get(data, field)
        if (!value) {
            return
        }

        const [table, column] = args
        const row = await Database.table(table)
            .where(column, value)
            .first()

        if (row) {
            throw message
        }
    }

    Validator.extend('isExisted', existsFn)
})

hooks.after.providersBooted(() => {
    const moment = use("moment")
    const Validator = use('Validator')
    const existsFn = async (data, field, message, args, get) => {
        const value = get(data, field)
        if (!value) {
            return
        }

        const [table, column] = args
        const row = await Database.table(table)
            .where(column, value)
            .first()

        if (row) {
            throw message
        }
    }

    const checkDateFn = async (data, field, message, args, get) => {
        if (date) {
            let isValid = moment(date, 'YYYY-MM-DD', true).isValid()
            return isValid
        }
        throw message
    }

    Validator.extend('checkDate', checkDateFn)
})

