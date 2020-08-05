'use strict'

class CarReviewIndex {
    get rules() {
        return {
            car_id: "required|exists:03_05_cars,id",
            car_result_history_id: "required|exists:05_02_car_result_histories,id",
            content: 'required|max:255',
            rate: 'required|integer|above:0|under:6',
        }
    }

    get sanitizationRules() {
        return {
            car_id: "trim",
            car_result_history_id: "trim",
            content: "trim",
            rate: "trim",
        }
    }

    get messages() {
        return {
            "car_id.required": "Xe không được trống",
            "car_id.exists": "Xe không tồn tại",
            "car_result_history_id.required": "Lịch sử tìm kiếm không được trống",
            "car_result_history_id.exists": "Lịch sử tìm kiếm không tồn tại",
            "rate.required": "Nội dung không được trống",
            "rate.max": "Nội dung không quá 255",
            "rate.required": "Đánh giá không được trống",
            "rate.integer": "Phải là số tự nhiên",
            "rate.above": "Phải là lớn hơn 0",
            "rate.integer": "Tối đa là 5",
        }
    }
}

module.exports = CarReviewIndex
