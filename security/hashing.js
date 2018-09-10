const {SHA256} = require('crypto-js');

var message = 'Ganesh';
var hash = SHA256(message).toString();

console.log(`Message: ${message}`);
console.log(`Hash: ${hash}`);


//JSON Web Token(JWT)

//Creating the token

//Original data
var data = {
    id: 4
}

//Token which is sent to client
var token = {
    data,
    hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
}

//Data compromised
// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(token.data)).toString();

//Verifying the token

//Result data
var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();

if(resultHash === token.hash){
    console.log('Data was not changed.');
}
else{
    console.log('Data was changed.')
}