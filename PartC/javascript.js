var map = L.map('map').setView([47.258728, -122.465973], 14);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiY21hdHN1IiwiYSI6ImNraGNuNmw0YzAxajIyeXA1ZWE4aG80NDcifQ.3Y8_bQTBQeuNtqFL3OMBVw'
}).addTo(map);

var drawnItems = L.featureGroup().addTo(map);
var cartoData = L.layerGroup().addTo(map);
var url = "https://cmatsu.carto.com/api/v2/sql";
var urlGeoJSON = url + "?format=GeoJSON&q=";
var sqlQuery = "SELECT the_geom, animals, lost_found, pet_name, phone_number, color, other_notes FROM lab_3c_chiaki";
function addPopup(feature, layer) {
    layer.bindPopup(
        "<b>" + feature.properties.animals + "</b><br><b>" +
        feature.properties.lost_found + "</b><br><b>" +
        feature.properties.pet_name + "</b><br><b>" +
        feature.properties.phone_number + "</b><br><b>" +
        feature.properties.color + "</b><br><b>" +
        feature.properties.other_notes + "</b>"
    );
}

fetch(urlGeoJSON + sqlQuery)
    .then(function(response) {
    return response.json();
    })
    .then(function(data) {
        L.geoJSON(data, {onEachFeature: addPopup}).addTo(cartoData);
    });
new L.Control.Draw({
    draw : {
        polygon : false,
        polyline : false,
        rectangle : false,     // Rectangles disabled
        circle : false,        // Circles disabled
        circlemarker : true,  // Circle markers disabled
        marker: false
    },
    edit : {
        featureGroup: drawnItems
    }
}).addTo(map);

function createFormPopup() {
    var popupContent =
    '<form>' + '<label for="animals">Select type of animal:</label>' +
    '<select name="animals" id="animals">' +
        '<option value="dog">Dog</option>' +
        '<option value="cat">Cat</option>' +
        '<option value="bird">Bird</option>' +
      '</select><br><br>' +
      '<label for="status">Is this animal lost or found?:</label>' +
      '<select name="lost_found" id="lost_found">' +
        '<option value="lost">Lost</option>' +
        '<option value="found">Found</option>' +
      '</select><br><br>' +
      'Pet\'s Name:<br><input type="text" id="pet_name"><br><br>' +
      'Phone Number:<br><input type="text" id="phone_number"><br><br>' +
      'Color (eye/fur):<br><input type="text" id="color"><br><br>' +
      'Other Notes:<br><input type="text" id="other_notes"><br><br>' +
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
        var animalType = document.getElementById("animals").value;
        var lostOrFound = document.getElementById("lost_found").value;
        var petName = document.getElementById("pet_name").value;
        var phoneNumber = document.getElementById("phone_number").value;
        var color = document.getElementById("color").value;
        var otherNotes = document.getElementById("other_notes").value;

        // For each drawn layer
    drawnItems.eachLayer(function(layer) {

			// Create SQL expression to insert layer
            var drawing = JSON.stringify(layer.toGeoJSON().geometry);
            var sql =
                "INSERT INTO lab_3c_chiaki (the_geom, animals, lost_found, pet_name, phone_number, color, other_notes) " +
                "VALUES (ST_SetSRID(ST_GeomFromGeoJSON('" +
                drawing + "'), 4326), '" +
                animalType + "', '" +
                lostOrFound + "', '" +
                petName + "', '" +
                phoneNumber + "', '" +
                color + "', '" +
                otherNotes + "')";
            console.log(sql);

            // Send the data
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: "q=" + encodeURI(sql)
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                console.log("Data saved:", data);
            })
            .catch(function(error) {
                console.log("Problem saving the data:", error);
            });

        // Transfer submitted drawing to the CARTO layer
        //so it persists on the map without you having to refresh the page
        var newData = layer.toGeoJSON();
        newData.properties.animals = animalType;
        newData.properties.lost_found = lostOrFound;
        newData.properties.pet_name = petName;
        newData.properties.phone_number = phoneNumber;
        newData.properties.color = color;
        newData.properties.other_notes = otherNotes;

        L.geoJSON(newData, {onEachFeature: addPopup}).addTo(cartoData);

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
  alert("\nHow to draw on the map:\nPoints: Click on the map where you want to place the marker. \nPolygons: Click on the map where you want to start drawing the polygon, then keep clicking where you want the different points to be. Close the polygon by clicking the very first point.\n\nHow to submit data: Please fill out all five properties (you may fill out other notes section if necessary) then submit when ready.");
}, {position: 'topright'}).addTo(map);


window.onload(alert("This is an interactive map which allows pet owners and animal lovers to exchange information about lost and found pets (dogs, cats, birds)"));
