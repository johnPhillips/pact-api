/*eslint key-spacing: 0 camelcase: 0*/

import request from 'superagent';
import invariant from 'invariant';

/*
 * Example usage:
 *
 * ```js
 *  var api = new PactAPI('my api basepath');
 *  api.login(email, password).then(function(response){
 *    // Login was succesful!
 *  });
 * ```
 */
export default class PactAPI {
  constructor({base}) {
    this.base = base;
    this.accessToken = null;
    this._getEndpoints = this._getEndpoints.bind(this);
  }

  _getEndpoints() {
    return {
      USERS:    `${this.base}/users`,
      PRODUCTS: `${this.base}/products`,
      LOGIN:    `${this.base}/auth/login`,
      LOGOUT:   `${this.base}/auth/logout`
    };
  }

  // Private API: convenience request methods
  _get(url, callback) {
    const req = request.get(url);
    if (this.accessToken) {
      req.set('Authorization', this.accessToken);
    }
    req.end(callback);
  }
  _post(url, payload, callback) {
    const req = request.post(url);
    if (this.accessToken) {
      req.set('Authorization', this.accessToken);
    }
    req.type('form')
      .send(payload)
      .end(callback);
  }
  _put(url, payload, callback) {
    const req = request.put(url);
    if (this.accessToken) {
      req.set('Authorization', this.accessToken);
    }
    req.send(payload)
      .end(callback);
  }
  _del(url, callback) {
    const req = request.del(url);
    if (this.accessToken) {
      req.set('Authorization', this.accessToken);
    }
    req.end(callback);
  }

  /*
   * Set the `access_token` to be used on all requests.
   *
   * An `access_token` will be in the response to a successful `login`. If you
   * wish to perform auth-requiring requests, you need to manually set the
   * access token with this method.
   */
  setAccessToken(token) {
    invariant(token, `PactAPI.setAccessToken(...): You must supply a valid token`);
    this.accessToken = token;
  }

  /*
   * Set the base URL to be used by the instance.
   */
  setBase(base) {
    invariant(base, `PactAPI.setBase(...): You must supply a base`);
    this.base = base;
  }

  /* Log a user in */
  login(login, password) {
    invariant(
      login && password,
      `PactAPI.login(...): You must supply a valid login and password.
      You passed "${login}" and "${password}".`
    );

    const {_getEndpoints} = this;
    const _post = this._post.bind(this);
    return new Promise((resolve, reject) => {
      _post(_getEndpoints().LOGIN, {
        login,
        password
      }, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({
          ...res.body,
          user_id: `${res.body.user_id}` // kinda hacky but we need a string
        });
      });
    });
  }

  /* Log a user out */
  logout(access_code) {
    invariant(
      access_code,
      `PactAPI.logout(...): You must supply a valid access code.
      You passed "${access_code}".`
    );

    const {_getEndpoints} = this;
    const _post = this._post.bind(this);
    return new Promise((resolve, reject) => {
      _post(
        _getEndpoints().LOGOUT,
        {access_code},
        (err, res) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(res.body);
        }
      );
    });
  }

  /* Get all the orders for a user */
  getOrders(userId) {
    invariant(
      userId,
      `PactAPI.getOrders(...): You must supply a valid user ID.
      You passed "${userId}".`
    );

    const {_getEndpoints} = this;
    const _get = this._get.bind(this);
    return new Promise((resolve, reject) => {
      _get(`${_getEndpoints().USERS}/${userId}/orders`, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res.body);
      });
    });
  }

  /*
   * Update the dispatch date for an order.
   * `yearMonthDayString` is in the format of `YYYY-MM-DD`.
   */
  updateOrderDispatchDate({userId, orderId, yearMonthDayString}) {
    invariant(
      userId && orderId && yearMonthDayString,
      `PactAPI.getOrders(...): You must supply valid arguments.
      You passed "${userId}", "${orderId}", and "${yearMonthDayString}".`
    );
    invariant(
      yearMonthDayString.split('-').length === 3,
      `PactAPI.updateOrderDispatchDate(...): You must supply a valid yearMonthDayString with the signature YYYY-MM-DD.`
    );

    const {_getEndpoints} = this;
    const _put = this._put.bind(this);
    return new Promise((resolve, reject) => {
      _put(
        `${_getEndpoints().USERS}/${userId}/orders/${orderId}`,
        {
          'order[dispatch_date]': yearMonthDayString
        },
        (err, res) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(res.body);
        }
      );
    });
  }

  /*
   * Update the preparation (grind) or coffee ID for an order.
   */
  updateOrderCoffee({userId, orderId, itemId, productId, coffeeId, preparation}) {
    const {_getEndpoints} = this;
    const {USERS} = _getEndpoints();
    const _put = this._put.bind(this);
    return new Promise((resolve, reject) => {
      _put(
        `${USERS}/${userId}/orders/${orderId}/items/${itemId}`,
        {
          'item[product_attributes][id]': productId,
          'item[product_attributes][options][preparation]': preparation,
          'item[product_attributes][options][coffee_type_id]': coffeeId
        },
        (err, res) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(res.body);
        }
      );
    });
  }

  /* Fetch all the products */
  getProducts() {
    const {_getEndpoints} = this;
    const _get = this._get.bind(this);
    return new Promise((resolve, reject) => {
      _get(
        _getEndpoints().PRODUCTS,
        (err, res) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(res.body);
        }
      );
    });
  }

}

