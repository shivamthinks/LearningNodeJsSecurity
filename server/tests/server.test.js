//NodeJs and third party modules
const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

//Custom created modules
const { app } = require('./../server.js');
const { Todo } = require('./../models/todomodel.js');

const todos = [
    {
        _id: new ObjectID(),
        text: 'First test todo.'
    },
    {
        _id: new ObjectID(),
        text: 'Second test todo.',
        completed: true,
        completedAt: 333
    }
];

//This code will run before every testcase. This is added to remove the documents in the collection before the below test case runs because we are asserting the count of records in Todo collection.
//beforeEach((done) => {
//    Todo.deleteMany({})
//        .then(() => {
//            done();
//        });
//});

//This code will run before every testcase. This is added to remove the documents in the collection before the below test case runs because we are asserting the count of records in Todo collection.
beforeEach((done) => {
    Todo.deleteMany({})
        .then(() => {
            return Todo.insertMany(todos);
        })
        .then(() => {
            done();
        });
});

describe('POST /todos', () => {

    it('should create a new todo', (done) => {
        var text = 'Test Todo text';

        request(app)
            .post('/todos')
            .send({ text }) //This will send javascript object and convert it to JSON which will again be converted back to object by body-parser in server.js.
            .expect(200)
            .expect((response) => {
                expect(response.body.text).toBe(text);
            })
            .end((error, response) => { //Here done is not passed because database needs to be verified with count of documents inserted and the document inserted.
                if (error) {
                    return done(error);
                }

                Todo.find({ text })
                    .then((documents) => {
                        expect(documents.length).toBe(1); //Verifying count of documents in database.
                        expect(documents[0].text).toBe(text); //Verifying the document inserted into the database.
                        done();
                    })
                    .catch((error) => {
                        done(error);
                    });
            });
    });

    it('should not create a new todo with invalid data', (done) => {

        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((error, response) => { //Here done is not passed because database needs to be verified with count of documents inserted and the document inserted.
                if (error) {
                    return done(error);
                }

                Todo.find()
                    .then((documents) => {
                        expect(documents.length).toBe(2); //Verifying count of documents in database.
                        done();
                    }).catch((error) => {
                        done(error);
                    });
            });
    });

});

describe('GET /todos', () => {

    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((response) => {
                expect(response.body.documents.length).toBe(2);
                expect(response.body.documents[0].text).toBe(todos[0].text);
                expect(response.body.documents[1].text).toBe(todos[1].text);
            })
            .end(done);
    });

});

describe('GET /todos/:id', () => {

    it('should return todo document', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((response) => {
                expect(response.body.documents.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return a 404 if todo not found', (done) => {
        request(app)
            .get(`/todos/${new ObjectID().toHexString()}`)
            .expect(404)
            .expect((response) => {
                expect(response.body.documents).toBe();
            })
            .end(done);
    });

    it('should return a 404 for invalid object id', (done) => {
        request(app)
            .get('/todos/123')
            .expect(404)
            .expect((response) => {
                expect(response.body.documents).toBe();
            })
            .end(done);
    });

});

describe('DELETE /todos:id', () => {

it('should remove a todo', (done) => {
    var hexId = todos[1]._id.toHexString();

    request(app)
        .delete(`/todos/${hexId}`)
        .expect(200)
        .expect((response) => {
            expect(response.body.documents._id).toBe(hexId);
        })
        .end((error, response) => {
            if (error){
                return done(error); 
            }

            Todo.findById(hexId)
                .then((documents) => {
                    expect(documents).toNotExist();
                    done();
                })
                .catch((error) => {
                    done(error);
                });
        });
    });

it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
        .delete(`/todos/${hexId}`)
        .expect(404)
        .expect((response) => {
            expect(response.body.documents).toBe();
        })
        .end(done);
    });

it('should return 404 if invalid ObjectID', (done) => {
    request(app)
        .delete('/todos/123')
        .expect(404)
        .expect((response) => {
            expect(response.body.documents).toBe();
        })
        .end(done);
    });

});

describe('PATCH /todos:id', () => {
    
it('should update the todo', (done) => {
    var hexId = todos[0]._id.toHexString();
    var text = 'The text is updated for first todo through a testcase.'
    
    request(app)
    .patch(`/todos/${hexId}`)
    .send({ 
        text: text, 
        completed: true
    })
    .expect(200)
    .expect((response) => {
        expect(response.body.documents.text).toBe(text);
        expect(response.body.documents.completed).toBe(true);
        expect(response.body.documents.completedAt).toBeA('number');
    })
    .end(done);
});

it('should clear completedAt when todo is not completed', (done) => {
    var hexId = todos[1]._id.toHexString();
    var text = 'The text is updated for second todo through a testcase.'

    request(app)
    .patch(`/todos/${hexId}`)
    .send({
        text: text,
        completed: false
    })
    .expect(200)
    .expect((response) => {
        expect(response.body.documents.text).toBe(text);
        expect(response.body.documents.completed).toBe(false);
        expect(response.body.documents.completedAt).toNotExist();
    })
    .end(done);
});

it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();
        
    request(app)
        .patch(`/todos/${hexId}`)
        .expect(404)
        .expect((response) => {
            expect(response.body.documents).toBe();
        })
        .end(done);
});
        
it('should return 404 if invalid ObjectID', (done) => {
    request(app)
        .patch('/todos/123')
        .expect(404)
        .expect((response) => {
            expect(response.body.documents).toBe();
        })
        .end(done);
    });

});