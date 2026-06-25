const axios = require("axios");
const Log = require("../../logging-middleware/logger");

async function getDepots() {
  try {
    await Log("backend", "info", "service", "Fetching depots");

    const response = await axios.get(process.env.DEPOT_API, {
      headers: {
        Authorization: `Bearer ${process.env.TOKEN}`,
      },
    });

    return response.data.depots;
  } catch (error) {
    await Log("backend", "error", "service", error.message);
    throw error;
  }
}

module.exports = { getDepots };