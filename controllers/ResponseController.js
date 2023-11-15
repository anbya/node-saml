class ResponseController {
  constructor() {
    this.meta = { status: 200, success: true, message: "Success" };
    this.data = {};
    this.pagination = { page: 1, perPage: 10, total: 0 };
    this.message = null;
  }

  setStatus(status) {
    this.meta.status = status;
    return this;
  }

  setSuccess(success) {
    this.meta.success = success;
    return this;
  }

  setMessage(message) {
    this.meta.message = message;
    return this;
  }

  setData(data) {
    this.data = data.rows ? data.rows : data;
    return this;
  }

  setPagination(pagination) {
    this.pagination = pagination;
    return this;
  }

  setPage(page) {
    this.pagination.page = page;
    return this;
  }

  setLimit(limit) {
    this.pagination.limit = limit;
    return this;
  }

  setTotal(total) {
    this.pagination.total = total;
    return this;
  }

  setExtra(extra) {
    this.extra = extra;
    return this;
  }

  setDataMessage(message) {
    this.message = message;
    return this;
  }

  build() {
    if(this.message == null){
      return {
        data: this.data,
        pagination: this.pagination,
      };
    } else {
      return {
        data: this.data,
        message: this.message,
        pagination: this.pagination,
      };
    }
  }
}

module.exports = ResponseController;
