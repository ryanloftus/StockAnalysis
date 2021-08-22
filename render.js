const candleGraph = makeCandleGraph();
const recommendationGraph = makeRecommendationGraph();
const blankVal = '--';

function getReadableDates(dates) {
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
    document.getElementById('display-currency').innerHTML = document.getElementById('currency').value;
    candleGraph.data.labels = getReadableDates(candle.t);
    candleGraph.data.datasets[0].data = candle.c.map(val => getDollarVal(val, exchangeRate));
    candleGraph.data.datasets[1].data = candle.v.map(val => val / 1000);
    candleGraph.options.plugins.annotation.annotations['close'].yMin = getDollarVal(quote.pc, exchangeRate);
    candleGraph.options.plugins.annotation.annotations['close'].yMax = getDollarVal(quote.pc, exchangeRate);
    candleGraph.update();
}

module.exports.renderRecommendationTrends = function(recommendationTrends) {
    const history = Math.min(recommendationTrends.length, 2);
    recommendationGraph.data.labels = ['Strong Sell', 'Sell', 'Hold', 'Buy', 'Strong Buy'];
    for (let i = 0; i < history; i++) {
        const data = recommendationTrends[i];
        recommendationGraph.data.datasets[history - 1 - i].data = [data.strongSell, data.sell, data.hold, data.buy, data.strongBuy];
    }
    recommendationGraph.update();
}

module.exports.renderNews = function(news) {
    const newsItems = document.getElementById('news-items');
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
            scales: {
                p: {type: 'linear', position: 'left', title: {text: 'Price', display: true}},
                v: {type: 'linear', position: 'right', title: {text: 'Volume (thousands)', display: true}, grid: {display: false}}
            },
            interaction: {intersect: false, mode: 'index'},
            plugins: {
                annotation: {
                    annotations: {
                        close: {
                            type: 'line',
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

function makeRecommendationGraph() {
    return new Chart(document.getElementById('recommendation-graph'), {
        type: 'bar',
        data: {
            labels: [], 
            datasets: [{label: 'Last Month', data: [], backgroundColor: '#e99921'},
                       {label: 'This Month', data: [], backgroundColor: '#2779e6'}]
        },
        options: {
            responsive: true,
            interaction: {intersect: false, mode: 'index'},
            scales: {y: {beginAtZero: true, title: {text: '# of Analysts', display: true}}}
        }
    });
}