# Project overview
This project is a excercise project from udacity frontend webdeveloper course.
It shall combine the lessons about the framework knockout (http://knockoutjs.com/),
the lessons about ModelViewController, access to 3rd Party API and the lessons
about Promises in one Single Page Application.

The target is to provide a simple SPA showing a map from google maps, a list of
Points of interest (poi) from a certain area and a list of those pois which can
be filtered. Actions on the list shall lead to the appropriate action on the map:

1.
  filtering shall filter also the markers on the map

2.
  selecting entries in the list shall lead to highlighting of the markers (in
    this implementation, the marker bounces for 2 seconds)

This approach implements pois all located in Berlin Schoeneberg, Germany. There
are pois in the categories "Leisure", "Food" and "Nightlife". The user can filter
by entering (parts of) the names or the categories instead. The pois are filtered
in the same moment on the map. Clicking on the entries centers the map to the
entry and lets the marker bounce. Clicking on the marker opens an info window,
containing:

* the name
* a rating of the location
* the address
* the opening hours
* an image of the location

The information above are gathered from www.foursquare.com. The images are
gathered from www.flickr.com. The current implementation selects the first image
returned by flickr, therefore the accuracy might not always given. If no
information is available, "n/a" is shown instead. If no image was available,
an standard image is shown instead. Special thanks to [this site](http://www.gladessheriff.org/media/images/most%20wanted/No%20image%20available.jpg).

Additional pois can be added, therefore the variable "localPointsOfInterest" has
to be extended with the title, location, id and category. Currently those
information have to be searched manually (via google.maps --> location and
foursquare --> id). An improved version might have an automatic position resolver.


# Installation instructions
##Precondition
The target system shall have a common browser installed, Google Chrome is
recommended [link](https://www.google.de/chrome/browser/desktop/index.html).

##Download
Create a new folder and clone the git repository from github (git clone xxx)

##How to get running
Open the index.html in the folder with a browser (right click on it, then
  *open with* and select a browser). Alternatively open the browser and press
  *command* + *O*, than select index.html.

##Trouble shooting
If there are errors occuring, there might be issues with the internet
connectivity or the quota of the allowed requests per day at flickr or foursquare
are reached. Check the console for details (*Option* + *Command* + *J*),
check the internet connection or try 24h later (--> quota).
