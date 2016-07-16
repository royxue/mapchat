mapboxgl.accessToken = 'pk.eyJ1Ijoicm95eHVlIiwiYSI6IjlkZjFkYTRiYzdlYTE5MGQyYjgzZjU5OWI0ZjhiNzM3In0.69Z8Hfaju1RfHIQaTKojcg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    center: [-122.0738, 37.422],
    zoom: 17
});

var socket = io();

function addMoment(pos, desc, image){
    var content = "<div class='moment'><p>" + desc + "</p><img src='" + image +"'></img>"
    var moment = new mapboxgl.Popup({closeOnClick:false})
        .setLngLat(pos)
        .setHTML(content)
        .addTo(map);
}

function getUsername(){
    if ($('#username').length > 0){
        return $('#username')[0].innerHTML
    } else {
        return undefined
    }
    
}

function getToUsername(){
    if ($('#hint').length > 0){
        return $('#hint')[0].innerHTML        
    } else {
        return undefined
    }
}

function sendSocket(username, pos){
    var sendData = {};
    sendData.username = username;
    sendData.geomsg = {
        longitude: pos[0],
        latitude: pos[1]
    };
    socket.emit("sendgeomsg", sendData);
}

function fitIntoBounds(pos){
    bounds = map.getBounds().toArray();
    // [[-73.9876, 40.7661], [-73.9397, 40.8002]]
    if (pos[0] < bounds[0][0]) {
        bounds[0][0] = pos[0]
    }
    if (pos[1] < bounds[0][1]) {
        bounds[0][1] = pos[1]
    }
    if (pos[0] > bounds[1][0]) {
        bounds[1][0] = pos[0]
    }
    if (pos[1] > bounds[1][1]) {
        bounds[1][1] = pos[1]
    }
    map.fitBounds(bounds);
}

map.on('load', function(){
    var curLoc = function(position){
        var username = getUsername()
        var pos = [position.coords.longitude, position.coords.latitude]
        if (username != undefined) {
            sendSocket(username, pos);
        }
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
    };

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
    });

    navigator.geolocation.getCurrentPosition(recenter);

    var getCurLocation = function(position) {
        $('.longitude_input').val(position.coords.longitude);
        $('.latitude_input').val(position.coords.latitude);
    };

    navigator.geolocation.getCurrentPosition(getCurLocation);

    window.setInterval(function(){
        navigator.geolocation.getCurrentPosition(curLoc);
    }, 1000);

    window.setInterval(function(){
        var toUser = getToUsername()
        if (toUser != undefined && toUser != "WalkChat") {
            socket.emit('getgeomsg', {username: toUser});          
        }
    });

    addMoment([-122.0738, 37.422], "Hi~", "https://media.licdn.com/mpr/mpr/shrinknp_400_400/AAEAAQAAAAAAAAlJAAAAJGEwNmM5MzIzLTk0NWEtNDBjZS04ODliLTRlMWUyODQ1OWNjZA.jpg");

    $('#recenter').click(function(){
        navigator.geolocation.getCurrentPosition(recenter);
    });


    map.addSource('toUser', {
        "type": "geojson",
        "data": {
            "type": "Point",
            "coordinates": [0, 0]
        }
    });

    map.addLayer({
        "id": 'toUser',
        "type": 'circle',
        "source": 'toUser',
        "paint": {
            "circle-radius": 13,
            "circle-color": "#FF0000"
        }
    });

    socket.on('getgeomsg', function(data){
        map.getSource('toUser').setData(
            {
                "type": "Point",
                "coordinates": data
            }
        );  
    });
});


map.on('dblclick', function(e){
    addMoment(map.unproject(e.point), "Hi~", "https://media.licdn.com/mpr/mpr/shrinknp_400_400/AAEAAQAAAAAAAAlJAAAAJGEwNmM5MzIzLTk0NWEtNDBjZS04ODliLTRlMWUyODQ1OWNjZA.jpg"); 
})
