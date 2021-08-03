const Chart = require('./node_modules/chart.js');

const url = 'https://finnhub.io/api/v1/';
const quoteParam = 'quote?symbol=';
const candleParam = 'stock/candle?symbol=';
const apiKey = '&token=c41hlviad3ies3kt3gmg';

const ticker = document.getElementById('ticker');
const submit = document.getElementById('submit');
let candleGraph = makeCandleGraph();

const blankVal = '--';

function makeCandleGraph() {
    return new Chart(document.getElementById('candle'), {
        type: 'line', 
        data: {
            labels: [], 
            datasets: [{
                label: 'Price',
                data: [],
                borderColor: 'rgb(10, 200, 0)'
            }]
        }
    });
}

function getDateParams() {
    const now = Math.floor(new Date().getTime() / 1000);
    const oneYearAgo = now - 365 * 24 * 60 * 60;
    //TODO: make date range configurable
    return '&resolution=D&from=' + oneYearAgo + '&to=' + now;
}

function getReadableDates(dates) {
    return dates.map(date => new Date(date * 1000).toDateString().slice(4));
}

function getDollarVal(val) {
    return (val ? (Math.round(val * 100) / 100).toFixed(2) : blankVal);
}

function renderQuote(quote) {
    document.getElementById('current').innerHTML = '\$' + getDollarVal(quote.c);
    document.getElementById('change').innerHTML = '\$' + getDollarVal(quote.d);
    document.getElementById('percent-change').innerHTML = (quote.dp || blankVal) + '%';
    document.getElementById('high').innerHTML = '\$' + getDollarVal(quote.h);
    document.getElementById('low').innerHTML = '\$' + getDollarVal(quote.l);
    document.getElementById('open').innerHTML = '\$' + getDollarVal(quote.o);
    document.getElementById('close').innerHTML = '\$' + getDollarVal(quote.pc);
}

function renderCandle(candle) {
    if (candle.s === 'ok') {
        candleGraph.data.labels = getReadableDates(candle.t);
        candleGraph.data.datasets[0].data = candle.c;
        candleGraph.update();
    }
}

async function getData(endpoint) {
    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            cache: 'no-cache'
        });
        if (response.ok) {
            const jsonResponse = await response.json();
            return jsonResponse;
        } else {
            throw new Error('Request failed');
        }
    }
    catch (error) {
        console.log(error);
    }
}

// TODO: remove unresolved promises when search is clicked?
async function displayStockData() {
    renderQuote(await getData(url + quoteParam + ticker.value + apiKey));
    renderCandle(await getData(url + candleParam + ticker.value + getDateParams() + apiKey));
}

ticker.onkeydown = event => {
    if (event.code === 'Enter') {
        displayStockData()
    }
};
submit.onclick = displayStockData;