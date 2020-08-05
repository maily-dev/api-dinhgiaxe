'use strict'
const { COMMENT_STATUS } = use("App/Helpers/Enum")
class CarModel {
    get rules() {
        return {
            content: "required",
            status: `required|in:${COMMENT_STATUS.ACTIVED},${COMMENT_STATUS.HIDE}`,
        }
    }

    get sanitizationRules() {
        return {
            content: "trim",
            status: "trim",
        }
    }

    get messages() {
        return {
            "content.required": "Nội dung không được trống",
            "status.required": "Trạng thái không được trống",
            "status.in": "Trạng thái không đúng",
        }
    }
}

module.exports = CarModel
