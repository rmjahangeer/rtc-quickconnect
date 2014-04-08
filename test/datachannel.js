var test = require('tape');
var quickconnect = require('..');
var connections = [];
var dcs = [];
var room = require('uuid').v4();
// var freeice = require('freeice');
// var signallingServer = 'http://rtc.io/switchboard/';
var signallingServer = location.origin;

// require('cog/logger').enable('*');

test('create connector 0', function(t) {
  t.plan(3);
  t.ok(connections[0] = quickconnect(signallingServer, {
    room: room
  }), 'created');

  t.equal(typeof connections[0].createDataChannel, 'function', 'has a createDataChannel function');

  // create the data channel
  connections[0].createDataChannel('test');
  setTimeout(t.pass.bind(t, 'dc created'), 500);
});

test('create connector 1', function(t) {
  t.plan(3);
  t.ok(connections[1] = quickconnect(signallingServer, {
    room: room
  }), 'created');

  t.equal(typeof connections[1].createDataChannel, 'function', 'has a createDataChannel function');

  // create the data channel
  connections[1].createDataChannel('test');
  setTimeout(t.pass.bind(t, 'dc created'), 500);
});

test('data channels opened', function(t) {
  t.plan(2);
  dcs[0] = connections[0].getChannel(connections[1].id, 'test');
  dcs[1] = connections[1].getChannel(connections[0].id, 'test');

  if (dcs[0]) {
    t.pass('dc:0 open');
  }
  else {
    connections[0].once('test:open', function(id, dc) {
      dcs[0] = dc;
      t.equal(dc.readyState, 'open', 'connection test dc 0 open');
    });
  }

  if (dcs[1]) {
    t.pass('dc:1 open');
  }
  else {
    connections[1].once('test:open', function(id, dc) {
      dcs[1] = dc;
      t.equal(dc.readyState, 'open', 'connection test dc 1 open');
    });
  }
});

test('can getChannel', function(t) {
  var dc;

  t.plan(1);
  dc = connections[0].getChannel(connections[1].id, 'test');
  t.ok(dc, 'found data channel');
});

test('dc 0 send', function(t) {
  dcs[1].onmessage = function(evt) {
    t.equal(evt.data, 'hi', 'dc:1 received hi');
    dcs[1].onmessage = null;
  };

  t.plan(1);
  dcs[0].send('hi');
});

test('dc 1 send', function(t) {
  dcs[0].onmessage = function(evt) {
    t.equal(evt.data, 'hi', 'dc:1 received hi');
    dcs[0].onmessage = null;
  };

  t.plan(1);
  dcs[1].send('hi');
});

test('release references', function(t) {
  t.plan(1);
  connections.splice(0).forEach(function(conn, index) {
    conn.close();
  });

  dcs = [];
  t.pass('done');
});