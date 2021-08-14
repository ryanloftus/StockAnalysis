// TODO: add technical analysis + recommendation trends tab content
// TODO: make the candle graph smaller, maybe put it beside quote info.
// TODO: add company name + market below ticker
// TODO: move urls to utils.js and have constants in utils for each data pull
// TODO: include average volume info

const Chart = require('./node_modules/chart.js');
const utils = require('./utils.js');

const url = 'https://finnhub.io/api/v1/';
const quoteParam = 'quote?symbol=';
const candleParam = 'stock/candle?symbol=';
const apiKey = '&token=c41hlviad3ies3kt3gmg';

const ticker = document.getElementById('input-ticker');
const candleGraph = makeCandleGraph();
const tablinks = Array.from(document.getElementsByClassName('tablinks'));

async function getExchangeRates() {
    const exchangeRates = await utils.getData(url + 'forex/rates?base=USD' + apiKey);
    return exchangeRates.quote;
}

function makeCandleGraph() {
    return new Chart(document.getElementById('candle-graph'), {
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

function setQuoteVal(element, val, exchangeRate, isChange) {
    element.innerHTML = exchangeRate ? utils.getDollarVal(val, exchangeRate) : utils.getPercentVal(val);
    if (isChange) {
        if (val > 0) {
            element.setAttribute('class', 'up');
        } else if (val < 0) {
            element.setAttribute('class', 'down');
        }
    }
}

function renderQuote(quote, exchangeRate) {
    const arrow = document.getElementById('change-arrow');
    if (quote.d > 0) {
        arrow.className = 'material-icons up';
        arrow.innerHTML = 'trending_up';
    } else if (quote.d < 0) {
        arrow.className = 'material-icons down';
        arrow.innerHTML = 'trending_down';
    } else {
        arrow.className = '';
        arrow.innerHTML = '';
    }
    setQuoteVal(document.getElementById('current'), quote.c, exchangeRate, false);
    setQuoteVal(document.getElementById('change'), quote.d, exchangeRate, true);
    setQuoteVal(document.getElementById('percent-change'), quote.dp, false, true);
    setQuoteVal(document.getElementById('high'), quote.h, exchangeRate, false);
    setQuoteVal(document.getElementById('low'), quote.l, exchangeRate, false);
    setQuoteVal(document.getElementById('open'), quote.o, exchangeRate, false);
    setQuoteVal(document.getElementById('close'), quote.pc, exchangeRate, false);
    document.getElementById('display-currency').innerHTML = document.getElementById('currency').value;
}

function renderCandle(candle, exchangeRate) {
    if (candle.s === 'ok') {
        candleGraph.data.labels = utils.getReadableDates(candle.t);
        candleGraph.data.datasets[0].data = candle.c.map(val => utils.getDollarVal(val, exchangeRate));
        candleGraph.update();
    }
}

async function displayStockData() {
    if (ticker.value) {
        const capitalizedTicker = ticker.value.toUpperCase();
        const exchangeRates = await getExchangeRates();
        const quote = await utils.getData(url + quoteParam + capitalizedTicker + apiKey);
        const candle = await utils.getData(url + candleParam + capitalizedTicker + 
            utils.getDateParams(document.querySelector('input[name="date-range"]:checked').value) + apiKey);
        const exchangeRate = exchangeRates[document.getElementById('currency').value];
        renderQuote(quote, exchangeRate);
        renderCandle(candle, exchangeRate);
        document.getElementById('display-ticker').innerHTML = capitalizedTicker;
    }
}

function changeTab(newTab) {
    tablinks.forEach(element => {
        if (!document.getElementById(element.value).hasAttribute('hidden')) {
            element.className = element.className.replace(' active', '');
            document.getElementById(element.value).setAttribute('hidden', 'hidden');
        }
    });
    newTab.className += ' active';
    document.getElementById(newTab.value).removeAttribute('hidden');
}

ticker.onkeydown = event => {
    if (event.code === 'Enter') {
        displayStockData()
    }
};
document.getElementById('search').onclick = displayStockData;
tablinks.forEach(element => element.onclick = event => changeTab(event.currentTarget));
document.getElementsByName('date-range').forEach(element => element.onchange = displayStockData);
document.getElementById('settings').onclick = function() {
    document.getElementById('settings-window').removeAttribute('hidden');
};
document.getElementById('close-settings').onclick = function () {
    document.getElementById('settings-window').setAttribute('hidden', 'hidden');
};