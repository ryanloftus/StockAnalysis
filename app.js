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
    return '&resolution=D&from=' + oneYearAgo + '&to=' + now;
}

function getVal(val) {
    return (val ? val : blankVal);
}

function renderQuote(quote) {
    const responseField = document.getElementById('quote');
    console.log(JSON.stringify(quote));
    responseField.innerHTML = '<p>' +
        'Current Price: \$' + getVal(quote.c) +
        '<br><br>Change: \$' + getVal(quote.d) +
        '<br><br>Percent Change: ' + getVal(quote.dp) + '%' +
        '<br><br>High: \$' + getVal(quote.h) +
        '<br><br>Low (today): \$' + getVal(quote.l) +
        '<br><br>Open: \$' + getVal(quote.o) +
        '<br><br>Close: \$' + getVal(quote.pc) +
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
        console.log(candle.c.length);
        responseField.innerHTML = '<p>' + candle.c + '</p>';
        // responseField.innerHTML = '<table>' + '</table>';
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