const utils = require('./utils.js');
const Promise = require('bluebird');
const request = require('request-promise');
const sjcl = require('sjcl');
const error = require('./error.js');
const asmCrypto = require('./../vendor/asmcrypto.js');


function decryptKey(cipher, a) {
    if (a.length == 4) {
        return cipher.decrypt(a);
    }

    var x = [];
    for (var i = 0; i < a.length; i += 4) {
        x = x.concat(cipher.decrypt([a[i], a[i + 1], a[i + 2], a[i + 3]]));
    }
    return x;
}
function userHandle(email, password)
{
  var pw = utils.stringToA32(password);

  var aes = [];
  var prepared = [0x93C467E3, 0x7DB0C7A4, 0xD1BE3F81, 0x0152CB56];

  for (var j = 0; j < pw.length; j += 4) {
    var key = [0, 0, 0, 0];
    for (var i = 0; i < 4; i++) {
      if (i + j < pw.length) {
        key[i] = pw[i + j];
      }
    }
    aes.push(new sjcl.cipher.aes(key));
  }
  for (r = 65536; r--;) {
    for (j = 0; j < aes.length; j++) {
      prepared = aes[j].encrypt(prepared);
    }
  }
  var passwordaes = new sjcl.cipher.aes(prepared);
  return [passwordaes, utils.stringHash(email.toLowerCase(), passwordaes)];
}

module.exports = function(email, password) {
  var rets = userHandle(email, password);
  var uh = rets[1];
  var options = this._prototypeRequest('/cs');
  options.body = utils.command('us', {
    uh: uh,
    user: email
  });
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  options.proxy = 'http://127.0.0.1:8888';
  return request(options)
    .then((response) => {
      if(typeof response.body[0] === 'number')
      {
        var code = response.body[0];
        switch(code)
        {
          case error.EINCOMPLETE:
          throw new error.MegaAccountError('This account has not completed registration', email);
          break;
          case error.ENOENT:
          throw new error.MegaAuthenticationError('Invalid username and/or password');
          break;
          default:
          throw new error.MegaError(code);
          break;
        }
      }
      else {
        var aes = rets[0];
        var res = response.body[0];
        var k = utils.base64ToA32(res.k);
        k = decryptKey(aes, k);
        aes = new sjcl.cipher.aes(k);

        if(typeof res.csid === 'string')
        {
          var t = utils.base64UrlDecode(res.csid);
          var privk = utils.a32ToString(decryptKey(aes, utils.base64ToA32(res.privk)));

          var privkey = [];

          for (var i = 0; i < 4; i++) {
                  if (privk.length < 2) {
                      break;
                  }

                  var l = (privk.charCodeAt(0) * 256 + privk.charCodeAt(1) + 7) >> 3;
                  if (l > privk.length - 2) {
                      break;
                  }

                  privkey[i] = new asmCrypto.BigNumber(privk.substr(2, l));
                  privk = privk.substr(l + 2);
          }
          var q = privkey[0],
           p = privkey[1],
           d = privkey[2],
           u = privkey[3],
           q1 = q.subtract(1),
           p1 = p.subtract(1),
           m = new asmCrypto.Modulus(p.multiply(q)),
           e = new asmCrypto.Modulus(p1.multiply(q1)).inverse(d),
           dp = d.divide(p1).remainder,
           dq = d.divide(q1).remainder;

           privkey = [m, e, d, p, q, dp, dq, u];
           for (i = 0; i < privkey.length; i++) {
               privkey[i] = asmCrypto.bytes_to_string(privkey[i].toBytes());
           }

           this._k = k;
           this._privateKey = privkey;
           this._sid = utils.base64UrlEncode(utils.rsaDecrypt(t, privkey).substr(0, 43));
           this._isLoggedIn = true;

           options = this._prototypeRequest('/cs');
           options.body = utils.command('ug');
           return request(options);
        }
      }
    })
    .then((response) => {
      this._attrs = response.body;
      this._u = response.body.u;
      return this;
    });
}
