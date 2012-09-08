var jQT = new $.jQTouch({
                icon: 'jqtouch.png',
                icon4: 'jqtouch4.png',
                addGlossToIcon: false,
                startupScreen: 'jqt_startup.png',
                statusBar: 'black-translucent',
                themeSelectionSelector: '#jqt #themes ul',
                preloadImages: [],
				flipSelector: 'flip'
            });

$(document).ready(function() {

	/*
    $('#goReport').on('tap', function() {
		$('#home').removeClass('current');
		$('#report').addClass('current');
	});
	*/
	

	var noLocation = function() {
		$('#location_menu').show();
		$('#main_menu').hide();
		// @TODO write hooks for this ...
	};
	
	$('#reportButton').on('click', function() {
		console.log("this working?");
		$('#reportForm').submit();
	});

	if (navigator.geolocation) {  
	    navigator.geolocation.getCurrentPosition(function(position) {
		    var lat = position.coords.latitude;
		    var lon = position.coords.longitude;
		    var userLocation = lat + ', ' + lon;
			
			var mapOptions = {
	          center: new google.maps.LatLng(lat, lon),
	          zoom: 8,
	          mapTypeId: google.maps.MapTypeId.ROADMAP
	        };
	        var map = new google.maps.Map(document.getElementById("map_canvas"),
	            mapOptions);
			
		}, noLocation);  
	} else {
		noLocation();
	}

});