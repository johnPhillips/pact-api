import PactResource from '../PactResource';
import pactMethod from '../pactMethod';
import methodTypes from '../methodTypes';

export default class Users extends PactResource {
  constructor(pactAPI) {
    const path = '/users';

    const methods = {
      create: pactMethod({
        method: methodTypes.POST,
      }),

      changePassword: pactMethod({
        method: methodTypes.PATCH,
        urlParams: ['user_id'],
        path: '{user_id}/password',
      }),

      pauseMe: pactMethod({
        method: methodTypes.PATCH,
        path: 'me/pause',
      }),

      activateMe: pactMethod({
        method: methodTypes.PATCH,
        path: 'me/activate',
      }),
    };

    super({pactAPI, path, methods});
  }
}
