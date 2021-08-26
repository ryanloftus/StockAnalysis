// TODO: add technical analysis

const utils = require('./utils.js');
const render = require('./render.js');

const tickerInput = document.getElementById('input-ticker');
const tablinks = Array.from(document.getElementsByClassName('tablinks'));
const forexData = utils.getData('forex', 'USD');

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
    }
    return newTicker;
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

async function displayStockData(display) {
    const exchangeRates = await forexData;
    if (display === DISPLAY_CANDLE) {
        render.setCandle(await utils.getData('candle', ticker), document.getElementById('close').innerHTML, 
            exchangeRates.quote[document.getElementById('currency').value]);
    } else if (display === DISPLAY_NOMINAL) {
        displaySummary(document.getElementById('name').innerHTML, exchangeRates.quote[document.getElementById('currency').value]);
    } else if (tickerInput.value) {
        const newTicker = getTicker();
        if (newTicker === ticker) {
            return;
        }
        const lookup = await utils.getData('lookup', newTicker);
        let name;
        for (let i = 0; i < lookup.count; i++) {
            if (lookup.result[i].symbol === newTicker) {
                name = lookup.result[i].description;
            }
        }
        if (name) {
            setTicker(newTicker);
            displaySummary(name, exchangeRates.quote[document.getElementById('currency').value]);
            displayRecommendationTrends()
            displayNews();
            document.getElementById('display-ticker').innerHTML = ticker;
        } else {
            alert('Could not find a US stock with ticker: ' + newTicker);
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
        displayStockData(DISPLAY_ALL)
    }
};
document.getElementById('search').onclick = () => displayStockData(DISPLAY_ALL);
tablinks.forEach(element => element.onclick = event => changeTab(event.currentTarget));
document.getElementsByName('date-range').forEach(element => element.onchange = () => displayStockData(DISPLAY_CANDLE));

// open and close the settings window
document.getElementById('settings').onclick = function() {
    document.getElementById('settings-window').removeAttribute('hidden');
};
document.getElementById('close-settings').onclick = function () {
    document.getElementById('settings-window').setAttribute('hidden', 'hidden');
    displayStockData(DISPLAY_NOMINAL);
};