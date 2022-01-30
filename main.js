d3.select('#div_1').text("Changed!");
fetch('./data/img_map.json.gz')
    .then(response => response.json())
    .then(data => console.log(data));

