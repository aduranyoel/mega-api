const sjcl = require('sjcl');
const atob = require('atob');
const asmCrypto = require('./../vendor/asmcrypto.js');
const crypto = require('crypto');

var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=";
var b64a = b64.split('');

function stringToA32(b) {
    var a = Array((b.length + 3) >> 2);
    for (var i = 0; i < b.length; i++) {
        a[i >> 2] |= (b.charCodeAt(i) << (24 - (i & 3) * 8));
    }
    return a;
}


function a32ToBase64(a32)
{
    return base64UrlEncode(a32ToString(a32));
}
function a32ToString(a) {
    var b = '';

    for (var i = 0; i < a.length * 4; i++) {
        b = b + String.fromCharCode((a[i >> 2] >>> (24 - (i & 3) * 8)) & 255);
    }

    return b;
}
function base64UrlEncode(data) {
  if (typeof btoa === 'function') {
      return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
      ac = 0,
      enc = "",
      tmp_arr = [];

  do {
      o1 = data.charCodeAt(i++);
      o2 = data.charCodeAt(i++);
      o3 = data.charCodeAt(i++);

      bits = o1 << 16 | o2 << 8 | o3;

      h1 = bits >> 18 & 0x3f;
      h2 = bits >> 12 & 0x3f;
      h3 = bits >> 6 & 0x3f;
      h4 = bits & 0x3f;


      tmp_arr[ac++] = b64a[h1] + b64a[h2] + b64a[h3] + b64a[h4];
  } while (i < data.length);

  enc = tmp_arr.join('');
  var r = data.length % 3;
  return (r ? enc.slice(0, r - 3) : enc);
}
function base64UrlDecode(data) {
  data += '=='.substr((2 - data.length * 3) & 3)

  data = data.replace(/\-/g, '+').replace(/_/g, '/').replace(/,/g, '');
  try {
    return atob(data);
  }
  catch (e) {
    return '';
  }
}
function base64ToA32(b64)
{
  return stringToA32(base64UrlDecode(b64));
}
function stringHash(str, aes) {
    var s32 = stringToA32(str);
  var h32 = [0, 0, 0, 0];
  var i;

  for (i = 0; i < s32.length; i++) {
      h32[i & 3] ^= s32[i];
  }

  for (i = 16384; i--;) {
      h32 = aes.encrypt(h32);
  }

  return a32ToBase64([h32[0], h32[2]]);
}
function rsaDecrypt(ciphertext, privkey)
{
  var l = (ciphertext.charCodeAt(0) * 256 + ciphertext.charCodeAt(1) + 7) >> 3;
   ciphertext = ciphertext.substr(2, l);

   var cleartext = asmCrypto.bytes_to_string(asmCrypto.RSA_RAW.decrypt(ciphertext, privkey));
   if (cleartext.length < privkey[0].length) {
       cleartext = Array(privkey[0].length - cleartext.length + 1).join(String.fromCharCode(0)) + cleartext;
   }

   if (cleartext.charCodeAt(1) !== 0) {
       cleartext = String.fromCharCode(0) + cleartext;
   }

   return cleartext.substr(2);
}
function command(command, args)
{
  return [
    {
      a: command,
      ...args
    }
  ]
}

module.exports = {
  stringToA32: stringToA32,
  a32ToBase64: a32ToBase64,
  a32ToString: a32ToString,
  base64UrlEncode: base64UrlEncode,
  base64UrlDecode: base64UrlDecode,
  base64ToA32: base64ToA32,
  stringHash: stringHash,
  rsaDecrypt: rsaDecrypt,
  command: command
}
