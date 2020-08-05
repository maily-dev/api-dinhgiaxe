'use strict'

const BaseExceptionHandler = use('BaseExceptionHandler')

/**
 * This class handles all exceptions thrown during
 * the HTTP request lifecycle.
 *
 * @class ExceptionHandler
 */
class ExceptionHandler extends BaseExceptionHandler {
  /**
   * Handle exception thrown during the HTTP lifecycle
   *
   * @method handle
   *
   * @param  {Object} error
   * @param  {Object} options.request
   * @param  {Object} options.response
   *
   * @return {void}
   */
  async handle(error, { request, response }) {
    const code = error.code
    switch (code) {
      case 'E_INVALID_JWT_TOKEN':
        return response.status(401).json({
          success: false,
          code: code,
          message: 'Unauthorized'
        })
      case 'E_INVALID_API_TOKEN':
        return response.status(401).json({
          success: false,
          code: code,
          message: 'Unauthorized'
        })
      case 'E_MISSING_DATABASE_ROW':
        return response.status(422).json({
          success: false,
          code: code,
          message: 'Model Not Found'
        })
      case 'E_INVALID_PARAMETER':
        return response.status(422).json({
          success: false,
          code: code,
          message: 'INVALID LOGIN PROVIDER'
        })
      case 'E_ROUTE_NOT_FOUND':
        return response.status(404).json({
          success: false,
          code: code,
          message: '404 Not Found'
        })
      case 'E_INVALID_MAKE_STRING':
        return response.json({
          code: code,
          success: false,
          message: 'Request method is not correct'
        })
      case 'E_VALIDATION_FAILED':
        return response.status(422).json({
          success: false,
          code: code,
          message: error.messages
        })
      case 'ECONNREFUSED':
        return response.status(500).json({
          success: false,
          code: code,
          message:
            'Can not connect to database. Please contact with Administrator.'
        })
      case 'ForbiddenException':
        return response.status(403).json({
          success: false,
          code: code,
          message:
            'You might not have the necessary permissions to this request'
        })
      case 'CarBrandNotFound':
        return response.status(422).json({
          success: false,
          code: code,
          message:
            'Hãng xe không tồn tại'
        })
      default:
        return super.handle(...arguments)
    }
  }

  /**
   * Report exception for logging or debugging.
   *
   * @method report
   *
   * @param  {Object} error
   * @param  {Object} options.request
   *
   * @return {void}
   */
  async report(error, { request }) {
  }
}

module.exports = ExceptionHandler
