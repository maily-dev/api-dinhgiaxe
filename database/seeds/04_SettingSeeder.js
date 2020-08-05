"use strict"

/*
|--------------------------------------------------------------------------
| SettingSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Setting = use("App/Models/Setting")
const settingDts = [
	{
		key: 'CPGXLB',
		value: 22694000,
		name: 'Các phí giá xe lăn bánh',
		detail: 'Phí sử dụng đường bộ (01 năm). 1.560.000 ₫ Bảo hiểm trách nhiệm dân sự (01 năm). 794.000 ₫ Phí đăng ký biển số. 20.000.000 ₫. Phí đăng kiểm 340.000 ₫. Tính theo phí Hà Nội',
	},
	{
		key: 'PTB',
		value: 12,
		name: 'Phí trước bạ',
		detail: null
	},
	{
		key: 'rowsPerPage',
		value: 10,
		name: 'Số dữ liệu 1 trang',
		detail: null
	}
]
class SettingSeeder {
	async run() {

		for (let i in settingDts) {
			let setting = settingDts[i]
			await Setting.findOrCreate(setting)
		}
		console.log(`Seeder: Setting (Số lượng: ${settingDts.length})`)
	}
}

module.exports = SettingSeeder
