// Import required modules
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { countryCodes } from "./countryCodes.js";
import { indicators } from "./indicators.js";

// Initialize Express app
const app = express();
const port = 3000;

// Create a list of country names from countryCodes
const countries = [];
countryCodes.forEach((item) => {
    countries.push(item.name);
});

// Get the keys (indicators) from the indicators object
const keysArray = Object.keys(indicators);

// Set the view engine to EJS
app.set("view engine", "ejs");

// Middleware to parse URL-encoded bodies and serve static files
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static("node_modules"));

// Route for the home page
app.get("/", (req, res) => {
    res.render("home.ejs");
});

// Route for the compare page
app.get("/compare", (req, res) => {
    res.render("compare.ejs", { data: [countries, keysArray] });
});

// Helper function to fetch data from the World Bank API
async function fetchData(countryCode, indicator) {
    try {
        const response = await axios.get(`http://api.worldbank.org/v2/country/${countryCode}/indicator/${indicator}?format=json`);
        return response.data[1];
    } catch (error) {
        throw new Error(`Error fetching data for ${countryCode} and indicator ${indicator}: ${error.message}`);
    }
};

// Route to handle the comparison of countries
app.post("/compare-countries", async (req, res) => {
    const countryDataOne = countryCodes.find(item => item.name === req.body.countryOne);
    const countryDataTwo = countryCodes.find(item => item.name === req.body.countryTwo);
    const stats = req.body.stats;

    if (Array.isArray(stats)) {
        try {
            const filters = stats.map(stat => indicators[stat]);
            const responsesOne = await Promise.all(filters.map(filter => fetchData(countryDataOne.alpha2, filter)));
            const responsesTwo = await Promise.all(filters.map(filter => fetchData(countryDataTwo.alpha2, filter)));

            const filteredObjectsOne = responsesOne.flatMap(array => array).filter(obj => obj.date === req.body.year);
            const filteredObjectsTwo = responsesTwo.flatMap(array => array).filter(obj => obj.date === req.body.year);

            const myObjTwo = [req.body.countryOne, req.body.countryTwo, filteredObjectsOne, filteredObjectsTwo, stats, req.body.year];
            res.render("result.ejs", { data: myObjTwo });
        } catch (error) {
            console.error("Error processing data:", error.message);
            res.render("error.ejs", { error: "Data Unavailable" });
        }
    } else {
        const myObj = {
            selectedYear: req.body.year,
            stat: stats,
            countryOne: { name: req.body.countryOne },
            countryTwo: { name: req.body.countryTwo }
        };

        let stat = indicators[stats];
        try {
            const resultOne = await fetchData(countryDataOne.alpha2, stat);
            const resultTwo = await fetchData(countryDataTwo.alpha2, stat);

            resultOne.forEach((n) => {
                myObj["countryOne"][`${n.date}`] = n.value;
            });

            resultTwo.forEach((n) => {
                myObj["countryTwo"][`${n.date}`] = n.value;
            });

            res.render("result.ejs", { data: myObj });
        } catch (error) {
            console.error("Error fetching data from API:", error.message);
            res.status(500).render("result.ejs", { error: error.message });
        }
    }
});


// Route for the about us page
app.get("/aboutUs", (req, res) => {
    res.render("aboutUs.ejs");
});

// Start the server
app.listen(port, () => {
    console.log(`listening on port: ${port}`)
});
