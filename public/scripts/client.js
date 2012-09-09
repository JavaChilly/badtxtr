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

var loc = {
	lat : null,
	lon: null
}

var scoutToken = 'qnqy70HkuppbRZzi05Rfazq_6GYHtS-GrepXnIvhgk-mm6tZUJu7Fl3etPzlUiZaBw4gn02X7UUyqGNfolgAUblQ1rrhAbVE-iaQAXJX-MyP63uzxoZMWsi50-fxTdxcvrJAOtSy2sSFNNiI8amkkTA3SeiBf8gnFUPu9AjxbZ4';
var reports = [];
var markers = [];
var map = null;
var increment = 0;
var panelUp = false;
function showReports() {
  for (var i = 0; i < reports.length; i++) {
	setTimeout(function() {
      showReport();
    }, i * 200);
  }
}

function showReport() {
	var report = reports[increment];
	increment++;
	var html = '<div class="scout"><a href="http://apps.scout.me/v1/driveto?dt=' + encodeURI(report.loc[0] + ',' + report.loc[1]) + '&token=' + encodeURI(scoutToken) + '">';
	html += '<img src="/images/scout.png" title="Scout this Location Now"></a></div>';
	if (report.image != null) {
		html += '<img src="/uploads/' + report.image.thumb + '">';
	}
	html += '<p>' + report.who + " was caught " + report.what + '</p>';
	
    var m = new google.maps.Marker({
	    position: new google.maps.LatLng(report.loc[0], report.loc[1]),
        map: map,
        draggable: false,
        animation: google.maps.Animation.DROP
    });	
	
    markers.push(m);

    google.maps.event.addListener(m, 'click', function() {
	    panelUp = true;
	    var panel = $('#info_panel');
		panel.css('z-index', 10000);
		panel.html(html);
		panel.show();
  	});
}

$(document).ready(function() {

	var noLocation = function() {
		$('#location_menu').show();
		$('#main_menu').hide();
		// @TODO write hooks for this ...
		alert('no support yet if you have location services turned off.');
	};
	
	$('#reportButton').on('click', function() {
		$('#reportForm').get()[0].submit();
	});
	
	$('#info_panel').on('click', function(e) {
		if (panelUp) {
			$('#info_panel').hide();
		} else {
			$('#info_panel').show();
		}
		panelUp = !panelUp;
		
		if (e.srcElement.parentElement.href) {
			window.location = e.srcElement.parentElement.href;
		}
		console.log(e);
	});

	if (navigator.geolocation) {  
	    navigator.geolocation.getCurrentPosition(function(position) {
		    loc.lat = position.coords.latitude;
		    loc.lon = position.coords.longitude;
		    
			$('#latField').val(loc.lat);
			$('#lonField').val(loc.lon);
		
			var mapOptions = {
	          center: new google.maps.LatLng(loc.lat, loc.lon),
	          zoom: 12,
	          mapTypeId: google.maps.MapTypeId.ROADMAP
	        };
	        map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
			
			if (window.location.hash != 'report') {
				$.getJSON('/node/fetch/?lat=' + loc.lat + '&lon=' + loc.lon, function(data) {
					if (data.status == 'ok') {
						// populate our global reports array
						reports = data.results;
						showReports();
					}
				});
			}
		}, noLocation);  
	} else {
		noLocation();
	}

});