'use strict';

var assert = require('assert');
var debug = require('debug')('email');
var mailgun = require('mailgun-js');
var swig = require('swig');

module.exports = Email;

function Email(config) {
	assert(config && config.apiKey && config.domain, 'Invalid Parameters. apiKey and domain are required');
	this._email = mailgun(config);

	this._template = '';
	this._sender = {
		name: '',
		email: ''
	};

	this._receiver = [];
	this._subject = '';
	this._locals = {};
	this._content = '';
}

Email.prototype.template = function (name) {
	this.template = name;
	return this;
};

Email.prototype.send = function () {
	debug('Attempting to send e-mail');

	var self = this;
	var msg = {};
	var rendered = this._textContent;

	assert(this._sender.email, 'Unable to send email because no sender specified');
	assert(this._receiver.length, 'Unable to send email because no receivers specified');

	if (this._content) {
		rendered = swig.render(this._content, {locals: this._locals});
	}

	if (this._template) {
		rendered = swig.renderFile(this._template, this._locals || {});
	}

	msg = {
		'html': rendered,
		'subject': this._subject || '',
		'from': this._sender.name + ' <' + this._sender.email + '> ',
		'h:Reply-To': this._sender.reply || this._sender.email,
		'o:tracking-opens': 'yes', // this.metric.opens,
		'o:tracking-clicks': 'yes' // this.metric.clicks
	};

	var promises = this._receiver.map(function (receiver) {
		msg.to = receiver.name + ' <' + receiver.email + '> ';
		return self._email.messages().send(msg);
	});

	return Promise.all(promises);
};

Email.prototype.subject = function (txt) {
	assert(txt, 'Subject text not provided');

	this._subject = txt;
	return this;
};

Email.prototype.from = function (name, email) {
	assert(name, 'Sender name not provided');
	assert(email, 'Sender email not provided');

	this._sender.name = name;
	this._sender.email = email;
	return this;
};

Email.prototype.to = function (name, email) {
	assert(email, 'Receiver email not provided');

	this._receiver.push({
		name: name,
		email: email,
		type: 'to'
	});

	return this;
};

Email.prototype.cc = function (name, email) {
	assert(name, 'Receiver name not provided');
	assert(email, 'Receiver email not provided');

	this._receiver.push({
		name: name,
		email: email,
		type: 'cc'
	});

	return this;
};

Email.prototype.bcc = function (name, email) {
	assert(name, 'Receiver name not provided');
	assert(email, 'Receiver email not provided');

	this._receiver.push({
		name: name,
		email: email,
		type: 'bcc'
	});

	return this;
};

Email.prototype.data = function (key, value) {
	this._locals[key] = value;
	return this;
};

Email.prototype.content = function (html, locals) {
	this._content = html;

	if (locals) {
		this._locals = locals;
	}

	return this;
};

Email.prototype.file = function (file, locals) {
	this._template = file;

	if (locals) {
		this._locals = locals;
	}

	return this;
};

Email.prototype.text = function (value) {
	this._textContent = value;
	return this;
};
