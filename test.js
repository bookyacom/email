'use strict';

import test from 'ava';
import Email from './';

test('should throw error for invalid config', t => {
	const configs = [undefined, {}, null, {apiKey: 'api'}, {domain: 'domain'}];

	for (const config of configs) {
		try {
			const email = new Email(config);
		} catch (e) {
			t.is(e.message, 'Invalid Parameters. apiKey and domain are required');
		}
	}
});

test('should throw error for invalid params before send', t => {
	const config = {
		apiKey: 'apiKey',
		domain: 'domain'
	};
	const email = new Email(config);

	try {
		email.send();
	} catch (e) {
		t.is(e.message, 'Unable to send email because no sender specified');
	}

	email.from('test', 'test@test.com');

	try {
		email.send();
	} catch (e) {
		t.is(e.message, 'Unable to send email because no receivers specified');
	}
});
