
// general errors
var EINTERNAL = -1;
var EARGS = -2;
var EAGAIN = -3;
var ERATELIMIT = -4;
var EFAILED = -5;
var ETOOMANY = -6;
var ERANGE = -7;
var EEXPIRED = -8;

// FS access errors
var ENOENT = -9;
var ECIRCULAR = -10;
var EACCESS = -11;
var EEXIST = -12;
var EINCOMPLETE = -13;

// crypto errors
var EKEY = -14;

// user errors
var ESID = -15;
var EBLOCKED = -16;
var EOVERQUOTA = -17;
var ETEMPUNAVAIL = -18;
var ETOOMANYCONNECTIONS = -19;
var EGOINGOVERQUOTA = -24;

// custom errors
var ETOOERR = -400;

function translate(errno) {
    switch (errno) {
      case 0:
          return "No error";
      case EINTERNAL:
          return "Internal error";
      case EARGS:
          return "Invalid argument";
      case EAGAIN:
          return "Request failed, retrying";
      case ERATELIMIT:
          return "Rate limit exceeded";
      case EFAILED:
          return "Failed permanently";
      case ETOOMANY:
          return "Too many concurrent connections or transfers";
      case ERANGE:
          return "Out of range";
      case EEXPIRED:
          return "Expired";
      case ENOENT:
          return "Not found";
      case ECIRCULAR:
          return "Circular linkage detected";
      case EACCESS:
          return "Access denied";
      case EEXIST:
          return "Already exists";
      case EINCOMPLETE:
          return "Incomplete";
      case EKEY:
          return "Invalid key/Decryption error";
      case ESID:
          return "Bad session ID";
      case EBLOCKED:
          return "Blocked";
      case EOVERQUOTA:
          return "Over quota";
      case ETEMPUNAVAIL:
          return "Temporarily not available";
      case ETOOMANYCONNECTIONS:
          return "Connection overflow";
      case EGOINGOVERQUOTA:
          return "Not enough quota";
      default:
          break;
      }
  return "Unknown error (" + errno + ")";
}

class MegaError extends Error {
  constructor(errorCode) {
    super(translate(errorCode) + ', Code: ' + errorCode);
    this.name = 'MegaError';
  }
}


class MegaAuthenticationError extends Error {
  constructor(msg) {
    super(msg)
    this.name = 'MegaAuthenticationError'
  }
}

class MegaAccountError extends Error {
  constructor(msg, accountEmail) {
    super(msg);
    this.name = 'MegaAccountError';
    this.email = accountEmail;
  }
}

module.exports = {
  MegaError: MegaError,
  MegaAuthenticationError: MegaAuthenticationError,
  MegaAccountError: MegaAccountError,
  EINTERNAL: EINTERNAL,
  EARGS: EARGS,
  EAGAIN: EAGAIN,
  ERATELIMIT: ERATELIMIT,
  EFAILED: EFAILED,
  ETOOMANY: ETOOMANY,
  ERANGE: ERANGE,
  EEXPIRED: EEXPIRED,
  ENOENT: ENOENT,
  ECIRCULAR: ECIRCULAR,
  EACCESS: EACCESS,
  EEXIST: EEXIST,
  EINCOMPLETE: EINCOMPLETE,
  EKEY: EKEY,
  ESID: ESID,
  EBLOCKED: EBLOCKED,
  EOVERQUOTA: EOVERQUOTA,
  ETEMPUNAVAIL: ETEMPUNAVAIL,
  ETOOMANYCONNECTIONS: ETOOMANYCONNECTIONS,
  EGOINGOVERQUOTA: EGOINGOVERQUOTA,
  ETOOERR: ETOOERR
}
