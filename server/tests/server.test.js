const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const { todos, populateTodos ,populateUsers,users} = require('./seed/seed');



beforeEach(
    populateUsers
);
beforeEach(
    populateTodos
);

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({ text })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({ text }).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });
    });
});

describe('Get /todos', () => {
    it('Shoud get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });


});


describe('Get /todos/:id', () => {
    it('Shoud returnd tood doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('Shoud returnd 404 not fine doc', (done) => {
        var hexId = new ObjectID().toHexString()
        request(app)
            .get(`/todos/${hexId}`)
            .expect(404)
            .end(done);
    });

    it('Shoud returnd 404 non Object id', (done) => {
        var hexId = new ObjectID().toHexString()
        request(app)
            .get(`/todos/123abc`)
            .expect(404)
            .end(done);
    });

});

describe('Delete /todos/:id', () => {
    it('Shoud remove tood doc', (done) => {
        var hexId = todos[1]._id.toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((err, res) => {
                if (err)
                    return done(err);
                Todo.findById(hexId).then(todo => {
                    expect(todo).toNotExist();
                    done();
                }).catch((e) => done(e));
            });
    });

    it('Shoud returnd 404 not fine doc', (done) => {
        var hexId = new ObjectID().toHexString()
        request(app)
            .delete(`/todos/${hexId}`)
            .expect(404)
            .end(done);
    });

    it('Shoud returnd 404 non Object id', (done) => {
        var hexId = new ObjectID().toHexString()
        request(app)
            .delete(`/todos/123abc`)
            .expect(404)
            .end(done);
    });

});