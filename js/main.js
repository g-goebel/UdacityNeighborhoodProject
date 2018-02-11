//constant values for this SPA

const
//default data for loading the map
x_coord = 52.488416,
y_coord = 13.3648,
zoom_level = 16;

//database for the points of interests in this area
localPointsOfInterest = [
  {title: "DoubleEye", location: {lat: 52.4879186, lng: 13.3518287}, id: "4b506d57f964a520fe2227e3", category: "Food"},
  {title: "Billiadaire", location: {lat: 52.4884271, lng: 13.3632407}, id: "4d2cc117feaaa1cd9fc3e290", category: "Leisure"},
  {title: "Koriat", location: {lat: 52.486469, lng: 13.362706}, id: "578a5a7a498e9404b26e7946", category: "Food"},
  {title: "Scheinbar", location: {lat: 52.4881716, lng: 13.3662619}, id: "4adcda88f964a5208d4921e3", category: "Nightlife"},
  {title: "Barkett", location: {lat: 52.4880746, lng: 13.3618802}, id: "5431b6f7498e64bc7d4c9c0b", category: "Nightlife"},
  {title: "Petite Europe", location: {lat: 52.4900659, lng: 13.3585572}, id: "4b2947e0f964a520349c24e3", category: "Food"},
  {title: "Heinrich-von-Kleist-Park", location: {lat: 52.4924047, lng: 13.3562053}, id: "4adcda7df964a520a94721e3", category: "Leisure"},
  {title: "Park am Gleisdreieck", location: {lat: 52.4940269, lng: 13.3737141}, id: "4c658e84b80abe9ab391cae5", category: "Leisure"},
  {title: "Kreuzberg", location: {lat: 52.4887486, lng: 13.3765143}, id: "4b4d936df964a5204ad426e3", category: "Leisure"},
  {title: "Train Cocktailbar", location: {lat: 52.490493, lng: 13.35867}, id: "4c02e89e39d476b078612fa7", category: "Nightlife"},
  {title: "St-Matthäus Kirchhof", location: {lat: 52.489943, lng: 13.365096}, id: "4adcda7ef964a520b64721e3", category: "Leisure"},
  {title: "La Cantina d'Augusta", location: {lat: 52.4891136, lng: 13.3599652}, id: "53bd8735498e5114f5869e22", category: "Nightlife"},
  {title: "Cafe Bilderbuch", location: {lat: 52.4866743, lng: 13.3528636}, id: "4b09797ef964a520da1723e3", category: "Food"},
  {title: "Museum der unerhörten Dinge", location: {lat: 52.48692, lng: 13.3565761}, id: "4d449c3e1ed56dcbc09cb154", category: "Leisure"},
  {title: "Hudson Bar Berlin", location: {lat: 52.4926696, lng: 13.3542185}, id: "4b7ae3bef964a52005442fe3", category: "Nightlife"},
  {title: "Cafe Linds", location: {lat: 52.48666, lng: 13.357056}, id: "5301147211d2af3dcf49a709", category: "Food"}
],

//required information from www.foursquare.com
FOURSQUARE_CLIENT_ID = "1FNHGMXOGJHFECEAAGEPLGUEJSNIIG0ROT5AMTAQIEZNO1JA",
FOURSQUARE_CLIENT_SECRET = "IQ12XWRX4H0W2ZC4K4ANZIKLJRCY10DGQWTDC5OIXF3NVVB3",
FOURSQUARE_BASE_URL = "https://api.foursquare.com/v2/venues/",
FOURSQARE_VERSION_PARAMETER = "20171001",

//Required information from www.flickr.com
FLICKR_API_KEY = "ef5b42958359f9b0898db26962624f45",
FLICKR_BASE_URL = "http://api.flickr.com/services/rest/",
FLICKR_SEARCH_METHOD = "method=flickr.photos.search";


let map, //global variable representing the map
    markers, //global variable representing a marker on the map
    bounds, //necessary information for the map representing a rectangle in geographical coordinates
    largeInfoWindow, //represents the window opening when pressing on a marker
    animation, //represents the animation of the pins when loading the map
    vm; //reprents the knockout view model


/**
* initMap is called once the map is loaded from google, it initializes the
* the map and the knockout viewmodel, which causes the markers to be created
*/
function initMap() {

  map = new google.maps.Map(document.getElementById("mapID"), {
    center: {lat: x_coord, lng: y_coord },
    zoom: zoom_level
  });

  animation = google.maps.Animation.DROP;
  bounds = new google.maps.LatLngBounds();
  largeInfoWindow = new google.maps.InfoWindow();

  vm = new MapViewModel();
  ko.applyBindings(vm);

}


/**
* MapViewModel - the knockout viewmodel which synchronizes the list of
* pois with the corresponding list shown in the app.
*
*/
function MapViewModel(){

  let self = this; //don't mix up the pointer to objects with the viewmodel
  self.poiList = ko.observableArray([]); //array holding all points of interest
  self.filter = ko.observable(""); //array holding the filtered list of pois

  /**
  * localPointsOfInterest - main function to intialize the data model, it iterates
  * through the given list of pois and creates the corresponding objects. It also
  * triggers the initialization of the marker objects, which are enriched by
  * additional information from 3rd party apis
  */
  localPointsOfInterest.forEach(function(poi){

    let location = new Location(poi); //object holding necessary information of the poi
    self.poiList.push(location); //ko observable array with the pois
    markerModel.addMarker(new Marker(location)); //2nd viewmodel holding all the information of the markers

  });

  /**
  * highlightPoi - function to highlight markers. If the user clicks on an entry in the list,
  * the map is centered to the corresponding marker and the marker is highlighted (e.g. bounce)
  *
  * @param  {type} selectedPoi entry in the list which shall be highlighted
  *
  */
  this.highlightPoi = function(selectedPoi){

    map.setCenter(new google.maps.LatLng(selectedPoi.location().lat, selectedPoi.location().lng));
    markerView.bounce(markerModel.getMarkerByTitle(selectedPoi.title()));

  };

  /**
  * filteredPois - computed array to filter the list of entries. The list
  * filters entries as well as categories
  *
  * this website was very helpful: http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
  *
  */
  self.filteredPoiList = ko.computed(function() {

    let _filter = self.filter().toLowerCase(); //
    if (!_filter) {
      markerView.showAllMarkers();
      return self.poiList();
    } else {
      return ko.utils.arrayFilter(self.poiList(), function(poi) {

        if(!poi.title().toLowerCase().includes(_filter) && !poi.category().toLowerCase().includes(_filter)){
          markerView.hideMarker(markerModel.getMarkerByTitle(poi.title()));
          return false;
        }
        markerView.showMarker(markerModel.getMarkerByTitle(poi.title()));
        return true;
      });
    }
  });

}


/**
* Model for the markers in the map. According to the project details (note2)
* "creating your markers as a part of your ViewModel is allowed (and recommended).
* Creating them as Knockout observables is not." Therefore the knockout ViewModel
* starts the creation of the markers but does not holds or organizes them. this
* is all handled by the markerModel and markerView
*/
let markerModel = {

  /**
  * addMarker - adds a given marker to the map of markers
  *
  * @param  {type} marker marker object holding all relevant information about a marker
  */
  addMarker: function(marker){

    if (markers === undefined) //no map created yet?
    markers = new Map();

    //adds the event listener so that the user can click on a marker
    marker.addListener("click", function(){
      markerView.bounce(marker);
      markerView.populateInfoWindow(this, largeInfoWindow);
    });
    //adds the marker to the map
    markers.set(marker.title, marker);
    markerView.render();
  },

  /**
  * getMarkers - function to get all markers available
  *
  * @return {type}  returns all markers in the model
  */
  getMarkers: function(){

    return markers;

  },

  /**
  * removeMarker - removes a specific marker from the model
  *
  * @param  {type} marker indicates which marker to remove
  */
  removeMarker: function(marker){

    markers.delete(marker.title());
    markerView.render(); //removes the marker and updates the view

  },

  /**
  * getMarkerByTitle - since there are two models in the app the key to
  * keep the models synchronized is the title. Therefore a marker has to
  * be identfied by the title
  *
  * @param  {type} title title of the marker which has to be returned
  * @return {type}        returns the marker identified by the given title
  */
  getMarkerByTitle: function(title){

    return markers.get(title);

  }

};


/**
* Contains all functions which are related to the
* view of the markers
*/
let markerView = {

  /**
  * populateInfoWindow - is called to open the appropriate infowindow of the
  * current marker
  *
  * @param  {type} marker     marker which is currently selected
  * @param  {type} infowindow global instance of the infowindow
  */
  populateInfoWindow: function(marker, infowindow){
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      infowindow.setContent(getInfoViewContent(marker));
      infowindow.open(map, marker);
      infowindow.addListener("closeclick", function(){
        infowindow.marker = null;
      });
    }
  },


  /**
  * render - updates the view of the markers in the model
  *
  */
  render: function(){
    markers.forEach(function(marker){
      marker.setVisible(true);
      bounds.extend(marker.position);
    });
  },

  /**
  * bounce - bounces a marker for x seconds to indicate which one is selected
  *
  * @param  {type} marker marker which shall be bounced
  */
  bounce: function(marker){

    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){
      marker.setAnimation(null);
    }, 2000);
  },

  /**
  * hideMarker - hides a marker. this function is used when filtering the list
  *
  * @param  {type} marker marker which shall be hidden
  */
  hideMarker: function(marker){
    marker.setVisible(false);
  },

  /**
  * showMarker - displays a marker which was hidden before
  *
  * @param  {type} marker marker which shall be displayed
  */
  showMarker: function(marker){
    marker.setVisible(true);
  },

  /**
  * hideAllMarkers - hides all markers in the map
  *
  */
  hideAllMarkers: function(){
    markers.forEach(function(marker){
      marker.setVisible(false);
    });
  },

  /**
  * showAllMarkers - displays all markers in the map
  *
  */
  showAllMarkers: function(){
    markers.forEach(function(marker){
      marker.setVisible(true);
    });
  }

};


/**
* Marker - Constructor of a marker, creates a google marker and adds
* additional information from 3rd party libs. If no image is availbe from flickr,
* a default image is shown, copied from:
* http://www.gladessheriff.org/media/images/most%20wanted/No%20image%20available.jpg
*
* @param  {type} poi object containing the basic information to create a marker
* @return {type}      returns a marker object containing all information which are
* necessary to be displayed in an infowindow
*/
let Marker = function(poi){

  let gmMarker =  new google.maps.Marker({
    map: map,
    position: poi.location(),
    title: poi.title(),
    animation: animation,
    visible: false,
    draggable: true,
  });

  //enriches the marker with more details of the venue (from foursquare)
  getDetailsOfVenue(poi.id())
  .then(function(data){

    let poiInfos = data.response.venue;

    if( poiInfos.rating !== undefined){
      gmMarker.rating = poiInfos.rating;
    }else{
      gmMarker.rating = "n/a";
    }

    if (poiInfos.description !== undefined){
      gmMarker.description = poiInfos.description;
    }else{
      gmMarker.description = "n/a";
    }

    if ((poiInfos.location !== undefined) && (poiInfos.location.address !== undefined)){
      gmMarker.address = poiInfos.location.address;
    }else{
      gmMarker.address = "n/a";
    }

    if ((poiInfos.popular !== undefined) && (poiInfos.popular.status !== undefined)){
      gmMarker.open = poiInfos.popular.status;
    }else{
      gmMarker.open = "n/a";
    }
  })
  //if an error occurs during fetching the data, all information are "not available"
  .catch(function(error){
    gmMarker.rating = "n/a";
    gmMarker.description = "n/a";
    gmMarker.address = "n/a";
    gmMarker.open = "n/a";
    logError(error);
  });

  //enrich the information with an image. In the current version just the first image
  // reveived from flickr is shown
  getImagesOfVenue(poi.title())
  .then(function(images){
    if(images !== undefined){
      let farmID = images[0].getAttribute("farm");
      let serverID = images[0].getAttribute("server");
      let id = images[0].getAttribute("id");
      let secret = images[0].getAttribute("secret");
      gmMarker.image = `https://farm${farmID}.staticflickr.com/${serverID}/${id}_${secret}.jpg`;
    }
    else {
      gmMarker.image = "img/noImageAvailable.jpg";
    }
  })
  //if there is an error, a local image is shown instead from "http://www.gladessheriff.org/media/images/most%20wanted/No%20image%20available.jpg"
  .catch(function(error){
    gmMarker.image = "img/noImageAvailable.jpg";
    logError(error);
  });
  return gmMarker;

};


/**
* Location - Constructor for the location object, which holds all the information of an poi for the
* knockout viewmodel
*
* @param  {type} poi point of interest of the neighbourhood
*/
let Location = function(_poi) {

  this.title = ko.observable(_poi.title);
  this.xPos = ko.observable(_poi.location.lat);
  this.yPos = ko.observable(_poi.location.lng);
  this.location = ko.observable(_poi.location);
  this.id = ko.observable(_poi.id);
  this.category = ko.observable(_poi.category);

};


/**
* logError - global error logging function, which displays an occuring error in the app for x seconds
*
* @param  {type} error error text
*/
let logError = function(error){

  $("#errorMessage").text(error);
  setTimeout(function(){
    $("#errorMessage").text("");
  }, 2000);

};


/**
* get - function to fetch data from an url. Inspired from the Udacity Promise lesson "Creating promises"
*
* @param  {type} url url from where the data shall be fetched
* @return {type}      returns a Promise, when resolved it containes the data of the fetch request
*/
let get = function(url){

  return fetch(url);

};


/**
* getXML - function to receive an xml document containing the result of a fetch request.
* Inspired from the Udacity Promise lesson "Creating promises".
* Used here to get images from flickr.
* https://stackoverflow.com/questions/44401177/xml-request-and-response-with-fetch was very
* helpful to understand how to extract data from an xml file
*
* @param  {type} url url from where the data shall be fetched
* @return {type}     returns a Promise, when resolved it contains an xml file with the images
*/
let getXML = function(url){

  return get(url)
  .then(function(response){
    if(!response.ok)
    throw response;
    return response.text();
  }).then(function(str){
    return (new window.DOMParser().parseFromString(str, "text/xml"));
  })
  .then(function(xml){
    return xml.getElementsByTagName("photo");
  })
  .catch(function(error){
    logError(error);
  });

};

/**
* getJSON - function to receive a json document containing the result of a fetch request.
* Inspired from the Udacity Promise lesson "Creating promises"
* Used here to get images data from foursquare.
*
* @param  {type} url url from where the data shall be fetched
* @return {type}     returns a Promise, when resolved it contains a json file with the information
*/
let getJSON = function(_url){

  return get(_url)
  .then(function(data){
    if(!data.ok)
    throw data;
    return data.json();
  })
  .then(function(response){
    return response;
  })
  .catch(function(error){
    logError(error);
  });

};


/**
* let getDetailsOfVenue - handles getting additional data from a certain poi
*
* @param  {type} id specific id necessary to get data from foursquare
* @return {type}    returns a json document with data fetched from foursquare
*/
let getDetailsOfVenue = function(id){

  let url = `${FOURSQUARE_BASE_URL}${id}?v=${FOURSQARE_VERSION_PARAMETER}&client_id=${FOURSQUARE_CLIENT_ID}&client_secret=${FOURSQUARE_CLIENT_SECRET}`;
  return getJSON(url);

};


/**
* let getImagesOfVenue - handles getting images from a certain poi
*
* @param  {type} title needed to search for images at flickr.com
* @return {type}       returns an xml file with data to images of the poi
*/
let getImagesOfVenue = function(title){

  let url = `${FLICKR_BASE_URL}?${FLICKR_SEARCH_METHOD}&api_key=${FLICKR_API_KEY}&tags=${title}&per_page=3`;
  return getXML(url);

};


/**
* document - reacts on the click on the information button to open a modal and explain the search functionality
*
*/
$(document).ready(function(){

  $("#myBtn").click(function(){
    $("#myModal").modal();
  });

});


/**
* let getInfoViewContent - creates the html for an infowindow
*
* @param  {type} marker marker for which the infowindow content shall be prepared
* @return {type}        returns an html string containing all information from the given marker
*/
let getInfoViewContent = function(marker){

  return `<div class="container myInfowindow">
  <div class="row header">
  <div class="col-6">
  <h5><p class="text-left">${marker.title}</p></h5>
  </div>
  <div class="col-6">
  <h5><p class="text-right">${marker.rating}</p></h5>
  </div>
  </div>
  <hr>
  <div class="row">
  <div class="col-6 descriptionRow">
  <p><h6>Address:</h6> ${marker.address}</p>
  <p><h6>Opening hours:</h6> ${marker.open}</p>
  <p><h6>Description:</h6> ${marker.description}</p>
  </div>
  <div class="col-6 markerImageRow">
  <img src=${marker.image} id="markerImage" class="img-rounded markerImage" alt="Local image loaded from flickr">
  </div>
  </div>
  </div>`;

};
