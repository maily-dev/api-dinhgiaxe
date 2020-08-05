'use strict'
const CarType = use("App/Models/CarType")
/*
|--------------------------------------------------------------------------
| CarTypeSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

class CarTypeSeeder {
    async run() {
        let carTypes = [
            {
                name: 'convertible',
                slug: 'convertible',
            },
            {
                name: 'coupe',
                slug: 'coupe',
            },
            {
                name: 'electric',
                slug: 'electric',
            },
            {
                name: 'full size van',
                slug: 'full_size_van',
            },
            {
                name: 'hatchback',
                slug: 'hatchback',
            },
            {
                name: 'hybrid',
                slug: 'hybrid',
            },
            {
                name: 'minivan',
                slug: 'minivan',
            },
            {
                name: 'sedan',
                slug: 'sedan',
            },
            {
                name: 'suv',
                slug: 'suv',
            },
            {
                name: 'truck',
                slug: 'truck',
            },
            {
                name: 'wagon',
                slug: 'wagon',
            }
        ]
        for (let carType of carTypes) {
            await CarType.findOrCreate(carType)
        }
        console.log(`Seeder: CarType (Số lượng: ${carTypes.length})`)
    }
}

module.exports = CarTypeSeeder
