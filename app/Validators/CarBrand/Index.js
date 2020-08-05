'use strict'

class CarClass {
    get rules() {
        return {
            year: "required|number",
        }
    }

    get sanitizationRules() {
        return {
            year: "trim"
        }
    }

    get messages() {
        return {
            "year.required": "Năm không được trống",
            "year.number": "Năm phải là kiểu số"
        }
    }
}

module.exports = CarClass
