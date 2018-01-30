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
  map = new google.maps.Map(document.getElementById("map"), {
    center: {lat: x_coord, lng: y_coord },
    zoom: zoom_level
  });
  animation = google.maps.Animation.DROP;
  bounds = new google.maps.LatLngBounds();
  largeInfoWindow = new google.maps.InfoWindow();

  ko.applyBindings(new MapViewModel());

};


// let addMarkers = function(locations){
//
//   bounds = new google.maps.LatLngBounds();
//   largeInfoWindow = new google.maps.InfoWindow();
//
//   for (var i=0; i< locations.length; i++) {
//     var position = locations[i].location;
//     var title = locations[i].title;
//     var marker = new google.maps.Marker({
//       map: map,
//       position: position,
//       title: title,
//       animation: google.maps.Animation.DROP,
//       id: i
//     });
//     markers.push(marker);
//     bounds.extend(marker.position);
//     marker.addListener("click", function(){
//       populateInfoWindow(this, largeInfoWindow);
//     });
//   };
// };




function MapViewModel(){

 // Creating your markers as a part of your ViewModel is allowed (and recommended). Creating them as Knockout observables is not.


  let self = this;
  self.poiList = ko.observableArray([]);
  pointsOfInterestSchoeneberg.forEach(function(poi){
    // console.log(poi.location.lat);
    let loc = new Location(poi);
    self.poiList.push(loc);
    markerModel.addMarker(new Marker(loc));
  });

  // markerModel.removeMarkers(self.poiList()[2]);


  this.highlightPoi = function(data){
    markerView.bounce(data.title());

  }

  self.filter = ko.observable("");

  self.filteredPoiList = ko.computed(function() {
      let _filter = self.filter().toLowerCase();
      if (!_filter) {
          return self.poiList();
      } else {
          return ko.utils.arrayFilter(self.poiList(), function(poi) {

            if(!poi.title().toLowerCase().includes(_filter)){
              markerView.hideMarker(poi.title());
              return false;
            }
            markerView.showMarker(poi.title());
            return true;
          });
      }
  });

};

  // vm = new MapViewModel();
  // ko.applyBindings(vm);


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

  bounce: function(title){
    let _marker = markers.get(title);

      _marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){
      _marker.setAnimation(null);
    }, 2000);
  },

  hideMarker: function(title){
    markers.get(title).setVisible(false);
  },

  showMarker: function(title){
    markers.get(title).setVisible(true);
  }

};




let octopus =  {
  init: function(){
    //model.currentMarker =  markers[0];
      //updateMarkers();
      //init()
  },

  getCurrentMarker: function(){
    return model.currentMarker;
  },

  getMarkers: function(){
    return model.markers;
  },

  setCurrentMarker: function(marker){
    model.currentMarker = marker;
  }

};


let InfoWindow = function(_marker, _content){

  return new google.maps.InfoWindow({
  content: "Do you ever feel like an InfoWindow, floating through the wind," +
    "ready to start again?"
  });
  _marker.addListener("click", function() {
    infowindow.open(map, marker);
  });
};



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
