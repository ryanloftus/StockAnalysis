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

async function displayStockData() {
    renderQuote(await getData(url + quoteParam + ticker.value + apiKey));
    renderCandle(await getData(url + candleParam + ticker.value + getDateParams() + apiKey));
}

ticker.onkeydown = event => {
    if (event.code === 'Enter') {
        displayStockData()
    }
};
document.getElementById('submit').onclick = displayStockData;