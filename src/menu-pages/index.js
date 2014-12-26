require('insert-css')(require('./index.css'));

// TODO: componentize
var PouchDB = require('../pouchdb.js');
var db = new PouchDB(location.protocol + '//' + location.hostname + ':'
    + location.port + '/' + location.pathname.split('/')[1]);

module.exports = {
  replace: true,
  template: require('./template.html'),
  data: function() {
    return {
      pages: []
    }
  },
  created: function() {
    var self = this;
    db.query('blueink/pages?group=true',
      function(err, response) {
        for (var i = 0; i < response.rows.length; i++) {
          self.pages.push({
            url: response.rows[i].key.join('/')
          });
        }
      });
  }
};
