class ApiResponse {

    constructor(success, data, message = null) {
        this.success = success;
        this.data = data;
        this.message = message;
    }

}

module.exports = ApiResponse;