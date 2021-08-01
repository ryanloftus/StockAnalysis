const url = 'https://finnhub.io/api/v1/';
const quoteParam = 'quote?symbol=';
const candleParam = 'stock/candle?symbol=';
const apiKey = '&token=c41hlviad3ies3kt3gmg';

const ticker = document.getElementById('ticker');
const submit = document.getElementById('submit');

const blankVal = '--';

function getDateParams() {
    const now = Math.floor(new Date().getTime() / 1000);
    const oneYearAgo = now - 365 * 24 * 60 * 60;
    //TODO: can get max date range with 0 instead of oneYearAgo
    return '&resolution=D&from=' + oneYearAgo + '&to=' + now;
}

function getDollarVal(val) {
    return (val ? (Math.round(val * 100) / 100).toFixed(2) : blankVal);
}

function getCandleTableHTML(close, volume) {
    let tableHTML = '';
    for (let i = 0; i < close.length; i++) {
        tableHTML += '<tr><td>' + getDollarVal(close[i]) + '</td><td>' + volume[i] + '</td></tr>';
    }
    return tableHTML;
}

function renderQuote(quote) {
    const responseField = document.getElementById('quote');
    console.log(JSON.stringify(quote));
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
        const responseField = document.getElementById('candle');
        responseField.innerHTML = '<table><thead><tr><th>Close</th><th>Volume</th></tr></thead>' +
            getCandleTableHTML(candle.c, candle.v) +
            '</table>';
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

// TODO: remove unresolved promises when search is clicked
async function displayStockQuote() {
    getStockQuote();
    getStockCandle();
}

submit.onclick = displayStockQuote;