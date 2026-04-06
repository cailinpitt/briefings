const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const os = require("os");

const CTA_WRAPPED_DIR = path.join(os.homedir(), "Development/cta-wrapped");

// Must match the logic in generate_wrapped.js exactly
function getWeekNumber(date) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
    const pastDaysOfYear = Math.round((d - firstDayOfYear) / 86400000);
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function runGenerateWrapped(args) {
    return new Promise((resolve, reject) => {
        execFile(process.execPath, ["generate_wrapped.js", ...args], {
            cwd: CTA_WRAPPED_DIR,
        }, (err, stdout, stderr) => {
            if (stdout) console.log(stdout.trim());
            if (stderr) console.error(stderr.trim());
            if (err) reject(new Error(`generate_wrapped failed: ${err.message}`));
            else resolve();
        });
    });
}

async function emailImages(emailConfig, subject, imageDir, filePrefix) {
    const transporter = nodemailer.createTransport({
        service: emailConfig.service,
        auth: {
            user: emailConfig.user,
            pass: emailConfig.password,
        },
    });

    const files = fs.readdirSync(imageDir)
        .filter(f => f.startsWith(filePrefix) && f.endsWith(".png"))
        .sort();

    if (files.length === 0) {
        console.log(`No wrapped images found with prefix "${filePrefix}"`);
        return;
    }

    const attachments = files.map(f => ({
        filename: f,
        path: path.join(imageDir, f),
    }));

    await transporter.sendMail({
        from: emailConfig.user,
        to: emailConfig.to || emailConfig.user,
        subject,
        text: `${files.length} wrapped images attached.`,
        attachments,
    });

    console.log(`Wrapped email sent: ${subject}`);
}

async function sendWeeklyWrapped() {
    const { email: emailConfig } = require(path.join(CTA_WRAPPED_DIR, "keys.js"));
    if (!emailConfig) {
        console.log("No email config in cta-wrapped/keys.js, skipping wrapped email");
        return;
    }

    const today = new Date();
    // Weeks are Mon–Sun. getWeekNumber treats Sunday as the start of the next
    // week, so if today is Sunday use yesterday (Saturday) to land in the right week.
    const ref = today.getDay() === 0
        ? new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
        : today;
    const year = ref.getFullYear();
    const week = getWeekNumber(ref);

    console.log(`Generating weekly wrapped for ${year} w${week}...`);
    await runGenerateWrapped([String(year), `w${week}`]);

    const imageDir = path.join(CTA_WRAPPED_DIR, "wrapped_images");
    const filePrefix = `${year}-w${String(week).padStart(2, "0")}-`;
    await emailImages(emailConfig, `CTA Weekly Wrapped – Week ${week}, ${year}`, imageDir, filePrefix);
}

async function sendMonthlyWrapped() {
    const { email: emailConfig } = require(path.join(CTA_WRAPPED_DIR, "keys.js"));
    if (!emailConfig) {
        console.log("No email config in cta-wrapped/keys.js, skipping wrapped email");
        return;
    }

    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const year = lastMonth.getFullYear();
    const month = lastMonth.getMonth() + 1; // 1-indexed
    const monthName = lastMonth.toLocaleString("en-US", { month: "long" });

    console.log(`Generating monthly wrapped for ${monthName} ${year}...`);
    await runGenerateWrapped([String(year), String(month)]);

    const imageDir = path.join(CTA_WRAPPED_DIR, "wrapped_images");
    const filePrefix = `${year}-${String(month).padStart(2, "0")}-`;
    await emailImages(emailConfig, `CTA Monthly Wrapped – ${monthName} ${year}`, imageDir, filePrefix);
}

module.exports = { sendWeeklyWrapped, sendMonthlyWrapped };
