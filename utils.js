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
    getEndpoint: function(options, ticker) {
        return this.url + this.param[options.paramKey] + ticker + getDateParams(options) + this.apiKey;
    }
};

module.exports.GET_FOREX = {paramKey: 'forex'};
module.exports.GET_LOOKUP = {paramKey: 'lookup'};
module.exports.GET_QUOTE = {paramKey: 'quote'};
module.exports.GET_CANDLE = {paramKey: 'candle', dateRange: {name: 'date-range'}};
module.exports.GET_RELATIVE_STRENGTH = {paramKey: 'candle', dateRange: {name: 'ta-date-range'}};
module.exports.GET_MOVING_AVG = {paramKey: 'candle', dateRange: {name: 'ta-date-range', resolution: 'D', addDays: 90}};
module.exports.GET_RECOMMENDATION_TRENDS = {paramKey: 'recommendations'};
module.exports.GET_NEWS = {paramKey: 'news'};

getDateParams = function(options) {
    const now = new Date();
    let fromDate = new Date();
    if (options.dateRange) {
        let dateRange = document.querySelector('input[name="' + options.dateRange.name + '"]:checked').value;
        const timeUnit = dateRange.slice(-1);
        const timeAmount = dateRange.substring(0, dateRange.length - 1);
        let resolution = options.dateRange.resolution || 'D';
        if (!options.dateRange.resolution && (dateRange === 'max' || (timeUnit === 'y' && timeAmount > 1))) {
            resolution = 'W';
        }
        if (timeUnit === 'y') {
            fromDate.setFullYear(now.getFullYear() - timeAmount);
        } else if (timeUnit === 'm') {
            fromDate.setMonth(now.getMonth() - timeAmount);
        } else if (timeUnit === 'd') {
            fromDate.setDate(now.getDate() - timeAmount);
            resolution = 30;
        } else {
            fromDate = new Date(0);
        }
        if (options.dateRange.addDays) {
            fromDate.setDate(fromDate.getDate() - options.dateRange.addDays);
        }
        return '&resolution=' + resolution + '&from=' + Math.floor(fromDate.getTime() / 1000) + '&to=' + Math.floor(now.getTime() / 1000);
    } else if (options.paramKey === 'news') {
        fromDate.setDate(now.getDate() - 7);
        return '&from=' + fromDate.toISOString().slice(0, 10) + '&to=' + now.toISOString().slice(0, 10);
    } else {
        return '';
    }
}

module.exports.getData = async function(options, ticker) {
    const endpoint = endpointBuilder.getEndpoint(options, ticker);
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