import Configs from '../config/Configs';
import AuthenticationService from './Authenticatonservice';
import CustomerAuthenticationService from './CustomerAuthenticationservice';
import axios from "axios";
class APIService {
  BASE_URL = Configs.apiurl;
  GATEWAY_URL = Configs.gateway_url;


  //Perform Get requests
  async makeApiGetRequest(url) {
    let api_result = null;
    const headerParams = await this._buildHeader();
    const request = {
      method: "GET",
      headers: headerParams
    };
    let response = await fetch(this.BASE_URL + url, request)
      .then(this._parseResponse.bind(this))
      .then(this._parseServerJsonResponse.bind(this))
      .catch(this._handleNetworkCode.bind(this));
    return response;
  }

  //Perform post requests
  async makePostRequest(url, body) {
    // var myHeaders = new Headers();
    //myHeaders.append("Content-Type", "application/json");
    //myHeaders.append("Access-Control-Allow-Origin", "*");
    const headerParams = await this._buildHeader();
    const request = {
      method: "POST",
      redirect: 'follow',
      headers: headerParams,


    };
    if (body != null) {
      request["body"] = JSON.stringify(body);
    }

    let response = await fetch(this.BASE_URL + url, request)
      .then(this._parseResponse.bind(this))
      .then(this._parseServerJsonResponse.bind(this))
      .catch(this._handleNetworkCode.bind(this));

    return response;
  }
  async refreshGatewayRequest(url, body) {

    const request = {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },

    };
    if (body != null) {
      request["body"] = JSON.stringify(body);
    }

    let response = await fetch(this.GATEWAY_URL + url, request)
      .then(this._parseResponse.bind(this))
      .then(this._parseServerJsonResponse.bind(this))
      .catch(this._handleNetworkCode.bind(this));

    return response;
  }

  async makePostUploadRequest(url, formData) {

    const request = {
      method: "POST",
      body: formData,
      redirect: 'follow'
    };


    let response = await fetch(this.BASE_URL + url, request)
      .then(this._parseResponse.bind(this))
      .then(this._parseServerJsonResponse.bind(this))
      .catch(this._handleNetworkCode.bind(this));

    return response;
  }

  uploadFile = async (url, body) => {
    let builtUrl = await (this.BASE_URL + url);

    const token = (await AuthenticationService.getUser().data.jwtToken) || (await CustomerAuthenticationService.getCustomer().data.jwtToken) || "";
    
    let response = axios
      .post(builtUrl, body, {
        headers: {
          Authorization: `CustBearer ${token}`
        },
        timeout: 600000
      })
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        return error;
      });

    return response;
  };
  _parseResponse(response) {
    if (!response.ok) {
      var contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        try {
          return response.json();
        } catch (e) { }
      } else {

        return {
          success: false,
          message:
            "Response content type is not understandable. Please contact administrator",
          status: 403
        };
      }
    } else {
      var contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          return response.json();
        } catch (e) { }
      } else {

        return {
          success: false,
          message:
            "Response content type is not understandable. Please contact administrator",
          status: 403
        };
      }
    }
  }
  /**
 * @param {*} response
 */
  _parseResponse(response) {
    if (!response.ok) {

      var contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        try {
          return response.json();
        } catch (e) { }
      } else {

        return {
          success: false,
          message:
            "Response content type is not understandable. Please contact administrator",
          status: 403
        };
      }
    } else {
      var contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          return response.json();
        } catch (e) { }
      } else {

        return {
          success: false,
          message:
            "Response content type is not understandable. Please contact administrator",
          status: 403
        };
      }
    }
  }
  /**
  *
  * @param {*} error
  * @param {*} data
  */
  _handleNetworkCode(error) {

    return { success: false, message: "Network error. Please confirm your internet connection", status: 403 };
  }
  _parseServerJsonResponse(data) {
    return data || {};
  }
  /**
   *
   * @param {*} data
   */


  _buildAPIURL(url) {
    return this.BASE_URL + url;
  }
  async _buildHeader() {
    let token = (await AuthenticationService.getUser().data.jwtToken) || "";
    let bearerProfile = "SysBearer";
      return {
        "Content-Type": "application/json",
        accept: "application/json",
        "cache-control": "no-cache",
        pragma: "no-cache",
        Authorization: `${bearerProfile} ${token}`

      }
    
  }
}
export default new APIService();