// Used to make HTTP requests
let axios = require("axios");

// Used to promot the user for input
let inquirer = require('inquirer');

// Used to calcuate distance between points on a map
let geodist = require('geodist')

/**
 * Prompt asking the user for address. Returns address as string
 */
function askUserForAddress() {
	return inquirer
		.prompt([{name: 'x', message: 'From where would you like to get a taxi:'}])
		.then(r => r.x);
}

/**
 * Uses Google's Geocode API to convert an address, e.g. "Orchard Road, Singapore" into
 * it's lat & lng equivalents.
 */
function addressToLngLat(address) {
	return axios
		.get('https://maps.googleapis.com/maps/api/geocode/json', {
			params: {
				key: 'AIzaSyAbT_41515cGjJ7r2DjE4FYrN7i9DFmxTk',
				address: address
			}
		}).then(r => [r.data.results[0].formatted_address, r.data.results[0].geometry.location]);
}

/**
 * Converts lng lat coordinates into the nearest possible address
 */ 
function lngLatToAdress({lng, lat}) {
	return axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
			params: {
				key: 'AIzaSyAbT_41515cGjJ7r2DjE4FYrN7i9DFmxTk',
				latlng: `${lat},${lng}`
			}
		}).then(r => r.data.results[0].formatted_address).catch(e => console.log(e));
}

/**
 * Fetch list of locations of all available taxies throughout Singapore. Returns an array of [lng, lat] pairs
 */ 
function getTaxiAvailability() {
	return axios
		.get('https://api.data.gov.sg/v1/transport/taxi-availability', {headers: {'api-key': 'BTsUqhDjEGAzfKdbtGAuTACeB0dOBFzz'}})
		.then(r => r.data.features[0].geometry.coordinates);
}

/**
 * Returns the 5 taxis that are the closest to "lng" and "lat". Returns an Array of objects with properties
 * 
 *  - location: [lng, lat] pairs of taxi's location
 *  - distance: Distance to taxi, in meters, from "lng" and "lat"
 * 
 * The returned array will be sorted in order of proximity from provided lng + lat, with the nearest taxis first.
 */
function get5NearestTaxis(allTaxis, lng, lat) {
	return allTaxis
		.map(taxi => ({
			location: taxi, 
			distance: geodist(
				{lat, lng},
				{lat: taxi[1], lng: taxi[0]}, 
				{unit: 'meters'}
			)
		}))
		.sort((a, b) => a.distance - b.distance)
		.slice(0, 5);
}

async function run() {
	let allTaxis = await getTaxiAvailability();
	while(true) {
		let [address, {lat, lng}] = await addressToLngLat(await askUserForAddress());
		let taxisSortedByProximity = get5NearestTaxis(allTaxis, lng, lat);
		console.log(``);
		console.log(`Nearest taxis from your address "${address}":`);
		for (let taxi of taxisSortedByProximity) {
			let taxiAddress = await lngLatToAdress({lng: taxi.location[0], lat: taxi.location[1]});
			console.log(` - There is an available taxi at "${taxiAddress}", ${taxi.distance} meters away`);
		}
		console.log(``);
	}
}

// If this node module was started directly from the command-line
if (require.main === module) {
	run();
}		

