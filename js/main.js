var imgs = null;
var wk = null; //default starting week in chronological order (1 is oldest null will take newest)
var sids = null;
var lastsitesLayer = null;

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

var boundary = {
    "color": "black",
    "weight": 1,
};

$.getJSON("data/ctStateBoundary.geojson",function(linedata){
    L.geoJson(linedata,{
        style:boundary,
    }).addTo(map);
});
// load the geojson site data points and attach to the map
d3.json('data/sites.geojson').then((map_data) => {
    d3.json('data/img_map.json').then((img_data) => {

        //given the array of image names, select the deployment that has more images or lower labels
        function select_deployment(sid_data) {
            //TODO
        }
/*        function get_labels(sids){
            var labels =[];
            var data =[];
            var sids = Object.keys(wk['data']);
            for(var i=0; i<data.length; i++) {
                labels[sids[i]] = data[i]['label'];
            }
/!*            for(var i=0; i<data.length; i++) {
                var sid = data[i]['sid'];
                labels[sid].push(data[i]['label']);
                break;
            }*!/
            console.log(labels);
        }*/

        function date_cal(curdate){
            var result='';
            return result;
            //todo
        }
        function getColor(d){
            return d == '1' ? '#de7622':
                d == '2' ? '#b0c324' :
                    d == '3' ? '#169873' :
                        d == '4' ? '#1a9cc8' :
                            'white';
        }

        function render_map(sids) {
            var features_sids = [];
            var features = map_data['features'];
            //console.log(features);

            for(var i=0; i<features.length; i++){
                for(var j=0; j<sids.length; j++){
                    if(features[i]['properties']['staSeq'].toString()==sids[j]) {
                        features_sids.push(features[i]);
                        break;
                    }
                }
            }
            //console.log(features_sids);

            var presence_options = {
                radius: 4.0,
                fillColor: "rgb(255,255,255)",
                color: "rgb(50,50,50)",
                //color:getColor(features.properties.labels),
                //fillColor: getColor(features.properties.labels),
                opacity: 0.8,
                fillOpacity: 0.6
            };

            if(lastsitesLayer!=null){ map.removeLayer(lastsitesLayer) };
            lastsitesLayer = L.geoJSON({type: "FeatureCollection",features:features_sids},{
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, presence_options);
                }//,onEachFeature: onEachFeature
            }).addTo(map);
            lastsitesLayer.bringToBack();
        }


        //take the image paths and generate the thumbnail grid with labeled rects-------------------------------------------
        function render_week_grid(wk, img_w, img_h) {
            var sids = Object.keys(wk['data']);
            var width = (img_w * 0.95) * 8;
            var height = (img_h * 0.95) * sids.length;
            var margin = {'top': 4, 'bottom': 4, 'left': 4, 'right': 4}
            var day_idx = {"Mon": 0, "Tues": 1, "Wed": 2, "Thur": 3, "Fri": 4, "Sat": 5, "Sun": 6};
            var sid_idx = {}
            for (var i = 0; i < sids.length; i++) {
                sid_idx[sids[i]] = i;
            }
            var data = [];
            var curdate="";
            for (var i = 0; i < sids.length; i++) {
                if (wk['data'][sids[i]].length <= 7) { //skip multiple deployments for now..
                    //console.log(wk['weekstart_date']);
                    var count =-1;
                    for (var j = 0; j < wk['data'][sids[i]].length; j++) {
                        var raw = wk['data'][sids[i]][j]; //get one row of data

                        var row = {
                            'sid': sids[i], 'sid_idx': sid_idx[sids[i]], 'label': raw[2],
                            'date': raw[3], 'day_idx': day_idx[raw[5]], 'img': raw[1]
                        };

                        data.push(row);
                        count++;
                        curdate = raw[3];
                    }
                    while (count < 6){
                        var row = {
                            'sid': sids[i], 'sid_idx': sid_idx[sids[i]], 'label': 'NA',
                            'date': 'NA', 'day_idx': count+1, 'img': 'placeholder.jpg',
                        };
                        data.push(row);
                        count++;
                        /*console.log(row);*/

                    }
                } else { //deal with sids that have multiple deployments...
                //console.log(sids);
                }
            }
            var  labels =[];
            for(var i=0; i<data.length; i++) {
                labels[sids[i]] = data[i]['label'];
            }
/*            for(var i=0; i<data.length; i++) {
                var sid = data[i]['sid'];
                //labels[sid].push(data[i]['label']);
                break;
            }*/
            console.log(labels);
            console.log(sids);
            //console.log(data);
            d3.select('#grid').html(''); //clear the images..

            var svg = d3.select('#grid').append('svg')
                .attr("width", width + margin.left + margin.right)

                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            svg.selectAll('svg')
                .data(sids)
                .enter().append('text')
                .attr('x', (img_w * 0.95/3))
                .attr('y', function(d, i){
                    return (i+0.5) * img_h*0.95
                })
                .html(function (d){
                    return d;});

            svg.selectAll('svg')
                .data(data)
                .enter().append('svg:image')
                .attr('x', function (d) {
                    return (d.day_idx + 1) * img_w * 0.95;
                })
                .attr('y', function (d) {
                    return d.sid_idx * img_h * 0.95;
                })
                .attr('xlink:href', function (d) {
                    return 'thumbs/' + d.img;
                })
                .attr('width', img_w * 0.9)
                .attr('height', img_h * 0.9);

        }//-----------------------------------------------------------------------------------------------------------------


        imgs = img_data;
        wks = Object.keys(imgs);
        if (wk == null) { wk = wks[wks.length-1]; }
        var input_node = '<input id="week_slider" type="range" min="1" max=' +
            wks.length.toString() + '' + ' value="' + wk.toString() + '" step="1">';
        var output_node = '<div id="week_display"></div>';
        d3.select('#control')
            .html(output_node + input_node)
            .on('input', function (d) {
                wk = imgs[document.getElementById('week_slider').value];
                d3.select('#week_display').text(wk['weekstart_date']);
            })
            .on('change', function (d) {
                wk = imgs[document.getElementById('week_slider').value];
                sids = Object.keys(wk['data']);
                //console.log(sids);
                //labels=get_labels(data,sids);
                //render_map(sids, labels);
                render_map(sids);
                render_week_grid(wk, 240, 120); //load the grid here
                //get_labels(sids);
            })
        wk = imgs[document.getElementById('week_slider').value];
        d3.select('#week_display').text(wk['weekstart_date']);

    });
});
