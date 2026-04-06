require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const { Printer } = require("../printer");
const { getTransitStats, getCalendarMonthStats } = require("./data");
const { printBriefing } = require("./print-briefing");
const { sendWeeklyWrapped } = require("./wrapped-email");

async function main() {
  const testMode = process.argv.includes("--test");
  const devicePath = process.env.PRINTER_DEVICE || "/dev/usb/lp0";
  const printer = new Printer(devicePath, { testMode });

  console.log("Reading transit data...");

  const today = new Date();
  let data, options;

  if (today.getDate() === 1) {
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const monthName = lastMonth.toLocaleString("en-US", { month: "long" });
    data = getCalendarMonthStats(lastMonth.getFullYear(), lastMonth.getMonth());
    options = {
      title: `${monthName.toUpperCase()} REPORT`,
      periodLabel: "prior month",
      dateRangeStr: `${monthName} ${lastMonth.getFullYear()}`,
    };
    console.log(`${data.current.totalRides} rides in ${monthName} (${data.previous.totalRides} prior month).`);
  } else {
    data = getTransitStats(7);
    options = { title: "WEEKLY REPORT", periodLabel: "last week", days: 7 };
    console.log(`${data.current.totalRides} rides this week (${data.previous.totalRides} last week).`);
  }

  printer.init();
  await printBriefing(printer, data, options);
  printer.flush();

  try {
    await sendWeeklyWrapped();
  } catch (err) {
    console.error("Wrapped email failed:", err.message);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
