'use strict'

class Comment {
    get rules() {
        return {
            content: "required"
        }
    }

    get sanitizationRules() {
        return {
            content: "trim",
        }
    }

    get messages() {
        return {
            "content.required": "Nội dung không được trống"
        }
    }
}

module.exports = Comment
