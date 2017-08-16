// Used to make HTTP requests
const axios = require("axios");

// Used to promot the user for input
const inquirer = require('inquirer');

// Used to calcuate distance between points on a map
const geodist = require('geodist');

// Set up environment variables read from .env file
require('dotenv').config();

// Shorthand methods for dispatching HTTP requests to Google and Data Gov SG
const httpRequest = {
  googleMapsGeoCode: axios.create({
    url: "https://maps.googleapis.com/maps/api/geocode/json",
    params: { key: process.env.GOOGLE_MAPS_API_KEY }
  }),
  sgTaxiAvailability: axios.create({
    url: "https://api.data.gov.sg/v1/transport/taxi-availability",
    headers: { 'api-key': process.env.DATA_GOV_SG_API_KEY }
  })
};

// Get a list of lat lng coordinates of all availalbe taxis in Singapore
const getTaxiAvailability = () => httpRequest.sgTaxiAvailability()
.then(r => r.data.features[0].geometry.coordinates);

// Convert lat lng to nearest address
const lngLatToAdress = ({lng, lat}) => httpRequest.googleMapsGeoCode({params: {latlng: `${lat},${lng}`}})
  .then(r => r.data.results[0].formatted_address)

// Convert address to lat lng
const addressToLngLat = (address) => httpRequest.googleMapsGeoCode({params: {address}})
  .then(r => [r.data.results[0].formatted_address, r.data.results[0].geometry.location]);

// Prompt asking the user for address. Returns address as string
const askUserForAddress = () => inquirer.prompt([{name: 'x', message: 'From where would you like to get a taxi:'}])
  .then(r => r.x);

/**
 * Returns the 5 taxis that are the closest to "lng" and "lat". Returns an Array of objects with properties
 *
 *  - location: [lng, lat] pairs of taxi's location
 *  - distance: Distance to taxi, in meters, from "lng" and "lat"
 *
 * The returned array will be sorted in order of proximity from provided lng + lat, with the nearest taxis first.
 */
const get5NearestTaxis = (allTaxis, lng, lat) => allTaxis

  // For each taxi, calculate the distance in meters to `lng` + `lat` and return an object {location, distance}
  .map(taxi => ({
    location: taxi,
    distance: geodist({lat, lng}, {lat: taxi[1], lng: taxi[0]}, {unit: 'meters'})
  }))

  // Sort all taxis by distance from lng lat, with the closest ones first
  .sort((a, b) => a.distance - b.distance)

  // Return only the 5 closest taxis
  .slice(0, 5);

async function run() {
  try {

    // Fetch list of all available taxis within Singapore from data.gov.sg
    let allTaxis = await getTaxiAvailability();

    while(true) {

      // Ask user for an address and convert it into a lng lat coordinate pair
      let [address, {lat, lng}] = await addressToLngLat(await askUserForAddress());

      // From the list above, get the 5 closest taxis sorted by proximity to 'lng' + 'lat'
      let taxisSortedByProximity = get5NearestTaxis(allTaxis, lng, lat);

      // Print out the 5 nearest taxis to screen
      console.log(``);
      console.log(`Nearest taxis from your address "${address}":`);
      for (let taxi of taxisSortedByProximity) {

        // Taxi locations are stored as lng lat pairs. For readability, fetch the closest available address to
        // taxi's location
        let taxiAddress = await lngLatToAdress({lng: taxi.location[0], lat: taxi.location[1]});
        console.log(` - There is an available taxi at "${taxiAddress}", ${taxi.distance} meters away`);
      }
      console.log(``);

    }

  } catch(e) {
    console.error("Whoops, this is not supposed to happen", e);
    process.exit(-1);
  }
}

// If this node module was started directly from the command-line
if (require.main === module) {
  run();
}