var map;
// list of markers created during the initialization
// of the application
var markers = [];
var largeInfowindow;

function ViewModel()
{
    initMap();

    // connect search input and list of venues using Knockout
    this.searchInput = ko.observable("");

    this.venuesBerlin = ko.computed(function() {
        var result = [];

        for (var i = 0; i < markers.length; i++) {

            // show or hide items in the list if ther names
            // match or don't match search input
            if (markers[i].title.toLowerCase().includes(
                this.searchInput().toLowerCase())) {
                result.push(markers[i]);
                markers[i].setVisible(true);
            } else {
                markers[i].setVisible(false);
            }
        }
        return result;
    }, this);
}

// create and how infor window on top of a marker
function createInfowindow() {
    marker = this;
    infowindow = largeInfowindow;

    // bounce when show info window
    marker.setAnimation(google.maps.Animation.BOUNCE);

    // set BOUNCE animation timeout (only few bounces)
    setTimeout(function() {
        self.marker.setAnimation(null);
    }, 1500);

    setFoursquareContent(infowindow);

    infowindow.marker = marker;
    infowindow.open(map, marker);

    // clear marker and remove animation
    infowindow.addListener('closeclick',function(){
        infowindow.setMarker = null;
        marker.setAnimation(null);
    });
}

// fill info window with information featched from Foursquare
function setFoursquareContent(infowindow) {
    clientID = "N1REBVCSEGEDB12DK2XZ3H5UZKT5WGKWUNWSTENZVSOKV3DW";
    clientSecret = "S3BPYLMYCLY0LR2CKMIC0WFYPOZEM4FARFXIJFFFCB0C3N0N";

    var url = 'https://api.foursquare.com/v2/venues/search?v=20180125&ll=' +
        marker.position.lat() + ',' + marker.position.lng() + '&client_id=' + clientID +
        '&client_secret=' + clientSecret + '&query=' + marker.title;

    // console.log(url);

    // fetch data from Foursquare
    $.getJSON(url).done(function(marker) {
        response = marker.response.venues[0];

        // parse Foursquare response
        var name = response.name;
        var street = response.location.formattedAddress[0];
        var city = response.location.formattedAddress[1];
        var country = response.location.country;
        var category = response.categories[0].name;
        var url = response.url;
        var visitors = response.hereNow.summary;

        // format content for the info window
        content =
            '<h6>' + name + '</h6><p><i>' + category + '</i></p>' + 
            '<p>' + street + ', ' + city + ', ' + country + '</p>' +
            '<p> Visitors now: "' + visitors + '"</p>' + 
            '<p><a href="' + url + '">' + url + '</a></p>';
        infowindow.setContent(content);

    }).fail(function(e) {
        console.log(e.responseText);

        // notify user about errors
        infowindow.setContent('<h6>Error occured during retrieving data from Foursquare!</h6>');
    });
}

// create a venue
var Venue = function(venue) {
    this.title = venue.title;
    this.type = venue.type;

    var point = new google.maps.LatLng(venue.lat, venue.long);
    var marker = new google.maps.Marker({
        position: point,
        title: venue.title,
        map: map,
        animation: google.maps.Animation.DROP
    });

    this.marker = marker;

    this.setVisible = function(v) {
        this.marker.setVisible(v);
    };

    this.marker.addListener('click', createInfowindow);

    // trigger click event to show info window
    this.showInfo = function() {
        google.maps.event.trigger(this.marker, 'click');
    };

};

// create map and initialize it with markers
function initMap() {
    // Berlin city center 
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 52.520008, lng: 13.404954},
        zoom: 13
    });

    // use "retro" map style
    map.setOptions({styles: retroStyle});

    // create info window
    largeInfowindow = new google.maps.InfoWindow();

    // add markers from venues.js file
    for (var i = 0; i < venuesBerlin.length; i++) {
        markers.push(new Venue(venuesBerlin[i]));
    }
}


function mapLoadError() {
    $('#map').html('Error while loading Google maps');
}


// main function - initialize view model
function initApp() {
    ko.applyBindings(new ViewModel());
}

