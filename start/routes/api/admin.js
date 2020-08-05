'use strict'


const Route = use('Route')
//
Route.get("/admin", ({ view }) => view.render("app"))
Route.group(() => {
    Route.any("*", ({ view }) => view.render("app"))
}).prefix("admin")

// Router crawler
Route.group(() => {
    Route.get("bon-banh/brand", "Crawler/Bonbanh/CrawlerController.crawlBrand")
    Route.get("bon-banh/car", "Crawler/Bonbanh/CrawlerController.getCar")
    Route.get("vnexpress/new-price", "Crawler/Vnexpress/CrawlerController.getNewPrice")
    Route.get("carmudi/car", "Crawler/Carmudi/CrawlerController.getCar")
    Route.get("ban-xe-hoi-cu/car", "Crawler/Banxehoicu/CrawlerController.getCar")
    Route.post("kbb/brand", "Crawler/Kbb/CrawlerController.crawlBrand")
    Route.get("edmund/brand", "Crawler/Edmund/CrawlerController.crawlBrand")
})
    .prefix("api/admin/crawler")
// .middleware(['auth:api', 'can:crawl'])

Route.group(() => {
    Route.get("/all", "Admin/RoleController.all").validator("Admin/Role/Index").middleware('can:read-role')
    Route.get("/", "Admin/RoleController.index").validator("Admin/Role/Index").middleware('can:read-role||read-and-write-role')
    Route.get("/:slug", "Admin/RoleController.show").middleware('can:read-role||read-and-write-role')
    Route.post("/", "Admin/RoleController.create").validator("Admin/Role/Create").middleware('can:read-and-write-role')
    Route.put("/:slug", "Admin/RoleController.update").validator("Admin/Role/Update").middleware('can:read-and-write-role')
    Route.delete("/:slug", "Admin/RoleController.destroy").middleware('can:read-and-write-role')
}).prefix("api/admin/role").middleware(['auth:api'])

Route.group(() => {
    Route.get("/", "Admin/PermissonController.index")
}).prefix("api/admin/permission").middleware(['auth:api', 'can:read-and-write-role'])

Route.group(() => {
    Route.get("/", "Admin/CarBrandController.index").middleware('can:read-brand||read-and-write_brand')
    Route.post("/", "Admin/CarBrandController.create").validator("Admin/CarBrand/CreateOrUpdate").middleware('can:read-and-write-brand')
    Route.put("/:id", "Admin/CarBrandController.update").validator("Admin/CarBrand/CreateOrUpdate").middleware('can:read-and-write-brand')
    Route.delete("/:id", "Admin/CarBrandController.destroy").middleware('can:read-and-write-brand')
}).prefix("api/admin/brand").middleware(['auth:api'])

Route.group(() => {
    Route.get("/", "Admin/CarModelController.index").validator("Admin/CarModel/Index").middleware('can:read-model||read-and-write-model')
    Route.post("/:id", "Admin/CarModelController.create").validator("Admin/CarModel/CreateOrUpdate").middleware('can:read-and-write-model')
    Route.put("/:id", "Admin/CarModelController.update").validator("Admin/CarModel/CreateOrUpdate").middleware('can:read-and-write-model')
    Route.delete("/:id", "Admin/CarModelController.destroy").middleware('can:read-and-write-model')
}).prefix("api/admin/model").middleware(['auth:api'])

Route.group(() => {
    Route.get("/", "Admin/CarAttributeController.index").validator("Admin/CarAttribute/Index").middleware('can:read-attribute||read-and-write-attribute')
    Route.post("/", "Admin/CarAttributeController.create").validator("Admin/CarAttribute/CreateOrUpdate").middleware('can:read-and-write-attribute')
    Route.put("/:id", "Admin/CarAttributeController.update").validator("Admin/CarAttribute/CreateOrUpdate").middleware('can:read-and-write-attribute')
    Route.delete("/:id", "Admin/CarAttributeController.destroy").middleware('can:read-and-write-attribute')
}).prefix("api/admin/attribute").middleware(['auth:api'])

Route.group(() => {
    Route.get("/", "Admin/CarTypeController.index").middleware('can:read-car-type||read-and-write-car-type')
    Route.get("/", "Admin/CarTypeController.getCarTypeByConditions").validator("Admin/CarType/GetCarTypeByCondition") // lấy kiểu xe theo slug dòng và năm
        .middleware('can:read-car-type||read-and-write-car-type')
    Route.post("/", "Admin/CarTypeController.create").validator("Admin/CarType/CreateOrUpdate")
        .middleware('can:read-car-type||read-and-write-car-type')
    Route.put("/:id", "Admin/CarTypeController.update").validator("Admin/CarType/CreateOrUpdate").middleware('can:read-and-write-car-type')
    Route.delete("/:id", "Admin/CarTypeController.destroy").middleware('can:read-and-write-car-type')
}).prefix("api/admin/car-type").middleware(['auth:api'])

Route.group(() => {
    Route.get("/", "Admin/CarController.index").validator("Admin/Car/Index").middleware('can:read-car||read-and-write-car') // danh sách xe theo duy nhất trong database
    Route.post("/", "Admin/CarController.create").validator("Admin/Car/CreateOrUpdate").middleware('can:read-and-write-car')
    Route.put("/:id", "Admin/CarController.update").validator("Admin/Car/CreateOrUpdate").middleware('can:read-and-write-car')
    Route.delete("/:id", "Admin/CarController.destroy").middleware('can:read-and-write-car')
}).prefix("api/admin/car").middleware(['auth:api'])

Route.group(() => {
    Route.get("/", "Admin/CarCrawlController.index").validator("Admin/CarCrawl/Index").middleware('can:read-car-crawl||read-and-write-car-crawl')
})
    .prefix("api/admin/car-crawl")
    .middleware(['auth:api'])

Route.group(() => {
    Route.get("/", "Admin/PostCategoryController.index")
    Route.post("/", "Admin/PostCategoryController.create").validator("Admin/PostCategory/Create")
    Route.put("/:id", "Admin/PostCategoryController.update").validator("Admin/PostCategory/Update")
    Route.delete("/:id", "Admin/PostCategoryController.destroy")
}).prefix("api/admin/post-category").middleware(['auth:api'])

Route.group(() => {
    Route.get("/", "Admin/PostController.index")
    Route.get("/:slug", "Admin/PostController.show")
    Route.delete("/:slug", "Admin/PostController.destroy")
}).prefix("api/admin/post").middleware(['auth:api'])

Route.group(() => {
    Route.get("/", "Admin/PostCommentController.index")
    Route.put("/:id", "Admin/PostCommentController.update")
    Route.delete("/:id", "Admin/PostCommentController.destroy")
}).prefix("api/admin/post-comment").middleware(['auth:api'])

Route.group(() => {
    Route.get("/", "Admin/CarReviewController.index")
    Route.put("/:id", "Admin/CarReviewController.update")
    Route.delete("/:id", "Admin/CarReviewController.destroy")
}).prefix("api/admin/car-review").middleware(['auth:api'])

Route.group(() => {
    Route.get("/", "Admin/SettingController.index").middleware('can:read-setting||read-and-write-setting')
    Route.get("/:id", "Admin/SettingController.show").middleware('can:read-setting||read-and-write-setting')
    Route.post("/", "Admin/SettingController.create").validator("Admin/Setting/CreateOrUpdate").middleware('can:read-and-write-setting')
    Route.put("/:id", "Admin/SettingController.update").validator("Admin/Setting/CreateOrUpdate").middleware('can:read-and-write-setting')
    Route.delete("/:id", "Admin/SettingController.destroy").middleware('can:read-and-write-setting')
}).prefix("api/admin/setting").middleware(['auth:api'])

Route.group(() => {
    Route.get("/", "Admin/UserController.index").validator("Admin/User/Index").middleware('can:read-user||read-and-write-user')
    Route.get("/:id", "Admin/UserController.show").middleware('can:read-user||read-and-write-user')
    Route.post("/", "Admin/UserController.create").validator("Admin/User/Create").middleware('can:read-and-write-user')
    Route.put("/:id", "Admin/UserController.update").validator("Admin/User/Update").middleware('can:read-and-write-user')
    Route.delete("/:id", "Admin/UserController.destroy").middleware('can:read-and-write-user')
}).prefix("api/admin/user").middleware(['auth:api'])

Route.group(() => {
    Route.get("/", "Admin/CarReviewController.index").validator("Admin/CarReview/Index").middleware('can:read-rating||read-and-write-rating')
    Route.put("/:id", "Admin/CarReviewController.update").validator("Admin/CarReview/Update").middleware('can:read-and-write-rating')
    Route.delete("/:id", "Admin/CarReviewController.destroy").middleware('can:read-and-write-rating')
}).prefix("api/admin/car-review").middleware(['auth:api'])

Route.group(() => { // tính toán dao động
    Route.get("/", "Admin/CarStepPriceController.getAnalysis")
    Route.get("/:id", "Admin/CarStepPriceController.getStepPriceByAttribute")
})
    .prefix("api/admin/car-step-price")
    .middleware(['auth:api', 'can:crawl'])
