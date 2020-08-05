'use strict'

class Create {
    get rules() {
        return {
            name: "required",
            'listPermissionID.*': 'exists:permissions,_id'
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
            "listPermissionID.*.exists": "Permisson không tồn tại",
        }
    }
}

module.exports = Create
