// TODO: add technical analysis
//   - Bollinger Bands
//   - momentum oscillator
// TODO: recreate data.datasets for technical analysis change so correct labels are used
// TODO: add ? hover to show a popup explaining the current selected technical analysis chart
// TODO: on change function for technical analysis dropdown (change date range availability)
// TODO: on click for technical analysis apply button
// TODO: toggle loader for technical analysis after clicking apply if needed
// TODO: global exchange rate var?

const utils = require('./utils.js');
const render = require('./render.js');

const tickerInput = document.getElementById('input-ticker');
const tablinks = Array.from(document.getElementsByClassName('tablinks'));
const forexData = utils.getData(utils.GET_FOREX, 'USD');

const DISPLAY_ALL = 0;
const DISPLAY_CANDLE = 1;
const DISPLAY_NOMINAL = 2;

let ticker;

function setTicker(newTicker) {
    ticker = newTicker;
}

function getTicker() {
    newTicker = tickerInput.value.toUpperCase();
    if (newTicker.endsWith('.US')) {
        newTicker = newTicker.slice(0, newTicker.length - 3);
    } else if (newTicker.includes('.')) {
        newTicker = null;
    }
    return newTicker;
}

async function displaySummary(name, exchangeRate) {
    render.renderSummary(name, await utils.getData(utils.GET_QUOTE, ticker), await utils.getData(utils.GET_CANDLE, ticker), exchangeRate);
}

async function displayTechnicalAnalysis(exchangeRate) {
    const option = document.getElementById('ta-option').value;
    if (option === 'relative-strength') {
        render.renderRelativeStrengthAnalysis(await utils.getData(utils.GET_RELATIVE_STRENGTH, ticker), 
            await utils.getData(utils.GET_RELATIVE_STRENGTH, 'SPY'));
    } else if (option === 'moving-avg') {
        render.renderMovingAvg(await utils.getData(utils.GET_MOVING_AVG, ticker), exchangeRate);
    }
}

async function displayRecommendationTrends() {
    render.renderRecommendationTrends(await utils.getData(utils.GET_RECOMMENDATION_TRENDS, ticker));
}

async function displayNews() {
    render.renderNews(await utils.getData(utils.GET_NEWS, ticker, {news: true}));
}

async function displayStockData(display) {
    const exchangeRates = await forexData;
    if (display === DISPLAY_CANDLE && ticker) {
        render.setCandle(await utils.getData(utils.GET_CANDLE, ticker), 
            document.getElementById('close').innerHTML, exchangeRates.quote[document.getElementById('currency').value]);
    } else if (display === DISPLAY_NOMINAL && ticker) {
        displaySummary(document.getElementById('name').innerHTML, exchangeRates.quote[document.getElementById('currency').value]);
    } else if (tickerInput.value) {
        render.toggleLoader();
        const newTicker = getTicker();
        if (newTicker && newTicker === ticker) {
            render.toggleLoader();
            return;
        }
        const lookup = await utils.getData(utils.GET_LOOKUP, newTicker);
        let name;
        for (let i = 0; i < lookup.count; i++) {
            if (lookup.result[i].symbol === newTicker) {
                name = lookup.result[i].description;
            }
        }
        if (name) {
            const exchangeRate = exchangeRates.quote[document.getElementById('currency').value];
            setTicker(newTicker);
            displaySummary(name, exchangeRate);
            displayTechnicalAnalysis(exchangeRate);
            displayRecommendationTrends();
            displayNews();
            document.getElementById('display-ticker').innerHTML = ticker;
        } else if (newTicker) {
            alert('Could not find a US stock with ticker: ' + newTicker);
        } else {
            alert('Request failed. Try entering a US stock or ETF ticker symbol.');
        }
        render.toggleLoader();
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
        displayStockData(DISPLAY_ALL)
    }
};
document.getElementById('search').onclick = () => displayStockData(DISPLAY_ALL);
tablinks.forEach(element => element.onclick = event => changeTab(event.currentTarget));
document.getElementsByName('date-range').forEach(element => element.onchange = () => displayStockData(DISPLAY_CANDLE));
document.getElementById('log-scale-toggle').onclick = event => render.toggleLogScale(event.currentTarget);

// open and close the settings window
document.getElementById('settings').onclick = function() {
    document.getElementById('settings-window').removeAttribute('hidden');
};
document.getElementById('close-settings').onclick = function () {
    document.getElementById('settings-window').setAttribute('hidden', 'hidden');
    displayStockData(DISPLAY_NOMINAL);
};