const endpointBuilder = {
    url: 'https://finnhub.io/api/v1/',
    apiKey: '&token=c41hlviad3ies3kt3gmg',
    param: {
        lookup: 'search?q=',
        quote: 'quote?symbol=',
        candle: 'stock/candle?symbol=',
        recommendations: 'stock/recommendation?symbol=',
        forex: 'forex/rates?base=',
        news: 'company-news?symbol='
    },
    getEndpoint: function(paramKey, ticker) {
        return this.url + this.param[paramKey] + ticker + getDateParams(paramKey) + this.apiKey;
    }
};

getDateParams = function(paramKey) {
    const now = new Date();
    let fromDate = new Date();
    if (paramKey === 'candle') {
        let dateRange; 
        if (!document.getElementById('summary').hasAttribute('hidden')) {
            dateRange = document.querySelector('input[name="date-range"]:checked').value;
        } else if (!document.getElementById('technical-analysis').hasAttribute('hidden')) {
            dateRange = document.querySelector('input[name="ta-date-range"]:checked').value;
        } else {
            return '';
        }
        const timeUnit = dateRange.slice(-1);
        const timeAmount = dateRange.substring(0, dateRange.length - 1);
        let resolution = 'D';
        if (timeUnit === 'y') {
            fromDate.setFullYear(now.getFullYear() - timeAmount);
            if (timeAmount > 1) {
                resolution = 'W';
            }
        } else if (timeUnit === 'm') {
            fromDate.setMonth(now.getMonth() - timeAmount);
        } else if (timeUnit === 'd') {
            fromDate.setDate(now.getDate() - timeAmount);
            resolution = 30;
        } else {
            fromDate = new Date(0);
            resolution = 'W';
        }
        return '&resolution=' + resolution + '&from=' + Math.floor(fromDate.getTime() / 1000) + '&to=' + Math.floor(now.getTime() / 1000);
    } else if (paramKey === 'news') {
        fromDate.setDate(now.getDate() - 7);
        return '&from=' + fromDate.toISOString().slice(0, 10) + '&to=' + now.toISOString().slice(0, 10);
    } else {
        return '';
    }
}

module.exports.getData = async function(paramKey, ticker) {
    const endpoint = endpointBuilder.getEndpoint(paramKey, ticker);
    try {
        const response = await fetch(endpoint, {method: 'GET'});
        if (response.ok) {
            const jsonResponse = await response.json();
            return jsonResponse;
        } else {
            throw new Error('Request failed');
        }
    }
    catch (error) {
        console.log(error);
    }
}