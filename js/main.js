var mydata = null;
d3.select('#div_1').text("Changed!");
fetch('./data/img_map.json')
    .then(response => response.json())
    .then(data => mydata = data);

