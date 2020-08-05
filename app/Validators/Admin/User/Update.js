'use strict'

class AdminUserCreate {
    get rules() {
        return {
            name: "required",
            email: "required|email",
            password: 'min:8',
            password_confirm: 'min:8|same:password',
            image: 'file_ext:png,gif,jpg,jpeg|file_size:2mb|file_types:image,octet-stream',
            gender: 'in:male,female,other',
            'role_ids.*': 'exists:02_03_roles,id'
        }
    }

    get sanitizationRules() {
        return {
            name: "trim",
            email: "trim",
            password: "trim",
            password_confirm: "trim",
        }
    }

    get messages() {
        return {
            "name.required": "Tên không được trống",
            "email.required": "Email không được trống",
            "email.email": "Email không đúng",
            "password_confirm.same": "Xác nhận mật khẩu không trùng",
            'gender.in': 'in:male, female, other'
        }
    }
}

module.exports = AdminUserCreate
