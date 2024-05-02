# stock-analysis

UPDATE: Due to changes to the Finnhub API free tier, this project no longer works with a free API key.

## About
This webpage provides a tool for searching US exchange traded stocks and funds
(ETFs) and displays a summary, technical analysis, recommendation trends, and 
news for the searched stock/ETF.

## Visit the webpage
~~To visit the webpage, go to https://ryanloftus.github.io/StockAnalysis/ or
follow the Download Instructions.~~

UPDATE: This project is no longer hosted.

## Download Instructions
To get started using the Stock Analysis webpage:
- Clone this repo
- Get an API key from [Finnhub.io](https://finnhub.io/)
- Set the apiKey variable in utils.js

Once you've followed these steps, open index.html to start using the webpage.

## Technologies Used
I created this webpage using HTML, CSS, and JavaScript. The JavaScript is 
written across multiple Node.js modules which have been bundled into 
bundle.js using Browserify. The charts displayed on the webpage were 
created using Chart.js. I imported all external node modules and Browserify
using npm. The data used in the webpage is pulled from [Finnhub.io](https://finnhub.io/).
