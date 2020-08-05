'use strict'
const { COMMENT_STATUS } = use("App/Helpers/Enum")
class CarReviewUpdate {
    get rules() {
        return {
            content: 'required|max:255',
            rate: 'required|integer|above:0|under:6',
            status: `in:${COMMENT_STATUS.HIDE},${COMMENT_STATUS.ACTIVED}`
        }
    }

    get sanitizationRules() {
        return {
            content: "trim",
            rate: "trim",
        }
    }

    get messages() {
        return {
            "rate.required": "Nội dung không được trống",
            "rate.max": "Nội dung không quá 255",
            "rate.required": "Đánh giá không được trống",
            "rate.integer": "Phải là số tự nhiên",
            "rate.above": "Phải là lớn hơn 0",
            "rate.integer": "Tối đa là 5",
        }
    }
}

module.exports = CarReviewUpdate
