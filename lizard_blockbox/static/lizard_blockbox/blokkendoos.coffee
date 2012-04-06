#######################################################
# Backbone part                                          #
#######################################################

# Currently renders the measures on the left...

# Model
Measure = Backbone.Model.extend
    defaults:
        name: "Untitled measure"


# Collection
MeasureList = Backbone.Collection.extend
    model: Measure
    url: "/blokkendoos/api/measures/list/"


# View for single measure li element
MeasureView = Backbone.View.extend
    tagName: 'tr'

    # template: _.template $('#measure-template').html()

    initialize: ->
        @model.bind('change', @render, @)

    render: ->
        # @$el.html """<a href="#" class="padded-sidebar-item" data-measure-shortname="#{@model.toJSON().short_name}">#{@model.toJSON().short_name}</a>"""
        # @$el.html(@template(@model.toJSON()))
        @$el.html """<td>#{@model.toJSON().short_name}</td><td>(type)</td><td>(start km)</td>"""
        @


# View for measures list
MeasureListView = Backbone.View.extend
    el: $('#measures-table')

    id: 'measures-view'

    addOne: (measure) ->
        view = new MeasureView(model:measure)
        @$el.append(view.render().el)

    addAll: ->
        measure_list.each @addOne

    initialize: ->
        measure_list.bind 'add', @addOne, @
        measure_list.bind 'reset', @addAll, @
        measure_list.fetch({add:true})
        @render()

    render: ->
        @


# Instance of collection
measure_list = new MeasureList()

# Instance of measure list
window.measureListView = new MeasureListView();







#######################################################
# Graph part                                          #
#######################################################

showTooltip = (x, y, contents) ->
    $("<div id=\"tooltip\">#{contents}</div>").css(
        position: "absolute"
        display: "none"
        top: y - 35
        left: x + 5
        border: "1px solid #fdd"
        padding: "2px"
        backgroundcolor: "#fee"
    ).appendTo("body").fadeIn 200



setFlotSeries = ->
    setPlaceholderTop json_data.basecase_data, json_data.result_data
    setPlaceholderControl json_data.measure_control_data


refreshGraph = ->
    $.plot $("#placeholder_top"), ed_data, options


setPlaceholderTop = (basecase_data, result_data) ->

    ed_data = [
        data: json_data.basecase_data
        points:
            show: true
            symbol: "diamond"

        lines:
            show: true

        color: "blue"
    ,
        label: "Serie 1"
        data: json_data.result_data
        points:
            show: true
            symbol: "triangle"
            radius: 1

        lines:
            show: true
            lineWidth: 2

        color: "red"
    ]

    options =
        xaxis:
            position: "top"

    grid:
        clickable: true
        borderWidth: 1

    legend:
        show: true
        noColumns: 4
        container: $("#placeholder_top_legend")
        labelFormatter: (label, series) ->
            cb = label
            cb

    pl_lines = $.plot($("#placeholder_top"), ed_data, options)



setPlaceholderControl = (control_data) ->
    d4 = undefined
    d5 = undefined
    pl_lines = undefined

    options =
        xaxis:
            position: "bottom"

        grid:
            clickable: true
            borderWidth: 1

        legend:
            show: true
            noColumns: 4
            container: $("#placeholder_control_legend")
            labelFormatter: (label, series) ->
                cb = label
                cb

    measures_controls = [
        label: "Serie 2"
        data: control_data
        points:
            show: true
            symbol: "square"
            radius: 2

        lines:
            show: false

        color: "red"
    ,
        label: "Serie 3"
        data: d4
        points:
            show: true
            symbol: "triangle"
            radius: 1

        lines:
            show: false

        color: "green"
    ,
        data: d5
        points:
            show: false

        lines:
            show: true
            lineWidth: 1
            radius: 1

        color: "gray"
        shadowSize: 0
    ]

    pl_control = $.plot($("#placeholder_control"), measures_controls, options)

    $("#placeholder_control").bind "plotclick", (event, pos, item) ->
        if item
            pl_lines.unhighlight item.series, item.datapoint
            result_id = item.series.data[item.dataIndex][2].id
            refreshGraph()



options =
    xaxis:
        position: "top"

    grid:
        clickable: true
        borderWidth: 1

    legend:
        show: true
        noColumns: 4
        container: $("#placeholder_top_legend")
        labelFormatter: (label, series) ->
            cb = label
            cb

$(document).ready ->
    setFlotSeries()




$('.btn.collapse-sidebar').click ->
    clearTimeout doit
    doit = setTimeout(->
        $('#placeholder_top_legend').empty()
        $('#placeholder_top').empty()
        $('#placeholder_control').empty()
        $('#placeholder_control_legend').empty()

        $('#placeholder_top_legend').css('width', '100%')
        $('#placeholder_top').css('width', '100%')
        $('#placeholder_control').css('width', '100%')
        $('#placeholder_control_legend').css('width', '100%')

        $('#placeholder_top_legend').css('height', '0px')
        $('#placeholder_top').css('height', '150px')
        $('#placeholder_control').css('height', '100px')
        $('#placeholder_control_legend').css('height', '100px')

        setFlotSeries()
    ,500)


$('.btn.collapse-rightbar').click ->
    clearTimeout doit
    doit = setTimeout(->
        $('#placeholder_top_legend').empty()
        $('#placeholder_top').empty()
        $('#placeholder_control').empty()
        $('#placeholder_control_legend').empty()

        $('#placeholder_top_legend').css('width', '100%')
        $('#placeholder_top').css('width', '100%')
        $('#placeholder_control').css('width', '100%')
        $('#placeholder_control_legend').css('width', '100%')

        $('#placeholder_top_legend').css('height', '0px')
        $('#placeholder_top').css('height', '150px')
        $('#placeholder_control').css('height', '100px')
        $('#placeholder_control_legend').css('height', '100px')

        setFlotSeries()
    ,500)


$('.toggle_map_and_table').click (e) ->
    e.preventDefault()
    link = $('.toggle_map_and_table')
    parent = link.parent()
    to_table_text = parent.attr('data-to-table-text')
    to_map_text = parent.attr('data-to-map-text')
    if window.table_or_map == 'map'
        $('#map').hide 500, () =>
            $('#blockbox-table').show(500)
            $('.action-text', link).text(to_map_text)
        window.table_or_map = 'table'
        $('#blockbox-table').height($("#content").height() - 250)
    else
        $('#blockbox-table').hide 500, () =>
            $('#map').show(500)
            $('.action-text', link).text(to_table_text)
        window.table_or_map = 'map'


doit = undefined
$(window).resize ->
    clearTimeout doit
    doit = setTimeout(->
        $('#placeholder_top_legend').empty()
        $('#placeholder_top').empty()
        $('#placeholder_control').empty()
        $('#placeholder_control_legend').empty()

        $('#placeholder_top_legend').css('width', '100%')
        $('#placeholder_top').css('width', '100%')
        $('#placeholder_control').css('width', '100%')
        $('#placeholder_control_legend').css('width', '100%')

        $('#placeholder_top_legend').css('height', '0px')
        $('#placeholder_top').css('height', '150px')
        $('#placeholder_control').css('height', '100px')
        $('#placeholder_control_legend').css('height', '100px')

        setFlotSeries()
    , 100)


$(document).ready ->
    window.table_or_map = "map"
