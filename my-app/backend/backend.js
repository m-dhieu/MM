/**
   Server setup and transaction data processing for MoMo Press backend

   This backend service:
      - serves static files from the project directory
      - provides an API endpoint to update transactions filtered by year/month
      - reads raw transaction data from json, transforms it for frontend use
      - writes transformed transaction data as a js file for frontend consumption
 */

const express = require("express"); // import express web framework
const fs = require("fs");           // file system module for file operations
const path = require("path");       // path module to handle file paths

const app = express();              // create an express app instance

// Filters and transforms raw transaction data for a given year/month

// Steps:
//   1. Filters transactions based on the year and month extracted from DateTime
//   2. Normalizes participant details, defaulting to "Unknown" if missing
//   3. Renames "your money account at" participant to "Bank Transfer" for clarity
//   4. Calculates transaction amount sign (+/-) based on message content and category rules
//   5. Returns a simplified, consistent transaction object ready for frontend use

// @param {Array} data - raw transaction objects
// @param {number} filterYear - year to filter transactions by (e.g 2025)
// @param {number} filterMonth - month to filter transactions by (1-12)
// @returns {Array} array of transformed transaction objects

function transformTransactions(data, filterYear, filterMonth) {
    return data
        // filter only transactions matching the requested year/month
        .filter((tx) => {
            const [year, month] = tx.DateTime.split(" ")[0].split("-");
            return parseInt(year) === filterYear && parseInt(month) === filterMonth;
        })
        // map each transaction to a normalized object for frontend consumption
        .map((tx) => {
            // Extract date and time parts from DateTime string
            const date = tx.DateTime.split(" ")[0];
            const time = tx.DateTime.split(" ")[1] + " " + (tx.DateTime.split(" ")[2] || "");


            // default participant info in case none provided
            let participant = { Name: "Unknown", PhoneNumber: "" };
            if (tx.Participants && tx.Participants.length > 0) {
                participant = tx.Participants[0];
            }

            // standardize participant name if it's a bank transfer
            if (/your money account at/i.test(participant.Name)) {
                participant.Name = "Bank Transfer";
            }

            let amount = tx.Amount;
            const messageText = (tx.MessageText || "").toLowerCase();

            // set amount sign based on transaction message description
            if (messageText.startsWith("you have received") || messageText.includes("deposit")) {
                amount = Math.abs(tx.Amount);
            } else if (
                messageText.startsWith("your payment of") ||
                messageText.startsWith("transferred to")
            ) {
                amount = -Math.abs(tx.Amount);
            } else {
                // list categories which always represent outflows (-ve amounts)
                const outgoingCategories = [
                    "bills",
                    "bundles",
                    "unknown",
                    "other",
                    "utilities",
                    "subscriptions",
                    "loans",
                    "credit card",
                    "insurance",
                    "donations",
                    "taxes",
                    "memberships",
                    "gym",
                    "merchant",
                ];
                const categoryLower = tx.TransactionType.toLowerCase();
                // if category/participant name indicates outgoing, use -ve amount
                if (
                    outgoingCategories.includes(categoryLower) ||
                    participant.Name.toLowerCase().includes("linda")
                ) {
                    amount = -Math.abs(tx.Amount);
                } else {
                    // otherwise, treat amount as +ve (inflow)
                    amount = Math.abs(tx.Amount);
                }
            }

            // build & return final transaction object for frontend
            return {
                id: "MPR" + date.replace(/-/g, "") + String(tx.TransactionID).padStart(4, "0"),
                name: participant.Name,
                phone: participant.PhoneNumber,
                amount: amount,
                category: tx.TransactionType,
                date: date,
                time: time.trim(),
                status: tx.Status,
            };
        });
}

// middleware to serve static files from current directory (html/css/js)
app.use(express.static(path.join(__dirname)));

// API endpoint to update transactions filtered by year & month
// example request: /api/updateTransactions?year=2025&month=11
// flow:
//   - validate presence & range of year & month query parameters
//   - read raw transactions json file
//   - filter & transform transactions with transformTransactions()
//   - write transformed data as a js file (database.js) to be used by frontend
//   - respond with success json or error message

app.get("/api/updateTransactions", (req, res) => {
    // parse year & month from request query parameters
    const year = parseInt(req.query.year);
    const month = parseInt(req.query.month);

    // validate year & month presence & correctness
    if (!year || !month || month < 1 || month > 12) {
        return res.status(400).json({ error: "Invalid year or month" });
    }

    try {
        // read transactions.json file containing raw data
        const rawData = fs.readFileSync(path.join(__dirname, "transactions.json"), "utf8");
        const transactions = JSON.parse(rawData);

        // filter & normalize transactions for requested year/month
        const filteredTransactions = transformTransactions(transactions, year, month);

        // create js content initializing window.transactionsDB for frontend use
        const outputJsContent = `window.transactionsDB = ${JSON.stringify(filteredTransactions, null, 2)};`;

        // write transformed data to database.js for frontend consumption
        fs.writeFileSync(path.join(__dirname, "database.js"), outputJsContent, "utf8");

        // send json success response to client
        res.json({ success: true });
    } catch (err) {
        // handle errors reading/processing data
        res.status(500).json({ error: err.message });
    }
});

// set port for server
const PORT = 3000;

// start express server listening on specified port
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

