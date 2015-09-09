/*eslint key-spacing: 0 camelcase: 0*/

import invariant from 'invariant';
import HTTPRequestable from './HTTPRequestable';

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
export default class PactAPI extends HTTPRequestable {
  constructor(base, token) {
    super(token);
    this.base = base;
    this._getEndpoints = this._getEndpoints.bind(this);
  }

  _getEndpoints() {
    return {
      LOGIN:  `${this.base}/tokens/`,
      LOGOUT: `${this.base}/tokens/me`
    };
  }

  /*
   * Set the base URL to be used by the instance.
   */
  setBase(base) {
    invariant(base, `PactAPI.setBase(...): You must supply a base`);
    this.base = base;
  }

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
}

