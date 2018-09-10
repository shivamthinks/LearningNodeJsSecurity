const jwt = require('jsonwebtoken');

var data = {
    id: 10
}

var token = jwt.sign(data, 'ganesh');
console.log(token);

var decoded = jwt.verify(token, 'ganesh')
console.log(decoded);
