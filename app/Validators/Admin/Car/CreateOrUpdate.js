'use strict'

class CreateOrUpdate {
    get rules() {
        return {
            name: "required",
            images: 'file_ext:png,gif,jpg,jpeg|file_size:2mb|file_types:image,octet-stream',
            attribute_id: "required|exists:03_04_car_attributes,id",
        }
    }

    get sanitizationRules() {
        return {
            name: "trim",
        }
    }

    get messages() {
        return {
            "name.required": "Tên không được trống",
            "attribute_id.required": "ID không được trống",
            "attribute_id.exists": "ID không đúng",
        }
    }
}

module.exports = CreateOrUpdate
