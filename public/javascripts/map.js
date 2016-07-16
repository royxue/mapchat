mapboxgl.accessToken = 'pk.eyJ1Ijoicm95eHVlIiwiYSI6IjlkZjFkYTRiYzdlYTE5MGQyYjgzZjU5OWI0ZjhiNzM3In0.69Z8Hfaju1RfHIQaTKojcg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    center: [-122.0738, 37.422],
    zoom: 17
});



map.on('load', function(){
    var curLoc = function(position){
        map.getSource('curUser').setData(
            {
                "type": "Point",
                "coordinates": [
                    position.coords.longitude,
                    position.coords.latitude
                ]
            }
        );
    };

    var recenter = function(position){
        map.flyTo({
            "center": [
                    position.coords.longitude,
                    position.coords.latitude
        ]});
    }

    function addMoment(pos, desc, image){
        var content = "<div class='moment'><p>" + desc + "</p><img src='" + image +"'></img>"
        var moment = new mapboxgl.Popup({closeOnClock:false})
            .setLngLat(pos)
            .setHTML(content)
            .addTo(map);
    }

    map.addSource('curUser', {
        "type": "geojson",
        "data": {
            "type": "Point",
            "coordinates": [0, 0]
        }
    });

    map.addLayer({
        "id": 'curUser',
        "type": 'circle',
        "source": 'curUser',
        "paint": {
            "circle-radius": 13,
            "circle-color": "#149c82"
        }
    })

    navigator.geolocation.getCurrentPosition(recenter);
    window.setInterval(function(){navigator.geolocation.getCurrentPosition(curLoc);}, 1000);

    addMoment([-122.0738, 37.422], "hello world", "https://lh4.googleusercontent.com/-IhVc_Wxy6dY/AAAAAAAAAAI/AAAAAAAAFUw/YGRzJd5jolg/photo.jpg");

    $('#recenter').click(function(){
        navigator.geolocation.getCurrentPosition(recenter);
    });
});
