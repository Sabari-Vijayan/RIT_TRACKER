document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

let map;
let directionsService;
let directionsRenderer;
let mapInitialized = false;

function initApp() {
 
    window.addEventListener('load', function() {
        const loadingScreen = document.getElementById('loading');
        if (loadingScreen) {
            // Fade out effect
            setTimeout(function() {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.transition = 'opacity 1.5s';
                // Remove completely after transition
                setTimeout(function() {
                    loadingScreen.style.display = 'none';
                }, 1000);
            }, 1000);
        }
    });


    setupEventListeners();
    
    if (!mapInitialized) {
        simulateMapLoading();
    }
}

function initMap() {
    console.log("Initializing Google Maps...");
    mapInitialized = true;
    
    const campusBounds = {
        north: 9.583028404957322,
        south: 9.575654678818106,
        west: 76.61873808921429,
        east: 76.62843695609196,
    };
    
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 9.578921783001265, lng: 76.62335996504986 },
        zoom: 17,
        mapTypeId: "satellite",
        restriction: {
            latLngBounds: campusBounds,
            strictBounds: false, 
        },
    });
    
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: false, 
        polylineOptions: {
            strokeColor: '#4285F4', 
            strokeWeight: 5,
            strokeOpacity: 0.8
        }
    });
    
    const entranceMarker = new google.maps.Marker({
        position: { lat: 9.576259947356398, lng: 76.62243243927207 },
        map: map,
        title: "Campus Entrance"
    });
    
    const buildingIcon = {
        url: "./images/building.png", 
        scaledSize: new google.maps.Size(48, 48),
        origin: new google.maps.Point(0, 0), 
        anchor: new google.maps.Point(16, 16), 
        labelOrigin: new google.maps.Point(24, -10)
    };

    addResourceMarkers(buildingIcon);

    const savedDarkMode = localStorage.getItem('dark-mode');
    if (savedDarkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        if (map) {
            updateMapStyles(true);
        }
    }
    
    console.log("Google Map initialized!");
}

function addResourceMarkers(buildingIcon) {
    const resourceLocations = [
        {
            name: "Mechanical Engineering",
            position: { lat: 9.578521783001265, lng: 76.62335996504986 },
            building: "Engineering Building",
            icon: buildingIcon
        },
        {
            name: "Computer Science",
            position: { lat: 9.579121783001265, lng: 76.62395996504986 },
            building: "Engineering Building",
            icon: buildingIcon
        },
        {
            name: "Civil Engineering",
            position: { lat: 9.577821783001265, lng: 76.62305996504986 },
            building: "Engineering Building",
            icon: buildingIcon
        },
        {
            name: "Student Parking",
            position: { lat: 9.576559947356398, lng: 76.62343243927207 },
            building: "Parking Building",
            icon: buildingIcon
        }
    ];
    
    resourceLocations.forEach(location => {
        const marker = new google.maps.Marker({
            position: location.position,
            map: map,
            title: location.name,
            icon: location.icon,
            label: {
                text: location.name, 
                color: "#FFFFFF", 
                fontSize: "16px", 
                fontWeight: "bold", 
                className: "marker-label",
                anchor: new google.maps.Point(0, -50), 
            },
        });
        
        marker.addListener('click', () => {
            showLocationInfo(location);
        });
    });
}

function showLocationInfo(location) {
    if (confirm(`Would you like directions to ${location.name}?`)) {
        const startPoint = { lat: 9.576259947356398, lng: 76.62243243927207 }; 
        calculateRoute(startPoint, location.position, location.name);
    }
}

function calculateRoute(origin, destination, destinationName) {
    if (!directionsService || !directionsRenderer) {
        alert("Map services are still loading. Please try again in a moment.");
        return;
    }
    
    directionsService.route(
        {
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.WALKING,
            provideRouteAlternatives: true, 
            unitSystem: google.maps.UnitSystem.METRIC
        },
        (response, status) => {
            if (status === "OK") {
                directionsRenderer.setDirections(response);
                
                const route = response.routes[0];
                const leg = route.legs[0];
                
                showRouteInfo(leg, destinationName);
            } else {
                console.error(`Directions request failed: ${status}`);
                alert(`Could not calculate directions: ${status}`);
            }
        }
    );
}

function showRouteInfo(routeLeg, destinationName) {
    let directionsPanel = document.getElementById('directions-panel');
    
    if (!directionsPanel) {
        directionsPanel = document.createElement('div');
        directionsPanel.id = 'directions-panel';
        directionsPanel.className = 'directions-panel';
        document.querySelector('.map-container').appendChild(directionsPanel);
    }
    
    directionsPanel.innerHTML = `
        <div class="directions-header">
            <h3>Walking Directions to ${destinationName}</h3>
            <button class="close-btn" onclick="closeDirections()">×</button>
        </div>
        <div class="route-summary">
            <p><strong>Distance:</strong> ${routeLeg.distance.text}</p>
            <p><strong>Estimated Time:</strong> ${routeLeg.duration.text}</p>
        </div>
        <div class="step-by-step">
            <h4>Steps:</h4>
            <ol>
                ${routeLeg.steps.map(step => 
                    `<li>${step.instructions} (${step.distance.text})</li>`
                ).join('')}
            </ol>
        </div>
    `;
    
    directionsPanel.style.display = 'block';
}

function closeDirections() {
    const directionsPanel = document.getElementById('directions-panel');
    if (directionsPanel) {
        directionsPanel.style.display = 'none';
    }
    
    if (directionsRenderer) {
        directionsRenderer.set('directions', null);
    }
}

function setupRoutingFromSearch() {
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-input');
    
    searchBtn.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            findLocationAndRoute(searchTerm);
        }
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                findLocationAndRoute(searchTerm);
            }
        }
    });
}

function findLocationAndRoute(searchTerm) {
    
    const locationMap = {
        "computer science": { lat: 9.578521783001265, lng: 76.62335996504986, name: "Computer Science" },
        "mechanical engineering": { lat: 9.579121783001265, lng: 76.62395996504986, name: "Mechanical Engineering" },
        "civil engineering": { lat: 9.577821783001265, lng: 76.62305996504986, name: "Civil Engineering" },
        "admin block": { lat: 9.576559947356398, lng: 76.62343243927207, name: "Admin Block" },
        "entrance": { lat: 9.576259947356398, lng: 76.62243243927207, name: "Campus Entrance" }
    };
    
    const normalizedTerm = searchTerm.toLowerCase();
    
    let found = false;
    for (const [key, location] of Object.entries(locationMap)) {
        if (key.includes(normalizedTerm) || normalizedTerm.includes(key)) {
            const startPoint = { lat: 9.576259947356398, lng: 76.62243243927207 }; 
            calculateRoute(startPoint, location, location.name);
            found = true;
            break;
        }
    }
    
    if (!found) {
        alert(`Location "${searchTerm}" not found. Please try a different search.`);
    }
}

function setupEventListeners() {
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
        chip.addEventListener('click', function() {
            filterChips.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            filterResources(this.textContent);
        });
    });
    
    const mapControls = document.querySelectorAll('.map-control-btn');
    mapControls.forEach((control, index) => {
        control.addEventListener('click', function() {
            switch(index) {
                case 0: 
                    if (map) map.setZoom(map.getZoom() + 1);
                    break;
                case 1: 
                    if (map) map.setZoom(map.getZoom() - 1);
                    break;
                case 2: 
                    if (map) map.setCenter({ lat: 9.578921783001265, lng: 76.62335996504986 });
                    break;
                case 3: 
                    getUserLocation();
                    break;
            }
        });
    });
    
    const resourceCards = document.querySelectorAll('.resource-card');
      resourceCards.forEach(card => {
        card.addEventListener('click', function() {
          const resourceTitle = this.querySelector('.resource-title').textContent;
        
          let targetUrl;
          switch(resourceTitle) {
            case "Computer Science":
                targetUrl = "./3DMap/TECH_THRIVE_HACKATHON-Aadarsh/1.html";
                break;
            case "Mechanical Engineering":
                targetUrl = "./3DMap/sample.html";
                break;
            case "Civil Engineering":
                targetUrl = "./3DMap/sample.html";
                break;
            case "Admin Block":
                targetUrl = "./3DMap/sample.html";
                break;
            default:
                targetUrl = "./3DMap/sample.html";
          }
        
        window.location.href = targetUrl;
    });
  });
    
    setupRoutingFromSearch();

    setupDarkModeToggle();

    setupAutocomplete();

}

function updateMapStyles(isDarkMode) {
    if (isDarkMode) {
        map.setOptions({
            styles: [
                { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            ]
        });
    } else {
        map.setOptions({ styles: [] });
    }
}

function setupDarkModeToggle() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (!darkModeToggle) {
        console.error('Dark mode toggle button not found!');
        return;
    }
    
    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('dark-mode', isDarkMode ? 'enabled' : 'disabled');
        
        if (mapInitialized && map) {
            updateMapStyles(isDarkMode);
        }
    });
    
    const savedDarkMode = localStorage.getItem('dark-mode');
    if (savedDarkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        if (mapInitialized && map) {
            updateMapStyles(true);
        }
    }
}

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const userCoords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log('User location:', userCoords);
                
                if (map) {
                    map.setCenter(userCoords);
                    
                    new google.maps.Marker({
                        position: userCoords,
                        map: map,
                        title: "Your Location",
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: "#4285F4",
                            fillOpacity: 1,
                            strokeColor: "#FFFFFF",
                            strokeWeight: 2
                        }
                    });
                }
            },
            error => {
                console.error('Error getting location:', error.message);
                alert(`Unable to get your location: ${error.message}`);
            }
        );
    } else {
        console.error('Geolocation is not supported by this browser');
        alert('Geolocation is not supported by your browser');
    }
}

function filterResources(filterType) {
    console.log(`Filtering resources by: ${filterType}`);
}

function simulateMapLoading() {
    const mapPlaceholder = document.getElementById('map');
    if (mapPlaceholder) {
        mapPlaceholder.textContent = 'Loading Campus Map...';
    }
}

const campusLocations = [
    { name: "Computer Science", category: "Department", building: "Engineering Building", position: { lat: 9.578521783001265, lng: 76.62335996504986 } },
    { name: "Mechanical Engineering", category: "Department", building: "Engineering Building", position: { lat: 9.579121783001265, lng: 76.62395996504986 } },
    { name: "Civil Engineering", category: "Department", building: "Engineering Building", position: { lat: 9.577821783001265, lng: 76.62305996504986 } },
    { name: "Admin Block", category: "Administration", building: "Administrative Building", position: { lat: 9.576559947356398, lng: 76.62343243927207 } },
    { name: "Campus Entrance", category: "Landmark", building: "Main Gate", position: { lat: 9.576259947356398, lng: 76.62243243927207 } },
    { name: "Library", category: "Facility", building: "Academic Building", position: { lat: 9.577759947356398, lng: 76.62263243927207 } },
    { name: "Cafeteria", category: "Food", building: "Student Center", position: { lat: 9.578159947356398, lng: 76.62183243927207 } },
    { name: "Male Restroom - Ground Floor", category: "Restroom", building: "Engineering Building", position: { lat: 9.578421783001265, lng: 76.62345996504986 } },
    { name: "Female Restroom - Ground Floor", category: "Restroom", building: "Engineering Building", position: { lat: 9.578491783001265, lng: 76.62355996504986 } },
    { name: "Computer Lab 1", category: "Lab", building: "Engineering Building", position: { lat: 9.578521783001265, lng: 76.62325996504986 } },
    { name: "Physics Lab", category: "Lab", building: "Science Building", position: { lat: 9.577921783001265, lng: 76.62315996504986 } },
    { name: "Chemistry Lab", category: "Lab", building: "Science Building", position: { lat: 9.577851783001265, lng: 76.62325996504986 } }
];

function setupAutocomplete() {
    const searchInput = document.querySelector('.search-input');
    const autocompleteDropdown = document.getElementById('autocomplete-results');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.trim().toLowerCase();
        
        autocompleteDropdown.innerHTML = '';
        
        if (searchTerm === '') {
            autocompleteDropdown.style.display = 'none';
            return;
        }
        
        const matchingLocations = campusLocations.filter(location => 
            location.name.toLowerCase().includes(searchTerm) || 
            location.category.toLowerCase().includes(searchTerm) ||
            location.building.toLowerCase().includes(searchTerm)
        );
        
        if (matchingLocations.length > 0) {
            matchingLocations.forEach(location => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.innerHTML = `
                    <div class="item-name">${highlightMatch(location.name, searchTerm)}</div>
                    <div class="item-category">${location.category} - ${location.building}</div>
                `;
                
                item.addEventListener('click', function() {
                    searchInput.value = location.name;
                    autocompleteDropdown.style.display = 'none';
                    
                    calculateRouteToLocation(location);
                });
                
                autocompleteDropdown.appendChild(item);
            });
            
            autocompleteDropdown.style.display = 'block';
        } else {
            const noResults = document.createElement('div');
            noResults.className = 'autocomplete-item';
            noResults.textContent = 'No matching locations found';
            autocompleteDropdown.appendChild(noResults);
            autocompleteDropdown.style.display = 'block';
        }
    });
    
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !autocompleteDropdown.contains(e.target)) {
            autocompleteDropdown.style.display = 'none';
        }
    });
    
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            autocompleteDropdown.style.display = 'none';
        }
    });
}

function highlightMatch(text, searchTerm) {
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function calculateRouteToLocation(location) {
    const startPoint = { lat: 9.576259947356398, lng: 76.62243243927207 };
    
    if (map) {
        map.setCenter(location.position);
        map.setZoom(18); 
    }
    
    calculateRoute(startPoint, location.position, location.name);
}

function findLocationAndRoute(searchTerm) {
    const normalizedTerm = searchTerm.toLowerCase();
    
    const matchingLocation = campusLocations.find(location => 
        location.name.toLowerCase().includes(normalizedTerm) ||
        normalizedTerm.includes(location.name.toLowerCase())
    );
    
    if (matchingLocation) {
        calculateRouteToLocation(matchingLocation);
    } else {
        alert(`Location "${searchTerm}" not found. Please try a different search.`);
    }
}
