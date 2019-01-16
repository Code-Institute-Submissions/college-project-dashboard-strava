queue()
    .defer(d3.csv, "data/barry.strava.csv")
    .await(makeGraphs);
    
function makeGraphs(error, barryActivities) {
    var ndx = crossfilter(barryActivities);

    var parseDate = d3.time.format("%m/%d/%Y").parse;
    barryActivities.forEach(function(d){
        d.date = parseDate(d.date);
    });    

    barryActivities.forEach(function(d){
        d.distance_km = parseInt(d.distance_km);
        d.calories = parseInt(d.calories);
    })

    show_gear_balance(ndx);
    show_day_of_the_week_balance(ndx);
    
    show_distance_to_calories_correlation(ndx);
    
    show_activity_distances(ndx);
    
    dc.renderAll();
}

function show_gear_balance(ndx) {
    var dim = ndx.dimension(dc.pluck('gear'));
    var group = dim.group();
    
    dc.barChart("#gear")
        .width(400)
        .height(200)
        .margins({top:10, right: 10, bottom: 40, left: 30})
        .dimension(dim)
        .group(group)
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .xAxisLabel("Gear")
        .yAxisLabel("Amount")
        .yAxis().ticks(10);
}

function show_day_of_the_week_balance(ndx) {
    var dim = ndx.dimension(dc.pluck('day_of_the_week'));
    var group = dim.group();
    
    dc.barChart("#day_of_the_week")
        .width(600)
        .height(200)
        .margins({top:10, right: 10, bottom: 40, left: 30})
        .dimension(dim)
        .group(group)
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .xAxisLabel("Day of the Week")
        .yAxisLabel("Amount")
        .yAxis().ticks(10);
}

function show_distance_to_calories_correlation(ndx) {
    
    var gearColors = d3.scale.ordinal()
        .domain(["BeOne Mistral", "Orbea M20", "Voodoo Hoodoo"])
        .range(["black", "orange", "red"]);
    
    var distDim = ndx.dimension(dc.pluck("distance_km"));
    var calsDim = ndx.dimension(function(d) {
        return [d.distance_km, d.calories, d.gear];
    });
    var distanceCaloriesGroup = calsDim.group();
    
    var minDistance = distDim.bottom(1)[0].distance_km;
    var maxDistance = distDim.top(1)[0].distance_km;
    
    dc.scatterPlot("#distance_calories")
        .width(600)
        .height(400)
        .x(d3.scale.linear().domain([minDistance, maxDistance]))
        .brushOn(false)
        .symbolSize(8)
        .clipPadding(10)
        .yAxisLabel("Calories")
        .xAxisLabel("Activity Distance")
        .title(function(d){
            return "Distance of " + d.key[0] + "km burned " + d.key[1] + " calories";
        })
        .colorAccessor(function(d){
            return d.key[2];
        })
        .colors(gearColors)
        .dimension(calsDim)
        .group(distanceCaloriesGroup)
        .margins({top: 10, right: 50, bottom: 50, left: 60});
}

function show_activity_distances(ndx) {

    var date_dim = ndx.dimension(dc.pluck('date'));
    var total_distance_km_per_date = date_dim.group().reduceSum(dc.pluck('distance_km'));
    var minDate = date_dim.bottom(1)[0].date;
    var maxDate = date_dim.top(1)[0].date;
    dc.lineChart("#distance")
        .width(1000)
        .height(300)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(date_dim)
        .group(total_distance_km_per_date)
        .transitionDuration(500)
        .x(d3.time.scale().domain([minDate,maxDate]))
        .yAxisLabel("Distance")
        .xAxisLabel("Month")
        .yAxis().ticks(10);
}