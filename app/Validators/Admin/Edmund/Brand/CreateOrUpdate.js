'use strict'

class CreateOrUpdate {
    get rules() {
        return {
            name: "required",
            image: 'file_ext:png,gif,jpg,jpeg|file_size:2mb|file_types:image,octet-stream'
        }
    }

    get sanitizationRules() {
        return {
            name: "trim"
        }
    }

    get messages() {
        return {
            "name.required": "Hãng không được trống",

        }
    }
}

module.exports = CreateOrUpdate
