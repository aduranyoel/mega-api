const UserSession = require('./api/UserSession.js');
const rp = require('request-promise');
var sess = new UserSession();
sess.login('supervault002@protonmail.com', 'bRWnAU2BUmNM5jJp')
.catch((err) => {
  throw err;
})
.then((response) => {
});
