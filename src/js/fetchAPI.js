const DATAMUSE_URL = 'https://api.datamuse.com/words?ml=';
const EUROPEAN_URL = 'https://api.europeana.eu/record/v2/search.json?reusability=open&media=true&wskey=actocksh&query=';
const PLOS_URL = 'http://api.plos.org/search?q=title:';

const EUROPEAN = "European";
const PLOS = "Plos";

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
  const result = await getDataFrom(PLOS_URL, fetchResolver);
  const docs = result.response.docs;
  docs.map((doc) => {
    let originalScore = doc.score;
    let normalized = doc.score / result.maxScore;
    renderItem(doc.id, PLOS, originalScore, normalized);
  })
}

async function getAllData() {
  const datamuse = await getDataFrom(DATAMUSE_URL, fetchResolver);
  const european = await getDataFrom(EUROPEAN_URL, fetchResolver);
  const plos = await getDataFrom(PLOS_URL, fetchResolver);
  const data = await Promise.all([datamuse, european, plos]);

  return data;

}

function parseProvider(response) {
  const res = JSON.parse(response);
}

function plosParser({ doc }) {
  const score = doc.score;
  const link = doc.title;

  return { score, link, PLOS};
}

function parser({ item }) {
  const link = item.link;
  const originalScore = item.score;

  return { link, originalScore, EUROPEAN };
}

function renderItem({ link, provider, originalValue, normalizedValue }) {
  return `<div>
    <p>Provider: ${provider}</p>
    <a href="${link}">Link</a>
    <p>Original value: ${originalValue}</p>
    <p>normalized value: ${normalizedValue}</p>
  </div>`;
}
