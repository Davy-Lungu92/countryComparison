import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import {countryCodes} from "./countryCodes.js";
import { indicators } from "./indicators.js";


const app = express();
const port = 3000;
const countries = [];
countryCodes.forEach((item) => {
    countries.push(item.name);
});


const keysArray = Object.keys(indicators);


app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static("node_modules"));

app.get("/", (req, res) => {
   
    res.render("home.ejs");
});

app.get("/compare", (req, res) => {
    res.render("compare.ejs", {data:[countries,keysArray]})
});

app.post("/compare-countries", async (req, res) => {
    const countryDataOne = countryCodes.find(item => item.name === req.body.countryOne);
    const countryDataTwo = countryCodes.find(item => item.name === req.body.countryTwo);
    const stats = req.body.stats;
    if(Array.isArray(stats)) {
        let filters = stats.map(stat => indicators[stat]);
        let responsesOne = [];
        let responsesTwo = [];

        for (let filter of filters){
            
            try {
                let responseOne = await axios.get(`http://api.worldbank.org/v2/country/${countryDataOne.alpha2}/indicator/${filter}?format=json`);

                let responseTwo = await axios.get(`http://api.worldbank.org/v2/country/${countryDataTwo.alpha2}/indicator/${filter}?format=json`);

                responsesOne.push(responseOne.data[1]);
                responsesTwo.push(responseTwo.data[1]);
                 
            } catch (error) {
                console.error("Error fetching data from API:", error.message);
                res.render("error.ejs", { error: "Data Unavailable" });
            }
            
        };
        try {
            const filteredObjectsOne = responsesOne.flatMap(array => array).filter(obj => obj.date === req.body.year);
            const filteredObjectsTwo = responsesTwo.flatMap(array => array).filter(obj => obj.date === req.body.year);

            const myObjTwo = [req.body.countryOne,req.body.countryTwo,filteredObjectsOne, filteredObjectsTwo,stats,req.body.year];
            res.render("result.ejs", {data: myObjTwo });
    
            
        } catch (error) {
            console.error("Error fetching data from API:", error.message);
            res.render("error.ejs", { error: "Data Unavailable" });
        }
         
       
       

    } else {
        const myObj = {
            selectedYear : req.body.year, 
            stat: stats,
            countryOne : {
                name : req.body.countryOne,
             
            },
            countryTwo : {
                name : req.body.countryTwo,
                
            }    
        };
            
            
        let stat =  indicators[stats];
        try {
            let resultOne = await axios.get(`http://api.worldbank.org/v2/country/${countryDataOne.alpha2}/indicator/${stat}?format=json`);
            let resultTwo = await axios.get(`http://api.worldbank.org/v2/country/${countryDataTwo.alpha2}/indicator/${stat}?format=json`);
                
            
    
            resultOne.data[1].forEach((n) => {
                myObj["countryOne"][`${n.date}`] = n.value;
            });    
    
            resultTwo.data[1].forEach((n) => {
                myObj["countryTwo"][`${n.date}`] = n.value;
            });
    
                                
            res.render("result.ejs", { data: myObj });    
            } catch (error) {
                console.error("Error fetching data from API:", error.message);
                res.status(500).render("result.ejs", { error: error.message });
            };
    };

        

        });





app.get("/aboutUs", (req, res) => {
    res.render("aboutUs.ejs");
});

app.listen(port, () => {
    console.log(`listening on port: ${port}`)
});

