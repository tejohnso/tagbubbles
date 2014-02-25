$(document).ready(function() {
  $(document).foundation();
  $(document.forms[0]).on('submit', function() { $('#go').click(); return false; });
  $('#go').on('click', runit);
  $('#tagHeader').on('click', reSortTags);
  $('#countHeader').on('click', reSortCounts);
  $('#dataChart').on('mouseover', 'circle', function(event) {highlightRow(event);});
  $('#theurl').focus();

  var tagsList, tagsArray;

  function runit() {
    tagsList = {};
    tagsArray = [];
    setInputDisabled(true);
    if ($('#theurl').val().substr(0,4) !== 'http') {
      $('#theurl').val('http://' + $('#theurl').val());
    }

    function setInputDisabled(trueOrFalse) {
      $('#go').prop('disabled', trueOrFalse);
      $('#theurl').prop('disabled', trueOrFalse);
    }

    $.post('/fetchData', {"url": $('#theurl').val()}, function(data) {
      iterateHTMLElements($(data));
      setTagsArray();
      sortCounts();
      populateTable();
      populateVis();
      setInputDisabled(false);
    });

    function setTagsArray() {
      Object.keys(tagsList).forEach(function(val, idx, arr) {
        tagsArray.push([val, tagsList[val]]);
      });
    }

    function iterateHTMLElements(jqElements) {
      jqElements.each(function(idx, el) {
        if ($(el).children().length > 0) {iterateHTMLElements($(el).children());}
        if ($(el).prop('tagName')) {
          incrementTagCount($(el).prop('tagName'));
        }
      });
    }

    function incrementTagCount(tagName) {
      tagsList.hasOwnProperty(tagName) ? tagsList[tagName] = tagsList[tagName] + 1 :
                                         tagsList[tagName] = 1;
    }

    return false;
  };

  function highlightRow(e) {
    var tag = $(e.target).next().html();
    $('#dataTableBody').find('td').removeClass('highlight');
    $('#dataTableBody').find('td').each(function(idx,el) {
      if ($(this).html() === tag) {$(this).addClass('highlight');}
    });
  }

  function populateTable() {
    $('#dataTableBody').html('');
    tagsArray.forEach(function(val, idx, arr) {
      $('#dataTableBody').append($('<tr><td>' + 
          val[0] + '</td><td>' + val[1] + '</td></tr>'));
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

  function reSortCounts() {
    sortCounts();
    populateTable();
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

  function reSortTags() {
    sortTags();
    populateTable();
  }

  function populateVis() {
    $('#dataChart').html('');
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
});
