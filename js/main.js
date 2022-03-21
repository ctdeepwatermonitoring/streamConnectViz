var imgs = null;
var wk = null; //default starting week in chronological order (1 is oldest null will take newest)

// map options
const options = {
    center: [41.519, -72.6617],
    zoom: 9
  }

// instantiate Leaflet map
const map = L.map('map', options);

// add CARTO voyager tiles with no labels
L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager_nolabels/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, ' +
        '&copy;<a href="https://carto.com/attribution">CARTO</a>'
}).addTo(map);

var linestyle = {
    "color": "black",
    "weight": 1,
};

$.getJSON("data/ctStateBoundary.geojson",function(linedata){
    L.geoJson(linedata,{
        style:linestyle
    }).addTo(map);
});

var svg = d3.select("#control")
    .append("svg")
    .attr("width", 200)
    .attr("height", 100)
    .style("border", "1px solid black");

var text = svg.selectAll("text")
    .data([0])
    .enter()
    .append("text")
    .text("Testing")
    .attr("x", "40")
    .attr("y", "60");

var imgs = svg.selectAll("img");
imgs.enter()
    .append("img")
    .attr("xlink:href", "/img/logo2.png")
.attr("x", "60")
    .attr("y", "60")
    .attr("width", "20")
    .attr("height", "20");

// load the geojson site data points and attach to the map
d3.json('data/sites.geojson').then((data) => {
    L.geoJson(data).addTo(map);
    console.log(data);
});

d3.json('data/img_map.json').then((data) => {

    //given the array of image names, select the deployment that has more images or lower labels
    function select_deployment(sid_data){

    }

    //take the image paths and generate the thumbnail grid with labeled rects-------------------------------------------
    function render_week_grid(wk,img_w,img_h){
        console.log(wk);
        var sids   = Object.keys(wk['data']);
        var width  = (img_w*0.95)*8;
        var height = (img_h*0.95)*sids.length;
        var margin = {'top':4,'bottom':4,'left':4,'right':4}
        var day_idx = {"Mon":0, "Tues":1, "Wed":2, "Thur":3, "Fri":4, "Sat":5, "Sun":6};
        var sid_idx = {}
        for(var i=0;i<sids.length;i++){ sid_idx[sids[i]] = i; }
        var data = [];
        for(var i=0;i<sids.length;i++){
            if(wk['data'][sids[i]].length<=7){ //skip multiple deployments for now...
                for(var j=0; j<wk['data'][sids[i]].length;j++){
                    var raw = wk['data'][sids[i]][j]; //get one row of data
                    var row = {'sid':sids[i],'sid_idx':sid_idx[sids[i]], 'label':raw[2],
                               'date':raw[3],'day_idx':day_idx[raw[5]],'img':raw[1]};
                    data.push(row);
                }
            }else{ //deal with sids that have multiple deployments...

            }
        }
        console.log(data);
        d3.select('#grid').html(''); //clear the images..
        var svg = d3.select('#grid').append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        svg.selectAll('svg')
            .data(data)
            .enter().append('svg:image')
            .attr('x', function(d) {         return (d.day_idx+1)*img_w*0.95; })
            .attr('y', function(d) {         return d.sid_idx*img_h*0.95; })
            .attr('xlink:href', function(d){ return 'thumbs/'+d.img; })
            .attr('width', img_w*0.9)
            .attr('height', img_h*0.9);
    }//-----------------------------------------------------------------------------------------------------------------

    imgs = data;
    wks = Object.keys(imgs);
    if(wk==null){ wk = wks[wks.length-1]; }
    var input_node   = '<input id="week_slider" type="range" min="1" max='+
        wks.length.toString()+'' + ' value="'+wk.toString()+'" step="1">';
    var output_node  = '<div id="week_display"></div>';
    d3.select('#control')
        .html(output_node+input_node)
        .on('input',function(d){
            wk = imgs[document.getElementById('week_slider').value];
            d3.select('#week_display').text(wk['weekstart_date']);
        })
        .on('change',function(d){
            wk = imgs[document.getElementById('week_slider').value];
            render_week_grid(wk,240,120); //load the grid here
        })
    wk = imgs[document.getElementById('week_slider').value];
    d3.select('#week_display').text(wk['weekstart_date']);
});