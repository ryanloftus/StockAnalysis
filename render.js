const Chart = require('./node_modules/chart.js');
const annotationPlugin = require('./node_modules/chartjs-plugin-annotation');
Chart.register(annotationPlugin);

const candleGraph = makeCandleGraph();
const technicalAnalysisGraph = makeTechnicalAnalysisGraph();
const recommendationGraph = makeRecommendationGraph();
const blankVal = '--';

module.exports.toggleLoader = function() {
    const loader = document.getElementById('loader');
    const pageContent = document.getElementById('page-content');
    if (loader.hasAttribute('hidden')) {
        loader.removeAttribute('hidden');
        pageContent.setAttribute('hidden', 'hidden');
    } else {
        loader.setAttribute('hidden', 'hidden');
        pageContent.removeAttribute('hidden');
    }
}

module.exports.toggleLogScale = function(element) {
    if (document.getElementById('log-scale-toggle').className !== 'active') {
        candleGraph.options.scales.p.type = 'logarithmic';
        candleGraph.options.plugins.annotation.annotations['close'].display = false;
        element.className = 'active';
    } else {
        candleGraph.options.scales.p.type = 'linear';
        candleGraph.options.plugins.annotation.annotations['close'].display = true;
        element.className = '';
    }
    candleGraph.update();
}

function getMovingAvg(array, window) {
    if (window <= 1) {
        return array;
    }
    let movingAvg = [];
    for (let i = 0; i < window; i++) {
        movingAvg.push(null);
    }
    for (let i = window; i <= array.length; i++) {
        movingAvg.push(array.slice(i - window, i).reduce((num1, num2) => num1 + num2) / window);
    }
    return movingAvg
}

function getReadableDates(dates) {
    // include time in date if dates are less than 12 hours apart
    if (dates[1] - dates[0] < 60 * 60 * 12) {
        const options = {weekday: 'short', year: '2-digit', month: 'short', day: 'numeric'};
        return dates.map(date => {
            const jsDate = new Date(date * 1000)
            const dateString = jsDate.toLocaleDateString(undefined, options)
            return dateString.slice(0, dateString.length - 2) + jsDate.toLocaleTimeString();
        });
    }
    return dates.map(date => new Date(date * 1000).toDateString().slice(4));
}

function getDollarVal(usdVal, exchangeRate) {
    return (usdVal ? (Math.round(usdVal * 100 * exchangeRate) / 100).toFixed(2) : blankVal);
}

function getPercentVal(val) {
    return val ? `(${val}%)` : blankVal;
}

function setQuoteVal(element, val, exchangeRate, isChange) {
    element.innerHTML = exchangeRate ? getDollarVal(val, exchangeRate) : getPercentVal(val);
    if (isChange) {
        if (val > 0) {
            element.setAttribute('class', 'up');
        } else if (val < 0) {
            element.setAttribute('class', 'down');
        }
    }
}

module.exports.setCandle = function(candle, close, exchangeRate) {
    candleGraph.data.labels = getReadableDates(candle.t);
    candleGraph.data.datasets[0].data = candle.c.map(val => getDollarVal(val, exchangeRate));
    candleGraph.data.datasets[1].data = candle.v.map(val => val / 1000);
    candleGraph.options.plugins.annotation.annotations['close'].yMin = getDollarVal(close, exchangeRate);
    candleGraph.options.plugins.annotation.annotations['close'].yMax = getDollarVal(close, exchangeRate);
    candleGraph.update();
}

module.exports.renderSummary = function(name, quote, candle, exchangeRate) {
    if (candle.s !== 'ok') {
        return;
    }
    document.getElementById('name').innerHTML = name;
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
    this.setCandle(candle, quote.pc, exchangeRate);
    document.getElementById('display-currency').innerHTML = document.getElementById('currency').value;
}

module.exports.renderRelativeStrengthAnalysis = function(candle, spyCandle) {
    if (candle.s !== 'ok' || spyCandle.s !== 'ok') {
        return;
    }
    technicalAnalysisGraph.data.labels = getReadableDates(candle.t);
    technicalAnalysisGraph.data.datasets[0].data = candle.c.map((val, index) => val / spyCandle.c[index]);
    technicalAnalysisGraph.update();
}

module.exports.renderMovingAvg = function(candle, exchangeRate) {
    if (candle.s !== 'ok') {
        return;
    }
    technicalAnalysisGraph.data.labels = getReadableDates(candle.t);
    technicalAnalysisGraph.data.datasets = [];
    technicalAnalysisGraph.data.datasets.push({
        type: 'line', 
        label: '20 Day SMA', 
        data: getMovingAvg(candle.c, 20).map(val => getDollarVal(val, exchangeRate)), 
        borderColor: '#2779e6', 
        radius: 0
    });
    technicalAnalysisGraph.data.datasets.push({
        type: 'line', 
        label: '60 Day SMA', 
        data: getMovingAvg(candle.c, 60).map(val => getDollarVal(val, exchangeRate)), 
        borderColor: '#e99921', 
        radius: 0
    });
    technicalAnalysisGraph.update();
}

module.exports.renderRecommendationTrends = function(recommendationTrends) {
    for (let i = 0; i < recommendationGraph.data.datasets.length; i++) {
        recommendationGraph.data.datasets[i].data = [0, 0, 0, 0, 0];
    }
    const history = Math.min(recommendationTrends.length, 2);
    for (let i = 0; i < history; i++) {
        const data = recommendationTrends[i];
        recommendationGraph.data.datasets[history - 1 - i].data = [data.strongSell, data.sell, data.hold, data.buy, data.strongBuy];
    }
    recommendationGraph.update();
}

module.exports.renderNews = function(news) {
    const newsItems = document.getElementById('news');
    newsItems.innerHTML = '';
    const numOfNewsItems = Math.min(news.length, 10);
    for (let i = 0; i < numOfNewsItems; i++) {
        newsItems.innerHTML += 
            `<a class="news-item" href="${news[i].url}" target="_blank">
                <u>${news[i].headline}</u><br>
                <span class="very-small">${new Date(news[i].datetime * 1000).toDateString()}</span><br>
                <span class="small">${news[i].summary}</span>
            </a><br>`;
    }
}

function makeCandleGraph() {
    return new Chart(document.getElementById('candle-graph'), {
        data: {
            labels: [], 
            datasets: [{type: 'line', label: 'Price', yAxisID: 'p', data: [], borderColor: '#2779e6', radius: 0}, 
                       {type: 'bar', label: 'Volume (thousands)', yAxisID: 'v', data: []}]
        },
        options: {
            responsive: true,
            aspectRatio: 2.5,
            scales: {
                p: {type: 'linear', position: 'left', title: {text: 'Price', display: true}},
                v: {type: 'linear', position: 'right', title: {text: 'Volume (thousands)', display: true}, grid: {display: false}},
                x: {
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 40
                    }
                }
            },
            interaction: {intersect: false, mode: 'index'},
            plugins: {
                annotation: {
                    annotations: {
                        close: {
                            type: 'line',
                            display: true,
                            yScaleID: 'p',
                            yMin: 0,
                            yMax: 0,
                            borderColor: '#ff6384',
                            borderWidth: 2,
                            borderDash: [6, 6],
                            label: {enabled: true, content: 'Prev. Close', position: 'start'}
                        }
                    }
                }
            }
        }
    });
}

function makeTechnicalAnalysisGraph() {
    return new Chart(document.getElementById('ta-graph'), {
        data: {
            labels: [], 
            datasets: [{type: 'line', data: [], borderColor: '#2779e6', radius: 0}]
        },
        options: {
            responsive: true,
            aspectRatio: 2.5,
            scales: {x: {ticks: {autoSkip: true, maxTicksLimit: 40}}},
            interaction: {intersect: false, mode: 'index'}
        }
    });
}

function makeRecommendationGraph() {
    return new Chart(document.getElementById('recommendation-graph'), {
        type: 'bar',
        data: {
            labels: ['Strong Sell', 'Sell', 'Hold', 'Buy', 'Strong Buy'], 
            datasets: [{label: 'Last Month', data: [0, 0, 0, 0, 0], backgroundColor: '#e99921'},
                       {label: 'This Month', data: [0, 0, 0, 0, 0], backgroundColor: '#2779e6'}]
        },
        options: {
            responsive: true,
            aspectRatio: 2.5,
            interaction: {intersect: false, mode: 'index'},
            scales: {y: {beginAtZero: true, title: {text: '# of Analysts', display: true}}}
        }
    });
}