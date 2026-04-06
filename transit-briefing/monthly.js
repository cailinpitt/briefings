require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const { Printer } = require("../printer");
const { getTransitStats } = require("./data");
const { printBriefing } = require("./print-briefing");
const { sendMonthlyWrapped } = require("./wrapped-email");

const DAYS = 30;

async function main() {
  const testMode = process.argv.includes("--test");
  const devicePath = process.env.PRINTER_DEVICE || "/dev/usb/lp0";
  const printer = new Printer(devicePath, { testMode });

  console.log("Reading transit data...");
  const data = getTransitStats(DAYS);
  console.log(`${data.current.totalRides} rides this month (${data.previous.totalRides} last month).`);

  printer.init();
  await printBriefing(printer, data, { title: "MONTHLY REPORT", periodLabel: "last month", days: DAYS });
  printer.flush();

  try {
    await sendMonthlyWrapped();
  } catch (err) {
    console.error("Wrapped email failed:", err.message);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
