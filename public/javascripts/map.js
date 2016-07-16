mapboxgl.accessToken = 'pk.eyJ1Ijoicm95eHVlIiwiYSI6IjlkZjFkYTRiYzdlYTE5MGQyYjgzZjU5OWI0ZjhiNzM3In0.69Z8Hfaju1RfHIQaTKojcg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    center: [-122.0738, 37.422],
    zoom: 17
});



map.on('load', function(){
    var curLoc = function(position){
        map.flyTo({
            "center": [
                    position.coords.longitude,
                    position.coords.latitude
        ]});
        map.getSource('curUser').setData(
            {
                "type": "Point",
                "coordinates": [
                    position.coords.longitude,
                    position.coords.latitude
                ]
            }
        );
    }

    map.addSource('curUser', {
        "type": "geojson",
        "data": {
            "type": "Point",
            "coordinates": [0, 0]
        }
    });

    window.setInterval(navigator.geolocation.getCurrentPosition(curLoc), 1000);

    map.addLayer({
        "id": 'curUser',
        "type": 'circle',
        "source": 'curUser',
        "paint": {
            "circle-radius": 14,
            "circle-color": "#149c82"
        }
    })
});
