const DATAMUSE_URL = 'https://api.datamuse.com/words?ml=';
const EUROPEAN_ARTICLE = 'https://www.europeana.eu/es/item';
const EUROPEAN_URL = 'https://api.europeana.eu/record/v2/search.json?reusability=open&media=true&wskey=actocksh&query=';
const PLOS_ARTICLE = 'https://journals.plos.org/plosone/article?id=';
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
  const result1 = await mapDataSourceFromEuropean();
  const result2 = await mapDataSourceFromPLOS();
  const finalResult = result1.concat(result2);

  console.log(finalResult);
  return finalResult;
}

async function mapDataSourceFromEuropean() {
  const result = await getDataFrom(EUROPEAN_URL, fetchResolver);
  const arrData = result.items;
  const maxScore = (arrData.length > 0 && arrData[0].score) ? arrData[0].score : 1;
  const data = arrData.map((item) => {
    return getObjectFromEuropean(item, maxScore);
  })
  return data;
}

async function mapDataSourceFromPLOS() {
  const result = await getDataFrom(PLOS_URL, fetchResolver);
  const arrData = result.response.docs;
  const maxScore = result.response.maxScore;
  const data = arrData.map((item) => {
    return getObjectFromPLOS(item, maxScore);
  })
  return data;
}

function getObjectFromEuropean(item, maxScore) {
  let doc = {};
  doc.link = PLOS_ARTICLE + item.id;
  doc.normalizedScore = item.score / maxScore;
  doc.originalScore = item.score;
  doc.provider = PLOS;
  doc.title = item.title[0];
  return doc;
}

function getObjectFromPLOS(item, maxScore) {
  let doc = {};
  doc.link = EUROPEAN_ARTICLE + item.id;
  doc.normalizedScore = item.score / maxScore;
  doc.originalScore = item.score;
  doc.provider = EUROPEAN;
  doc.title = item.title_display;
  return doc;
}

async function getAllData() {
  const datamuse = await getDataFrom(DATAMUSE_URL, fetchResolver);
  const european = await getDataFrom(EUROPEAN_URL, fetchResolver);
  const plos = await getDataFrom(PLOS_URL, fetchResolver);
  const data = await Promise.all([datamuse, european, plos]);

  return data;
}

function renderItem(link, provider, originalValue, normalizedValue) {
  return `<div class="card">
    <p>Provider: ${provider}</p>
    <p><a href="${link}">Link</a></p>
    <p>Original value: ${originalValue}</p>
    <p>normalized value: ${normalizedValue}</p>
  </div>`;
}

function compareScore(score1, score2) {
  return score2 - score1;
}
