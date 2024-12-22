const { parentPort } = require("worker_threads");
const { processPhoneNumber } = require("./your-helper-functions"); // Import your function

parentPort.on("message", async ({ templateJson }) => {
  try {
    const result = await processPhoneNumber(templateJson);
    parentPort.postMessage({ success: true, result });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
});
