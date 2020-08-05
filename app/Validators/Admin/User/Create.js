'use strict'

class AdminUserCreate {
    get rules() {
        return {
            name: "required",
            email: "required|email|isExisted:02_01_users,email",
            // birthday: "checkDate",
            password: 'required|min:8',
            password_confirm: 'required|min:8|same:password',
            gender: 'in:male,female,other',
            image: 'file_ext:png,gif,jpg,jpeg|file_size:2mb|file_types:image,octet-stream',
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
            "email.isExisted": "Email đã tồn tại",
            "password.required": "Mật khẩu không được trống",
            "password_confirm.required": "Xác nhận mật khẩu không được trống",
            "password_confirm.same": "Xác nhận mật khẩu không trùng",
            'gender.in': 'in:male,female,other',
        }
    }
}

module.exports = AdminUserCreate
