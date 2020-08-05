"use strict"

/*
|--------------------------------------------------------------------------
| ProvincialSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Province = use("App/Models/Province")

class ProvinceSeeder {
	async run() {
		let provinces = [
			{ name: 'Hà Nội' },
			{ name: 'Bắc Giang' },
			{ name: 'Bắc Kạn' },
			{ name: 'Bắc Ninh' },
			{ name: 'Cao Bằng' },
			{ name: 'Điện Biên' },
			{ name: 'Hà Giang' },
			{ name: 'Hà Nam' },
			{ name: 'Hải Dương' },
			{ name: 'Hải Phòng' },
			{ name: 'Hòa Bình' },
			{ name: 'Hưng Yên' },
			{ name: 'Lai Châu' },
			{ name: 'Lạng Sơn' },
			{ name: 'Lào Cai' },
			{ name: 'Nam Định' },
			{ name: 'Ninh Bình' },
			{ name: 'Phú Thọ' },
			{ name: 'Quảng Ninh' },
			{ name: 'Sơn La' },
			{ name: 'Thái Bình' },
			{ name: 'Thái Nguyên' },
			{ name: 'Tuyên Quang' },
			{ name: 'Vĩnh Phúc' },
			{ name: 'Yên Bái' },
			{ name: 'Đà Nẵng' },
			{ name: 'Bình Định' },
			{ name: 'Bình Thuận' },
			{ name: 'Đăk Lăk' },
			{ name: 'Đăk Nông' },
			{ name: 'Gia Lai' },
			{ name: 'Hà Tĩnh' },
			{ name: 'Khánh Hòa' },
			{ name: 'Kon Tum' },
			{ name: 'Lâm Đồng' },
			{ name: 'Nghệ An' },
			{ name: 'Ninh Thuận' },
			{ name: 'Phú Yên' },
			{ name: 'Quảng Bình' },
			{ name: 'Quảng Nam' },
			{ name: 'Quảng Ngãi' },
			{ name: 'Quảng Trị' },
			{ name: 'Thanh Hóa' },
			{ name: 'Thừa Thiên Huế' },
			{ name: 'TP HCM' },
			{ name: 'An Giang' },
			{ name: 'Bà Rịa Vũng Tàu' },
			{ name: 'Bạc Liêu' },
			{ name: 'Bến Tre' },
			{ name: 'Bình Dương' },
			{ name: 'Bình Phước' },
			{ name: 'Cà Mau' },
			{ name: 'Cần Thơ' },
			{ name: 'Đồng Nai' },
			{ name: 'Đồng Tháp' },
			{ name: 'Hậu Giang' },
			{ name: 'Kiên Giang' },
			{ name: 'Long An' },
			{ name: 'Sóc Trăng' },
			{ name: 'Tây Ninh' },
			{ name: 'Tiền Giang' },
			{ name: 'Trà Vinh' },
			{ name: 'Vĩnh Long' }
		]
		for (let province of provinces) {
			await Province.findOrCreate(province)
		}
		console.log(`Seeder: Provinces (Số lượng: ${provinces.length})`)
	}
}

module.exports = ProvinceSeeder
