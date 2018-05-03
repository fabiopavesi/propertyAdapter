import * as express from 'express'
import * as cors from 'express'
import * as bodyParser from 'body-parser'
import {ObservableProperty} from './ObservableProperty';

const redis = require('redis');
const client = redis.createClient({
	host: 'redis'
});

export class Main {
	app;

	constructor() {
		console.log('starting main microservice');
		this.app = express();
		this.app.use(bodyParser.json());
		this.app.use(cors());

		this.app.get('/capabilities', (req, res) => {
			res.json(capabilities);
		})

		this.app.get('/test', (req, res) => {
			res.json({
				status: 200,
				message: 'Test Ok'
			})
		})

		this.app.post('/', (req, res) => {
			console.log('body', req.body);
			const observableProperty = new ObservableProperty(req.body.url);
			observableProperty.retrieveLabel()
				.subscribe(result => {
					res.json(result);
				})
		})

		this.app.get('/flush', (req, res) => {
			try {
				client.flushall();
			} catch (e) {
				console.log('error flushing', e);
			}
			res.header('Content-type', 'application/json').status(202).send({
				status: 202,
				message: 'Accepted'
			});
		})

		this.app.get('/*', (req, res) => {
			let url = this.fixUrl(req.params[0]);
			console.log('body', url);
			client.get(url, (err, cached) => {
				if (err || !cached) {
					const observableProperty = new ObservableProperty(url);
					observableProperty.retrieveLabel()
						.subscribe(result => {
							res.json(observableProperty);
							client.set(req.params.url, JSON.stringify(observableProperty), 'EX', 60 * 60 * 24);
						})
				} else {
					res.json(JSON.parse(cached));
				}
			})
		})

		this.app.listen(3000, () => {
			console.log('listening on port 3000');
		})
	}

	fixUrl(url: string) {
		if ( url.indexOf('http://') < 0 ) {
			if ( url.indexOf('http:/') >= 0 ) {
				url = url.replace(/http:\//, 'http://');
			}
		}
		if ( url.indexOf('https://') < 0 ) {
			if ( url.indexOf('https:/') >= 0 ) {
				url = url.replace(/https:\//, 'https://');
			}
		}
	}
}

const main = new Main();
console.log('here I am');

const capabilities = {
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
}