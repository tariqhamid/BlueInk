function(head, req) {
  // !code lib/array_replace_recursive.js
  var ddoc = this,
      templates = ddoc.templates,
      mustache = require("lib/mustache"),
      row;

  if (!req.query && !req.query.include_docs) {
    send('Please add include_docs to make this thing work');
  }

  provides('html',
    function() {
      var page = {items:[],copyright:'BigBlueHat'},
          posts = [],  
          navigation = [];
      while(row = getRow()) {
        // TODO: come up with something more creative here to do the blog detection
        if (!isNaN(row.key[row.key.length-3]) && !isNaN(row.key[row.key.length-2])
            && !isNaN(row.key[row.key.length-1])) {
          var day = row.key.pop();
          var month = row.key.pop();
          var year = row.key.pop();
        }
        var last = row.key.pop();
        var secondtolast = row.key.pop();
        // it's the page
        if (secondtolast == '_' && last == '_') {
          page.title = row.doc.title;
        } else if (secondtolast == '' && last == 'site') {
          page.site = row.doc;
        } else if (secondtolast == '' && last == 'sitemap') {
          page.sitemap = row.doc.urls;
        } else if (secondtolast == '' && last == 'template') {
          templates = array_replace_recursive(ddoc.templates, row.doc.templates);
        } else {
          // TODO: base template selection off type
          if (!page.items[secondtolast]) page.items[secondtolast] = {'area':[]};
          if (row.doc.type) {
            if (row.doc.type == 'navigation') {
            	navigation.push(page.items[secondtolast].area[last] = row);
            } else {
              var doc = row.doc;
              // display settings
              if (row.value.display_title == false) {
                doc.title = "";
              }
              if (row.value.published_date != undefined) {
                // blog posts handling
                doc.published_date = row.value.published_date.join('/');
                if (page.items[secondtolast].area[last] == undefined) {
                  page.items[secondtolast].area[last] = [];
                  //posts = page.items[secondtolast].area[last];
                }
                page.items[secondtolast].area[last][year+month+day] = {'item':mustache.to_html(templates.types[row.doc.type], doc)};
              } else {
                // non-post item
                page.items[secondtolast].area[last] = {'item':mustache.to_html(templates.types[row.doc.type], doc)};
              }
            }
          }
          if (secondtolast == 0) page.items[secondtolast].classes = ['first'];
        }
      } // end while

      page.items.forEach(function(area, area_idx) {
        area.area.forEach(function(item, idx) {
          if (item.doc && item.doc.type && item.doc.type == 'navigation') {
            var nav_item = item,
                nav = {'sitemap':{}};

	          if (nav_item.doc.show_only && nav_item.doc.show_only == 'children') {
  					  // TODO: this needs to be recursive
              page.sitemap.forEach(function(el) {
					      if (el.body.url == nav_item.doc.current_url && el.children) {
						  	  navigation.sitemap = el.children;
						    }
					    });
				    } else {
					    navigation.sitemap = page.sitemap;
				    }
            page.items[area_idx].area[idx] = {'item':mustache.to_html(templates.types['navigation'], navigation, templates.partials)};
          }
        });
      });
      page.site.host = req.headers.Host;

      send(mustache.to_html(templates.page, page, templates.partials));
    }
  );
}

/*

            if (row.doc.type == 'navigation') {
              var navigation = {'sitemap':{}};
              if (row.doc.show_only && row.doc.show_only == 'children') {
                // TODO: this needs to be recursive
                page.sitemap.forEach(function(el) {
                  if (el.body.url == row.doc.current_url && el.children) {
                    navigation.sitemap = el.children;
                  }
                });
              } else {
                navigation.sitemap = page.sitemap;
              }
              page.items[secondtolast].area[last] = {'item':mustache.to_html(templates.types[row.doc.type], navigation, templates.partials)};
            } else {
*/
