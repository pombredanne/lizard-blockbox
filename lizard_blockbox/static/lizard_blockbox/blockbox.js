(function() {
  var ANIMATION_DURATION, BLACK, BLUE, BlockboxRouter, GRAY, GREEN, JSONRiverLayer, JSONTooltip, LIGHTBLUE, MEASURECOLOR, MeasuresMapView, RED, RIVERLEVEL0, RIVERLEVEL1, RIVERLEVEL2, RIVERLEVEL3, RIVERLEVEL4, RIVERLEVEL5, RIVERLEVEL6, RIVERLEVEL7, RIVERLEVEL8, RIVERLEVEL9, RiverLayerRule, SELECTEDMEASURECOLOR, STROKEWIDTH, YELLOW, deselectAllMeasures, doit, graphTimer, hasTooltip, km_line_layer, measuresMapView, resize_graphs, selectRiver, selectVertex, setFlotSeries, setMeasureGraph, setMeasureResultsGraph, setMeasureSeries, setup_map_legend, showCityTooltip, showLabel, showPopup, showTooltip, toggleMeasure, updateMeasuresList, updateVertex,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ANIMATION_DURATION = 150;

  GRAY = "#c0c0bc";

  BLUE = "#046F96";

  LIGHTBLUE = "#bddfed";

  RED = "#A31535";

  YELLOW = "#E2D611";

  GREEN = "#635E0D";

  RIVERLEVEL9 = "rgb(195, 0, 120)";

  RIVERLEVEL8 = "rgb(203, 81, 145)";

  RIVERLEVEL7 = "rgb(219, 155, 192)";

  RIVERLEVEL6 = "rgb(214, 128, 25)";

  RIVERLEVEL5 = "rgb(241, 205, 58)";

  RIVERLEVEL4 = "rgb(247, 239, 212)";

  RIVERLEVEL3 = "rgb(217, 235, 250)";

  RIVERLEVEL2 = "rgb(177, 215, 245)";

  RIVERLEVEL1 = "rgb(104, 184, 235)";

  RIVERLEVEL0 = "rgb(0, 156, 223)";

  MEASURECOLOR = "rgb(128, 153, 140)";

  SELECTEDMEASURECOLOR = "rgb(29, 82, 62)";

  BLACK = "#000000";

  STROKEWIDTH = 7;

  graphTimer = '';

  hasTooltip = '';

  deselectAllMeasures = function() {
    var _this = this;
    return $.get($('#blockbox-deselect-all-measures').data('deselect-url'), function(data) {
      updateMeasuresList();
      return _this;
    });
  };

  toggleMeasure = function(measure_id) {
    return $.ajax({
      type: 'POST',
      url: $('#blockbox-table').data('measure-toggle-url'),
      data: {
        'measure_id': measure_id
      },
      success: function(data) {
        updateMeasuresList();
        return this;
      }
    });
  };

  window.toggleMeasure = toggleMeasure;

  updateMeasuresList = function() {
    var $holder;
    $holder = $('<div/>');
    return $holder.load('. #page', function() {
      var sort;
      $("#selected-measures-list").html($('#selected-measures-list', $holder).html());
      measuresMapView.render(true, true, true);
      $("#measures-table").html($('#measures-table', $holder).html());
      sort = $("#measures-table-top").get(0).config.sortList;
      $("#measures-table-top").trigger("update");
      return $("#measures-table-top").trigger("sorton", [sort]);
    });
  };

  selectRiver = function(river_name) {
    return $.ajax({
      type: 'POST',
      url: $('#blockbox-river').data('select-river-url'),
      data: {
        'river_name': river_name
      },
      success: function(data) {
        updateVertex();
        updateMeasuresList();
        measuresMapView.render(true, false);
        return this;
      }
    });
  };

  selectVertex = function(vertex_id) {
    return $.ajax({
      type: 'POST',
      url: $('#blockbox-vertex').data('select-vertex-url'),
      data: {
        'vertex': vertex_id
      },
      success: function(data) {
        measuresMapView.render(true, false);
        return this;
      }
    });
  };

  updateVertex = function() {
    return $.getJSON($('#blockbox-vertex').data('update-vertex-url') + '?' + new Date().getTime(), function(data) {
      var field, groups, header, html, options, options_html, values;
      groups = (function() {
        var _results;
        _results = [];
        for (header in data) {
          values = data[header];
          options = [
            (function() {
              var _i, _len, _results2;
              _results2 = [];
              for (_i = 0, _len = values.length; _i < _len; _i++) {
                field = values[_i];
                _results2.push("<option value='" + field[0] + "'>" + field[1] + "</option>");
              }
              return _results2;
            })()
          ];
          options_html = options.join("");
          _results.push("<optgroup label='" + header + "'>" + options_html + "</optgroup>");
        }
        return _results;
      })();
      html = groups.join("");
      $('#blockbox-vertex select').html(html);
      return $('#blockbox-vertex .chzn-select').trigger("liszt:updated");
    });
  };

  BlockboxRouter = (function(_super) {

    __extends(BlockboxRouter, _super);

    function BlockboxRouter() {
      BlockboxRouter.__super__.constructor.apply(this, arguments);
    }

    BlockboxRouter.prototype.routes = {
      "map": "map",
      "table": "table"
    };

    BlockboxRouter.prototype.map = function() {
      var to_table_text;
      to_table_text = $('.toggle_map_and_table').parent().data('to-table-text');
      $('a.toggle_map_and_table span').text(to_table_text);
      $('a.toggle_map_and_table').attr("href", "#table");
      return $('#blockbox-table').slideUp(ANIMATION_DURATION, function() {
        return $('#map').slideDown(ANIMATION_DURATION);
      });
    };

    BlockboxRouter.prototype.table = function() {
      var to_map_text;
      to_map_text = $('.toggle_map_and_table').parent().data('to-map-text');
      $('a.toggle_map_and_table span').text(to_map_text);
      $('a.toggle_map_and_table').attr("href", "#map");
      return $('#map').slideUp(ANIMATION_DURATION, function() {
        return $('#blockbox-table').slideDown(ANIMATION_DURATION);
      });
    };

    return BlockboxRouter;

  })(Backbone.Router);

  window.app_router = new BlockboxRouter;

  Backbone.history.start();

  MeasuresMapView = Backbone.View.extend({
    selected_items: function() {
      var el, _i, _len, _ref, _results;
      _ref = $("#selected-measures-list li a");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        el = _ref[_i];
        _results.push($(el).data("measure-shortname"));
      }
      return _results;
    },
    render_rivers: function(data) {
      var attributes, feature, num, target_difference, _i, _j, _len, _len2, _ref;
      target_difference = {};
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        num = data[_i];
        target_difference[num.location_reach] = num.measures_level;
      }
      _ref = this.rivers.features;
      for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
        feature = _ref[_j];
        attributes = feature.attributes;
        attributes.target_difference = target_difference[attributes.label];
      }
      return this.rivers.redraw();
    },
    render_measures: function() {
      var feature, selected_items, _i, _len, _ref, _ref2;
      console.log('render_measures');
      selected_items = this.selected_items();
      _ref = this.measures.features;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        feature = _ref[_i];
        if (_ref2 = feature.attributes.code, __indexOf.call(selected_items, _ref2) >= 0) {
          feature.attributes.selected = true;
        } else {
          feature.attributes.selected = false;
        }
      }
      return this.measures.redraw();
    },
    initialize: function() {
      var json_url, numResponses,
        _this = this;
      numResponses = 0;
      this.static_url = $('#lizard-blockbox-graph').data('static-url');
      $.getJSON(this.static_url + 'lizard_blockbox/measures.json', function(json) {
        _this.measures = JSONTooltip('Maatregelen', json);
        numResponses |= 1 << 0;
        if (numResponses === 7) _this.render(true, true, false);
        return _this;
      });
      $.getJSON(this.static_url + 'lizard_blockbox/kilometers.json', function(json) {
        _this.rivers = JSONRiverLayer('Rivers', json);
        numResponses |= 1 << 1;
        if (numResponses === 7) _this.render(true, true, false);
        return _this;
      });
      json_url = $('#blockbox-table').data('calculated-measures-url');
      return $.getJSON(json_url + '?' + new Date().getTime(), function(data) {
        _this.calculated = data;
        numResponses |= 1 << 2;
        if (numResponses === 7) _this.render(true, true, false);
        return _this;
      });
    },
    render: function(updateRivers, updateMeasures, updateCalculate) {
      var json_url,
        _this = this;
      if (updateRivers == null) updateRivers = true;
      if (updateMeasures == null) updateMeasures = true;
      if (updateCalculate == null) updateCalculate = true;
      if (updateCalculate) {
        json_url = $('#blockbox-table').data('calculated-measures-url');
        $.getJSON(json_url + '?' + new Date().getTime(), function(data) {
          _this.calculated = data;
          setFlotSeries(data);
          if (updateRivers) return _this.render_rivers(data);
        });
      } else {
        setFlotSeries(this.calculated);
        if (updateRivers) this.render_rivers(this.calculated);
      }
      if (updateMeasures) return this.render_measures();
    }
  });

  measuresMapView = new MeasuresMapView();

  showPopup = function(feature) {
    var href_text, popup;
    href_text = feature.attributes['selected'] ? 'Deselecteer' : 'Selecteer';
    popup = new OpenLayers.Popup.FramedCloud("chicken", feature.geometry.getBounds().getCenterLonLat(), null, "<div style='font-size:.8em'>" + feature.data.titel + "<br/><a onclick='window.toggleMeasure(\"" + feature.attributes['code'] + "\"); if (this.innerHTML === \"Selecteer\") { this.innerHTML=\"Deselecteer\"} else {this.innerHTML=\"Selecteer\"}' href='#'>" + href_text + "</a></div>", null, true, false);
    feature.popup = popup;
    return map.addPopup(popup);
  };

  RiverLayerRule = function(from, to, color) {
    var rule;
    rule = new OpenLayers.Rule({
      filter: new OpenLayers.Filter.Comparison({
        type: OpenLayers.Filter.Comparison.BETWEEN,
        property: "target_difference",
        lowerBoundary: from,
        upperBoundary: to
      }),
      symbolizer: {
        fillColor: color,
        strokeColor: color,
        strokeWidth: STROKEWIDTH
      }
    });
    return rule;
  };

  JSONRiverLayer = function(name, json) {
    var geojson_format, rules, styleMap, vector_layer;
    rules = [
      new OpenLayers.Rule({
        filter: new OpenLayers.Filter.Comparison({
          type: OpenLayers.Filter.Comparison.GREATER_THAN,
          property: "target_difference",
          value: 2.00
        }),
        symbolizer: {
          fillColor: RIVERLEVEL9,
          strokeColor: RIVERLEVEL9,
          strokeWidth: STROKEWIDTH
        }
      }), RiverLayerRule(1.00, 2.00, RIVERLEVEL8), RiverLayerRule(0.80, 1.00, RIVERLEVEL7), RiverLayerRule(0.60, 0.80, RIVERLEVEL6), RiverLayerRule(0.40, 0.60, RIVERLEVEL5), RiverLayerRule(0.20, 0.40, RIVERLEVEL4), RiverLayerRule(0.00, 0.20, RIVERLEVEL3), RiverLayerRule(-0.20, -0.00, RIVERLEVEL2), RiverLayerRule(-0.40, -0.20, RIVERLEVEL1), new OpenLayers.Rule({
        filter: new OpenLayers.Filter.Comparison({
          type: OpenLayers.Filter.Comparison.LESS_THAN,
          property: "target_difference",
          value: -0.40
        }),
        symbolizer: {
          fillColor: RIVERLEVEL0,
          strokeColor: RIVERLEVEL0,
          strokeWidth: STROKEWIDTH
        }
      }), new OpenLayers.Rule({
        elseFilter: true,
        symbolizer: {
          strokeOpacity: 0.0
        }
      })
    ];
    styleMap = new OpenLayers.StyleMap(OpenLayers.Util.applyDefaults({
      fillColor: GRAY,
      strokeColor: GRAY,
      strokeWidth: STROKEWIDTH
    }, OpenLayers.Feature.Vector.style["default"]));
    styleMap.styles["default"].addRules(rules);
    geojson_format = new OpenLayers.Format.GeoJSON();
    vector_layer = new OpenLayers.Layer.Vector(name, {
      styleMap: styleMap
    });
    map.addLayer(vector_layer);
    vector_layer.addFeatures(geojson_format.read(json));
    return vector_layer;
  };

  JSONTooltip = function(name, json) {
    var geojson_format, selectCtrl, styleMap, vector_layer;
    styleMap = new OpenLayers.StyleMap(OpenLayers.Util.applyDefaults({
      fillColor: MEASURECOLOR,
      strokeColor: MEASURECOLOR,
      fillOpacity: 0.7
    }, OpenLayers.Feature.Vector.style["default"]));
    styleMap.styles["default"].addRules([
      new OpenLayers.Rule({
        filter: new OpenLayers.Filter.Comparison({
          type: OpenLayers.Filter.Comparison.EQUAL_TO,
          property: "selected",
          value: true
        }),
        symbolizer: {
          fillColor: SELECTEDMEASURECOLOR,
          strokeColor: SELECTEDMEASURECOLOR,
          fillOpacity: 0.7
        }
      }), new OpenLayers.Rule({
        elseFilter: true
      })
    ]);
    geojson_format = new OpenLayers.Format.GeoJSON();
    vector_layer = new OpenLayers.Layer.Vector(name, {
      styleMap: styleMap
    });
    map.addLayer(vector_layer);
    vector_layer.addFeatures(geojson_format.read(json));
    selectCtrl = new OpenLayers.Control.SelectFeature(vector_layer, {
      clickout: true,
      callbacks: {
        click: function(feature) {
          return showPopup(feature);
        }
      }
    });
    map.addControl(selectCtrl);
    selectCtrl.activate();
    return vector_layer;
  };

  showLabel = function(x, y, contents) {
    return $('<div id="label">#{contents}</div>').css({
      position: 'absolute',
      display: 'none',
      top: y + 5,
      left: x + 250,
      border: '1px solid #fdd',
      padding: '2px',
      'background-color': '#fee',
      opacity: 0.80
    });
  };

  showTooltip = function(x, y, name, type_name) {
    return $("<div id=\"tooltip\" class=\"popover top\">\n  <div class=\"popover-inner\">\n    <div class=\"popover-title\"><h3>" + name + "</h3></div>\n    <div class=\"popover-content\">Type: " + type_name + "</div>\n  </div>\n</div>").css({
      top: y - 35,
      left: x + 5
    }).appendTo("body").fadeIn(200);
  };

  showCityTooltip = function(x, y, contents) {
    return $("<div class=\"citytooltip\">" + contents + "</div>").css({
      position: "absolute",
      display: "none",
      top: y,
      left: x,
      color: "#262626",
      padding: "2px"
    }).appendTo("body").fadeIn(200);
  };

  setFlotSeries = function(data) {
    if (data.length > 0) {
      window.min_graph_value = data[0].location;
      window.max_graph_value = data[data.length - 1].location;
      setMeasureResultsGraph(data);
      return setMeasureSeries();
    }
  };

  setMeasureSeries = function() {
    var json_url;
    json_url = $('#blockbox-table').data('measure-list-url');
    return $.getJSON(json_url + '?' + new Date().getTime(), function(data) {
      return setMeasureGraph(data.measures, data.cities);
    });
  };

  setMeasureResultsGraph = function(json_data) {
    var ed_data, measures, num, options, pl_lines, reference, selected_river, vertex;
    vertex = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = json_data.length; _i < _len; _i++) {
        num = json_data[_i];
        _results.push([num.location, num.vertex_level]);
      }
      return _results;
    })();
    reference = [[window.min_graph_value, 0], [window.max_graph_value, 0]];
    measures = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = json_data.length; _i < _len; _i++) {
        num = json_data[_i];
        _results.push([num.location, num.measures_level]);
      }
      return _results;
    })();
    window.vertex = vertex;
    window.measures = measures;
    selected_river = $("#blockbox-river .chzn-select")[0].value;
    ed_data = [
      {
        label: "MHW-opgave",
        data: vertex,
        points: {
          show: false
        },
        lines: {
          show: true
        },
        color: GRAY
      }, {
        label: "Doelwaarde",
        data: reference,
        points: {
          show: false
        },
        lines: {
          show: true,
          lineWidth: 2
        },
        color: BLUE
      }, {
        label: "Effect maatregelen",
        data: measures,
        points: {
          show: false
        },
        lines: {
          show: true,
          lineWidth: 2
        },
        color: RED
      }
    ];
    options = {
      xaxis: {
        min: window.min_graph_value,
        max: window.max_graph_value,
        position: "top"
      },
      yaxis: {
        labelWidth: 21,
        reserveSpace: true,
        position: "left",
        tickDecimals: 1
      },
      grid: {
        minBorderMargin: 20,
        clickable: true,
        borderWidth: 1,
        axisMargin: 10
      },
      legend: {
        container: $("#measure_results_graph_legend"),
        labelFormatter: function(label, series) {
          var cb;
          cb = label;
          return cb;
        }
      }
    };
    pl_lines = $.plot($("#measure_results_graph"), ed_data, options);
    return window.topplot = pl_lines;
  };

  setMeasureGraph = function(control_data, cities_data) {
    var cities, city, city_points, d4, d5, graphx, graphy, key, label_mapping, measure, measures, measures_controls, non_selectable_measures, num, offset, options, pl_control, pl_lines, point, previousPoint, px, py, selected_measures, selected_river, text, value, width, yticks, _i, _j, _len, _len2, _ref, _ref2, _results;
    measures = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = control_data.length; _i < _len; _i++) {
        num = control_data[_i];
        if (num.selectable && !num.selected && num.show) {
          _results.push([num.km_from, num.type_index, num.name, num.short_name, num.measure_type]);
        }
      }
      return _results;
    })();
    selected_measures = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = control_data.length; _i < _len; _i++) {
        num = control_data[_i];
        if (num.selected && num.show) {
          _results.push([num.km_from, num.type_index, num.name, num.short_name, num.measure_type]);
        }
      }
      return _results;
    })();
    non_selectable_measures = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = control_data.length; _i < _len; _i++) {
        num = control_data[_i];
        if (!num.selectable && num.show) {
          _results.push([num.km_from, num.type_index, num.name, num.short_name, num.measure_type]);
        }
      }
      return _results;
    })();
    cities = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = cities_data.length; _i < _len; _i++) {
        city = cities_data[_i];
        _results.push([city[0], 8, city[1]]);
      }
      return _results;
    })();
    label_mapping = {};
    for (_i = 0, _len = control_data.length; _i < _len; _i++) {
      measure = control_data[_i];
      label_mapping[measure.type_index] = measure.type_indicator;
    }
    yticks = (function() {
      var _results;
      _results = [];
      for (key in label_mapping) {
        value = label_mapping[key];
        _results.push([key, value]);
      }
      return _results;
    })();
    yticks = _.sortBy(yticks, function(u) {
      return u[0];
    });
    selected_river = $("#blockbox-river .chzn-select")[0].value;
    d4 = void 0;
    d5 = void 0;
    pl_lines = void 0;
    options = {
      xaxis: {
        min: window.min_graph_value,
        max: window.max_graph_value,
        reserveSpace: true,
        position: "bottom"
      },
      yaxis: {
        reserveSpace: true,
        labelWidth: 21,
        position: "left",
        tickDecimals: 0,
        ticks: yticks
      },
      grid: {
        minBorderMargin: 20,
        clickable: true,
        hoverable: true,
        borderWidth: 1
      },
      legend: {
        container: $("#measures_legend")
      }
    };
    measures_controls = [
      {
        data: cities,
        points: {
          show: true,
          fillColor: BLACK
        },
        lines: {
          show: false
        },
        color: BLACK,
        hoverable: false
      }, {
        label: "Maatregelen",
        data: measures,
        points: {
          show: true,
          symbol: "square",
          radius: 2,
          fill: 1,
          fillColor: BLUE
        },
        lines: {
          show: false
        },
        color: BLUE
      }, {
        label: "Geselecteerde maatregelen",
        data: selected_measures,
        points: {
          show: true,
          symbol: "diamond",
          radius: 4,
          fill: true
        },
        lines: {
          show: false
        },
        color: RED
      }, {
        label: "Niet-selecteerbare maatregelen",
        data: non_selectable_measures,
        points: {
          show: true,
          symbol: "cross",
          radius: 4
        },
        lines: {
          show: false
        },
        color: GRAY
      }
    ];
    pl_control = $.plot($("#measure_graph"), measures_controls, options);
    $("#measure_graph").bind("plotclick", function(event, pos, item) {
      var callback, measure_id, result_id;
      if (item) {
        if (item.series.label === "Steden") return;
        pl_control.unhighlight(item.series, item.datapoint);
        result_id = item.series.data[item.dataIndex][1];
        measure_id = item.series.data[item.dataIndex][3];
        if (!graphTimer) {
          callback = function() {
            toggleMeasure(measure_id);
            return graphTimer = '';
          };
          return graphTimer = setTimeout(callback, 200);
        }
      }
    });
    previousPoint = null;
    $("#measure_graph").bind("plothover", function(event, pos, item) {
      var x, y;
      if (item) {
        if (item.pageX > ($(window).width() - 300)) item.pageX = item.pageX - 300;
        if (previousPoint !== item.dataIndex) {
          previousPoint = item.dataIndex;
          $("#tooltip").remove();
          x = item.datapoint[0].toFixed(2);
          y = item.datapoint[1].toFixed(2);
          return showTooltip(item.pageX, item.pageY, item.series.data[item.dataIndex][2], item.series.data[item.dataIndex][4]);
        }
      } else {
        $("#tooltip").remove();
        return previousPoint = null;
      }
    });
    $('.citytooltip').remove();
    city_points = pl_control.getData()[0];
    offset = $("#measure_graph").offset();
    graphx = offset.left;
    graphy = offset.top - 10;
    width = $(window).width() - 400;
    _ref = city_points.data;
    _results = [];
    for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
      point = _ref[_j];
      if ((window.min_graph_value <= (_ref2 = point[0]) && _ref2 <= window.max_graph_value)) {
        px = graphx + city_points.xaxis.p2c(point[0]);
        py = graphy + city_points.yaxis.p2c(point[1]);
        text = point[2];
        if (px > width && text.length > 5) px -= text.length * 4;
        _results.push(showCityTooltip(px, py, text));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  resize_graphs = function() {
    var doit;
    clearTimeout(doit);
    return doit = setTimeout(function() {
      $('#measure_results_graph').empty();
      $('#measure_graph').empty();
      $('#measure_results_graph').css('width', '100%');
      $('#measure_graph').css('width', '100%');
      return measuresMapView.render(false, false);
    }, 300);
  };

  $('.btn.collapse-sidebar').click(function() {
    return resize_graphs();
  });

  $('.btn.collapse-rightbar').click(function() {
    return resize_graphs();
  });

  doit = void 0;

  $(window).resize(function() {
    return resize_graphs();
  });

  window.resize_graphs = resize_graphs;

  $(".blockbox-toggle-measure").live('click', function(e) {
    e.preventDefault();
    return toggleMeasure($(this).data('measure-id'));
  });

  $("#blockbox-deselect-all-measures").live('click', function(e) {
    e.preventDefault();
    return deselectAllMeasures();
  });

  setup_map_legend = function() {
    $('.legend-riverlevel-9').css("background-color", RIVERLEVEL9);
    $('.legend-riverlevel-8').css("background-color", RIVERLEVEL8);
    $('.legend-riverlevel-7').css("background-color", RIVERLEVEL7);
    $('.legend-riverlevel-6').css("background-color", RIVERLEVEL6);
    $('.legend-riverlevel-5').css("background-color", RIVERLEVEL5);
    $('.legend-riverlevel-4').css("background-color", RIVERLEVEL4);
    $('.legend-riverlevel-3').css("background-color", RIVERLEVEL3);
    $('.legend-riverlevel-2').css("background-color", RIVERLEVEL2);
    $('.legend-riverlevel-1').css("background-color", RIVERLEVEL1);
    $('.legend-riverlevel-0').css("background-color", RIVERLEVEL0);
    $('.legend-measure').css("background-color", MEASURECOLOR);
    return $('.legend-selected-measure').css("background-color", SELECTEDMEASURECOLOR);
  };

  km_line_layer = function() {
    var wms;
    wms = new OpenLayers.Layer.WMS("5KM layer", "http://test-geoserver1.lizard.net/geoserver/deltaportaal/wms", {
      layers: "deltaportaal:5km_rivieren",
      transparent: true
    }, {
      opacity: 1
    });
    map.addLayer(wms);
    return undefined;
  };

  $(document).ready(function() {
    setup_map_legend();
    $("#blockbox-river .chzn-select").chosen().change(function() {
      selectRiver(this.value);
      return this;
    });
    updateVertex();
    $("#blockbox-vertex .chzn-select").chosen().change(function() {
      selectVertex(this.value);
      return this;
    });
    km_line_layer();
    $('#measures-table-top').tablesorter();
    return this;
  });

}).call(this);
