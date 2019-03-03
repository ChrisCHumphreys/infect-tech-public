



var db = firebase.firestore();
var markers = [];
var map;

function initMap() {
  console.log("test");
  
  var options = {
    enableHighAcuracy: true,
    timeout: 5000,
    maximumAge: 0
  };
  
  
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 19,
    styles: [
      {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "saturation": 36
          },
          {
            "color": "#000000"
          },
          {
            "lightness": 40
          }
        ]
      },
      {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "visibility": "on"
          },
          {
            "color": "#000000"
          },
          {
            "lightness": 16
          }
        ]
      },
      {
        "featureType": "all",
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "administrative",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "color": "#000000"
          },
          {
            "lightness": 20
          }
        ]
      },
      {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#000000"
          },
          {
            "lightness": 17
          },
          {
            "weight": 1.2
          }
        ]
      },
      {
        "featureType": "administrative.province",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "visibility": "on"
          },
          {
            "color": "#ff0a00"
          }
        ]
      },
      {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#000000"
          },
          {
            "lightness": 20
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#000000"
          },
          {
            "lightness": 21
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "color": "#DAA520"
          },
          {
            "lightness": 17
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#DAA520"
          },
          {
            "lightness": 29
          },
          {
            "weight": 0.2
          }
        ]
      },
      {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#DAA520"
          },
          {
            "lightness": 18
          }
        ]
      },
      {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#DAA520"
          },
          {
            "lightness": 16
          }
        ]
      },
      {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#000000"
          },
          {
            "lightness": 19
          }
        ]
      },
      {
        "featureType": "transit.station.airport",
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "gamma": "1.00"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#ff1000"
          },
          {
            "lightness": 17
          }
        ]
      }
    ]
  });
  infoWindow = new google.maps.InfoWindow;
  
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      // var marker = new google.maps.Marker({
      //   position: pos,
      //   map: map,
      //   title: 'Hello World!'
      // });
      
      // marker.setMap(map);
      
      //infoWindow.setPosition(pos);
      //infoWindow.setContent('Location found.');
      //infoWindow.open(map);
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    }, options);
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
  }
  
  
  
  function addToGame(user_id) {
    var socket = new WebSocket('ws://lfreeze.ml:5000');
  
    // Connection opened
    socket.addEventListener('open', function (event) {
      socket.send('Hello Server!');
    });
 
    socket.addEventListener('message', function (event) {
      console.log('Message from server ', event.data);
    });

    document.getElementById('play').innerHTML = 'Quit';
    
    var docRef = db.collection("players").doc(String(user_id));
    
    var pos;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        docRef.get().then(function(doc) {
          if (doc.exists) {
            doc.lat = pos.lat;
            doc.lng = pos.lng;
          } else {
            db.collection("players").doc(String(user_id)).set({
              infected: false,
              lat: pos.lat,
              lng: pos.lng,
              u_id: Number(user_id),
            })
            .then(function(docRef) {
              console.log("Document written with ID: ", docRef.id);
            })
            .catch(function(error) {
              console.error("Error adding document: ", error);
            });
          }
          var marker = new google.maps.Marker({
            position: pos,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 5
            },
            map: map,
            title: 'player ' + user_id + ' here!'
          });
          
          marker.setMap(map);
          
        }).catch(function(error) {
          console.log("Error getting document:", error);
        });
        
        //console.dir(pos);
      })
    }
  }
  
  function getMarkers() {
    
    db.collection("players").get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        console.log(doc.id, " => ", doc.data());
        console.log(doc.data().lat);
        var image = {
          url: 'http://cs1.utm.edu/~adachis/images/biohazard.png',
          scaledSize: new google.maps.Size(50, 50)
        };
        var marker = new google.maps.Marker({
          position: {
            lat: Number(doc.data().lat),
            lng: Number(doc.data().lng)
          },
          icon: image,
          map:map,
          title: 'player ' + doc.data().u_id + ' here!'
        });
        
        markers.push(marker);
        console.log(markers);
        
        marker.setMap(map);
      })
      //testDistance(markers[1].position, markers[1].position);
    })};
    
    
    // Sets the map on all markers in the array.
    function setMapOnAll(map) {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
      }
    }
    
    
    function clearMarkers() {
      setMapOnAll(null);
    }
    
    function clearMap(u_id) {
      db.collection("players").get()
    }
    
    function setAllOnMap(map) {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
      }
      
      testDistance(markers[0].position, markers[1].position);
    }
    
    function deleteMarkers() {
      clearMarkers();
      markers = [];
    }
    
    function refreshMap(u_id) {
      deleteMarkers();
      var myPlayer = db.collection("players").doc(String(u_id));
      
      var pos;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var pos;
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
              pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              
              return myPlayer.update({
                lat: pos.lat,
                lng: pos.lng
              })
              .then(function () {
                console.log("Document good boy.")
              })
              
              
              console.dir(pos);
            })
          }
        }
        )}
        getMarkers();
        
        
      }
      
      function autoUpdate(u_id) {
        setInterval(function() { refreshMap(u_id); }, 3000);
      }
      
      
      function rad(x) {
        return x * Math.PI / 180;
      }
      
      
      function getDistance(p1, p2) {
        var R = 6378137; // Earth’s mean radius in meter
        var dLat = rad(p2.lat() - p1.lat());
        var dLong = rad(p2.lng() - p1.lng());
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d; // returns the distance in meter
      }
      
      function testDistance(p1, p2) {
        var dist = getDistance(p1, p2);
        console.log(dist);
      }
      
      
      
      // // Connection opened
      // socket.addEventListener('open', function (event) {
      //   socket.send('Hello Server!');
      // });
      
      // Listen for messages
      // socket.addEventListener('message', function (event) {
      //   console.log('Message from server ', event.data);
      // });