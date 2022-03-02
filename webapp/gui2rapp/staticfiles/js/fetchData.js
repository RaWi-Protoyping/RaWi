const {
  addGUIToEditorKonva,
  getUICompObjects,
  getUICompGroups,
} = require('./guiKonva');
const { generateID } = require('./helpers');
const { vars } = require('./vars');
var { importHelper } = vars;

function getDataFromJson(url, callback) {
  return fetch(url)
    .then((res) => res.json())
    .then((jsonData) => callback(readJSON(jsonData)));
}

async function fetchJSONDataFromIndex(
  image,
  index,
  x,
  y,
  editable,
  extended,
  blank
) {
  if (extended || editable) {
    let returnVal = await Promise.all([
      fetch(
        `http://rawi-prototyping.com/static/resources/combined/${index}.json`
      ).then((response) => response.json()),

      fetch(
        `http://rawi-prototyping.com/static/resources/semantic_annotations/${index}.json`
      ).then((response) => {
        return response.json();
      }),
      fetch(
        `http://rawi-prototyping.com/static/resources/combined_extended/${index}.json`
      ).then((response) => {
        return response ? response.json() : null;
      }),
    ]).then((responses) =>
      fetchAllResponses(index, image, responses, x, y, editable, blank)
    );
    return returnVal;
  } else {
    return Promise.all([
      fetch(
        `http://rawi-prototyping.com/static/resources/combined/${index}.json`
      ).then((response) => response.json()),

      fetch(
        `http://rawi-prototyping.com/static/resources/semantic_annotations/${index}.json`
      ).then((response) => response.json()),
    ]).then((responses) =>
      fetchAllResponses(index, image, responses, x, y, editable, blank)
    );
  }
}

function fetchAllResponses(
  index,
  image,
  responses,
  x,
  y,
  editable,
  blank = false
) {
  jsonDataCombined = responses[0];
  jsonDataCombinedExtended = responses[2];
  jsonDataSemantic = responses[1];
  uiCompObjects = getUICompObjects(
    jsonDataCombined,
    jsonDataSemantic,
    jsonDataCombinedExtended
  );
  let bgColor = jsonDataCombinedExtended
    ? jsonDataCombinedExtended.bg_color
    : null;

  addGUIToEditorKonva(
    index,
    image,
    uiCompObjects,
    x,
    y,
    editable,
    blank,
    bgColor,
    null
  );
}

function addGUIToEditor(
  index,
  x = 0,
  y = 0,
  editable = false,
  extended = false,
  blank = false
) {
  var newImg = new Image();
  newImg.onload = function () {
    importHelper.guisInitialized.push(index);
    fetchJSONDataFromIndex(this, index, x, y, editable, extended, blank);
  };
  newImg.src = `http://rawi-prototyping.com/static/resources/combined/${index}.jpg`;
}

function fetchSearchResults(query, method, qe_method, max_results) {
  return fetch('http://rawi-prototyping.com/gui2r/v1/retrieval', {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      method: method,
      qe_method: qe_method,
      max_results: max_results,
    }),
  })
    .then((res) => res.json())
    .then((res) => appendAllSearchResults(res));
}

function appendAllSearchResults(results) {
  ranked_documents = results['results'];
  searchResultCards = ranked_documents.map((doc) =>
    searchResultCard(doc['index'], doc['rank'], doc['score'])
  );
  $('#container-search-results').append(searchResultCards);
}

function searchResultCard(index, rank, conf) {
  return `<div class="col-lg-4 col-md-6 col-6" style="margin-bottom:20px">
      <div style="padding:8px;background-color:#E3E5ED" class="card mb-3 box-shadow">
      <p style="font-size:10px;font-weight:bold;text-align:center;margin-bottom:3px">${rank}.</p>
      <img class="card-img-top myImages" id="myImg-${index}" src="http://rawi-prototyping.com/static/resources/combined/${index}.jpg" draggable="true" alt="GUI ${index}">
            <button id="btn-gui-add-${index}" data-val="${index}" class="btn btn-success p-0" style="width:100%" type="submit">+</button>
  
          </div>`;
}

module.exports['fetchJSONDataFromIndex'] = fetchJSONDataFromIndex;
module.exports['addGUIToEditor'] = addGUIToEditor;
module.exports['fetchSearchResults'] = fetchSearchResults;