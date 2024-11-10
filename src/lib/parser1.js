
/**
 * Fetches data from the API
 * @param {string} apiUrl - The API endpoint URL
 * @returns {Promise<Array>} Raw data from API
 */
async function fetchFromApi(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching from API:', error.message);
        throw error;
    }
}

/**
 * @param {object|Array} data - Raw geolocation data
 * @returns {Array<{latitude: number, longitude: number}>} Array of parsed coordinates
 */
function parseGeoData(data) {
    if (!Array.isArray(data)) {
        return extractCoordinates(data);
    }
    return data.map(item => extractCoordinates(item)).flat();
}

/**
 * Helper function to extract coordinates from a single geo object
 * @param {object} geoObject - Single geolocation object
 * @returns {Array<{latitude: number, longitude: number}>} Parsed coordinates
 */
function extractCoordinates(geoObject) {
 
    
    return geoObject.the_geom.coordinates.map(coords => ({
        latitude: coords[1],
        longitude: coords[0]
    }));
}

/**
 * Main function to process the data
 * @param {string} apiUrl - The API endpoint URL
 * @param {string} outputFileName - Name of the output file
 */
async function main(apiUrl, outputFileName = 'parsed_coordinates.json') {
    try {
        console.log('Fetching data from API...');
        const rawData = await fetchFromApi(apiUrl);
        console.log('Data fetched successfully');

        console.log('Parsing coordinates...');
        const coordinates = parseGeoData(rawData);
        console.log(`Parsed ${coordinates.length} locations`);


        // Log sample of the data
        console.log('\nSample of parsed data:');
        console.log(coordinates.slice(0, 2));
        
        return coordinates; // Return the parsed data for potential further use
    } catch (error) {
        console.error('Failed to process data:', error);
        throw error;
    }
}

// Export the functions for use in other files
module.exports = {
    fetchFromApi,
    parseGeoData,
    main
};


const API_URL = 'https://data.cityofnewyork.us/resource/bryy-vqd9.json?$select=the_geom&$$app_token=pWK0gwltkQYi66JaBanfQ4fLW&$limit=20000';
main(API_URL)
    .then(() => console.log('Processing completed'))
    .catch(error => console.error('Error in main process:', error));
