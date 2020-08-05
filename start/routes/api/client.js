'use strict'


const Route = use('Route')

Route.get('/', () => {
    return "Hi!"
})

/**
 * AUTH ROUTES
 */
Route.group(() => {
    Route.post("social-login", "AuthController.socialLogin") // Đăng ký/ Đăng nhập với social (Facebook) với accessToken

    Route.post("register", "AuthController.register") // Đăng ký tài khoản
    Route.post("login", "AuthController.login") // Đăng nhập tài khoản với Email - Password
    Route.post("logout", "AuthController.logout").middleware("auth:api") // Đăng xuất toài khoản

    Route.post("change-password", "AuthController.changePassword") // Cập nhật mật khẩu
        .validator("User/ChangePassword")
        .middleware("auth:api")
}).prefix("api/auth")

/**
 * POST ROUTES
 */
Route.group(() => {
    Route.get("/", "PostController.index")
    Route.post("/", "PostController.create").validator("Admin/Post/Create").middleware(['auth:api']) // Tạo bài viết
    Route.get("/primary-posts", "PostController.primaryPosts")
    Route.put("/:slug", "PostController.update").middleware(['auth:api']) // Cập nhật bài viết
    Route.delete("/:slug", "PostController.destroy").middleware(['auth:api']) // Xóa bài viết

    Route.get("/features", "PostController.features") // Bài viết nổi bật
    Route.get("/:slug", "PostController.show") // Lấy thông tin một bài viết
    //
    Route.post("/uploadImageByUrl", "PostController.uploadImageByUrl") // Upload ảnh từ url
    Route.post("/uploadImage", "PostController.uploadImage") // Upload ảnh
}).prefix("api/post")

/**
 * POST CATEGORIES ROUTE
 */
Route.group(() => {
    Route.get("/", "PostCategoryController.index") // Lấy danh sách chủ đề bài viết
}).prefix("api/post-category")

/**
 * COMMENT ROUTE
 */
Route.group(() => {
    Route.get("/:post_id", "PostCommentController.index") // xem list comment 1 bài
    Route.post("/", "PostCommentController.create").middleware(['auth:api'])
    Route.get("reply/:id", "PostCommentController.getReplies").middleware(['auth:api']) // xem trả lời comment
    Route.put("/:id", "PostCommentController.update").middleware(['auth:api'])
    Route.delete("/:id", "PostCommentController.destroy").middleware(['auth:api']) // xóa cứng
}).prefix("api/comment")

/**
 * SITEMAP ROUTES (SEO)
 */
Route.group(() => {
    Route.get("/sitemap", "SeoController.sitemap") // Lấy sitemap của website
    Route.get("/car-value-thumbnail", "SeoController.carValueThumbnail") // Render ảnh Thumbnail cho car value item
}).prefix("api/seo")


Route.group(() => {
    Route.get("/", "CarReviewController.index").validator("CarReview/IndexOrStatistic")// Lấy rating tổng quát của search
    Route.get("/statistic", "CarReviewController.statistic").validator("CarReview/IndexOrStatistic")// Lấy trung bình rating của search theo user
    Route.get("/user", "CarReviewController.getReviewByUser").middleware("auth:api")
    Route.post("/", "CarReviewController.create").validator("CarReview/Create").middleware("auth:api")
    Route.put("/:id", "CarReviewController.update").validator("CarReview/Update").middleware("auth:api")
    Route.delete("/:id", "CarReviewController.destroy").middleware("auth:api")
}).prefix("api/car-review")

Route.group(() => {
    Route.get("/", "CarResultHistoryController.index").validator("CarResultHistory/Index")
    Route.get("/:id", "CarResultHistoryController.show") // xem chi tiết kết quả định giá và xe
    Route.delete("/:id", "CarResultHistoryController.destroy")
}).middleware("auth:api").prefix("api/car-result-history")

Route.group(() => {
    Route.get("/", "CarBrandController.index") // lấy hãng bên trang chủ
}).prefix("api/brand")

Route.group(() => {
    Route.get("/", "CarModelController.index").validator("CarModel/Index") // lấy dòng xe theo hãng bên trang chủ
}).prefix("api/model")

Route.group(() => {
    Route.get("/", "YearController.index").validator("Year/Index") // lấy năm theo brand + model slug
}).prefix("api/year")

Route.group(() => {
    Route.get("/", "CarTypeController.index").validator("CarType/Index") // lấy loại xe theo hãng, dòng xe... bên trang chủ (suv, sedan...)
    Route.get("/all", "CarTypeController.getAll")
}).prefix("api/car-type")

Route.group(() => {
    Route.get("/", "CarAttributeController.index").validator("CarAttribute/Index") // lấy attribute theo brand, model, car type, year
}).prefix("api/attribute")

Route.group(() => { // hàm định giá xe
    Route.get("/", "CarValueController.index").validator("CarValue")
    // Route.get("/result-image/:data", "CarValueController.getResultImage")

}).prefix("api/car-value")

Route.group(() => {
    Route.get("/:id", "CarController.show") // xem chi tiết xe theo ID

}).prefix("api/car")

Route.group(() => {
    Route.get("/:id", "CarStepPriceController.getStepPriceByAttribute") // danh sách bước giá theo attribute_id các năm
}).prefix("api/car-step-price")
