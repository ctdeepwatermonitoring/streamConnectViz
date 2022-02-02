var mydata = null;
d3.select('#div_1').text("Changed!");
fetch('./data/img_map.json')
    .then(response => response.json())
    .then(data => mydata = data);

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
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
}).addTo(map);

d3.json('data/sites.geojson').then((data) => {
    L.geoJson(data).addTo(map)
});