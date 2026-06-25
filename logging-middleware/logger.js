const axios = require("axios");

require("dotenv").config();
const TOKEN = process.env.TOKEN;
async function Log(stack, level, pkg, message) {
  try {
    const response = await axios.post(
      "http://4.224.186.213/evaluation-service/logs",
      {
        stack,
        level,
        package: pkg,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Log Sent:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Logging Failed:",
      error.response?.data || error.message
    );
  }
}

module.exports = Log;