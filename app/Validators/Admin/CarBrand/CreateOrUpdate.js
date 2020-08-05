'use strict'

class CreateOrUpdate {
    get rules() {
        return {
            name: "required|isExisted:03_01_car_brands,name",
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
            "name.required": "Tên hãng không được trống",
            "name.isExisted": "Tên hãng đã tồn tại",
        }
    }
}

module.exports = CreateOrUpdate
