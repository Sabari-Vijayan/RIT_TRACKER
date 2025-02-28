// Main JavaScript file for CampusCompass application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
    // Google Maps will call initMap automatically with the callback
});

// Global variables for directions
let map;
let directionsService;
let directionsRenderer;
let mapInitialized = false;

// Add this to your initApp function
function initApp() {
    // Set up event listeners
    setupEventListeners();
    
    // For demo purposes - simulate loading a map if Google Maps isn't loaded yet
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
    
    // Create the map
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 9.578921783001265, lng: 76.62335996504986 },
        zoom: 17,
        mapTypeId: "satellite",
        restriction: {
            latLngBounds: campusBounds,
            strictBounds: false, // Changed to false to allow zooming out a bit
        },
    });
    
    // Initialize the directions service and renderer
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: false, // Set to true if you want to use custom markers
        polylineOptions: {
            strokeColor: '#4285F4', // Google blue
            strokeWeight: 5,
            strokeOpacity: 0.8
        }
    });
    
    // Add a marker for a sample location (e.g., main entrance)
    const entranceMarker = new google.maps.Marker({
        position: { lat: 9.576259947356398, lng: 76.62243243927207 },
        map: map,
        title: "Campus Entrance"
    });
    
    const buildingIcon = {
        url: "./images/building.png", // Path or URL to the image
        scaledSize: new google.maps.Size(48, 48),
        origin: new google.maps.Point(0, 0), // Adjust size as needed
        anchor: new google.maps.Point(16, 16), // Center of the icon
        labelOrigin: new google.maps.Point(24, -10)
    };

    addResourceMarkers(buildingIcon);

    // Check for saved dark mode preference on load
    const savedDarkMode = localStorage.getItem('dark-mode');
    if (savedDarkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        // Update map styles if map is initialized
        if (map) {
            updateMapStyles(true);
        }
    }
    
    console.log("Google Map initialized!");
}

// Add markers for resource locations
function addResourceMarkers(buildingIcon) {
    // These would be your actual building coordinates
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
    
    // Create markers for each resource location
    resourceLocations.forEach(location => {
        const marker = new google.maps.Marker({
            position: location.position,
            map: map,
            title: location.name,
            icon: location.icon,
            label: {
                text: location.name, // Display the building name as a label
                color: "#FFFFFF", // Text color (white)
                fontSize: "16px", // Font size
                fontWeight: "bold", // Font weight
                className: "marker-label",
                anchor: new google.maps.Point(0, -50), // Optional: Add a CSS class for custom styling
            },
        });
        
        // Add click event to show info and calculate routes
        marker.addListener('click', () => {
            showLocationInfo(location);
        });
    });
}

// Show info about the location and offer directions
function showLocationInfo(location) {
    // You could create a detailed info window here
    // For simplicity, we'll just offer directions
    if (confirm(`Would you like directions to ${location.name}?`)) {
        // Use user's location or a default starting point
        const startPoint = { lat: 9.576259947356398, lng: 76.62243243927207 }; // Campus entrance
        calculateRoute(startPoint, location.position, location.name);
    }
}

// Calculate and display route between two points
function calculateRoute(origin, destination, destinationName) {
    // Check if directions services are initialized
    if (!directionsService || !directionsRenderer) {
        alert("Map services are still loading. Please try again in a moment.");
        return;
    }
    
    // Request walking directions
    directionsService.route(
        {
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.WALKING,
            provideRouteAlternatives: true, // Get alternative routes
            unitSystem: google.maps.UnitSystem.METRIC
        },
        (response, status) => {
            if (status === "OK") {
                // Display the route on the map
                directionsRenderer.setDirections(response);
                
                // Extract route information
                const route = response.routes[0];
                const leg = route.legs[0];
                
                // Show route information
                showRouteInfo(leg, destinationName);
            } else {
                console.error(`Directions request failed: ${status}`);
                alert(`Could not calculate directions: ${status}`);
            }
        }
    );
}

// Display route information to the user
function showRouteInfo(routeLeg, destinationName) {
    // Create or update a panel to show directions
    let directionsPanel = document.getElementById('directions-panel');
    
    if (!directionsPanel) {
        // Create the panel if it doesn't exist
        directionsPanel = document.createElement('div');
        directionsPanel.id = 'directions-panel';
        directionsPanel.className = 'directions-panel';
        document.querySelector('.map-container').appendChild(directionsPanel);
    }
    
    // Format and display the route information
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
    
    // Show the panel
    directionsPanel.style.display = 'block';
}

// Close the directions panel
function closeDirections() {
    const directionsPanel = document.getElementById('directions-panel');
    if (directionsPanel) {
        directionsPanel.style.display = 'none';
    }
    
    // Clear the route from the map
    if (directionsRenderer) {
        directionsRenderer.set('directions', null);
    }
}

// Add a search-to-route feature
function setupRoutingFromSearch() {
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-input');
    
    // Add event listener for the search button
    searchBtn.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            findLocationAndRoute(searchTerm);
        }
    });
    
    // Add event listener for Enter key in search input
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                findLocationAndRoute(searchTerm);
            }
        }
    });
}

// Find a location by name and calculate a route
function findLocationAndRoute(searchTerm) {
    // This is a simplified version - in a real app, you'd query a database
    // or use Google Places API to find the location
    
    // Sample mapping of search terms to locations
    const locationMap = {
        "computer science": { lat: 9.578521783001265, lng: 76.62335996504986, name: "Computer Science" },
        "mechanical engineering": { lat: 9.579121783001265, lng: 76.62395996504986, name: "Mechanical Engineering" },
        "civil engineering": { lat: 9.577821783001265, lng: 76.62305996504986, name: "Civil Engineering" },
        "admin block": { lat: 9.576559947356398, lng: 76.62343243927207, name: "Admin Block" },
        "entrance": { lat: 9.576259947356398, lng: 76.62243243927207, name: "Campus Entrance" }
    };
    
    // Normalize search term (lowercase, remove extra spaces)
    const normalizedTerm = searchTerm.toLowerCase();
    
    // Find matching location
    let found = false;
    for (const [key, location] of Object.entries(locationMap)) {
        if (key.includes(normalizedTerm) || normalizedTerm.includes(key)) {
            // Found a match, calculate route
            const startPoint = { lat: 9.576259947356398, lng: 76.62243243927207 }; // Campus entrance
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
    // Filter chips
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
        chip.addEventListener('click', function() {
            // Clear active class from all chips
            filterChips.forEach(c => c.classList.remove('active'));
            // Add active class to clicked chip
            this.classList.add('active');
            
            // Filter resources based on selection
            filterResources(this.textContent);
        });
    });
    
    // Map control buttons
    const mapControls = document.querySelectorAll('.map-control-btn');
    mapControls.forEach((control, index) => {
        control.addEventListener('click', function() {
            // Handle map controls based on index
            switch(index) {
                case 0: // Zoom in
                    if (map) map.setZoom(map.getZoom() + 1);
                    break;
                case 1: // Zoom out
                    if (map) map.setZoom(map.getZoom() - 1);
                    break;
                case 2: // Reset view
                    if (map) map.setCenter({ lat: 9.578921783001265, lng: 76.62335996504986 });
                    break;
                case 3: // Current location
                    getUserLocation();
                    break;
            }
        });
    });
    
    // Resource cards
    // Resource cards
    const resourceCards = document.querySelectorAll('.resource-card');
      resourceCards.forEach(card => {
        card.addEventListener('click', function() {
          // Get resource title
          const resourceTitle = this.querySelector('.resource-title').textContent;
        
          // Define which URL to open based on the resource title
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
        
        // Open the URL in a new tab
        window.location.href = targetUrl;
    });
  });
    
    // Set up routing from search
    setupRoutingFromSearch();

    setupDarkModeToggle();

    setupAutocomplete();

}

// Update map styles based on dark mode
function updateMapStyles(isDarkMode) {
    if (isDarkMode) {
        // Apply dark mode styles to the map
        map.setOptions({
            styles: [
                { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                // Add more style rules as needed
            ]
        });
    } else {
        // Reset to default styles
        map.setOptions({ styles: [] });
    }
}

    // Dark mode toggle - add this to your setupEventListeners function
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
            
            // If map is initialized, update map styles for dark mode
            if (mapInitialized && map) {
                updateMapStyles(isDarkMode);
            }
        });
        
        // Also check for saved dark mode preference
        const savedDarkMode = localStorage.getItem('dark-mode');
        if (savedDarkMode === 'enabled') {
            document.body.classList.add('dark-mode');
            if (mapInitialized && map) {
                updateMapStyles(true);
            }
        }
      }

// Get user's current location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const userCoords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log('User location:', userCoords);
                
                // Center map on user location
                if (map) {
                    map.setCenter(userCoords);
                    
                    // Add a marker for the user's position
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

// Filter resources (placeholder implementation)
function filterResources(filterType) {
    console.log(`Filtering resources by: ${filterType}`);
    // Implementation would filter the displayed resources
}

// For demo purposes - simulate loading a map
function simulateMapLoading() {
    const mapPlaceholder = document.getElementById('map');
    if (mapPlaceholder) {
        mapPlaceholder.textContent = 'Loading Campus Map...';
    }
}

// Campus locations database - expand this with all your locations
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

// Set up autocomplete functionality
function setupAutocomplete() {
    const searchInput = document.querySelector('.search-input');
    const autocompleteDropdown = document.getElementById('autocomplete-results');
    
    // Add input event listener for real-time suggestions
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.trim().toLowerCase();
        
        // Clear previous results
        autocompleteDropdown.innerHTML = '';
        
        // Hide dropdown if search term is empty
        if (searchTerm === '') {
            autocompleteDropdown.style.display = 'none';
            return;
        }
        
        // Filter locations based on search term
        const matchingLocations = campusLocations.filter(location => 
            location.name.toLowerCase().includes(searchTerm) || 
            location.category.toLowerCase().includes(searchTerm) ||
            location.building.toLowerCase().includes(searchTerm)
        );
        
        // Display matching locations
        if (matchingLocations.length > 0) {
            matchingLocations.forEach(location => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.innerHTML = `
                    <div class="item-name">${highlightMatch(location.name, searchTerm)}</div>
                    <div class="item-category">${location.category} - ${location.building}</div>
                `;
                
                // Add click event to select this item
                item.addEventListener('click', function() {
                    searchInput.value = location.name;
                    autocompleteDropdown.style.display = 'none';
                    
                    // Calculate route to this location
                    calculateRouteToLocation(location);
                });
                
                autocompleteDropdown.appendChild(item);
            });
            
            autocompleteDropdown.style.display = 'block';
        } else {
            // Show "no results" message
            const noResults = document.createElement('div');
            noResults.className = 'autocomplete-item';
            noResults.textContent = 'No matching locations found';
            autocompleteDropdown.appendChild(noResults);
            autocompleteDropdown.style.display = 'block';
        }
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !autocompleteDropdown.contains(e.target)) {
            autocompleteDropdown.style.display = 'none';
        }
    });
    
    // Close dropdown on Escape key
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            autocompleteDropdown.style.display = 'none';
        }
    });
}

// Highlight matching part of text
function highlightMatch(text, searchTerm) {
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// Calculate route to selected location
function calculateRouteToLocation(location) {
    // Use user's location or a default starting point
    const startPoint = { lat: 9.576259947356398, lng: 76.62243243927207 }; // Campus entrance
    
    // Center map on destination
    if (map) {
        map.setCenter(location.position);
        map.setZoom(18); 
    }
    
    // Calculate route
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
