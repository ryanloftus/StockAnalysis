// TODO: add loading screen for request processing?
// TODO: add technical analysis + news and ratings tab content
// TODO: make the candle graph smaller, maybe put it beside quote info.
// TODO: display ticker in large letters followed by change and %change and the full name of the stock (ie F 0.34 2.34% Ford Motors)
// TODO: add a link to a separate webpage "other securities" to find info on non-stock securities
// TODO: separate code into modules

const Chart = require('./node_modules/chart.js');
const utils = require('./utils.js');

const url = 'https://finnhub.io/api/v1/';
const quoteParam = 'quote?symbol=';
const candleParam = 'stock/candle?symbol=';
const apiKey = '&token=c41hlviad3ies3kt3gmg';

const ticker = document.getElementById('input-ticker');
const candleGraph = makeCandleGraph();
const tablinks = Array.from(document.getElementsByClassName('tablinks'));

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

function setQuoteVal(element, val, isInDollars, isChange) {
    element.innerHTML = isInDollars ? utils.getDollarVal(val) : utils.getPercentVal(val);
    if (isChange) {
        if (val > 0) {
            element.setAttribute('class', 'up');
        } else if (val < 0) {
            element.setAttribute('class', 'down');
        }
    }
}

function renderQuote(quote) {
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
        candleGraph.data.labels = utils.getReadableDates(candle.t);
        candleGraph.data.datasets[0].data = candle.c;
        candleGraph.update();
    }
}

async function displayStockData() {
    if (ticker.value) {
        const capitalizedTicker = ticker.value.toUpperCase();
        renderQuote(await utils.getData(url + quoteParam + capitalizedTicker + apiKey));
        renderCandle(await utils.getData(url + candleParam + capitalizedTicker + 
            utils.getDateParams(document.querySelector('input[name="date-range"]:checked').value) + apiKey));
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