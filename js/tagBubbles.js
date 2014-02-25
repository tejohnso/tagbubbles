$(document).ready(function() {
  $(document).foundation();
  $(document.forms[0]).on('submit', function() {runit(); return false;});
  $('#go').on('click', runit);

  function runit() {
    tagsList = {};
    $('#dataTableBody').html('');
    $('#dataChart').html('');
    if ($('#theurl').val().substr(0,4) !== 'http') {
      $('#theurl').val('http://' + $('#theurl').val());
    }

    $.post('/fetchData', {"url": $('#theurl').val()}, function(data) {
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

    function populateVis() {
      var json = {
        "name": "bubbles",
        "children": [
        ]
      };

      Object.keys(tagsList).map(function(val, idx, arr) {
        var newBubble = {"name": val, "value": tagsList[val]};
        json.children.push(newBubble);
      });

      var width = $('#dataChart').width();
      var height = $('#dataChart').width();

      var canvas = d3.select('#dataChart').append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transofrm', 'translate(50, 50');

      var pack = d3.layout.pack()
        .size([width, height])
        .padding(1.5);

      var nodes = pack.nodes(json);

      var node = canvas.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
      node.append('circle')
      .attr('r', function(d) {return d.r;})
      .attr('fill', function(d) { return d.children ? '#fff' : "0000FF"; })
      .attr('opacity', 0.25)
      .attr('stroke', function(d) {return d.children ? '#fff' : '#0088FF' })
      .attr('stroke-width', '2');

      node.append('text')
      .attr('text-anchor', 'middle')
      .text(function(d) { return d.children ? '' : d.name;});
      node.append('text')
      .attr('dy', 20)
      .attr('text-anchor', 'middle')
      .text(function(d) { return d.children ? '' : d.value;});
  }

  return false;
};
});
