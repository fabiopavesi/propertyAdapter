"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("express");
var bodyParser = require("body-parser");
var ObservableProperty_1 = require("./ObservableProperty");
var redis = require('redis');
var client = redis.createClient({
    host: 'redis'
});
var Main = /** @class */ (function () {
    function Main() {
        console.log('starting main microservice');
        this.app = express();
        this.app.use(bodyParser.json());
        this.app.use(cors());
        this.app.get('/capabilities', function (req, res) {
            res.json(capabilities);
        });
        this.app.get('/test', function (req, res) {
            res.json({
                status: 200,
                message: 'Test Ok'
            });
        });
        this.app.post('/', function (req, res) {
            console.log('body', req.body);
            var observableProperty = new ObservableProperty_1.ObservableProperty(req.body.url);
            observableProperty.retrieveLabel()
                .subscribe(function (result) {
                res.json(result);
            });
        });
        this.app.get('/flush', function (req, res) {
            try {
                client.flushall();
            }
            catch (e) {
                console.log('error flushing', e);
            }
            res.header('Content-type', 'application/json').status(202).send({
                status: 202,
                message: 'Accepted'
            });
        });
        this.app.get('/*', function (req, res) {
            console.log('body', req.params[0]);
            client.get(req.params.url, function (err, cached) {
                if (err || !cached) {
                    var observableProperty_1 = new ObservableProperty_1.ObservableProperty(req.params[0]);
                    observableProperty_1.retrieveLabel()
                        .subscribe(function (result) {
                        res.json(observableProperty_1);
                        client.set(req.params.url, JSON.stringify(observableProperty_1), 'EX', 60 * 60 * 24);
                    });
                }
                else {
                    res.json(JSON.parse(cached));
                }
            });
        });
        this.app.listen(3000, function () {
            console.log('listening on port 3000');
        });
    }
    return Main;
}());
exports.Main = Main;
var main = new Main();
console.log('here I am');
var capabilities = {
    system: {
        name: 'PropertyHelper',
        maintainer: {
            email: 'fabio@adamassoft.it'
        }
    },
    api: [
        {
            method: 'GET',
            relativeUrl: '/flush',
            description: 'Flushes the REDIS cache'
        },
        {
            method: 'GET',
            relativeUrl: '/:url',
            description: 'Retrieves the URL and tries to extract information if the format is known'
        },
        {
            method: 'POST',
            relativeUrl: '/',
            description: 'Retrieves the URL and tries to extract information if the format is known',
            'content-type': 'json',
            parameters: [
                {
                    parameter: 'url',
                    description: 'The URL to retrieve and try to interpret'
                }
            ]
        }
    ]
};
//# sourceMappingURL=index.js.map