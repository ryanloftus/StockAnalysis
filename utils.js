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
        return this.url + this.param[paramKey] + ticker + 
            (paramKey === 'candle' ? getDateParams() : '') + this.apiKey;
    }
};

getDateParams = function() {
    const dateRange = document.querySelector('input[name="date-range"]:checked').value;
    const now = new Date();
    let fromDate = new Date();
    const timeUnit = dateRange.slice(-1);
    const timeAmount = dateRange.substring(0, dateRange.length - 1);
    if (timeUnit === 'y') {
        fromDate.setFullYear(now.getFullYear() - timeAmount);
    } else if (timeUnit === 'm') {
        fromDate.setMonth(now.getMonth() - timeAmount);
    } else if (timeUnit === 'd') {
        fromDate.setDate(now.getDate() - timeAmount);
    } else {
        fromDate = new Date(0);
    }
    return '&resolution=D' + '&from=' + Math.floor(fromDate.getTime() / 1000) + '&to=' + Math.floor(now.getTime() / 1000);
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