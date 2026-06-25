const Log = require("./logger");

async function test() {
  await Log(
    "backend",
    "info",
    "service",
    "User registration started"
  );
}

test();