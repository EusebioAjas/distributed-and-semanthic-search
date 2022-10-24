const DATAMUSE_URL = 'https://api.datamuse.com/words?ml=';
const EUROPEAN_URL = 'https://api.europeana.eu/record/v2/search.json?reusability=open&media=true&wskey=actocksh&query=';
const PLOS_URL = 'http://api.plos.org/search?q=title:';

async function fetchResolver(term, API_URL) {
    try {
        let res = await fetch(API_URL + term);
        return await res.json();
    } catch (err) {
        console.error(err);
    }
}

async function getDataFrom(API_URL, fn) {
    const input = document.getElementById("srInput").value;
    return fn(input, API_URL);
}

async function handleSearchBtn() {
    const result = await getDataFrom(DATAMUSE_URL, fetchResolver)
    console.log(result);
    return result;
}
