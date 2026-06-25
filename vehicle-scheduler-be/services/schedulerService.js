const { getDepots } = require("./depotService");
const { getVehicles } = require("./vehicleService");
const knapsack = require("../utils/knapsack");
const Log = require("../../logging-middleware/logger");

async function generateSchedule() {
  await Log(
    "backend",
    "info",
    "service",
    "Generating schedules"
  );

  const depots = await getDepots();
  const vehicles = await getVehicles();

  const schedules = depots.map((depot) => {
    const result = knapsack(
      depot.MechanicHours,
      vehicles
    );

    return {
      depotId: depot.ID,
      mechanicHours: depot.MechanicHours,
      totalImpact: result.totalImpact,
      selectedTasks: result.selectedTasks.map(
        (task) => task.TaskID
      ),
    };
  });

  return schedules;
}

module.exports = { generateSchedule };