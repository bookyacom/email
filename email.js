'use strict';

var assert   = require('assert');
var config   = require('config');
var debug    = require('debug')('email');
var mandrill = require('mandrill-api/mandrill');
var swig     = require('swig');

// Instructions:
// 
// To use this lib, do:
// 
//    var email = new (require('email'))();
//    email
//      .template(<template>)
//      .sender(<name>, <email address>)
//      .receiver(<name>, <email address>)
//    ;
//    
class Email {
  constructor(mandrillApiKey) {
    this._email = new mandrill.Mandrill(mandrillApiKey);

    this._template = '';
    this._sender   = {
      name  : '',
      email : ''
    };
    this._receiver = [];
    this._subject  = '';
    this._locals   = {};
    this._content  = '';
  }

  template(name) {
    this.template = name;
    return this;
  }

  send() {
    debug('Attempting to send e-mail');

    var self     = this;
    var msg      = {};
    var rendered = this._textContent;

    assert(this._sender.email, 'Unable to send email because no sender specified');
    assert(this._receiver.length, 'Unable to send email because no receivers specified');
    

    if (this._content) {
      rendered = swig.render(this._content, { locals : this._locals });
    }

    if (this._template) {
      rendered = swig.renderFile(this._template,  this._locals || {});
    }
    

    msg = {
      html        : rendered,
      subject     : this._subject || '',
      from_email  : this._sender.email || '',
      from_name   : this._sender.name || '',
      to          : this._receiver,
      headers     : { 'Reply-To' : this._sender.email },
      track_opens : true, //this.metric.opens,
      track_clicks : true //this.metric.clicks
    };

    return new Promise(function (resolve, reject) {
      self._email.messages.send({
        message : msg,
        async   : false,
        ip_pool : 'Main Pool',
        send_at : ''
      }, resolve, reject);
    });
  }

  subject(txt) {
    assert(txt, 'Subject text not provided');

    this._subject = txt;
    return this;
  }

  from(name, email) {
    assert(name, 'Sender name not provided');
    assert(email, 'Sender email not provided');

    this._sender.name  = name;
    this._sender.email = email;
    return this;
  }

  to(name, email) {
    // assert(name, 'Receiver name not provided');
    assert(email, 'Receiver email not provided');

    this._receiver.push({
      name  : name,
      email : email,
      type  : 'to'
    });
    return this;
  }

  cc(name, email) {
    assert(name, 'Receiver name not provided');
    assert(email, 'Receiver email not provided');

    this._receiver.push({
      name  : name,
      email : email,
      type  : 'cc'
    });
    return this; 
  }

  bcc(name, email) {
    assert(name, 'Receiver name not provided');
    assert(email, 'Receiver email not provided');

    this._receiver.push({
      name  : name,
      email : email,
      type  : 'bcc'
    });
    return this; 
  }  

  data(key, value) {
    this._locals[key] = value;
    return this;
  }

  content(html, locals) {
    this._content = html;

    if (locals) {
      this._locals = locals;
    }

    return this;
  }

  file(file, locals) {
    this._template = file;

    if (locals) {
      this._locals = locals;
    }

    return this;
  }

  text(value) {
    this._textContent = value;
    return this;
  }
}

module.exports = Email;