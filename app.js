// TODO: add technical analysis (maybe call a local python api for the data analysis?)
// TODO: add messages for when there is no data to display (ie. (!) no recommendation trends available)
// TODO: changing candle date range should only call the candle endpoint OR
//       always call candle with max date range and adjust what is displayed according to what range is selected
// TODO: adjust graph sizes to fit screen

const Chart = require('./node_modules/chart.js');
const annotationPlugin = require('./node_modules/chartjs-plugin-annotation');
Chart.register(annotationPlugin);
const utils = require('./utils.js');
const render = require('./render.js');

const tickerInput = document.getElementById('input-ticker');
const tablinks = Array.from(document.getElementsByClassName('tablinks'));
const forexData = utils.getData('forex', 'USD');

let ticker;

function setTicker() {
    ticker = tickerInput.value.toUpperCase();
    if (ticker.endsWith('.US')) {
        ticker = ticker.slice(0, ticker.length - 3);
    }
}

async function displaySummary(name, exchangeRate) {
    render.renderSummary(name, await utils.getData('quote', ticker), await utils.getData('candle', ticker), exchangeRate);
}

async function displayRecommendationTrends() {
    render.renderRecommendationTrends(await utils.getData('recommendations', ticker));
}

async function displayNews() {
    render.renderNews(await utils.getData('news', ticker));
}

async function displayStockData() {
    if (tickerInput.value && tickerInput.value !== ticker) {
        setTicker();
        const lookup = await utils.getData('lookup', ticker);
        let name;
        for (let i = 0; i < lookup.count; i++) {
            if (lookup.result[i].symbol === ticker) {
                name = lookup.result[i].description;
            }
        }
        if (name) {
            const exchangeRates = await forexData;
            displaySummary(name, exchangeRates.quote[document.getElementById('currency').value]);
            displayRecommendationTrends()
            displayNews();
            document.getElementById('display-ticker').innerHTML = ticker;
        } else {
            alert('Could not find a US stock with ticker: ' + ticker);
        }
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

tickerInput.onkeydown = event => {
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