require('insert-css')(require('./index.css'));

// TODO: componentize
var PouchDB = require('../pouchdb.js');
var db = new PouchDB(location.protocol + '//' + location.hostname + ':'
    + location.port + '/' + location.pathname.split('/')[1]);

var MakeModal = require('../make-modal');

module.exports = {
  replace: true,
  template: require('./template.html'),
  data: function() {
    return {
      pages: []
    }
  },
  created: function() {
    this.loadPages();
  },
  methods: {
    loadPages: function() {
      var self = this;
      db.query('blueink/pages?group=true',
        function(err, response) {
          self.pages = [];
          for (var i = 0; i < response.rows.length; i++) {
            self.pages.push({
              url: response.rows[i].key.join('/')
            });
          }
        });
    },
    openMakeModal: function(doc_id) {
      var self = this;
      var modal = new MakeModal({
        data: {
          schema_name: 'page'
        }
      });
      modal.$mount();
      modal.$appendTo('body');
      modal.$on('beforeSave', function(doc) {
        modal.doc_id = doc.url;
      });
      modal.$on('saved', function(type) {
        self.loadPages();
      });
    }
  }

};
