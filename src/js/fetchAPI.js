const DATAMUSE_URL = "https://api.datamuse.com/words?ml=";
const EUROPEAN = "European";
const EUROPEAN_ARTICLE = "https://www.europeana.eu/es/item";
const EUROPEAN_URL =
  "https://api.europeana.eu/record/v2/search.json?reusability=open&media=true&wskey=actocksh&query=";
const PLOS = "Plos";
const PLOS_ARTICLE = "https://journals.plos.org/plosone/article?id=";
const PLOS_URL = "http://api.plos.org/search?q=title:";

async function fetchResolver(term, API_URL) {
  try {
    let res = await fetch(API_URL + term);
    return await res.json();
  } catch (err) {
    console.error(err);
  }
}

async function getDataFrom(API_URL, fn) {
  const input = document.getElementById("input").value;
  return fn(input, API_URL);
}

async function renderData() {
  const data = await getAllData();
  const sortedData = data.sort(compareScore);
  let html = "";
  sortedData.map((item) => {
    html += renderItem(
      item.provider,
      item.title,
      item.link,
      item.originalScore,
      item.normalizedScore
    );
  });
  let container = document.querySelector(".container");
  container.innerHTML = html;
}

async function mapDataSourceFromEuropean() {
  const result = await getDataFrom(EUROPEAN_URL, fetchResolver);
  const arrData = result.items;
  const maxScore =
    arrData.length > 0 && arrData[0].score ? arrData[0].score : 1;
  const data = arrData.map((item) => {
    return getObjectFromEuropean(item, maxScore);
  });
  return data;
}

async function mapDataSourceFromPLOS() {
  const result = await getDataFrom(PLOS_URL, fetchResolver);
  const arrData = result.response.docs;
  const maxScore = result.response.maxScore;
  const data = arrData.map((item) => {
    return getObjectFromPLOS(item, maxScore);
  });
  return data;
}

function getObjectFromEuropean(item, maxScore) {
  let doc = {};
  doc.link = EUROPEAN_ARTICLE + item.id;
  doc.normalizedScore = item.score / maxScore;
  doc.originalScore = item.score;
  doc.provider = EUROPEAN;
  doc.title = item.title[0];
  return doc;
}

function getObjectFromPLOS(item, maxScore) {
  let doc = {};
  doc.link = PLOS_ARTICLE + item.id;
  doc.normalizedScore = item.score / maxScore;
  doc.originalScore = item.score;
  doc.provider = PLOS;
  doc.title = item.title_display;
  return doc;
}

async function getAllData() {
  const result1 = await mapDataSourceFromEuropean();
  const result2 = await mapDataSourceFromPLOS();
  const finalResult = result1.concat(result2);

  return finalResult;
}

function renderItem(provider, title, link, originalValue, normalizedValue) {
  return `<div class="card">
    <p><b>Provider:</b> ${provider}</p>
    <p><b>Title:</b> ${title}</p>
    <p><a href="${link}">Link</a></p>
    <p><b>Original value:</b> ${originalValue}</p>
    <p><b>Normalized value:</b> ${normalizedValue}</p>
  </div>`;
}

function compareScore(obj1, obj2) {
  return obj2.normalizedScore - obj1.normalizedScore;
}

function debounce(func, delay = 500) {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

function setOptions(data) {
  const searchTerms = data.map((e) => e.word).slice(0, 10);
  let input = document.getElementById("input");
  autocomplete(input, searchTerms);
}

async function showResults() {
  const updateOptions = debounce((query) => {
    fetch(DATAMUSE_URL + query)
      .then((res) => res.json())
      .then((data) => setOptions(data));
  }, 500);

  input.addEventListener("input", (e) => {
    updateOptions(e.target.value);
  });
}

// <code> from w3schools.com </code>
function autocomplete(inp, arr) {
  let currentFocus;

  let a,
    b,
    i,
    val = inp.value;
  if (!val) {
    return false;
  }

  closeAllLists(inp);

  currentFocus = -1;
  a = document.createElement("DIV");
  a.setAttribute("id", inp.id + "autocomplete-list");
  a.setAttribute("class", "autocomplete-items");
  inp.parentNode.appendChild(a);

  for (i = 0; i < arr.length; i++) {
    if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
      b = document.createElement("DIV");
      b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
      b.innerHTML += arr[i].substr(val.length);
      b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
      b.addEventListener("click", function (e) {
        inp.value = this.getElementsByTagName("input")[0].value;
        closeAllLists(inp);
      });
      a.appendChild(b);
    }
  }
}

function addEventListener(e) {
  let x = document.getElementById(this.id + "autocomplete-list");
  if (x) x = x.getElementsByTagName("div");
  if (e.keyCode == 40) {
    currentFocus++;
    addActive(x);
  } else if (e.keyCode == 38) {
    currentFocus--;
    addActive(x);
  } else if (e.keyCode == 13) {
    e.preventDefault();
    if (currentFocus > -1) {
      if (x) x[currentFocus].click();
    }
  }
}

function addActive(x) {
  if (!x) return false;
  removeActive(x);
  if (currentFocus >= x.length) currentFocus = 0;
  if (currentFocus < 0) currentFocus = x.length - 1;
  x[currentFocus].classList.add("autocomplete-active");
}

function removeActive(x) {
  for (let i = 0; i < x.length; i++) {
    x[i].classList.remove("autocomplete-active");
  }
}

function closeAllLists(elmnt) {
  let x = document.getElementsByClassName("autocomplete-items");
  for (let i = 0; i < x.length; i++) {
    if (elmnt.parentNode == x[i].parentNode) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
}

document.addEventListener("click", (e) => {
  closeAllLists(e.target);
});
