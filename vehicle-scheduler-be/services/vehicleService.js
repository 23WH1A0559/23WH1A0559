const axios = require("axios");
const Log = require("../../logging-middleware/logger");

async function getVehicles() {
  try {
    await Log("backend", "info", "service", "Fetching vehicles");

    const response = await axios.get(process.env.VEHICLE_API, {
      headers: {
        Authorization: `Bearer ${process.env.TOKEN}`,
      },
    });

    return response.data.vehicles;
  } catch (error) {
    await Log("backend", "error", "service", error.message);
    throw error;
  }
}

module.exports = { getVehicles };