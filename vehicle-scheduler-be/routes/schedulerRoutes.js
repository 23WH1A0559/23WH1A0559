const express = require("express");
const router = express.Router();

const {
  generateSchedule,
} = require("../services/schedulerService");

router.get("/", async (req, res) => {
  try {
    const schedules = await generateSchedule();

    res.json({
      schedules,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;