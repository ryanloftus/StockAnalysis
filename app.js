// TODO: add technical analysis + news tab content
// TODO: make candle graph smaller
// TODO: add profile info to summary
// TODO: add messages for when there is no data to display (ie. (!) no recommendation trends available)
// TODO: add checklist to summary table to display the value on the graph as a horizontal line?

const Chart = require('./node_modules/chart.js');
const annotationPlugin = require('./node_modules/chartjs-plugin-annotation');
Chart.register(annotationPlugin);
const utils = require('./utils.js');
const render = require('./render.js');

const ticker = document.getElementById('input-ticker');
const tablinks = Array.from(document.getElementsByClassName('tablinks'));
const forexData = utils.getData('forex', 'USD');

async function displayStockData() {
    if (ticker.value) {
        const capitalizedTicker = ticker.value.toUpperCase();
        const profile = await utils.getData('profile', capitalizedTicker);
        if (profile.name) {
            const exchangeRates = await forexData;
            render.renderSummary(profile, await utils.getData('quote', capitalizedTicker), 
                await utils.getData('candle', capitalizedTicker), exchangeRates.quote[document.getElementById('currency').value]);
            render.renderRecommendationTrends(await utils.getData('recommendations', capitalizedTicker));
            document.getElementById('display-ticker').innerHTML = capitalizedTicker;
        } else {
            alert('Could not find a US stock with ticker: ' + capitalizedTicker);
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