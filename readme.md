# A mail query builder [![Dependency Status](https://gemnasium.com/badges/github.com/bookyacom/email.svg)](https://gemnasium.com/github.com/bookyacom/email)
> A mail query builder using swig templating and mailgun js

## Example
```js
const Mailer = require('mailer-lib');

const mailer = new Mailer(config);

mailer
	.to('name', 'email')
	.from('name', 'email')
	.content('html', {
		variable: 'variable'
	})
	.send()
	.then(function() {
		console.log('success');
	})
	.catch(function(err) {
		console.error(err);
	});
```
