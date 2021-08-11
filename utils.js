const blankVal = '--';

module.exports.getDateParams = function(dateRange) {
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

module.exports.getReadableDates = function(dates) {
    return dates.map(date => new Date(date * 1000).toDateString().slice(4));
}

module.exports.getDollarVal = function(val) {
    return (val ? (Math.round(val * 100) / 100).toFixed(2) : blankVal);
}

module.exports.getPercentVal = function(val) {
    return val ? `(${val}%)` : blankVal;
}

module.exports.getData = async function(endpoint) {
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