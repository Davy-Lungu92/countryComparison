# countryComparison
Country Statistics Comparison
This project is a web application that allows users to compare various statistical indicators between two countries. The data is fetched from the World Bank API, and the results are presented in a tabular format.

Features:
- Compare statistics between two countries
- Fetch data from the World Bank API
- Display results in a user-friendly table
- Error handling for data fetching issues
- Simple and intuitive UI

Future Enhancements:
- Add graphical charts to visualize the data
- Support comparisons across multiple years

Installation:
Clone the repository:
using bash copy the following code - git clone https://github.com/your-username/your-repo-name.git

Navigate to the project directory: cd your-repo-name
Install dependencies: npm install

Usage:
- Start the server: node index.js
- Open your browser and navigate to http://localhost:3000.

Project Structure:
index.js -  Main server file handling routes and API calls
views/ -  EJS templates for rendering pages
public/- Static files (CSS)
countryCodes.js -  List of country codes
indicators.js - List of statistical indicators

Contributing:
- Fork the repository
- Create a new branch (git checkout -b feature-branch)

Make your changes:
- Commit your changes (git commit -m 'Add some feature')
- Push to the branch (git push origin feature-branch)
Open a pull request
