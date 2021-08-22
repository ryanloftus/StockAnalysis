// TODO: add technical analysis + news tab content
// TODO: add messages for when there is no data to display (ie. (!) no recommendation trends available)
// TODO: add checklist to summary table to display the value on the graph as a horizontal line?
// TODO: changing candle date range should only call the candle endpoint

const Chart = require('./node_modules/chart.js');
const annotationPlugin = require('./node_modules/chartjs-plugin-annotation');
Chart.register(annotationPlugin);
const utils = require('./utils.js');
const render = require('./render.js');

const tickerInput = document.getElementById('input-ticker');
const tablinks = Array.from(document.getElementsByClassName('tablinks'));
const forexData = utils.getData('forex', 'USD');

function getTicker() {
    let ticker = tickerInput.value.toUpperCase();
    if (ticker.endsWith('.US')) {
        return ticker.slice(0, ticker.length - 3);
    }
    return ticker;
}

async function displayStockData() {
    if (tickerInput.value) {
        const ticker = getTicker();
        const lookup = await utils.getData('lookup', ticker);
        let name;
        for (let i = 0; i < lookup.count; i++) {
            if (lookup.result[i].symbol === ticker) {
                name = lookup.result[i].description;
            }
        }
        if (name) {
            const exchangeRates = await forexData;
            render.renderSummary(name, await utils.getData('quote', ticker), 
                await utils.getData('candle', ticker), exchangeRates.quote[document.getElementById('currency').value]);
            render.renderRecommendationTrends(await utils.getData('recommendations', ticker));
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