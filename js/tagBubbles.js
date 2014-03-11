$(document).ready(function() {
  "use strict";
  var tagsList, tagsArray;

  $(document).on('replace', reloadDynamicHTML);

  function reloadDynamicHTML() {
    $(document).foundation($('#dataTable'));
    if (hasSmallScreenComponents()) {$('#dataChart').width($('dl').width());}
    setEventHandlers();

    function hasSmallScreenComponents() {
      return ($('dl').length > 0);
    }

    function setEventHandlers() {
      $('#tagHeader').on('click', function() {sortTags(); populateTable();});
      $('#countHeader').on('click', function() {sortCounts(); populateTable();});
      $('#dataChart').on('mouseover', 'circle', function(event) {highlightRow(event);});
      $('#dataChart').on('click', 'circle', $('#dataChart').trigger('mouseover'));
    }
  }

  $(document).foundation();
  $(document.forms[0]).on('submit', function() { $('#go').click(); return false; });
  $('#go').on('click', reload);
  $('#theurl').focus();

  function reload() {
    if ($('#theurl').val() === '') {return;}
    $('#countHeader').html('Count');
    $('#tagHeader').html('TAG');
    $.when(populateTagCountsFromURL()).done(function() {
      setTagsArray();
      sortCounts();
      populateTable();
      populateVis();
    });
    return false;
  }

  function populateTagCountsFromURL() {
    var defer = jQuery.Deferred();
    tagsList = {};
    toggleInputDisabled();
    if ($('#theurl').val().substr(0,4) !== 'http') {
      $('#theurl').val('http://' + $('#theurl').val());
    }

    $.post('/fetchData', {"url": $('#theurl').val()}, function(data) {
      iterateHTMLData(data.split('\n'));
      toggleInputDisabled();
      defer.resolve();
    });

    function iterateHTMLData(elements) {
      if (!elements) {return;}
      elements.forEach(function(val) {
        var tag = val;
        tagsList.hasOwnProperty(tag) ? tagsList[tag] = tagsList[tag] + 1 :
                                       tagsList[tag] = 1;
      });
    }

    function toggleInputDisabled() {
      var currentlyDisabled = $('#go').prop('disabled');
      $('#go, #theurl').prop('disabled', currentlyDisabled ? false : true);
    }

    return defer.promise();
  }

  function setTagsArray() {
    tagsArray = [];
    Object.keys(tagsList).forEach(function(val) {
      tagsArray.push([val, tagsList[val]]);
    });
  }

  function sortCounts() {
    if ($('#countHeader').html().substr(7, 1) === '-') {
      tagsArray.sort(function(a, b) { return (a[1] - b[1]); });
      $('#countHeader').html('Count [+]');
      $('#tagHeader').html('TAG');
    } else {
      tagsArray.sort(function(a, b) { return (b[1] - a[1]); });
      $('#countHeader').html('Count [-]');
      $('#tagHeader').html('TAG');
    }
  }

  function sortTags() {
    if ($('#tagHeader').html().substr(5, 1) === '-') {
      tagsArray.sort(function(a, b) { return (b[0] > a[0] ? 1 : -1); });
      $('#tagHeader').html('TAG [+]');
      $('#countHeader').html('Count');
    } else {
      tagsArray.sort(function(a, b) { return (b[0] > a[0] ? -1 : 1); });
      $('#tagHeader').html('TAG [-]');
      $('#countHeader').html('Count');
    }
  }

  function populateTable() {
    $('#dataTableBody').html('');
    tagsArray.forEach(function(val) {
      $('#dataTableBody').append($('<tr><td>' +
          val[0] + '</td><td>' + val[1] + '</td></tr>'));
    });
  }

  function highlightRow(e) {
    var tag = $(e.target).next().html();
    $('#dataTableBody').find('td').removeClass('highlight');
    $('#dataTableBody').find('td').each(function() {
      if ($(this).html() === tag) {$(this).addClass('highlight');}
    });
  }

  function populateVis() {
    $('#dataChart').html('');
    if (Object.keys(tagsList).length === 0) {return;}
    var json = {
      "name": "bubbles",
      "children": [
      ]
    };

    Object.keys(tagsList).map(function(val) {
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
    .attr('transform', function(d) {return 'translate(' + d.x + ',' + d.y + ')';});
    node.append('circle')
    .attr('r', function(d) {return d.r;})
    .attr('fill', function(d) {return d.children ? '#fff' : "0000FF";})
    .attr('opacity', 0.25)
    .attr('stroke', function(d) {return d.children ? '#fff' : '#0088FF';})
    .attr('stroke-width', '2');

    node.append('text')
    .attr('text-anchor', 'middle')
    .text(function(d) { return d.children || d.r < 20 ? '' : d.name;});
    node.append('text')
    .attr('dy', 20)
    .attr('text-anchor', 'middle')
    .text(function(d) { return d.children || d.r < 20 ? '' : d.value;});
  }
});
