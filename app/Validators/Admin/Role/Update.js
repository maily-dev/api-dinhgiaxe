'use strict'

class Update {
    get rules() {
        return {
            name: "required",
            slug: "required|exists:permission,slug",
            'listPermissionID.*': 'exists:listPermissionID,_id'
        }
    }

    get sanitizationRules() {
        return {
            name: "trim",
            slug: "trim",
        }
    }

    get messages() {
        return {
            "name.required": "Tên không được trống",
            "slug.exists": "Role không tồn tại",
            "listPermissionID.*.exists": "Permisson không tồn tại",
        }
    }

    get data() {
        const requestBody = this.ctx.request.all()
        const slug = this.ctx.request.params.slug
        return Object.assign({}, requestBody, { slug })
    }
}

module.exports = Update
