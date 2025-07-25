// require.main.filename: gives the full path of the main module 
// //that started the app (usually app.js or server.js).
const path = require('path');
module.exports = path.dirname(require.main.filename);