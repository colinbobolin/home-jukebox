let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../src/app');
let should = chai.should();

chai.use(chaiHttp);

describe('Baseline', () => {
    describe('GET hello', () => {
        it('should get hello world', (done) => {
            chai.request(app)
                .get('/hello')
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });
});

describe('Authenticate', () => {
    describe('GET login', function () {
        it('should get new access token', function (done) {
            done();
        })
    })
});

describe('Request', () => {
    describe('POST request', function () {
        it('should return 403', function (done) {
            let track_req = {
                track_id: 'my_favorite_track',
                request_timestamp: Date.now()
            }

            chai.request(app)
                .post('/request')
                .send(track_req)
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                });
        });

        // it('should POST a track request', function (done) {
        //     let track_req = {
        //         track_id: 'my_favorite_track',
        //         request_timestamp: Date.now()
        //     }

        //     chai.request(app)
        //         .post('/request')
        //         .send(track_req)
        //         .end((err, res) => {
        //             res.should.have.status(200);
        //             res.body.should.be.a('object');
        //             res.body.should.have.property('track_id');
        //             res.body.should.have.property('request_timestamp');
        //             done();
        //         });
        // });
    });
});
