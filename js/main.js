const x_coord = 52.488416,
      y_coord = 13.3648,
      zoom_level = 16;
      pointsOfInterestSchoeneberg = [
        {title: "Rüyam Gemüse Kebap", location: {lat: 52.4846852, lng: 13.3517541}},
        {title: "DoubleEye", location: {lat: 52.4879186, lng: 13.3518287}},
        {title: "Billiadaire", location: {lat: 52.4884271, lng: 13.3632407}},
        {title: "Späti", location: {lat: 52.486105, lng: 13.364979}},
        {title: "Kuchenladen", location: {lat: 52.486469, lng: 13.362706}},
        {title: "Bäcker", location: {lat: 52.487854, lng: 13.3641477}},
        {title: "Türkischer Gemüsemarkt", location: {lat: 52.491586, lng: 13.366603}},
        {title: "U-Bahnstation", location: {lat: 52.4901553, lng: 13.3600624}},
        {title: "Scheinbar", location: {lat: 52.4881716, lng: 13.3646204}}
      ];


let map,
    markers,
    bounds,
    largeInfoWindow,
    animation,
    vm;


function initMap() {

  //Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById("mapID"), {
    center: {lat: x_coord, lng: y_coord },
    zoom: zoom_level
  });
  animation = google.maps.Animation.DROP;
  bounds = new google.maps.LatLngBounds();
  largeInfoWindow = new google.maps.InfoWindow();

  ko.applyBindings(new MapViewModel());

};


function MapViewModel(){

 // Creating your markers as a part of your ViewModel is allowed (and recommended). Creating them as Knockout observables is not.

  let self = this;
  self.poiList = ko.observableArray([]);
  self.filter = ko.observable("");

  pointsOfInterestSchoeneberg.forEach(function(poi){

    let _location = new Location(poi);
    self.poiList.push(_location);
    markerModel.addMarker(new Marker(_location));
  });

  this.highlightPoi = function(_selectedPoi){
    markerView.bounce(markerModel.getMarkerByTitle(_selectedPoi.title()));
  }


  self.filteredPoiList = ko.computed(function() {
      let _filter = self.filter().toLowerCase();
      if (!_filter) {
          markerView.showAllMarkers();
          return self.poiList();
      } else {
          return ko.utils.arrayFilter(self.poiList(), function(poi) {

            if(!poi.title().toLowerCase().includes(_filter)){
              markerView.hideMarker(markerModel.getMarkerByTitle(poi.title()));
              return false;
            }
            markerView.showMarker(markerModel.getMarkerByTitle(poi.title()));
            return true;
          });
      }
  });
};


let markerModel = {

  addMarker: function(marker){

    if (markers === undefined)
        markers = new Map();

      marker.addListener("click", function(){
        markerView.populateInfoWindow(this, largeInfoWindow);
      });
      markers.set(marker.title, marker);
      markerView.render();
  },

  getMarkers: function(){
    return markers;
  },

  removeMarker: function(marker){
    markers.delete(marker.title());
    markerView.render();
  },

  getMarkerByTitle: function(_title){
    return markers.get(_title);
  }


};

let markerView = {

  populateInfoWindow: function(marker, infowindow){
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      infowindow.setContent("<div>" + marker.title + "</div>");
      infowindow.open(map, marker);
      infowindow.addListener("closeclick", function(){
        infowindow.marker = null;
      });
    }
  },

  render: function(){
    markers.forEach(function(marker){
      marker.setVisible(true);
      bounds.extend(marker.position);
    });
  },

  bounce: function(_marker){

      _marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){
      _marker.setAnimation(null);
    }, 2000);
  },

  hideMarker: function(_marker){
    _marker.setVisible(false);
  },

  showMarker: function(_marker){
    _marker.setVisible(true);
  },

  hideAllMarkers: function(){
    markers.forEach(function(marker){
      marker.setVisible(false);
    })
  },

  showAllMarkers: function(){
    markers.forEach(function(marker){
      marker.setVisible(true);
    })
  }

};




// let InfoWindow = function(_marker, _content){
//
//   let _infoWindow = new google.maps.InfoWindow({
//   content: "Do you ever feel like an InfoWindow, floating through the wind," +
//     "ready to start again?"
//   });
//   _marker.addListener("click", function() {
//     _infowindow.open(map, _marker);
//   });
//   return _infowindow;
// };



let Marker = function(poi){

  return new google.maps.Marker({
    map: map,
    position: poi.location(),
    title: poi.title(),
    animation: animation,
    visible: false,
    draggable: true
  });
}


let Location = function(_poi) {
    this.title = ko.observable(_poi.title);
    this.xPos = ko.observable(_poi.location.lat);
    this.yPos = ko.observable(_poi.location.lng);
    this.location = ko.observable(_poi.location);
};


let logoutError = function(error){
  console.log("Error: " + error);
};



const BASE_URL_YELP = "api.yelp.com/v3/businesses/search?";
const SEARCH_LOCATION_YELP = "Berlin";
const API_KEY_YELP = "ErlaemKLG_MLQgDRn-bij1BPxVoPXMpML7A2ZPi0dwLpD_OCcxop_3GOkLlGnqM9B7zZgUo38U21CjPAEQN0049in76jR3UYGSSg72fxH75vPIruoCEtUdjWgnp1WnYx";


let get = function(url){
  return fetch(url)
};

let getJSON = function(url){
  return get(url)
  .then(function(data){
    return data.json();
  })
  .catch(function(error){
    logoutError(error);
  })
};




  // if (_provider === "yelp"){
  //   baseUrl = BASE_URL_YELP;
  //   location = SEARCH_LOCATION_YELP;
  //   term = _term;
  //   authorization = API_KEY_YELP;


    // GET /v3/businesses/search?location=Berlin&amp;term=Viktoriapark HTTP/1.1
    // Host: api.yelp.com
    // Authorization: Bearer ErlaemKLG_MLQgDRn-bij1BPxVoPXMpML7A2ZPi0dwLpD_OCcxop_3GOkLlGnqM9B7zZgUo38U21CjPAEQN0049in76jR3UYGSSg72fxH75vPIruoCEtUdjWgnp1WnYx
    // Cache-Control: no-cache
    // Postman-Token: 5dc689c2-588b-bda7-d1ed-74da4c8ce38f

// let wiki = function(){
// console.log("hier gehts auch nicht?");
//     var settings = {
//       "async": true,
//       "crossDomain": true,
//       "url": "https://api.yelp.com/v3/businesses/search?location=Berlin&term=Viktoriapark",
//       "method": "GET",
//       "headers": {
//         "Authorization": "Bearer foni_QRqBBuro72R9e1Tgmkhj01AwOrKrkE6VK-9GMsKyogsA3WRhhDU7fR9sgkK35cxwsniP8dlkjgwYu3L1Omb77nHj5lKeyanqnW1IKFarJMlr6e4zN6P1SB2WnYx",
//         "Cache-Control": "no-cache",
//
//       }
//     }
//
//     $.ajax(settings).done(function (response) {
//       console.log(response);
//     });
// };


// GET /v3/businesses/search?location=Berlin&amp;term=Viktoriapark HTTP/1.1
// Host: api.yelp.com
// Authorization: Bearer ErlaemKLG_MLQgDRn-bij1BPxVoPXMpML7A2ZPi0dwLpD_OCcxop_3GOkLlGnqM9B7zZgUo38U21CjPAEQN0049in76jR3UYGSSg72fxH75vPIruoCEtUdjWgnp1WnYx
// Cache-Control: no-cache
// Postman-Token: 9a827776-1a5c-a552-ed90-cd13b30c05c9





// var myHeaders = new Headers();
//     myHeaders.append('Authorization', 'Bearer foni_QRqBBuro72R9e1Tgmkhj01AwOrKrkE6VK-9GMsKyogsA3WRhhDU7fR9sgkK35cxwsniP8dlkjgwYu3L1Omb77nHj5lKeyanqnW1IKFarJMlr6e4zN6P1SB2WnYx');
//     myHeaders.append('Cache-Control', 'no-cache');
//     myHeaders.append('Postman-Token', '3d85ef35-078a-9a76-74e0-3a8093274201');



// function get(url) {
    // let init = {
    //     method: 'GET',
    //     mode: 'no-cors',
    //     headers: {
    //       'Authorization': 'Bearer foni_QRqBBuro72R9e1Tgmkhj01AwOrKrkE6VK-9GMsKyogsA3WRhhDU7fR9sgkK35cxwsniP8dlkjgwYu3L1Omb77nHj5lKeyanqnW1IKFarJMlr6e4zN6P1SB2WnYx',
    //       'Cache-Control': 'no-cache',
    //     }
    //   }
    //   url = "https://api.yelp.com/v3/businesses/search?location=Berlin&amp;term=Viktoriapark";
    //   return fetch(url, init);

// return fetch("https://api.foursquare.com/v2/venues/search?ll=52.4851838,13.3632027&intent=global&query=viktoriapark&client_id=1FNHGMXOGJHFECEAAGEPLGUEJSNIIG0ROT5AMTAQIEZNO1JA&client_secret=IQ12XWRX4H0W2ZC4K4ANZIKLJRCY10DGQWTDC5OIXF3NVVB3&v=20180203");#
// return fetch(url);
//
//
// };

// function getJSON(url) {
//
//   return get(url).then(function(response) {
//     console.log("antwort unformatiert: " + response);
//     debugger;
//     return response;
//   });
// }
//
// let wiki = function(){
//   getJSON("https://api.foursquare.com/v2/venues/search?ll=52.4851838,13.3632027&query=coffee&client_id=1FNHGMXOGJHFECEAAGEPLGUEJSNIIG0ROT5AMTAQIEZNO1JA&client_secret=IQ12XWRX4H0W2ZC4K4ANZIKLJRCY10DGQWTDC5OIXF3NVVB3&v=20180203")
//   // getJSON("https://en.wikipedia.org/w/api.php?action=query&titles=Main%20Page&prop=revisions&rvprop=content&format=json&formatversion=2")
//   .then(function(response){
//     console.log("response: " + response.response.venues[0]);
//
//   })
//   .catch(function(error){
//     alert("Fehler" + error);
//   });
// };


$('#btn').click(function() {
  // wiki();

  // var settings = {
  //   "async": true,
  //   "crossDomain": true,
  //   "url": "https://api.yelp.com/v3/businesses/search?location=Berlin&term=Viktoriapark",
  //   "method": "GET",
  //   "headers": {
  //     "Authorization": "Bearer foni_QRqBBuro72R9e1Tgmkhj01AwOrKrkE6VK-9GMsKyogsA3WRhhDU7fR9sgkK35cxwsniP8dlkjgwYu3L1Omb77nHj5lKeyanqnW1IKFarJMlr6e4zN6P1SB2WnYx",
  //     "Cache-Control": "no-cache",
  //     "Postman-Token": "1d639bcd-caa3-d757-10d5-d4ae8deec584"
  //   }
  // }
  //
  // $.ajax(settings).done(function (response) {
  //   console.log(response);
  // });
let url = "https://api.foursquare.com/v2/venues/search?ll=52.4851838,13.3632027&query=coffee&client_id=1FNHGMXOGJHFECEAAGEPLGUEJSNIIG0ROT5AMTAQIEZNO1JA&client_secret=IQ12XWRX4H0W2ZC4K4ANZIKLJRCY10DGQWTDC5OIXF3NVVB3&v=20180203";

  getJSON(url).
  then(function(data){
    console.log(data.response.venues[0].name);
  })
  .catch(function(error){
    logoutError(error);
  })

  // fetch("https://api.foursquare.com/v2/venues/search?ll=52.4851838,13.3632027&query=coffee&client_id=1FNHGMXOGJHFECEAAGEPLGUEJSNIIG0ROT5AMTAQIEZNO1JA&client_secret=IQ12XWRX4H0W2ZC4K4ANZIKLJRCY10DGQWTDC5OIXF3NVVB3&v=20180203")
  // .then(function (data) {
  //   return data.json();
  //
  // })
  // .then(function(response){
  //   console.log(response.response.venues[0].name);
  // })
  // .catch(function (error) {
  //   console.log('Request failure: ', error);
  // });

});



//
// $(document).ready(function(){
//
//     $('#btn').click(function() {
//
//       var wikiURL = "https://de.wikipedia.org/w/api.php";
//       wikiURL += '?' + $.param({
//         'action' : 'opensearch',
//         'search' : 'viktoriapark',
//         'prop'  : 'revisions',
//         'rvprop' : 'content',
//         'format' : 'json',
//         'limit' : 10
//       });
//
//       $.ajax( {
//         url: wikiURL,
//         dataType: 'jsonp',
//         success: function(data) {
//           console.log(data);
//         }
//       } );

        // $.ajax({
        //     url: '//en.wikipedia.org/w/api.php',
        //     data: { action: 'query', list: 'search', srsearch: "Viktoriapark", format: 'json' },
        //     dataType: 'jsonp',
        //     success: function (x) {
        //       console.log(x);
        //         // console.log('title', x.query.search[0].title);
        //     }
        // });
//     });
// });



//
// let getStarrating = function(_stars){
//   switch (_stars) {
//     case 1:
//         return ""
//       break;
//     default:
//
//   }
//
// }

// let createInfoWindowContent(_title, _starRating, _text){
//
// return ``
//
// }


// fetch('examples/example.json')
// .then(function(response) {
//   if (!response.ok) {
//     throw Error(response.statusText);
//   }
//   // Do stuff with the response
// })
// .catch(function(error) {
//   console.log('Looks like there was a problem: \n', error);
// });
