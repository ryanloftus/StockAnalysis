const utils = require('./utils.js');
const render = require('./render.js');

const tickerInput = document.getElementById('input-ticker');
const tablinks = Array.from(document.getElementsByClassName('tablinks'));

const DISPLAY_ALL = 0;
const DISPLAY_CANDLE = 1;
const DISPLAY_NOMINAL = 2;
const DISPLAY_TECHNICAL = 3;
const SAMPLE_INPUT = 'Sample Input: "TSLA"';

let ticker;

function setTicker(newTicker) {
    ticker = newTicker;
}

function getTicker() {
    let newTicker = tickerInput.value.toUpperCase();
    if (newTicker.endsWith('.US')) {
        newTicker = newTicker.slice(0, newTicker.length - 3);
    } else if (newTicker.includes('.')) {
        newTicker = null;
    }
    return newTicker;
}

async function displaySummary(name) {
    render.renderSummary(name, await utils.getData(utils.GET_QUOTE, ticker), await utils.getData(utils.GET_CANDLE, ticker));
}

async function displayTechnicalAnalysis() {
    const option = document.getElementById('ta-option').value;
    if (!ticker) {
        render.changeTAGraphOption(option);
        return;
    }
    const data = {'candle': [], 'benchmarkCandle': []};
    switch(option) {
        case 'relative-strength':
            data.candle = await utils.getData(utils.GET_RELATIVE_STRENGTH, ticker);
            data.benchmarkCandle = await utils.getData(utils.GET_RELATIVE_STRENGTH, 'SPY');
            break;
        case 'moving-avg':
            data.candle = await utils.getData(utils.GET_MOVING_AVG, ticker);
            break;
        case 'bollinger-bands':
            data.candle = await utils.getData(utils.GET_BOLLINGER_BANDS, ticker);
            break;
        case 'momentum-oscillator':
            data.candle = await utils.getData(utils.GET_MOMENTUM_OSCILLATOR, ticker);
            break;
        default:
            return;
    }
    render.renderTechnicalAnalysis(option, data);
}

async function displayRecommendationTrends() {
    render.renderRecommendationTrends(await utils.getData(utils.GET_RECOMMENDATION_TRENDS, ticker));
}

async function displayNews() {
    render.renderNews(await utils.getData(utils.GET_NEWS, ticker, {news: true}));
}

async function displayStockData(display) {
    if (display === DISPLAY_CANDLE && ticker) {
        render.setCandle(await utils.getData(utils.GET_CANDLE, ticker), 
            document.getElementById('close').innerHTML);
    } else if (display === DISPLAY_TECHNICAL) {
        displayTechnicalAnalysis();
    } else if (display === DISPLAY_NOMINAL && ticker) {
        displaySummary(document.getElementById('name').innerHTML);
        displayTechnicalAnalysis();
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
            setTicker(newTicker);
            displaySummary(name);
            displayTechnicalAnalysis();
            displayRecommendationTrends();
            displayNews();
            document.getElementById('display-ticker').innerHTML = ticker;
        } else if (newTicker) {
            alert(`Could not find a US stock with ticker: ${newTicker}\n${SAMPLE_INPUT}`);
        } else {
            alert('Request failed. Try entering a US stock or ETF ticker symbol.\n' + SAMPLE_INPUT);
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
document.getElementById('ta-log-scale-toggle').onclick = event => render.toggleLogScale(event.currentTarget);
document.getElementById('ta-option').onchange = () => displayStockData(DISPLAY_TECHNICAL);
document.getElementsByName('ta-date-range').forEach(element => element.onchange = () => displayStockData(DISPLAY_TECHNICAL));
