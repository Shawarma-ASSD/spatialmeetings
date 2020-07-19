/**
 * HTTPClient
 * Static class to perform asynchronous HTTP Requests
 */
class HTTPClient {
    /**
     * postJSON
     * Performs asynchronous HTTP POST request using a JSON Object and returns
     * its result parsed into a JSON.
     * @param {string} url 
     * @param {Object} data
     */
    static async postJSON(url, data) {
        console.log("POST ", url, data);
        let response = await this.post(url, 
            JSON.stringify(data),
            { 
                'Content-type': 'application/json; charset=UTF-8' 
            }
            );
        return await response.json();
    }

    /**
     * getJSON
     * Returns JSON parsed result of an asynchronous HTTP GET request.
     * @param {string} url
     */
    static async getJSON(url) {
        console.log("GET ", url);
        let response = await this.get(url);
        return await response.json();
    }

    /**
     * post
     * Performs asynchronous HTTP POST request and returns its
     * result.
     * @param {string} url: URL Address
     * @param {string} body: data field to be sent
     * @param {Object} headers: request's header 
     */
    static async post(url, body, headers) {
        return await fetch(url, 
            {
                method: 'POST',
                body: body,
                headers: headers
            });
    }

    /**
     * get
     * Returns result of an asynchronous HTTP GET request.
     * @param {string} url: URL Address
     */
    static async get(url) {
        return await fetch(url);
    }
}

module.exports = {
    HTTPClient
};