// "use client";

// import React, { useState, useEffect, useRef } from 'react';
// import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
// import { Loader } from 'lucide-react';

// declare global {
//   interface Window {
//     google: typeof google;
//     initMap: () => void;
//     showDirections: (placeId: string) => void;
//   }
// }

// const PharmacyHospitalFinder: React.FC = () => {
//   const mapRef = useRef<HTMLDivElement>(null);
//   const [map, setMap] = useState<google.maps.Map | null>(null);
//   const [userLocation, setUserLocation] = useState<google.maps.LatLng | null>(null);
//   const [showLocationPrompt, setShowLocationPrompt] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [mapLoaded, setMapLoaded] = useState(false);
//   const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
//   const [showDirectionsPanel, setShowDirectionsPanel] = useState(false);
//   const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
//   const API_KEY = "AIzaSyBBYsZVdFOBv3is6gNS3SbHr_xWY4pkpV8";
//   const SEARCH_RADIUS = 3000; // 3 km in meters

//   useEffect(() => {
//     setShowLocationPrompt(true);
//     loadGoogleMapsScript();

//     return () => {
//       const script = document.querySelector('script[src*="maps.googleapis.com"]');
//       if (script) {
//         script.remove();
//       }
//     };
//   }, []);

//   const loadGoogleMapsScript = () => {
//     if (window.google && window.google.maps) {
//       setMapLoaded(true);
//       setLoading(false);
//       return;
//     }

//     const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
//     if (existingScript) {
//       setMapLoaded(true);
//       setLoading(false);
//       return;
//     }

//     window.initMap = () => {
//       setMapLoaded(true);
//       setLoading(false);
//     };

//     const script = document.createElement('script');
//     script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places,geometry&callback=initMap`;
//     script.async = true;
//     script.defer = true;
//     script.onerror = (error) => {
//       console.error("Error loading Google Maps script:", error);
//       setLoading(false);
//     };
//     document.body.appendChild(script);
//   };

//   const initMap = (center: google.maps.LatLng | google.maps.LatLngLiteral) => {
//     if (!mapRef.current || !window.google) return;

//     const mapOptions: google.maps.MapOptions = {
//       center: center,
//       zoom: 14,
//     };
//     const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
//     setMap(newMap);

//     const newDirectionsRenderer = new google.maps.DirectionsRenderer();
//     newDirectionsRenderer.setMap(newMap);
//     setDirectionsRenderer(newDirectionsRenderer);

//     // Add user location marker
//     new window.google.maps.Marker({
//       position: center,
//       map: newMap,
//       title: 'Your Location',
//       icon: {
//         url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
//       }
//     });

//     // Add 3 km radius circle
//     new google.maps.Circle({
//       strokeColor: "#FF0000",
//       strokeOpacity: 0.8,
//       strokeWeight: 2,
//       fillColor: "#FF0000",
//       fillOpacity: 0.15,
//       map: newMap,
//       center: center,
//       radius: SEARCH_RADIUS
//     });

//     findNearbyPharmaciesAndHospitals(newMap, center);
//   };

//   const findNearbyPharmaciesAndHospitals = (map: google.maps.Map, location: google.maps.LatLng | google.maps.LatLngLiteral) => {
//     const service = new google.maps.places.PlacesService(map);
//     const searchTypes = ['pharmacy', 'hospital'];

//     searchTypes.forEach(type => {
//       const request: google.maps.places.PlaceSearchRequest = {
//         location: location,
//         radius: SEARCH_RADIUS,
//         type: type as google.maps.places.PlaceType
//       };

//       service.nearbySearch(request, (results, status) => {
//         if (status === google.maps.places.PlacesServiceStatus.OK && results) {
//           results.forEach(place => {
//             if (place.geometry && place.geometry.location) {
//               const distance = google.maps.geometry.spherical.computeDistanceBetween(
//                 location,
//                 place.geometry.location
//               );
//               if (distance <= SEARCH_RADIUS) {
//                 createMarker(place, map, type as 'pharmacy' | 'hospital');
//               }
//             }
//           });
//         }
//       });
//     });
//   };

//   const createMarker = (place: google.maps.places.PlaceResult, map: google.maps.Map, type: 'pharmacy' | 'hospital') => {
//     if (!place.geometry || !place.geometry.location) return;

//     const iconUrl = type === 'pharmacy' 
//       ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
//       : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';

//     const marker = new google.maps.Marker({
//       map: map,
//       position: place.geometry.location,
//       title: place.name,
//       icon: {
//         url: iconUrl
//       }
//     });

//     google.maps.event.addListener(marker, 'click', () => {
//       const infoWindow = new google.maps.InfoWindow({
//         content: `
//           <strong>${place.name}</strong><br>
//           ${place.vicinity}<br>
//           Type: ${type.charAt(0).toUpperCase() + type.slice(1)}<br>
//           <button onclick="window.showDirections('${place.place_id}')">Get Directions</button>
//         `
//       });
//       infoWindow.open(map, marker);
//     });
//   };

//   const showDirections = (placeId: string) => {
//     if (!map || !userLocation || !directionsRenderer) return;

//     const directionsService = new google.maps.DirectionsService();
//     directionsService.route(
//       {
//         origin: userLocation,
//         destination: { placeId: placeId },
//         travelMode: google.maps.TravelMode.DRIVING,
//       },
//       (result, status) => {
//         if (status === google.maps.DirectionsStatus.OK && result) {
//           setDirections(result);
//           directionsRenderer.setDirections(result);
//           setShowDirectionsPanel(true);
//         } else {
//           console.error('Directions request failed due to ' + status);
//         }
//       }
//     );
//   };

//   // Add showDirections to the global scope
//   window.showDirections = showDirections;

//   const handleAcceptLocation = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const userPos = new google.maps.LatLng(
//             position.coords.latitude,
//             position.coords.longitude
//           );
//           setUserLocation(userPos);
//           setShowLocationPrompt(false);
//           if (mapLoaded) {
//             initMap(userPos);
//           }
//         },
//         (error) => {
//           console.error("Error getting location:", error);
//           setShowLocationPrompt(false);
//         }
//       );
//     } else {
//       console.error("Geolocation is not supported by this browser.");
//       setShowLocationPrompt(false);
//     }
//   };

//   const handleDeclineLocation = () => {
//     setShowLocationPrompt(false);
//     if (mapLoaded) {
//       initMap({ lat: 0, lng: 0 });
//     }
//   };

//   const renderDirections = () => {
//     if (!directions || !directions.routes[0]) return null;

//     const route = directions.routes[0];
//     return (
//       <div className="bg-white p-4 max-h-96 overflow-y-auto">
//         <h2 className="text-xl font-bold mb-2">Directions</h2>
//         <p className="mb-2">Total distance: {route.legs[0].distance?.text}</p>
//         <p className="mb-4">Estimated time: {route.legs[0].duration?.text}</p>
//         <ol className="list-decimal list-inside">
//           {route.legs[0].steps.map((step, index) => (
//             <li key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: step.instructions }}></li>
//           ))}
//         </ol>
//         <button 
//           onClick={() => setShowDirectionsPanel(false)} 
//           className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
//         >
//           Close Directions
//         </button>
//       </div>
//     );
//   };

//   return (
//     <div className="relative w-full h-screen">
//       <div ref={mapRef} className="w-full h-full">
//         {loading && (
//           <div className="flex items-center justify-center h-full">
//             <Loader className="animate-spin" size={48} />
//           </div>
//         )}
//       </div>

//       {showLocationPrompt && (
//         <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
//           <Alert>
//             <AlertTitle>Location Access</AlertTitle>
//             <AlertDescription>
//               Bheta wants to use your location to find nearby pharmacies and hospitals
//               <div className="mt-2 flex justify-end space-x-2">
//                 <button
//                   onClick={handleDeclineLocation}
//                   className="px-4 py-2 bg-gray-200 rounded"
//                 >
//                   Decline
//                 </button>
//                 <button
//                   onClick={handleAcceptLocation}
//                   className="px-4 py-2 bg-blue-500 text-white rounded"
//                 >
//                   Accept
//                 </button>
//               </div>
//             </AlertDescription>
//           </Alert>
//         </div>
//       )}

//       {showDirectionsPanel && (
//         <div className="absolute top-4 right-4 w-1/3 max-w-md">
//           {renderDirections()}
//         </div>
//       )}

//       <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow">
//         <h3 className="font-bold mb-2">Key</h3>
//         <div className="flex items-center mb-1">
//           <img src="http://maps.google.com/mapfiles/ms/icons/green-dot.png" alt="Pharmacy" className="mr-2" />
//           <span>Pharmacy</span>
//         </div>
//         <div className="flex items-center">
//           <img src="http://maps.google.com/mapfiles/ms/icons/red-dot.png" alt="Hospital" className="mr-2" />
//           <span>Hospital</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PharmacyHospitalFinder;


"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { Loader } from 'lucide-react';

declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
    promptDirections: (placeId: string, placeName: string) => void;
  }
}

const PharmacyHospitalFinder: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLng | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [showDirectionsPanel, setShowDirectionsPanel] = useState(false);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [showDirectionsPrompt, setShowDirectionsPrompt] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<{ id: string; name: string } | null>(null);
  const API_KEY = "AIzaSyBBYsZVdFOBv3is6gNS3SbHr_xWY4pkpV8";
  const SEARCH_RADIUS = 3000; // 3 km in meters

  useEffect(() => {
    setShowLocationPrompt(true);
    loadGoogleMapsScript();

    return () => {
      const script = document.querySelector('script[src*="maps.googleapis.com"]');
      if (script) {
        script.remove();
      }
    };
  }, []);

  const loadGoogleMapsScript = () => {
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      setLoading(false);
      return;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      setMapLoaded(true);
      setLoading(false);
      return;
    }

    window.initMap = () => {
      setMapLoaded(true);
      setLoading(false);
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places,geometry&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = (error) => {
      console.error("Error loading Google Maps script:", error);
      setLoading(false);
    };
    document.body.appendChild(script);
  };

  const initMap = (center: google.maps.LatLng | google.maps.LatLngLiteral) => {
    if (!mapRef.current || !window.google) return;

    const mapOptions: google.maps.MapOptions = {
      center: center,
      zoom: 14,
    };
    const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
    setMap(newMap);

    const newDirectionsRenderer = new google.maps.DirectionsRenderer();
    newDirectionsRenderer.setMap(newMap);
    setDirectionsRenderer(newDirectionsRenderer);

    // Add user location marker
    new window.google.maps.Marker({
      position: center,
      map: newMap,
      title: 'Your Location',
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      }
    });

    // Add 3 km radius circle
    new google.maps.Circle({
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.15,
      map: newMap,
      center: center,
      radius: SEARCH_RADIUS
    });

    findNearbyPharmaciesAndHospitals(newMap, center);
  };

  const findNearbyPharmaciesAndHospitals = (map: google.maps.Map, location: google.maps.LatLng | google.maps.LatLngLiteral) => {
    const service = new google.maps.places.PlacesService(map);
    const searchTypes = ['pharmacy', 'hospital'];

    searchTypes.forEach(type => {
      const request: google.maps.places.PlaceSearchRequest = {
        location: location,
        radius: SEARCH_RADIUS,
        type: type as google.maps.places.PlaceType
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          results.forEach(place => {
            if (place.geometry && place.geometry.location) {
              const distance = google.maps.geometry.spherical.computeDistanceBetween(
                location,
                place.geometry.location
              );
              if (distance <= SEARCH_RADIUS) {
                createMarker(place, map, type as 'pharmacy' | 'hospital');
              }
            }
          });
        }
      });
    });
  };

  const createMarker = (place: google.maps.places.PlaceResult, map: google.maps.Map, type: 'pharmacy' | 'hospital') => {
    if (!place.geometry || !place.geometry.location) return;

    const iconUrl = type === 'pharmacy' 
      ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
      : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';

    const marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location,
      title: place.name,
      icon: {
        url: iconUrl
      }
    });

    // Add label to marker
    const label = new google.maps.InfoWindow({
      content: `<div style="font-size: 12px; font-weight: bold;">${place.name}</div>`,
      disableAutoPan: true
    });
    label.open(map, marker);

    google.maps.event.addListener(marker, 'click', () => {
      if (place.place_id && place.name) {
        promptDirections(place.place_id, place.name);
      }
    });
  };

  const promptDirections = (placeId: string, placeName: string) => {
    setSelectedPlace({ id: placeId, name: placeName });
    setShowDirectionsPrompt(true);
  };


  window.promptDirections = promptDirections;

  const showDirections = () => {
    if (!map || !userLocation || !directionsRenderer || !selectedPlace) return;

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: userLocation,
        destination: { placeId: selectedPlace.id },
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
          directionsRenderer.setDirections(result);
          setShowDirectionsPanel(true);
          setShowDirectionsPrompt(false);
          speakDirections(result);
        } else {
          console.error('Directions request failed due to ' + status);
        }
      }
    );
  };

  const speakDirections = (result: google.maps.DirectionsResult) => {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance();
      const steps = result.routes[0].legs[0].steps;
      let directionsText = "Starting directions. ";
      
      steps.forEach((step, index) => {
        directionsText += `Step ${index + 1}: ${step.instructions} `;
      });

      directionsText += "You have arrived at your destination.";
      
      speech.text = directionsText;
      speech.volume = 1;
      speech.rate = 0.9;
      speech.pitch = 1;

      window.speechSynthesis.speak(speech);
    }
  };

  const handleAcceptLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );
          setUserLocation(userPos);
          setShowLocationPrompt(false);
          if (mapLoaded) {
            initMap(userPos);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setShowLocationPrompt(false);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setShowLocationPrompt(false);
    }
  };

  const handleDeclineLocation = () => {
    setShowLocationPrompt(false);
    if (mapLoaded) {
      initMap({ lat: 0, lng: 0 });
    }
  };

  const renderDirections = () => {
    if (!directions || !directions.routes[0]) return null;

    const route = directions.routes[0];
    return (
      <div className="bg-white p-4 max-h-96 overflow-y-auto">
        <h2 className="text-xl font-bold mb-2">Directions</h2>
        <p className="mb-2">Total distance: {route.legs[0].distance?.text}</p>
        <p className="mb-4">Estimated time: {route.legs[0].duration?.text}</p>
        <ol className="list-decimal list-inside">
          {route.legs[0].steps.map((step, index) => (
            <li key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: step.instructions }}></li>
          ))}
        </ol>
        <button 
          onClick={() => setShowDirectionsPanel(false)} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Close Directions
        </button>
      </div>
    );
  };

  return (
    <div className="relative w-full h-screen">
      <div ref={mapRef} className="w-full h-full">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <Loader className="animate-spin" size={48} />
          </div>
        )}
      </div>

      {showLocationPrompt && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <Alert>
            <AlertTitle>Location Access</AlertTitle>
            <AlertDescription>
              Bheta wants to use your location to find nearby pharmacies and hospitals
              <div className="mt-2 flex justify-end space-x-2">
                <button
                  onClick={handleDeclineLocation}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Decline
                </button>
                <button
                  onClick={handleAcceptLocation}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Accept
                </button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {showDirectionsPrompt && selectedPlace && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <Alert>
            <AlertTitle>Get Directions</AlertTitle>
            <AlertDescription>
              Do you want to get directions to {selectedPlace.name}?
              <div className="mt-2 flex justify-end space-x-2">
                <button
                  onClick={() => setShowDirectionsPrompt(false)}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  No
                </button>
                <button
                  onClick={showDirections}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Yes
                </button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {showDirectionsPanel && (
        <div className="absolute top-4 right-4 w-1/3 max-w-md">
          {renderDirections()}
        </div>
      )}

      <div className="absolute bottom-4 left-4 bg-white p-4 rounded shadow text-lg">
        <h3 className="font-bold mb-4 text-xl">Key</h3>
        <div className="flex items-center mb-2">
          <img src="http://maps.google.com/mapfiles/ms/icons/green-dot.png" alt="Pharmacy" className="mr-4 w-8 h-8" />
          <span className="text-green-600 font-semibold">Pharmacy</span>
        </div>
        <div className="flex items-center">
          <img src="http://maps.google.com/mapfiles/ms/icons/red-dot.png" alt="Hospital" className="mr-4 w-8 h-8" />
          <span className="text-red-600 font-semibold">Hospital</span>
        </div>
      </div>
    </div>
  );
};

export default PharmacyHospitalFinder;