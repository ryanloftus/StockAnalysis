const url = 'https://finnhub.io/api/v1/quote?symbol=';
const apiKey = '&token=c41hlviad3ies3kt3gmg';

const ticker = document.getElementById('ticker');
const submit = document.getElementById('submit');

function renderResponse(quote) {
    const responseField = document.getElementById('responseField');
    console.log(JSON.stringify(quote));
    responseField.innerHTML = `<p>` +
        (quote.c ? `Close: \$${quote.c}` : '') +
        (quote.d ? `<br><br>Change: \$${quote.d}` : '') +
        `</p>`;
}

async function getStockQuote() {
    const endpoint = url + ticker.value + apiKey;
    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            cache: 'no-cache'
        });
        if (response.ok) {
            const jsonResponse = await response.json();
            renderResponse(jsonResponse);
        } else {
            throw new Error('Request failed');
        }
    }
    catch (error) {
        console.log(error);
    }
}

// TODO: remove unresolved promises when search is clicked
async function displayStockQuote() {
    getStockQuote();
}

submit.onclick = displayStockQuote;