const
    fs = require('fs'),
    path = require('path');

module.exports = (message) => {
    const
        name = new Date().toJSON().split('T')[0] + '.log',
        format = `[${new Date().toLocaleString()}] ${message}\n`;
    fs.appendFile(path.join(__dirname, '../', 'logs', name), format, 'utf-8', () => {
        console.log(format);
    })
};
