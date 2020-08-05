const SITES_CRAWL = {
    BONBANH: "bonbanh.com",
    VNEXPRESS: "vnexpress.net",
    CARMUDI: "carmudi.vn",
    BANXEHOICU: "banxehoicu.vn",
}
const CAR_STATUS = {
    NEW: "new",
    USED: "used",
    UNKNOWN: "unknown",
}

const CAR_STEP_PRICE = {
    YEAR: "year",
    NEW_TO_USED: "new-used",
    USED_TO_USED: "used-used",
}

const POST_STATUS = {
    IN_ACTIVE: 0,
    ACTIVED: 1,
    DELETED: 2,
}

const CONDITION_CAR = {
    EXCELLENT: 100 / 100,
    VERY_GOOD_MAX: 99 / 100,
    VERY_GOOD_MIN: 97 / 100,
    GOOD_MAX: 96 / 100,
    GOOD_MIN: 90 / 100,
    BAD_MAX: 89 / 100,
    BAD_MIN: 85 / 100,
}

const COMMENT_STATUS = {
    HIDE: 0,
    ACTIVED: 1,
}

const FEE = 22694000
//22.694.000 bao gồm: Phí sử dụng đường bộ (01 năm).
// 1.560.000 ₫ Bảo hiểm trách nhiệm dân sự (01 năm). 794.000 ₫ Phí 
// đăng ký biển số. 20.000.000 ₫. Phí đăng kiểm 340.000 ₫. Tính theo phí Hà Nội

module.exports = { SITES_CRAWL, CAR_STATUS, CAR_STEP_PRICE, POST_STATUS, CONDITION_CAR, COMMENT_STATUS, FEE }
