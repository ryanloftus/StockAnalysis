// TODO: add loading screen for request processing?
// TODO: add technical analysis section
// TODO: make tabs within the webpage for the user to switch between (ie. graph, technical analysis, news and ratings, etc)
// TODO: make the candle graph smaller, maybe put it beside quote info.
// TODO: display ticker in large letters followed by change and %change and the full name of the stock (ie F 0.34 2.34% Ford Motors)
// TODO: add a link to a separate webpage "other securities" to find info on non-stock securities

const Chart = require('./node_modules/chart.js');

const url = 'https://finnhub.io/api/v1/';
const quoteParam = 'quote?symbol=';
const candleParam = 'stock/candle?symbol=';
const apiKey = '&token=c41hlviad3ies3kt3gmg';

const ticker = document.getElementById('ticker');
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
    const now = new Date();
    let fromDate = new Date();
    const dateRange = document.querySelector('input[name="date-range"]:checked').value;
    const timeUnit = dateRange.slice(-1);
    const timeAmount = dateRange.substring(0, dateRange.length - 1);
    if (timeUnit === 'y') {
        fromDate.setFullYear(now.getFullYear() - timeAmount);
    } else if (timeUnit === 'm') {
        fromDate.setMonth(now.getMonth() - timeAmount);
    } else if (timeUnit === 'd') {
        fromDate.setDate(now.getDate() - timeAmount);
    } else {
        fromDate = new Date(0);
    }
    return '&resolution=D' + '&from=' + Math.floor(fromDate.getTime() / 1000) + '&to=' + Math.floor(now.getTime() / 1000);
}

function getReadableDates(dates) {
    return dates.map(date => new Date(date * 1000).toDateString().slice(4));
}

function getDollarVal(val) {
    return (val ? (Math.round(val * 100) / 100).toFixed(2) : blankVal);
}

function getPercentVal(val) {
    return val ? val.toString() + '%' : blankVal;
}

function setQuoteVal(element, val, isInDollars, isChange) {
    element.innerHTML = isInDollars ? getDollarVal(val) : getPercentVal(val);
    if (isChange) {
        if (val > 0) {
            element.setAttribute('class', 'up');
        } else if (val < 0) {
            element.setAttribute('class', 'down');
        }
    }
}

function renderQuote(quote) {
    setQuoteVal(document.getElementById('current'), quote.c, true, false);
    setQuoteVal(document.getElementById('change'), quote.d, true, true);
    setQuoteVal(document.getElementById('percent-change'), quote.dp, false, true);
    setQuoteVal(document.getElementById('high'), quote.h, true, false);
    setQuoteVal(document.getElementById('low'), quote.l, true, false);
    setQuoteVal(document.getElementById('open'), quote.o, true, false);
    setQuoteVal(document.getElementById('close'), quote.pc, true, false);
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
        const response = await fetch(endpoint, {method: 'GET'});
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

async function displayStockData() {
    if (ticker.value) {
        renderQuote(await getData(url + quoteParam + ticker.value.toUpperCase() + apiKey));
        renderCandle(await getData(url + candleParam + ticker.value.toUpperCase() + getDateParams() + apiKey));
    }
}

async function showContent(tab) {
    if (tab === 'summary') {
        
    } else if (tab === 'technical') {

    } else {

    }
}

ticker.onkeydown = event => {
    if (event.code === 'Enter') {
        displayStockData()
    }
};
document.getElementsByName('date-range').forEach(element => element.onchange = displayStockData);