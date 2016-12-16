/**
 * MapController is in charge of the drawing of the map, the grids 
 * and the zones. 
 */

var map,
	mapViewer,
	mapLoc,			// Map location latitude and longitude
	mapMarker,
	infoWindow,
	instrWindow,
	initialZoom,
	minimumZoom,
	maximumZoom;

var backControlDiv,
    zoomControlDiv,
    switchControlDiv;

// Initial grid coordinates
var swPoint, nePoint;

var listenerHandle,
	zoneListenerHandle,
	popupListenerHandle;

// Protocol Buffers
var ProtoBuf = dcodeIO.ProtoBuf,
	builder = ProtoBuf.loadProtoFile("kya.proto"),
	KYA = builder.build("KYA"),
	Stats = KYA.Stats;

/**
 * Draws a new map given the sothwest and northeast latitude and longitude.
 *
 * @param lat: (double) the location's latitude
 * @param lng: (double) the location's longitude
 * @param onGridClickedCallback : Callback function to notify when a grid have been clicked
 * @param backButtonCallback	: Callback function to notify when the back button have been clicked
 */
this.drawMap = function(locLat, locLng, swPoint_, nePoint_, area, onGridClickedCallback, backButtonCallback, dragCallback, zoomOutCallback) {
	mapLoc = new google.maps.LatLng(locLat, locLng);

	// Reference to the initial boundaries
	swPoint = swPoint_;
	nePoint = nePoint_;
	initialZoom = minimumZoom = 9;
	maximumZoom = 19;

	map = new google.maps.Map(document.getElementById('googleMap'), {
		zoom: initialZoom,
		zoomControl: false,
		mapTypeControl: false,
		streetViewControl: false,
		scrollwheel: false,
		disableDoubleClickZoom: true,
		center: mapLoc
	});

	// Draw initial grid
	drawGrid(swPoint, nePoint, area, onGridClickedCallback);
	// Instantiate the info window for the zones statistics
	infoWindow = new google.maps.InfoWindow({});
	showInstructions();
	addMapViewer();
  	onHover();	// Listen for hover events
  	onDrag(dragCallback);	// Listen for hover events
	styleMap(); // Add some style to the map
        boundsControl(swPoint, nePoint);
        //switchButtonControl(function(){});
	backButtonControl(backButtonCallback);
	zoomButtonControl(zoomOutCallback);
};

/**
 * Creates a rectangle object using the grid's coordinates
 * and then draws each rectangle in the map.
 *
 * @param grids: (GeoJSON) the grids to draw
 * @param callback: Callback function to be called when a grid is clicked.
 */
this.drawGrid = function(swPoint, nePoint, areaOfGrid, onGridClickedCallback) {
	// Get the southwest and northeast latitude and longitude
	swLat = swPoint.lat();
	swLng = swPoint.lng();
	neLat = nePoint.lat();
	neLng = nePoint.lng();

	map.data.loadGeoJson('http://kya.media.mit.edu/grids/?swLat=' + swLat + '&swLng=' + swLng + 
		'&neLat=' + neLat + '&neLng=' + neLng + '&area=' + areaOfGrid);

	// Adding listener to grids
	listenerHandle = map.data.addListener('click', function(event) {
		// Get polygon's properties
		var polyCoord = event.feature.getProperty('polyCoord');
		areaOfGrid = event.feature.getProperty('area');

		// Get polygon's southwest and northeast coordinates
		swLat = polyCoord[0].lat;
		swLng = polyCoord[0].lng;
		neLat = polyCoord[2].lat;
		neLng = polyCoord[2].lng;
		swCoord = new google.maps.LatLng(swLat, swLng);
		neCoord = new google.maps.LatLng(neLat, neLng);

		// Callback
		onGridClickedCallback(swCoord, neCoord, areaOfGrid);
		mapMarker.setPosition(map.getCenter());
    });
};

/**
 * Draws the crime statistics, including the maximum and
 * minimum number of crimes and the crime rate.
 *
 * @param stats: (Stats) the crimes statistics
 */
this.drawStats = function(stats) {
	var currentStats = Stats.decode(stats);

	var maxCrimes = document.getElementById('max-crimes');
	var minCrimes = document.getElementById('min-crimes');
	var crimeRate = document.getElementById('crime-rate');

	// Modify statistics in HTML file
	maxCrimes.innerHTML = currentStats.maxNumOfCrimes;
	minCrimes.innerHTML = currentStats.minNumOfCrimes;
	crimeRate.innerHTML = currentStats.crimeAverage.toFixed(2);
};

/**
 * Gets the current latitude from the map object.
 *
 * @return double: the current latitude
 */
this.getCurrentNePoint = function() {
	var newBounds = map.getBounds();
	return newBounds.getNorthEast();
};

/**
 * Gets the current longitude from the map object.
 *
 * @return double: the current longitude
 */
this.getCurrentSwPoint = function() {
	var newBounds = map.getBounds();
	return newBounds.getSouthWest();
};

/**
 * Function to be called when the map is zoomed.
 *
 * @param lat: (double) the new latitude location
 * @param lgt: (double) the new longitude location
 * @param area: (int) the area of 
 * @param callback: Callback function to be called when the map is zoomed.
 */
this.zoomControl = function(zoomInButton, zoomOutButton, callback) {

	// Listener for zoomIn
	google.maps.event.addDomListener(zoomInButton, 'click', function() {
		var currentZoom = map.getZoom();
		if (currentZoom >= maximumZoom)
			map.setZoom(map.getZoom());
		else
			map.setZoom(map.getZoom() + 1);
	});

	// Listener for zoomOut
	google.maps.event.addDomListener(zoomOutButton, 'click', function() {
		var currentZoom = map.getZoom();
		if (currentZoom <= minimumZoom)
			map.setZoom(minimumZoom);
		else
			map.setZoom(map.getZoom() - 1);
		callback();
	});  
};

this.boundsControl = function(swPoint, nePoint) {
	// Bounds of the desired area
	var allowedBounds = new google.maps.LatLngBounds(
		swPoint,
		nePoint
		);
	var boundLimits = {
		maxLat : allowedBounds.getNorthEast().lat(),
		maxLng : allowedBounds.getNorthEast().lng(),
		minLat : allowedBounds.getSouthWest().lat(),
		minLng : allowedBounds.getSouthWest().lng()
	};

	var lastValidCenter = map.getCenter();
	var newLat, newLng;

	google.maps.event.addListener(map, 'center_changed', function() {
		center = map.getCenter();
		if (allowedBounds.contains(center)) {
			// still within valid bounds, so save the last valid position
			lastValidCenter = map.getCenter();
			return;
		}
		newLat = lastValidCenter.lat();
		newLng = lastValidCenter.lng();
		if(center.lng() > boundLimits.minLng && center.lng() < boundLimits.maxLng){
			newLng = center.lng();
		}
		if(center.lat() > boundLimits.minLat && center.lat() < boundLimits.maxLat){
			newLat = center.lat();
		}
		map.panTo(new google.maps.LatLng(newLat, newLng));
	});
}

/**
 * Function to be called when the user hovers over the grids.
 *
 */
this.onHover = function() {
	// When the user hovers, outline the grids.
	map.data.addListener('mouseover', function(event) {
		var color = event.feature.getProperty('color');
		map.data.revertStyle();
		map.data.overrideStyle(event.feature, {strokeColor: color, strokeWeight: 3});
	});

	map.data.addListener('mouseout', function(event) {
		// Remove all overrides
		map.data.revertStyle();
	});
};

/**
 * Function to be called when the user drags the map.
 *
 */
this.onDrag = function(callback) {
	map.addListener('dragend', function() {
		infoWindow.close();
		callback();
		mapMarker.setPosition(map.getCenter());
	});
};

/**
 * Creates a rectangle object using the zone's coordinates
 * and then draws each rectangle in the map.
 *
 * @param geozones: (GeoJson)  the GeoJsin with the zones to draw
 */
this.drawZones = function(geozones) {
	map.data.addGeoJson(geozones);
	onZoneClicked();
	styleZones();
	mapMarker.setPosition(map.getCenter());
};

/**
 * Draw the zone's statistics. This includes the risk level,
 * number of crimes and crime rate.
 *
 * @param event : (event) the click event
 */
this.drawZoneStats = function(event) {
	level = event.feature.getProperty('level');
	incidents = event.feature.getProperty('totalCrime');
	infoWindow.setContent('<div class=\"popup-circle legend-box-level' + level +'\"></div><div class=\"popup-div\"><h3 class=\"popup-title\">Level <span class=\"popup-res-' + level + '\">' + level + '</span></h3><h3 class=\"popup-title\"><span class=\"popup-res-' + level + '\">' + incidents + '</span> incidents</h3></div>');
	infoWindow.setPosition(event.latLng)
	infoWindow.open(map);
};

/**
 * Callback function to be called when a click event 
 * in a zone is detected.
 *
 */
this.onZoneClicked = function() {
	//popupListenerHandle = map.data.addListener('click', function(event) {
	//	drawZoneStats(event);
	//});
};

/**
 * Shows an info window when the dashboard loads.
 *
 */
this.showInstructions = function() {
	var contentString = '<div id="instrWindow">'+
	'Click on a grid to expand the area.' +
	'</div>';

	instrWindow = new google.maps.InfoWindow({
		content: contentString,
		maxWidth: 200
	});

	instrWindow.setPosition(map.getCenter());
	instrWindow.open(map);
	// After 5 seconds the info window closes itself
	setTimeout(function(){instrWindow.close();}, '5000');
};

/**
 * Adds map to visualize where a grid or zone is located.
 *
 */
this.addMapViewer = function() {

	mapViewer = new google.maps.Map(document.getElementById('mapViewer'), {
		zoom: 7,
		zoomControl: false,
		mapTypeControl: false,
		streetViewControl: false,
		scrollwheel: false,
		disableDoubleClickZoom: true,
		draggable: false,
		center: mapLoc
	});
	mapMarker = new google.maps.Marker({
	    position: mapLoc,
	    map: mapViewer,
	    title: 'You are here'
  	});
};


/**
 * Removes all grids and zones from the map.
 *
 */
this.clear = function() {
	// Remove listener for the zone's info window
	google.maps.event.removeListener(popupListenerHandle);

	// Remove listener for click events on zones
	google.maps.event.removeListener(zoneListenerHandle);

	// Remove listener for click events on grids
	google.maps.event.removeListener(listenerHandle);

	// Remove each polygon from the map
	map.data.forEach(function(feature) {
		map.data.remove(feature);
	});
};

/**
 * Removes all zones from the map.
 *
 */
this.clearZones = function() {
	// Remove listener for the zone's info window
	google.maps.event.removeListener(popupListenerHandle);

	// Remove listener for click events
	google.maps.event.removeListener(zoneListenerHandle);

	// Remove each polygon from the map
	map.data.forEach(function(feature) {
		map.data.remove(feature);
	});
};

/**
 * Removes all grids from the map.
 *
 */
this.clearGrids = function() {
	// Remove listener for click events
	google.maps.event.removeListener(listenerHandle);

	// Remove each polygon from the map
	map.data.forEach(function(feature) {
		map.data.remove(feature);
	});
};

/**
 * Defines the visual styles for the map.
 *
 */
this.styleMap = function() {
	// Add some style.
	map.data.setStyle(function(feature) {
		return ({
			fillColor: '#B8B8B8',
			strokeWeight: 1
		});
	});	
};

/**
 * Defines the style for the zones.
 *
 */
this.styleZones = function() {
	map.data.setStyle(function(feature) {
		var color = feature.getProperty('color');
		return ({
			fillColor: color,
			strokeColor: 'grey',
			strokeWeight: 1
		});
	});
};

/**
 * Resets map to the initial location and initial grids.
 *
 * @param swPpint: (double) the south-west point
 * @param nePoint: (double) the north-east point
 * @param area: (int) the area of initial grids
 * @param callback: Callback function to be called when a grid is clicked.
 */
this.resetMap = function(swPoint, nePoint, area, onGridClickedCallback) {
	clear();
	map.setZoom(initialZoom);
	map.setCenter(mapLoc);

	// Save current zoom
	minimumZoom = map.getZoom();
	// Load new GeoJSON with initial grids
	drawGrid(swPoint, nePoint, area, onGridClickedCallback);
	mapMarker.setPosition(map.getCenter());
};

/**
 * Draw grids in the map.
 *
 * @param area: (int) the size of the grids
 * @param callback: Callback function to be called when a grid is clicked.
 */
this.goBackToGrids = function(area, onGridClickedCallback) {
	clearZones();
	newZoom = 4;
	map.setZoom(map.getZoom() - newZoom);
	// Save current zoom
	minimumZoom = map.getZoom();
	drawGrid(getCurrentSwPoint(), getCurrentNePoint(), area, onGridClickedCallback);
};

this.switchButtonControl = function(callback) {
    // Create div to hold back button
    switchControlDiv = document.createElement('div');

    // Set CSS for the control border.
    var switchControlUI = document.createElement('div');
    switchControlUI.id = 'backButtonDiv';
    switchControlUI.title = 'Click to change between prediction';
    switchControlDiv.appendChild(switchControlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.id = 'backButtonText';
    controlText.innerHTML = 'Switch';
    switchControlUI.appendChild(controlText);

    // Setup the click event listeners:
    switchControlUI.addEventListener('click', function() {
	// Close the current open info window
	infoWindow.close();
	callback();

	// Update grids color to a light grey
	styleMap();
    });
    switchControlDiv.index = 1;
    switchControlDiv.style['margin-left'] = '20px';
    switchControlDiv.style['padding-top'] = '10px';
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(switchControlDiv);
}

/**
 * Creates the back button and adds listener.
 *
 * @param callback: Callback function to be called when the button is clicked.
 */
this.backButtonControl = function(callback) {

	// Create div to hold back button
	backControlDiv = document.createElement('div');

	// Set CSS for the control border.
	var controlUI = document.createElement('div');
	controlUI.id = 'backButtonDiv';
	controlUI.title = 'Click to go back to previous grid.';
	backControlDiv.appendChild(controlUI);

	// Set CSS for the control interior.
	var controlText = document.createElement('div');
	controlText.id = 'backButtonText';
	controlText.innerHTML = 'Back';
	controlUI.appendChild(controlText);

	// Setup the click event listeners: 
	controlUI.addEventListener('click', function() {
		// Close the current open info window
		infoWindow.close();
		callback();

		// Update grids color to a light grey
		styleMap();
	});

    backControlDiv.index = 1;
//    backControlDiv.style['margin-top'] = '100px';
	backControlDiv.style['padding-top'] = '10px';
	backControlDiv.style.display =  'none';
	map.controls[google.maps.ControlPosition.TOP_RIGHT].push(backControlDiv);
};

/**
 * Creates the zoom button and adds listener.
 *
 */
this.zoomButtonControl = function(callback) {
	// Create div to hold zoom buttons
	zoomControlDiv = document.createElement('div');

	// Creating divs & styles for custom zoom control
	zoomControlDiv.style.padding = '5px';

	// Set CSS for the control wrapper
	var controlWrapper = document.createElement('div');
	controlWrapper.style.backgroundColor = 'white';
	controlWrapper.style.borderStyle = 'solid';
	controlWrapper.style.borderColor = 'gray';
	controlWrapper.style.borderWidth = '1px';
	controlWrapper.style.cursor = 'pointer';
	controlWrapper.style.textAlign = 'center';
	controlWrapper.style.width = '32px'; 
	controlWrapper.style.height = '64px';
	zoomControlDiv.appendChild(controlWrapper);

	// Set CSS for the zoomIn
	var zoomInButton = document.createElement('div');
	zoomInButton.style.width = '32px'; 
	zoomInButton.style.height = '32px';
	zoomInButton.style.backgroundImage = 'url("../images/zoomIn.png")';
	controlWrapper.appendChild(zoomInButton);

	// Set CSS for the zoomOut
	var zoomOutButton = document.createElement('div');
	zoomOutButton.style.width = '32px'; 
	zoomOutButton.style.height = '32px';
	zoomOutButton.style.backgroundImage = 'url("../images/zoomOut.png")';
	controlWrapper.appendChild(zoomOutButton);

	// Add listener for zoom buttons
	zoomControl(zoomInButton, zoomOutButton, callback);

	zoomControlDiv.index = 1;
	map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(zoomControlDiv);
}

/**
 * Shows the back button.
 *
 */
this.showBackButton = function() {
	backControlDiv.style.display =  'initial';
};

this.setMinimumZoom = function() {
//	minimumZoom = map.getZoom();
}

/**
 * Hides the back button.
 *
 */
this.hideBackButton = function() {
	backControlDiv.style.display =  'none';
};
