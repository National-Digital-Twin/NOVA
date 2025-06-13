/**
 * Utility functions for base64 encoding/decoding
 */

/**
 * Converts a base64 encoded string to a JSON object
 * @param {string} base64String - The base64 encoded string
 * @returns {Object} The decoded JSON object
 */
export const base64Tojson = (base64String) => {
  try {
    const jsonString = atob(base64String);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error decoding base64 to JSON:', error);
    return {};
  }
};

/**
 * Converts a JSON object to a base64 encoded string
 * @param {Object} jsonObject - The JSON object to encode
 * @returns {string} The base64 encoded string
 */
export const jsonToBase64 = (jsonObject) => {
  try {
    const jsonString = JSON.stringify(jsonObject);
    return btoa(jsonString);
  } catch (error) {
    console.error('Error encoding JSON to base64:', error);
    return '';
  }
};