



const MEGA_API_URL = 'https://g.api.mega.co.nz';

class UserSession
{
  constructor() {
    this._seqID = -Math.floor(Math.random() * 0x100000000);
    this._isLoggedIn = false;
  };
  _prototypeRequest(path) {
    var options = {
      method: 'POST',
      uri: MEGA_API_URL + path,
      json: true,
      resolveWithFullResponse: true,
      qs: {
        id: this._seqID++
      },
      headers: {
        'User-Agent' : 'mega-api'
      }
    };
    if(this._isLoggedIn) {
      options.qs.sid = this._sid;
    }
    return options;
  }
}

UserSession.prototype.login = require('./login.js');

module.exports = UserSession;
