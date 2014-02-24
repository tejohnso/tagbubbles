$(document).ready(function() {
  $(document).foundation();
  $(document.forms[0]).on('submit', function() {runit(); return false;});
  $('#go').on('click', runit);

  function runit() {
    tagsList = {};

    $.get($('#theurl').val(), function(data) {
      iterateElements($(data));
      populateTable();
      populateVis();
    });

    function iterateElements(jqElements) {
      jqElements.each(function(idx, el) {
        if ($(el).children().length > 0) {iterateElements($(el).children());}
        if ($(el).prop('tagName')) {
          incrementTagCount($(el).prop('tagName'));
        }
      });
    }

    function incrementTagCount(tagName) {
      tagsList.hasOwnProperty(tagName) ? tagsList[tagName] = tagsList[tagName] + 1 :
                                         tagsList[tagName] = 1;
    }

    function populateTable() {
      Object.keys(tagsList).map(function(val, idx, arr) {
        $('#dataTableBody').append($('<tr><td>' + 
            val + '</td><td>' + tagsList[val] + '</td></tr>'));
      });
    }

    function populateVis(data) {
      var json = {
        "name": "flare",
        "children": [
        {
          "name": "analytics",
          "children": [
          {
            "name": "cluster",
            "children": [
            ]
          },
          {
            "name": "graph",
            "children": [
            ]
          }
          ]
        }
        ]
      };

      Object.keys(tagsList).map(function(val, idx, arr) {
        var newBubble = {"name": val + '\n' + tagsList[val], "size": tagsList[val]};
        json.children[0].children[0].children.push(newBubble);
      });

      var r = $('#dataChart').width(),
          format = d3.format(",d"),
          fill = d3.scale.category20c();

      var bubble = d3.layout.pack()
        .sort(null)
        .size([r, r])
        .padding(1.5);

      var vis = d3.select("#dataChart").append("svg")
        .attr("width", r)
        .attr("height", r)
        .attr("class", "bubble");


      var node = vis.selectAll("g.node")
        .data(bubble.nodes(classes(json))
            .filter(function(d) { return !d.children; }))
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

      node.append("title")
        .text(function(d) { return d.className + ": " + format(d.value); });

      node.append("circle")
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { return fill(d.packageName); });
      node.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", ".3em")
        .text(function(d) { return d.className.substring(0, d.r / 3); });

      // Returns a flattened hierarchy containing all leaf nodes under the root.

      function classes(root) {
        var classes = [];

        function recurse(name, node) {
          if (node.children) {
            node.children.forEach(function(child) {
              recurse(node.name, child);
            });
          }
          else {
            classes.push({packageName: name, className: node.name, value: node.size});
          }
        }
        recurse(null, root);
        return {children: classes};
      }
    }

    return false;
  };
});
