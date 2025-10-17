export class ApiResponse {
  static success(data, message = "Success", statusCode = 200) {
    return {
      success: true,
      message,
      data,
      statusCode,
    };
  }

  static error(message = "Error", statusCode = 500, errors = null) {
    return {
      success: false,
      message,
      errors,
      statusCode,
    };
  }

  static pagination(data, page, limit, total) {
    return {
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }
}
