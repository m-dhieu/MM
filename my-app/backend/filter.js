/* Data Filtering Script for Frontend Data Consumption */

const fs = require('fs');     // node.js file system module for i/o
const path = require('path'); // module for manipulating filesystem paths

// map a transaction type string to a category label & icon CSS class
// use lowercase matching & return defaults if no match found
// @param {string} type - transaction type string (e.g., "deposit")
// @returns {Object} an object with `category` & FontAwesome `icon` class

function mapCategoryAndIcon(type) {
    switch(type.toLowerCase()) {
        case "deposit":
            return {category: "Income", icon: "fa-hand-holding-dollar"};
        case "payment":
            return {category: "Merchant", icon: "fa-store"};
        case "transfer":
            return {category: "Transfers", icon: "fa-arrow-right-arrow-left"};
        case "other":
            return {category: "Others", icon: "fa-circle-question"};
        case "utilities":
            return {category: "Utilities", icon: "fa-bolt"};
        case "subscriptions":
            return {category: "Subscriptions", icon: "fa-file-invoice-dollar"};
        case "loans":
            return {category: "Loans", icon: "fa-money-bill-wave"};
        case "credit card":
            return {category: "Credit Card", icon: "fa-credit-card"};
        case "insurance":
            return {category: "Insurance", icon: "fa-shield-alt"};
        case "donations":
            return {category: "Donations", icon: "fa-hand-holding-heart"};
        case "taxes":
            return {category: "Taxes", icon: "fa-receipt"};
        case "memberships":
            return {category: "Memberships", icon: "fa-users"};
        case "gym":
            return {category: "Gym", icon: "fa-dumbbell"};
        default:
            // unknown/unhandled types
            return {category: "Unknown", icon: "fa-question"};
    }
}

// transform raw transaction data from json, filter by year/month
// enrich each transaction with category & icon info
// normalize participant data & amount sign according to rules
// return sanitized objects for frontend display

function transformTransactions(jsonData, filterYear, filterMonth) {
    return jsonData
        // only include transactions matching the provided year & month
        .filter(tx => {
            const [year, month] = tx.DateTime.split(" ")[0].split("-");
            return parseInt(year) === filterYear && parseInt(month) === filterMonth;
        })
        // transform transactions to consistent enriched format
        .map(tx => {
            const date = tx.DateTime.split(" ")[0];
            const time = tx.DateTime.split(" ")[1] + " " + (tx.DateTime.split(" ")[2] || "");

            // map TransactionType to category & icon, defaulting appropriately
            const {category, icon} = mapCategoryAndIcon(tx.TransactionType);

            // determine main participant, or default to unknown
            let participant = {Name: "Unknown", PhoneNumber: ""};
            if (tx.Participants && tx.Participants.length > 0) {
                participant = tx.Participants[0];
            }

            // normalize participant name for bank transfer patterns
            const replacementPattern = /your money account at/i;
            if (replacementPattern.test(participant.Name)) {
                participant.Name = "Bank Transfer";
            }
            // determine transaction amount sign based on message & category
            let messageText = (tx.MessageText || "").toLowerCase();
            let amount = tx.Amount;

            if (messageText.startsWith("you have received") || messageText.includes("deposit")) {
                // incoming transactions are +ve amounts
                amount = Math.abs(tx.Amount);
            } else if (messageText.startsWith("your payment of") || messageText.startsWith("transferred to")) {
                // outgoing payments are -ve amounts
                amount = -Math.abs(tx.Amount);
            } else {
                // outgoing categories list used as fallback for -ve amounts
                const outgoingCategories = [
                    "bills", "bundles", "unknown", "other", "utilities",
                    "subscriptions", "loans", "credit card", "insurance",
                    "donations", "taxes", "memberships", "gym", "merchant"
                ];
                if (
                    outgoingCategories.includes(category.toLowerCase()) ||
                    participant.Name.toLowerCase().includes("linda")
                ) {
                    amount = -Math.abs(tx.Amount);
                } else {
                    // otherwise treat amount as +ve
                    amount = Math.abs(tx.Amount);
                }
            }

            // compose final normalized transaction object with all needed info
            return {
                id: "MPR" + date.replace(/-/g,"") + String(tx.TransactionID).padStart(4, '0'),
                name: participant.Name,
                phone: participant.PhoneNumber,
                amount: amount,
                category: category,
                icon: icon,
                statusIcon: tx.Status.toLowerCase() === "confirmed" ? "fa-circle-check" : "fa-circle-xmark",
                status: tx.Status.toLowerCase() === "confirmed" ? "Completed" : tx.Status,
                date: date,
                time: time.trim()
            };
        });
}

// example filter criteria
const yearToFilter = 2024; // year
const monthToFilter = 7; // month

// define file paths relative to current directory
const transactionsJsonPath = path.join(__dirname, 'transactions.json');
const outputJsPath = path.join(__dirname, 'database.js');
// read raw json transactions
// transform & write filtered/enriched js file for the frontend
fs.readFile(transactionsJsonPath, 'utf8', (err, data) => {
    if (err) {
        // log error if reading fails
        console.error("Error reading transactions.json:", err);
        return;
    }

    // parse json string to object array
    const transactions = JSON.parse(data);

    // transform parsed transactions with filtering & enrichment
    const filteredTransactions = transformTransactions(transactions, yearToFilter, monthToFilter);

    // prepare output js content with indentation for readability
    const outputJs = `// Auto-generated database file\n\nwindow.transactionsDB = ${JSON.stringify(filteredTransactions, null, 2)};`;

    // write output js for frontend use
    fs.writeFile(outputJsPath, outputJs, 'utf8', (err) => {
        if (err) {
            // log error writing file
            console.error("Error writing database.js:", err);
        } else {
            // confirmation log
            console.log("database.js created successfully with filtered transactions.");
        }
    });
});
