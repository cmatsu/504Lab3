var map = L.map('map').setView([1.352083, 103.819839], 14);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiY21hdHN1IiwiYSI6ImNraGNuNmw0YzAxajIyeXA1ZWE4aG80NDcifQ.3Y8_bQTBQeuNtqFL3OMBVw'
}).addTo(map);

var drawnItems = L.featureGroup().addTo(map);

new L.Control.Draw({
    draw : {
        polygon : true,
        polyline : false,
        rectangle : false,     // Rectangles disabled
        circle : false,        // Circles disabled
        circlemarker : false,  // Circle markers disabled
        marker: true
    },
    edit : {
        featureGroup: drawnItems
    }
}).addTo(map);

function createFormPopup() {
    var popupContent =
        '<form>' +
        'Title/Name of input:<br><input type="text" id="input_title"><br>' +
        'Description:<br><input type="text" id="input_desc"><br>' +
        '<input type="button" value="Submit" id="submit">' +
        '</form>'
    drawnItems.bindPopup(popupContent).openPopup();
}

map.addEventListener("draw:created", function(e) {
    e.layer.addTo(drawnItems);
    createFormPopup();
});

map.addEventListener("draw:created", function(e) {
    e.layer.addTo(drawnItems);
    drawnItems.eachLayer(function(layer) {
        var geojson = JSON.stringify(layer.toGeoJSON().geometry);
        console.log(geojson);
    });
});

function setData(e) {

    if(e.target && e.target.id == "submit") {

        // Get title and description
        var enteredTitle = document.getElementById("input_title").value;
        var enteredDescription = document.getElementById("input_desc").value;

        // Print title and description
        console.log(enteredDescription);
        console.log(enteredTitle);

        // Get and print GeoJSON for each drawn layer
        drawnItems.eachLayer(function(layer) {
            var drawing = JSON.stringify(layer.toGeoJSON().geometry);
            console.log(drawing);
        });

        // Clear drawn items layer
        drawnItems.closePopup();
        drawnItems.clearLayers();
    }
}

document.addEventListener("click", setData);
map.addEventListener("draw:editstart", function(e) {
    drawnItems.closePopup();
});
map.addEventListener("draw:deletestart", function(e) {
    drawnItems.closePopup();
});
map.addEventListener("draw:editstop", function(e) {
    drawnItems.openPopup();
});
map.addEventListener("draw:deletestop", function(e) {
    if(drawnItems.getLayers().length > 0) {
        drawnItems.openPopup();
    }
});


L.easyButton( '<i class="material-icons">info</i>', function(){
  alert("\nHow to draw on the map:\nPoints: Click on the map where you want to place the marker. \nPolygons: Click on the map where you want to start drawing the polygon, then keep clicking where you want the different points to be. Close the polygon by clicking the very first point.\n\nHow to submit data: Provide a title/name for the marker or polygon, and a description for it then submit.");
}, {position: 'topright'}).addTo(map);


window.onload(alert("This is an interactive map which allows you to draw points, lines, and polygons, and submit additional information about these inputs in a form."));
