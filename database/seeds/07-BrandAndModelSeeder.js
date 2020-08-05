'use strict'

/*
|--------------------------------------------------------------------------
| BrandAndModelSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const CrawlerBonbanh = use('App/Controllers/Http/Crawler/Bonbanh/CrawlerController')

class BrandAndModelSeeder {
    async run() {
        console.log('Đang crawl hãng và dòng xe  trang bonBanh')
        let crawlerBonbanh = new CrawlerBonbanh()
        await crawlerBonbanh.crawlBrand()
    }
}

module.exports = BrandAndModelSeeder
