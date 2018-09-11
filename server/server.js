require('./config/config.js');

var port = process.env.PORT;

//NodeJs and third party modules
const express = require('express');
const bodyParser = require('body-parser'); //This takes the JSON and converts it into object.
const { ObjectID } = require('mongodb');
const _ = require('lodash');

//Custom created modules
const { mongoose } = require('./db/mongooseconfig.js');
const { Todo } = require('./models/todomodel.js');
const { User } = require('./models/usermodel.js');
const { authenticate } = require('./middleware/authenticate.js');

var app = express();

//This takes JSON which is sent in the body through client and converts it into object and attaches it to request object.
app.use(bodyParser.json());

app.post('/todos', (request, response) => {
    var todo = new Todo(request.body);

    todo.save()
        .then((document) => {
            response.send(document);
        })
        .catch((error) => {
            response.status(400).send(error);
        });
});

app.get('/todos', (request, response) => {
    Todo.find()
        .then((documents) => {
            response.send({ documents });
        })
        .catch((error) => {
            response.status(400).send(error);
        });
});

app.get('/todos/:id', (request, response) => {
    var id = request.params.id;

    if (!ObjectID.isValid(id)) {
        return response.status(404).send();
    }

    Todo.findById(id)
        .then((documents) => {
            if (!documents) {
                return response.status(404).send();
            }

            response.send({ documents });
        })
        .catch((error) => {
            response.status(400).send();
        });
});

app.delete('/todos/:id', (request, response) => {
    var id = request.params.id;
    if(!ObjectID.isValid(id)){
        return response.status(404).send();
    }

    Todo.findByIdAndRemove(id)
    .then((documents) => {
        if(!documents){
            return response.status(404).send();
        }
    
        response.send({ documents });
    })
    .catch((error) => {
        response.status(400).send();
    });
});

app.patch('/todos/:id', (request, response) => { //patch method is used for update
    var id = request.params.id;

    //Here, user should not be allowed to update completedAt. completedAt should automatically get updated based in completed field. If completed is true, then completedAt should set to current date, else it should set to null.
    //To restrict user from updating other fields apart from text and completed, _.pick method is used.
    //_.pick method picks only those fileds which are passed as the arguments. If user sends other fields also, those won't be picked for updating.
    //Here, fields which are passed in the arguments are picked and an object is created which will be save to database.
    var bodyToUpdate = _.pick(request.body, ['text', 'completed']);

if(!ObjectID.isValid(id)){
    return response.status(404).send();
}

if(_.isBoolean(bodyToUpdate.completed) && bodyToUpdate.completed){
    bodyToUpdate.completedAt = new Date().getTime(); //getTime() method returns javascript timestamp in number format. If it is a positive number, then it is after 1st January, 1970, else it is before 1st January, 1970. 
}
else{
    bodyToUpdate.completed = false;
    bodyToUpdate.completedAt = null;
}

Todo.findByIdAndUpdate(
        id, //record identifier which has to be updated
        {$set: bodyToUpdate}, //updated object
        {new: true} //options
    )
    .then((documents) => {
        if(!documents){
            return response.status(404).send();
        }

        response.send( {documents} );
    })
    .catch((error) => {
        response.status(400).send(error);
    });

});

//POST /users
app.post('/users', (request, response) => {
    var body = _.pick(request.body, ['email', 'password']);
    var user = new User(body);

    user.save()
    .then((user) => {
        return user.generateAuthToken();
    })
    .then((token) => {
        response.header('x-auth', token).send(user);
    })
    .catch((error) => {
        response.status(400).send(error);
    })
});

app.get('/users/me', authenticate, (request, response) => {
    response.send(request.user);
});

app.listen(port, () => {
    console.log(`Started server at ${port}.`);
});

//Exported for testing.
module.exports = {app};