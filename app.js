const Chart = require('./node_modules/chart.js');

const url = 'https://finnhub.io/api/v1/';
const quoteParam = 'quote?symbol=';
const candleParam = 'stock/candle?symbol=';
const apiKey = '&token=c41hlviad3ies3kt3gmg';

const ticker = document.getElementById('ticker');
const submit = document.getElementById('submit');
let candleGraph = makeGraph();

const blankVal = '--';

function makeGraph() {
    return new Chart(document.getElementById('candle'), {
        type: 'line', 
        data: {
            labels: [], 
            datasets: [{
                label: 'Value',
                data: [], 
                fill: false,
                borderColor: 'rgb(75, 192, 192)'
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

//TODO: remove day of week from date
function getReadableDates(dates) {
    let readableDates = [];
    dates.forEach(date => readableDates.push(new Date(date * 1000).toDateString()));
    return readableDates;
}

function getDollarVal(val) {
    return (val ? (Math.round(val * 100) / 100).toFixed(2) : blankVal);
}

function renderQuote(quote) {
    const responseField = document.getElementById('quote');
    responseField.innerHTML = '<p>' +
        'Current Price: \$' + getDollarVal(quote.c) +
        '<br><br>Change: \$' + getDollarVal(quote.d) +
        '<br><br>Percent Change: ' + (quote.dp || blankVal) + '%' +
        '<br><br>High: \$' + getDollarVal(quote.h) +
        '<br><br>Low: \$' + getDollarVal(quote.l) +
        '<br><br>Open: \$' + getDollarVal(quote.o) +
        '<br><br>Close: \$' + getDollarVal(quote.pc) +
        '</p>';
}

async function getStockQuote() {
    const endpoint = url + quoteParam + ticker.value + apiKey;
    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            cache: 'no-cache'
        });
        if (response.ok) {
            const jsonResponse = await response.json();
            renderQuote(jsonResponse);
        } else {
            throw new Error('Request failed');
        }
    }
    catch (error) {
        console.log(error);
    }
}

function renderCandle(candle) {
    if (candle.s === 'ok') {
        candleGraph.data.labels = getReadableDates(candle.t);
        candleGraph.data.datasets[0].data = candle.c;
        candleGraph.update();
    }
}

async function getStockCandle() {
    const endpoint = url + candleParam + ticker.value + getDateParams() + apiKey;
    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            cache: 'no-cache'
        });
        if (response.ok) {
            const jsonResponse = await response.json();
            renderCandle(jsonResponse);
        } else {
            throw new Error('Request failed');
        }
    }
    catch (error) {
        console.log(error);
    }
}

// TODO: remove unresolved promises when search is clicked?
// TODO: restructure code so I have consts pointing to each element and I set the value for that element with a setter
async function displayStockQuote() {
    getStockQuote();
    getStockCandle();
}

submit.onclick = displayStockQuote;