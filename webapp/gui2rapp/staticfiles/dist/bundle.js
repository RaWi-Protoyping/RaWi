(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Konva = require('konva');
const { vars } = require('./vars');
const { guiNodes, layer } = vars;
const { getNextId } = require('./helpers');

function createCustomLabel(
  currentShape,
  addBoxTransitionEventListener,
  createKonvaPlayer,
  extraInformation = null
) {
  const textarea = document.getElementById('create-label-text');
  let labelText = textarea.value || 'Sample Text';
  //clear textarea
  textarea.value = '';

  const fontSizeInput = document.getElementById('create-label-size');
  let fontSize = fontSizeInput.value || 12;
  fontSizeInput.value = 12;

  const fontColorInput = document.getElementById('create-label-color');
  let fontColor = fontColorInput.value || '#000000';
  fontColorInput.value = '#000000';

  if (extraInformation) {
    labelText = extraInformation.text;
    fontSize = extraInformation.fontSize;
    fontColor = extraInformation.textColor;
  }

  //var nodeId = currentShape.getParent().getAttr('id').split('_')[1];
  // Remove guiNode first from the data model
  guiNode = guiNodes.find(
    (n) => n.id == currentShape.getParent().getParent().getAttr('id')
  );
  let currShapeParent = currentShape.getParent();
  var labelGroup = currShapeParent.clone();
  labelGroup.destroyChildren();
  var newId = getNextId(guiNode);
  newId = guiNode['id'] + '_' + newId;
  labelGroup.setAttr('name', newId);
  labelGroup.setAttr('id', newId);
  labelGroup.setAttr('visible', true);

  //create the two children: text and colored box
  let text = new Konva.Text({
    text: labelText,
    id: newId + '_img',
    name: newId + '_img',
    fontSize,
    fill: fontColor,
  });

  //limit the text width
  if (text.width() >= 250) {
    text.width(250);
  }

  if (extraInformation) {
    if (text.width() > extraInformation.width) {
      text.width(extraInformation.width);
    }
  }

  let box = new Konva.Rect({
    x: 0, //normalizedA[0] ,
    y: 0, //normalizedA[1] ,
    width: text.width(),
    height: text.height(),
    stroke_ori: 'green',
    stroke: 'green',
    strokeWidth: 2,
    opacity: 0.3,
    //draggable: true,
    id: newId,
    name: newId,
  });

  //set editable on box to true
  box.setAttr('editable', true);

  box.on('mousedown', (e) => addBoxTransitionEventListener(e, box));

  //add children to group
  labelGroup.add(text);
  labelGroup.add(box);
  var newOffset = extraInformation ? 0 : 20;
  labelGroup.setAttr('x', labelGroup.getAttr('x') + newOffset);
  labelGroup.setAttr('y', labelGroup.getAttr('y') + newOffset);
  labelGroup.width(box.width());
  labelGroup.height(box.height());

  labelGroup.setAttr('isCustom', true);

  //add listener for editing the label
  labelGroup.off('dblclick');
  labelGroup.on('dblclick', function () {
    $('#edit-label-dialog').dialog('open');
    const editTextField = document.getElementById('edit-label-text');
    const editSizeField = document.getElementById('edit-label-size');
    const editColorField = document.getElementById('edit-label-color');

    const labelIdSpan = document.getElementById('label-id-span');

    const textObj = this.getChildren()[0];

    editTextField.value = textObj.getAttr('text');
    editSizeField.value = Math.ceil(textObj.getAttr('fontSize'));
    editColorField.value = textObj.getAttr('fill');

    labelIdSpan.dataset.labelId = textObj.getAttr('id');
  });

  //create and add new uiCompObject to data model
  var uiCompObject1 = guiNode.uiCompObjects.find(
    (n) => n['id'] == currentShape.getAttr('id')
  );
  var newCompObj = Object.assign({}, uiCompObject1);
  newCompObj['id'] = newId;
  newCompObj['comp_label'] = 'CustomLabel';
  newCompObj['plain_json'] = {};
  newCompObj['crop_group'] = labelGroup.clone();
  newCompObj['isBlank'] = false;
  newCompObj['isGroup'] = false;
  //newCompObj['is_CompoundElement'] = false;

  guiNode.uiCompObjects.push(newCompObj);
  var currGroup = currentShape.getParent().getParent();

  currGroup.add(labelGroup);
  // labelGroup.moveToTop();
  //fire these two events in order to display component correctly
  labelGroup.fire('dragstart');
  labelGroup.fire('dragend');
  layer.batchDraw();
  if (extraInformation) {
    labelGroup.fire('dblclick');
  }

  if (guiNodes) {
    createKonvaPlayer();
  }
}

function getLabelCrop(textParam, fontSize, fontColor, width, height) {
  let text = new Konva.Text({
    text: textParam,
    fontSize: fontSize || 12,
    fill: fontColor || '#000000',
  });

  if (text.getTextWidth() > width) {
    text.width(width);
  }

  if (text.getTextHeight() > height) {
    text.height(height);
  }

  return text;
}

function createCustomButton(
  currentShape,
  addBoxTransitionEventListener,
  createKonvaPlayer,
  extraInformation = null
) {
  const textarea = document.getElementById('create-button-text');
  let buttonText = textarea.value || 'Sample Text';
  //clear textarea
  textarea.value = '';

  const fontSizeInput = document.getElementById('create-button-text-size');
  let fontSize = parseInt(fontSizeInput.value) || 12;
  fontSizeInput.value = 12;

  const fontColorInput = document.getElementById('create-button-text-color');
  let fontColor = fontColorInput.value || '#000000';
  fontColorInput.value = '#000000';

  const buttonColorInput = document.getElementById('create-button-color');
  let buttonColor = buttonColorInput.value || '#ffffff';
  buttonColorInput.value = '#ffffff';

  if (extraInformation) {
    buttonText = extraInformation.text;
    fontSize = extraInformation.fontSize;
    fontColor = extraInformation.textColor;
    buttonColor = extraInformation.buttonColor;
  }

  //var nodeId = currentShape.getParent().getAttr('id').split('_')[1];
  // Remove guiNode first from the data model
  guiNode = guiNodes.find(
    (n) => n.id == currentShape.getParent().getParent().getAttr('id')
  );
  let currShapeParent = currentShape.getParent();
  var buttonGroup = currShapeParent.clone();
  buttonGroup.destroyChildren();
  var newId = getNextId(guiNode);
  newId = guiNode['id'] + '_' + newId;
  buttonGroup.setAttr('name', newId);
  buttonGroup.setAttr('id', newId);
  buttonGroup.setAttr('visible', true);

  buttonGroup.setAttr('isCustom', true);

  //create the children: text, colored box, button background
  let text = new Konva.Text({
    //x: (-1 * buttonExtraWidth) / 2, //normalizedA[0] ,
    //y: (-1 * buttonExtraHeight) / 2, //normalizedA[1] ,
    text: buttonText,
    id: newId + '_img',
    name: newId + '_img',
    fontSize,
    fill: fontColor,
    verticalAlign: 'middle',
    align: 'center',
    // width: buttonExtraWidth,
    // height: buttonExtraHeight,
  });

  let realWidth = text.getTextWidth();
  let realHeight = text.getTextHeight();

  let buttonExtraWidth = realWidth * 2;
  let buttonExtraHeight = realHeight * 3;

  text.width(buttonExtraWidth);
  text.height(buttonExtraHeight);

  //limit the text width
  if (text.width() >= 250) {
    text.width(250);
  }

  if (extraInformation) {
    text.width(extraInformation.width);
    text.height(extraInformation.height);
  }

  // text.x((1 * buttonExtraWidth) / 2);
  // text.y((1 * buttonExtraHeight) / 2);

  let buttonFill = new Konva.Rect({
    //x: (-1 * buttonExtraWidth) / 2, //normalizedA[0] ,
    //y: (-1 * buttonExtraHeight) / 2, //normalizedA[1] ,
    width: text.width(),
    height: text.height(),
    fill: buttonColor,
    cornerRadius: text.width() / 15,
    //draggable: true,
    id: newId + '_img',
    name: newId + '_img',
  });

  if (extraInformation) {
    buttonFill.setAttr('fixedWidth', buttonFill.width());
    buttonFill.setAttr('fixedHeight', buttonFill.height());
  }

  let box = new Konva.Rect({
    x: buttonFill.x(), //normalizedA[0] ,
    y: buttonFill.y(), //normalizedA[1] ,
    width: buttonFill.width(),
    height: buttonFill.height(),
    stroke_ori: 'green',
    stroke: 'green',
    strokeWidth: 2,
    opacity: 0.3,
    //draggable: true,
    id: newId,
    name: newId,
  });

  //set editable on box to true
  box.setAttr('editable', true);

  box.on('mousedown', (e) => addBoxTransitionEventListener(e, box));

  //add children to group
  buttonGroup.add(buttonFill);
  buttonGroup.add(text);

  buttonGroup.add(box);
  var newOffset = extraInformation ? 0 : 20;
  buttonGroup.setAttr('x', buttonGroup.getAttr('x') + newOffset);
  buttonGroup.setAttr('y', buttonGroup.getAttr('y') + newOffset);
  buttonGroup.width(box.width());
  buttonGroup.height(box.height());
  text.setAttr('align', 'center');
  text.setAttr('verticalAlign', 'middle');

  //add listener for editing the label
  buttonGroup.off('dblclick');
  buttonGroup.on('dblclick', function () {
    $('#edit-button-dialog').dialog('open');
    const editTextField = document.getElementById('edit-button-text');
    const editTextSizeField = document.getElementById('edit-button-text-size');
    const editColorField = document.getElementById('edit-button-text-color');
    const editButtonColorField = document.getElementById('edit-button-color');

    const buttonIdSpan = document.getElementById('button-id-span');

    const textObj = this.getChildren()[1];
    const fillObj = this.getChildren()[0];

    editTextField.value = textObj.getAttr('text');
    editTextSizeField.value = Math.ceil(textObj.getAttr('fontSize'));
    editColorField.value = textObj.getAttr('fill');
    editButtonColorField.value = fillObj.getAttr('fill');

    buttonIdSpan.dataset.buttonId = textObj.getAttr('id');
  });

  var currGroup = currentShape.getParent().getParent();
  currGroup.add(buttonGroup);
  //create and add new uiCompObject to data model
  var uiCompObject1 = guiNode.uiCompObjects.find(
    (n) => n['id'] == currentShape.getAttr('id')
  );
  var newCompObj = Object.assign({}, uiCompObject1);
  newCompObj['id'] = newId;
  newCompObj['comp_label'] = 'CustomButton';
  newCompObj['plain_json'] = {};
  newCompObj['crop_group'] = buttonGroup.clone();
  newCompObj['isBlank'] = false;
  newCompObj['isGroup'] = false;
  // newCompObj['updated_comp_bounds'] = [
  //   buttonGroup.x(),
  //   buttonGroup.y(),
  //   buttonGroup.x() + buttonGroup.width(),
  //   buttonGroup.y() + buttonGroup.height(),
  // ];

  guiNode.uiCompObjects.push(newCompObj);

  // buttonGroup.moveToTop();
  //fire these two events in order to display component correctly
  buttonGroup.fire('dragstart');
  buttonGroup.fire('dragend');

  if (extraInformation) {
    buttonGroup.fire('dblclick');
  }

  //buttonGroup.fire('dragend');

  layer.batchDraw();
  if (guiNodes) {
    createKonvaPlayer();
  }
}

function getButtonCrop(
  textParam,
  fontSize,
  fontColor,
  buttonColor,
  width,
  height,
  boxId,
  addBoxTransitionEventListener
) {
  let text = new Konva.Text({
    text: textParam,
    fontSize,
    fill: fontColor,
    verticalAlign: 'middle',
    align: 'center',
    height,
    width,
    id: boxId + '_img',
    name: boxId + '_img',
  });

  let buttonFill = new Konva.Rect({
    width,
    height,
    fill: buttonColor,
    cornerRadius: text.width() / 15,
    id: boxId + '_img',
    name: boxId + '_img',
  });

  buttonFill.setAttr('fixedWidth', width);
  buttonFill.setAttr('fixedHeight', height);

  let box = new Konva.Rect({
    x: buttonFill.x(), //normalizedA[0] ,
    y: buttonFill.y(), //normalizedA[1] ,
    width: buttonFill.width(),
    height: buttonFill.height(),
    stroke_ori: 'green',
    stroke: 'green',
    strokeWidth: 2,
    opacity: 0.3,
    //draggable: true,
    id: boxId,
    name: boxId,
  });

  //set editable on box to true
  box.setAttr('editable', true);

  box.on('mousedown', (e) => addBoxTransitionEventListener(e, box));

  //   let btnGroup = new Konva.Group({
  //     width: buttonFill.width(),
  //     height: buttonFill.height(),
  //   });

  //   btnGroup.add(buttonFill);
  //   btnGroup.add(text);

  //   return btnGroup;
  return [buttonFill, text, box];
}

function createCustomInput(
  currentShape,
  addBoxTransitionEventListener,
  createKonvaPlayer,
  extraInformation = null
) {
  const textarea = document.getElementById('create-input-text');
  let inputText = textarea.value || 'Sample Text';
  //clear textarea
  textarea.value = '';

  const fontSizeInput = document.getElementById('create-input-text-size');
  let fontSize = fontSizeInput.value || 12;
  fontSizeInput.value = 12;

  const fontColorInput = document.getElementById('create-input-text-color');
  let fontColor = fontColorInput.value || '#ffffff';
  fontColorInput.value = '#ffffff';

  const inputColorInput = document.getElementById('create-input-color');
  let inputColor = inputColorInput.value || '#cccccc';
  inputColorInput.value = '#cccccc';

  const inputSizeInput = document.getElementById('create-input-size');
  let inputSize = inputSizeInput.value || 'full';
  inputSizeInput.value = 'full';

  if (extraInformation) {
    inputText = extraInformation.text;
    fontSize = extraInformation.fontSize;
    fontColor = extraInformation.textColor;
    inputColor = extraInformation.inputColor;
  }

  //var nodeId = currentShape.getParent().getAttr('id').split('_')[1];
  // Remove guiNode first from the data model
  guiNode = guiNodes.find(
    (n) => n.id == currentShape.getParent().getParent().getAttr('id')
  );
  let currShapeParent = currentShape.getParent();
  var inputGroup = currShapeParent.clone();
  inputGroup.destroyChildren();
  var newId = getNextId(guiNode);
  newId = guiNode['id'] + '_' + newId;
  inputGroup.setAttr('name', newId);
  inputGroup.setAttr('id', newId);
  inputGroup.setAttr('visible', true);

  inputGroup.setAttr('isCustom', true);

  let inputExtraHeight = fontSize * 1.5;

  //map width
  let inputWidthMap = {
    full: 250,
    twoThirds: 167,
    half: 125,
    oneThird: 83,
    fourth: 62,
  };

  let inputWidth = inputWidthMap[inputSize] || 250;

  //create the children: text, colored box, button background
  let text = new Konva.Text({
    text: inputText,
    id: newId + '_img',
    name: newId + '_img',
    fontSize,
    fill: fontColor,
    x: 5,
    verticalAlign: 'middle',
  });

  //limit the text width

  text.width(inputWidth - 10);

  text.height(text.getTextHeight() + inputExtraHeight);

  if (extraInformation) {
    text.width(extraInformation.width);
    text.height(extraInformation.height);
    inputWidth = extraInformation.width;
  }

  let inputFill = new Konva.Rect({
    x: 0, //normalizedA[0] ,
    y: 0, //normalizedA[1] ,
    width: inputWidth,
    height: text.height(),
    fill: inputColor,
    opacity: 0.3,
    //draggable: true,
    id: newId + '_img',
    name: newId + '_img',
  });

  inputFill.setAttr('inputSize', inputSize);
  if (extraInformation) inputFill.setAttr('inputSize', 'custom');

  let box = new Konva.Rect({
    x: inputFill.x(), //normalizedA[0] ,
    y: inputFill.y(), //normalizedA[1] ,
    width: inputFill.width(),
    height: inputFill.height(),
    stroke_ori: 'green',
    stroke: 'green',
    strokeWidth: 2,
    opacity: 0.3,
    //draggable: true,
    id: newId,
    name: newId,
  });

  //set editable on box to true
  box.setAttr('editable', true);

  box.on('mousedown', (e) => addBoxTransitionEventListener(e, box));

  //add children to group
  inputGroup.add(inputFill);
  inputGroup.add(text);

  inputGroup.add(box);
  var newOffset = extraInformation ? 0 : 20;
  inputGroup.setAttr('x', inputGroup.getAttr('x') + newOffset);
  inputGroup.setAttr('y', inputGroup.getAttr('y') + newOffset);
  inputGroup.width(box.width());
  inputGroup.height(box.height());

  //add listener for editing the label
  inputGroup.off('dblclick');
  inputGroup.on('dblclick', function () {
    $('#edit-input-dialog').dialog('open');
    const editTextField = document.getElementById('edit-input-text');
    const editTextSizeField = document.getElementById('edit-input-text-size');
    const editColorField = document.getElementById('edit-input-text-color');
    const editinputColorField = document.getElementById('edit-input-color');
    const editInputSize = document.getElementById('edit-input-size');

    const inputIdSpan = document.getElementById('input-id-span');

    const textObj = this.getChildren()[1];
    const fillObj = this.getChildren()[0];

    editTextField.value = textObj.getAttr('text');
    editTextSizeField.value = Math.ceil(textObj.getAttr('fontSize'));
    editColorField.value = textObj.getAttr('fill');
    editinputColorField.value = fillObj.getAttr('fill');

    editInputSize.value = fillObj.getAttr('inputSize');

    inputIdSpan.dataset.inputId = textObj.getAttr('id');
  });

  //create and add new uiCompObject to data model
  var uiCompObject1 = guiNode.uiCompObjects.find(
    (n) => n['id'] == currentShape.getAttr('id')
  );
  var newCompObj = Object.assign({}, uiCompObject1);
  newCompObj['id'] = newId;
  newCompObj['comp_label'] = 'CustomInput';
  newCompObj['plain_json'] = {};
  newCompObj['crop_group'] = inputGroup.clone();
  newCompObj['isBlank'] = false;
  newCompObj['isGroup'] = false;

  guiNode.uiCompObjects.push(newCompObj);
  var currGroup = currentShape.getParent().getParent();

  currGroup.add(inputGroup);
  // inputGroup.moveToTop();
  //fire these two events in order to display component correctly
  inputGroup.fire('dragstart');
  inputGroup.fire('dragend');
  if (extraInformation) {
    inputGroup.fire('dblclick');
  }
  layer.batchDraw();
  if (guiNodes) {
    createKonvaPlayer();
  }
}

function getInputCrop(
  textParam,
  fontSize,
  fontColor,
  inputColor,
  width,
  height
) {
  let text = new Konva.Text({
    text: textParam,
    width,
    height,
    fontSize,
    fill: fontColor,
    x: 5,
    verticalAlign: 'middle',
  });

  let inputFill = new Konva.Rect({
    x: 0, //normalizedA[0] ,
    y: 0, //normalizedA[1] ,
    width,
    height: text.height(),
    fill: inputColor,
    opacity: 0.3,
  });

  return [inputFill, text];
}

module.exports = {
  createCustomLabel,
  getLabelCrop,
  createCustomButton,
  getButtonCrop,
  createCustomInput,
  getInputCrop,
};

},{"./helpers":5,"./vars":8,"konva":49}],2:[function(require,module,exports){
function exportWireframe(guiNodes, transitions, userSetStartNodeId) {
  // concat guiNodes and transitions into one object to be exported in the json file
  let concattedData = {
    guiNodes: extractDataForGuiNodes(guiNodes),
    transitions,
    userSetStartNodeId: { id: setStartNode(userSetStartNodeId, guiNodes) },
  };

  //create the actual content of the export json file and format it accordingly to be downloadable
  let dataStr = JSON.stringify(concattedData);
  let dataUri =
    'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

  //filename scheme: rawi-export-1234567890.json
  let exportFileDefaultName = `rawi-export-${Date.now()}.json`;

  //download the export json file to computer by creating a temporary <a> element with proper attributes and then clicking it automatically
  let linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  console.log('exported');
}

//function for extracting only the relevant data from the guiNodes to save in the export file
function extractDataForGuiNodes(guiNodes) {
  //extract important data => index, x, y, updatedUiCompObjects
  let importantData = guiNodes.map((node) => {
    return {
      id: node.id,
      index: node.index,
      x: node.x,
      y: node.y,
      updatedUiCompObjects: extractUpdatedUiCompObjects(node.uiCompObjects),
      removedCompObjects: extractRemovedCompObjects(node.removedCompObjects),
    };
  });

  return importantData;
}

//function for extracting only the uiCompObjects that have been updated by moving to a different position
function extractUpdatedUiCompObjects(uiCompObjects) {
  let updatedUiCompObjects = [];

  //iterate through each of the uiCompObjects and check if they have been updated
  uiCompObjects.forEach((obj, index) => {
    let updated = false;
    //compare the two comp_bounds and updated_comp_bounds arrays and set updated to true if they are not the same, thus the uiCompObject has been updated
    for (let i = 0; i < obj.comp_bounds.length; i++) {
      if (obj.comp_bounds[i] !== obj.updated_comp_bounds[i]) {
        updated = true;
      }
    }
    //check if compObject comes from a different gui
    let origin = null;
    if (obj.crop_group !== undefined) {
      let crop_groupName = obj.crop_group.attrs.name;
      origin = crop_groupName.split('_')[1].split('-')[0];
    }

    //if the component has been updated, add the relevant data to the list of updated components
    if (updated) {
      //construct an object of relevant data => index, updated_comp_bounds
      let relevantData = {
        index,
        updated_comp_bounds: obj.updated_comp_bounds,
        origin,
      };
      //add relevantData to the array returned by this function
      updatedUiCompObjects.push(relevantData);
    }
  });

  return updatedUiCompObjects;
}

//function to check if start node was set -> if not, then set it to the first guinode
function setStartNode(startNode, guiNodes) {
  let newStartNode = 'startNode';
  if (Object.keys(startNode).length === 0 && startNode.constructor === Object) {
    // set to first guiNode
    newStartNode = guiNodes[0].id;
  } else {
    newStartNode = startNode.id;
  }
  return newStartNode;
}

//function to extract the correct order of the deletedUiComps
function extractRemovedCompObjects(removedCompObjects) {
  if (removedCompObjects) removedCompObjects.sort((a, b) => b - a);
  return removedCompObjects;
}

module.exports['exportWireframe'] = exportWireframe;

},{}],3:[function(require,module,exports){
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
        // console.log(response);
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
  // console.log(responses);
  // console.log(`Image width: ${image.width}, height: ${image.height}`);
  // console.log(`JSON data combined : ${jsonDataCombined}`);
  // console.log(`JSON data semantic : ${jsonDataSemantic}`);
  uiCompObjects = getUICompObjects(
    jsonDataCombined,
    jsonDataSemantic,
    jsonDataCombinedExtended
  );
  let bgColor = jsonDataCombinedExtended
    ? jsonDataCombinedExtended.bg_color
    : null;

  //let uiCompGroups = getUICompGroups(jsonDataCombinedExtended);
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
    // console.log('Initialized GUI ' + index);
    fetchJSONDataFromIndex(this, index, x, y, editable, extended, blank);
    // console.log(this);
  };
  newImg.src = `http://rawi-prototyping.com/static/resources/combined/${index}.jpg`;
  //fetchJSONDataFromIndex(this, index, x, y, editable, extended);
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

},{"./guiKonva":4,"./helpers":5,"./vars":8}],4:[function(require,module,exports){
const { JSONPath } = require('jsonpath-plus');
const {
  getLabelCrop,
  getButtonCrop,
  getInputCrop,
  createCustomButton,
  createCustomInput,
  createCustomLabel,
} = require('./createCustomComps');
const {
  rgbToHex,
  modeI,
  haveIntersection,
  getArrowPoints2,
  getNextId,
  generateID,
} = require('./helpers');
const { vars } = require('./vars');
var {
  showUICinPreview,
  width,
  height,
  stage,
  layer,
  currentSelectedComp,
  guiNodes,
  transitions,
  blockSnapSize,
  userSetStartNodeId,
  guiStack,
  importHelper,
} = vars;

const colorThief = new ColorThief();

addGrid(layer, blockSnapSize);

var tooltipLayer = new Konva.Layer();

var tooltip = new Konva.Label({
  opacity: 0.75,
  visible: false,
  listening: false,
});

tooltip.add(
  new Konva.Tag({
    fill: 'black',
    pointerDirection: 'down',
    pointerWidth: 10,
    pointerHeight: 10,
    lineJoin: 'round',
    shadowColor: 'black',
    shadowBlur: 10,
    shadowOffsetX: 10,
    shadowOffsetY: 10,
    shadowOpacity: 0.2,
  })
);

tooltip.add(
  new Konva.Text({
    text: '',
    fontFamily: 'Calibri',
    fontSize: 18,
    padding: 5,
    fill: 'white',
  })
);
tooltipLayer.add(tooltip);

/*  stage.add(tooltipLayer);
tooltipLayer.moveToTop(); */

function addGrid(layer, blockSnapSize) {
  var padding = blockSnapSize;
  //console.log(width, padding, width / padding);
  for (var i = 0; i < width / padding; i++) {
    layer.add(
      new Konva.Line({
        points: [
          Math.round(i * padding) + 0.5,
          0,
          Math.round(i * padding) + 0.5,
          height,
        ],
        stroke: '#ddd',
        strokeWidth: 1,
        opacity: 0.4,
      })
    );
  }

  layer.add(new Konva.Line({ points: [0, 0, 10, 10] }));
  for (var j = 0; j < height / padding; j++) {
    layer.add(
      new Konva.Line({
        points: [0, Math.round(j * padding), width, Math.round(j * padding)],
        stroke: '#ddd',
        strokeWidth: 0.5,
      })
    );
  }
}

function addTransitionArrow(firstComp, secondComp, isImport = false) {
  if (isImport) {
    firstComp = layer.findOne('#' + firstComp);
    secondParent = layer.findOne('#' + secondComp);
  }

  firstParent = firstComp.getParent();
  if (!isImport) {
    secondParent = secondComp.getParent();
    if (secondComp.getAttr('editable')) {
      secondParent = secondParent.getParent();
    }
    let secondId = secondParent.getAttr('id').split('_');
    secondId = secondId[0] + '_' + secondId[1];

    secondParent = layer.findOne('#' + secondId);
  }

  transition = {
    fromGUI: firstParent.getAttr('id'),
    from: firstComp.getAttr('id'),
    to: secondParent.getAttr('id'),
    id: `${firstComp.getAttr('id')}==>${secondParent.getAttr('id')}`,
  };
  transitions.push(transition);
  //console.log(`Added transition: [${transition.id},${transition.from},${transition.to}], #transitions: ${transitions.length}`);

  var arrow = new Konva.Arrow({
    points: getArrowPoints2(firstComp, secondParent),
    pointerLength: 10,
    pointerWidth: 10,
    fill: '#ff9900',
    stroke: '#ff9900',
    stroke_ori: '#ff9900',
    strokeWidth: 4,
    name: transition.id,
    id: transition.id,
  });
  layer.add(arrow);
  arrow.moveToTop();
  layer.draw();

  arrow.on('mousedown', function () {
    //console.log(`Pressed arrow ${arrow.getAttr('id')}`);
    if (this.getAttr('clicked')) {
      this.setAttr('stroke', this.getAttr('stroke_ori'));
      this.setAttr('clicked', false);
      currentSelectedArrow = null;
    } else {
      if (currentSelectedArrow) {
        currentSelectedArrow.setAttr('clicked', false);
        currentSelectedArrow.setAttr(
          'stroke',
          currentSelectedArrow.getAttr('stroke_ori')
        );
      }
      this.setAttr('clicked', true);
      this.setAttr('stroke', 'green');
      currentSelectedArrow = this;
      currentSelectedArrow.moveToTop();
    }
    layer.batchDraw();
  });

  /* function adjustArrowsOnDrag(e) {
        var p=[firstParent.getX() + firstComp.getX(), firstParent.getY() + firstComp.getY(), 
            secondParent.getX(), secondParent.getY()];
        arrow.setPoints(p);
        layer.draw();
      }; */
  updateObjects();
  //Update the player
  if (guiNodes) {
    createKonvaPlayer();
  }
}

function computeIntersections(e, pointerPosition) {
  //console.log(`COmputing INTERSECTIONS for ${e.target.getAttr('id')} with parent ${e.target.getParent().getAttr('id')}`);
  var target = e.target;
  //var targetRect = e.target.getClientRect();
  var pointerRect = {
    x: pointerPosition.x,
    y: pointerPosition.y,
    width: 2,
    height: 2,
  };
  interRectIds = [];
  layer.children.each(function (component) {
    // do not check intersection with itself
    //console.log(`Testing intersection with : ${component.getAttr('id')}`);
    /*  if (component === target) {
        return;
      } */

    let compRect = {
      x: component.x(),
      y: component.y(),
      width: component.width(),
      height: component.height(),
    };
    if (Konva.Util.haveIntersection(compRect, pointerRect)) {
      //console.log(`FOund intersection with : ${component.getAttr('id')}, ${Boolean(component.getAttr('id'))}`);
      if (component.getAttr('id')) {
        interRectIds.push(component.getAttr('id'));
      }
    }
    // do not need to call layer.draw() here
    // because it will be called by dragmove action
  });
  //console.log(`Found intersections: ${interRectIds}`);
  let tempIdArr = interRectIds.slice();
  // if (
  //   interRectIds.includes(e.target.getParent().getAttr('id')) ||
  //   interRectIds.includes(e.target.getParent().getAttr('id') + '-shadowGUI')
  // ) {
  //   return null;
  // }
  filteredInterRectIds = interRectIds.filter(
    (id) =>
      id !== e.target.getParent().getAttr('id') &&
      id !== e.target.getParent().getAttr('id') + '-shadowGUI'
  );

  console.log(tempIdArr);
  console.log(filteredInterRectIds);
  if (tempIdArr.length > filteredInterRectIds.length) {
    return null;
  }
  //console.log(`Filtered intersections: ${filteredInterRectIds}`);
  intersectionId = filteredInterRectIds[filteredInterRectIds.length - 1];
  //console.log(`Returned intersection: ${intersectionId}`);
  return intersectionId;
}

function addGUIToEditorKonva(
  index,
  image,
  uiCompObjects,

  x,
  y,
  editable,
  blank = false,
  bgColor = null,
  uiCompGroups = null
) {
  var tempIndex = index;
  index = generateID(tempIndex);
  var group = new Konva.Group({
    draggable: true,
    name: 'gui_' + index,
    id: 'gui_' + index,
    x: x,
    y: y,
  });

  // add cursor styling
  group.on('mouseover', function () {
    document.body.style.cursor = 'pointer';
  });
  group.on('mouseout', function () {
    document.body.style.cursor = 'default';
  });

  scaling_factor = 0.5;

  var darthNode = new Konva.Image({
    x: 0,
    y: 0,
    image: image,
    width: image.width * scaling_factor * (540 / image.width),
    height: image.height * scaling_factor * (540 / image.width),
    //scaleX: scaling_factor * (540/image.width),
    //scaleY: scaling_factor * (540/image.width),
    id: 'gui_' + index + '_img',
    name: 'gui_' + index + '_img',
  });

  var shadowGUI = new Konva.Rect({
    x: x,
    y: y,
    width: darthNode.getAttr('width') * darthNode.getAttr('scaleX'),
    height: darthNode.getAttr('height') * darthNode.getAttr('scaleY'),
    fill: '#8f99a3',
    opacity: 0.6,
    stroke: '#CF6412',
    strokeWidth: 3,
    dash: [20, 2],
    id: group.getAttr('id') + '-shadowGUI',
  });

  shadowGUI.hide();
  layer.add(shadowGUI);

  group.on('dragstart', (e) => {
    shadowGUI.show();
    shadowGUI.moveToTop();
    group.moveToTop();
  });
  group.on('dragend', (e) => {
    group.position({
      x: Math.round(group.x() / blockSnapSize) * blockSnapSize,
      y: Math.round(group.y() / blockSnapSize) * blockSnapSize,
    });
    if (currentSelectedComp.value) {
      currentSelectedComp.value.setAttr(
        'stroke',
        currentSelectedComp.value.getAttr('stroke_ori')
      );
      currentSelectedComp.value.setAttr('fill', undefined);
      currentSelectedComp.value = null;
    }
    updateObjects();
    stage.batchDraw();
    shadowGUI.hide();
  });
  group.on('dragmove', (e) => {
    shadowGUI.position({
      x: Math.round(group.x() / blockSnapSize) * blockSnapSize,
      y: Math.round(group.y() / blockSnapSize) * blockSnapSize,
    });
    updateObjects();
    stage.batchDraw();
  });

  if (editable) {
    // First add the background replacing rectangle
    var detectedColor = colorThief.getColor(image);
    //console.log(`DETECTED COLOR : ${detectedColor}`);
    var detextedHexColor = rgbToHex(
      detectedColor[0],
      detectedColor[1],
      detectedColor[2]
    );

    //console.log(`DETECTED HEXCOLOR : ${detextedHexColor}`);
    var backRect = new Konva.Rect({
      x: darthNode.x(),
      y: darthNode.y(),
      width: darthNode.width(),
      height: darthNode.height(),
      stroke_ori: '#394046',
      stroke: '#394046',
      strokeWidth: 2,
      fill: !blank ? detextedHexColor : '#ffffff',
      opacity: 0.98,
      //draggable: true,
      id: 'gui_' + index + '_back_rec',
      name: 'gui_' + index + '_back_rec',
    });
    if (bgColor && !blank) {
      backRect.setAttr('fill', bgColor);
    }
    group.add(backRect);

    // Second include the action bar
    let factor =
      (1440 / image.width) * (1 / scaling_factor) * (image.width / 540);
    var abarloc = [0, 0, 1440, 84].map(function (x) {
      return x / factor;
    });
    var abarwidth = abarloc[2] - abarloc[0];
    var abarheight = abarloc[3] - abarloc[1];
    var croppedActionBar = getCroppedComponent(
      darthNode,
      image,
      abarloc[0],
      abarloc[1],
      abarwidth,
      abarheight,
      abarloc[0] * (1 / scaling_factor) * (image.width / 540),
      abarloc[1] * (1 / scaling_factor) * (image.width / 540),
      abarwidth * (1 / scaling_factor) * (image.width / 540),
      abarheight * (1 / scaling_factor) * (image.width / 540),
      false
    );

    croppedActionBar.setAttr('comp_label', 'action_bar');
    croppedActionBar.setAttr('name', 'gui_' + index + '_action_bar');
    croppedActionBar.setAttr('id', 'gui_' + index + '_action_bar');
    group.add(croppedActionBar);
    croppedActionBar.moveToTop();
    croppedActionBar.on('mousedown', function () {
      console.log(this.getAttr('comp_label'));
    });
    // Third include the menu bar
    var menuloc = [0, 2393, 1440, 2560].map(function (x) {
      return x / factor;
    });
    var menuwidth = menuloc[2] - menuloc[0];
    var menuheight = menuloc[3] - menuloc[1];
    var cropppedMenu = getCroppedComponent(
      darthNode,
      image,
      menuloc[0],
      menuloc[1],
      menuwidth,
      menuheight,
      menuloc[0] * (1 / scaling_factor) * (image.width / 540),
      menuloc[1] * (1 / scaling_factor) * (image.width / 540),
      menuwidth * (1 / scaling_factor) * (image.width / 540),
      menuheight * (1 / scaling_factor) * (image.width / 540),
      false
    );

    cropppedMenu.setAttr('comp_label', 'menu');
    cropppedMenu.setAttr('name', 'gui_' + index + '_menu');
    cropppedMenu.setAttr('id', 'gui_' + index + '_menu');
    group.add(cropppedMenu);
    cropppedMenu.moveToTop();
    cropppedMenu.on('mousedown', function () {
      console.log(this.getAttr('comp_label'));
    });
    //darthNode.hide();
    darthNode.visible(false);
    group.add(darthNode);
  } else {
    group.add(darthNode);
    darthNode.setZIndex(0);
  }

  //layer.batchDraw();
  // add cursor styling
  darthNode.on('mouseover', function () {
    document.body.style.cursor = 'pointer';
  });
  darthNode.on('mouseout', function () {
    document.body.style.cursor = 'default';
  });

  /* var croppedActionBar = getCroppedActionBar();
      var croppedMenu = getCroppedMenu(); */

  //implement uicompgroups with their colors
  // if (uiCompGroups && editable && !blank) {
  //   uiCompGroups.forEach((compGroup, i) => {
  //     let factor =
  //       (1440 / image.width) * (1 / scaling_factor) * (image.width / 540);

  //     let normalizedA = compGroup.comp_bounds.map(function (x) {
  //       return x / factor;
  //     });

  //     let width = normalizedA[2] - normalizedA[0];
  //     let height = normalizedA[3] - normalizedA[1];

  //     let rect = new Konva.Rect({
  //       x: normalizedA[0],
  //       y: normalizedA[1],
  //       width: width,
  //       height: height,
  //       fill: compGroup.bg_color || '#ffffff',
  //       name: `gui_${index}_groupRect-${i}`,
  //       id: `gui_${index}_groupRect-${i}`,
  //     });

  //     let box = new Konva.Rect({
  //       x: rect.x(),
  //       y: rect.y(),
  //       width: rect.width(),
  //       height: rect.height(),
  //       stroke_ori: 'black',
  //       stroke: 'black',
  //       strokeWidth: 2,
  //       opacity: 0.3,

  //       id: `gui_${index}_group-${i}_box`,
  //       name: `gui_${index}_group-${i}_box`,
  //     });

  //     let groupGroup = new Konva.Group({
  //       // draggable: true,
  //       // x: box.x(),
  //       // y: box.y(),
  //       width: box.width(),
  //       height: box.height(),
  //       id: `gui_${index}_group-${i}`,
  //       name: `gui_${index}_group-${i}`,
  //     });

  //     // box.setAttr('editable', true);

  //     box.on('mousedown', (e) => addBoxTransitionEventListener(e, box));
  //     groupGroup.add(rect);
  //     groupGroup.add(box);

  //     group.add(groupGroup);
  //   });
  // }

  let forCondition = blank ? 10 : uiCompObjects.length;
  let forBegin = blank ? 9 : 0;

  for (let i = forBegin; i < forCondition; i++) {
    currUICompObject = uiCompObjects[i];
    comp_bounds = currUICompObject['comp_bounds'];
    comp_label = currUICompObject['comp_label'];
    let a = comp_bounds;
    let factor =
      (1440 / image.width) * (1 / scaling_factor) * (image.width / 540);
    //console.log(`DRAWER factor :  ${factor}`);
    normalizedA = a.map(function (x) {
      return x / factor;
    });
    //console.log(`From drawer arr: ${a}, normArr: ${normalizedA}`);
    let width = normalizedA[2] - normalizedA[0];
    let height = normalizedA[3] - normalizedA[1];
    let unnormWidth = a[2] - a[0];
    let unnormHeight = a[3] - a[1];

    stroke_color = component_color_mapping[comp_label] || 'black';
    stroke_color = 'blue';
    name = `gui_${index}_${i}`;
    //console.log(name);
    // Set the id we use to identify the konva ui comp group also in the data model
    uiCompObjects[i]['id'] = name;
    //currUICompObject['zIndex'] = 0;
    if (editable) {
      var compGroup = new Konva.Group({
        draggable: true,
        id: name,
        name: name,
        x: normalizedA[0],
        y: normalizedA[1],
        width: width,
        height: height,
        id: name,
        name: name,
      });
      // Get the cropped element and add it to the group
      if (!currUICompObject.is_CompoundElement) {
        let crop;
        let dblClickListener = null;
        let isComplexComp = false;
        if (currUICompObject.isGroup) {
          crop = new Konva.Rect({
            x: normalizedA[0],
            y: normalizedA[1],
            width: width,
            height: height,
            fill: currUICompObject.bg_color || '#ffffff',
            name: `gui_${index}_groupRect-${i}`,
            id: `gui_${index}_groupRect-${i}`,
          });
          compGroup.setAttr('isGroup', true);
          stroke_color = 'black';
        } else {
          crop = getCroppedComponent(
            darthNode,
            image,
            normalizedA[0],
            normalizedA[1],
            width,
            height,
            normalizedA[0] * (1 / scaling_factor) * (image.width / 540),
            normalizedA[1] * (1 / scaling_factor) * (image.width / 540),
            width * (1 / scaling_factor) * (image.width / 540),
            height * (1 / scaling_factor) * (image.width / 540),
            false
          );
        }

        if (currUICompObject.isCustom) {
          stroke_color = 'green';
          //text
          if (currUICompObject.comp_label === 'Text') {
            compGroup.setAttr('isStillCrop', true);
            compGroup.setAttr('extraInformation', {
              ...currUICompObject.extraInformation,
              width,
              height,
              idToRemove: currUICompObject['id'],
            });
            compGroup.on('dblclick', function () {
              if (this.getAttr('isStillCrop')) {
                this.setAttr('isStillCrop', false);
                createCustomLabel(
                  this.getChildren()[1],
                  addBoxTransitionEventListener,
                  createKonvaPlayer,
                  this.getAttr('extraInformation')
                );

                let idToRemove = this.getAttr(
                  'extraInformation'
                ).idToRemove.split('_');
                idToRemove = idToRemove[0] + '_' + idToRemove[1];
                let nodeToDestroy = guiNodes.find((g) => g.id === idToRemove);
                if (nodeToDestroy) {
                  let compToDestroy = nodeToDestroy.uiCompObjects.find(
                    (c) => c.id === this.getAttr('extraInformation').idToRemove
                  );
                  if (compToDestroy) {
                    let indexToDestroy = nodeToDestroy.uiCompObjects.indexOf(
                      compToDestroy
                    );
                    nodeToDestroy.uiCompObjects.splice(indexToDestroy, 1);
                  }
                  this.destroy();
                }

                createKonvaPlayer();

                return;
              }
            });
          } else if (currUICompObject.comp_label === 'Text Button') {
            compGroup.setAttr('isStillCrop', true);
            compGroup.setAttr('isCustom', true);
            compGroup.setAttr('extraInformation', {
              ...currUICompObject.extraInformation,
              width,
              height,
              idToRemove: currUICompObject['id'],
            });
            compGroup.on('dblclick', function () {
              if (this.getAttr('isStillCrop')) {
                this.setAttr('isStillCrop', false);
                createCustomButton(
                  this.getChildren()[1],
                  addBoxTransitionEventListener,
                  createKonvaPlayer,
                  this.getAttr('extraInformation')
                );

                let idToRemove = this.getAttr(
                  'extraInformation'
                ).idToRemove.split('_');
                idToRemove = idToRemove[0] + '_' + idToRemove[1];
                let nodeToDestroy = guiNodes.find((g) => g.id === idToRemove);
                if (nodeToDestroy) {
                  let compToDestroy = nodeToDestroy.uiCompObjects.find(
                    (c) => c.id === this.getAttr('extraInformation').idToRemove
                  );
                  if (compToDestroy) {
                    let indexToDestroy = nodeToDestroy.uiCompObjects.indexOf(
                      compToDestroy
                    );
                    nodeToDestroy.uiCompObjects.splice(indexToDestroy, 1);
                  }
                  this.destroy();
                }

                createKonvaPlayer();

                return;
              }
            });
            // isComplexComp = true;
          } else if (currUICompObject.comp_label === 'Input') {
            compGroup.setAttr('isStillCrop', true);
            compGroup.setAttr('extraInformation', {
              ...currUICompObject.extraInformation,
              width,
              height,
              idToRemove: currUICompObject['id'],
            });
            compGroup.on('dblclick', function () {
              if (this.getAttr('isStillCrop')) {
                this.setAttr('isStillCrop', false);
                createCustomInput(
                  this.getChildren()[1],
                  addBoxTransitionEventListener,
                  createKonvaPlayer,
                  this.getAttr('extraInformation')
                );

                let idToRemove = this.getAttr(
                  'extraInformation'
                ).idToRemove.split('_');
                idToRemove = idToRemove[0] + '_' + idToRemove[1];
                let nodeToDestroy = guiNodes.find((g) => g.id === idToRemove);
                if (nodeToDestroy) {
                  let compToDestroy = nodeToDestroy.uiCompObjects.find(
                    (c) => c.id === this.getAttr('extraInformation').idToRemove
                  );
                  if (compToDestroy) {
                    let indexToDestroy = nodeToDestroy.uiCompObjects.indexOf(
                      compToDestroy
                    );
                    nodeToDestroy.uiCompObjects.splice(indexToDestroy, 1);
                  }
                  this.destroy();
                }

                createKonvaPlayer();

                return;
              }
            });
          }
        }

        if (!isComplexComp) {
          crop.setAttr('comp_label', comp_label);
          crop.setAttr('x', 0);
          crop.setAttr('y', 0);
          crop.visible(true);
          //group.add(crop);
          // crop.moveToTop();
          crop.setAttr('name', name + '_img');
          crop.setAttr('id', name + '_img');
        } else {
          crop.forEach((c) => {
            c.setAttr('comp_label', comp_label);
            c.setAttr('x', 0);
            c.setAttr('y', 0);
            c.visible(true);
            //group.add(c);
            c.moveToTop();
            c.setAttr('name', name + '_img');
            c.setAttr('id', name + '_img');
          });
        }
        /* crop.on('mousedown', function() {
                    console.log(this.getAttr('comp_label'));
                }); */
        // Create a rectangle for the component

        var box2 = new Konva.Rect({
          x: 0, //normalizedA[0] ,
          y: 0, //normalizedA[1] ,
          width: width,
          height: height,
          stroke_ori: stroke_color,
          stroke: stroke_color,
          strokeWidth: 2,
          opacity: 0.3,
          //draggable: true,
          id: name,
          name: name,
        });

        compGroup.setAttr('editable', true);
        if (!isComplexComp) {
          compGroup.add(crop);
        } else {
          crop.forEach((c) => {
            compGroup.add(c);
          });
        }
        compGroup.add(box2);
        // if (dblClickListener) {
        //   compGroup.on('dblclick', (e) => dblClickListener(compGroup));
        // }

        compGroup.visible(blank ? false : true);
        currUICompObject['isBlank'] = blank;
        if (currUICompObject.isCustom) {
          currUICompObject['crop_group'] = compGroup.clone();
        }

        compGroup.on('dragstart', function () {
          console.log(this);
          if (!this.getAttr('isGroup')) {
            this.moveToTop();
            let dataModelCompObj = uiCompObjects.find(
              (o) => o.id === this.getAttr('id')
            );
            dataModelCompObj['zIndex'] = this.getAttr('zIndex');
            let zIndexBorder =
              uiCompObjects.filter((co) => co.isGroup).length + 2;
            uiCompObjects
              .filter((compObj) => compObj.id !== this.getAttr('id'))
              .forEach((co) => {
                if (
                  co['zIndex'] /*&& co['zIndex'] >= this.getAttr('zIndex')*/
                ) {
                  if (co['zIndex'] >= zIndexBorder) {
                    co['zIndex']--;
                  } else {
                    return false;
                  }
                }
              });
          }
        });
        // compGroup.on('dragmove', () => {
        //   // updateObjects();
        //   layer.batchDraw();
        // });
        compGroup.on('dragend', (e) => {
          var intersectionId = computeIntersections(
            e,
            stage.getPointerPosition()
          );
          if (intersectionId) {
            // We found a new guinode id to add the ui comp
            // Get the source node parent guiNode from data model and the source group

            var sourceParentNode = guiNodes.find(
              (n) => n.id == e.target.getParent().getAttr('id')
            );

            var sourceGroup = e.target.getParent();
            // Get the sink node parent guiNode from data model and the sink group
            let newIntersectionId = intersectionId;

            if (intersectionId.includes('-shadowGUI')) {
              newIntersectionId = intersectionId.replace('-shadowGUI', '');
            }

            var sinkParentNode = guiNodes.find(
              (n) => n.id == newIntersectionId
            );

            var sinkGroup = layer.findOne(`#${newIntersectionId}`);

            //console.log(`Removing : ${e.target.getAttr('id')} from group : ${sourceGroup.getAttr('id')}`);
            // Set new position of ui comp relative to new sink group parent
            e.target.setAttr(
              'x',
              e.target.absolutePosition().x - sinkGroup.x()
            );
            e.target.setAttr(
              'y',
              e.target.absolutePosition().y - sinkGroup.y()
            );
            // Add the ui comp to the new parent
            sinkGroup.add(e.target);
            // get ui comp object from source node and copy it
            var uiCompObject1 = sourceParentNode.uiCompObjects.find(
              (n) => n['id'] == e.target.getAttr('id')
            );
            var uiCompObjectIndex = sourceParentNode.uiCompObjects.indexOf(
              uiCompObject1
            );
            //console.log(`original ui comp object : ${uiCompObject1['id']}`)
            var copiedUICompObject = Object.assign({}, uiCompObject1);
            //console.log(`Copied ui comp object : ${copiedUICompObject['id']}`)
            if (!sourceParentNode['originalCompObjectsLength']) {
              sourceParentNode['originalCompObjectsLength'] =
                sourceParentNode.uiCompObjects.length;
            }
            // Remove ui comp from source node
            sourceParentNode.uiCompObjects.splice(uiCompObjectIndex, 1);
            //add indicator to source node
            if (!sourceParentNode['removedCompObjects']) {
              sourceParentNode['removedCompObjects'] = [];
            }

            //adjust index: problem is that the uiComp gets removed so the indeces are off as the array gets smaller each time
            let uiCompObjectIndexAdjusted = uiCompObjectIndex;
            let origLength = sourceParentNode['originalCompObjectsLength'];
            let deletedIndeces = sourceParentNode['removedCompObjects'];
            deletedIndeces.forEach((i) => {
              if (i <= uiCompObjectIndexAdjusted) {
                uiCompObjectIndexAdjusted++;
              }
            });
            sourceParentNode['removedCompObjects'].push(
              uiCompObjectIndexAdjusted
            );
            var nextCompId = getNextId(sinkParentNode);
            var nextCompSinkId = sinkParentNode['id'] + '_' + nextCompId;
            //console.log(`Next full id : ${nextCompSinkId}`);
            var oldTargetId = e.target.getAttr('id');
            e.target.setAttr('id', nextCompSinkId);
            e.target.children.each(function (child) {
              if (child.getAttr('id').includes('_img')) {
                child.setAttr('name', nextCompSinkId + '_img');
                child.setAttr('id', nextCompSinkId + '_img');
              } else {
                child.setAttr('name', nextCompSinkId);
                child.setAttr('id', nextCompSinkId);
              }
            });
            copiedUICompObject['id'] = nextCompSinkId;
            // set the correct position of the ui comp in the data model
            // We need to transform it back to original scale
            var newX1 = e.target.x() * factor;
            var newY1 = e.target.y() * factor;
            var newX2 = (e.target.x() + e.target.width()) * factor;
            var newY2 = (e.target.y() + e.target.height()) * factor;
            copiedUICompObject['updated_comp_bounds'] = [
              newX1,
              newY1,
              newX2,
              newY2,
            ];
            copiedUICompObject['crop_group'] = e.target.clone();

            sinkParentNode.uiCompObjects.push(copiedUICompObject);

            // Update all involved transitions
            mappings = transitions.map((t) => [t.to, t.from]);
            matches = transitions.filter(
              (t) => t.to == guiNode.id || t.from.includes(guiNode.id)
            );
            // Update or Remove all arrows from layer
            // Remove parent node connection
            matchParents = transitions.filter(
              (t) => t.from == oldTargetId && t.to == sinkParentNode['id']
            );
            var arrowNodes = matchParents.map((t) => layer.findOne(`#${t.id}`));
            for (i = 0; i < arrowNodes.length; i++) {
              arrowNodes[i].remove();
            }
            matchesIndexes = matchParents.map((m) => transitions.indexOf(m));
            while (matchesIndexes.length) {
              transitions.splice(matchesIndexes.pop(), 1);
            }
            // Update all other outgoing transitions
            for (i = 0; i < transitions.length; i++) {
              var t = transitions[i];
              if (t.from == oldTargetId) {
                transitions[i].from = nextCompSinkId;
              }
            }
            for (i = 0; i < transitions.length; i++) {
              var t = transitions[i];
              //console.log(`mTransition : ${t.from}, ${t.to}`);
            }
            createKonvaPlayer();
            updateObjects();
          } else {
            // When we stopped draggin a editable ui comp, then we obtain its new position
            //console.log(`ENDED DRAGGING group: x1: ${e.target.x()}, y1: ${e.target.y()}, x2: ${(e.target.x() + e.target.width())}, y2: ${(e.target.y() + e.target.height())}`);
            // We need to transform it back to original scale
            var newX1 = e.target.x() * factor;
            var newY1 = e.target.y() * factor;
            var newX2 = (e.target.x() + e.target.width()) * factor;
            var newY2 = (e.target.y() + e.target.height()) * factor;
            //console.log(`Reversed position : x1: ${newX1}, y1: ${newY1},, x2: ${newX2}, y2: ${newY2}`);
            var parentNode = e.target.getParent();
            //console.log(`parent id : ${parentNode.getAttr('id')}`);
            // Find the respective guiNode in the guiNode data model and find the correct ui comp in the ui comp objects
            var guiNode1 = guiNodes.find(
              (n) => n.id == parentNode.getAttr('id')
            );
            var uiCompObject1 = guiNode1.uiCompObjects.find(
              (n) => n['id'] == e.target.getAttr('id')
            );
            var uiCompObjectIndex = guiNode1.uiCompObjects.indexOf(
              uiCompObject1
            );
            // Set the new comp bounds in the data model
            //console.log(`Found the following uiCompObject: ${uiCompObject1['id']}, ${uiCompObject1['comp_bounds']}`)
            guiNode1.uiCompObjects[uiCompObjectIndex]['updated_comp_bounds'] = [
              newX1,
              newY1,
              newX2,
              newY2,
            ];
            //console.log(`Updated the following uiCompObject: ${uiCompObject1['id']}, ${uiCompObject1['comp_bounds']}`)
          }
          createKonvaPlayer();
        });

        group.add(compGroup);

        //group.add(box2);
        // box2.setZIndex(i + 1);
        // box2.moveToTop();
        box2.setAttr('editable', true);
        box2.on('mousedown', function (e) {
          //console.log(`EVENT CLICK: ${e.evt.button}`)
          //Only respond if we click the shape with left click
          if (e.evt.button == 0) {
            console.log(this.getAttr('clicked'));
            console.log(currentSelectedComp.value);
            if (this.getAttr('clicked')) {
              this.setAttr('stroke', this.getAttr('stroke_ori'));
              this.setAttr('fill', undefined);
              this.setAttr('clicked', false);
              currentSelectedComp.value = null;
            } else {
              this.setAttr('stroke', 'green');
              this.setAttr('fill', 'green');
              this.setAttr('clicked', true);
              if (currentSelectedComp.value) {
                //console.log(`CURRSEL COMP :${currentSelectedComp.value.getAttr('id').split('_')[1]}, ${this.getAttr('id').split('_')[1]}`)

                //if (currentSelectedComp.value.getParent() != this.getParent()) {
                if (
                  currentSelectedComp.value.getAttr('id').split('_')[1] !=
                  this.getAttr('id').split('_')[1]
                ) {
                  addTransitionArrow(currentSelectedComp.value, this);
                  this.setAttr('stroke', this.getAttr('stroke_ori'));
                  currentSelectedComp.value.setAttr(
                    'stroke',
                    currentSelectedComp.value.getAttr('stroke_ori')
                  );
                  currentSelectedComp.value.setAttr('fill', undefined);
                  this.setAttr('fill', undefined);
                  currentSelectedComp.value.setAttr('clicked', false);
                  currentSelectedComp.value = null;
                  this.setAttr('clicked', false);
                } else {
                  // this.setAttr('stroke', this.getAttr('stroke_ori'));
                  // this.setAttr('fill', undefined);
                  // this.setAttr('clicked', false);
                  if (currentSelectedComp.value != this) {
                    currentSelectedComp.value.setAttr(
                      'stroke',
                      currentSelectedComp.value.getAttr('stroke_ori')
                    );
                    currentSelectedComp.value.setAttr('fill', undefined);
                    currentSelectedComp.value.setAttr('clicked', false);
                  }
                  // if (currentSelectedComp.value != this) {
                  //   currentSelectedComp.value = this;
                  // } else {
                  //   currentSelectedComp.value = null;
                  // }
                  currentSelectedComp.value = this;
                }
              } else {
                currentSelectedComp.value = this;
              }
            }
            console.log(currentSelectedComp.value);
          }
          //$('#info').html(this.getAttr('name') + " | " + this.getAttr('clicked'));
        });
      }
    } else {
      var box2 = new Konva.Rect({
        x: normalizedA[0],
        y: normalizedA[1],
        width: width,
        height: height,
        stroke_ori: stroke_color,
        stroke: stroke_color,
        strokeWidth: 2,
        opacity: 0.3,
        //draggable: true,
        id: name,
        name: name,
      });
      box2.setAttr('editable', false);
      group.add(box2);
      // box2.setZIndex(i + 1);
      box2.on('mousedown', function () {
        console.log(this.getAttr('clicked'));
        console.log(currentSelectedComp.value);
        if (this.getAttr('clicked')) {
          this.setAttr('stroke', this.getAttr('stroke_ori'));
          this.setAttr('fill', undefined);
          this.setAttr('clicked', false);
          currentSelectedComp.value = null;
        } else {
          this.setAttr('stroke', 'green');
          this.setAttr('fill', 'green');
          this.setAttr('clicked', true);
          if (currentSelectedComp.value) {
            if (currentSelectedComp.value.getParent() != this.getParent()) {
              addTransitionArrow(currentSelectedComp.value, this);
              this.setAttr('stroke', this.getAttr('stroke_ori'));
              currentSelectedComp.value.setAttr(
                'stroke',
                currentSelectedComp.value.getAttr('stroke_ori')
              );
              currentSelectedComp.value.setAttr('fill', undefined);
              this.setAttr('fill', undefined);
              this.setAttr('clicked', false);
              currentSelectedComp.value = null;
            } else {
              // this.setAttr('stroke', this.getAttr('stroke_ori'));
              // this.setAttr('fill', undefined);
              if (currentSelectedComp.value != this) {
                currentSelectedComp.value.setAttr(
                  'stroke',
                  currentSelectedComp.value.getAttr('stroke_ori')
                );
                currentSelectedComp.value.setAttr('fill', undefined);
                currentSelectedComp.value.setAttr('clicked', false);
              }
              currentSelectedComp.value = this;
            }
          } else {
            currentSelectedComp.value = this;
          }
        }
        //$('#info').html(this.getAttr('name') + " | " + this.getAttr('clicked'));
      });
      //ctx.strokeRect(normalizedA[0], normalizedA[1], width, height);
    }
  }

  guiNode = {
    id: group.getAttr('id'),
    index: tempIndex,
    x: group.x(),
    y: group.y(),
    image: image,
    uiCompObjects: !blank ? uiCompObjects : [uiCompObjects[forBegin]],
    editable: editable,
    blank: blank,
    customBgColor: bgColor,
    uiCompGroups: !blank ? uiCompGroups : null,
  };

  guiNodes.push(guiNode);
  //console.log(`#GUInodes : ${guiNodes.length}`);
  group.on('dragmove', function (e) {
    if (group.x() < 0) {
      group.setAttr('x', 0);
    }
    if (group.y() < 0) {
      group.setAttr('y', 0);
    }
    if (
      group.y() + darthNode.getAttr('height') * darthNode.getAttr('scaleY') >
      stage.getAttr('height')
    ) {
      group.setAttr(
        'y',
        stage.getAttr('height') -
          darthNode.getAttr('height') * darthNode.getAttr('scaleY')
      );
    }
    if (
      group.x() + darthNode.getAttr('width') * darthNode.getAttr('scaleX') >
      stage.getAttr('width')
    ) {
      group.setAttr(
        'x',
        stage.getAttr('width') -
          darthNode.getAttr('width') * darthNode.getAttr('scaleX')
      );
    }
    guiNode.x = group.x();
    guiNode.y = group.y();
    updateObjects();
  });
  layer.batchDraw();

  //console.log(`Added GUI: [${guiNode.id},${guiNode.x},${guiNode.y}], #guis: ${guiNodes.length}`);
  layer.add(group);
  stage.add(layer);

  //Move icons to top so they are clickable (TODO find a better way)
  //console.log(`MOVING ICONS to the TOP`);
  for (i = 0; i < uiCompObjects.length; i++) {
    if (uiCompObjects[i]['comp_label'] == 'Icon') {
      //console.log(layer);
      var iconNode = layer.findOne(`#${uiCompObjects[i]['id']}`);
      //console.log(`Moving icon ${uiCompObjects[i]['id']} to top`);
      iconNode.moveToTop();
    }
  }
  updateObjects();
  layer.batchDraw();
  //Update the player
  if (guiNodes) {
    createKonvaPlayer();
  }
  //tooltipLayer.moveToTop();

  //add gui to guisLoaded
  importHelper.guisLoaded.push(tempIndex);
}

function getUICompObjects(
  jsonDataCombined,
  jsonDataSemantic,
  jsonDataCombinedExtended
) {
  //console.log(jsonData);
  // Comp bounds
  //comp_bounds = JSONPath({path:'$..bounds', json: jsonDataSemantic});
  // Comp labels
  //comp_labels = JSONPath({path:'$..componentLabel', json: jsonDataSemantic});
  //console.log(`LENGTH OF BOUNDS ${ comp_bounds.slice(1).length}, length label : ${comp_labels.length}`)
  //
  /* comp_resource_ids = JSONPath({path:'$..resource-id', json: jsonDataSemantic});
      console.log(`LENGTH OF resource-ids : ${comp_resource_ids.length}`);
      for(i=0; i < comp_resource_ids.length; i++) {
          res_parents = JSONPath({path:'$..resource-id[""]', json: jsonDataSemantic});
      } */
  //comp_objects = JSONPath({path:'$..componentLabel^', json: jsonData});
  //console.log(`comp objects : ${comp_objects}`);
  //mapped_comp_objects = comp_objects.map(comp => comp['componentLabel']);
  //console.log(`UI components : ${mapped_comp_objects}`);
  /* comp_bounds.slice(1)
      console.log(`COMPUTING THE UI COMPONENTS`);
      for(i=0; i < comp_labels.length; i++) {
          console.log(`Adding new uicompobject: complabel: ${comp_labels[i]}, compbounds:${comp_bounds[i]}`)
          uiCompObjects.push({
              "comp_label": comp_labels[i],
              "comp_bounds": comp_bounds[i],
          });
      }
      return uiCompObjects; */
  uiCompObjects = [];
  compLabelParents = JSONPath({
    path: '$..componentLabel^',
    json: jsonDataSemantic,
  });
  if (jsonDataCombinedExtended) {
    compLabelParents = jsonDataCombinedExtended['ui_comps'];
    let uiCompGroups = getUICompGroups(jsonDataCombinedExtended);
    uiCompGroups.forEach((g) => {
      // console.log(g);
      uiCompObjects.push(g);
    });
  }
  //console.log(`LENGTH OF compLabelParents : ${compLabelParents.length}`);
  for (i = 0; i < compLabelParents.length; i++) {
    currCompLabelParent = compLabelParents[i];
    //console.log(`Adding new uicompobject: complabel: ${currCompLabelParent['componentLabel']}, compbounds:${currCompLabelParent['bounds']}`);
    var hasChildren = Boolean(currCompLabelParent['children']);
    var isBackgroundImage =
      currCompLabelParent['componentLabel'] === 'Background Image';
    var isCompoundElement = hasChildren || isBackgroundImage;
    var extraInformation = {};
    let isCustom = false;
    if (currCompLabelParent['componentLabel'] === 'Text') {
      extraInformation = {
        text: currCompLabelParent.text,
        textColor: currCompLabelParent.text_color,
        fontSize: currCompLabelParent.font_size,
      };
      isCustom = true;
    } else if (currCompLabelParent['componentLabel'] === 'Text Button') {
      extraInformation = {
        text: currCompLabelParent.text,
        textColor: currCompLabelParent.text_color,
        fontSize: currCompLabelParent.font_size,
        buttonColor: currCompLabelParent.bg_color,
      };
      isCustom = true;
    } else if (
      currCompLabelParent['componentLabel'] === 'Input' &&
      currCompLabelParent['class'].includes('Text')
    ) {
      //input
      extraInformation = {
        text: currCompLabelParent.text_updated,
        textColor: currCompLabelParent.text_color,
        fontSize: currCompLabelParent.font_size,
        inputColor: currCompLabelParent.bg_color,
      };
      isCustom = true;
    }
    /* console.log(`Has CHILDREN : ${hasChildren}`);
          console.log(`is BCKIMAGE : ${isBackgroundImage}`);
          console.log(`is COMPDELEM : ${isCompoundElement}`); */
    uiCompObjects.push({
      comp_label: currCompLabelParent['componentLabel'],
      comp_bounds: currCompLabelParent['bounds'],
      updated_comp_bounds: currCompLabelParent['bounds'],
      has_children: Boolean(hasChildren),
      is_CompoundElement: isCompoundElement,
      plain_json: currCompLabelParent,
      crop_group: undefined,
      extraInformation,
      isCustom,
      // zIndex: 4,
    });
  }
  return uiCompObjects;
}

function getUICompGroups(jsonDataCombinedExtended = null) {
  if (!jsonDataCombinedExtended) return null;
  let uiCompGroups = [];
  const groupsJson = jsonDataCombinedExtended['ui_comp_groups'];
  groupsJson.forEach((group, i) => {
    uiCompGroups.push({
      comp_label: group['componentLabel'],
      comp_bounds: group['bounds'],
      updated_comp_bounds: group['bounds'],
      bg_color: group['bg_color'],
      isGroup: true,
      crop_group: undefined,
      has_children: false,
      is_CompoundElement: false,
      // zIndex: 1,
    });
  });
  // console.log(uiCompGroups);
  return uiCompGroups;
}

function createKonvaPlayer() {
  // KonvaGUIEditor
  //var width = window.innerWidth;
  //var height = window.innerHeight;

  var width = 540;
  var height = 960;
  var scalingPlayer = 1.6;

  var stagePlay = new Konva.Stage({
    container: 'container-konva-player',
    width: width,
    height: height,
  });

  var layerPlay = new Konva.Layer();

  for (j = 0; j < guiNodes.length; j++) {
    guiNode = guiNodes[j];
    var groupPlay = new Konva.Group({
      name: guiNode.id,
      id: guiNode.id,
    });

    // add cursor styling
    //groupPlay.on('mouseover', function () {
    //   document.body.style.cursor = 'pointer';
    //});
    // groupPlay.on('mouseout', function () {
    // document.body.style.cursor = 'default';
    //});

    scaling_factor = 0.5;

    var imgNodePlay = new Konva.Image({
      x: 0,
      y: 0,
      image: guiNode.image,
      //scaleX: scaling_factor * (540/guiNode.image.width) * scalingPlayer,
      //scaleY: scaling_factor * (540/guiNode.image.width) * scalingPlayer,
      width:
        guiNode.image.width *
        scaling_factor *
        (540 / guiNode.image.width) *
        scalingPlayer,
      height:
        guiNode.image.height *
        scaling_factor *
        (540 / guiNode.image.width) *
        scalingPlayer,
      //scaleX: scaling_factor * (540/image.width),
      //scaleY: scaling_factor * (540/image.width),
      id: guiNode.id + '_img',
      name: guiNode.id + '_img',
    });

    var realWidth =
      imgNodePlay.getAttr('width') * imgNodePlay.getAttr('scaleX');
    var realHeight =
      imgNodePlay.getAttr('height') * imgNodePlay.getAttr('scaleY');

    $('#container-konva-player').width(realWidth).height(realHeight);

    if (guiNode.editable) {
      // First add the background replacing rectangle
      var detectedColor = colorThief.getColor(guiNode.image);
      //console.log(`DETECTED COLOR : ${detectedColor}`);
      var detextedHexColor = rgbToHex(
        detectedColor[0],
        detectedColor[1],
        detectedColor[2]
      );
      //console.log(`DETECTED HEXCOLOR : ${detextedHexColor}`);
      var backRect1 = new Konva.Rect({
        x: imgNodePlay.x(),
        y: imgNodePlay.y(),
        width: imgNodePlay.width(),
        height: imgNodePlay.height(),
        stroke_ori: '#394046',
        stroke: '#394046',
        strokeWidth: 2,
        fill: !guiNode.blank ? detextedHexColor : '#ffffff',
        opacity: 1,
        //draggable: true,
        id: guiNode.id + '_back_rec',
        name: guiNode.id + '_back_rec',
      });
      if (guiNode.customBgColor && !guiNode.blank) {
        backRect1.setAttr('fill', guiNode.customBgColor);
      }
      groupPlay.add(backRect1);

      // Second include the action bar
      let factor =
        (1440 / guiNode.image.width) *
        (1 / scaling_factor) *
        (guiNode.image.width / 540) *
        (1 / scalingPlayer);
      var abarloc = [0, 0, 1440, 84].map(function (x) {
        return x / factor;
      });
      var abarwidth = abarloc[2] - abarloc[0];
      var abarheight = abarloc[3] - abarloc[1];
      var croppedActionBar = getCroppedComponent(
        imgNodePlay,
        guiNode.image,
        abarloc[0],
        abarloc[1],
        abarwidth,
        abarheight,
        abarloc[0] *
          (1 / scaling_factor) *
          (guiNode.image.width / 540) *
          (1 / scalingPlayer),
        abarloc[1] *
          (1 / scaling_factor) *
          (guiNode.image.width / 540) *
          (1 / scalingPlayer),
        abarwidth *
          (1 / scaling_factor) *
          (guiNode.image.width / 540) *
          (1 / scalingPlayer),
        abarheight *
          (1 / scaling_factor) *
          (guiNode.image.width / 540) *
          (1 / scalingPlayer),
        false
      );

      croppedActionBar.setAttr('comp_label', 'action_bar');
      croppedActionBar.setAttr('name', guiNode.id + '_action_bar');
      croppedActionBar.setAttr('id', guiNode.id + '_action_bar');
      groupPlay.add(croppedActionBar);
      croppedActionBar.moveToTop();
      croppedActionBar.on('mousedown', function () {
        //console.log(this.getAttr('comp_label'));
      });
      // Third include the menu bar
      var menuloc = [0, 2393, 1440, 2560].map(function (x) {
        return x / factor;
      });
      var menuwidth = menuloc[2] - menuloc[0];
      var menuheight = menuloc[3] - menuloc[1];
      var cropppedMenu = getCroppedComponent(
        imgNodePlay,
        guiNode.image,
        menuloc[0],
        menuloc[1],
        menuwidth,
        menuheight,
        menuloc[0] *
          (1 / scaling_factor) *
          (guiNode.image.width / 540) *
          (1 / scalingPlayer),
        menuloc[1] *
          (1 / scaling_factor) *
          (guiNode.image.width / 540) *
          (1 / scalingPlayer),
        menuwidth *
          (1 / scaling_factor) *
          (guiNode.image.width / 540) *
          (1 / scalingPlayer),
        menuheight *
          (1 / scaling_factor) *
          (guiNode.image.width / 540) *
          (1 / scalingPlayer),
        false
      );

      cropppedMenu.setAttr('comp_label', 'menu');
      cropppedMenu.setAttr('name', guiNode.id + '_menu');
      cropppedMenu.setAttr('id', guiNode.id + '_menu');
      groupPlay.add(cropppedMenu);
      //cropppedMenu.moveToBottom();
      //cropppedMenu.moveToTop();
      /* cropppedMenu.on('mousedown', function() {
                          console.log(this.getAttr('comp_label'));
                      }); */
      imgNodePlay.visible(false);
      groupPlay.add(imgNodePlay);
    } else {
      groupPlay.add(imgNodePlay);
      imgNodePlay.setZIndex(0);
    }

    /*   groupPlay.add(imgNodePlay);
          imgNodePlay.setZIndex(0); */

    //layer.batchDraw();
    // add cursor styling
    /* imgNodePlay.on('mouseover', function () {
                  document.body.style.cursor = 'pointer';
          });
          imgNodePlay.on('mouseout', function () {
                  document.body.style.cursor = 'default'
          }); */

    // if (guiNode.uiCompGroups) {
    //   guiNode.uiCompGroups.forEach((compGroup) => {
    //     let factor =
    //       (1440 / guiNode.image.width) *
    //       (1 / scaling_factor) *
    //       (guiNode.image.width / 540) *
    //       (1 / scalingPlayer);

    //     let normalizedA = compGroup.comp_bounds.map(function (x) {
    //       return x / factor;
    //     });

    //     let width = normalizedA[2] - normalizedA[0];
    //     let height = normalizedA[3] - normalizedA[1];

    //     let rect = new Konva.Rect({
    //       x: normalizedA[0],
    //       y: normalizedA[1],
    //       width: width,
    //       height: height,
    //       fill: compGroup.bg_color || '#ffffff',
    //     });

    //     groupPlay.add(rect);
    //   });
    //}

    for (let i = 0; i < guiNode.uiCompObjects.length; i++) {
      currUICompObject = guiNode.uiCompObjects[i];
      if (currUICompObject.isBlank) continue;
      comp_bounds = currUICompObject['comp_bounds'];
      comp_label = currUICompObject['comp_label'];
      let a = comp_bounds;
      let factor =
        (1440 / guiNode.image.width) *
        (1 / scaling_factor) *
        (guiNode.image.width / 540) *
        (1 / scalingPlayer);
      //console.log(`DRAWER factor :  ${factor}`);
      normalizedA = a.map(function (x) {
        return x / factor;
      });
      //console.log(`From drawer arr: ${a}, normArr: ${normalizedA}`);
      let width = normalizedA[2] - normalizedA[0];
      let height = normalizedA[3] - normalizedA[1];

      if (showUICinPreview.value) {
        stroke_color = component_color_mapping[comp_label] || 'black';
        stroke_color = 'blue';
      } else {
        stroke_color = undefined;
      }
      var name = currUICompObject.id;
      if (guiNode.editable) {
        var name = currUICompObject.id;
        //console.log(`PRINTING CURR ID : ${name}`);
        // Get the cropped element and add it to the group
        if (!currUICompObject.is_CompoundElement) {
          if (!currUICompObject['crop_group']) {
            if (currUICompObject.isGroup) {
              stroke_color = 'black';
            } else if (currUICompObject.isCustom) {
              stroke_color = 'green';
            }
            var crop =
              !currUICompObject.isGroup && !guiNode.isBlank
                ? getCroppedComponent(
                    imgNodePlay,
                    guiNode.image,
                    normalizedA[0],
                    normalizedA[1],
                    width,
                    height,
                    normalizedA[0] *
                      (1 / scaling_factor) *
                      (guiNode.image.width / 540) *
                      (1 / scalingPlayer),
                    normalizedA[1] *
                      (1 / scaling_factor) *
                      (guiNode.image.width / 540) *
                      (1 / scalingPlayer),
                    width *
                      (1 / scaling_factor) *
                      (guiNode.image.width / 540) *
                      (1 / scalingPlayer),
                    height *
                      (1 / scaling_factor) *
                      (guiNode.image.width / 540) *
                      (1 / scalingPlayer),
                    false
                  )
                : new Konva.Rect({
                    x: normalizedA[0],
                    y: normalizedA[1],
                    width: width,
                    height: height,
                    fill: currUICompObject.bg_color || '#ffffff',
                  });
            crop.setAttr('comp_label', comp_label);
            crop.setAttr('x', 0);
            crop.setAttr('y', 0);
            crop.visible(true);
            //group.add(crop);

            /* crop.on('mousedown', function() {
                              console.log(this.getAttr('comp_label'));
                          }); */
            // Create a rectangle for the component

            var box2Play = new Konva.Rect({
              x: 0, //normalizedA[0] ,
              y: 0, //normalizedA[1] ,
              width: width,
              height: height,
              stroke_ori: stroke_color,
              stroke: stroke_color,
              strokeWidth: 2,
              opacity: 0.3,
              //draggable: true,
              id: name,
              name: name,
            });

            //Use the updated comp positions to change the group position
            updated_comp_bounds = currUICompObject['updated_comp_bounds'];
            let a1 = updated_comp_bounds;
            let factor =
              (1440 / guiNode.image.width) *
              (1 / scaling_factor) *
              (guiNode.image.width / 540) *
              (1 / scalingPlayer);
            //console.log(`DRAWER factor :  ${factor}`);
            normalizedA1 = a1.map(function (x) {
              return x / factor;
            });
            //console.log(`From drawer arr: ${a}, normArr: ${normalizedA1}`);
            let width1 = normalizedA1[2] - normalizedA1[0];
            let height1 = normalizedA1[3] - normalizedA1[1];

            var compGroup = new Konva.Group({
              //draggable: true,
              id: name,
              name: name,
              x: normalizedA1[0],
              y: normalizedA1[1],
              width: width1,
              height: height1,
              id: name,
              name: name,
            });
            compGroup.setAttr('editable', true);
            //set correct id for text
            // if (comp_label === 'CustomLabel') {
            //   let cropId = crop.getAttr('id');
            //   crop.setAttr('id', cropId + '_text');
            //   crop.setAttr('name', cropId + '_text');
            // }
            // console.log('%c crop', 'background-color: green; padding: 4rem;');
            // console.log(crop);
            // if (crop && crop.getClassName() === 'Text') {
            //   let fontsize = crop.getAttr('fontSize');

            //   crop.setAttr('fontSize', fontsize * 1.25);
            // }
            compGroup.add(crop);
            compGroup.add(box2Play);
            groupPlay.add(compGroup);

            // if (currUICompObject.isGroup) {
            //   crop.moveToBottom();
            //   console.log('MOVE TO BOTTOM!!!');
            // } else {
            //   crop.moveToTop();
            // }

            // if (currUICompObject.isGroup) {
            //   //compGroup.moveToBottom();
            // } else {
            //   compGroup.moveToTop();
            // }

            // box2Play.setZIndex(i + 1);
            // if (currUICompObject.isGroup) {
            //   box2Play.moveToBottom();
            // } else {
            //   box2Play.moveToTop();
            // }
          } else {
            //Use the updated comp positions to change the group position
            updated_comp_bounds = currUICompObject['updated_comp_bounds'];
            let a1 = updated_comp_bounds;
            let factor =
              (1440 / guiNode.image.width) *
              (1 / scaling_factor) *
              (guiNode.image.width / 540) *
              (1 / scalingPlayer);
            //console.log(`DRAWER factor :  ${factor}`);
            normalizedA1 = a1.map(function (x) {
              return x / factor;
            });
            //console.log(`From drawer arr: ${a}, normArr: ${normalizedA1}`);
            let width1 = normalizedA1[2] - normalizedA1[0];
            let height1 = normalizedA1[3] - normalizedA1[1];

            compGroup = currUICompObject['crop_group'];
            compGroup.setAttr('x', normalizedA1[0]);
            compGroup.setAttr('y', normalizedA1[1]);
            compGroup.setAttr('width', width1);
            compGroup.setAttr('height', height1);
            //console.log(`KONVA FOUND ID ${compGroup}`)
            //console.log(`KONVA id of img : #${compGroup.getAttr('id')}_img`);
            compGroup.children.each(function (child) {
              //console.log(`child of compgroup : ${child.getAttr('id')}`)
            });
            crop = compGroup.find(`#${compGroup.getAttr('id') + '_img'}`);
            // if (comp_label === 'CustomLabel') {
            //   crop = compGroup.findOne(`#${compGroup.getAttr('id')} + '_text'`);
            //   console.log('customlabel');
            //   console.log(crop);
            // }

            for (c in crop) {
              let tempCrop = crop[c];
              if (typeof tempCrop == 'number' || typeof tempCrop == 'function')
                continue;

              if (tempCrop && tempCrop.getClassName() === 'Text') {
                if (!tempCrop.getAttr('alreadyScaled')) {
                  let fontsize = tempCrop.getAttr('fontSize');
                  tempCrop.setAttr('fontSize', fontsize * Math.pow(1.25, 2));
                  tempCrop.setAttr('alreadyScaled', true);
                }
              }
              if (tempCrop && tempCrop.getAttr('isTriangle')) {
                tempCrop.x(width1 - tempCrop.width() / 2);
                tempCrop.y(height1 - tempCrop.height() / 2);
                if (!tempCrop.getAttr('alreadyScaled')) {
                  let sX = tempCrop.scaleX() * 0.7;
                  let sY = tempCrop.scaleY() * 0.7;

                  tempCrop.scaleX(sX);
                  tempCrop.scaleY(sY);

                  tempCrop.setAttr('alreadyScaled', true);
                }
              }

              if (tempCrop && tempCrop.getClassName() === 'Circle') {
                tempCrop.x(width1 - tempCrop.width() / 2);
                tempCrop.y(height1 - tempCrop.height() / 2);
              }
              tempCrop.setAttr('width', width1);
              tempCrop.setAttr('height', height1);
            }
            box2Play = compGroup.findOne(`#${compGroup.getAttr('id')}`);
            box2Play.setAttr('width', width1);
            box2Play.setAttr('height', height1);
            compGroup.setAttr('draggable', false);
            compGroup.off('dragmove');
            compGroup.off('dragstart');
            compGroup.off('dragend');
            groupPlay.add(compGroup);
            // box2Play.setZIndex(i + 1);
            // if (currUICompObject.isGroup) {
            //   //compGroup.moveToBottom();
            // } else {
            //   compGroup.moveToTop();
            // }
            box2Play.off('mousedown');
            box2Play.setAttr('fill', undefined);
          }

          for (let t of transitions) {
            //console.log(`Iterating follwoing transition : ${t.id}, ${t.from}, ${t.to}, ${box2Play.getAttr('id')}`);
            if (t.from == box2Play.getAttr('id')) {
              //console.log(`Found matching transition : ${t.id},${t.from},${box2Play.getAttr('id')}`);
              box2Play.setAttr('fill', 'green');
              box2Play.setAttr('opacity', 0.2);
              box2Play.on('mousedown', function () {
                this.getParent().getParent().moveToBottom();
                var nextNode = layerPlay.findOne(`#${t.to}`);
                nextNode.moveToTop();
                guiStack.push(this.getParent().getParent().getAttr('id'));
                //console.log(`Current GUI Stack : ${guiStack}`);
                if (guiStack) {
                  var nodeBackButton = layerPlay.findOne(
                    `#${nextNode.getAttr('id')}_back_btn`
                  );

                  nodeBackButton.setAttr('fill', 'green');
                  nodeBackButton.setAttr('stroke', 'white');
                  nodeBackButton.setAttr('strokeWidth', 2);
                  nodeBackButton.setAttr('opacity', 0.3);

                  nodeBackButton.on('mouseover', function () {
                    document.body.style.cursor = 'pointer';
                  });
                  nodeBackButton.on('mouseout', function () {
                    document.body.style.cursor = 'default';
                  });
                }
                layerPlay.draw();
              });
              box2Play.on('mouseover', function () {
                document.body.style.cursor = 'pointer';
              });
              box2Play.on('mouseout', function () {
                document.body.style.cursor = 'default';
              });
            }
          }
        }
        /* addBackButton(layerPlay, groupPlay, guiNode, scaling_factor, scalingPlayer);
              layerPlay.add(groupPlay);
              console.log(`HFROM 1`) */
      } else {
        if (showUICinPreview.value) {
          stroke_color = component_color_mapping[comp_label] || 'black';
        } else {
          stroke_color = undefined;
        }
        name = `${guiNode.id}_${i}`;
        //console.log(name);
        var box2Play = new Konva.Rect({
          x: normalizedA[0],
          y: normalizedA[1],
          width: width,
          height: height,
          stroke_ori: stroke_color,
          stroke: stroke_color,
          strokeWidth: 2,
          opacity: 0.2,
          //draggable: true,
          id: name,
          name: name,
        });
        groupPlay.add(box2Play);
        // box2Play.setZIndex(i + 1);
        //console.log(`TRANSITIONS : ${transitions.length}`)
        for (let t of transitions) {
          if (t.from == box2Play.getAttr('id')) {
            //console.log(`Found matching transition : ${t.id},${t.from},${box2Play.getAttr('id')}`);
            box2Play.setAttr('fill', 'green');
            box2Play.on('mousedown', function () {
              this.getParent().moveToBottom();
              var nextNode = layerPlay.findOne(`#${t.to}`);
              nextNode.moveToTop();
              guiStack.push(this.getParent().getAttr('id'));
              //console.log(`Current GUI Stack : ${guiStack}`);
              if (guiStack) {
                var nodeBackButton = layerPlay.findOne(
                  `#${nextNode.getAttr('id')}_back_btn`
                );
                nodeBackButton.setAttr('fill', 'green');
                nodeBackButton.setAttr('stroke', 'white');
                nodeBackButton.setAttr('strokeWidth', 2);
                nodeBackButton.setAttr('opacity', 0.2);
                nodeBackButton.on('mouseover', function () {
                  document.body.style.cursor = 'pointer';
                });
                nodeBackButton.on('mouseout', function () {
                  document.body.style.cursor = 'default';
                });
              }
              layerPlay.draw();
            });
            box2Play.on('mouseover', function () {
              document.body.style.cursor = 'pointer';
            });
            box2Play.on('mouseout', function () {
              document.body.style.cursor = 'default';
            });
          }
        }
      }
    }
    addBackButton(layerPlay, groupPlay, guiNode, scaling_factor, scalingPlayer);
    layerPlay.add(groupPlay);
    //console.log(`HFROM 2 :${guiNode.id}`)
    //console.log(`MOVINGKONVA ICONS to the TOP`);
    layerPlay.children.each(function (child) {
      //console.log(`CHILDKONVA : ${child.getAttr('id')}`);
    });
    for (i = 0; i < guiNode.uiCompObjects.length; i++) {
      if (!guiNode.uiCompObjects[i]['isGroup']) {
        var notGroupNode = groupPlay.findOne(
          `#${guiNode.uiCompObjects[i]['id']}`
        );
        if (notGroupNode) {
          let zi = guiNode.uiCompObjects[i]['zIndex'];
          if (zi) {
            notGroupNode.setAttr('zIndex', zi);
          }
          //notGroupNode.moveToTop();
          console.log(notGroupNode.getAttr('zIndex'));
        }
      }
    }
    for (i = 0; i < guiNode.uiCompObjects.length; i++) {
      //console.log(`CHECKINGKONVA ICONS to the TOP : ${guiNode.uiCompObjects[i]['id']}`);
      if (guiNode.uiCompObjects[i]['comp_label'] == 'Icon') {
        //console.log(guiNode.uiCompObjects[i]['id']);
        //console.log(groupPlay);
        var iconNode = groupPlay.findOne(`#${guiNode.uiCompObjects[i]['id']}`);
        //console.log(`Moving icon ${guiNode.uiCompObjects[i]['id']} to top`);
        if (iconNode) iconNode.moveToTop();
      }
    }
  }

  startGuiNodeID = computeStartNode();
  var startNode = layerPlay.findOne(`#${startGuiNodeID}`);
  if (startNode) {
    startNode.moveToTop();
  }

  stagePlay.add(layerPlay);
  layerPlay.batchDraw();
}

function getCroppedComponent(
  darthNode,
  image,
  x1,
  y1,
  width1,
  height1,
  x2,
  y2,
  width2,
  height2,
  draggable
) {
  var imgNodeClone = darthNode.clone();
  imgNodeClone.setAttr('draggable', draggable);
  //group.add(imgNodeClone);
  //imgNodeClone.moveToTop();
  // set crop

  imgNodeClone.setAttr('x', x1);
  imgNodeClone.setAttr('y', y1);
  imgNodeClone.setAttr('width', width1);
  imgNodeClone.setAttr('height', height1);

  var crop = imgNodeClone.crop({
    x: x2,
    y: y2,
    width: width2, //* (1/imgNodeClone.getAttr('scaleX')), //unnormWidth * scaling_factor * (image.width/540), //width * (1/imgNodeClone.getAttr('scaleX')),
    height: height2, ///* (1/imgNodeClone.getAttr('scaleY')),//unnormHeight * scaling_factor * (image.width/540), //height * (1/imgNodeClone.getAttr('scaleY')),
  });

  /* console.log(`IMAGE PROB ori image : w: ${image.width}, h: ${image.height}`);
              console.log(`IMAGE PROB darth image : w: ${darthNode.getAttr('width')}, h: ${darthNode.getAttr('height')}`);
              console.log(`IMAGE PROB clone image : w: ${imgNodeClone.getAttr('width')}, h: ${imgNodeClone.getAttr('height')}`);
              console.log(`IMAGE PROB clone image : w: ${imgNodeClone.getAttr('width')}, h: ${imgNodeClone.getAttr('height')}`); */

  /* crop.setAttr('x', normalizedA[0]);
              crop.setAttr('y', normalizedA[1]);
              crop.setAttr('width', width * (1/imgNodeClone.getAttr('scaleX')))
              crop.setAttr('height', height * (1/imgNodeClone.getAttr('scaleY'))) */
  return crop;
}

function updateObjects() {
  //console.log('Updated objects');
  //console.log(`Update objects: #Transitions : ${transitions.length}`)
  transitions.forEach((transition) => {
    var transArrow = layer.findOne(`#${transition.id}`);
    var fromNode = layer.findOne(`#${transition.from}`);
    var toNode = layer.findOne(`#${transition.to}`);
    //console.log(`arrID:${transArrow.getAttr('id')}, fromID:${fromNode.getAttr('id')}, toID:${toNode.getAttr('id')}`);
    points = getArrowPoints2(fromNode, toNode);
    transArrow.setPoints(points);
    transArrow.moveToTop();
  });
  layer.batchDraw();
}

function addBackButton(
  layerPlay,
  groupPlay,
  guiNode,
  scaling_factor,
  scalingPlayer
) {
  let a = [130, 2395, 520, 2567];
  let factor =
    (1440 / guiNode.image.width) *
    (1 / scaling_factor) *
    (guiNode.image.width / 540) *
    (1 / scalingPlayer);
  //console.log(`DRAWER factor :  ${factor}`);
  normalizedA = a.map(function (x) {
    return x / factor;
  });
  //console.log(`From drawer arr: ${a}, normArr: ${normalizedA}`);
  let width = normalizedA[2] - normalizedA[0];
  let height = normalizedA[3] - normalizedA[1];

  if (showUICinPreview.value) {
    stroke_color = 'white';
  } else {
    stroke_color = undefined;
  }
  name = `${guiNode.id}_back_btn`;
  //console.log(name);
  var backButton = new Konva.Rect({
    x: normalizedA[0],
    y: normalizedA[1],
    width: width,
    height: height,
    //stroke_ori: stroke_color,
    //stroke: stroke_color,
    //strokeWidth: 2,
    opacity: 0.05,
    //draggable: true,
    id: name,
    name: name,
  });
  groupPlay.add(backButton);
  //backButton.setZIndex(1);
  backButton.on('mouseover', function () {
    document.body.style.cursor = 'pointer';
  });
  backButton.on('mouseout', function () {
    document.body.style.cursor = 'default';
  });

  //backButton.setAttr('fill', 'green');
  backButton.on('mousedown', function () {
    this.getParent().moveToBottom();
    var lastGuiID = guiStack.pop();
    if (lastGuiID) {
      var lastNode = layerPlay.findOne(`#${lastGuiID}`);
      lastNode.moveToTop();
      layerPlay.draw();
    }
  });
}

function computeStartNode() {
  if (!jQuery.isEmptyObject(userSetStartNodeId)) {
    return userSetStartNodeId.id;
  } else {
    toGuiNodes = transitions.map((t) => t.to);
    //console.log(`ALL toIDS : ${toGuiNodes}`);
    allGuiNodes = guiNodes.map((n) => n.id);
    //console.log(`All GUI Nodes : ${allGuiNodes}`);
    startGuiNodes = allGuiNodes.filter((e) => !toGuiNodes.includes(e));
    //console.log(`Start gui nodes : ${startGuiNodes}`);
    if (startGuiNodes.length == 0) {
      return allGuiNodes[0];
    } else {
      fromGuiNodes = transitions.map(
        (t) => t.from.split('_')[0] + '_' + t.from.split('_')[1]
      );
      //console.log(`Multiple nodes with no incom. trans are available 1) ${fromGuiNodes}`);

      //console.log(`new guinodes: ${fromGuiNodes}, Counter : ${modeI(fromGuiNodes)}`);
      return modeI(fromGuiNodes);
    }
  }
  /*  if (startGuiNodes.length != 0) {
        return startGuiNodes[0];
    } else {
        /* fromGuiNodes = transitions.map(t => t.from).
                    map(s => (s.split('_'))).map(s => (s[0] + '_' + s[1]));
        console.log(`ALL FROM NODES IDS : ${fromGuiNodes}`);
        startNode = fromGuiNodes[Math.floor(Math.random() * fromGuiNodes.length)];
        console.log(`Picking random element from candidates: ${startNode}`); 
        return startNode;
        console.log(`Picking first element from candidates: ${allGuiNodes[0]}`); 
        return allGuiNodes[0];
    } */
}

function removeAllTransitionsForGUINode(guiNode) {
  //console.log(`GUI remove trans guinode id : ${guiNode.id}`);
  mappings = transitions.map((t) => [t.to, t.from]);
  matches = transitions.filter(
    (t) => t.to == guiNode.id || t.from.includes(guiNode.id)
  );
  // Remove all arrows from layer
  var arrowNodes = matches.map((t) => layer.findOne(`#${t.id}`));
  for (i = 0; i < arrowNodes.length; i++) {
    arrowNodes[i].remove();
  }
  matchesIndexes = matches.map((m) => transitions.indexOf(m));
  while (matchesIndexes.length) {
    transitions.splice(matchesIndexes.pop(), 1);
  }
  //console.log(`Remaining transitions : ${transitions.length}`);

  layer.batchDraw();
}

function removeUIComponent(uiComponent, isParent = false) {
  // UIcomponent is the clickable rectangle, we first obtain the group parent

  var uiCompParent = uiComponent.getParent();
  if (isParent) {
    uiCompParent = uiComponent;
  }
  var splitIds = uiCompParent.getAttr('id').split('_');
  var guiNodeId = splitIds[0] + '_' + splitIds[1];
  //console.log(`Remove ui component id : ${uiCompParent.getAttr('id')}, guiNodeId : ${guiNodeId}`);
  //Find guiNode and remove the ui component from the data model
  var guiNode = guiNodes.find((n) => n.id == guiNodeId);
  //console.log(`UI Comp removal uiCompObjects length before : ${guiNode.uiCompObjects.length}`)
  var uiCompObject = guiNode.uiCompObjects.find(
    (n) => n['id'] == uiCompParent.getAttr('id')
  );
  var uiCompObjectIndex = guiNode.uiCompObjects.indexOf(uiCompObject);
  guiNode.uiCompObjects.splice(uiCompObjectIndex, 1);
  //console.log(`UI Comp removal uiCompObjects length after : ${guiNode.uiCompObjects.length}`)
  // Find all outgoing transitions of the ui component and remove them in konva and in the model

  /*  mappings = transitions.map(t => [t.to, t.from])        
     matches = transitions.filter(t => (t.to == guiNode.id || t.from.includes(guiNode.id)));
     // Remove all arrows from layer
     var arrowNodes = matches.map(t => layer.findOne(`#${t.id}`));
     for(i=0; i < arrowNodes.length; i++) {
         arrowNodes[i].remove();
     }
     matchesIndexes = matches.map(m => transitions.indexOf(m));
     while(matchesIndexes.length) {
         transitions.splice(matchesIndexes.pop(), 1);
     }
     console.log(`Remaining transitions : ${transitions.length}`);
     
     layer.batchDraw(); */
  matches = transitions.filter((t) => t.from == uiCompParent.getAttr('id'));
  //console.log(`UI comp removal found ${matches.length} transitions to be removed`);
  var arrowNodes = matches.map((t) => layer.findOne(`#${t.id}`));
  for (i = 0; i < arrowNodes.length; i++) {
    arrowNodes[i].remove();
  }
  matchesIndexes = matches.map((m) => transitions.indexOf(m));
  while (matchesIndexes.length) {
    transitions.splice(matchesIndexes.pop(), 1);
  }
  // Remove from Konva

  uiCompParent.remove();
  currentShape = null;
  currentSelectedComp.value = null;
  layer.batchDraw();
}

function removeUiCompObjectWithId(id) {
  let uiCompObj = layer.findOne(`#${id}_img`);

  removeUIComponent(uiCompObj, false);
}

function deleteGuiNode(currentShape, isParent = false, guiNodeId = '') {
  let id = isParent ? guiNodeId : currentShape.getParent().getAttr('id');

  guiNode = guiNodes.find((n) => n.id == id);

  // console.log('currentShape and then guiNode');
  // console.log(currentShape.getParent());
  // console.log(guiNode);
  // console.log(`Removed GUINode with ID : ${guiNode.id}`);
  //delete the shadow gui
  let shadowGuis = layer.find(`#${id}-shadowGUI`);

  guiNodeIndex = guiNodes.indexOf(guiNode);
  guiNodes.splice(guiNodeIndex, 1);
  if (isParent) {
    currentShape.remove();
  } else {
    currentShape.getParent().remove();
  }
  removeAllTransitionsForGUINode(guiNode);
  currentShape = null;

  // shadowGui.destroy();
  let shadowGuisLength = shadowGuis.length;
  for (let i = shadowGuisLength - 1; i >= 0; i--) {
    shadowGuis[i].destroy();
  }
  //Update the player
  if (guiNodes) {
    createKonvaPlayer();
  }
  currentSelectedComp.value = null;
  //layer.draw();
}

function deleteGuiNodeWithId(id) {
  let currentShape = layer.findOne(`#${id}`);

  deleteGuiNode(currentShape, true, id);
}

function deleteAllGuiNodes() {
  const guiNodesTemp = guiNodes.slice();

  for (let i = 0; i < guiNodesTemp.length; i++) {
    deleteGuiNodeWithId(guiNodesTemp[i].id);
  }
}

// function deleteAllGuiNodes(guiNodesParam) {
//   // resets all guiNodes and transitions in konva

//   if (guiNodesParam && guiNodesParam.length > 0) {
//     deleteGuiNodeWithId(guiNodesParam[guiNodesParam.length - 1].id);
//     guiNodesParam = guiNodesParam.pop();
//     //recursively remove all guiNodes and transitions
//     deleteAllGuiNodes(guiNodesParam);
//   }
//   // layer.children.forEach((child) => {
//   //   deleteGuiNode(child, true);
//   //   // console.log(child);
//   // });
//   // // reset guiNodes and transitions
//   // guiNodes = [];
//   // transitions = [];
// }

function addBoxTransitionEventListener(e, box) {
  //console.log(`EVENT CLICK: ${e.evt.button}`)
  //Only respond if we click the shape with left click
  if (e.evt.button == 0) {
    if (box.getAttr('clicked')) {
      box.setAttr('stroke', box.getAttr('stroke_ori'));
      box.setAttr('fill', undefined);
      box.setAttr('clicked', false);
      currentSelectedComp.value = null;
    } else {
      box.setAttr('stroke', 'green');
      box.setAttr('fill', 'green');
      box.setAttr('clicked', true);
      if (currentSelectedComp.value) {
        //console.log(`CURRSEL COMP :${currentSelectedComp.value.getAttr('id').split('_')[1]}, ${box.getAttr('id').split('_')[1]}`)

        //if (currentSelectedComp.value.getParent() != box.getParent()) {
        if (
          currentSelectedComp.value.getAttr('id').split('_')[1] !=
          box.getAttr('id').split('_')[1]
        ) {
          addTransitionArrow(currentSelectedComp.value, box);
          box.setAttr('stroke', box.getAttr('stroke_ori'));
          currentSelectedComp.value.setAttr(
            'stroke',
            currentSelectedComp.value.getAttr('stroke_ori')
          );
          currentSelectedComp.value.setAttr('fill', undefined);
          box.setAttr('fill', undefined);
          box.setAttr('clicked', false);
          currentSelectedComp.value = null;
        } else {
          if (currentSelectedComp.value != box) {
            currentSelectedComp.value.setAttr(
              'stroke',
              currentSelectedComp.value.getAttr('stroke_ori')
            );
            currentSelectedComp.value.setAttr('fill', undefined);
            currentSelectedComp.value.setAttr('clicked', false);
          }
          currentSelectedComp.value = box;
        }
      } else {
        currentSelectedComp.value = box;
      }
    }
  }
}

function addDblClickListenerForCustomCropComps(comp, type) {
  if (comp.getAttr('isStillCrop')) {
    comp.setAttr('isStillCrop', false);
    if (type === 'Text Button') {
      createCustomButton(
        comp.getChildren()[1],
        addBoxTransitionEventListener,
        createKonvaPlayer,
        comp.getAttr('extraInformation')
      );
    } else if (type === 'Text') {
      createCustomLabel(
        comp.getChildren()[1],
        addBoxTransitionEventListener,
        createKonvaPlayer,
        comp.getAttr('extraInformation')
      );
    } else if (type === 'Input') {
      createCustomInput(
        comp.getChildren()[1],
        addBoxTransitionEventListener,
        createKonvaPlayer,
        comp.getAttr('extraInformation')
      );
    }

    console.log(comp);

    let idToRemove = comp.getAttr('extraInformation').idToRemove.split('_');
    idToRemove = idToRemove[0] + '_' + idToRemove[1];
    let nodeToDestroy = guiNodes.find((g) => g.id === idToRemove);
    if (nodeToDestroy) {
      let compToDestroy = nodeToDestroy.uiCompObjects.find(
        (c) => c.id === comp.getAttr('extraInformation').idToRemove
      );
      if (compToDestroy) {
        let indexToDestroy = nodeToDestroy.uiCompObjects.indexOf(compToDestroy);
        nodeToDestroy.uiCompObjects.splice(indexToDestroy, 1);
      }
      comp.destroy();
    }

    createKonvaPlayer();

    return;
  }
}

module.exports = {
  getUICompObjects,
  addGUIToEditorKonva,
  getCroppedComponent,
  updateObjects,
  createKonvaPlayer,
  addBackButton,
  computeStartNode,
  computeIntersections,
  addTransitionArrow,
  removeAllTransitionsForGUINode,
  removeUIComponent,
  deleteGuiNode,
  deleteAllGuiNodes,
  removeUiCompObjectWithId,
  addBoxTransitionEventListener,
  getUICompGroups,
  addDblClickListenerForCustomCropComps,
};

},{"./createCustomComps":1,"./helpers":5,"./vars":8,"jsonpath-plus":9}],5:[function(require,module,exports){
const { vars } = require('./vars');
var { layer, importHelper } = vars;

function arraysEqual(
  a = importHelper.guisLoaded,
  b = importHelper.guisInitialized
) {
  console.log(a, b);
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  if (a.length === 0 && b.length === 0) return false;

  a.sort((c, d) => c - d);
  b.sort((c, d) => c - d);

  for (var i = 0; i < a.length; ++i) {
    if (a[i] != b[i]) return false;
  }
  return true;
}

function generateID(ricoID) {
  let id = ricoID;
  let amount = vars.guiNodes.filter((node) => node.index == ricoID).length;
  return id + '-' + amount;
}

const rgbToHex = (r, g, b) =>
  '#' +
  [r, g, b]
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    })
    .join('');

function modeI(array) {
  if (array.length == 0) return null;
  var modeMap = {};
  var maxEl = array[0],
    maxCount = 1;
  for (var i = 0; i < array.length; i++) {
    var el = array[i];
    if (modeMap[el] == null) modeMap[el] = 1;
    else modeMap[el]++;
    if (modeMap[el] > maxCount) {
      maxEl = el;
      maxCount = modeMap[el];
    }
  }
  return maxEl;
}

function haveIntersection(r1, r2) {
  return !(
    r2.x > r1.x + r1.width ||
    r2.x + r2.width < r1.x ||
    r2.y > r1.y + r1.height ||
    r2.y + r2.height < r1.y
  );
}

function getArrowPoints(fromNode, toNode) {
  fromNodeParent = fromNode.getParent();
  x1 = fromNodeParent.getX() + fromNode.getX();
  y1 = fromNodeParent.getY() + fromNode.getY() + fromNode.getAttr('height') / 2;
  toNodeImgNode = layer.findOne(`#${toNode.getAttr('id')}_img`);
  x2 = toNode.getX();
  y2 =
    toNode.getY() +
    toNodeImgNode.getAttr('scaleY') * (toNodeImgNode.getAttr('height') / 2);
  if (x1 >= x2) {
    x2 = x2 + toNodeImgNode.getAttr('scaleX') * toNodeImgNode.getAttr('width');
  } else {
    x1 = x1 + fromNode.getAttr('width');
  }
  if (
    y1 +
      toNodeImgNode.getAttr('scaleY') * (toNodeImgNode.getAttr('height') / 2) >=
    y2
  ) {
    y1 = fromNodeParent.getY() + fromNode.getY();
    x1 =
      fromNodeParent.getX() + fromNode.getX() + fromNode.getAttr('width') / 2;
    y2 =
      toNode.getY() +
      toNodeImgNode.getAttr('scaleY') * toNodeImgNode.getAttr('height');
    x2 =
      toNode.getX() +
      toNodeImgNode.getAttr('scaleX') * (toNodeImgNode.getAttr('width') / 2);
  } else if (
    y1 +
      toNodeImgNode.getAttr('scaleY') * (toNodeImgNode.getAttr('height') / 2) >=
    y2
  ) {
    x2 =
      toNode.getX() +
      toNodeImgNode.getAttr('scaleX') * (toNodeImgNode.getAttr('width') / 2);
    y2 = toNode.getY();
    x1 =
      fromNodeParent.getX() + fromNode.getX() + fromNode.getAttr('width') / 2;
    y1 = fromNodeParent.getY() + fromNode.getY() + fromNode.getAttr('height');
  }
  //console.log([x1, y1, x2, y2]);
  return [x1, y1, x2, y2];
}

function getArrowPoints2(fromNode, toNode) {
  /* if (toNode.getAttr('editable')) {
          toNode = toNode.getParent();
      } */
  // FromNode x,y,width,height values
  fromNodeParent = fromNode.getParent();
  fromNodeX = fromNodeParent.getX() + fromNode.getX();
  fromNodeY = fromNodeParent.getY() + fromNode.getY();
  fromNodePoints = computeCenterPoints(
    fromNodeX,
    fromNodeY,
    fromNode.getAttr('width'),
    fromNode.getAttr('height')
  );
  // ToNode x,y,width,height values
  toNodeImgNode = layer.findOne(`#${toNode.getAttr('id')}_img`);
  toNodeWidth =
    toNodeImgNode.getAttr('width') * toNodeImgNode.getAttr('scaleX');
  toNodeHeight =
    toNodeImgNode.getAttr('height') * toNodeImgNode.getAttr('scaleY');
  toNodePoints = computeCenterPoints(
    toNode.getX(),
    toNode.getY(),
    toNodeWidth,
    toNodeHeight
  );
  // Compute pairwise distances between center points
  minDist = Number.MAX_SAFE_INTEGER;
  minFromPoint = undefined;
  minToPoint = undefined;
  for (i = 0; i < fromNodePoints.length; i++) {
    for (j = 0; j < toNodePoints.length; j++) {
      fromP = fromNodePoints[i];
      toP = toNodePoints[j];
      dist = computePointDistance(fromP[0], fromP[1], toP[0], toP[1]);
      if (dist <= minDist) {
        minDist = dist;
        minFromPoint = fromP;
        minToPoint = toP;
      }
    }
  }
  return [minFromPoint[0], minFromPoint[1], minToPoint[0], minToPoint[1]];
}

function computeCenterPoints(x, y, width, height) {
  p1 = [x + width / 2, y];
  p2 = [x, y + height / 2];
  p3 = [x + width, y + height / 2];
  p4 = [x + width / 2, y + height];
  return [p1, p2, p3, p4];
}

function computePointDistance(x1, y1, x2, y2) {
  var a = x1 - x2;
  var b = y1 - y2;
  return Math.sqrt(a * a + b * b);
}

function getNextId(node) {
  if (node.uiCompObjects.length <= 0) return 0;

  var idMapping = node.uiCompObjects.map((c) =>
    parseInt(c['id'].split('_')[2])
  );

  //console.log(`All ids of node ${node['id']}: ${idMapping}`);
  var nextId = Math.max.apply(null, idMapping) + 1;

  //console.log(`Next id: ${nextId}`);
  return nextId;
}

// module.exports['rgbToHex'] = rgbToHex;
// module.exports['modeI'] = modeI;
// module.exports['haveIntersection'] = haveIntersection;
// module.exports['getArrowPoints'] = getArrowPoints;
// module.exports['getArrowPoints2'] = getArrowPoints2;
// module.exports['computeCenterPoints'] = computeCenterPoints;
// module.exports['computePointDistance'] = computePointDistance;
// module.exports['getNextId'] = getNextId;
// module.exports['generateID'] = generateID;

module.exports = {
  rgbToHex,
  modeI,
  haveIntersection,
  getArrowPoints,
  getArrowPoints2,
  computeCenterPoints,
  computePointDistance,
  getNextId,
  generateID,
  arraysEqual,
};

},{"./vars":8}],6:[function(require,module,exports){
const { addGUIToEditor } = require('./fetchData');
const {
  addTransitionArrow,
  createKonvaPlayer,
  deleteAllGuiNodes,
  updateObjects,
  removeUiCompObjectWithId,
} = require('./guiKonva');
const { vars } = require('./vars');
var { userSetStartNodeId, guiNodes, importHelper } = vars;
const { arraysEqual } = require('./helpers');

function importFromJSON(json) {
  console.log(json);
  importHelper.guisInitialized = [];
  importHelper.guisLoaded = [];
  //delete all existing stuff, e.g. guiNodes and transitions TODO-> really buggy, will do later due to it's low priority
  deleteAllGuiNodes();
  //create guiNodes
  addGuis(json['guiNodes']);
  //wait for all guis to load -> this is very dirty code -> use async await for better code -> problem is that we have no control over the resolving of the promises, because the function resolving them gets passed in an image onload
  waitForGuisToLoad(json);
}

//function to add all guis
function addGuis(guis) {
  guis.forEach((gui) => addGUIToEditor(gui.index, gui.x, gui.y, true, true));
}

//function to add all transitions
function addTransitions(transitions) {
  console.log(
    '++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++'
  );
  transitions.forEach((transition) => {
    addTransitionArrow(transition.from, transition.to, true);
  });
}

function setStartNode(startNode) {
  console.log(startNode);

  if (
    !(Object.keys(startNode).length === 0 && startNode.constructor === Object)
  ) {
    userSetStartNodeId['id'] = startNode.id;
  }
}

function createNewKonvaPlayer() {
  console.log('CREATE NEW PLAYER INIT');
  if (guiNodes) {
    createKonvaPlayer();
    console.log('CREATED NEWE PLAYA');
  }
}

function deleteCompObjects(json) {
  let guis = json['guiNodes'];
  guis.forEach((gui) => {
    //get deletedcompobjects
    let deletedCompObjects = gui.removedCompObjects;
    //delete compobjects
    if (deletedCompObjects) {
      let node = guiNodes.find((n) => n.id === gui.id);
      if (node) {
        deletedCompObjects.forEach((deleteIndex) => {
          // node.uiCompObjects.splice(deleteIndex, 1);
          removeUiCompObjectWithId(node.uiCompObjects[deleteIndex].id);
          console.log('HALLIHALO!');
        });
      }
      // createKonvaPlayer();
      // updateObjects();
    }
  });
}

function waitForGuisToLoad(json) {
  console.log('hello there');
  if (!arraysEqual()) {
    setTimeout(() => {
      waitForGuisToLoad(json);
    }, 100);
  } else {
    console.log('all guis have loaded');
    console.log(importHelper.guisLoaded);
    console.log(importHelper.guisInitialized);

    deleteCompObjects(json);
    //add transitions
    addTransitions(json['transitions']);
    //Set startNode
    setStartNode(json['userSetStartNodeId']);
    //create konvaPLayer
    createNewKonvaPlayer();
  }
}
module.exports = { importFromJSON };

},{"./fetchData":3,"./guiKonva":4,"./helpers":5,"./vars":8}],7:[function(require,module,exports){
const Konva = require('konva');
const colorThief = new ColorThief();
const {
  fetchJSONDataFromIndex,
  addGUIToEditor,
  fetchSearchResults,
} = require('./fetchData');

const {
  createCustomLabel,
  createCustomButton,
  createCustomInput,
  getButtonCrop,
} = require('./createCustomComps');

const {
  createKonvaPlayer,
  removeAllTransitionsForGUINode,
  removeUIComponent,
  deleteGuiNode,
  addBoxTransitionEventListener,
  updateObjects,
  addDblClickListenerForCustomCropComps,
} = require('./guiKonva');
const { exportWireframe } = require('./export');
const { getNextId } = require('./helpers');
const { vars } = require('./vars');
const { importFromJSON } = require('./import');
var {
  isEditModeOn,
  showUICinPreview,
  stage,
  layer,
  currentSelectedComp,
  guiNodes,
  transitions,
  userSetStartNodeId,
  importHelper,
} = vars;
//Event listeners
// setup context menu
let currentShape;
var menuNode = document.getElementById('menu');

document
  .getElementById('select-start-node-button')
  .addEventListener('click', (e) => {
    if (currentShape.getAttr('editable')) {
      currentShape = currentShape.getParent();
    }

    userSetStartNodeId['id'] = currentShape.getParent().getAttr('id');
    console.log(`User set ${userSetStartNodeId.id} as the start node`);
    currentSelectedComp.value = null;
    if (guiNodes) {
      createKonvaPlayer();
    }
  });

document
  .getElementById('delete-transitions-button')
  .addEventListener('click', () => {
    if (currentShape.getAttr('editable')) {
      currentShape = currentShape.getParent();
    }

    guiNode = guiNodes.find(
      (n) => n.id == currentShape.getParent().getAttr('id')
    );
    removeAllTransitionsForGUINode(guiNode);
    if (guiNodes) {
      createKonvaPlayer();
    }
    // THIS IS A BUG, we set to null but the UI shows selected
    currentSelectedComp.value = null;
  });

document
  .getElementById('delete-uicomp-button')
  .addEventListener('click', () => {
    // Only if an editable UI component has been clicked to remove we start removal
    if (currentShape.getAttr('editable')) {
      removeUIComponent(currentShape);
    }
    //Update the player
    if (guiNodes) {
      createKonvaPlayer();
    }
  });

document.getElementById('delete-button').addEventListener('click', () => {
  if (currentShape.getAttr('editable')) {
    currentShape = currentShape.getParent();
  }
  deleteGuiNode(currentShape);
});

document
  .getElementById('copy-ui-element-button')
  .addEventListener('click', () => {
    if (currentShape.getAttr('editable')) {
      var nodeId = currentShape.getParent().getAttr('id').split('_')[1];
      // Remove guiNode first from the data model
      guiNode = guiNodes.find(
        (n) => n.id == currentShape.getParent().getParent().getAttr('id')
      );
      var currentShapeCopy = currentShape.getParent().clone();

      //if it is a custom compObj we need to re-bind the transition listener
      if (currentShapeCopy.getAttr('isCustom')) {
        let box = currentShapeCopy.getChildren()[
          currentShapeCopy.getChildren().length - 1
        ];
        box.off('mousedown');
        box.on('mousedown', (e) => addBoxTransitionEventListener(e, box));
      }

      var newId = getNextId(guiNode);
      newId = guiNode['id'] + '_' + newId;
      currentShapeCopy.setAttr('name', newId);
      currentShapeCopy.setAttr('id', newId);
      currentShapeCopy.children.each(function (child) {
        if (child.getAttr('id').includes('_img')) {
          child.setAttr('name', newId + '_img');
          child.setAttr('id', newId + '_img');
        } else {
          child.setAttr('name', newId);
          child.setAttr('id', newId);
        }
      });
      var newOffset = 20;
      currentShapeCopy.setAttr('x', currentShapeCopy.getAttr('x') + newOffset);
      currentShapeCopy.setAttr('y', currentShapeCopy.getAttr('y') + newOffset);

      var uiCompObject1 = guiNode.uiCompObjects.find(
        (n) => n['id'] == currentShape.getAttr('id')
      );
      var copiedUICompObject = Object.assign({}, uiCompObject1);
      copiedUICompObject['id'] = newId;
      if (uiCompObject1.crop_group) {
        copiedUICompObject['crop_group'] = uiCompObject1.crop_group.clone();
      }
      copiedUICompObject['updated_comp_bounds'] = copiedUICompObject[
        'updated_comp_bounds'
      ].map((x) => x + 80);
      guiNode.uiCompObjects.push(copiedUICompObject);
      var currGroup = currentShape.getParent().getParent();
      currGroup.add(currentShapeCopy);

      if (currentShapeCopy.getAttr('isStillCrop')) {
        console.log(currentShapeCopy);
        currentShapeCopy.setAttr('extraInformation', {
          ...currentShapeCopy.getAttr('extraInformation'),
          idToRemove: copiedUICompObject['id'],
        });
        currentShapeCopy.off('dblclick');
        currentShapeCopy.on('dblclick', () =>
          addDblClickListenerForCustomCropComps(
            currentShapeCopy,
            copiedUICompObject['comp_label']
          )
        );
      }

      layer.batchDraw();
      if (guiNodes) {
        createKonvaPlayer();
      }
    }
  });

document.getElementById('edit-mode-button').addEventListener('click', () => {
  var nodeId = currentShape.getParent().getAttr('id').split('_')[1];
  //remove the "-0" suffix that gets generated to distinguish between multiple guis with same id
  nodeId = nodeId.slice(0, nodeId.length - 2);
  guiNode = guiNodes.find(
    (n) => n.id == currentShape.getParent().getAttr('id')
  );
  if (!guiNode.editable) {
    // Remove guiNode first from the data model

    guiNodeIndex = guiNodes.indexOf(guiNode);
    guiNodes.splice(guiNodeIndex, 1);

    addGUIToEditor(
      nodeId,
      currentShape.getParent().x(),
      currentShape.getParent().y(),
      true
    );
    currentShape.getParent().remove();
  }
  /* if (currentShape.getAttr('editable')) {
          currentShape = currentShape.getParent();
      }
      guiNode = guiNodes.find(n => n.id == currentShape.getParent().getAttr('id'));
      
      guiNodeIndex = guiNodes.indexOf(guiNode);
      guiNodes.splice(guiNodeIndex, 1);
      currentShape.getParent().remove();
      removeAllTransitionsForGUINode(guiNode);
      currentShape = null;
      //Update the player
      if (guiNodes) {
              createKonvaPlayer();
      }
      currentSelectedComp = null; */
});

window.addEventListener('click', () => {
  // hide menu

  menuNode.style.display = 'none';
});

stage.on('contextmenu', function (e) {
  // prevent default behavior
  e.evt.preventDefault();
  if (e.target === stage) {
    // if we are on empty place of the stage we will do nothing
    return;
  }
  currentShape = e.target;
  var parentNode = currentShape.getParent();
  // show menu
  menuNode.style.display = 'initial';
  var containerRect = stage.container().getBoundingClientRect();
  menuNode.style.top =
    //parentNode.getY() + currentShape.getAttr('y') + 4 + 'px';
    stage.getPointerPosition().y + 90 + 'px';
  menuNode.style.left =
    //parentNode.getX() + currentShape.getAttr('x') + 4 + 'px';
    stage.getPointerPosition().x + 4 + 'px';
  var top = stage.getPointerPosition().y + 100 + 'px';

  var left = stage.getPointerPosition().x + 20 + 'px';
});

currentSelectedArrow = null;

$('#btn_edit_mode').on('change', function () {
  isEditModeOn.value = !$(this).prop('checked');
});

$('#btn_bounding_box_mode').on('change', function () {
  showUICinPreview.value = $(this).prop('checked');
  createKonvaPlayer();
});

$('#btn_remove').on('click', function () {
  if (currentSelectedComp.value) {
    guiNode = guiNodes.find(
      (n) => n.id == currentSelectedComp.value.getParent().getAttr('id')
    );
    guiNodeIndex = guiNodes.indexOf(guiNode);
    guiNodes.splice(guiNodeIndex, 1);
    currentSelectedComp.value.getParent().remove();
    removeAllTransitionsForGUINode(guiNode);
    currentSelectedComp.value = null;
    //Update the player
    if (guiNodes) {
      createKonvaPlayer();
    }
  }
  stage.batchDraw();
});

$('#btn_add').on('click', function () {
  let req_index = Number(prompt('Please enter the GUI index'));

  addGUIToEditor(req_index, 0, 0, isEditModeOn.value);
});

var container = stage.container();

// make it focusable

container.tabIndex = 1;
// focus it
// also stage will be in focus on its click
container.focus();

const DELTA = 4;

container.addEventListener('keydown', function (e) {
  if (e.keyCode === 46 || e.keyCode === 8) {
    if (currentSelectedComp.value) {
      // guiNode = guiNodes.find(
      //   (n) => n.id == currentSelectedComp.value.getParent().getAttr('id')
      // );
      // guiNodeIndex = guiNodes.indexOf(guiNode);
      // guiNodes.splice(guiNodeIndex, 1);
      // currentSelectedComp.value.getParent().remove();
      // removeAllTransitionsForGUINode(guiNode);
      removeUIComponent(currentSelectedComp.value);
      currentSelectedComp.value = null;
      //Update the player
      if (guiNodes) {
        createKonvaPlayer();
      }
    }
    if (currentSelectedArrow) {
      transition = transitions.find(
        (t) => t.id == currentSelectedArrow.getAttr('id')
      );
      transIndex = transitions.indexOf(transition);
      transitions.splice(transIndex, 1);
      currentSelectedArrow.remove();
      currentSelectedArrow = null;
      //Update the player
      if (guiNodes) {
        createKonvaPlayer();
      }
    }
  }
  e.preventDefault();
  stage.batchDraw();
});

//addGUIToEditor(58538);
//addGUIToEditor(58538);
//addGUIToEditor(4512);

//addGUIToEditor(37679, 0, 0, true, true);

// addGUIToEditor(58538);
query = 'login  remember account';
method = 'bm25okapi';
qe_method = '';
max_results = 100;
fetchSearchResults(query, method, qe_method, max_results);

//Drag and drop guis

var guiIndexDrag = '';
document
  .getElementById('container-search-results')
  .addEventListener('dragstart', function (e) {
    imgId = e.target.id;
    guiIndexDrag = imgId.split('-')[1];
  });

container.addEventListener('dragover', function (e) {
  e.preventDefault(); // !important
});

container.addEventListener('drop', function (e) {
  e.preventDefault();
  // now we need to find pointer position
  // we can't use stage.getPointerPosition() here, because that event
  // is not registered by Konva.Stage
  // we can register it manually:
  stage.setPointersPositions(e);

  addGUIToEditor(
    guiIndexDrag,
    stage.getPointerPosition().x,
    stage.getPointerPosition().y,
    isEditModeOn.value
  );
  /* Konva.Image.fromURL(itemURL, function (image) {
      layer.add(image);

      image.position(stage.getPointerPosition());
      image.draggable(true);

      layer.draw();
    }); */
});

$('#btn-search').on('click', function (e) {
  e.preventDefault();
  var searchText = $('#search-input').val();
  $('#container-search-results').children().remove();
  if (searchText) {
    query = searchText;
    method = 'bm25okapi';
    qe_method = '';
    max_results = 100;
    fetchSearchResults(query, method, qe_method, max_results);
  }
});

$('#container-search-results').on(
  'click',
  'button[id^="btn-gui-add"]',
  function () {
    //alert($(this).data('val'));
    addGUIToEditor($(this).data('val'), 0, 0, isEditModeOn.value);
  }
);

$('#btn_play').on('click', function () {
  //$('#ui-layout-west').children().remove();
  //$('#ui-layout-west').append(`<h1>GUI Nodes</h1>`);
  //guiNodes.forEach(n => $('#ui-layout-west').append(`<p>${n.id},${n.comp_bounds}</p>`));
  //$('#ui-layout-west').append(`<h1>Transitions</h1>`);
  //transitions.forEach(t => $('#ui-layout-west').append(`<p>${t.id}</p>`));
  if (guiNodes) {
    createKonvaPlayer();
  }
});

$('#logging').on('click', () => {
  console.log('GUI Nodes ');
  console.log(guiNodes);
  console.log('transitions');
  console.log(transitions);
  console.log('currentShape');
  console.log(currentShape);
  console.log('userSetStartNodeId');
  console.log(userSetStartNodeId);
  console.log('guisInitialized');
  console.log(importHelper.guisInitialized);
  console.log('guisLoaded');
  console.log(importHelper.guisLoaded);
});

// $('#export').on('click', () => {
//   exportWireframe(guiNodes, transitions, userSetStartNodeId);
// });

// $('#importDialogTrigger').on('click', () => {
//   //open dialog
//   $('#importDialog').dialog('open');
//   return false;
// });

// //register import dialog
// $('#importDialog').dialog({
//   autoOpen: false,
//   title: 'Import Wireframe',
// });

// //upload file
// document.getElementById('import').onclick = function () {
//   var files = document.getElementById('selectFiles').files;

//   if (files.length <= 0) {
//     return false;
//   }

//   var fr = new FileReader();

//   fr.onload = function (e) {
//     var result = JSON.parse(e.target.result);
//     // var formatted = JSON.stringify(result, null, 2);
//     //call import handler from import.js
//     importFromJSON(result);
//   };

//   fr.readAsText(files.item(0));

//   //close dialog after upload
//   $('#importDialog').dialog('close');
// };

$('#btn-add-blank-gui').on('click', (e) => {
  e.preventDefault();

  addGUIToEditor(58538, 0, 0, true, false, true);
});

function calculateCurrentShapeForNewComp() {
  if (currentShape && !currentShape.getAttr('editable')) {
    let newShape = currentShape.getParent().getChildren()[4];

    if (newShape && newShape.getChildren()[1]) {
      currentShape = newShape.getChildren()[1];
    } else {
      let curId = currentShape.getAttr('id').split('_');
      curId = curId[0] + '_' + curId[1];
      let tempShape = layer.findOne(`#${curId}`);

      if (tempShape) {
        //create new group and append it
        let group = new Konva.Group({
          id: curId + '_0',
          name: curId + '_0',
          editable: true,
          draggable: true,
        });

        let rect = new Konva.Rect({
          id: curId + '_0',
          name: curId + '_0',
          editable: true,
          draggable: true,
        });

        group.add(rect);

        tempShape.add(group);

        currentShape = rect;
      }
    }
  }
  console.log(currentShape);
}

//custom comps

// ==============================LABEL start========================================

//register create label dialog
$('#create-label-dialog').dialog({
  autoOpen: false,
  title: 'Create custom label',
});

//click on create label button and open dialog
$('#create-label-button').on('click', () => {
  //open dialog

  calculateCurrentShapeForNewComp();

  if (currentShape && currentShape.getAttr('editable')) {
    $('#create-label-dialog').dialog('open');
  }
  return false;
});

// create new label
document
  .getElementById('create-label-dialog-button')
  .addEventListener('click', () => {
    $('#create-label-dialog').dialog('close');

    createCustomLabel(
      currentShape,
      addBoxTransitionEventListener,
      createKonvaPlayer
    );
  });

//register edit label dialog
$('#edit-label-dialog').dialog({
  autoOpen: false,
  title: 'Edit custom label',
});

//edit label
$('#edit-label-dialog-button').on('click', () => {
  //get values from dialog input
  const editTextField = document.getElementById('edit-label-text');
  const editSizeField = document.getElementById('edit-label-size');
  const editColorField = document.getElementById('edit-label-color');

  const labelIdSpan = document.getElementById('label-id-span');

  //get correct text konva entity
  const textObj = layer.findOne(`#${labelIdSpan.dataset.labelId}`);
  if (textObj) {
    textObj.setAttr('width', undefined);
    textObj.setAttr('text', editTextField.value);
    textObj.setAttr('fontSize', parseInt(editSizeField.value, 10));
    textObj.setAttr('fill', editColorField.value);

    const labelGroup = textObj.getParent();
    const box = labelGroup.getChildren()[1];

    //limit the text width
    if (textObj.width() >= 250) {
      textObj.width(250);
    }

    box.setAttr('width', textObj.width());
    box.setAttr('height', textObj.height());

    labelGroup.setAttr('width', box.width());
    labelGroup.setAttr('height', box.height());
    //fire these two events in order to display component correctly
    // labelGroup.fire('dragstart');
    labelGroup.fire('dragend');

    //update ui comp object in data model
    let dataModelId = labelIdSpan.dataset.labelId.split('_');
    let compId = dataModelId[0] + '_' + dataModelId[1] + '_' + dataModelId[2];
    let nodeId = dataModelId[0] + '_' + dataModelId[1];

    let nodeObj = guiNodes.find((node) => node.id === nodeId);
    let compObj = nodeObj.uiCompObjects.find((comp) => comp.id === compId);

    if (compObj) compObj['crop_group'] = labelGroup.clone();
    layer.batchDraw();
  }
  $('#edit-label-dialog').dialog('close');

  if (guiNodes) {
    createKonvaPlayer();
  }
});

// ==============================LABEL end========================================

// ==============================BUTTON start========================================

//register create button dialog
$('#create-button-dialog').dialog({
  autoOpen: false,
  title: 'Create custom button',
});

//click on create button button and open dialog
$('#create-button-button').on('click', () => {
  //open dialog

  calculateCurrentShapeForNewComp();

  if (currentShape && currentShape.getAttr('editable')) {
    $('#create-button-dialog').dialog('open');
  }
  return false;
});

// create new button
document
  .getElementById('create-button-dialog-button')
  .addEventListener('click', () => {
    $('#create-button-dialog').dialog('close');
    createCustomButton(
      currentShape,
      addBoxTransitionEventListener,
      createKonvaPlayer
    );
    createKonvaPlayer();
  });

//register edit button dialog
$('#edit-button-dialog').dialog({
  autoOpen: false,
  title: 'Edit custom button',
});

//edit button
$('#edit-button-dialog-button').on('click', () => {
  //get values from dialog input
  const editTextField = document.getElementById('edit-button-text');
  const editSizeField = document.getElementById('edit-button-text-size');
  const editTextColorField = document.getElementById('edit-button-text-color');
  const editButtonColorField = document.getElementById('edit-button-color');

  const buttonIdSpan = document.getElementById('button-id-span');

  //get correct  konva entities
  let konvaObjs = layer.find(`#${buttonIdSpan.dataset.buttonId}`);

  // console.log(konvaObjs);
  // konvaObjs = layer.find(`#${buttonIdSpan.dataset.buttonId}`);
  // console.log(konvaObjs);

  let buttonGroup = null;
  for (o in konvaObjs) {
    let obj = konvaObjs[o];

    if (typeof obj == 'number' || typeof obj == 'function') continue;
    if (!buttonGroup) buttonGroup = obj.getParent();
    if (obj.getClassName() === 'Text') {
      obj.setAttr('text', editTextField.value);
      obj.setAttr('fontSize', parseInt(editSizeField.value, 10));
      obj.setAttr('fill', editTextColorField.value);
    } else if (obj.getClassName() === 'Rect') {
      obj.setAttr('fill', editButtonColorField.value);
    }

    const box = buttonGroup.getChildren()[2];
    const text = buttonGroup.getChildren()[1];
    const fill = buttonGroup.getChildren()[0];

    let realWidth = text.getTextWidth();
    let realHeight = text.getTextHeight();

    let buttonExtraWidth = realWidth * 2;
    let buttonExtraHeight = realHeight * 3;

    text.width(buttonExtraWidth);
    text.height(buttonExtraHeight);

    //limit the text width
    if (text.width() >= 250) {
      text.width(250);
    }

    if (fill.getAttr('fixedWidth')) text.width(fill.getAttr('fixedWidth'));
    if (fill.getAttr('fixedHeight')) text.height(fill.getAttr('fixedHeight'));
    fill.width(text.width());
    fill.height(text.height());

    // fill.x((-1 * buttonExtraWidth) / 2);
    // fill.y((-1 * buttonExtraHeight) / 2);

    box.width(fill.width());
    box.height(fill.height());
    box.x(fill.x());
    box.y(fill.y());

    // box.setAttr('width', textObj.width());
    // box.setAttr('height', textObj.height());

    buttonGroup.setAttr('width', box.width());
    buttonGroup.setAttr('height', box.height());
    //fire these two events in order to display component correctly
    // buttonGroup.fire('dragstart');
    buttonGroup.fire('dragend');

    //update ui comp object in data model
    let dataModelId = buttonIdSpan.dataset.buttonId.split('_');
    let compId = dataModelId[0] + '_' + dataModelId[1] + '_' + dataModelId[2];
    let nodeId = dataModelId[0] + '_' + dataModelId[1];

    let nodeObj = guiNodes.find((node) => node.id === nodeId);
    let compObj = nodeObj.uiCompObjects.find((comp) => comp.id === compId);

    if (compObj) {
      compObj['crop_group'] = buttonGroup.clone();
      // compObj['comp_bounds'] = [
      //   buttonGroup.x(),
      //   buttonGroup.y(),
      //   buttonGroup.x() + buttonGroup.width(),
      //   buttonGroup.y() + buttonGroup.height(),
      // ];
      //test
    }

    layer.batchDraw();
  }
  $('#edit-button-dialog').dialog('close');

  if (guiNodes) {
    createKonvaPlayer();
  }
});

// ==============================BUTTON end========================================

// ==============================INPUT FIELD start========================================

//register create input dialog
$('#create-input-dialog').dialog({
  autoOpen: false,
  title: 'Create custom input',
});

//click on create input button and open dialog
$('#create-input-button').on('click', () => {
  //open dialog

  calculateCurrentShapeForNewComp();

  if (currentShape && currentShape.getAttr('editable')) {
    $('#create-input-dialog').dialog('open');
  }
  return false;
});

// create new input
document
  .getElementById('create-input-dialog-button')
  .addEventListener('click', () => {
    $('#create-input-dialog').dialog('close');

    createCustomInput(
      currentShape,
      addBoxTransitionEventListener,
      createKonvaPlayer
    );
  });

//register edit input dialog
$('#edit-input-dialog').dialog({
  autoOpen: false,
  title: 'Edit custom input',
});

//edit input
$('#edit-input-dialog-button').on('click', () => {
  //get values from dialog input
  const editTextField = document.getElementById('edit-input-text');
  const editSizeField = document.getElementById('edit-input-text-size');
  const editTextColorField = document.getElementById('edit-input-text-color');
  const editInputColorField = document.getElementById('edit-input-color');
  const editInputSizeField = document.getElementById('edit-input-size');

  const inputIdSpan = document.getElementById('input-id-span');

  //map width
  let inputWidthMap = {
    full: 250,
    twoThirds: 167,
    half: 125,
    oneThird: 83,
    fourth: 62,
  };

  let inputWidth = inputWidthMap[editInputSizeField.value] || 250;
  if (!editInputSizeField.value) {
    inputWidth = 'custom';
  }

  //get correct  konva entities
  const konvaObjs = layer.find(`#${inputIdSpan.dataset.inputId}`);

  let inputGroup = null;
  for (o in konvaObjs) {
    let obj = konvaObjs[o];

    if (typeof obj == 'number' || typeof obj == 'function') continue;
    if (!inputGroup) inputGroup = obj.getParent();
    if (obj.getClassName() === 'Text') {
      obj.setAttr('text', editTextField.value);
      obj.setAttr('fontSize', parseInt(editSizeField.value, 10));
      obj.setAttr('fill', editTextColorField.value);
    } else if (obj.getClassName() === 'Rect') {
      obj.setAttr('fill', editInputColorField.value);
      obj.setAttr('inputSize', editInputSizeField.value);
      if (inputWidth !== 'custom') {
        obj.setAttr('width', inputWidth);
      }
    }

    const box = inputGroup.getChildren()[2];
    const text = inputGroup.getChildren()[1];
    const fill = inputGroup.getChildren()[0];

    //limit the text width

    if (inputWidth !== 'custom') {
      text.width(inputWidth - 10);
    }

    let inputExtraHeight = text.fontSize() * 1.5;

    text.height(text.getTextHeight() + inputExtraHeight);

    fill.height(text.height());

    box.width(fill.width());
    box.height(fill.height());
    box.x(fill.x());
    box.y(fill.y());

    // box.setAttr('width', textObj.width());
    // box.setAttr('height', textObj.height());

    inputGroup.setAttr('width', box.width());
    inputGroup.setAttr('height', box.height());
    //fire these two events in order to display component correctly
    // inputGroup.fire('dragstart');
    inputGroup.fire('dragend');

    //update ui comp object in data model
    let dataModelId = inputIdSpan.dataset.inputId.split('_');
    let compId = dataModelId[0] + '_' + dataModelId[1] + '_' + dataModelId[2];
    let nodeId = dataModelId[0] + '_' + dataModelId[1];

    let nodeObj = guiNodes.find((node) => node.id === nodeId);
    let compObj = nodeObj.uiCompObjects.find((comp) => comp.id === compId);

    if (compObj) compObj['crop_group'] = inputGroup.clone();

    layer.batchDraw();
  }
  $('#edit-input-dialog').dialog('close');

  if (guiNodes) {
    createKonvaPlayer();
  }
});
// ==============================INPUT FIELD end========================================

// ==============================IMAGE PLACEHOLDER start========================================

//register create input dialog
$('#create-image-dialog').dialog({
  autoOpen: false,
  title: 'Create custom image placeholder',
});

//click on create image placeholder button and open dialog
$('#create-image-button').on('click', () => {
  //open dialog

  calculateCurrentShapeForNewComp();

  if (currentShape && currentShape.getAttr('editable')) {
    $('#create-image-dialog').dialog('open');
  }
  return false;
});

// create new image
document
  .getElementById('create-image-dialog-button')
  .addEventListener('click', () => {
    $('#create-image-dialog').dialog('close');

    const imageWidthInput = document.getElementById('create-image-width');
    let imageSizeWidth = parseFloat(imageWidthInput.value) || 200;
    imageWidthInput.value = 200;

    const imageHeightInput = document.getElementById('create-image-height');
    let imageSizeHeight = parseFloat(imageHeightInput.value) || 200;
    imageHeightInput.value = 200;

    const imageColorInput = document.getElementById('create-image-color');
    let imageColor = imageColorInput.value || '#cccccc';
    imageColorInput.value = '#cccccc';

    //var nodeId = currentShape.getParent().getAttr('id').split('_')[1];
    // Remove guiNode first from the data model
    guiNode = guiNodes.find(
      (n) => n.id == currentShape.getParent().getParent().getAttr('id')
    );
    let currShapeParent = currentShape.getParent();
    var imageGroup = currShapeParent.clone();

    imageGroup.destroyChildren();

    var newId = getNextId(guiNode);
    newId = guiNode['id'] + '_' + newId;
    imageGroup.setAttr('name', newId);
    imageGroup.setAttr('id', newId);
    imageGroup.setAttr('visible', true);

    imageGroup.setAttr('isCustom', true);

    let image = new Konva.Rect({
      x: 0, //normalizedA[0] ,
      y: 0, //normalizedA[1] ,
      width: imageSizeWidth,
      height: imageSizeHeight,
      fill: imageColor,

      //draggable: true,
      id: newId + '_img',
      name: newId + '_img',
    });

    let box = new Konva.Rect({
      x: image.x(), //normalizedA[0] ,
      y: image.y(), //normalizedA[1] ,
      width: image.width(),
      height: image.height(),
      stroke_ori: 'green',
      stroke: 'green',
      strokeWidth: 2,
      opacity: 0.3,
      //draggable: true,
      id: newId,
      name: newId,
    });

    //set editable on box to true
    box.setAttr('editable', true);

    box.on('mousedown', (e) => addBoxTransitionEventListener(e, box));

    //add children to group
    imageGroup.add(image);

    imageGroup.add(box);
    var newOffset = 20;
    imageGroup.setAttr('x', imageGroup.getAttr('x') + newOffset);
    imageGroup.setAttr('y', imageGroup.getAttr('y') + newOffset);
    imageGroup.width(box.width());
    imageGroup.height(box.height());

    //add listener for editing the label
    imageGroup.off('dblclick');
    imageGroup.on('dblclick', function () {
      $('#edit-image-dialog').dialog('open');

      const editImageWidth = document.getElementById('edit-image-width');
      const editImageHeight = document.getElementById('edit-image-height');
      const editImageColorField = document.getElementById('edit-image-color');

      const imageIdSpan = document.getElementById('image-id-span');

      const fillObj = this.getChildren()[0];

      editImageWidth.value = fillObj.getAttr('width');
      editImageHeight.value = fillObj.getAttr('height');

      editImageColorField.value = fillObj.getAttr('fill');

      imageIdSpan.dataset.imageId = fillObj.getAttr('id');
    });

    //create and add new uiCompObject to data model
    var uiCompObject1 = guiNode.uiCompObjects.find(
      (n) => n['id'] == currentShape.getAttr('id')
    );
    var newCompObj = Object.assign({}, uiCompObject1);
    newCompObj['id'] = newId;
    newCompObj['comp_label'] = 'CustomImage';
    newCompObj['plain_json'] = {};
    newCompObj['crop_group'] = imageGroup.clone();
    newCompObj['isBlank'] = false;
    newCompObj['isGroup'] = false;
    // newCompObj['updated_comp_bounds'] = [
    //   imageGroup.x(),
    //   imageGroup.y(),
    //   imageGroup.width(),
    //   imageGroup.height(),
    // ];

    guiNode.uiCompObjects.push(newCompObj);
    var currGroup = currentShape.getParent().getParent();

    currGroup.add(imageGroup);
    // imageGroup.moveToTop();
    //fire these two events in order to display component correctly
    // imageGroup.fire('dragstart');
    imageGroup.fire('dragend');
    // imageGroup.fire('dragmove');
    layer.batchDraw();
    if (guiNodes) {
      createKonvaPlayer();
    }
  });

//register edit image dialog
$('#edit-image-dialog').dialog({
  autoOpen: false,
  title: 'Edit custom image',
});

//edit input
$('#edit-image-dialog-button').on('click', () => {
  //get values from dialog input
  const editImageWidth = document.getElementById('edit-image-width');
  const editImageHeight = document.getElementById('edit-image-height');
  const editImageColorField = document.getElementById('edit-image-color');

  const imageIdSpan = document.getElementById('image-id-span');

  //get correct  konva entities
  const konvaObjs = layer.find(`#${imageIdSpan.dataset.imageId}`);

  let imageGroup = null;
  for (o in konvaObjs) {
    let obj = konvaObjs[o];

    if (typeof obj == 'number' || typeof obj == 'function') continue;
    if (!imageGroup) imageGroup = obj.getParent();
    if (obj.getClassName() === 'Rect') {
      obj.setAttr('fill', editImageColorField.value);
      obj.setAttr('width', parseFloat(editImageWidth.value));
      obj.setAttr('height', parseFloat(editImageHeight.value));
    }

    const box = imageGroup.getChildren()[1];

    const fill = imageGroup.getChildren()[0];

    box.width(fill.width());
    box.height(fill.height());
    box.x(fill.x());
    box.y(fill.y());

    // box.setAttr('width', textObj.width());
    // box.setAttr('height', textObj.height());

    imageGroup.setAttr('width', box.width());
    imageGroup.setAttr('height', box.height());
    //fire these two events in order to display component correctly
    // imageGroup.fire('dragstart');
    imageGroup.fire('dragend');

    //update ui comp object in data model
    let dataModelId = imageIdSpan.dataset.imageId.split('_');
    let compId = dataModelId[0] + '_' + dataModelId[1] + '_' + dataModelId[2];
    let nodeId = dataModelId[0] + '_' + dataModelId[1];

    let nodeObj = guiNodes.find((node) => node.id === nodeId);
    let compObj = nodeObj.uiCompObjects.find((comp) => comp.id === compId);

    if (compObj) compObj['crop_group'] = imageGroup.clone();

    layer.batchDraw();
  }
  $('#edit-image-dialog').dialog('close');

  if (guiNodes) {
    createKonvaPlayer();
  }
});
// ==============================IMAGE PLACEHOLDER end========================================

// ==============================SELECT (DROPDOWN) start========================================

//register create select dialog
$('#custom-select-dialog').dialog({
  autoOpen: false,
  title: 'Create / Edit custom select',
});

//click on create select button and open dialog
$('#create-select-button').on('click', () => {
  //open dialog

  calculateCurrentShapeForNewComp();

  if (currentShape && currentShape.getAttr('editable')) {
    //reset inputs for create
    document.getElementById('custom-select-text').value = '';
    document.getElementById('custom-select-text-size').value = 12;
    document.getElementById('custom-select-text-color').value = '#000000';
    document.getElementById('custom-select-color').value = '#ffffff';
    $('#custom-select-dialog').dialog('open');
    document.getElementById('select-state-span').dataset.selectState = 'create';
    document.getElementById('custom-select-dialog-button').textContent =
      'Create Select';
  }
  return false;
});

// create new select (dropdown)
document
  .getElementById('custom-select-dialog-button')
  .addEventListener('click', () => {
    $('#custom-select-dialog').dialog('close');

    //get input elements
    const textInput = document.getElementById('custom-select-text');
    const textSizeInput = document.getElementById('custom-select-text-size');
    const textColorInput = document.getElementById('custom-select-text-color');
    const selectColorInput = document.getElementById('custom-select-color');
    const selectSizeInput = document.getElementById('custom-select-size');

    const selectIdSpan = document.getElementById('select-id-span');

    //get values
    const text = textInput.value || 'Sample Text';
    const textSize = parseFloat(textSizeInput.value) || 12;
    const textColor = textColorInput.value || '#000000';
    const selectColor = selectColorInput.value || '#ffffff';
    const selectSize = selectSizeInput.value || 'full';

    //get state
    let state = document.getElementById('select-state-span').dataset
      .selectState;

    //define some vars we need for both create and edit AND AFTERWARDS
    let selectGroup;
    let textObj;
    let fillObj;
    let box;
    let triangle;

    //map width
    let widthMap = {
      full: 250,
      twoThirds: 167,
      half: 125,
      oneThird: 83,
      fourth: 62,
    };
    let width = widthMap[selectSize] || 250;

    //check if its create or edit
    if (state === 'create') {
      //-------------------CREATE-------------------------
      let guiNode = guiNodes.find(
        (n) => n.id == currentShape.getParent().getParent().getAttr('id')
      );
      let currShapeParent = currentShape.getParent();
      selectGroup = currShapeParent.clone();

      selectGroup.destroyChildren();

      var newId = getNextId(guiNode);
      newId = guiNode['id'] + '_' + newId;
      selectGroup.setAttr('name', newId);
      selectGroup.setAttr('id', newId);
      selectGroup.setAttr('visible', true);

      selectGroup.setAttr('isCustom', true);

      //create the children: text, box and arrow
      textObj = new Konva.Text({
        text: text,
        id: newId + '_img',
        name: newId + '_img',
        fontSize: textSize,
        fill: textColor,
        x: 5,
        verticalAlign: 'middle',
      });

      fillObj = new Konva.Rect({
        x: 0,
        y: 0,

        fill: selectColor,
        id: newId + '_img',
        name: newId + '_img',
      });

      triangle = new Konva.RegularPolygon({
        sides: 3,
        fill: '#777777',
        id: newId + '_img',
        name: newId + '_img',
      });

      triangle.rotate(180);
      triangle.setAttr('isTriangle', true);

      box = new Konva.Rect({
        x: fillObj.x(),
        y: fillObj.y(),

        stroke_ori: 'green',
        stroke: 'green',
        strokeWidth: 2,
        opacity: 0.3,
        id: newId,
        name: newId,
      });

      //set editable on box to true
      box.setAttr('editable', true);

      box.on('mousedown', (e) => addBoxTransitionEventListener(e, box));

      //add children to group
      selectGroup.add(fillObj);
      selectGroup.add(textObj);
      selectGroup.add(triangle);
      selectGroup.add(box);

      // apply small offset
      var newOffset = 20;
      selectGroup.setAttr('x', selectGroup.getAttr('x') + newOffset);
      selectGroup.setAttr('y', selectGroup.getAttr('y') + newOffset);

      //apply doubleclick event listener
      selectGroup.off('dblclick');
      selectGroup.on('dblclick', function () {
        //set state to edit
        document.getElementById('select-state-span').dataset.selectState =
          'edit';

        //get konva objects
        const textObject = this.getChildren()[1];
        const fillObject = this.getChildren()[0];

        //set inputs
        textInput.value = textObject.getAttr('text');
        textSizeInput.value = textObject.getAttr('fontSize');
        textColorInput.value = textObject.getAttr('fill');
        selectColorInput.value = fillObject.getAttr('fill');
        selectSizeInput.value = fillObject.getAttr('selectWidth');

        //set id
        selectIdSpan.dataset.selectId = fillObject.getAttr('id');

        //set text on button
        document.getElementById('custom-select-dialog-button').textContent =
          'Edit Select';

        //open dialog
        $('#custom-select-dialog').dialog('open');
      });

      //create and add new uiCompObject to data model
      var uiCompObject1 = guiNode.uiCompObjects.find(
        (n) => n['id'] == currentShape.getAttr('id')
      );
      var newCompObj = Object.assign({}, uiCompObject1);
      newCompObj['id'] = newId;
      newCompObj['comp_label'] = 'CustomSelect';
      newCompObj['plain_json'] = {};
      newCompObj['crop_group'] = selectGroup.clone();
      newCompObj['isBlank'] = false;
      newCompObj['isGroup'] = false;

      guiNode.uiCompObjects.push(newCompObj);

      //add to konva group
      var currGroup = currentShape.getParent().getParent();

      currGroup.add(selectGroup);
    } else if (state === 'edit') {
      //-------------------EDIT-------------------------
      //get correct  konva entities
      const konvaObjs = layer.find(`#${selectIdSpan.dataset.selectId}`);

      selectGroup = null;
      for (o in konvaObjs) {
        let obj = konvaObjs[o];

        if (typeof obj == 'number' || typeof obj == 'function') continue;
        if (!selectGroup) selectGroup = obj.getParent();
        if (obj.getClassName() === 'Text') {
          obj.setAttr('text', textInput.value);
          obj.setAttr('fontSize', parseInt(textSizeInput.value, 10));
          obj.setAttr('fill', textColorInput.value);
        } else if (obj.getClassName() === 'Rect') {
          obj.setAttr('fill', selectColorInput.value);
        }
      }

      fillObj = selectGroup.getChildren()[0];
      textObj = selectGroup.getChildren()[1];
      triangle = selectGroup.getChildren()[2];
      box = selectGroup.getChildren()[3];

      //update ui comp object in data model
      let dataModelId = selectIdSpan.dataset.selectId.split('_');
      let compId = dataModelId[0] + '_' + dataModelId[1] + '_' + dataModelId[2];
      let nodeId = dataModelId[0] + '_' + dataModelId[1];

      let nodeObj = guiNodes.find((node) => node.id === nodeId);
      let compObj = nodeObj.uiCompObjects.find((comp) => comp.id === compId);

      if (compObj) compObj['crop_group'] = selectGroup.clone();
    }

    //limit the text width

    textObj.width(width - 10);

    let extraHeight = textSize * 1.5;

    textObj.height(textObj.getTextHeight() + extraHeight);
    //set width and height accordingly
    fillObj.width(width);
    fillObj.height(textObj.height());
    fillObj.setAttr('selectWidth', selectSize);

    box.width(fillObj.width());
    box.height(fillObj.height());

    selectGroup.width(box.width());
    selectGroup.height(box.height());

    //scale and position traingle
    triangle.radius(textObj.getAttr('fontSize') * 0.6);
    triangle.x(box.x() + box.width() - triangle.width());
    triangle.y(box.y() + box.height() - triangle.height());

    triangle.setAttr('isTriangle', true);
    //refresh layer and konva player
    // selectGroup.fire('dragstart');
    selectGroup.fire('dragend');
    layer.batchDraw();
    if (guiNodes) {
      createKonvaPlayer();
    }

    //at the end: set state back to normal
    document.getElementById('select-state-span').dataset.selectState = '';

    //at the end: reset input fields
    textInput.value = '';
    textSizeInput.value = 12;
    textColorInput.value = '#000000';
    selectColorInput.value = '#ffffff';
    selectSizeInput.value = 'full';
  });

// ==============================SELECT (DROPDOWN) end========================================

// ==============================CHECKBOX start========================================

//register create checkbox dialog
$('#custom-checkbox-dialog').dialog({
  autoOpen: false,
  title: 'Create / Edit custom checkbox',
});

//click on create checkbox button and open dialog
$('#create-checkbox-button').on('click', () => {
  //open dialog

  calculateCurrentShapeForNewComp();

  if (currentShape && currentShape.getAttr('editable')) {
    //reset inputs for create

    document.getElementById('custom-checkbox-size').value = 12;
    document.getElementById('custom-checkbox-border-color').value = '#000000';
    document.getElementById('custom-checkbox-color').value = '#cccccc';
    $('#custom-checkbox-dialog').dialog('open');
    document.getElementById('checkbox-state-span').dataset.checkboxState =
      'create';
    document.getElementById('custom-checkbox-dialog-button').textContent =
      'Create checkbox';
  }
  return false;
});

// create new select (dropdown)
document
  .getElementById('custom-checkbox-dialog-button')
  .addEventListener('click', () => {
    $('#custom-checkbox-dialog').dialog('close');

    //get input elements

    const sizeInput = document.getElementById('custom-checkbox-size');
    const borderColorInput = document.getElementById(
      'custom-checkbox-border-color'
    );
    const checkboxColorInput = document.getElementById('custom-checkbox-color');

    const checkboxIdSpan = document.getElementById('checkbox-id-span');

    //get values

    const size = parseFloat(sizeInput.value) || 12;
    const borderColor = borderColorInput.value || '#000000';
    const checkboxColor = checkboxColorInput.value || '#cccccc';

    //get state
    let state = document.getElementById('checkbox-state-span').dataset
      .checkboxState;

    //define some vars we need for both create and edit AND AFTERWARDS
    let checkboxGroup;
    let borderObj;
    let fillObj;
    let box;

    //check if its create or edit
    if (state === 'create') {
      //-------------------CREATE-------------------------
      let guiNode = guiNodes.find(
        (n) => n.id == currentShape.getParent().getParent().getAttr('id')
      );
      let currShapeParent = currentShape.getParent();
      checkboxGroup = currShapeParent.clone();

      checkboxGroup.destroyChildren();

      var newId = getNextId(guiNode);
      newId = guiNode['id'] + '_' + newId;
      checkboxGroup.setAttr('name', newId);
      checkboxGroup.setAttr('id', newId);
      checkboxGroup.setAttr('visible', true);

      checkboxGroup.setAttr('isCustom', true);

      //create the children: fill, border and box
      fillObj = new Konva.Rect({
        x: 0,
        y: 0,
        fill: checkboxColor,
        id: newId + '_img',
        name: newId + '_img',
      });

      fillObj.setAttr('isFill', true);

      borderObj = new Konva.Rect({
        stroke: borderColor,
        strokeWidth: 2,
        id: newId + '_img',
        name: newId + '_img',
      });

      borderObj.setAttr('isBorder', true);

      box = new Konva.Rect({
        x: borderObj.x(),
        y: borderObj.y(),

        stroke_ori: 'green',
        stroke: 'green',
        strokeWidth: 2,
        opacity: 0.3,
        id: newId,
        name: newId,
      });

      //set editable on box to true
      box.setAttr('editable', true);

      box.on('mousedown', (e) => addBoxTransitionEventListener(e, box));

      //add children to group
      checkboxGroup.add(fillObj);
      checkboxGroup.add(borderObj);

      checkboxGroup.add(box);

      // apply small offset
      var newOffset = 20;
      checkboxGroup.setAttr('x', checkboxGroup.getAttr('x') + newOffset);
      checkboxGroup.setAttr('y', checkboxGroup.getAttr('y') + newOffset);

      //apply doubleclick event listener
      checkboxGroup.off('dblclick');
      checkboxGroup.on('dblclick', function () {
        //set state to edit
        document.getElementById('checkbox-state-span').dataset.checkboxState =
          'edit';

        //get konva objects
        const borderObject = this.getChildren()[1];
        const fillObject = this.getChildren()[0];

        //set inputs

        borderColorInput.value = borderObject.getAttr('stroke');
        checkboxColorInput.value = fillObject.getAttr('fill');
        sizeInput.value = borderObject.getAttr('width');

        //set id
        checkboxIdSpan.dataset.checkboxId = fillObject.getAttr('id');

        //set text on button
        document.getElementById('custom-checkbox-dialog-button').textContent =
          'Edit checkbox';

        //open dialog
        $('#custom-checkbox-dialog').dialog('open');
      });

      //create and add new uiCompObject to data model
      var uiCompObject1 = guiNode.uiCompObjects.find(
        (n) => n['id'] == currentShape.getAttr('id')
      );
      var newCompObj = Object.assign({}, uiCompObject1);
      newCompObj['id'] = newId;
      newCompObj['comp_label'] = 'CustomCheckbox';
      newCompObj['plain_json'] = {};
      newCompObj['crop_group'] = checkboxGroup.clone();
      newCompObj['isBlank'] = false;
      newCompObj['isGroup'] = false;

      guiNode.uiCompObjects.push(newCompObj);

      //add to konva group
      var currGroup = currentShape.getParent().getParent();

      currGroup.add(checkboxGroup);
    } else if (state === 'edit') {
      //-------------------EDIT-------------------------
      //get correct  konva entities
      const konvaObjs = layer.find(`#${checkboxIdSpan.dataset.checkboxId}`);

      checkboxGroup = null;
      for (o in konvaObjs) {
        let obj = konvaObjs[o];

        if (typeof obj == 'number' || typeof obj == 'function') continue;
        if (!checkboxGroup) checkboxGroup = obj.getParent();
        if (obj.getClassName() === 'Rect' && obj.getAttr('isFill')) {
          obj.setAttr('fill', checkboxColorInput.value);
        } else if (obj.getClassName() === 'Rect' && obj.getAttr('isBorder')) {
          obj.setAttr('stroke', borderColorInput.value);
        }
      }

      fillObj = checkboxGroup.getChildren()[0];
      borderObj = checkboxGroup.getChildren()[1];
      box = checkboxGroup.getChildren()[2];

      //update ui comp object in data model
      let dataModelId = checkboxIdSpan.dataset.checkboxId.split('_');
      let compId = dataModelId[0] + '_' + dataModelId[1] + '_' + dataModelId[2];
      let nodeId = dataModelId[0] + '_' + dataModelId[1];

      let nodeObj = guiNodes.find((node) => node.id === nodeId);
      let compObj = nodeObj.uiCompObjects.find((comp) => comp.id === compId);

      if (compObj) compObj['crop_group'] = checkboxGroup.clone();
    }

    fillObj.width(size);
    fillObj.height(size);

    borderObj.width(fillObj.width());
    borderObj.height(fillObj.height());

    box.width(borderObj.width());
    box.height(borderObj.height());

    checkboxGroup.width(box.width());
    checkboxGroup.height(box.height());

    //refresh layer and konva player
    // checkboxGroup.fire('dragstart');
    checkboxGroup.fire('dragend');
    layer.batchDraw();

    if (guiNodes) {
      createKonvaPlayer();
    }

    //at the end: set state back to normal
    document.getElementById('checkbox-state-span').dataset.checkboxState = '';

    //at the end: reset input fields

    sizeInput.value = 12;
    borderColorInput.value = '#000000';
    checkboxColorInput.value = '#cccccc';
  });

// ==============================CHECKBOX end========================================

// ==============================RADIO start========================================

//register create checkbox dialog
$('#custom-radio-dialog').dialog({
  autoOpen: false,
  title: 'Create / Edit custom radio',
});

//click on create radio button and open dialog
$('#create-radio-button').on('click', () => {
  //open dialog

  calculateCurrentShapeForNewComp();

  if (currentShape && currentShape.getAttr('editable')) {
    //reset inputs for create

    document.getElementById('custom-radio-size').value = 12;
    document.getElementById('custom-radio-border-color').value = '#000000';
    document.getElementById('custom-radio-color').value = '#cccccc';
    $('#custom-radio-dialog').dialog('open');
    document.getElementById('radio-state-span').dataset.radioState = 'create';
    document.getElementById('custom-radio-dialog-button').textContent =
      'Create radio';
  }
  return false;
});

// create new radio
document
  .getElementById('custom-radio-dialog-button')
  .addEventListener('click', () => {
    $('#custom-radio-dialog').dialog('close');

    //get input elements

    const sizeInput = document.getElementById('custom-radio-size');
    const borderColorInput = document.getElementById(
      'custom-radio-border-color'
    );
    const radioColorInput = document.getElementById('custom-radio-color');

    const radioIdSpan = document.getElementById('radio-id-span');

    //get values

    const size = parseFloat(sizeInput.value) || 12;
    const borderColor = borderColorInput.value || '#000000';
    const radioColor = radioColorInput.value || '#cccccc';

    //get state
    let state = document.getElementById('radio-state-span').dataset.radioState;

    //define some vars we need for both create and edit AND AFTERWARDS
    let radioGroup;
    let borderObj;
    let fillObj;
    let box;

    //check if its create or edit
    if (state === 'create') {
      //-------------------CREATE-------------------------
      let guiNode = guiNodes.find(
        (n) => n.id == currentShape.getParent().getParent().getAttr('id')
      );
      let currShapeParent = currentShape.getParent();
      radioGroup = currShapeParent.clone();

      radioGroup.destroyChildren();

      var newId = getNextId(guiNode);
      newId = guiNode['id'] + '_' + newId;
      radioGroup.setAttr('name', newId);
      radioGroup.setAttr('id', newId);
      radioGroup.setAttr('visible', true);

      radioGroup.setAttr('isCustom', true);

      //create the children: fill, border and box
      fillObj = new Konva.Circle({
        x: 0,
        y: 0,
        fill: radioColor,
        id: newId + '_img',
        name: newId + '_img',
      });

      fillObj.setAttr('isFill', true);

      borderObj = new Konva.Circle({
        stroke: borderColor,
        strokeWidth: 2,
        id: newId + '_img',
        name: newId + '_img',
      });

      borderObj.setAttr('isBorder', true);

      box = new Konva.Rect({
        x: borderObj.x(),
        y: borderObj.y(),

        stroke_ori: 'green',
        stroke: 'green',
        strokeWidth: 2,
        opacity: 0.3,
        id: newId,
        name: newId,
      });

      //set editable on box to true
      box.setAttr('editable', true);

      box.on('mousedown', (e) => addBoxTransitionEventListener(e, box));

      //add children to group
      radioGroup.add(fillObj);
      radioGroup.add(borderObj);

      radioGroup.add(box);

      // apply small offset
      var newOffset = 20;
      radioGroup.setAttr('x', radioGroup.getAttr('x') + newOffset);
      radioGroup.setAttr('y', radioGroup.getAttr('y') + newOffset);

      //apply doubleclick event listener
      radioGroup.off('dblclick');
      radioGroup.on('dblclick', function () {
        //set state to edit
        document.getElementById('radio-state-span').dataset.radioState = 'edit';

        //get konva objects
        const borderObject = this.getChildren()[1];
        const fillObject = this.getChildren()[0];

        //set inputs

        borderColorInput.value = borderObject.getAttr('stroke');
        radioColorInput.value = fillObject.getAttr('fill');
        sizeInput.value = borderObject.getAttr('width');

        //set id
        radioIdSpan.dataset.radioId = fillObject.getAttr('id');

        //set text on button
        document.getElementById('custom-radio-dialog-button').textContent =
          'Edit radio';

        //open dialog
        $('#custom-radio-dialog').dialog('open');
      });

      //create and add new uiCompObject to data model
      var uiCompObject1 = guiNode.uiCompObjects.find(
        (n) => n['id'] == currentShape.getAttr('id')
      );
      var newCompObj = Object.assign({}, uiCompObject1);
      newCompObj['id'] = newId;
      newCompObj['comp_label'] = 'CustomRadio';
      newCompObj['plain_json'] = {};
      newCompObj['crop_group'] = radioGroup.clone();
      newCompObj['isBlank'] = false;
      newCompObj['isGroup'] = false;

      guiNode.uiCompObjects.push(newCompObj);

      //add to konva group
      var currGroup = currentShape.getParent().getParent();

      currGroup.add(radioGroup);
    } else if (state === 'edit') {
      //-------------------EDIT-------------------------
      //get correct  konva entities
      const konvaObjs = layer.find(`#${radioIdSpan.dataset.radioId}`);

      radioGroup = null;
      for (o in konvaObjs) {
        let obj = konvaObjs[o];

        if (typeof obj == 'number' || typeof obj == 'function') continue;
        if (!radioGroup) radioGroup = obj.getParent();
        if (obj.getClassName() === 'Circle' && obj.getAttr('isFill')) {
          obj.setAttr('fill', radioColorInput.value);
        } else if (obj.getClassName() === 'Circle' && obj.getAttr('isBorder')) {
          obj.setAttr('stroke', borderColorInput.value);
        }
      }

      fillObj = radioGroup.getChildren()[0];
      borderObj = radioGroup.getChildren()[1];
      box = radioGroup.getChildren()[2];

      //update ui comp object in data model
      let dataModelId = radioIdSpan.dataset.radioId.split('_');
      let compId = dataModelId[0] + '_' + dataModelId[1] + '_' + dataModelId[2];
      let nodeId = dataModelId[0] + '_' + dataModelId[1];

      let nodeObj = guiNodes.find((node) => node.id === nodeId);
      let compObj = nodeObj.uiCompObjects.find((comp) => comp.id === compId);

      if (compObj) compObj['crop_group'] = radioGroup.clone();
    }

    fillObj.width(size);
    fillObj.height(size);

    fillObj.x(fillObj.width() / 2);
    fillObj.y(fillObj.height() / 2);

    borderObj.width(fillObj.width());
    borderObj.height(fillObj.height());

    borderObj.x(fillObj.x());
    borderObj.y(fillObj.y());

    box.width(borderObj.width());
    box.height(borderObj.height());

    radioGroup.width(box.width());
    radioGroup.height(box.height());

    //refresh layer and konva player
    // radioGroup.fire('dragstart');
    radioGroup.fire('dragend');
    layer.batchDraw();

    if (guiNodes) {
      createKonvaPlayer();
    }

    //at the end: set state back to normal
    document.getElementById('radio-state-span').dataset.radioState = '';

    //at the end: reset input fields

    sizeInput.value = 12;
    borderColorInput.value = '#000000';
    radioColorInput.value = '#cccccc';
  });

// ==============================RADIO end========================================

//register listeners for pressing enter in dialogs

document
  .querySelector('#create-label-dialog')
  .addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      document.querySelector('#create-label-dialog-button').click();
    }
  });

document
  .querySelector('#edit-label-dialog')
  .addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      document.querySelector('#edit-label-dialog-button').click();
    }
  });

document
  .querySelector('#create-button-dialog')
  .addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      document.querySelector('#create-button-dialog-button').click();
    }
  });

document
  .querySelector('#edit-button-dialog')
  .addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      document.querySelector('#edit-button-dialog-button').click();
    }
  });

document
  .querySelector('#create-input-dialog')
  .addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      document.querySelector('#create-input-dialog-button').click();
    }
  });

document
  .querySelector('#edit-input-dialog')
  .addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      document.querySelector('#edit-input-dialog-button').click();
    }
  });

document
  .querySelector('#create-image-dialog')
  .addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      document.querySelector('#create-image-dialog-button').click();
    }
  });

document
  .querySelector('#edit-image-dialog')
  .addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      document.querySelector('#edit-image-dialog-button').click();
    }
  });

document
  .querySelector('#custom-select-dialog')
  .addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      document.querySelector('#custom-select-dialog-button').click();
    }
  });

document
  .querySelector('#custom-checkbox-dialog')
  .addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      document.querySelector('#custom-checkbox-dialog-button').click();
    }
  });

document
  .querySelector('#custom-radio-dialog')
  .addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      document.querySelector('#custom-radio-dialog-button').click();
    }
  });

},{"./createCustomComps":1,"./export":2,"./fetchData":3,"./guiKonva":4,"./helpers":5,"./import":6,"./vars":8,"konva":49}],8:[function(require,module,exports){
const Konva = require('konva');
var isEditModeOn = { value: true };
var showUICinPreview = { value: false };
var width = 1870;
var height = 2000;

var stage = new Konva.Stage({
  container: 'container-konva',
  width: width,
  height: height,
});

var layer = new Konva.Layer();

var currentSelectedComp = { value: null };

var graph = null;
var guiNodes = [];
var transitions = [];

var blockSnapSize = 30;
var shadowOffset = 10;
var tween = null;

var userSetStartNodeId = {};

component_color_mapping = {
  'Background Image': 'red',
  Image: 'pink',
  Input: 'yellow',
  'Text Button': 'blue',
  Button: 'blue',
  Text: 'green',
};

guiStack = [];

importHelper = {
  guisInitialized: [],
  guisLoaded: [],
};

module.exports['vars'] = {
  isEditModeOn,
  showUICinPreview,
  width,
  height,
  stage,
  layer,
  currentSelectedComp,
  graph,
  guiNodes,
  transitions,
  blockSnapSize,
  shadowOffset,
  tween,
  userSetStartNodeId,
  component_color_mapping,
  guiStack,
  importHelper,
};

},{"konva":49}],9:[function(require,module,exports){
(function (global){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.JSONPath = {}));
}(this, (function (exports) { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (_isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }

  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf(Wrapper, Class);
    };

    return _wrapNativeSuper(Class);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _createSuper(Derived) {
    return function () {
      var Super = _getPrototypeOf(Derived),
          result;

      if (_isNativeReflectConstruct()) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _createForOfIteratorHelper(o) {
    if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
      if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) {
        var i = 0;

        var F = function () {};

        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }

      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var it,
        normalCompletion = true,
        didErr = false,
        err;
    return {
      s: function () {
        it = o[Symbol.iterator]();
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }

  /* eslint-disable prefer-named-capture-group */
  // Disabled `prefer-named-capture-group` due to https://github.com/babel/babel/issues/8951#issuecomment-508045524
  // Only Node.JS has a process variable that is of [[Class]] process
  var supportsNodeVM = function supportsNodeVM() {
    try {
      return Object.prototype.toString.call(global.process) === '[object process]';
    } catch (e) {
      return false;
    }
  };

  var hasOwnProp = Object.prototype.hasOwnProperty;
  /**
  * @typedef {null|boolean|number|string|PlainObject|GenericArray} JSONObject
  */

  /**
  * @callback ConditionCallback
  * @param {any} item
  * @returns {boolean}
  */

  /**
   * Copy items out of one array into another.
   * @param {GenericArray} source Array with items to copy
   * @param {GenericArray} target Array to which to copy
   * @param {ConditionCallback} conditionCb Callback passed the current item;
   *     will move item if evaluates to `true`
   * @returns {void}
   */

  var moveToAnotherArray = function moveToAnotherArray(source, target, conditionCb) {
    var il = source.length;

    for (var i = 0; i < il; i++) {
      var item = source[i];

      if (conditionCb(item)) {
        target.push(source.splice(i--, 1)[0]);
      }
    }
  };

  JSONPath.nodeVMSupported = supportsNodeVM();
  var vm = JSONPath.nodeVMSupported ? require('vm') : {
    /**
     * @param {string} expr Expression to evaluate
     * @param {PlainObject} context Object whose items will be added
     *   to evaluation
     * @returns {any} Result of evaluated code
     */
    runInNewContext: function runInNewContext(expr, context) {
      var keys = Object.keys(context);
      var funcs = [];
      moveToAnotherArray(keys, funcs, function (key) {
        return typeof context[key] === 'function';
      });
      var values = keys.map(function (vr, i) {
        return context[vr];
      });
      var funcString = funcs.reduce(function (s, func) {
        var fString = context[func].toString();

        if (!/function/.test(fString)) {
          fString = 'function ' + fString;
        }

        return 'var ' + func + '=' + fString + ';' + s;
      }, '');
      expr = funcString + expr; // Mitigate http://perfectionkills.com/global-eval-what-are-the-options/#new_function

      if (!expr.match(/(["'])use strict\1/) && !keys.includes('arguments')) {
        expr = 'var arguments = undefined;' + expr;
      } // Remove last semi so `return` will be inserted before
      //  the previous one instead, allowing for the return
      //  of a bare ending expression


      expr = expr.replace(/;[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*$/, ''); // Insert `return`

      var lastStatementEnd = expr.lastIndexOf(';');
      var code = lastStatementEnd > -1 ? expr.slice(0, lastStatementEnd + 1) + ' return ' + expr.slice(lastStatementEnd + 1) : ' return ' + expr; // eslint-disable-next-line no-new-func

      return _construct(Function, _toConsumableArray(keys).concat([code])).apply(void 0, _toConsumableArray(values));
    }
  };
  /**
   * Copies array and then pushes item into it.
   * @param {GenericArray} arr Array to copy and into which to push
   * @param {any} item Array item to add (to end)
   * @returns {GenericArray} Copy of the original array
   */

  function push(arr, item) {
    arr = arr.slice();
    arr.push(item);
    return arr;
  }
  /**
   * Copies array and then unshifts item into it.
   * @param {any} item Array item to add (to beginning)
   * @param {GenericArray} arr Array to copy and into which to unshift
   * @returns {GenericArray} Copy of the original array
   */


  function unshift(item, arr) {
    arr = arr.slice();
    arr.unshift(item);
    return arr;
  }
  /**
   * Caught when JSONPath is used without `new` but rethrown if with `new`
   * @extends Error
   */


  var NewError = /*#__PURE__*/function (_Error) {
    _inherits(NewError, _Error);

    var _super = _createSuper(NewError);

    /**
     * @param {any} value The evaluated scalar value
     */
    function NewError(value) {
      var _this;

      _classCallCheck(this, NewError);

      _this = _super.call(this, 'JSONPath should not be called with "new" (it prevents return ' + 'of (unwrapped) scalar values)');
      _this.avoidNew = true;
      _this.value = value;
      _this.name = 'NewError';
      return _this;
    }

    return NewError;
  }( /*#__PURE__*/_wrapNativeSuper(Error));
  /**
  * @typedef {PlainObject} ReturnObject
  * @property {string} path
  * @property {JSONObject} value
  * @property {PlainObject|GenericArray} parent
  * @property {string} parentProperty
  */

  /**
  * @callback JSONPathCallback
  * @param {string|PlainObject} preferredOutput
  * @param {"value"|"property"} type
  * @param {ReturnObject} fullRetObj
  * @returns {void}
  */

  /**
  * @callback OtherTypeCallback
  * @param {JSONObject} val
  * @param {string} path
  * @param {PlainObject|GenericArray} parent
  * @param {string} parentPropName
  * @returns {boolean}
  */

  /**
   * @typedef {PlainObject} JSONPathOptions
   * @property {JSON} json
   * @property {string|string[]} path
   * @property {"value"|"path"|"pointer"|"parent"|"parentProperty"|"all"}
   *   [resultType="value"]
   * @property {boolean} [flatten=false]
   * @property {boolean} [wrap=true]
   * @property {PlainObject} [sandbox={}]
   * @property {boolean} [preventEval=false]
   * @property {PlainObject|GenericArray|null} [parent=null]
   * @property {string|null} [parentProperty=null]
   * @property {JSONPathCallback} [callback]
   * @property {OtherTypeCallback} [otherTypeCallback] Defaults to
   *   function which throws on encountering `@other`
   * @property {boolean} [autostart=true]
   */

  /**
   * @param {string|JSONPathOptions} opts If a string, will be treated as `expr`
   * @param {string} [expr] JSON path to evaluate
   * @param {JSON} [obj] JSON object to evaluate against
   * @param {JSONPathCallback} [callback] Passed 3 arguments: 1) desired payload
   *     per `resultType`, 2) `"value"|"property"`, 3) Full returned object with
   *     all payloads
   * @param {OtherTypeCallback} [otherTypeCallback] If `@other()` is at the end
   *   of one's query, this will be invoked with the value of the item, its
   *   path, its parent, and its parent's property name, and it should return
   *   a boolean indicating whether the supplied value belongs to the "other"
   *   type or not (or it may handle transformations and return `false`).
   * @returns {JSONPath}
   * @class
   */


  function JSONPath(opts, expr, obj, callback, otherTypeCallback) {
    // eslint-disable-next-line no-restricted-syntax
    if (!(this instanceof JSONPath)) {
      try {
        return new JSONPath(opts, expr, obj, callback, otherTypeCallback);
      } catch (e) {
        if (!e.avoidNew) {
          throw e;
        }

        return e.value;
      }
    }

    if (typeof opts === 'string') {
      otherTypeCallback = callback;
      callback = obj;
      obj = expr;
      expr = opts;
      opts = null;
    }

    var optObj = opts && _typeof(opts) === 'object';
    opts = opts || {};
    this.json = opts.json || obj;
    this.path = opts.path || expr;
    this.resultType = opts.resultType || 'value';
    this.flatten = opts.flatten || false;
    this.wrap = hasOwnProp.call(opts, 'wrap') ? opts.wrap : true;
    this.sandbox = opts.sandbox || {};
    this.preventEval = opts.preventEval || false;
    this.parent = opts.parent || null;
    this.parentProperty = opts.parentProperty || null;
    this.callback = opts.callback || callback || null;

    this.otherTypeCallback = opts.otherTypeCallback || otherTypeCallback || function () {
      throw new TypeError('You must supply an otherTypeCallback callback option ' + 'with the @other() operator.');
    };

    if (opts.autostart !== false) {
      var args = {
        path: optObj ? opts.path : expr
      };

      if (!optObj) {
        args.json = obj;
      } else if ('json' in opts) {
        args.json = opts.json;
      }

      var ret = this.evaluate(args);

      if (!ret || _typeof(ret) !== 'object') {
        throw new NewError(ret);
      }

      return ret;
    }
  } // PUBLIC METHODS


  JSONPath.prototype.evaluate = function (expr, json, callback, otherTypeCallback) {
    var that = this;
    var currParent = this.parent,
        currParentProperty = this.parentProperty;
    var flatten = this.flatten,
        wrap = this.wrap;
    this.currResultType = this.resultType;
    this.currPreventEval = this.preventEval;
    this.currSandbox = this.sandbox;
    callback = callback || this.callback;
    this.currOtherTypeCallback = otherTypeCallback || this.otherTypeCallback;
    json = json || this.json;
    expr = expr || this.path;

    if (expr && _typeof(expr) === 'object' && !Array.isArray(expr)) {
      if (!expr.path && expr.path !== '') {
        throw new TypeError('You must supply a "path" property when providing an object ' + 'argument to JSONPath.evaluate().');
      }

      if (!hasOwnProp.call(expr, 'json')) {
        throw new TypeError('You must supply a "json" property when providing an object ' + 'argument to JSONPath.evaluate().');
      }

      var _expr = expr;
      json = _expr.json;
      flatten = hasOwnProp.call(expr, 'flatten') ? expr.flatten : flatten;
      this.currResultType = hasOwnProp.call(expr, 'resultType') ? expr.resultType : this.currResultType;
      this.currSandbox = hasOwnProp.call(expr, 'sandbox') ? expr.sandbox : this.currSandbox;
      wrap = hasOwnProp.call(expr, 'wrap') ? expr.wrap : wrap;
      this.currPreventEval = hasOwnProp.call(expr, 'preventEval') ? expr.preventEval : this.currPreventEval;
      callback = hasOwnProp.call(expr, 'callback') ? expr.callback : callback;
      this.currOtherTypeCallback = hasOwnProp.call(expr, 'otherTypeCallback') ? expr.otherTypeCallback : this.currOtherTypeCallback;
      currParent = hasOwnProp.call(expr, 'parent') ? expr.parent : currParent;
      currParentProperty = hasOwnProp.call(expr, 'parentProperty') ? expr.parentProperty : currParentProperty;
      expr = expr.path;
    }

    currParent = currParent || null;
    currParentProperty = currParentProperty || null;

    if (Array.isArray(expr)) {
      expr = JSONPath.toPathString(expr);
    }

    if (!expr && expr !== '' || !json) {
      return undefined;
    }

    this._obj = json;
    var exprList = JSONPath.toPathArray(expr);

    if (exprList[0] === '$' && exprList.length > 1) {
      exprList.shift();
    }

    this._hasParentSelector = null;

    var result = this._trace(exprList, json, ['$'], currParent, currParentProperty, callback).filter(function (ea) {
      return ea && !ea.isParentSelector;
    });

    if (!result.length) {
      return wrap ? [] : undefined;
    }

    if (!wrap && result.length === 1 && !result[0].hasArrExpr) {
      return this._getPreferredOutput(result[0]);
    }

    return result.reduce(function (rslt, ea) {
      var valOrPath = that._getPreferredOutput(ea);

      if (flatten && Array.isArray(valOrPath)) {
        rslt = rslt.concat(valOrPath);
      } else {
        rslt.push(valOrPath);
      }

      return rslt;
    }, []);
  }; // PRIVATE METHODS


  JSONPath.prototype._getPreferredOutput = function (ea) {
    var resultType = this.currResultType;

    switch (resultType) {
      default:
        throw new TypeError('Unknown result type');

      case 'all':
        {
          var path = Array.isArray(ea.path) ? ea.path : JSONPath.toPathArray(ea.path);
          ea.pointer = JSONPath.toPointer(path);
          ea.path = typeof ea.path === 'string' ? ea.path : JSONPath.toPathString(ea.path);
          return ea;
        }

      case 'value':
      case 'parent':
      case 'parentProperty':
        return ea[resultType];

      case 'path':
        return JSONPath.toPathString(ea[resultType]);

      case 'pointer':
        return JSONPath.toPointer(ea.path);
    }
  };

  JSONPath.prototype._handleCallback = function (fullRetObj, callback, type) {
    if (callback) {
      var preferredOutput = this._getPreferredOutput(fullRetObj);

      fullRetObj.path = typeof fullRetObj.path === 'string' ? fullRetObj.path : JSONPath.toPathString(fullRetObj.path); // eslint-disable-next-line callback-return

      callback(preferredOutput, type, fullRetObj);
    }
  };
  /**
   *
   * @param {string} expr
   * @param {JSONObject} val
   * @param {string} path
   * @param {PlainObject|GenericArray} parent
   * @param {string} parentPropName
   * @param {JSONPathCallback} callback
   * @param {boolean} hasArrExpr
   * @param {boolean} literalPriority
   * @returns {ReturnObject|ReturnObject[]}
   */


  JSONPath.prototype._trace = function (expr, val, path, parent, parentPropName, callback, hasArrExpr, literalPriority) {
    // No expr to follow? return path and value as the result of
    //  this trace branch
    var retObj;
    var that = this;

    if (!expr.length) {
      retObj = {
        path: path,
        value: val,
        parent: parent,
        parentProperty: parentPropName,
        hasArrExpr: hasArrExpr
      };

      this._handleCallback(retObj, callback, 'value');

      return retObj;
    }

    var loc = expr[0],
        x = expr.slice(1); // We need to gather the return value of recursive trace calls in order to
    // do the parent sel computation.

    var ret = [];
    /**
     *
     * @param {ReturnObject|ReturnObject[]} elems
     * @returns {void}
     */

    function addRet(elems) {
      if (Array.isArray(elems)) {
        // This was causing excessive stack size in Node (with or
        //  without Babel) against our performance test:
        //  `ret.push(...elems);`
        elems.forEach(function (t) {
          ret.push(t);
        });
      } else {
        ret.push(elems);
      }
    }

    if ((typeof loc !== 'string' || literalPriority) && val && hasOwnProp.call(val, loc)) {
      // simple case--directly follow property
      addRet(this._trace(x, val[loc], push(path, loc), val, loc, callback, hasArrExpr));
    } else if (loc === '*') {
      // all child properties
      this._walk(loc, x, val, path, parent, parentPropName, callback, function (m, l, _x, v, p, par, pr, cb) {
        addRet(that._trace(unshift(m, _x), v, p, par, pr, cb, true, true));
      });
    } else if (loc === '..') {
      // all descendent parent properties
      // Check remaining expression with val's immediate children
      addRet(this._trace(x, val, path, parent, parentPropName, callback, hasArrExpr));

      this._walk(loc, x, val, path, parent, parentPropName, callback, function (m, l, _x, v, p, par, pr, cb) {
        // We don't join m and x here because we only want parents,
        //   not scalar values
        if (_typeof(v[m]) === 'object') {
          // Keep going with recursive descent on val's
          //   object children
          addRet(that._trace(unshift(l, _x), v[m], push(p, m), v, m, cb, true));
        }
      }); // The parent sel computation is handled in the frame above using the
      // ancestor object of val

    } else if (loc === '^') {
      // This is not a final endpoint, so we do not invoke the callback here
      this._hasParentSelector = true;
      return {
        path: path.slice(0, -1),
        expr: x,
        isParentSelector: true
      };
    } else if (loc === '~') {
      // property name
      retObj = {
        path: push(path, loc),
        value: parentPropName,
        parent: parent,
        parentProperty: null
      };

      this._handleCallback(retObj, callback, 'property');

      return retObj;
    } else if (loc === '$') {
      // root only
      addRet(this._trace(x, val, path, null, null, callback, hasArrExpr));
    } else if (/^(\x2D?[0-9]*):(\x2D?[0-9]*):?([0-9]*)$/.test(loc)) {
      // [start:end:step]  Python slice syntax
      addRet(this._slice(loc, x, val, path, parent, parentPropName, callback));
    } else if (loc.indexOf('?(') === 0) {
      // [?(expr)] (filtering)
      if (this.currPreventEval) {
        throw new Error('Eval [?(expr)] prevented in JSONPath expression.');
      }

      this._walk(loc, x, val, path, parent, parentPropName, callback, function (m, l, _x, v, p, par, pr, cb) {
        if (that._eval(l.replace(/^\?\(((?:[\0-\t\x0B\f\x0E-\u2027\u202A-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*?)\)$/, '$1'), v[m], m, p, par, pr)) {
          addRet(that._trace(unshift(m, _x), v, p, par, pr, cb, true));
        }
      });
    } else if (loc[0] === '(') {
      // [(expr)] (dynamic property/index)
      if (this.currPreventEval) {
        throw new Error('Eval [(expr)] prevented in JSONPath expression.');
      } // As this will resolve to a property name (but we don't know it
      //  yet), property and parent information is relative to the
      //  parent of the property to which this expression will resolve


      addRet(this._trace(unshift(this._eval(loc, val, path[path.length - 1], path.slice(0, -1), parent, parentPropName), x), val, path, parent, parentPropName, callback, hasArrExpr));
    } else if (loc[0] === '@') {
      // value type: @boolean(), etc.
      var addType = false;
      var valueType = loc.slice(1, -2);

      switch (valueType) {
        /* istanbul ignore next */
        default:
          throw new TypeError('Unknown value type ' + valueType);

        case 'scalar':
          if (!val || !['object', 'function'].includes(_typeof(val))) {
            addType = true;
          }

          break;

        case 'boolean':
        case 'string':
        case 'undefined':
        case 'function':
          // eslint-disable-next-line valid-typeof
          if (_typeof(val) === valueType) {
            addType = true;
          }

          break;

        case 'integer':
          if (Number.isFinite(val) && !(val % 1)) {
            addType = true;
          }

          break;

        case 'number':
          if (Number.isFinite(val)) {
            addType = true;
          }

          break;

        case 'nonFinite':
          if (typeof val === 'number' && !Number.isFinite(val)) {
            addType = true;
          }

          break;

        case 'object':
          // eslint-disable-next-line valid-typeof
          if (val && _typeof(val) === valueType) {
            addType = true;
          }

          break;

        case 'array':
          if (Array.isArray(val)) {
            addType = true;
          }

          break;

        case 'other':
          addType = this.currOtherTypeCallback(val, path, parent, parentPropName);
          break;

        case 'null':
          if (val === null) {
            addType = true;
          }

          break;
      }

      if (addType) {
        retObj = {
          path: path,
          value: val,
          parent: parent,
          parentProperty: parentPropName
        };

        this._handleCallback(retObj, callback, 'value');

        return retObj;
      } // `-escaped property

    } else if (loc[0] === '`' && val && hasOwnProp.call(val, loc.slice(1))) {
      var locProp = loc.slice(1);
      addRet(this._trace(x, val[locProp], push(path, locProp), val, locProp, callback, hasArrExpr, true));
    } else if (loc.includes(',')) {
      // [name1,name2,...]
      var parts = loc.split(',');

      var _iterator = _createForOfIteratorHelper(parts),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var part = _step.value;
          addRet(this._trace(unshift(part, x), val, path, parent, parentPropName, callback, true));
        } // simple case--directly follow property

      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    } else if (!literalPriority && val && hasOwnProp.call(val, loc)) {
      addRet(this._trace(x, val[loc], push(path, loc), val, loc, callback, hasArrExpr, true));
    } // We check the resulting values for parent selections. For parent
    // selections we discard the value object and continue the trace with the
    // current val object


    if (this._hasParentSelector) {
      for (var t = 0; t < ret.length; t++) {
        var rett = ret[t];

        if (rett && rett.isParentSelector) {
          var tmp = that._trace(rett.expr, val, rett.path, parent, parentPropName, callback, hasArrExpr);

          if (Array.isArray(tmp)) {
            ret[t] = tmp[0];
            var tl = tmp.length;

            for (var tt = 1; tt < tl; tt++) {
              t++;
              ret.splice(t, 0, tmp[tt]);
            }
          } else {
            ret[t] = tmp;
          }
        }
      }
    }

    return ret;
  };

  JSONPath.prototype._walk = function (loc, expr, val, path, parent, parentPropName, callback, f) {
    if (Array.isArray(val)) {
      var n = val.length;

      for (var i = 0; i < n; i++) {
        f(i, loc, expr, val, path, parent, parentPropName, callback);
      }
    } else if (val && _typeof(val) === 'object') {
      Object.keys(val).forEach(function (m) {
        f(m, loc, expr, val, path, parent, parentPropName, callback);
      });
    }
  };

  JSONPath.prototype._slice = function (loc, expr, val, path, parent, parentPropName, callback) {
    if (!Array.isArray(val)) {
      return undefined;
    }

    var len = val.length,
        parts = loc.split(':'),
        step = parts[2] && Number.parseInt(parts[2]) || 1;
    var start = parts[0] && Number.parseInt(parts[0]) || 0,
        end = parts[1] && Number.parseInt(parts[1]) || len;
    start = start < 0 ? Math.max(0, start + len) : Math.min(len, start);
    end = end < 0 ? Math.max(0, end + len) : Math.min(len, end);
    var ret = [];

    for (var i = start; i < end; i += step) {
      var tmp = this._trace(unshift(i, expr), val, path, parent, parentPropName, callback, true); // Should only be possible to be an array here since first part of
      //   ``unshift(i, expr)` passed in above would not be empty, nor `~`,
      //     nor begin with `@` (as could return objects)
      // This was causing excessive stack size in Node (with or
      //  without Babel) against our performance test: `ret.push(...tmp);`


      tmp.forEach(function (t) {
        ret.push(t);
      });
    }

    return ret;
  };

  JSONPath.prototype._eval = function (code, _v, _vname, path, parent, parentPropName) {
    if (!this._obj || !_v) {
      return false;
    }

    if (code.includes('@parentProperty')) {
      this.currSandbox._$_parentProperty = parentPropName;
      code = code.replace(/@parentProperty/g, '_$_parentProperty');
    }

    if (code.includes('@parent')) {
      this.currSandbox._$_parent = parent;
      code = code.replace(/@parent/g, '_$_parent');
    }

    if (code.includes('@property')) {
      this.currSandbox._$_property = _vname;
      code = code.replace(/@property/g, '_$_property');
    }

    if (code.includes('@path')) {
      this.currSandbox._$_path = JSONPath.toPathString(path.concat([_vname]));
      code = code.replace(/@path/g, '_$_path');
    }

    if (code.includes('@root')) {
      this.currSandbox._$_root = this.json;
      code = code.replace(/@root/g, '_$_root');
    }

    if (code.match(/@([\t-\r \)\.\[\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF])/)) {
      this.currSandbox._$_v = _v;
      code = code.replace(/@([\t-\r \)\.\[\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF])/g, '_$_v$1');
    }

    try {
      return vm.runInNewContext(code, this.currSandbox);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      throw new Error('jsonPath: ' + e.message + ': ' + code);
    }
  }; // PUBLIC CLASS PROPERTIES AND METHODS
  // Could store the cache object itself


  JSONPath.cache = {};
  /**
   * @param {string[]} pathArr Array to convert
   * @returns {string} The path string
   */

  JSONPath.toPathString = function (pathArr) {
    var x = pathArr,
        n = x.length;
    var p = '$';

    for (var i = 1; i < n; i++) {
      if (!/^(~|\^|@(?:[\0-\t\x0B\f\x0E-\u2027\u202A-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*?\(\))$/.test(x[i])) {
        p += /^[\*0-9]+$/.test(x[i]) ? '[' + x[i] + ']' : "['" + x[i] + "']";
      }
    }

    return p;
  };
  /**
   * @param {string} pointer JSON Path
   * @returns {string} JSON Pointer
   */


  JSONPath.toPointer = function (pointer) {
    var x = pointer,
        n = x.length;
    var p = '';

    for (var i = 1; i < n; i++) {
      if (!/^(~|\^|@(?:[\0-\t\x0B\f\x0E-\u2027\u202A-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*?\(\))$/.test(x[i])) {
        p += '/' + x[i].toString().replace(/~/g, '~0').replace(/\//g, '~1');
      }
    }

    return p;
  };
  /**
   * @param {string} expr Expression to convert
   * @returns {string[]}
   */


  JSONPath.toPathArray = function (expr) {
    var cache = JSONPath.cache;

    if (cache[expr]) {
      return cache[expr].concat();
    }

    var subx = [];
    var normalized = expr // Properties
    .replace(/@(?:null|boolean|number|string|integer|undefined|nonFinite|scalar|array|object|function|other)\(\)/g, ';$&;') // Parenthetical evaluations (filtering and otherwise), directly
    //   within brackets or single quotes
    .replace(/['\[](\??\((?:[\0-\t\x0B\f\x0E-\u2027\u202A-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*?\))['\]]/g, function ($0, $1) {
      return '[#' + (subx.push($1) - 1) + ']';
    }) // Escape periods and tildes within properties
    .replace(/\['((?:[\0-&\(-\\\^-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*)'\]/g, function ($0, prop) {
      return "['" + prop.replace(/\./g, '%@%').replace(/~/g, '%%@@%%') + "']";
    }) // Properties operator
    .replace(/~/g, ';~;') // Split by property boundaries
    .replace(/'?\.'?(?!(?:[\0-Z\\-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*\])|\['?/g, ';') // Reinsert periods within properties
    .replace(/%@%/g, '.') // Reinsert tildes within properties
    .replace(/%%@@%%/g, '~') // Parent
    .replace(/(?:;)?(\^+)(?:;)?/g, function ($0, ups) {
      return ';' + ups.split('').join(';') + ';';
    }) // Descendents
    .replace(/;;;|;;/g, ';..;') // Remove trailing
    .replace(/;$|'?\]|'$/g, '');
    var exprList = normalized.split(';').map(function (exp) {
      var match = exp.match(/#([0-9]+)/);
      return !match || !match[1] ? exp : subx[match[1]];
    });
    cache[expr] = exprList;
    return cache[expr];
  };

  exports.JSONPath = JSONPath;

  Object.defineProperty(exports, '__esModule', { value: true });

})));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"vm":67}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Global_1 = require("./Global");
var now = (function () {
    if (Global_1.glob.performance && Global_1.glob.performance.now) {
        return function () {
            return Global_1.glob.performance.now();
        };
    }
    return function () {
        return new Date().getTime();
    };
})();
var Animation = (function () {
    function Animation(func, layers) {
        this.id = Animation.animIdCounter++;
        this.frame = {
            time: 0,
            timeDiff: 0,
            lastTime: now(),
            frameRate: 0
        };
        this.func = func;
        this.setLayers(layers);
    }
    Animation.prototype.setLayers = function (layers) {
        var lays = [];
        if (!layers) {
            lays = [];
        }
        else if (layers.length > 0) {
            lays = layers;
        }
        else {
            lays = [layers];
        }
        this.layers = lays;
        return this;
    };
    Animation.prototype.getLayers = function () {
        return this.layers;
    };
    Animation.prototype.addLayer = function (layer) {
        var layers = this.layers, len = layers.length, n;
        for (n = 0; n < len; n++) {
            if (layers[n]._id === layer._id) {
                return false;
            }
        }
        this.layers.push(layer);
        return true;
    };
    Animation.prototype.isRunning = function () {
        var a = Animation, animations = a.animations, len = animations.length, n;
        for (n = 0; n < len; n++) {
            if (animations[n].id === this.id) {
                return true;
            }
        }
        return false;
    };
    Animation.prototype.start = function () {
        this.stop();
        this.frame.timeDiff = 0;
        this.frame.lastTime = now();
        Animation._addAnimation(this);
        return this;
    };
    Animation.prototype.stop = function () {
        Animation._removeAnimation(this);
        return this;
    };
    Animation.prototype._updateFrameObject = function (time) {
        this.frame.timeDiff = time - this.frame.lastTime;
        this.frame.lastTime = time;
        this.frame.time += this.frame.timeDiff;
        this.frame.frameRate = 1000 / this.frame.timeDiff;
    };
    Animation._addAnimation = function (anim) {
        this.animations.push(anim);
        this._handleAnimation();
    };
    Animation._removeAnimation = function (anim) {
        var id = anim.id, animations = this.animations, len = animations.length, n;
        for (n = 0; n < len; n++) {
            if (animations[n].id === id) {
                this.animations.splice(n, 1);
                break;
            }
        }
    };
    Animation._runFrames = function () {
        var layerHash = {}, animations = this.animations, anim, layers, func, n, i, layersLen, layer, key, needRedraw;
        for (n = 0; n < animations.length; n++) {
            anim = animations[n];
            layers = anim.layers;
            func = anim.func;
            anim._updateFrameObject(now());
            layersLen = layers.length;
            if (func) {
                needRedraw = func.call(anim, anim.frame) !== false;
            }
            else {
                needRedraw = true;
            }
            if (!needRedraw) {
                continue;
            }
            for (i = 0; i < layersLen; i++) {
                layer = layers[i];
                if (layer._id !== undefined) {
                    layerHash[layer._id] = layer;
                }
            }
        }
        for (key in layerHash) {
            if (!layerHash.hasOwnProperty(key)) {
                continue;
            }
            layerHash[key].draw();
        }
    };
    Animation._animationLoop = function () {
        var Anim = Animation;
        if (Anim.animations.length) {
            Anim._runFrames();
            requestAnimationFrame(Anim._animationLoop);
        }
        else {
            Anim.animRunning = false;
        }
    };
    Animation._handleAnimation = function () {
        if (!this.animRunning) {
            this.animRunning = true;
            requestAnimationFrame(this._animationLoop);
        }
    };
    Animation.animations = [];
    Animation.animIdCounter = 0;
    Animation.animRunning = false;
    return Animation;
}());
exports.Animation = Animation;

},{"./Global":18}],11:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("./Util");
var Container_1 = require("./Container");
var Node_1 = require("./Node");
var Factory_1 = require("./Factory");
var Canvas_1 = require("./Canvas");
var BaseLayer = (function (_super) {
    __extends(BaseLayer, _super);
    function BaseLayer(config) {
        var _this = _super.call(this, config) || this;
        _this.canvas = new Canvas_1.SceneCanvas();
        _this._waitingForDraw = false;
        _this.on('visibleChange', _this._checkVisibility);
        _this._checkVisibility();
        _this.on('imageSmoothingEnabledChange', _this._setSmoothEnabled);
        _this._setSmoothEnabled();
        return _this;
    }
    BaseLayer.prototype.createPNGStream = function () {
        var c = this.canvas._canvas;
        return c.createPNGStream();
    };
    BaseLayer.prototype.getCanvas = function () {
        return this.canvas;
    };
    BaseLayer.prototype.getHitCanvas = function () {
        return this.hitCanvas;
    };
    BaseLayer.prototype.getContext = function () {
        return this.getCanvas().getContext();
    };
    BaseLayer.prototype.clear = function (bounds) {
        this.getContext().clear(bounds);
        return this;
    };
    BaseLayer.prototype.setZIndex = function (index) {
        _super.prototype.setZIndex.call(this, index);
        var stage = this.getStage();
        if (stage) {
            stage.content.removeChild(this.getCanvas()._canvas);
            if (index < stage.children.length - 1) {
                stage.content.insertBefore(this.getCanvas()._canvas, stage.children[index + 1].getCanvas()._canvas);
            }
            else {
                stage.content.appendChild(this.getCanvas()._canvas);
            }
        }
        return this;
    };
    BaseLayer.prototype.moveToTop = function () {
        Node_1.Node.prototype.moveToTop.call(this);
        var stage = this.getStage();
        if (stage) {
            stage.content.removeChild(this.getCanvas()._canvas);
            stage.content.appendChild(this.getCanvas()._canvas);
        }
        return true;
    };
    BaseLayer.prototype.moveUp = function () {
        var moved = Node_1.Node.prototype.moveUp.call(this);
        if (!moved) {
            return false;
        }
        var stage = this.getStage();
        if (!stage) {
            return false;
        }
        stage.content.removeChild(this.getCanvas()._canvas);
        if (this.index < stage.children.length - 1) {
            stage.content.insertBefore(this.getCanvas()._canvas, stage.children[this.index + 1].getCanvas()._canvas);
        }
        else {
            stage.content.appendChild(this.getCanvas()._canvas);
        }
        return true;
    };
    BaseLayer.prototype.moveDown = function () {
        if (Node_1.Node.prototype.moveDown.call(this)) {
            var stage = this.getStage();
            if (stage) {
                var children = stage.children;
                stage.content.removeChild(this.getCanvas()._canvas);
                stage.content.insertBefore(this.getCanvas()._canvas, children[this.index + 1].getCanvas()._canvas);
            }
            return true;
        }
        return false;
    };
    BaseLayer.prototype.moveToBottom = function () {
        if (Node_1.Node.prototype.moveToBottom.call(this)) {
            var stage = this.getStage();
            if (stage) {
                var children = stage.children;
                stage.content.removeChild(this.getCanvas()._canvas);
                stage.content.insertBefore(this.getCanvas()._canvas, children[1].getCanvas()._canvas);
            }
            return true;
        }
        return false;
    };
    BaseLayer.prototype.getLayer = function () {
        return this;
    };
    BaseLayer.prototype.hitGraphEnabled = function () {
        return true;
    };
    BaseLayer.prototype.remove = function () {
        var _canvas = this.getCanvas()._canvas;
        Node_1.Node.prototype.remove.call(this);
        if (_canvas && _canvas.parentNode && Util_1.Util._isInDocument(_canvas)) {
            _canvas.parentNode.removeChild(_canvas);
        }
        return this;
    };
    BaseLayer.prototype.getStage = function () {
        return this.parent;
    };
    BaseLayer.prototype.setSize = function (_a) {
        var width = _a.width, height = _a.height;
        this.canvas.setSize(width, height);
        this._setSmoothEnabled();
        return this;
    };
    BaseLayer.prototype._toKonvaCanvas = function (config) {
        config = config || {};
        config.width = config.width || this.getWidth();
        config.height = config.height || this.getHeight();
        config.x = config.x !== undefined ? config.x : this.x();
        config.y = config.y !== undefined ? config.y : this.y();
        return Node_1.Node.prototype._toKonvaCanvas.call(this, config);
    };
    BaseLayer.prototype._checkVisibility = function () {
        var visible = this.visible();
        if (visible) {
            this.canvas._canvas.style.display = 'block';
        }
        else {
            this.canvas._canvas.style.display = 'none';
        }
    };
    BaseLayer.prototype._setSmoothEnabled = function () {
        this.getContext()._context.imageSmoothingEnabled = this.imageSmoothingEnabled();
    };
    BaseLayer.prototype.getWidth = function () {
        if (this.parent) {
            return this.parent.width();
        }
    };
    BaseLayer.prototype.setWidth = function () {
        Util_1.Util.warn('Can not change width of layer. Use "stage.width(value)" function instead.');
    };
    BaseLayer.prototype.getHeight = function () {
        if (this.parent) {
            return this.parent.height();
        }
    };
    BaseLayer.prototype.setHeight = function () {
        Util_1.Util.warn('Can not change height of layer. Use "stage.height(value)" function instead.');
    };
    BaseLayer.prototype.getIntersection = function (pos, selector) {
        return null;
    };
    BaseLayer.prototype.batchDraw = function () {
        var _this = this;
        if (!this._waitingForDraw) {
            this._waitingForDraw = true;
            Util_1.Util.requestAnimFrame(function () {
                _this.draw();
                _this._waitingForDraw = false;
            });
        }
        return this;
    };
    BaseLayer.prototype._applyTransform = function (shape, context, top) {
        var m = shape.getAbsoluteTransform(top).getMatrix();
        context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
    };
    return BaseLayer;
}(Container_1.Container));
exports.BaseLayer = BaseLayer;
BaseLayer.prototype.nodeType = 'BaseLayer';
Factory_1.Factory.addGetterSetter(BaseLayer, 'imageSmoothingEnabled', true);
Factory_1.Factory.addGetterSetter(BaseLayer, 'clearBeforeDraw', true);
Util_1.Collection.mapMethods(BaseLayer);

},{"./Canvas":12,"./Container":13,"./Factory":16,"./Node":21,"./Util":26}],12:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("./Util");
var Context_1 = require("./Context");
var Global_1 = require("./Global");
var Factory_1 = require("./Factory");
var Validators_1 = require("./Validators");
var _pixelRatio;
function getDevicePixelRatio() {
    if (_pixelRatio) {
        return _pixelRatio;
    }
    var canvas = Util_1.Util.createCanvasElement();
    var context = canvas.getContext('2d');
    _pixelRatio = (function () {
        var devicePixelRatio = Global_1.Konva._global.devicePixelRatio || 1, backingStoreRatio = context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio ||
            1;
        return devicePixelRatio / backingStoreRatio;
    })();
    return _pixelRatio;
}
var Canvas = (function () {
    function Canvas(config) {
        this.pixelRatio = 1;
        this.width = 0;
        this.height = 0;
        this.isCache = false;
        var conf = config || {};
        var pixelRatio = conf.pixelRatio || Global_1.Konva.pixelRatio || getDevicePixelRatio();
        this.pixelRatio = pixelRatio;
        this._canvas = Util_1.Util.createCanvasElement();
        this._canvas.style.padding = '0';
        this._canvas.style.margin = '0';
        this._canvas.style.border = '0';
        this._canvas.style.background = 'transparent';
        this._canvas.style.position = 'absolute';
        this._canvas.style.top = '0';
        this._canvas.style.left = '0';
    }
    Canvas.prototype.getContext = function () {
        return this.context;
    };
    Canvas.prototype.getPixelRatio = function () {
        return this.pixelRatio;
    };
    Canvas.prototype.setPixelRatio = function (pixelRatio) {
        var previousRatio = this.pixelRatio;
        this.pixelRatio = pixelRatio;
        this.setSize(this.getWidth() / previousRatio, this.getHeight() / previousRatio);
    };
    Canvas.prototype.setWidth = function (width) {
        this.width = this._canvas.width = width * this.pixelRatio;
        this._canvas.style.width = width + 'px';
        var pixelRatio = this.pixelRatio, _context = this.getContext()._context;
        _context.scale(pixelRatio, pixelRatio);
    };
    Canvas.prototype.setHeight = function (height) {
        this.height = this._canvas.height = height * this.pixelRatio;
        this._canvas.style.height = height + 'px';
        var pixelRatio = this.pixelRatio, _context = this.getContext()._context;
        _context.scale(pixelRatio, pixelRatio);
    };
    Canvas.prototype.getWidth = function () {
        return this.width;
    };
    Canvas.prototype.getHeight = function () {
        return this.height;
    };
    Canvas.prototype.setSize = function (width, height) {
        this.setWidth(width || 0);
        this.setHeight(height || 0);
    };
    Canvas.prototype.toDataURL = function (mimeType, quality) {
        try {
            return this._canvas.toDataURL(mimeType, quality);
        }
        catch (e) {
            try {
                return this._canvas.toDataURL();
            }
            catch (err) {
                Util_1.Util.error('Unable to get data URL. ' +
                    err.message +
                    ' For more info read https://konvajs.org/docs/posts/Tainted_Canvas.html.');
                return '';
            }
        }
    };
    return Canvas;
}());
exports.Canvas = Canvas;
Factory_1.Factory.addGetterSetter(Canvas, 'pixelRatio', undefined, Validators_1.getNumberValidator());
var SceneCanvas = (function (_super) {
    __extends(SceneCanvas, _super);
    function SceneCanvas(config) {
        if (config === void 0) { config = { width: 0, height: 0 }; }
        var _this = _super.call(this, config) || this;
        _this.context = new Context_1.SceneContext(_this);
        _this.setSize(config.width, config.height);
        return _this;
    }
    return SceneCanvas;
}(Canvas));
exports.SceneCanvas = SceneCanvas;
var HitCanvas = (function (_super) {
    __extends(HitCanvas, _super);
    function HitCanvas(config) {
        if (config === void 0) { config = { width: 0, height: 0 }; }
        var _this = _super.call(this, config) || this;
        _this.hitCanvas = true;
        _this.context = new Context_1.HitContext(_this);
        _this.setSize(config.width, config.height);
        return _this;
    }
    return HitCanvas;
}(Canvas));
exports.HitCanvas = HitCanvas;

},{"./Context":14,"./Factory":16,"./Global":18,"./Util":26,"./Validators":27}],13:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("./Util");
var Factory_1 = require("./Factory");
var Node_1 = require("./Node");
var DragAndDrop_1 = require("./DragAndDrop");
var Validators_1 = require("./Validators");
var Global_1 = require("./Global");
var Container = (function (_super) {
    __extends(Container, _super);
    function Container() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.children = new Util_1.Collection();
        return _this;
    }
    Container.prototype.getChildren = function (filterFunc) {
        if (!filterFunc) {
            return this.children;
        }
        var results = new Util_1.Collection();
        this.children.each(function (child) {
            if (filterFunc(child)) {
                results.push(child);
            }
        });
        return results;
    };
    Container.prototype.hasChildren = function () {
        return this.getChildren().length > 0;
    };
    Container.prototype.removeChildren = function () {
        var child;
        for (var i = 0; i < this.children.length; i++) {
            child = this.children[i];
            child.parent = null;
            child.index = 0;
            child.remove();
        }
        this.children = new Util_1.Collection();
        return this;
    };
    Container.prototype.destroyChildren = function () {
        var child;
        for (var i = 0; i < this.children.length; i++) {
            child = this.children[i];
            child.parent = null;
            child.index = 0;
            child.destroy();
        }
        this.children = new Util_1.Collection();
        return this;
    };
    Container.prototype.add = function () {
        var children = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            children[_i] = arguments[_i];
        }
        if (arguments.length > 1) {
            for (var i = 0; i < arguments.length; i++) {
                this.add(arguments[i]);
            }
            return this;
        }
        var child = children[0];
        if (child.getParent()) {
            child.moveTo(this);
            return this;
        }
        var _children = this.children;
        this._validateAdd(child);
        child._clearCaches();
        child.index = _children.length;
        child.parent = this;
        _children.push(child);
        this._fire('add', {
            child: child
        });
        return this;
    };
    Container.prototype.destroy = function () {
        if (this.hasChildren()) {
            this.destroyChildren();
        }
        _super.prototype.destroy.call(this);
        return this;
    };
    Container.prototype.find = function (selector) {
        return this._generalFind(selector, false);
    };
    Container.prototype.get = function (selector) {
        Util_1.Util.warn('collection.get() method is deprecated. Please use collection.find() instead.');
        return this.find(selector);
    };
    Container.prototype.findOne = function (selector) {
        var result = this._generalFind(selector, true);
        return result.length > 0 ? result[0] : undefined;
    };
    Container.prototype._generalFind = function (selector, findOne) {
        var retArr = [];
        this._descendants(function (node) {
            var valid = node._isMatch(selector);
            if (valid) {
                retArr.push(node);
            }
            if (valid && findOne) {
                return true;
            }
            return false;
        });
        return Util_1.Collection.toCollection(retArr);
    };
    Container.prototype._descendants = function (fn) {
        var shouldStop = false;
        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];
            shouldStop = fn(child);
            if (shouldStop) {
                return true;
            }
            if (!child.hasChildren()) {
                continue;
            }
            shouldStop = child._descendants(fn);
            if (shouldStop) {
                return true;
            }
        }
        return false;
    };
    Container.prototype.toObject = function () {
        var obj = Node_1.Node.prototype.toObject.call(this);
        obj.children = [];
        var children = this.getChildren();
        var len = children.length;
        for (var n = 0; n < len; n++) {
            var child = children[n];
            obj.children.push(child.toObject());
        }
        return obj;
    };
    Container.prototype.isAncestorOf = function (node) {
        var parent = node.getParent();
        while (parent) {
            if (parent._id === this._id) {
                return true;
            }
            parent = parent.getParent();
        }
        return false;
    };
    Container.prototype.clone = function (obj) {
        var node = Node_1.Node.prototype.clone.call(this, obj);
        this.getChildren().each(function (no) {
            node.add(no.clone());
        });
        return node;
    };
    Container.prototype.getAllIntersections = function (pos) {
        var arr = [];
        this.find('Shape').each(function (shape) {
            if (shape.isVisible() && shape.intersects(pos)) {
                arr.push(shape);
            }
        });
        return arr;
    };
    Container.prototype._setChildrenIndices = function () {
        this.children.each(function (child, n) {
            child.index = n;
        });
    };
    Container.prototype.drawScene = function (can, top, caching) {
        var layer = this.getLayer(), canvas = can || (layer && layer.getCanvas()), context = canvas && canvas.getContext(), cachedCanvas = this._getCanvasCache(), cachedSceneCanvas = cachedCanvas && cachedCanvas.scene;
        if (this.isVisible() || caching) {
            if (!caching && cachedSceneCanvas) {
                context.save();
                layer._applyTransform(this, context, top);
                this._drawCachedSceneCanvas(context);
                context.restore();
            }
            else {
                this._drawChildren(canvas, 'drawScene', top, false, caching, caching);
            }
        }
        return this;
    };
    Container.prototype.drawHit = function (can, top, caching) {
        var layer = this.getLayer(), canvas = can || (layer && layer.hitCanvas), context = canvas && canvas.getContext(), cachedCanvas = this._getCanvasCache(), cachedHitCanvas = cachedCanvas && cachedCanvas.hit;
        if (this.shouldDrawHit(canvas) || caching) {
            if (!caching && cachedHitCanvas) {
                context.save();
                layer._applyTransform(this, context, top);
                this._drawCachedHitCanvas(context);
                context.restore();
            }
            else {
                this._drawChildren(canvas, 'drawHit', top, false, caching, caching);
            }
        }
        return this;
    };
    Container.prototype._drawChildren = function (canvas, drawMethod, top, caching, skipBuffer, skipComposition) {
        var layer = this.getLayer(), context = canvas && canvas.getContext(), clipWidth = this.clipWidth(), clipHeight = this.clipHeight(), clipFunc = this.clipFunc(), hasClip = (clipWidth && clipHeight) || clipFunc, clipX, clipY;
        if (hasClip && layer) {
            context.save();
            var transform = this.getAbsoluteTransform(top);
            var m = transform.getMatrix();
            context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
            context.beginPath();
            if (clipFunc) {
                clipFunc.call(this, context, this);
            }
            else {
                clipX = this.clipX();
                clipY = this.clipY();
                context.rect(clipX, clipY, clipWidth, clipHeight);
            }
            context.clip();
            m = transform
                .copy()
                .invert()
                .getMatrix();
            context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        }
        var hasComposition = this.globalCompositeOperation() !== 'source-over' &&
            !skipComposition &&
            drawMethod === 'drawScene';
        if (hasComposition && layer) {
            context.save();
            context._applyGlobalCompositeOperation(this);
        }
        this.children.each(function (child) {
            child[drawMethod](canvas, top, caching, skipBuffer);
        });
        if (hasComposition && layer) {
            context.restore();
        }
        if (hasClip && layer) {
            context.restore();
        }
    };
    Container.prototype.shouldDrawHit = function (canvas) {
        if (canvas && canvas.isCache) {
            return true;
        }
        var layer = this.getLayer();
        var layerUnderDrag = false;
        DragAndDrop_1.DD._dragElements.forEach(function (elem) {
            if (elem.dragStatus === 'dragging' && elem.node.getLayer() === layer) {
                layerUnderDrag = true;
            }
        });
        var dragSkip = !Global_1.Konva.hitOnDragEnabled && layerUnderDrag;
        return layer && layer.hitGraphEnabled() && this.isVisible() && !dragSkip;
    };
    Container.prototype.getClientRect = function (config) {
        config = config || {};
        var skipTransform = config.skipTransform;
        var relativeTo = config.relativeTo;
        var minX, minY, maxX, maxY;
        var selfRect = {
            x: Infinity,
            y: Infinity,
            width: 0,
            height: 0
        };
        var that = this;
        this.children.each(function (child) {
            if (!child.visible()) {
                return;
            }
            var rect = child.getClientRect({
                relativeTo: that,
                skipShadow: config.skipShadow,
                skipStroke: config.skipStroke
            });
            if (rect.width === 0 && rect.height === 0) {
                return;
            }
            if (minX === undefined) {
                minX = rect.x;
                minY = rect.y;
                maxX = rect.x + rect.width;
                maxY = rect.y + rect.height;
            }
            else {
                minX = Math.min(minX, rect.x);
                minY = Math.min(minY, rect.y);
                maxX = Math.max(maxX, rect.x + rect.width);
                maxY = Math.max(maxY, rect.y + rect.height);
            }
        });
        var shapes = this.find('Shape');
        var hasVisible = false;
        for (var i = 0; i < shapes.length; i++) {
            var shape = shapes[i];
            if (shape._isVisible(this)) {
                hasVisible = true;
                break;
            }
        }
        if (hasVisible && minX !== undefined) {
            selfRect = {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY
            };
        }
        else {
            selfRect = {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            };
        }
        if (!skipTransform) {
            return this._transformedRect(selfRect, relativeTo);
        }
        return selfRect;
    };
    return Container;
}(Node_1.Node));
exports.Container = Container;
Factory_1.Factory.addComponentsGetterSetter(Container, 'clip', [
    'x',
    'y',
    'width',
    'height'
]);
Factory_1.Factory.addGetterSetter(Container, 'clipX', undefined, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Container, 'clipY', undefined, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Container, 'clipWidth', undefined, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Container, 'clipHeight', undefined, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Container, 'clipFunc');
Util_1.Collection.mapMethods(Container);

},{"./DragAndDrop":15,"./Factory":16,"./Global":18,"./Node":21,"./Util":26,"./Validators":27}],14:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("./Util");
var Global_1 = require("./Global");
var COMMA = ',', OPEN_PAREN = '(', CLOSE_PAREN = ')', OPEN_PAREN_BRACKET = '([', CLOSE_BRACKET_PAREN = '])', SEMICOLON = ';', DOUBLE_PAREN = '()', EQUALS = '=', CONTEXT_METHODS = [
    'arc',
    'arcTo',
    'beginPath',
    'bezierCurveTo',
    'clearRect',
    'clip',
    'closePath',
    'createLinearGradient',
    'createPattern',
    'createRadialGradient',
    'drawImage',
    'ellipse',
    'fill',
    'fillText',
    'getImageData',
    'createImageData',
    'lineTo',
    'moveTo',
    'putImageData',
    'quadraticCurveTo',
    'rect',
    'restore',
    'rotate',
    'save',
    'scale',
    'setLineDash',
    'setTransform',
    'stroke',
    'strokeText',
    'transform',
    'translate'
];
var CONTEXT_PROPERTIES = [
    'fillStyle',
    'strokeStyle',
    'shadowColor',
    'shadowBlur',
    'shadowOffsetX',
    'shadowOffsetY',
    'lineCap',
    'lineDashOffset',
    'lineJoin',
    'lineWidth',
    'miterLimit',
    'font',
    'textAlign',
    'textBaseline',
    'globalAlpha',
    'globalCompositeOperation',
    'imageSmoothingEnabled'
];
var traceArrMax = 100;
var Context = (function () {
    function Context(canvas) {
        this.canvas = canvas;
        this._context = canvas._canvas.getContext('2d');
        if (Global_1.Konva.enableTrace) {
            this.traceArr = [];
            this._enableTrace();
        }
    }
    Context.prototype.fillShape = function (shape) {
        if (shape.fillEnabled()) {
            this._fill(shape);
        }
    };
    Context.prototype._fill = function (shape) {
    };
    Context.prototype.strokeShape = function (shape) {
        if (shape.hasStroke()) {
            this._stroke(shape);
        }
    };
    Context.prototype._stroke = function (shape) {
    };
    Context.prototype.fillStrokeShape = function (shape) {
        this.fillShape(shape);
        this.strokeShape(shape);
    };
    Context.prototype.getTrace = function (relaxed) {
        var traceArr = this.traceArr, len = traceArr.length, str = '', n, trace, method, args;
        for (n = 0; n < len; n++) {
            trace = traceArr[n];
            method = trace.method;
            if (method) {
                args = trace.args;
                str += method;
                if (relaxed) {
                    str += DOUBLE_PAREN;
                }
                else {
                    if (Util_1.Util._isArray(args[0])) {
                        str += OPEN_PAREN_BRACKET + args.join(COMMA) + CLOSE_BRACKET_PAREN;
                    }
                    else {
                        str += OPEN_PAREN + args.join(COMMA) + CLOSE_PAREN;
                    }
                }
            }
            else {
                str += trace.property;
                if (!relaxed) {
                    str += EQUALS + trace.val;
                }
            }
            str += SEMICOLON;
        }
        return str;
    };
    Context.prototype.clearTrace = function () {
        this.traceArr = [];
    };
    Context.prototype._trace = function (str) {
        var traceArr = this.traceArr, len;
        traceArr.push(str);
        len = traceArr.length;
        if (len >= traceArrMax) {
            traceArr.shift();
        }
    };
    Context.prototype.reset = function () {
        var pixelRatio = this.getCanvas().getPixelRatio();
        this.setTransform(1 * pixelRatio, 0, 0, 1 * pixelRatio, 0, 0);
    };
    Context.prototype.getCanvas = function () {
        return this.canvas;
    };
    Context.prototype.clear = function (bounds) {
        var canvas = this.getCanvas();
        if (bounds) {
            this.clearRect(bounds.x || 0, bounds.y || 0, bounds.width || 0, bounds.height || 0);
        }
        else {
            this.clearRect(0, 0, canvas.getWidth() / canvas.pixelRatio, canvas.getHeight() / canvas.pixelRatio);
        }
    };
    Context.prototype._applyLineCap = function (shape) {
        var lineCap = shape.getLineCap();
        if (lineCap) {
            this.setAttr('lineCap', lineCap);
        }
    };
    Context.prototype._applyOpacity = function (shape) {
        var absOpacity = shape.getAbsoluteOpacity();
        if (absOpacity !== 1) {
            this.setAttr('globalAlpha', absOpacity);
        }
    };
    Context.prototype._applyLineJoin = function (shape) {
        var lineJoin = shape.getLineJoin();
        if (lineJoin) {
            this.setAttr('lineJoin', lineJoin);
        }
    };
    Context.prototype.setAttr = function (attr, val) {
        this._context[attr] = val;
    };
    Context.prototype.arc = function (a0, a1, a2, a3, a4, a5) {
        this._context.arc(a0, a1, a2, a3, a4, a5);
    };
    Context.prototype.arcTo = function (a0, a1, a2, a3, a4) {
        this._context.arcTo(a0, a1, a2, a3, a4);
    };
    Context.prototype.beginPath = function () {
        this._context.beginPath();
    };
    Context.prototype.bezierCurveTo = function (a0, a1, a2, a3, a4, a5) {
        this._context.bezierCurveTo(a0, a1, a2, a3, a4, a5);
    };
    Context.prototype.clearRect = function (a0, a1, a2, a3) {
        this._context.clearRect(a0, a1, a2, a3);
    };
    Context.prototype.clip = function () {
        this._context.clip();
    };
    Context.prototype.closePath = function () {
        this._context.closePath();
    };
    Context.prototype.createImageData = function (a0, a1) {
        var a = arguments;
        if (a.length === 2) {
            return this._context.createImageData(a0, a1);
        }
        else if (a.length === 1) {
            return this._context.createImageData(a0);
        }
    };
    Context.prototype.createLinearGradient = function (a0, a1, a2, a3) {
        return this._context.createLinearGradient(a0, a1, a2, a3);
    };
    Context.prototype.createPattern = function (a0, a1) {
        return this._context.createPattern(a0, a1);
    };
    Context.prototype.createRadialGradient = function (a0, a1, a2, a3, a4, a5) {
        return this._context.createRadialGradient(a0, a1, a2, a3, a4, a5);
    };
    Context.prototype.drawImage = function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
        var a = arguments, _context = this._context;
        if (a.length === 3) {
            _context.drawImage(a0, a1, a2);
        }
        else if (a.length === 5) {
            _context.drawImage(a0, a1, a2, a3, a4);
        }
        else if (a.length === 9) {
            _context.drawImage(a0, a1, a2, a3, a4, a5, a6, a7, a8);
        }
    };
    Context.prototype.ellipse = function (a0, a1, a2, a3, a4, a5, a6, a7) {
        this._context.ellipse(a0, a1, a2, a3, a4, a5, a6, a7);
    };
    Context.prototype.isPointInPath = function (x, y) {
        return this._context.isPointInPath(x, y);
    };
    Context.prototype.fill = function () {
        this._context.fill();
    };
    Context.prototype.fillRect = function (x, y, width, height) {
        this._context.fillRect(x, y, width, height);
    };
    Context.prototype.strokeRect = function (x, y, width, height) {
        this._context.strokeRect(x, y, width, height);
    };
    Context.prototype.fillText = function (a0, a1, a2) {
        this._context.fillText(a0, a1, a2);
    };
    Context.prototype.measureText = function (text) {
        return this._context.measureText(text);
    };
    Context.prototype.getImageData = function (a0, a1, a2, a3) {
        return this._context.getImageData(a0, a1, a2, a3);
    };
    Context.prototype.lineTo = function (a0, a1) {
        this._context.lineTo(a0, a1);
    };
    Context.prototype.moveTo = function (a0, a1) {
        this._context.moveTo(a0, a1);
    };
    Context.prototype.rect = function (a0, a1, a2, a3) {
        this._context.rect(a0, a1, a2, a3);
    };
    Context.prototype.putImageData = function (a0, a1, a2) {
        this._context.putImageData(a0, a1, a2);
    };
    Context.prototype.quadraticCurveTo = function (a0, a1, a2, a3) {
        this._context.quadraticCurveTo(a0, a1, a2, a3);
    };
    Context.prototype.restore = function () {
        this._context.restore();
    };
    Context.prototype.rotate = function (a0) {
        this._context.rotate(a0);
    };
    Context.prototype.save = function () {
        this._context.save();
    };
    Context.prototype.scale = function (a0, a1) {
        this._context.scale(a0, a1);
    };
    Context.prototype.setLineDash = function (a0) {
        if (this._context.setLineDash) {
            this._context.setLineDash(a0);
        }
        else if ('mozDash' in this._context) {
            this._context['mozDash'] = a0;
        }
        else if ('webkitLineDash' in this._context) {
            this._context['webkitLineDash'] = a0;
        }
    };
    Context.prototype.getLineDash = function () {
        return this._context.getLineDash();
    };
    Context.prototype.setTransform = function (a0, a1, a2, a3, a4, a5) {
        this._context.setTransform(a0, a1, a2, a3, a4, a5);
    };
    Context.prototype.stroke = function () {
        this._context.stroke();
    };
    Context.prototype.strokeText = function (a0, a1, a2, a3) {
        this._context.strokeText(a0, a1, a2, a3);
    };
    Context.prototype.transform = function (a0, a1, a2, a3, a4, a5) {
        this._context.transform(a0, a1, a2, a3, a4, a5);
    };
    Context.prototype.translate = function (a0, a1) {
        this._context.translate(a0, a1);
    };
    Context.prototype._enableTrace = function () {
        var that = this, len = CONTEXT_METHODS.length, _simplifyArray = Util_1.Util._simplifyArray, origSetter = this.setAttr, n, args;
        var func = function (methodName) {
            var origMethod = that[methodName], ret;
            that[methodName] = function () {
                args = _simplifyArray(Array.prototype.slice.call(arguments, 0));
                ret = origMethod.apply(that, arguments);
                that._trace({
                    method: methodName,
                    args: args
                });
                return ret;
            };
        };
        for (n = 0; n < len; n++) {
            func(CONTEXT_METHODS[n]);
        }
        that.setAttr = function () {
            origSetter.apply(that, arguments);
            var prop = arguments[0];
            var val = arguments[1];
            if (prop === 'shadowOffsetX' ||
                prop === 'shadowOffsetY' ||
                prop === 'shadowBlur') {
                val = val / this.canvas.getPixelRatio();
            }
            that._trace({
                property: prop,
                val: val
            });
        };
    };
    Context.prototype._applyGlobalCompositeOperation = function (node) {
        var globalCompositeOperation = node.getGlobalCompositeOperation();
        if (globalCompositeOperation !== 'source-over') {
            this.setAttr('globalCompositeOperation', globalCompositeOperation);
        }
    };
    return Context;
}());
exports.Context = Context;
CONTEXT_PROPERTIES.forEach(function (prop) {
    Object.defineProperty(Context.prototype, prop, {
        get: function () {
            return this._context[prop];
        },
        set: function (val) {
            this._context[prop] = val;
        }
    });
});
var SceneContext = (function (_super) {
    __extends(SceneContext, _super);
    function SceneContext() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SceneContext.prototype._fillColor = function (shape) {
        var fill = shape.fill();
        this.setAttr('fillStyle', fill);
        shape._fillFunc(this);
    };
    SceneContext.prototype._fillPattern = function (shape) {
        var fillPatternX = shape.getFillPatternX(), fillPatternY = shape.getFillPatternY(), fillPatternRotation = Global_1.Konva.getAngle(shape.getFillPatternRotation()), fillPatternOffsetX = shape.getFillPatternOffsetX(), fillPatternOffsetY = shape.getFillPatternOffsetY(), fillPatternScaleX = shape.getFillPatternScaleX(), fillPatternScaleY = shape.getFillPatternScaleY();
        if (fillPatternX || fillPatternY) {
            this.translate(fillPatternX || 0, fillPatternY || 0);
        }
        if (fillPatternRotation) {
            this.rotate(fillPatternRotation);
        }
        if (fillPatternScaleX || fillPatternScaleY) {
            this.scale(fillPatternScaleX, fillPatternScaleY);
        }
        if (fillPatternOffsetX || fillPatternOffsetY) {
            this.translate(-1 * fillPatternOffsetX, -1 * fillPatternOffsetY);
        }
        this.setAttr('fillStyle', shape._getFillPattern());
        shape._fillFunc(this);
    };
    SceneContext.prototype._fillLinearGradient = function (shape) {
        var grd = shape._getLinearGradient();
        if (grd) {
            this.setAttr('fillStyle', grd);
            shape._fillFunc(this);
        }
    };
    SceneContext.prototype._fillRadialGradient = function (shape) {
        var grd = shape._getRadialGradient();
        if (grd) {
            this.setAttr('fillStyle', grd);
            shape._fillFunc(this);
        }
    };
    SceneContext.prototype._fill = function (shape) {
        var hasColor = shape.fill(), fillPriority = shape.getFillPriority();
        if (hasColor && fillPriority === 'color') {
            this._fillColor(shape);
            return;
        }
        var hasPattern = shape.getFillPatternImage();
        if (hasPattern && fillPriority === 'pattern') {
            this._fillPattern(shape);
            return;
        }
        var hasLinearGradient = shape.getFillLinearGradientColorStops();
        if (hasLinearGradient && fillPriority === 'linear-gradient') {
            this._fillLinearGradient(shape);
            return;
        }
        var hasRadialGradient = shape.getFillRadialGradientColorStops();
        if (hasRadialGradient && fillPriority === 'radial-gradient') {
            this._fillRadialGradient(shape);
            return;
        }
        if (hasColor) {
            this._fillColor(shape);
        }
        else if (hasPattern) {
            this._fillPattern(shape);
        }
        else if (hasLinearGradient) {
            this._fillLinearGradient(shape);
        }
        else if (hasRadialGradient) {
            this._fillRadialGradient(shape);
        }
    };
    SceneContext.prototype._strokeLinearGradient = function (shape) {
        var start = shape.getStrokeLinearGradientStartPoint(), end = shape.getStrokeLinearGradientEndPoint(), colorStops = shape.getStrokeLinearGradientColorStops(), grd = this.createLinearGradient(start.x, start.y, end.x, end.y);
        if (colorStops) {
            for (var n = 0; n < colorStops.length; n += 2) {
                grd.addColorStop(colorStops[n], colorStops[n + 1]);
            }
            this.setAttr('strokeStyle', grd);
        }
    };
    SceneContext.prototype._stroke = function (shape) {
        var dash = shape.dash(), strokeScaleEnabled = shape.getStrokeScaleEnabled();
        if (shape.hasStroke()) {
            if (!strokeScaleEnabled) {
                this.save();
                var pixelRatio = this.getCanvas().getPixelRatio();
                this.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            }
            this._applyLineCap(shape);
            if (dash && shape.dashEnabled()) {
                this.setLineDash(dash);
                this.setAttr('lineDashOffset', shape.dashOffset());
            }
            this.setAttr('lineWidth', shape.strokeWidth());
            if (!shape.getShadowForStrokeEnabled()) {
                this.setAttr('shadowColor', 'rgba(0,0,0,0)');
            }
            var hasLinearGradient = shape.getStrokeLinearGradientColorStops();
            if (hasLinearGradient) {
                this._strokeLinearGradient(shape);
            }
            else {
                this.setAttr('strokeStyle', shape.stroke());
            }
            shape._strokeFunc(this);
            if (!strokeScaleEnabled) {
                this.restore();
            }
        }
    };
    SceneContext.prototype._applyShadow = function (shape) {
        var util = Util_1.Util, color = util.get(shape.getShadowRGBA(), 'black'), blur = util.get(shape.getShadowBlur(), 5), offset = util.get(shape.getShadowOffset(), {
            x: 0,
            y: 0
        }), scale = shape.getAbsoluteScale(), ratio = this.canvas.getPixelRatio(), scaleX = scale.x * ratio, scaleY = scale.y * ratio;
        this.setAttr('shadowColor', color);
        this.setAttr('shadowBlur', blur * Math.min(Math.abs(scaleX), Math.abs(scaleY)));
        this.setAttr('shadowOffsetX', offset.x * scaleX);
        this.setAttr('shadowOffsetY', offset.y * scaleY);
    };
    return SceneContext;
}(Context));
exports.SceneContext = SceneContext;
var HitContext = (function (_super) {
    __extends(HitContext, _super);
    function HitContext() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HitContext.prototype._fill = function (shape) {
        this.save();
        this.setAttr('fillStyle', shape.colorKey);
        shape._fillFuncHit(this);
        this.restore();
    };
    HitContext.prototype.strokeShape = function (shape) {
        if (shape.hasHitStroke()) {
            this._stroke(shape);
        }
    };
    HitContext.prototype._stroke = function (shape) {
        if (shape.hasHitStroke()) {
            var strokeScaleEnabled = shape.getStrokeScaleEnabled();
            if (!strokeScaleEnabled) {
                this.save();
                var pixelRatio = this.getCanvas().getPixelRatio();
                this.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            }
            this._applyLineCap(shape);
            var hitStrokeWidth = shape.hitStrokeWidth();
            var strokeWidth = hitStrokeWidth === 'auto' ? shape.strokeWidth() : hitStrokeWidth;
            this.setAttr('lineWidth', strokeWidth);
            this.setAttr('strokeStyle', shape.colorKey);
            shape._strokeFuncHit(this);
            if (!strokeScaleEnabled) {
                this.restore();
            }
        }
    };
    return HitContext;
}(Context));
exports.HitContext = HitContext;

},{"./Global":18,"./Util":26}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Global_1 = require("./Global");
var Util_1 = require("./Util");
exports.DD = {
    get isDragging() {
        var flag = false;
        exports.DD._dragElements.forEach(function (elem) {
            if (elem.dragStatus === 'dragging') {
                flag = true;
            }
        });
        return flag;
    },
    justDragged: false,
    get node() {
        var node;
        exports.DD._dragElements.forEach(function (elem) {
            node = elem.node;
        });
        return node;
    },
    _dragElements: new Map(),
    _drag: function (evt) {
        exports.DD._dragElements.forEach(function (elem, key) {
            var node = elem.node;
            var stage = node.getStage();
            stage.setPointersPositions(evt);
            if (elem.pointerId === undefined) {
                elem.pointerId = Util_1.Util._getFirstPointerId(evt);
            }
            var pos = stage._changedPointerPositions.find(function (pos) { return pos.id === elem.pointerId; });
            if (!pos) {
                return;
            }
            if (elem.dragStatus !== 'dragging') {
                var dragDistance = node.dragDistance();
                var distance = Math.max(Math.abs(pos.x - elem.startPointerPos.x), Math.abs(pos.y - elem.startPointerPos.y));
                if (distance < dragDistance) {
                    return;
                }
                node.startDrag({ evt: evt });
                if (!node.isDragging()) {
                    return;
                }
            }
            node._setDragPosition(evt, elem);
            node.fire('dragmove', {
                type: 'dragmove',
                target: node,
                evt: evt
            }, true);
        });
    },
    _endDragBefore: function (evt) {
        exports.DD._dragElements.forEach(function (elem, key) {
            var node = elem.node;
            var stage = node.getStage();
            if (evt) {
                stage.setPointersPositions(evt);
            }
            var pos = stage._changedPointerPositions.find(function (pos) { return pos.id === elem.pointerId; });
            if (!pos) {
                return;
            }
            if (elem.dragStatus === 'dragging' || elem.dragStatus === 'stopped') {
                exports.DD.justDragged = true;
                Global_1.Konva.listenClickTap = false;
                elem.dragStatus = 'stopped';
            }
            var drawNode = elem.node.getLayer() ||
                (elem.node instanceof Global_1.Konva['Stage'] && elem.node);
            if (drawNode) {
                drawNode.draw();
            }
        });
    },
    _endDragAfter: function (evt) {
        exports.DD._dragElements.forEach(function (elem, key) {
            if (elem.dragStatus === 'stopped') {
                elem.node.fire('dragend', {
                    type: 'dragend',
                    target: elem.node,
                    evt: evt
                }, true);
            }
            if (elem.dragStatus !== 'dragging') {
                exports.DD._dragElements.delete(key);
            }
        });
    }
};
if (Global_1.Konva.isBrowser) {
    window.addEventListener('mouseup', exports.DD._endDragBefore, true);
    window.addEventListener('touchend', exports.DD._endDragBefore, true);
    window.addEventListener('mousemove', exports.DD._drag);
    window.addEventListener('touchmove', exports.DD._drag);
    window.addEventListener('mouseup', exports.DD._endDragAfter, false);
    window.addEventListener('touchend', exports.DD._endDragAfter, false);
}

},{"./Global":18,"./Util":26}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("./Util");
var Validators_1 = require("./Validators");
var GET = 'get', SET = 'set';
exports.Factory = {
    addGetterSetter: function (constructor, attr, def, validator, after) {
        this.addGetter(constructor, attr, def);
        this.addSetter(constructor, attr, validator, after);
        this.addOverloadedGetterSetter(constructor, attr);
    },
    addGetter: function (constructor, attr, def) {
        var method = GET + Util_1.Util._capitalize(attr);
        constructor.prototype[method] =
            constructor.prototype[method] ||
                function () {
                    var val = this.attrs[attr];
                    return val === undefined ? def : val;
                };
    },
    addSetter: function (constructor, attr, validator, after) {
        var method = SET + Util_1.Util._capitalize(attr);
        if (!constructor.prototype[method]) {
            exports.Factory.overWriteSetter(constructor, attr, validator, after);
        }
    },
    overWriteSetter: function (constructor, attr, validator, after) {
        var method = SET + Util_1.Util._capitalize(attr);
        constructor.prototype[method] = function (val) {
            if (validator && val !== undefined && val !== null) {
                val = validator.call(this, val, attr);
            }
            this._setAttr(attr, val);
            if (after) {
                after.call(this);
            }
            return this;
        };
    },
    addComponentsGetterSetter: function (constructor, attr, components, validator, after) {
        var len = components.length, capitalize = Util_1.Util._capitalize, getter = GET + capitalize(attr), setter = SET + capitalize(attr), n, component;
        constructor.prototype[getter] = function () {
            var ret = {};
            for (n = 0; n < len; n++) {
                component = components[n];
                ret[component] = this.getAttr(attr + capitalize(component));
            }
            return ret;
        };
        var basicValidator = Validators_1.getComponentValidator(components);
        constructor.prototype[setter] = function (val) {
            var oldVal = this.attrs[attr], key;
            if (validator) {
                val = validator.call(this, val);
            }
            if (basicValidator) {
                basicValidator.call(this, val, attr);
            }
            for (key in val) {
                if (!val.hasOwnProperty(key)) {
                    continue;
                }
                this._setAttr(attr + capitalize(key), val[key]);
            }
            this._fireChangeEvent(attr, oldVal, val);
            if (after) {
                after.call(this);
            }
            return this;
        };
        this.addOverloadedGetterSetter(constructor, attr);
    },
    addOverloadedGetterSetter: function (constructor, attr) {
        var capitalizedAttr = Util_1.Util._capitalize(attr), setter = SET + capitalizedAttr, getter = GET + capitalizedAttr;
        constructor.prototype[attr] = function () {
            if (arguments.length) {
                this[setter](arguments[0]);
                return this;
            }
            return this[getter]();
        };
    },
    addDeprecatedGetterSetter: function (constructor, attr, def, validator) {
        Util_1.Util.error('Adding deprecated ' + attr);
        var method = GET + Util_1.Util._capitalize(attr);
        var message = attr +
            ' property is deprecated and will be removed soon. Look at Konva change log for more information.';
        constructor.prototype[method] = function () {
            Util_1.Util.error(message);
            var val = this.attrs[attr];
            return val === undefined ? def : val;
        };
        this.addSetter(constructor, attr, validator, function () {
            Util_1.Util.error(message);
        });
        this.addOverloadedGetterSetter(constructor, attr);
    },
    backCompat: function (constructor, methods) {
        Util_1.Util.each(methods, function (oldMethodName, newMethodName) {
            var method = constructor.prototype[newMethodName];
            var oldGetter = GET + Util_1.Util._capitalize(oldMethodName);
            var oldSetter = SET + Util_1.Util._capitalize(oldMethodName);
            function deprecated() {
                method.apply(this, arguments);
                Util_1.Util.error('"' +
                    oldMethodName +
                    '" method is deprecated and will be removed soon. Use ""' +
                    newMethodName +
                    '" instead.');
            }
            constructor.prototype[oldMethodName] = deprecated;
            constructor.prototype[oldGetter] = deprecated;
            constructor.prototype[oldSetter] = deprecated;
        });
    },
    afterSetFilter: function () {
        this._filterUpToDate = false;
    }
};

},{"./Util":26,"./Validators":27}],17:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("./Util");
var Container_1 = require("./Container");
var BaseLayer_1 = require("./BaseLayer");
var Global_1 = require("./Global");
var FastLayer = (function (_super) {
    __extends(FastLayer, _super);
    function FastLayer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FastLayer.prototype._validateAdd = function (child) {
        var type = child.getType();
        if (type !== 'Shape') {
            Util_1.Util.throw('You may only add shapes to a fast layer.');
        }
    };
    FastLayer.prototype.hitGraphEnabled = function () {
        return false;
    };
    FastLayer.prototype.drawScene = function (can) {
        var layer = this.getLayer(), canvas = can || (layer && layer.getCanvas());
        if (this.clearBeforeDraw()) {
            canvas.getContext().clear();
        }
        Container_1.Container.prototype.drawScene.call(this, canvas);
        return this;
    };
    FastLayer.prototype.draw = function () {
        this.drawScene();
        return this;
    };
    return FastLayer;
}(BaseLayer_1.BaseLayer));
exports.FastLayer = FastLayer;
FastLayer.prototype.nodeType = 'FastLayer';
Global_1._registerNode(FastLayer);
Util_1.Collection.mapMethods(FastLayer);

},{"./BaseLayer":11,"./Container":13,"./Global":18,"./Util":26}],18:[function(require,module,exports){
(function (global){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PI_OVER_180 = Math.PI / 180;
function detectBrowser() {
    return (typeof window !== 'undefined' &&
        ({}.toString.call(window) === '[object Window]' ||
            {}.toString.call(window) === '[object global]'));
}
var _detectIE = function (ua) {
    var msie = ua.indexOf('msie ');
    if (msie > 0) {
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }
    var trident = ua.indexOf('trident/');
    if (trident > 0) {
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }
    var edge = ua.indexOf('edge/');
    if (edge > 0) {
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }
    return false;
};
exports._parseUA = function (userAgent) {
    var ua = userAgent.toLowerCase(), match = /(chrome)[ /]([\w.]+)/.exec(ua) ||
        /(webkit)[ /]([\w.]+)/.exec(ua) ||
        /(opera)(?:.*version|)[ /]([\w.]+)/.exec(ua) ||
        /(msie) ([\w.]+)/.exec(ua) ||
        (ua.indexOf('compatible') < 0 &&
            /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua)) ||
        [], mobile = !!userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i), ieMobile = !!userAgent.match(/IEMobile/i);
    return {
        browser: match[1] || '',
        version: match[2] || '0',
        isIE: _detectIE(ua),
        mobile: mobile,
        ieMobile: ieMobile
    };
};
exports.glob = typeof global !== 'undefined'
    ? global
    : typeof window !== 'undefined'
        ? window
        : typeof WorkerGlobalScope !== 'undefined'
            ? self
            : {};
exports.Konva = {
    _global: exports.glob,
    version: '6.0.0',
    isBrowser: detectBrowser(),
    isUnminified: /param/.test(function (param) { }.toString()),
    dblClickWindow: 400,
    getAngle: function (angle) {
        return exports.Konva.angleDeg ? angle * PI_OVER_180 : angle;
    },
    enableTrace: false,
    _pointerEventsEnabled: false,
    hitOnDragEnabled: false,
    captureTouchEventsEnabled: false,
    listenClickTap: false,
    inDblClickWindow: false,
    pixelRatio: undefined,
    dragDistance: 3,
    angleDeg: true,
    showWarnings: true,
    dragButtons: [0, 1],
    isDragging: function () {
        return exports.Konva['DD'].isDragging;
    },
    isDragReady: function () {
        return !!exports.Konva['DD'].node;
    },
    UA: exports._parseUA((exports.glob.navigator && exports.glob.navigator.userAgent) || ''),
    document: exports.glob.document,
    _injectGlobal: function (Konva) {
        exports.glob.Konva = Konva;
    },
    _parseUA: exports._parseUA
};
exports._NODES_REGISTRY = {};
exports._registerNode = function (NodeClass) {
    exports._NODES_REGISTRY[NodeClass.prototype.getClassName()] = NodeClass;
    exports.Konva[NodeClass.prototype.getClassName()] = NodeClass;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],19:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("./Util");
var Container_1 = require("./Container");
var Global_1 = require("./Global");
var Group = (function (_super) {
    __extends(Group, _super);
    function Group() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Group.prototype._validateAdd = function (child) {
        var type = child.getType();
        if (type !== 'Group' && type !== 'Shape') {
            Util_1.Util.throw('You may only add groups and shapes to groups.');
        }
    };
    return Group;
}(Container_1.Container));
exports.Group = Group;
Group.prototype.nodeType = 'Group';
Global_1._registerNode(Group);
Util_1.Collection.mapMethods(Group);

},{"./Container":13,"./Global":18,"./Util":26}],20:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("./Util");
var Container_1 = require("./Container");
var Factory_1 = require("./Factory");
var BaseLayer_1 = require("./BaseLayer");
var Canvas_1 = require("./Canvas");
var Shape_1 = require("./Shape");
var Validators_1 = require("./Validators");
var Global_1 = require("./Global");
var HASH = '#', BEFORE_DRAW = 'beforeDraw', DRAW = 'draw', INTERSECTION_OFFSETS = [
    { x: 0, y: 0 },
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: 1, y: 1 },
    { x: -1, y: 1 }
], INTERSECTION_OFFSETS_LEN = INTERSECTION_OFFSETS.length;
var Layer = (function (_super) {
    __extends(Layer, _super);
    function Layer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.hitCanvas = new Canvas_1.HitCanvas({
            pixelRatio: 1
        });
        return _this;
    }
    Layer.prototype.setSize = function (_a) {
        var width = _a.width, height = _a.height;
        _super.prototype.setSize.call(this, { width: width, height: height });
        this.hitCanvas.setSize(width, height);
        return this;
    };
    Layer.prototype._validateAdd = function (child) {
        var type = child.getType();
        if (type !== 'Group' && type !== 'Shape') {
            Util_1.Util.throw('You may only add groups and shapes to a layer.');
        }
    };
    Layer.prototype.getIntersection = function (pos, selector) {
        var obj, i, intersectionOffset, shape;
        if (!this.hitGraphEnabled() || !this.isVisible()) {
            return null;
        }
        var spiralSearchDistance = 1;
        var continueSearch = false;
        while (true) {
            for (i = 0; i < INTERSECTION_OFFSETS_LEN; i++) {
                intersectionOffset = INTERSECTION_OFFSETS[i];
                obj = this._getIntersection({
                    x: pos.x + intersectionOffset.x * spiralSearchDistance,
                    y: pos.y + intersectionOffset.y * spiralSearchDistance
                });
                shape = obj.shape;
                if (shape && selector) {
                    return shape.findAncestor(selector, true);
                }
                else if (shape) {
                    return shape;
                }
                continueSearch = !!obj.antialiased;
                if (!obj.antialiased) {
                    break;
                }
            }
            if (continueSearch) {
                spiralSearchDistance += 1;
            }
            else {
                return null;
            }
        }
    };
    Layer.prototype._getIntersection = function (pos) {
        var ratio = this.hitCanvas.pixelRatio;
        var p = this.hitCanvas.context.getImageData(Math.round(pos.x * ratio), Math.round(pos.y * ratio), 1, 1).data, p3 = p[3], colorKey, shape;
        if (p3 === 255) {
            colorKey = Util_1.Util._rgbToHex(p[0], p[1], p[2]);
            shape = Shape_1.shapes[HASH + colorKey];
            if (shape) {
                return {
                    shape: shape
                };
            }
            return {
                antialiased: true
            };
        }
        else if (p3 > 0) {
            return {
                antialiased: true
            };
        }
        return {};
    };
    Layer.prototype.drawScene = function (can, top) {
        var layer = this.getLayer(), canvas = can || (layer && layer.getCanvas());
        this._fire(BEFORE_DRAW, {
            node: this
        });
        if (this.clearBeforeDraw()) {
            canvas.getContext().clear();
        }
        Container_1.Container.prototype.drawScene.call(this, canvas, top);
        this._fire(DRAW, {
            node: this
        });
        return this;
    };
    Layer.prototype.drawHit = function (can, top) {
        var layer = this.getLayer(), canvas = can || (layer && layer.hitCanvas);
        if (layer && layer.clearBeforeDraw()) {
            layer
                .getHitCanvas()
                .getContext()
                .clear();
        }
        Container_1.Container.prototype.drawHit.call(this, canvas, top);
        return this;
    };
    Layer.prototype.clear = function (bounds) {
        BaseLayer_1.BaseLayer.prototype.clear.call(this, bounds);
        this.getHitCanvas()
            .getContext()
            .clear(bounds);
        return this;
    };
    Layer.prototype.enableHitGraph = function () {
        this.hitGraphEnabled(true);
        return this;
    };
    Layer.prototype.disableHitGraph = function () {
        this.hitGraphEnabled(false);
        return this;
    };
    Layer.prototype.toggleHitCanvas = function () {
        if (!this.parent) {
            return;
        }
        var parent = this.parent;
        var added = !!this.hitCanvas._canvas.parentNode;
        if (added) {
            parent.content.removeChild(this.hitCanvas._canvas);
        }
        else {
            parent.content.appendChild(this.hitCanvas._canvas);
        }
    };
    return Layer;
}(BaseLayer_1.BaseLayer));
exports.Layer = Layer;
Layer.prototype.nodeType = 'Layer';
Global_1._registerNode(Layer);
Factory_1.Factory.addGetterSetter(Layer, 'hitGraphEnabled', true, Validators_1.getBooleanValidator());
Util_1.Collection.mapMethods(Layer);

},{"./BaseLayer":11,"./Canvas":12,"./Container":13,"./Factory":16,"./Global":18,"./Shape":23,"./Util":26,"./Validators":27}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("./Util");
var Factory_1 = require("./Factory");
var Canvas_1 = require("./Canvas");
var Global_1 = require("./Global");
var DragAndDrop_1 = require("./DragAndDrop");
var Validators_1 = require("./Validators");
exports.ids = {};
exports.names = {};
var _addId = function (node, id) {
    if (!id) {
        return;
    }
    exports.ids[id] = node;
};
exports._removeId = function (id, node) {
    if (!id) {
        return;
    }
    if (exports.ids[id] !== node) {
        return;
    }
    delete exports.ids[id];
};
exports._addName = function (node, name) {
    if (name) {
        if (!exports.names[name]) {
            exports.names[name] = [];
        }
        exports.names[name].push(node);
    }
};
exports._removeName = function (name, _id) {
    if (!name) {
        return;
    }
    var nodes = exports.names[name];
    if (!nodes) {
        return;
    }
    for (var n = 0; n < nodes.length; n++) {
        var no = nodes[n];
        if (no._id === _id) {
            nodes.splice(n, 1);
        }
    }
    if (nodes.length === 0) {
        delete exports.names[name];
    }
};
var ABSOLUTE_OPACITY = 'absoluteOpacity', ABSOLUTE_TRANSFORM = 'absoluteTransform', ABSOLUTE_SCALE = 'absoluteScale', CANVAS = 'canvas', CHANGE = 'Change', CHILDREN = 'children', KONVA = 'konva', LISTENING = 'listening', MOUSEENTER = 'mouseenter', MOUSELEAVE = 'mouseleave', NAME = 'name', SET = 'set', SHAPE = 'Shape', SPACE = ' ', STAGE = 'stage', TRANSFORM = 'transform', UPPER_STAGE = 'Stage', VISIBLE = 'visible', TRANSFORM_CHANGE_STR = [
    'xChange.konva',
    'yChange.konva',
    'scaleXChange.konva',
    'scaleYChange.konva',
    'skewXChange.konva',
    'skewYChange.konva',
    'rotationChange.konva',
    'offsetXChange.konva',
    'offsetYChange.konva',
    'transformsEnabledChange.konva',
].join(SPACE), SCALE_CHANGE_STR = ['scaleXChange.konva', 'scaleYChange.konva'].join(SPACE);
var emptyChildren = new Util_1.Collection();
var idCounter = 1;
var Node = (function () {
    function Node(config) {
        var _this = this;
        this._id = idCounter++;
        this.eventListeners = {};
        this.attrs = {};
        this.index = 0;
        this.parent = null;
        this._cache = new Map();
        this._lastPos = null;
        this._batchingTransformChange = false;
        this._needClearTransformCache = false;
        this._filterUpToDate = false;
        this._isUnderCache = false;
        this.children = emptyChildren;
        this._dragEventId = null;
        this.setAttrs(config);
        this.on(TRANSFORM_CHANGE_STR, function () {
            if (_this._batchingTransformChange) {
                _this._needClearTransformCache = true;
                return;
            }
            _this._clearCache(TRANSFORM);
            _this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
        });
        this.on('visibleChange.konva', function () {
            _this._clearSelfAndDescendantCache(VISIBLE);
        });
        this.on('listeningChange.konva', function () {
            _this._clearSelfAndDescendantCache(LISTENING);
        });
        this.on('opacityChange.konva', function () {
            _this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
        });
    }
    Node.prototype.hasChildren = function () {
        return false;
    };
    Node.prototype.getChildren = function () {
        return emptyChildren;
    };
    Node.prototype._clearCache = function (attr) {
        if (attr) {
            this._cache.delete(attr);
        }
        else {
            this._cache.clear();
        }
    };
    Node.prototype._getCache = function (attr, privateGetter) {
        var cache = this._cache.get(attr);
        if (cache === undefined) {
            cache = privateGetter.call(this);
            this._cache.set(attr, cache);
        }
        return cache;
    };
    Node.prototype._getCanvasCache = function () {
        return this._cache.get(CANVAS);
    };
    Node.prototype._clearSelfAndDescendantCache = function (attr, forceEvent) {
        this._clearCache(attr);
        if (forceEvent && attr === ABSOLUTE_TRANSFORM) {
            this.fire('_clearTransformCache');
        }
        if (this.isCached()) {
            return;
        }
        if (this.children) {
            this.children.each(function (node) {
                node._clearSelfAndDescendantCache(attr, true);
            });
        }
    };
    Node.prototype.clearCache = function () {
        this._cache.delete(CANVAS);
        this._clearSelfAndDescendantCache();
        return this;
    };
    Node.prototype.cache = function (config) {
        var conf = config || {};
        var rect = {};
        if (conf.x === undefined ||
            conf.y === undefined ||
            conf.width === undefined ||
            conf.height === undefined) {
            rect = this.getClientRect({
                skipTransform: true,
                relativeTo: this.getParent(),
            });
        }
        var width = Math.ceil(conf.width || rect.width), height = Math.ceil(conf.height || rect.height), pixelRatio = conf.pixelRatio, x = conf.x === undefined ? rect.x : conf.x, y = conf.y === undefined ? rect.y : conf.y, offset = conf.offset || 0, drawBorder = conf.drawBorder || false;
        if (!width || !height) {
            Util_1.Util.error('Can not cache the node. Width or height of the node equals 0. Caching is skipped.');
            return;
        }
        width += offset * 2;
        height += offset * 2;
        x -= offset;
        y -= offset;
        var cachedSceneCanvas = new Canvas_1.SceneCanvas({
            pixelRatio: pixelRatio,
            width: width,
            height: height,
        }), cachedFilterCanvas = new Canvas_1.SceneCanvas({
            pixelRatio: pixelRatio,
            width: 0,
            height: 0,
        }), cachedHitCanvas = new Canvas_1.HitCanvas({
            pixelRatio: 1,
            width: width,
            height: height,
        }), sceneContext = cachedSceneCanvas.getContext(), hitContext = cachedHitCanvas.getContext();
        cachedHitCanvas.isCache = true;
        this._cache.delete('canvas');
        this._filterUpToDate = false;
        if (conf.imageSmoothingEnabled === false) {
            cachedSceneCanvas.getContext()._context.imageSmoothingEnabled = false;
            cachedFilterCanvas.getContext()._context.imageSmoothingEnabled = false;
        }
        sceneContext.save();
        hitContext.save();
        sceneContext.translate(-x, -y);
        hitContext.translate(-x, -y);
        this._isUnderCache = true;
        this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
        this._clearSelfAndDescendantCache(ABSOLUTE_SCALE);
        this.drawScene(cachedSceneCanvas, this, true);
        this.drawHit(cachedHitCanvas, this, true);
        this._isUnderCache = false;
        sceneContext.restore();
        hitContext.restore();
        if (drawBorder) {
            sceneContext.save();
            sceneContext.beginPath();
            sceneContext.rect(0, 0, width, height);
            sceneContext.closePath();
            sceneContext.setAttr('strokeStyle', 'red');
            sceneContext.setAttr('lineWidth', 5);
            sceneContext.stroke();
            sceneContext.restore();
        }
        this._cache.set(CANVAS, {
            scene: cachedSceneCanvas,
            filter: cachedFilterCanvas,
            hit: cachedHitCanvas,
            x: x,
            y: y,
        });
        return this;
    };
    Node.prototype.isCached = function () {
        return this._cache.has('canvas');
    };
    Node.prototype.getClientRect = function (config) {
        throw new Error('abstract "getClientRect" method call');
    };
    Node.prototype._transformedRect = function (rect, top) {
        var points = [
            { x: rect.x, y: rect.y },
            { x: rect.x + rect.width, y: rect.y },
            { x: rect.x + rect.width, y: rect.y + rect.height },
            { x: rect.x, y: rect.y + rect.height },
        ];
        var minX, minY, maxX, maxY;
        var trans = this.getAbsoluteTransform(top);
        points.forEach(function (point) {
            var transformed = trans.point(point);
            if (minX === undefined) {
                minX = maxX = transformed.x;
                minY = maxY = transformed.y;
            }
            minX = Math.min(minX, transformed.x);
            minY = Math.min(minY, transformed.y);
            maxX = Math.max(maxX, transformed.x);
            maxY = Math.max(maxY, transformed.y);
        });
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
        };
    };
    Node.prototype._drawCachedSceneCanvas = function (context) {
        context.save();
        context._applyOpacity(this);
        context._applyGlobalCompositeOperation(this);
        var canvasCache = this._getCanvasCache();
        context.translate(canvasCache.x, canvasCache.y);
        var cacheCanvas = this._getCachedSceneCanvas();
        var ratio = cacheCanvas.pixelRatio;
        context.drawImage(cacheCanvas._canvas, 0, 0, cacheCanvas.width / ratio, cacheCanvas.height / ratio);
        context.restore();
    };
    Node.prototype._drawCachedHitCanvas = function (context) {
        var canvasCache = this._getCanvasCache(), hitCanvas = canvasCache.hit;
        context.save();
        context.translate(canvasCache.x, canvasCache.y);
        context.drawImage(hitCanvas._canvas, 0, 0);
        context.restore();
    };
    Node.prototype._getCachedSceneCanvas = function () {
        var filters = this.filters(), cachedCanvas = this._getCanvasCache(), sceneCanvas = cachedCanvas.scene, filterCanvas = cachedCanvas.filter, filterContext = filterCanvas.getContext(), len, imageData, n, filter;
        if (filters) {
            if (!this._filterUpToDate) {
                var ratio = sceneCanvas.pixelRatio;
                filterCanvas.setSize(sceneCanvas.width / sceneCanvas.pixelRatio, sceneCanvas.height / sceneCanvas.pixelRatio);
                try {
                    len = filters.length;
                    filterContext.clear();
                    filterContext.drawImage(sceneCanvas._canvas, 0, 0, sceneCanvas.getWidth() / ratio, sceneCanvas.getHeight() / ratio);
                    imageData = filterContext.getImageData(0, 0, filterCanvas.getWidth(), filterCanvas.getHeight());
                    for (n = 0; n < len; n++) {
                        filter = filters[n];
                        if (typeof filter !== 'function') {
                            Util_1.Util.error('Filter should be type of function, but got ' +
                                typeof filter +
                                ' instead. Please check correct filters');
                            continue;
                        }
                        filter.call(this, imageData);
                        filterContext.putImageData(imageData, 0, 0);
                    }
                }
                catch (e) {
                    Util_1.Util.error('Unable to apply filter. ' +
                        e.message +
                        ' This post my help you https://konvajs.org/docs/posts/Tainted_Canvas.html.');
                }
                this._filterUpToDate = true;
            }
            return filterCanvas;
        }
        return sceneCanvas;
    };
    Node.prototype.on = function (evtStr, handler) {
        if (arguments.length === 3) {
            return this._delegate.apply(this, arguments);
        }
        var events = evtStr.split(SPACE), len = events.length, n, event, parts, baseEvent, name;
        for (n = 0; n < len; n++) {
            event = events[n];
            parts = event.split('.');
            baseEvent = parts[0];
            name = parts[1] || '';
            if (!this.eventListeners[baseEvent]) {
                this.eventListeners[baseEvent] = [];
            }
            this.eventListeners[baseEvent].push({
                name: name,
                handler: handler,
            });
        }
        return this;
    };
    Node.prototype.off = function (evtStr, callback) {
        var events = (evtStr || '').split(SPACE), len = events.length, n, t, event, parts, baseEvent, name;
        if (!evtStr) {
            for (t in this.eventListeners) {
                this._off(t);
            }
        }
        for (n = 0; n < len; n++) {
            event = events[n];
            parts = event.split('.');
            baseEvent = parts[0];
            name = parts[1];
            if (baseEvent) {
                if (this.eventListeners[baseEvent]) {
                    this._off(baseEvent, name, callback);
                }
            }
            else {
                for (t in this.eventListeners) {
                    this._off(t, name, callback);
                }
            }
        }
        return this;
    };
    Node.prototype.dispatchEvent = function (evt) {
        var e = {
            target: this,
            type: evt.type,
            evt: evt,
        };
        this.fire(evt.type, e);
        return this;
    };
    Node.prototype.addEventListener = function (type, handler) {
        this.on(type, function (evt) {
            handler.call(this, evt.evt);
        });
        return this;
    };
    Node.prototype.removeEventListener = function (type) {
        this.off(type);
        return this;
    };
    Node.prototype._delegate = function (event, selector, handler) {
        var stopNode = this;
        this.on(event, function (evt) {
            var targets = evt.target.findAncestors(selector, true, stopNode);
            for (var i = 0; i < targets.length; i++) {
                evt = Util_1.Util.cloneObject(evt);
                evt.currentTarget = targets[i];
                handler.call(targets[i], evt);
            }
        });
    };
    Node.prototype.remove = function () {
        if (this.isDragging()) {
            this.stopDrag();
        }
        DragAndDrop_1.DD._dragElements.delete(this._id);
        this._remove();
        return this;
    };
    Node.prototype._clearCaches = function () {
        this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
        this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
        this._clearSelfAndDescendantCache(ABSOLUTE_SCALE);
        this._clearSelfAndDescendantCache(STAGE);
        this._clearSelfAndDescendantCache(VISIBLE);
        this._clearSelfAndDescendantCache(LISTENING);
    };
    Node.prototype._remove = function () {
        this._clearCaches();
        var parent = this.getParent();
        if (parent && parent.children) {
            parent.children.splice(this.index, 1);
            parent._setChildrenIndices();
            this.parent = null;
        }
    };
    Node.prototype.destroy = function () {
        exports._removeId(this.id(), this);
        var names = (this.name() || '').split(/\s/g);
        for (var i = 0; i < names.length; i++) {
            var subname = names[i];
            exports._removeName(subname, this._id);
        }
        this.remove();
        return this;
    };
    Node.prototype.getAttr = function (attr) {
        var method = 'get' + Util_1.Util._capitalize(attr);
        if (Util_1.Util._isFunction(this[method])) {
            return this[method]();
        }
        return this.attrs[attr];
    };
    Node.prototype.getAncestors = function () {
        var parent = this.getParent(), ancestors = new Util_1.Collection();
        while (parent) {
            ancestors.push(parent);
            parent = parent.getParent();
        }
        return ancestors;
    };
    Node.prototype.getAttrs = function () {
        return this.attrs || {};
    };
    Node.prototype.setAttrs = function (config) {
        var key, method;
        if (!config) {
            return this;
        }
        for (key in config) {
            if (key === CHILDREN) {
                continue;
            }
            method = SET + Util_1.Util._capitalize(key);
            if (Util_1.Util._isFunction(this[method])) {
                this[method](config[key]);
            }
            else {
                this._setAttr(key, config[key]);
            }
        }
        return this;
    };
    Node.prototype.isListening = function () {
        return this._getCache(LISTENING, this._isListening);
    };
    Node.prototype._isListening = function () {
        var listening = this.listening(), parent = this.getParent();
        if (listening === 'inherit') {
            if (parent) {
                return parent.isListening();
            }
            else {
                return true;
            }
        }
        else {
            return listening;
        }
    };
    Node.prototype.isVisible = function () {
        return this._getCache(VISIBLE, this._isVisible);
    };
    Node.prototype._isVisible = function (relativeTo) {
        var visible = this.visible(), parent = this.getParent();
        if (visible === 'inherit') {
            if (parent && parent !== relativeTo) {
                return parent._isVisible(relativeTo);
            }
            else {
                return true;
            }
        }
        else if (relativeTo && relativeTo !== parent) {
            return visible && parent._isVisible(relativeTo);
        }
        else {
            return visible;
        }
    };
    Node.prototype.shouldDrawHit = function () {
        var layer = this.getLayer();
        return ((!layer && this.isListening() && this.isVisible()) ||
            (layer &&
                layer.hitGraphEnabled() &&
                this.isListening() &&
                this.isVisible()));
    };
    Node.prototype.show = function () {
        this.visible(true);
        return this;
    };
    Node.prototype.hide = function () {
        this.visible(false);
        return this;
    };
    Node.prototype.getZIndex = function () {
        return this.index || 0;
    };
    Node.prototype.getAbsoluteZIndex = function () {
        var depth = this.getDepth(), that = this, index = 0, nodes, len, n, child;
        function addChildren(children) {
            nodes = [];
            len = children.length;
            for (n = 0; n < len; n++) {
                child = children[n];
                index++;
                if (child.nodeType !== SHAPE) {
                    nodes = nodes.concat(child.getChildren().toArray());
                }
                if (child._id === that._id) {
                    n = len;
                }
            }
            if (nodes.length > 0 && nodes[0].getDepth() <= depth) {
                addChildren(nodes);
            }
        }
        if (that.nodeType !== UPPER_STAGE) {
            addChildren(that.getStage().getChildren());
        }
        return index;
    };
    Node.prototype.getDepth = function () {
        var depth = 0, parent = this.parent;
        while (parent) {
            depth++;
            parent = parent.parent;
        }
        return depth;
    };
    Node.prototype._batchTransformChanges = function (func) {
        this._batchingTransformChange = true;
        func();
        this._batchingTransformChange = false;
        if (this._needClearTransformCache) {
            this._clearCache(TRANSFORM);
            this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM, true);
        }
        this._needClearTransformCache = false;
    };
    Node.prototype.setPosition = function (pos) {
        var _this = this;
        this._batchTransformChanges(function () {
            _this.x(pos.x);
            _this.y(pos.y);
        });
        return this;
    };
    Node.prototype.getPosition = function () {
        return {
            x: this.x(),
            y: this.y(),
        };
    };
    Node.prototype.getAbsolutePosition = function (top) {
        var haveCachedParent = false;
        var parent = this.parent;
        while (parent) {
            if (parent.isCached()) {
                haveCachedParent = true;
                break;
            }
            parent = parent.parent;
        }
        if (haveCachedParent && !top) {
            top = true;
        }
        var absoluteMatrix = this.getAbsoluteTransform(top).getMatrix(), absoluteTransform = new Util_1.Transform(), offset = this.offset();
        absoluteTransform.m = absoluteMatrix.slice();
        absoluteTransform.translate(offset.x, offset.y);
        return absoluteTransform.getTranslation();
    };
    Node.prototype.setAbsolutePosition = function (pos) {
        var origTrans = this._clearTransform(), it;
        this.attrs.x = origTrans.x;
        this.attrs.y = origTrans.y;
        delete origTrans.x;
        delete origTrans.y;
        this._clearCache(TRANSFORM);
        it = this._getAbsoluteTransform();
        it.invert();
        it.translate(pos.x, pos.y);
        pos = {
            x: this.attrs.x + it.getTranslation().x,
            y: this.attrs.y + it.getTranslation().y,
        };
        this._setTransform(origTrans);
        this.setPosition({ x: pos.x, y: pos.y });
        return this;
    };
    Node.prototype._setTransform = function (trans) {
        var key;
        for (key in trans) {
            this.attrs[key] = trans[key];
        }
    };
    Node.prototype._clearTransform = function () {
        var trans = {
            x: this.x(),
            y: this.y(),
            rotation: this.rotation(),
            scaleX: this.scaleX(),
            scaleY: this.scaleY(),
            offsetX: this.offsetX(),
            offsetY: this.offsetY(),
            skewX: this.skewX(),
            skewY: this.skewY(),
        };
        this.attrs.x = 0;
        this.attrs.y = 0;
        this.attrs.rotation = 0;
        this.attrs.scaleX = 1;
        this.attrs.scaleY = 1;
        this.attrs.offsetX = 0;
        this.attrs.offsetY = 0;
        this.attrs.skewX = 0;
        this.attrs.skewY = 0;
        return trans;
    };
    Node.prototype.move = function (change) {
        var changeX = change.x, changeY = change.y, x = this.x(), y = this.y();
        if (changeX !== undefined) {
            x += changeX;
        }
        if (changeY !== undefined) {
            y += changeY;
        }
        this.setPosition({ x: x, y: y });
        return this;
    };
    Node.prototype._eachAncestorReverse = function (func, top) {
        var family = [], parent = this.getParent(), len, n;
        if (top && top._id === this._id) {
            func(this);
            return;
        }
        family.unshift(this);
        while (parent && (!top || parent._id !== top._id)) {
            family.unshift(parent);
            parent = parent.parent;
        }
        len = family.length;
        for (n = 0; n < len; n++) {
            func(family[n]);
        }
    };
    Node.prototype.rotate = function (theta) {
        this.rotation(this.rotation() + theta);
        return this;
    };
    Node.prototype.moveToTop = function () {
        if (!this.parent) {
            Util_1.Util.warn('Node has no parent. moveToTop function is ignored.');
            return false;
        }
        var index = this.index;
        this.parent.children.splice(index, 1);
        this.parent.children.push(this);
        this.parent._setChildrenIndices();
        return true;
    };
    Node.prototype.moveUp = function () {
        if (!this.parent) {
            Util_1.Util.warn('Node has no parent. moveUp function is ignored.');
            return false;
        }
        var index = this.index, len = this.parent.getChildren().length;
        if (index < len - 1) {
            this.parent.children.splice(index, 1);
            this.parent.children.splice(index + 1, 0, this);
            this.parent._setChildrenIndices();
            return true;
        }
        return false;
    };
    Node.prototype.moveDown = function () {
        if (!this.parent) {
            Util_1.Util.warn('Node has no parent. moveDown function is ignored.');
            return false;
        }
        var index = this.index;
        if (index > 0) {
            this.parent.children.splice(index, 1);
            this.parent.children.splice(index - 1, 0, this);
            this.parent._setChildrenIndices();
            return true;
        }
        return false;
    };
    Node.prototype.moveToBottom = function () {
        if (!this.parent) {
            Util_1.Util.warn('Node has no parent. moveToBottom function is ignored.');
            return false;
        }
        var index = this.index;
        if (index > 0) {
            this.parent.children.splice(index, 1);
            this.parent.children.unshift(this);
            this.parent._setChildrenIndices();
            return true;
        }
        return false;
    };
    Node.prototype.setZIndex = function (zIndex) {
        if (!this.parent) {
            Util_1.Util.warn('Node has no parent. zIndex parameter is ignored.');
            return this;
        }
        if (zIndex < 0 || zIndex >= this.parent.children.length) {
            Util_1.Util.warn('Unexpected value ' +
                zIndex +
                ' for zIndex property. zIndex is just index of a node in children of its parent. Expected value is from 0 to ' +
                (this.parent.children.length - 1) +
                '.');
        }
        var index = this.index;
        this.parent.children.splice(index, 1);
        this.parent.children.splice(zIndex, 0, this);
        this.parent._setChildrenIndices();
        return this;
    };
    Node.prototype.getAbsoluteOpacity = function () {
        return this._getCache(ABSOLUTE_OPACITY, this._getAbsoluteOpacity);
    };
    Node.prototype._getAbsoluteOpacity = function () {
        var absOpacity = this.opacity();
        var parent = this.getParent();
        if (parent && !parent._isUnderCache) {
            absOpacity *= parent.getAbsoluteOpacity();
        }
        return absOpacity;
    };
    Node.prototype.moveTo = function (newContainer) {
        if (this.getParent() !== newContainer) {
            this._remove();
            newContainer.add(this);
        }
        return this;
    };
    Node.prototype.toObject = function () {
        var obj = {}, attrs = this.getAttrs(), key, val, getter, defaultValue, nonPlainObject;
        obj.attrs = {};
        for (key in attrs) {
            val = attrs[key];
            nonPlainObject =
                Util_1.Util.isObject(val) && !Util_1.Util._isPlainObject(val) && !Util_1.Util._isArray(val);
            if (nonPlainObject) {
                continue;
            }
            getter = typeof this[key] === 'function' && this[key];
            delete attrs[key];
            defaultValue = getter ? getter.call(this) : null;
            attrs[key] = val;
            if (defaultValue !== val) {
                obj.attrs[key] = val;
            }
        }
        obj.className = this.getClassName();
        return Util_1.Util._prepareToStringify(obj);
    };
    Node.prototype.toJSON = function () {
        return JSON.stringify(this.toObject());
    };
    Node.prototype.getParent = function () {
        return this.parent;
    };
    Node.prototype.findAncestors = function (selector, includeSelf, stopNode) {
        var res = [];
        if (includeSelf && this._isMatch(selector)) {
            res.push(this);
        }
        var ancestor = this.parent;
        while (ancestor) {
            if (ancestor === stopNode) {
                return res;
            }
            if (ancestor._isMatch(selector)) {
                res.push(ancestor);
            }
            ancestor = ancestor.parent;
        }
        return res;
    };
    Node.prototype.isAncestorOf = function (node) {
        return false;
    };
    Node.prototype.findAncestor = function (selector, includeSelf, stopNode) {
        return this.findAncestors(selector, includeSelf, stopNode)[0];
    };
    Node.prototype._isMatch = function (selector) {
        if (!selector) {
            return false;
        }
        if (typeof selector === 'function') {
            return selector(this);
        }
        var selectorArr = selector.replace(/ /g, '').split(','), len = selectorArr.length, n, sel;
        for (n = 0; n < len; n++) {
            sel = selectorArr[n];
            if (!Util_1.Util.isValidSelector(sel)) {
                Util_1.Util.warn('Selector "' +
                    sel +
                    '" is invalid. Allowed selectors examples are "#foo", ".bar" or "Group".');
                Util_1.Util.warn('If you have a custom shape with such className, please change it to start with upper letter like "Triangle".');
                Util_1.Util.warn('Konva is awesome, right?');
            }
            if (sel.charAt(0) === '#') {
                if (this.id() === sel.slice(1)) {
                    return true;
                }
            }
            else if (sel.charAt(0) === '.') {
                if (this.hasName(sel.slice(1))) {
                    return true;
                }
            }
            else if (this.className === sel || this.nodeType === sel) {
                return true;
            }
        }
        return false;
    };
    Node.prototype.getLayer = function () {
        var parent = this.getParent();
        return parent ? parent.getLayer() : null;
    };
    Node.prototype.getStage = function () {
        return this._getCache(STAGE, this._getStage);
    };
    Node.prototype._getStage = function () {
        var parent = this.getParent();
        if (parent) {
            return parent.getStage();
        }
        else {
            return undefined;
        }
    };
    Node.prototype.fire = function (eventType, evt, bubble) {
        if (evt === void 0) { evt = {}; }
        evt.target = evt.target || this;
        if (bubble) {
            this._fireAndBubble(eventType, evt);
        }
        else {
            this._fire(eventType, evt);
        }
        return this;
    };
    Node.prototype.getAbsoluteTransform = function (top) {
        if (top) {
            return this._getAbsoluteTransform(top);
        }
        else {
            return this._getCache(ABSOLUTE_TRANSFORM, this._getAbsoluteTransform);
        }
    };
    Node.prototype._getAbsoluteTransform = function (top) {
        var at;
        if (top) {
            at = new Util_1.Transform();
            this._eachAncestorReverse(function (node) {
                var transformsEnabled = node.transformsEnabled();
                if (transformsEnabled === 'all') {
                    at.multiply(node.getTransform());
                }
                else if (transformsEnabled === 'position') {
                    at.translate(node.x() - node.offsetX(), node.y() - node.offsetY());
                }
            }, top);
            return at;
        }
        else {
            if (this.parent) {
                at = this.parent.getAbsoluteTransform().copy();
            }
            else {
                at = new Util_1.Transform();
            }
            var transformsEnabled = this.transformsEnabled();
            if (transformsEnabled === 'all') {
                at.multiply(this.getTransform());
            }
            else if (transformsEnabled === 'position') {
                at.translate(this.x() - this.offsetX(), this.y() - this.offsetY());
            }
            return at;
        }
    };
    Node.prototype.getAbsoluteScale = function (top) {
        var parent = this;
        while (parent) {
            if (parent._isUnderCache) {
                top = parent;
            }
            parent = parent.getParent();
        }
        var transform = this.getAbsoluteTransform(top);
        var attrs = transform.decompose();
        return {
            x: attrs.scaleX,
            y: attrs.scaleY,
        };
    };
    Node.prototype.getAbsoluteRotation = function () {
        return this.getAbsoluteTransform().decompose().rotation;
    };
    Node.prototype.getTransform = function () {
        return this._getCache(TRANSFORM, this._getTransform);
    };
    Node.prototype._getTransform = function () {
        var m = new Util_1.Transform(), x = this.x(), y = this.y(), rotation = Global_1.Konva.getAngle(this.rotation()), scaleX = this.scaleX(), scaleY = this.scaleY(), skewX = this.skewX(), skewY = this.skewY(), offsetX = this.offsetX(), offsetY = this.offsetY();
        if (x !== 0 || y !== 0) {
            m.translate(x, y);
        }
        if (rotation !== 0) {
            m.rotate(rotation);
        }
        if (skewX !== 0 || skewY !== 0) {
            m.skew(skewX, skewY);
        }
        if (scaleX !== 1 || scaleY !== 1) {
            m.scale(scaleX, scaleY);
        }
        if (offsetX !== 0 || offsetY !== 0) {
            m.translate(-1 * offsetX, -1 * offsetY);
        }
        return m;
    };
    Node.prototype.clone = function (obj) {
        var attrs = Util_1.Util.cloneObject(this.attrs), key, allListeners, len, n, listener;
        for (key in obj) {
            attrs[key] = obj[key];
        }
        var node = new this.constructor(attrs);
        for (key in this.eventListeners) {
            allListeners = this.eventListeners[key];
            len = allListeners.length;
            for (n = 0; n < len; n++) {
                listener = allListeners[n];
                if (listener.name.indexOf(KONVA) < 0) {
                    if (!node.eventListeners[key]) {
                        node.eventListeners[key] = [];
                    }
                    node.eventListeners[key].push(listener);
                }
            }
        }
        return node;
    };
    Node.prototype._toKonvaCanvas = function (config) {
        config = config || {};
        var box = this.getClientRect();
        var stage = this.getStage(), x = config.x !== undefined ? config.x : box.x, y = config.y !== undefined ? config.y : box.y, pixelRatio = config.pixelRatio || 1, canvas = new Canvas_1.SceneCanvas({
            width: config.width || box.width || (stage ? stage.width() : 0),
            height: config.height || box.height || (stage ? stage.height() : 0),
            pixelRatio: pixelRatio,
        }), context = canvas.getContext();
        context.save();
        if (x || y) {
            context.translate(-1 * x, -1 * y);
        }
        this.drawScene(canvas);
        context.restore();
        return canvas;
    };
    Node.prototype.toCanvas = function (config) {
        return this._toKonvaCanvas(config)._canvas;
    };
    Node.prototype.toDataURL = function (config) {
        config = config || {};
        var mimeType = config.mimeType || null, quality = config.quality || null;
        var url = this._toKonvaCanvas(config).toDataURL(mimeType, quality);
        if (config.callback) {
            config.callback(url);
        }
        return url;
    };
    Node.prototype.toImage = function (config) {
        if (!config || !config.callback) {
            throw 'callback required for toImage method config argument';
        }
        var callback = config.callback;
        delete config.callback;
        Util_1.Util._urlToImage(this.toDataURL(config), function (img) {
            callback(img);
        });
    };
    Node.prototype.setSize = function (size) {
        this.width(size.width);
        this.height(size.height);
        return this;
    };
    Node.prototype.getSize = function () {
        return {
            width: this.width(),
            height: this.height(),
        };
    };
    Node.prototype.getClassName = function () {
        return this.className || this.nodeType;
    };
    Node.prototype.getType = function () {
        return this.nodeType;
    };
    Node.prototype.getDragDistance = function () {
        if (this.attrs.dragDistance !== undefined) {
            return this.attrs.dragDistance;
        }
        else if (this.parent) {
            return this.parent.getDragDistance();
        }
        else {
            return Global_1.Konva.dragDistance;
        }
    };
    Node.prototype._off = function (type, name, callback) {
        var evtListeners = this.eventListeners[type], i, evtName, handler;
        for (i = 0; i < evtListeners.length; i++) {
            evtName = evtListeners[i].name;
            handler = evtListeners[i].handler;
            if ((evtName !== 'konva' || name === 'konva') &&
                (!name || evtName === name) &&
                (!callback || callback === handler)) {
                evtListeners.splice(i, 1);
                if (evtListeners.length === 0) {
                    delete this.eventListeners[type];
                    break;
                }
                i--;
            }
        }
    };
    Node.prototype._fireChangeEvent = function (attr, oldVal, newVal) {
        this._fire(attr + CHANGE, {
            oldVal: oldVal,
            newVal: newVal,
        });
    };
    Node.prototype.setId = function (id) {
        var oldId = this.id();
        exports._removeId(oldId, this);
        _addId(this, id);
        this._setAttr('id', id);
        return this;
    };
    Node.prototype.setName = function (name) {
        var oldNames = (this.name() || '').split(/\s/g);
        var newNames = (name || '').split(/\s/g);
        var subname, i;
        for (i = 0; i < oldNames.length; i++) {
            subname = oldNames[i];
            if (newNames.indexOf(subname) === -1 && subname) {
                exports._removeName(subname, this._id);
            }
        }
        for (i = 0; i < newNames.length; i++) {
            subname = newNames[i];
            if (oldNames.indexOf(subname) === -1 && subname) {
                exports._addName(this, subname);
            }
        }
        this._setAttr(NAME, name);
        return this;
    };
    Node.prototype.addName = function (name) {
        if (!this.hasName(name)) {
            var oldName = this.name();
            var newName = oldName ? oldName + ' ' + name : name;
            this.setName(newName);
        }
        return this;
    };
    Node.prototype.hasName = function (name) {
        if (!name) {
            return false;
        }
        var fullName = this.name();
        if (!fullName) {
            return false;
        }
        var names = (fullName || '').split(/\s/g);
        return names.indexOf(name) !== -1;
    };
    Node.prototype.removeName = function (name) {
        var names = (this.name() || '').split(/\s/g);
        var index = names.indexOf(name);
        if (index !== -1) {
            names.splice(index, 1);
            this.setName(names.join(' '));
        }
        return this;
    };
    Node.prototype.setAttr = function (attr, val) {
        var func = this[SET + Util_1.Util._capitalize(attr)];
        if (Util_1.Util._isFunction(func)) {
            func.call(this, val);
        }
        else {
            this._setAttr(attr, val);
        }
        return this;
    };
    Node.prototype._setAttr = function (key, val) {
        var oldVal = this.attrs[key];
        if (oldVal === val && !Util_1.Util.isObject(val)) {
            return;
        }
        if (val === undefined || val === null) {
            delete this.attrs[key];
        }
        else {
            this.attrs[key] = val;
        }
        this._fireChangeEvent(key, oldVal, val);
    };
    Node.prototype._setComponentAttr = function (key, component, val) {
        var oldVal;
        if (val !== undefined) {
            oldVal = this.attrs[key];
            if (!oldVal) {
                this.attrs[key] = this.getAttr(key);
            }
            this.attrs[key][component] = val;
            this._fireChangeEvent(key, oldVal, val);
        }
    };
    Node.prototype._fireAndBubble = function (eventType, evt, compareShape) {
        if (evt && this.nodeType === SHAPE) {
            evt.target = this;
        }
        var shouldStop = (eventType === MOUSEENTER || eventType === MOUSELEAVE) &&
            ((compareShape &&
                (this === compareShape ||
                    (this.isAncestorOf && this.isAncestorOf(compareShape)))) ||
                (this.nodeType === 'Stage' && !compareShape));
        if (!shouldStop) {
            this._fire(eventType, evt);
            var stopBubble = (eventType === MOUSEENTER || eventType === MOUSELEAVE) &&
                compareShape &&
                compareShape.isAncestorOf &&
                compareShape.isAncestorOf(this) &&
                !compareShape.isAncestorOf(this.parent);
            if (((evt && !evt.cancelBubble) || !evt) &&
                this.parent &&
                this.parent.isListening() &&
                !stopBubble) {
                if (compareShape && compareShape.parent) {
                    this._fireAndBubble.call(this.parent, eventType, evt, compareShape);
                }
                else {
                    this._fireAndBubble.call(this.parent, eventType, evt);
                }
            }
        }
    };
    Node.prototype._fire = function (eventType, evt) {
        var events = this.eventListeners[eventType], i;
        if (events) {
            evt = evt || {};
            evt.currentTarget = this;
            evt.type = eventType;
            for (i = 0; i < events.length; i++) {
                events[i].handler.call(this, evt);
            }
        }
    };
    Node.prototype.draw = function () {
        this.drawScene();
        this.drawHit();
        return this;
    };
    Node.prototype._createDragElement = function (evt) {
        var pointerId = evt ? evt.pointerId : undefined;
        var stage = this.getStage();
        var ap = this.getAbsolutePosition();
        var pos = stage._getPointerById(pointerId) ||
            stage._changedPointerPositions[0] ||
            ap;
        DragAndDrop_1.DD._dragElements.set(this._id, {
            node: this,
            startPointerPos: pos,
            offset: {
                x: pos.x - ap.x,
                y: pos.y - ap.y,
            },
            dragStatus: 'ready',
            pointerId: pointerId,
        });
    };
    Node.prototype.startDrag = function (evt) {
        if (!DragAndDrop_1.DD._dragElements.has(this._id)) {
            this._createDragElement(evt);
        }
        var elem = DragAndDrop_1.DD._dragElements.get(this._id);
        elem.dragStatus = 'dragging';
        this.fire('dragstart', {
            type: 'dragstart',
            target: this,
            evt: evt && evt.evt,
        }, true);
    };
    Node.prototype._setDragPosition = function (evt, elem) {
        var pos = this.getStage()._getPointerById(elem.pointerId);
        if (!pos) {
            return;
        }
        var newNodePos = {
            x: pos.x - elem.offset.x,
            y: pos.y - elem.offset.y,
        };
        var dbf = this.dragBoundFunc();
        if (dbf !== undefined) {
            var bounded = dbf.call(this, newNodePos, evt);
            if (!bounded) {
                Util_1.Util.warn('dragBoundFunc did not return any value. That is unexpected behavior. You must return new absolute position from dragBoundFunc.');
            }
            else {
                newNodePos = bounded;
            }
        }
        if (!this._lastPos ||
            this._lastPos.x !== newNodePos.x ||
            this._lastPos.y !== newNodePos.y) {
            this.setAbsolutePosition(newNodePos);
            if (this.getLayer()) {
                this.getLayer().batchDraw();
            }
            else if (this.getStage()) {
                this.getStage().batchDraw();
            }
        }
        this._lastPos = newNodePos;
    };
    Node.prototype.stopDrag = function (evt) {
        var elem = DragAndDrop_1.DD._dragElements.get(this._id);
        if (elem) {
            elem.dragStatus = 'stopped';
        }
        DragAndDrop_1.DD._endDragBefore(evt);
        DragAndDrop_1.DD._endDragAfter(evt);
    };
    Node.prototype.setDraggable = function (draggable) {
        this._setAttr('draggable', draggable);
        this._dragChange();
    };
    Node.prototype.isDragging = function () {
        var elem = DragAndDrop_1.DD._dragElements.get(this._id);
        return elem ? elem.dragStatus === 'dragging' : false;
    };
    Node.prototype._listenDrag = function () {
        this._dragCleanup();
        this.on('mousedown.konva touchstart.konva', function (evt) {
            var _this = this;
            var shouldCheckButton = evt.evt['button'] !== undefined;
            var canDrag = !shouldCheckButton || Global_1.Konva.dragButtons.indexOf(evt.evt['button']) >= 0;
            if (!canDrag) {
                return;
            }
            if (this.isDragging()) {
                return;
            }
            var hasDraggingChild = false;
            DragAndDrop_1.DD._dragElements.forEach(function (elem) {
                if (_this.isAncestorOf(elem.node)) {
                    hasDraggingChild = true;
                }
            });
            if (!hasDraggingChild) {
                this._createDragElement(evt);
            }
        });
    };
    Node.prototype._dragChange = function () {
        if (this.attrs.draggable) {
            this._listenDrag();
        }
        else {
            this._dragCleanup();
            var stage = this.getStage();
            if (stage && DragAndDrop_1.DD._dragElements.has(this._id)) {
                this.stopDrag();
            }
        }
    };
    Node.prototype._dragCleanup = function () {
        this.off('mousedown.konva');
        this.off('touchstart.konva');
    };
    Node.create = function (data, container) {
        if (Util_1.Util._isString(data)) {
            data = JSON.parse(data);
        }
        return this._createNode(data, container);
    };
    Node._createNode = function (obj, container) {
        var className = Node.prototype.getClassName.call(obj), children = obj.children, no, len, n;
        if (container) {
            obj.attrs.container = container;
        }
        if (!Global_1._NODES_REGISTRY[className]) {
            Util_1.Util.warn('Can not find a node with class name "' +
                className +
                '". Fallback to "Shape".');
            className = 'Shape';
        }
        var Class = Global_1._NODES_REGISTRY[className];
        no = new Class(obj.attrs);
        if (children) {
            len = children.length;
            for (n = 0; n < len; n++) {
                no.add(Node._createNode(children[n]));
            }
        }
        return no;
    };
    return Node;
}());
exports.Node = Node;
Node.prototype.nodeType = 'Node';
Node.prototype._attrsAffectingSize = [];
Factory_1.Factory.addGetterSetter(Node, 'zIndex');
Factory_1.Factory.addGetterSetter(Node, 'absolutePosition');
Factory_1.Factory.addGetterSetter(Node, 'position');
Factory_1.Factory.addGetterSetter(Node, 'x', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Node, 'y', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Node, 'globalCompositeOperation', 'source-over', Validators_1.getStringValidator());
Factory_1.Factory.addGetterSetter(Node, 'opacity', 1, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Node, 'name', '', Validators_1.getStringValidator());
Factory_1.Factory.addGetterSetter(Node, 'id', '', Validators_1.getStringValidator());
Factory_1.Factory.addGetterSetter(Node, 'rotation', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addComponentsGetterSetter(Node, 'scale', ['x', 'y']);
Factory_1.Factory.addGetterSetter(Node, 'scaleX', 1, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Node, 'scaleY', 1, Validators_1.getNumberValidator());
Factory_1.Factory.addComponentsGetterSetter(Node, 'skew', ['x', 'y']);
Factory_1.Factory.addGetterSetter(Node, 'skewX', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Node, 'skewY', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addComponentsGetterSetter(Node, 'offset', ['x', 'y']);
Factory_1.Factory.addGetterSetter(Node, 'offsetX', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Node, 'offsetY', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Node, 'dragDistance', null, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Node, 'width', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Node, 'height', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Node, 'listening', 'inherit', function (val) {
    var isValid = val === true || val === false || val === 'inherit';
    if (!isValid) {
        Util_1.Util.warn(val +
            ' is a not valid value for "listening" attribute. The value may be true, false or "inherit".');
    }
    return val;
});
Factory_1.Factory.addGetterSetter(Node, 'preventDefault', true, Validators_1.getBooleanValidator());
Factory_1.Factory.addGetterSetter(Node, 'filters', null, function (val) {
    this._filterUpToDate = false;
    return val;
});
Factory_1.Factory.addGetterSetter(Node, 'visible', 'inherit', function (val) {
    var isValid = val === true || val === false || val === 'inherit';
    if (!isValid) {
        Util_1.Util.warn(val +
            ' is a not valid value for "visible" attribute. The value may be true, false or "inherit".');
    }
    return val;
});
Factory_1.Factory.addGetterSetter(Node, 'transformsEnabled', 'all', Validators_1.getStringValidator());
Factory_1.Factory.addGetterSetter(Node, 'size');
Factory_1.Factory.addGetterSetter(Node, 'dragBoundFunc');
Factory_1.Factory.addGetterSetter(Node, 'draggable', false, Validators_1.getBooleanValidator());
Factory_1.Factory.backCompat(Node, {
    rotateDeg: 'rotate',
    setRotationDeg: 'setRotation',
    getRotationDeg: 'getRotation',
});
Util_1.Collection.mapMethods(Node);

},{"./Canvas":12,"./DragAndDrop":15,"./Factory":16,"./Global":18,"./Util":26,"./Validators":27}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Global_1 = require("./Global");
var Captures = new Map();
var SUPPORT_POINTER_EVENTS = Global_1.Konva._global['PointerEvent'] !== undefined;
function getCapturedShape(pointerId) {
    return Captures.get(pointerId);
}
exports.getCapturedShape = getCapturedShape;
function createEvent(evt) {
    return {
        evt: evt,
        pointerId: evt.pointerId
    };
}
exports.createEvent = createEvent;
function hasPointerCapture(pointerId, shape) {
    return Captures.get(pointerId) === shape;
}
exports.hasPointerCapture = hasPointerCapture;
function setPointerCapture(pointerId, shape) {
    releaseCapture(pointerId);
    var stage = shape.getStage();
    if (!stage)
        return;
    Captures.set(pointerId, shape);
    if (SUPPORT_POINTER_EVENTS) {
        shape._fire('gotpointercapture', createEvent(new PointerEvent('gotpointercapture')));
    }
}
exports.setPointerCapture = setPointerCapture;
function releaseCapture(pointerId, target) {
    var shape = Captures.get(pointerId);
    if (!shape)
        return;
    var stage = shape.getStage();
    if (stage && stage.content) {
    }
    Captures.delete(pointerId);
    if (SUPPORT_POINTER_EVENTS) {
        shape._fire('lostpointercapture', createEvent(new PointerEvent('lostpointercapture')));
    }
}
exports.releaseCapture = releaseCapture;

},{"./Global":18}],23:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("./Util");
var Factory_1 = require("./Factory");
var Node_1 = require("./Node");
var Validators_1 = require("./Validators");
var Global_1 = require("./Global");
var PointerEvents = require("./PointerEvents");
var HAS_SHADOW = 'hasShadow';
var SHADOW_RGBA = 'shadowRGBA';
var patternImage = 'patternImage';
var linearGradient = 'linearGradient';
var radialGradient = 'radialGradient';
var dummyContext;
function getDummyContext() {
    if (dummyContext) {
        return dummyContext;
    }
    dummyContext = Util_1.Util.createCanvasElement().getContext('2d');
    return dummyContext;
}
exports.shapes = {};
function _fillFunc(context) {
    context.fill();
}
function _strokeFunc(context) {
    context.stroke();
}
function _fillFuncHit(context) {
    context.fill();
}
function _strokeFuncHit(context) {
    context.stroke();
}
function _clearHasShadowCache() {
    this._clearCache(HAS_SHADOW);
}
function _clearGetShadowRGBACache() {
    this._clearCache(SHADOW_RGBA);
}
function _clearFillPatternCache() {
    this._clearCache(patternImage);
}
function _clearLinearGradientCache() {
    this._clearCache(linearGradient);
}
function _clearRadialGradientCache() {
    this._clearCache(radialGradient);
}
var Shape = (function (_super) {
    __extends(Shape, _super);
    function Shape(config) {
        var _this = _super.call(this, config) || this;
        var key;
        while (true) {
            key = Util_1.Util.getRandomColor();
            if (key && !(key in exports.shapes)) {
                break;
            }
        }
        _this.colorKey = key;
        exports.shapes[key] = _this;
        _this.on('shadowColorChange.konva shadowBlurChange.konva shadowOffsetChange.konva shadowOpacityChange.konva shadowEnabledChange.konva', _clearHasShadowCache);
        _this.on('shadowColorChange.konva shadowOpacityChange.konva shadowEnabledChange.konva', _clearGetShadowRGBACache);
        _this.on('fillPriorityChange.konva fillPatternImageChange.konva fillPatternRepeatChange.konva fillPatternScaleXChange.konva fillPatternScaleYChange.konva', _clearFillPatternCache);
        _this.on('fillPriorityChange.konva fillLinearGradientColorStopsChange.konva fillLinearGradientStartPointXChange.konva fillLinearGradientStartPointYChange.konva fillLinearGradientEndPointXChange.konva fillLinearGradientEndPointYChange.konva', _clearLinearGradientCache);
        _this.on('fillPriorityChange.konva fillRadialGradientColorStopsChange.konva fillRadialGradientStartPointXChange.konva fillRadialGradientStartPointYChange.konva fillRadialGradientEndPointXChange.konva fillRadialGradientEndPointYChange.konva fillRadialGradientStartRadiusChange.konva fillRadialGradientEndRadiusChange.konva', _clearRadialGradientCache);
        return _this;
    }
    Shape.prototype.getContext = function () {
        return this.getLayer().getContext();
    };
    Shape.prototype.getCanvas = function () {
        return this.getLayer().getCanvas();
    };
    Shape.prototype.getSceneFunc = function () {
        return this.attrs.sceneFunc || this['_sceneFunc'];
    };
    Shape.prototype.getHitFunc = function () {
        return this.attrs.hitFunc || this['_hitFunc'];
    };
    Shape.prototype.hasShadow = function () {
        return this._getCache(HAS_SHADOW, this._hasShadow);
    };
    Shape.prototype._hasShadow = function () {
        return (this.shadowEnabled() &&
            this.shadowOpacity() !== 0 &&
            !!(this.shadowColor() ||
                this.shadowBlur() ||
                this.shadowOffsetX() ||
                this.shadowOffsetY()));
    };
    Shape.prototype._getFillPattern = function () {
        return this._getCache(patternImage, this.__getFillPattern);
    };
    Shape.prototype.__getFillPattern = function () {
        if (this.fillPatternImage()) {
            var ctx = getDummyContext();
            var pattern = ctx.createPattern(this.fillPatternImage(), this.fillPatternRepeat() || 'repeat');
            return pattern;
        }
    };
    Shape.prototype._getLinearGradient = function () {
        return this._getCache(linearGradient, this.__getLinearGradient);
    };
    Shape.prototype.__getLinearGradient = function () {
        var colorStops = this.fillLinearGradientColorStops();
        if (colorStops) {
            var ctx = getDummyContext();
            var start = this.fillLinearGradientStartPoint();
            var end = this.fillLinearGradientEndPoint();
            var grd = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
            for (var n = 0; n < colorStops.length; n += 2) {
                grd.addColorStop(colorStops[n], colorStops[n + 1]);
            }
            return grd;
        }
    };
    Shape.prototype._getRadialGradient = function () {
        return this._getCache(radialGradient, this.__getRadialGradient);
    };
    Shape.prototype.__getRadialGradient = function () {
        var colorStops = this.fillRadialGradientColorStops();
        if (colorStops) {
            var ctx = getDummyContext();
            var start = this.fillRadialGradientStartPoint();
            var end = this.fillRadialGradientEndPoint();
            var grd = ctx.createRadialGradient(start.x, start.y, this.fillRadialGradientStartRadius(), end.x, end.y, this.fillRadialGradientEndRadius());
            for (var n = 0; n < colorStops.length; n += 2) {
                grd.addColorStop(colorStops[n], colorStops[n + 1]);
            }
            return grd;
        }
    };
    Shape.prototype.getShadowRGBA = function () {
        return this._getCache(SHADOW_RGBA, this._getShadowRGBA);
    };
    Shape.prototype._getShadowRGBA = function () {
        if (this.hasShadow()) {
            var rgba = Util_1.Util.colorToRGBA(this.shadowColor());
            return ('rgba(' +
                rgba.r +
                ',' +
                rgba.g +
                ',' +
                rgba.b +
                ',' +
                rgba.a * (this.shadowOpacity() || 1) +
                ')');
        }
    };
    Shape.prototype.hasFill = function () {
        return (this.fillEnabled() &&
            !!(this.fill() ||
                this.fillPatternImage() ||
                this.fillLinearGradientColorStops() ||
                this.fillRadialGradientColorStops()));
    };
    Shape.prototype.hasStroke = function () {
        return (this.strokeEnabled() &&
            this.strokeWidth() &&
            !!(this.stroke() || this.strokeLinearGradientColorStops()));
    };
    Shape.prototype.hasHitStroke = function () {
        var width = this.hitStrokeWidth();
        if (width === 'auto') {
            return this.hasStroke();
        }
        return this.strokeEnabled() && !!width;
    };
    Shape.prototype.intersects = function (point) {
        var stage = this.getStage(), bufferHitCanvas = stage.bufferHitCanvas, p;
        bufferHitCanvas.getContext().clear();
        this.drawHit(bufferHitCanvas);
        p = bufferHitCanvas.context.getImageData(Math.round(point.x), Math.round(point.y), 1, 1).data;
        return p[3] > 0;
    };
    Shape.prototype.destroy = function () {
        Node_1.Node.prototype.destroy.call(this);
        delete exports.shapes[this.colorKey];
        delete this.colorKey;
        return this;
    };
    Shape.prototype._useBufferCanvas = function (caching) {
        return !!((!caching || this.hasShadow()) &&
            this.perfectDrawEnabled() &&
            this.getAbsoluteOpacity() !== 1 &&
            this.hasFill() &&
            this.hasStroke() &&
            this.getStage());
    };
    Shape.prototype.setStrokeHitEnabled = function (val) {
        Util_1.Util.warn('strokeHitEnabled property is deprecated. Please use hitStrokeWidth instead.');
        if (val) {
            this.hitStrokeWidth('auto');
        }
        else {
            this.hitStrokeWidth(0);
        }
    };
    Shape.prototype.getStrokeHitEnabled = function () {
        if (this.hitStrokeWidth() === 0) {
            return false;
        }
        else {
            return true;
        }
    };
    Shape.prototype.getSelfRect = function () {
        var size = this.size();
        return {
            x: this._centroid ? -size.width / 2 : 0,
            y: this._centroid ? -size.height / 2 : 0,
            width: size.width,
            height: size.height
        };
    };
    Shape.prototype.getClientRect = function (attrs) {
        attrs = attrs || {};
        var skipTransform = attrs.skipTransform;
        var relativeTo = attrs.relativeTo;
        var fillRect = this.getSelfRect();
        var applyStroke = !attrs.skipStroke && this.hasStroke();
        var strokeWidth = (applyStroke && this.strokeWidth()) || 0;
        var fillAndStrokeWidth = fillRect.width + strokeWidth;
        var fillAndStrokeHeight = fillRect.height + strokeWidth;
        var applyShadow = !attrs.skipShadow && this.hasShadow();
        var shadowOffsetX = applyShadow ? this.shadowOffsetX() : 0;
        var shadowOffsetY = applyShadow ? this.shadowOffsetY() : 0;
        var preWidth = fillAndStrokeWidth + Math.abs(shadowOffsetX);
        var preHeight = fillAndStrokeHeight + Math.abs(shadowOffsetY);
        var blurRadius = (applyShadow && this.shadowBlur()) || 0;
        var width = preWidth + blurRadius * 2;
        var height = preHeight + blurRadius * 2;
        var roundingOffset = 0;
        if (Math.round(strokeWidth / 2) !== strokeWidth / 2) {
            roundingOffset = 1;
        }
        var rect = {
            width: width + roundingOffset,
            height: height + roundingOffset,
            x: -Math.round(strokeWidth / 2 + blurRadius) +
                Math.min(shadowOffsetX, 0) +
                fillRect.x,
            y: -Math.round(strokeWidth / 2 + blurRadius) +
                Math.min(shadowOffsetY, 0) +
                fillRect.y
        };
        if (!skipTransform) {
            return this._transformedRect(rect, relativeTo);
        }
        return rect;
    };
    Shape.prototype.drawScene = function (can, top, caching, skipBuffer) {
        var layer = this.getLayer(), canvas = can || layer.getCanvas(), context = canvas.getContext(), cachedCanvas = this._getCanvasCache(), drawFunc = this.sceneFunc(), hasShadow = this.hasShadow(), hasStroke = this.hasStroke(), stage, bufferCanvas, bufferContext;
        if (!this.isVisible() && !caching) {
            return this;
        }
        if (cachedCanvas) {
            context.save();
            layer._applyTransform(this, context, top);
            this._drawCachedSceneCanvas(context);
            context.restore();
            return this;
        }
        if (!drawFunc) {
            return this;
        }
        context.save();
        if (this._useBufferCanvas(caching) && !skipBuffer) {
            stage = this.getStage();
            bufferCanvas = stage.bufferCanvas;
            bufferContext = bufferCanvas.getContext();
            bufferContext.clear();
            bufferContext.save();
            bufferContext._applyLineJoin(this);
            if (!caching) {
                if (layer) {
                    layer._applyTransform(this, bufferContext, top);
                }
                else {
                    var m = this.getAbsoluteTransform(top).getMatrix();
                    context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
                }
            }
            drawFunc.call(this, bufferContext, this);
            bufferContext.restore();
            var ratio = bufferCanvas.pixelRatio;
            if (hasShadow && !canvas.hitCanvas) {
                context.save();
                context._applyShadow(this);
                context._applyOpacity(this);
                context._applyGlobalCompositeOperation(this);
                context.drawImage(bufferCanvas._canvas, 0, 0, bufferCanvas.width / ratio, bufferCanvas.height / ratio);
                context.restore();
            }
            else {
                context._applyOpacity(this);
                context._applyGlobalCompositeOperation(this);
                context.drawImage(bufferCanvas._canvas, 0, 0, bufferCanvas.width / ratio, bufferCanvas.height / ratio);
            }
        }
        else {
            context._applyLineJoin(this);
            if (!caching) {
                if (layer) {
                    layer._applyTransform(this, context, top);
                }
                else {
                    var o = this.getAbsoluteTransform(top).getMatrix();
                    context.transform(o[0], o[1], o[2], o[3], o[4], o[5]);
                }
            }
            if (hasShadow && hasStroke && !canvas.hitCanvas) {
                context.save();
                if (!caching) {
                    context._applyOpacity(this);
                    context._applyGlobalCompositeOperation(this);
                }
                context._applyShadow(this);
                drawFunc.call(this, context, this);
                context.restore();
                if (this.hasFill() && this.shadowForStrokeEnabled()) {
                    drawFunc.call(this, context, this);
                }
            }
            else if (hasShadow && !canvas.hitCanvas) {
                context.save();
                if (!caching) {
                    context._applyOpacity(this);
                    context._applyGlobalCompositeOperation(this);
                }
                context._applyShadow(this);
                drawFunc.call(this, context, this);
                context.restore();
            }
            else {
                if (!caching) {
                    context._applyOpacity(this);
                    context._applyGlobalCompositeOperation(this);
                }
                drawFunc.call(this, context, this);
            }
        }
        context.restore();
        return this;
    };
    Shape.prototype.drawHit = function (can, top, caching) {
        var layer = this.getLayer(), canvas = can || layer.hitCanvas, context = canvas && canvas.getContext(), drawFunc = this.hitFunc() || this.sceneFunc(), cachedCanvas = this._getCanvasCache(), cachedHitCanvas = cachedCanvas && cachedCanvas.hit;
        if (!this.colorKey) {
            console.log(this);
            Util_1.Util.warn('Looks like your canvas has a destroyed shape in it. Do not reuse shape after you destroyed it. See the shape in logs above. If you want to reuse shape you should call remove() instead of destroy()');
        }
        if (!this.shouldDrawHit() && !caching) {
            return this;
        }
        if (cachedHitCanvas) {
            context.save();
            layer._applyTransform(this, context, top);
            this._drawCachedHitCanvas(context);
            context.restore();
            return this;
        }
        if (!drawFunc) {
            return this;
        }
        context.save();
        context._applyLineJoin(this);
        if (!caching) {
            if (layer) {
                layer._applyTransform(this, context, top);
            }
            else {
                var o = this.getAbsoluteTransform(top).getMatrix();
                context.transform(o[0], o[1], o[2], o[3], o[4], o[5]);
            }
        }
        drawFunc.call(this, context, this);
        context.restore();
        return this;
    };
    Shape.prototype.drawHitFromCache = function (alphaThreshold) {
        if (alphaThreshold === void 0) { alphaThreshold = 0; }
        var cachedCanvas = this._getCanvasCache(), sceneCanvas = this._getCachedSceneCanvas(), hitCanvas = cachedCanvas.hit, hitContext = hitCanvas.getContext(), hitWidth = hitCanvas.getWidth(), hitHeight = hitCanvas.getHeight(), hitImageData, hitData, len, rgbColorKey, i, alpha;
        hitContext.clear();
        hitContext.drawImage(sceneCanvas._canvas, 0, 0, hitWidth, hitHeight);
        try {
            hitImageData = hitContext.getImageData(0, 0, hitWidth, hitHeight);
            hitData = hitImageData.data;
            len = hitData.length;
            rgbColorKey = Util_1.Util._hexToRgb(this.colorKey);
            for (i = 0; i < len; i += 4) {
                alpha = hitData[i + 3];
                if (alpha > alphaThreshold) {
                    hitData[i] = rgbColorKey.r;
                    hitData[i + 1] = rgbColorKey.g;
                    hitData[i + 2] = rgbColorKey.b;
                    hitData[i + 3] = 255;
                }
                else {
                    hitData[i + 3] = 0;
                }
            }
            hitContext.putImageData(hitImageData, 0, 0);
        }
        catch (e) {
            Util_1.Util.error('Unable to draw hit graph from cached scene canvas. ' + e.message);
        }
        return this;
    };
    Shape.prototype.hasPointerCapture = function (pointerId) {
        return PointerEvents.hasPointerCapture(pointerId, this);
    };
    Shape.prototype.setPointerCapture = function (pointerId) {
        PointerEvents.setPointerCapture(pointerId, this);
    };
    Shape.prototype.releaseCapture = function (pointerId) {
        PointerEvents.releaseCapture(pointerId, this);
    };
    return Shape;
}(Node_1.Node));
exports.Shape = Shape;
Shape.prototype._fillFunc = _fillFunc;
Shape.prototype._strokeFunc = _strokeFunc;
Shape.prototype._fillFuncHit = _fillFuncHit;
Shape.prototype._strokeFuncHit = _strokeFuncHit;
Shape.prototype._centroid = false;
Shape.prototype.nodeType = 'Shape';
Global_1._registerNode(Shape);
Factory_1.Factory.addGetterSetter(Shape, 'stroke', undefined, Validators_1.getStringValidator());
Factory_1.Factory.addGetterSetter(Shape, 'strokeWidth', 2, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Shape, 'hitStrokeWidth', 'auto', Validators_1.getNumberOrAutoValidator());
Factory_1.Factory.addGetterSetter(Shape, 'strokeHitEnabled', true, Validators_1.getBooleanValidator());
Factory_1.Factory.addGetterSetter(Shape, 'perfectDrawEnabled', true, Validators_1.getBooleanValidator());
Factory_1.Factory.addGetterSetter(Shape, 'shadowForStrokeEnabled', true, Validators_1.getBooleanValidator());
Factory_1.Factory.addGetterSetter(Shape, 'lineJoin');
Factory_1.Factory.addGetterSetter(Shape, 'lineCap');
Factory_1.Factory.addGetterSetter(Shape, 'sceneFunc');
Factory_1.Factory.addGetterSetter(Shape, 'hitFunc');
Factory_1.Factory.addGetterSetter(Shape, 'dash');
Factory_1.Factory.addGetterSetter(Shape, 'dashOffset', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Shape, 'shadowColor', undefined, Validators_1.getStringValidator());
Factory_1.Factory.addGetterSetter(Shape, 'shadowBlur', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Shape, 'shadowOpacity', 1, Validators_1.getNumberValidator());
Factory_1.Factory.addComponentsGetterSetter(Shape, 'shadowOffset', ['x', 'y']);
Factory_1.Factory.addGetterSetter(Shape, 'shadowOffsetX', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Shape, 'shadowOffsetY', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Shape, 'fillPatternImage');
Factory_1.Factory.addGetterSetter(Shape, 'fill', undefined, Validators_1.getStringValidator());
Factory_1.Factory.addGetterSetter(Shape, 'fillPatternX', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Shape, 'fillPatternY', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Shape, 'fillLinearGradientColorStops');
Factory_1.Factory.addGetterSetter(Shape, 'strokeLinearGradientColorStops');
Factory_1.Factory.addGetterSetter(Shape, 'fillRadialGradientStartRadius', 0);
Factory_1.Factory.addGetterSetter(Shape, 'fillRadialGradientEndRadius', 0);
Factory_1.Factory.addGetterSetter(Shape, 'fillRadialGradientColorStops');
Factory_1.Factory.addGetterSetter(Shape, 'fillPatternRepeat', 'repeat');
Factory_1.Factory.addGetterSetter(Shape, 'fillEnabled', true);
Factory_1.Factory.addGetterSetter(Shape, 'strokeEnabled', true);
Factory_1.Factory.addGetterSetter(Shape, 'shadowEnabled', true);
Factory_1.Factory.addGetterSetter(Shape, 'dashEnabled', true);
Factory_1.Factory.addGetterSetter(Shape, 'strokeScaleEnabled', true);
Factory_1.Factory.addGetterSetter(Shape, 'fillPriority', 'color');
Factory_1.Factory.addComponentsGetterSetter(Shape, 'fillPatternOffset', ['x', 'y']);
Factory_1.Factory.addGetterSetter(Shape, 'fillPatternOffsetX', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Shape, 'fillPatternOffsetY', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addComponentsGetterSetter(Shape, 'fillPatternScale', ['x', 'y']);
Factory_1.Factory.addGetterSetter(Shape, 'fillPatternScaleX', 1, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Shape, 'fillPatternScaleY', 1, Validators_1.getNumberValidator());
Factory_1.Factory.addComponentsGetterSetter(Shape, 'fillLinearGradientStartPoint', [
    'x',
    'y'
]);
Factory_1.Factory.addComponentsGetterSetter(Shape, 'strokeLinearGradientStartPoint', [
    'x',
    'y'
]);
Factory_1.Factory.addGetterSetter(Shape, 'fillLinearGradientStartPointX', 0);
Factory_1.Factory.addGetterSetter(Shape, 'strokeLinearGradientStartPointX', 0);
Factory_1.Factory.addGetterSetter(Shape, 'fillLinearGradientStartPointY', 0);
Factory_1.Factory.addGetterSetter(Shape, 'strokeLinearGradientStartPointY', 0);
Factory_1.Factory.addComponentsGetterSetter(Shape, 'fillLinearGradientEndPoint', [
    'x',
    'y'
]);
Factory_1.Factory.addComponentsGetterSetter(Shape, 'strokeLinearGradientEndPoint', [
    'x',
    'y'
]);
Factory_1.Factory.addGetterSetter(Shape, 'fillLinearGradientEndPointX', 0);
Factory_1.Factory.addGetterSetter(Shape, 'strokeLinearGradientEndPointX', 0);
Factory_1.Factory.addGetterSetter(Shape, 'fillLinearGradientEndPointY', 0);
Factory_1.Factory.addGetterSetter(Shape, 'strokeLinearGradientEndPointY', 0);
Factory_1.Factory.addComponentsGetterSetter(Shape, 'fillRadialGradientStartPoint', [
    'x',
    'y'
]);
Factory_1.Factory.addGetterSetter(Shape, 'fillRadialGradientStartPointX', 0);
Factory_1.Factory.addGetterSetter(Shape, 'fillRadialGradientStartPointY', 0);
Factory_1.Factory.addComponentsGetterSetter(Shape, 'fillRadialGradientEndPoint', [
    'x',
    'y'
]);
Factory_1.Factory.addGetterSetter(Shape, 'fillRadialGradientEndPointX', 0);
Factory_1.Factory.addGetterSetter(Shape, 'fillRadialGradientEndPointY', 0);
Factory_1.Factory.addGetterSetter(Shape, 'fillPatternRotation', 0);
Factory_1.Factory.backCompat(Shape, {
    dashArray: 'dash',
    getDashArray: 'getDash',
    setDashArray: 'getDash',
    drawFunc: 'sceneFunc',
    getDrawFunc: 'getSceneFunc',
    setDrawFunc: 'setSceneFunc',
    drawHitFunc: 'hitFunc',
    getDrawHitFunc: 'getHitFunc',
    setDrawHitFunc: 'setHitFunc'
});
Util_1.Collection.mapMethods(Shape);

},{"./Factory":16,"./Global":18,"./Node":21,"./PointerEvents":22,"./Util":26,"./Validators":27}],24:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("./Util");
var Factory_1 = require("./Factory");
var Container_1 = require("./Container");
var Global_1 = require("./Global");
var Canvas_1 = require("./Canvas");
var DragAndDrop_1 = require("./DragAndDrop");
var Global_2 = require("./Global");
var PointerEvents = require("./PointerEvents");
var STAGE = 'Stage', STRING = 'string', PX = 'px', MOUSEOUT = 'mouseout', MOUSELEAVE = 'mouseleave', MOUSEOVER = 'mouseover', MOUSEENTER = 'mouseenter', MOUSEMOVE = 'mousemove', MOUSEDOWN = 'mousedown', MOUSEUP = 'mouseup', POINTERMOVE = 'pointermove', POINTERDOWN = 'pointerdown', POINTERUP = 'pointerup', POINTERCANCEL = 'pointercancel', LOSTPOINTERCAPTURE = 'lostpointercapture', CONTEXTMENU = 'contextmenu', CLICK = 'click', DBL_CLICK = 'dblclick', TOUCHSTART = 'touchstart', TOUCHEND = 'touchend', TAP = 'tap', DBL_TAP = 'dbltap', TOUCHMOVE = 'touchmove', WHEEL = 'wheel', CONTENT_MOUSEOUT = 'contentMouseout', CONTENT_MOUSEOVER = 'contentMouseover', CONTENT_MOUSEMOVE = 'contentMousemove', CONTENT_MOUSEDOWN = 'contentMousedown', CONTENT_MOUSEUP = 'contentMouseup', CONTENT_CONTEXTMENU = 'contentContextmenu', CONTENT_CLICK = 'contentClick', CONTENT_DBL_CLICK = 'contentDblclick', CONTENT_TOUCHSTART = 'contentTouchstart', CONTENT_TOUCHEND = 'contentTouchend', CONTENT_DBL_TAP = 'contentDbltap', CONTENT_TAP = 'contentTap', CONTENT_TOUCHMOVE = 'contentTouchmove', CONTENT_POINTERMOVE = 'contentPointermove', CONTENT_POINTERDOWN = 'contentPointerdown', CONTENT_POINTERUP = 'contentPointerup', CONTENT_WHEEL = 'contentWheel', RELATIVE = 'relative', KONVA_CONTENT = 'konvajs-content', SPACE = ' ', UNDERSCORE = '_', CONTAINER = 'container', MAX_LAYERS_NUMBER = 5, EMPTY_STRING = '', EVENTS = [
    MOUSEENTER,
    MOUSEDOWN,
    MOUSEMOVE,
    MOUSEUP,
    MOUSEOUT,
    TOUCHSTART,
    TOUCHMOVE,
    TOUCHEND,
    MOUSEOVER,
    WHEEL,
    CONTEXTMENU,
    POINTERDOWN,
    POINTERMOVE,
    POINTERUP,
    POINTERCANCEL,
    LOSTPOINTERCAPTURE
], eventsLength = EVENTS.length;
function addEvent(ctx, eventName) {
    ctx.content.addEventListener(eventName, function (evt) {
        ctx[UNDERSCORE + eventName](evt);
    }, false);
}
var NO_POINTERS_MESSAGE = "Pointer position is missing and not registered by the stage. Looks like it is outside of the stage container. You can set it manually from event: stage.setPointersPositions(event);";
exports.stages = [];
function checkNoClip(attrs) {
    if (attrs === void 0) { attrs = {}; }
    if (attrs.clipFunc || attrs.clipWidth || attrs.clipHeight) {
        Util_1.Util.warn('Stage does not support clipping. Please use clip for Layers or Groups.');
    }
    return attrs;
}
var Stage = (function (_super) {
    __extends(Stage, _super);
    function Stage(config) {
        var _this = _super.call(this, checkNoClip(config)) || this;
        _this._pointerPositions = [];
        _this._changedPointerPositions = [];
        _this._buildDOM();
        _this._bindContentEvents();
        exports.stages.push(_this);
        _this.on('widthChange.konva heightChange.konva', _this._resizeDOM);
        _this.on('visibleChange.konva', _this._checkVisibility);
        _this.on('clipWidthChange.konva clipHeightChange.konva clipFuncChange.konva', function () {
            checkNoClip(_this.attrs);
        });
        _this._checkVisibility();
        return _this;
    }
    Stage.prototype._validateAdd = function (child) {
        var isLayer = child.getType() === 'Layer';
        var isFastLayer = child.getType() === 'FastLayer';
        var valid = isLayer || isFastLayer;
        if (!valid) {
            Util_1.Util.throw('You may only add layers to the stage.');
        }
    };
    Stage.prototype._checkVisibility = function () {
        if (!this.content) {
            return;
        }
        var style = this.visible() ? '' : 'none';
        this.content.style.display = style;
    };
    Stage.prototype.setContainer = function (container) {
        if (typeof container === STRING) {
            if (container.charAt(0) === '.') {
                var className = container.slice(1);
                container = document.getElementsByClassName(className)[0];
            }
            else {
                var id;
                if (container.charAt(0) !== '#') {
                    id = container;
                }
                else {
                    id = container.slice(1);
                }
                container = document.getElementById(id);
            }
            if (!container) {
                throw 'Can not find container in document with id ' + id;
            }
        }
        this._setAttr(CONTAINER, container);
        if (this.content) {
            if (this.content.parentElement) {
                this.content.parentElement.removeChild(this.content);
            }
            container.appendChild(this.content);
        }
        return this;
    };
    Stage.prototype.shouldDrawHit = function () {
        return true;
    };
    Stage.prototype.clear = function () {
        var layers = this.children, len = layers.length, n;
        for (n = 0; n < len; n++) {
            layers[n].clear();
        }
        return this;
    };
    Stage.prototype.clone = function (obj) {
        if (!obj) {
            obj = {};
        }
        obj.container = document.createElement('div');
        return Container_1.Container.prototype.clone.call(this, obj);
    };
    Stage.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        var content = this.content;
        if (content && Util_1.Util._isInDocument(content)) {
            this.container().removeChild(content);
        }
        var index = exports.stages.indexOf(this);
        if (index > -1) {
            exports.stages.splice(index, 1);
        }
        return this;
    };
    Stage.prototype.getPointerPosition = function () {
        var pos = this._pointerPositions[0] || this._changedPointerPositions[0];
        if (!pos) {
            Util_1.Util.warn(NO_POINTERS_MESSAGE);
            return null;
        }
        return {
            x: pos.x,
            y: pos.y
        };
    };
    Stage.prototype._getPointerById = function (id) {
        return this._pointerPositions.find(function (p) { return p.id === id; });
    };
    Stage.prototype.getPointersPositions = function () {
        return this._pointerPositions;
    };
    Stage.prototype.getStage = function () {
        return this;
    };
    Stage.prototype.getContent = function () {
        return this.content;
    };
    Stage.prototype._toKonvaCanvas = function (config) {
        config = config || {};
        var x = config.x || 0, y = config.y || 0, canvas = new Canvas_1.SceneCanvas({
            width: config.width || this.width(),
            height: config.height || this.height(),
            pixelRatio: config.pixelRatio || 1
        }), _context = canvas.getContext()._context, layers = this.children;
        if (x || y) {
            _context.translate(-1 * x, -1 * y);
        }
        layers.each(function (layer) {
            if (!layer.isVisible()) {
                return;
            }
            var layerCanvas = layer._toKonvaCanvas(config);
            _context.drawImage(layerCanvas._canvas, x, y, layerCanvas.getWidth() / layerCanvas.getPixelRatio(), layerCanvas.getHeight() / layerCanvas.getPixelRatio());
        });
        return canvas;
    };
    Stage.prototype.getIntersection = function (pos, selector) {
        if (!pos) {
            return null;
        }
        var layers = this.children, len = layers.length, end = len - 1, n, shape;
        for (n = end; n >= 0; n--) {
            shape = layers[n].getIntersection(pos, selector);
            if (shape) {
                return shape;
            }
        }
        return null;
    };
    Stage.prototype._resizeDOM = function () {
        var width = this.width();
        var height = this.height();
        if (this.content) {
            this.content.style.width = width + PX;
            this.content.style.height = height + PX;
        }
        this.bufferCanvas.setSize(width, height);
        this.bufferHitCanvas.setSize(width, height);
        this.children.each(function (layer) {
            layer.setSize({ width: width, height: height });
            layer.draw();
        });
    };
    Stage.prototype.add = function (layer) {
        if (arguments.length > 1) {
            for (var i = 0; i < arguments.length; i++) {
                this.add(arguments[i]);
            }
            return this;
        }
        _super.prototype.add.call(this, layer);
        var length = this.children.length;
        if (length > MAX_LAYERS_NUMBER) {
            Util_1.Util.warn('The stage has ' +
                length +
                ' layers. Recommended maximum number of layers is 3-5. Adding more layers into the stage may drop the performance. Rethink your tree structure, you can use Konva.Group.');
        }
        layer.setSize({ width: this.width(), height: this.height() });
        layer.draw();
        if (Global_1.Konva.isBrowser) {
            this.content.appendChild(layer.canvas._canvas);
        }
        return this;
    };
    Stage.prototype.getParent = function () {
        return null;
    };
    Stage.prototype.getLayer = function () {
        return null;
    };
    Stage.prototype.hasPointerCapture = function (pointerId) {
        return PointerEvents.hasPointerCapture(pointerId, this);
    };
    Stage.prototype.setPointerCapture = function (pointerId) {
        PointerEvents.setPointerCapture(pointerId, this);
    };
    Stage.prototype.releaseCapture = function (pointerId) {
        PointerEvents.releaseCapture(pointerId, this);
    };
    Stage.prototype.getLayers = function () {
        return this.getChildren();
    };
    Stage.prototype._bindContentEvents = function () {
        if (!Global_1.Konva.isBrowser) {
            return;
        }
        for (var n = 0; n < eventsLength; n++) {
            addEvent(this, EVENTS[n]);
        }
    };
    Stage.prototype._mouseenter = function (evt) {
        this.setPointersPositions(evt);
        this._fire(MOUSEENTER, { evt: evt, target: this, currentTarget: this });
    };
    Stage.prototype._mouseover = function (evt) {
        this.setPointersPositions(evt);
        this._fire(CONTENT_MOUSEOVER, { evt: evt });
        this._fire(MOUSEOVER, { evt: evt, target: this, currentTarget: this });
    };
    Stage.prototype._mouseout = function (evt) {
        var _a;
        this.setPointersPositions(evt);
        var targetShape = ((_a = this.targetShape) === null || _a === void 0 ? void 0 : _a.getStage()) ? this.targetShape : null;
        var eventsEnabled = !DragAndDrop_1.DD.isDragging || Global_1.Konva.hitOnDragEnabled;
        if (targetShape && eventsEnabled) {
            targetShape._fireAndBubble(MOUSEOUT, { evt: evt });
            targetShape._fireAndBubble(MOUSELEAVE, { evt: evt });
            this._fire(MOUSELEAVE, { evt: evt, target: this, currentTarget: this });
            this.targetShape = null;
        }
        else if (eventsEnabled) {
            this._fire(MOUSELEAVE, {
                evt: evt,
                target: this,
                currentTarget: this
            });
            this._fire(MOUSEOUT, {
                evt: evt,
                target: this,
                currentTarget: this
            });
        }
        this.pointerPos = undefined;
        this._pointerPositions = [];
        this._fire(CONTENT_MOUSEOUT, { evt: evt });
    };
    Stage.prototype._mousemove = function (evt) {
        var _a;
        if (Global_1.Konva.UA.ieMobile) {
            return this._touchmove(evt);
        }
        this.setPointersPositions(evt);
        var pointerId = Util_1.Util._getFirstPointerId(evt);
        var shape;
        var targetShape = ((_a = this.targetShape) === null || _a === void 0 ? void 0 : _a.getStage()) ? this.targetShape : null;
        var eventsEnabled = !DragAndDrop_1.DD.isDragging || Global_1.Konva.hitOnDragEnabled;
        if (eventsEnabled) {
            shape = this.getIntersection(this.getPointerPosition());
            if (shape && shape.isListening()) {
                var differentTarget = targetShape !== shape;
                if (eventsEnabled && differentTarget) {
                    if (targetShape) {
                        targetShape._fireAndBubble(MOUSEOUT, { evt: evt, pointerId: pointerId }, shape);
                        targetShape._fireAndBubble(MOUSELEAVE, { evt: evt, pointerId: pointerId }, shape);
                    }
                    shape._fireAndBubble(MOUSEOVER, { evt: evt, pointerId: pointerId }, targetShape);
                    shape._fireAndBubble(MOUSEENTER, { evt: evt, pointerId: pointerId }, targetShape);
                    shape._fireAndBubble(MOUSEMOVE, { evt: evt, pointerId: pointerId });
                    this.targetShape = shape;
                }
                else {
                    shape._fireAndBubble(MOUSEMOVE, { evt: evt, pointerId: pointerId });
                }
            }
            else {
                if (targetShape && eventsEnabled) {
                    targetShape._fireAndBubble(MOUSEOUT, { evt: evt, pointerId: pointerId });
                    targetShape._fireAndBubble(MOUSELEAVE, { evt: evt, pointerId: pointerId });
                    this._fire(MOUSEOVER, {
                        evt: evt,
                        target: this,
                        currentTarget: this,
                        pointerId: pointerId
                    });
                    this.targetShape = null;
                }
                this._fire(MOUSEMOVE, {
                    evt: evt,
                    target: this,
                    currentTarget: this,
                    pointerId: pointerId
                });
            }
            this._fire(CONTENT_MOUSEMOVE, { evt: evt });
        }
        if (evt.cancelable) {
            evt.preventDefault();
        }
    };
    Stage.prototype._mousedown = function (evt) {
        if (Global_1.Konva.UA.ieMobile) {
            return this._touchstart(evt);
        }
        this.setPointersPositions(evt);
        var pointerId = Util_1.Util._getFirstPointerId(evt);
        var shape = this.getIntersection(this.getPointerPosition());
        DragAndDrop_1.DD.justDragged = false;
        Global_1.Konva.listenClickTap = true;
        if (shape && shape.isListening()) {
            this.clickStartShape = shape;
            shape._fireAndBubble(MOUSEDOWN, { evt: evt, pointerId: pointerId });
        }
        else {
            this._fire(MOUSEDOWN, {
                evt: evt,
                target: this,
                currentTarget: this,
                pointerId: pointerId
            });
        }
        this._fire(CONTENT_MOUSEDOWN, { evt: evt });
    };
    Stage.prototype._mouseup = function (evt) {
        if (Global_1.Konva.UA.ieMobile) {
            return this._touchend(evt);
        }
        this.setPointersPositions(evt);
        var pointerId = Util_1.Util._getFirstPointerId(evt);
        var shape = this.getIntersection(this.getPointerPosition()), clickStartShape = this.clickStartShape, clickEndShape = this.clickEndShape, fireDblClick = false;
        if (Global_1.Konva.inDblClickWindow) {
            fireDblClick = true;
            clearTimeout(this.dblTimeout);
        }
        else if (!DragAndDrop_1.DD.justDragged) {
            Global_1.Konva.inDblClickWindow = true;
            clearTimeout(this.dblTimeout);
        }
        this.dblTimeout = setTimeout(function () {
            Global_1.Konva.inDblClickWindow = false;
        }, Global_1.Konva.dblClickWindow);
        if (shape && shape.isListening()) {
            this.clickEndShape = shape;
            shape._fireAndBubble(MOUSEUP, { evt: evt, pointerId: pointerId });
            if (Global_1.Konva.listenClickTap &&
                clickStartShape &&
                clickStartShape._id === shape._id) {
                shape._fireAndBubble(CLICK, { evt: evt, pointerId: pointerId });
                if (fireDblClick && clickEndShape && clickEndShape === shape) {
                    shape._fireAndBubble(DBL_CLICK, { evt: evt, pointerId: pointerId });
                }
            }
        }
        else {
            this._fire(MOUSEUP, {
                evt: evt,
                target: this,
                currentTarget: this,
                pointerId: pointerId
            });
            if (Global_1.Konva.listenClickTap) {
                this._fire(CLICK, {
                    evt: evt,
                    target: this,
                    currentTarget: this,
                    pointerId: pointerId
                });
            }
            if (fireDblClick) {
                this._fire(DBL_CLICK, {
                    evt: evt,
                    target: this,
                    currentTarget: this,
                    pointerId: pointerId
                });
            }
        }
        this._fire(CONTENT_MOUSEUP, { evt: evt });
        if (Global_1.Konva.listenClickTap) {
            this._fire(CONTENT_CLICK, { evt: evt });
            if (fireDblClick) {
                this._fire(CONTENT_DBL_CLICK, { evt: evt });
            }
        }
        Global_1.Konva.listenClickTap = false;
        if (evt.cancelable) {
            evt.preventDefault();
        }
    };
    Stage.prototype._contextmenu = function (evt) {
        this.setPointersPositions(evt);
        var shape = this.getIntersection(this.getPointerPosition());
        if (shape && shape.isListening()) {
            shape._fireAndBubble(CONTEXTMENU, { evt: evt });
        }
        else {
            this._fire(CONTEXTMENU, {
                evt: evt,
                target: this,
                currentTarget: this
            });
        }
        this._fire(CONTENT_CONTEXTMENU, { evt: evt });
    };
    Stage.prototype._touchstart = function (evt) {
        var _this = this;
        this.setPointersPositions(evt);
        var triggeredOnShape = false;
        this._changedPointerPositions.forEach(function (pos) {
            var shape = _this.getIntersection(pos);
            Global_1.Konva.listenClickTap = true;
            DragAndDrop_1.DD.justDragged = false;
            var hasShape = shape && shape.isListening();
            if (!hasShape) {
                return;
            }
            if (Global_1.Konva.captureTouchEventsEnabled) {
                shape.setPointerCapture(pos.id);
            }
            _this.tapStartShape = shape;
            shape._fireAndBubble(TOUCHSTART, { evt: evt, pointerId: pos.id }, _this);
            triggeredOnShape = true;
            if (shape.isListening() && shape.preventDefault() && evt.cancelable) {
                evt.preventDefault();
            }
        });
        if (!triggeredOnShape) {
            this._fire(TOUCHSTART, {
                evt: evt,
                target: this,
                currentTarget: this,
                pointerId: this._changedPointerPositions[0].id
            });
        }
        this._fire(CONTENT_TOUCHSTART, { evt: evt });
    };
    Stage.prototype._touchmove = function (evt) {
        var _this = this;
        this.setPointersPositions(evt);
        var eventsEnabled = !DragAndDrop_1.DD.isDragging || Global_1.Konva.hitOnDragEnabled;
        if (eventsEnabled) {
            var triggeredOnShape = false;
            var processedShapesIds = {};
            this._changedPointerPositions.forEach(function (pos) {
                var shape = PointerEvents.getCapturedShape(pos.id) || _this.getIntersection(pos);
                var hasShape = shape && shape.isListening();
                if (!hasShape) {
                    return;
                }
                if (processedShapesIds[shape._id]) {
                    return;
                }
                processedShapesIds[shape._id] = true;
                shape._fireAndBubble(TOUCHMOVE, { evt: evt, pointerId: pos.id });
                triggeredOnShape = true;
                if (shape.isListening() && shape.preventDefault() && evt.cancelable) {
                    evt.preventDefault();
                }
            });
            if (!triggeredOnShape) {
                this._fire(TOUCHMOVE, {
                    evt: evt,
                    target: this,
                    currentTarget: this,
                    pointerId: this._changedPointerPositions[0].id
                });
            }
            this._fire(CONTENT_TOUCHMOVE, { evt: evt });
        }
        if (DragAndDrop_1.DD.isDragging && DragAndDrop_1.DD.node.preventDefault() && evt.cancelable) {
            evt.preventDefault();
        }
    };
    Stage.prototype._touchend = function (evt) {
        var _this = this;
        this.setPointersPositions(evt);
        var clickEndShape = this.clickEndShape, fireDblClick = false;
        if (Global_1.Konva.inDblClickWindow) {
            fireDblClick = true;
            clearTimeout(this.dblTimeout);
        }
        else if (!DragAndDrop_1.DD.justDragged) {
            Global_1.Konva.inDblClickWindow = true;
            clearTimeout(this.dblTimeout);
        }
        this.dblTimeout = setTimeout(function () {
            Global_1.Konva.inDblClickWindow = false;
        }, Global_1.Konva.dblClickWindow);
        var triggeredOnShape = false;
        var processedShapesIds = {};
        var tapTriggered = false;
        var dblTapTriggered = false;
        this._changedPointerPositions.forEach(function (pos) {
            var shape = PointerEvents.getCapturedShape(pos.id) ||
                _this.getIntersection(pos);
            if (shape) {
                shape.releaseCapture(pos.id);
            }
            var hasShape = shape && shape.isListening();
            if (!hasShape) {
                return;
            }
            if (processedShapesIds[shape._id]) {
                return;
            }
            processedShapesIds[shape._id] = true;
            _this.clickEndShape = shape;
            shape._fireAndBubble(TOUCHEND, { evt: evt, pointerId: pos.id });
            triggeredOnShape = true;
            if (Global_1.Konva.listenClickTap && shape === _this.tapStartShape) {
                tapTriggered = true;
                shape._fireAndBubble(TAP, { evt: evt, pointerId: pos.id });
                if (fireDblClick && clickEndShape && clickEndShape === shape) {
                    dblTapTriggered = true;
                    shape._fireAndBubble(DBL_TAP, { evt: evt, pointerId: pos.id });
                }
            }
            if (shape.isListening() && shape.preventDefault() && evt.cancelable) {
                evt.preventDefault();
            }
        });
        if (!triggeredOnShape) {
            this._fire(TOUCHEND, {
                evt: evt,
                target: this,
                currentTarget: this,
                pointerId: this._changedPointerPositions[0].id
            });
        }
        if (Global_1.Konva.listenClickTap && !tapTriggered) {
            this._fire(TAP, {
                evt: evt,
                target: this,
                currentTarget: this,
                pointerId: this._changedPointerPositions[0].id
            });
        }
        if (fireDblClick && !dblTapTriggered) {
            this._fire(DBL_TAP, {
                evt: evt,
                target: this,
                currentTarget: this,
                pointerId: this._changedPointerPositions[0].id
            });
        }
        this._fire(CONTENT_TOUCHEND, { evt: evt });
        if (Global_1.Konva.listenClickTap) {
            this._fire(CONTENT_TAP, { evt: evt });
            if (fireDblClick) {
                this._fire(CONTENT_DBL_TAP, { evt: evt });
            }
        }
        Global_1.Konva.listenClickTap = false;
    };
    Stage.prototype._wheel = function (evt) {
        this.setPointersPositions(evt);
        var shape = this.getIntersection(this.getPointerPosition());
        if (shape && shape.isListening()) {
            shape._fireAndBubble(WHEEL, { evt: evt });
        }
        else {
            this._fire(WHEEL, {
                evt: evt,
                target: this,
                currentTarget: this
            });
        }
        this._fire(CONTENT_WHEEL, { evt: evt });
    };
    Stage.prototype._pointerdown = function (evt) {
        if (!Global_1.Konva._pointerEventsEnabled) {
            return;
        }
        this.setPointersPositions(evt);
        var shape = PointerEvents.getCapturedShape(evt.pointerId) ||
            this.getIntersection(this.getPointerPosition());
        if (shape) {
            shape._fireAndBubble(POINTERDOWN, PointerEvents.createEvent(evt));
        }
    };
    Stage.prototype._pointermove = function (evt) {
        if (!Global_1.Konva._pointerEventsEnabled) {
            return;
        }
        this.setPointersPositions(evt);
        var shape = PointerEvents.getCapturedShape(evt.pointerId) ||
            this.getIntersection(this.getPointerPosition());
        if (shape) {
            shape._fireAndBubble(POINTERMOVE, PointerEvents.createEvent(evt));
        }
    };
    Stage.prototype._pointerup = function (evt) {
        if (!Global_1.Konva._pointerEventsEnabled) {
            return;
        }
        this.setPointersPositions(evt);
        var shape = PointerEvents.getCapturedShape(evt.pointerId) ||
            this.getIntersection(this.getPointerPosition());
        if (shape) {
            shape._fireAndBubble(POINTERUP, PointerEvents.createEvent(evt));
        }
        PointerEvents.releaseCapture(evt.pointerId);
    };
    Stage.prototype._pointercancel = function (evt) {
        if (!Global_1.Konva._pointerEventsEnabled) {
            return;
        }
        this.setPointersPositions(evt);
        var shape = PointerEvents.getCapturedShape(evt.pointerId) ||
            this.getIntersection(this.getPointerPosition());
        if (shape) {
            shape._fireAndBubble(POINTERUP, PointerEvents.createEvent(evt));
        }
        PointerEvents.releaseCapture(evt.pointerId);
    };
    Stage.prototype._lostpointercapture = function (evt) {
        PointerEvents.releaseCapture(evt.pointerId);
    };
    Stage.prototype.setPointersPositions = function (evt) {
        var _this = this;
        var contentPosition = this._getContentPosition(), x = null, y = null;
        evt = evt ? evt : window.event;
        if (evt.touches !== undefined) {
            this._pointerPositions = [];
            this._changedPointerPositions = [];
            Util_1.Collection.prototype.each.call(evt.touches, function (touch) {
                _this._pointerPositions.push({
                    id: touch.identifier,
                    x: (touch.clientX - contentPosition.left) / contentPosition.scaleX,
                    y: (touch.clientY - contentPosition.top) / contentPosition.scaleY
                });
            });
            Util_1.Collection.prototype.each.call(evt.changedTouches || evt.touches, function (touch) {
                _this._changedPointerPositions.push({
                    id: touch.identifier,
                    x: (touch.clientX - contentPosition.left) / contentPosition.scaleX,
                    y: (touch.clientY - contentPosition.top) / contentPosition.scaleY
                });
            });
        }
        else {
            x = (evt.clientX - contentPosition.left) / contentPosition.scaleX;
            y = (evt.clientY - contentPosition.top) / contentPosition.scaleY;
            this.pointerPos = {
                x: x,
                y: y
            };
            this._pointerPositions = [{ x: x, y: y, id: Util_1.Util._getFirstPointerId(evt) }];
            this._changedPointerPositions = [
                { x: x, y: y, id: Util_1.Util._getFirstPointerId(evt) }
            ];
        }
    };
    Stage.prototype._setPointerPosition = function (evt) {
        Util_1.Util.warn('Method _setPointerPosition is deprecated. Use "stage.setPointersPositions(event)" instead.');
        this.setPointersPositions(evt);
    };
    Stage.prototype._getContentPosition = function () {
        if (!this.content || !this.content.getBoundingClientRect) {
            return {
                top: 0,
                left: 0,
                scaleX: 1,
                scaleY: 1
            };
        }
        var rect = this.content.getBoundingClientRect();
        return {
            top: rect.top,
            left: rect.left,
            scaleX: rect.width / this.content.clientWidth || 1,
            scaleY: rect.height / this.content.clientHeight || 1
        };
    };
    Stage.prototype._buildDOM = function () {
        this.bufferCanvas = new Canvas_1.SceneCanvas({
            width: this.width(),
            height: this.height()
        });
        this.bufferHitCanvas = new Canvas_1.HitCanvas({
            pixelRatio: 1,
            width: this.width(),
            height: this.height()
        });
        if (!Global_1.Konva.isBrowser) {
            return;
        }
        var container = this.container();
        if (!container) {
            throw 'Stage has no container. A container is required.';
        }
        container.innerHTML = EMPTY_STRING;
        this.content = document.createElement('div');
        this.content.style.position = RELATIVE;
        this.content.style.userSelect = 'none';
        this.content.className = KONVA_CONTENT;
        this.content.setAttribute('role', 'presentation');
        container.appendChild(this.content);
        this._resizeDOM();
    };
    Stage.prototype.cache = function () {
        Util_1.Util.warn('Cache function is not allowed for stage. You may use cache only for layers, groups and shapes.');
        return this;
    };
    Stage.prototype.clearCache = function () {
        return this;
    };
    Stage.prototype.batchDraw = function () {
        this.children.each(function (layer) {
            layer.batchDraw();
        });
        return this;
    };
    return Stage;
}(Container_1.Container));
exports.Stage = Stage;
Stage.prototype.nodeType = STAGE;
Global_2._registerNode(Stage);
Factory_1.Factory.addGetterSetter(Stage, 'container');

},{"./Canvas":12,"./Container":13,"./DragAndDrop":15,"./Factory":16,"./Global":18,"./PointerEvents":22,"./Util":26}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("./Util");
var Animation_1 = require("./Animation");
var Node_1 = require("./Node");
var Global_1 = require("./Global");
var blacklist = {
    node: 1,
    duration: 1,
    easing: 1,
    onFinish: 1,
    yoyo: 1
}, PAUSED = 1, PLAYING = 2, REVERSING = 3, idCounter = 0, colorAttrs = ['fill', 'stroke', 'shadowColor'];
var TweenEngine = (function () {
    function TweenEngine(prop, propFunc, func, begin, finish, duration, yoyo) {
        this.prop = prop;
        this.propFunc = propFunc;
        this.begin = begin;
        this._pos = begin;
        this.duration = duration;
        this._change = 0;
        this.prevPos = 0;
        this.yoyo = yoyo;
        this._time = 0;
        this._position = 0;
        this._startTime = 0;
        this._finish = 0;
        this.func = func;
        this._change = finish - this.begin;
        this.pause();
    }
    TweenEngine.prototype.fire = function (str) {
        var handler = this[str];
        if (handler) {
            handler();
        }
    };
    TweenEngine.prototype.setTime = function (t) {
        if (t > this.duration) {
            if (this.yoyo) {
                this._time = this.duration;
                this.reverse();
            }
            else {
                this.finish();
            }
        }
        else if (t < 0) {
            if (this.yoyo) {
                this._time = 0;
                this.play();
            }
            else {
                this.reset();
            }
        }
        else {
            this._time = t;
            this.update();
        }
    };
    TweenEngine.prototype.getTime = function () {
        return this._time;
    };
    TweenEngine.prototype.setPosition = function (p) {
        this.prevPos = this._pos;
        this.propFunc(p);
        this._pos = p;
    };
    TweenEngine.prototype.getPosition = function (t) {
        if (t === undefined) {
            t = this._time;
        }
        return this.func(t, this.begin, this._change, this.duration);
    };
    TweenEngine.prototype.play = function () {
        this.state = PLAYING;
        this._startTime = this.getTimer() - this._time;
        this.onEnterFrame();
        this.fire('onPlay');
    };
    TweenEngine.prototype.reverse = function () {
        this.state = REVERSING;
        this._time = this.duration - this._time;
        this._startTime = this.getTimer() - this._time;
        this.onEnterFrame();
        this.fire('onReverse');
    };
    TweenEngine.prototype.seek = function (t) {
        this.pause();
        this._time = t;
        this.update();
        this.fire('onSeek');
    };
    TweenEngine.prototype.reset = function () {
        this.pause();
        this._time = 0;
        this.update();
        this.fire('onReset');
    };
    TweenEngine.prototype.finish = function () {
        this.pause();
        this._time = this.duration;
        this.update();
        this.fire('onFinish');
    };
    TweenEngine.prototype.update = function () {
        this.setPosition(this.getPosition(this._time));
    };
    TweenEngine.prototype.onEnterFrame = function () {
        var t = this.getTimer() - this._startTime;
        if (this.state === PLAYING) {
            this.setTime(t);
        }
        else if (this.state === REVERSING) {
            this.setTime(this.duration - t);
        }
    };
    TweenEngine.prototype.pause = function () {
        this.state = PAUSED;
        this.fire('onPause');
    };
    TweenEngine.prototype.getTimer = function () {
        return new Date().getTime();
    };
    return TweenEngine;
}());
var Tween = (function () {
    function Tween(config) {
        var that = this, node = config.node, nodeId = node._id, duration, easing = config.easing || exports.Easings.Linear, yoyo = !!config.yoyo, key;
        if (typeof config.duration === 'undefined') {
            duration = 0.3;
        }
        else if (config.duration === 0) {
            duration = 0.001;
        }
        else {
            duration = config.duration;
        }
        this.node = node;
        this._id = idCounter++;
        var layers = node.getLayer() ||
            (node instanceof Global_1.Konva['Stage'] ? node.getLayers() : null);
        if (!layers) {
            Util_1.Util.error('Tween constructor have `node` that is not in a layer. Please add node into layer first.');
        }
        this.anim = new Animation_1.Animation(function () {
            that.tween.onEnterFrame();
        }, layers);
        this.tween = new TweenEngine(key, function (i) {
            that._tweenFunc(i);
        }, easing, 0, 1, duration * 1000, yoyo);
        this._addListeners();
        if (!Tween.attrs[nodeId]) {
            Tween.attrs[nodeId] = {};
        }
        if (!Tween.attrs[nodeId][this._id]) {
            Tween.attrs[nodeId][this._id] = {};
        }
        if (!Tween.tweens[nodeId]) {
            Tween.tweens[nodeId] = {};
        }
        for (key in config) {
            if (blacklist[key] === undefined) {
                this._addAttr(key, config[key]);
            }
        }
        this.reset();
        this.onFinish = config.onFinish;
        this.onReset = config.onReset;
    }
    Tween.prototype._addAttr = function (key, end) {
        var node = this.node, nodeId = node._id, start, diff, tweenId, n, len, trueEnd, trueStart, endRGBA;
        tweenId = Tween.tweens[nodeId][key];
        if (tweenId) {
            delete Tween.attrs[nodeId][tweenId][key];
        }
        start = node.getAttr(key);
        if (Util_1.Util._isArray(end)) {
            diff = [];
            len = Math.max(end.length, start.length);
            if (key === 'points' && end.length !== start.length) {
                if (end.length > start.length) {
                    trueStart = start;
                    start = Util_1.Util._prepareArrayForTween(start, end, node.closed());
                }
                else {
                    trueEnd = end;
                    end = Util_1.Util._prepareArrayForTween(end, start, node.closed());
                }
            }
            if (key.indexOf('fill') === 0) {
                for (n = 0; n < len; n++) {
                    if (n % 2 === 0) {
                        diff.push(end[n] - start[n]);
                    }
                    else {
                        var startRGBA = Util_1.Util.colorToRGBA(start[n]);
                        endRGBA = Util_1.Util.colorToRGBA(end[n]);
                        start[n] = startRGBA;
                        diff.push({
                            r: endRGBA.r - startRGBA.r,
                            g: endRGBA.g - startRGBA.g,
                            b: endRGBA.b - startRGBA.b,
                            a: endRGBA.a - startRGBA.a
                        });
                    }
                }
            }
            else {
                for (n = 0; n < len; n++) {
                    diff.push(end[n] - start[n]);
                }
            }
        }
        else if (colorAttrs.indexOf(key) !== -1) {
            start = Util_1.Util.colorToRGBA(start);
            endRGBA = Util_1.Util.colorToRGBA(end);
            diff = {
                r: endRGBA.r - start.r,
                g: endRGBA.g - start.g,
                b: endRGBA.b - start.b,
                a: endRGBA.a - start.a
            };
        }
        else {
            diff = end - start;
        }
        Tween.attrs[nodeId][this._id][key] = {
            start: start,
            diff: diff,
            end: end,
            trueEnd: trueEnd,
            trueStart: trueStart
        };
        Tween.tweens[nodeId][key] = this._id;
    };
    Tween.prototype._tweenFunc = function (i) {
        var node = this.node, attrs = Tween.attrs[node._id][this._id], key, attr, start, diff, newVal, n, len, end;
        for (key in attrs) {
            attr = attrs[key];
            start = attr.start;
            diff = attr.diff;
            end = attr.end;
            if (Util_1.Util._isArray(start)) {
                newVal = [];
                len = Math.max(start.length, end.length);
                if (key.indexOf('fill') === 0) {
                    for (n = 0; n < len; n++) {
                        if (n % 2 === 0) {
                            newVal.push((start[n] || 0) + diff[n] * i);
                        }
                        else {
                            newVal.push('rgba(' +
                                Math.round(start[n].r + diff[n].r * i) +
                                ',' +
                                Math.round(start[n].g + diff[n].g * i) +
                                ',' +
                                Math.round(start[n].b + diff[n].b * i) +
                                ',' +
                                (start[n].a + diff[n].a * i) +
                                ')');
                        }
                    }
                }
                else {
                    for (n = 0; n < len; n++) {
                        newVal.push((start[n] || 0) + diff[n] * i);
                    }
                }
            }
            else if (colorAttrs.indexOf(key) !== -1) {
                newVal =
                    'rgba(' +
                        Math.round(start.r + diff.r * i) +
                        ',' +
                        Math.round(start.g + diff.g * i) +
                        ',' +
                        Math.round(start.b + diff.b * i) +
                        ',' +
                        (start.a + diff.a * i) +
                        ')';
            }
            else {
                newVal = start + diff * i;
            }
            node.setAttr(key, newVal);
        }
    };
    Tween.prototype._addListeners = function () {
        var _this = this;
        this.tween.onPlay = function () {
            _this.anim.start();
        };
        this.tween.onReverse = function () {
            _this.anim.start();
        };
        this.tween.onPause = function () {
            _this.anim.stop();
        };
        this.tween.onFinish = function () {
            var node = _this.node;
            var attrs = Tween.attrs[node._id][_this._id];
            if (attrs.points && attrs.points.trueEnd) {
                node.setAttr('points', attrs.points.trueEnd);
            }
            if (_this.onFinish) {
                _this.onFinish.call(_this);
            }
        };
        this.tween.onReset = function () {
            var node = _this.node;
            var attrs = Tween.attrs[node._id][_this._id];
            if (attrs.points && attrs.points.trueStart) {
                node.points(attrs.points.trueStart);
            }
            if (_this.onReset) {
                _this.onReset();
            }
        };
    };
    Tween.prototype.play = function () {
        this.tween.play();
        return this;
    };
    Tween.prototype.reverse = function () {
        this.tween.reverse();
        return this;
    };
    Tween.prototype.reset = function () {
        this.tween.reset();
        return this;
    };
    Tween.prototype.seek = function (t) {
        this.tween.seek(t * 1000);
        return this;
    };
    Tween.prototype.pause = function () {
        this.tween.pause();
        return this;
    };
    Tween.prototype.finish = function () {
        this.tween.finish();
        return this;
    };
    Tween.prototype.destroy = function () {
        var nodeId = this.node._id, thisId = this._id, attrs = Tween.tweens[nodeId], key;
        this.pause();
        for (key in attrs) {
            delete Tween.tweens[nodeId][key];
        }
        delete Tween.attrs[nodeId][thisId];
    };
    Tween.attrs = {};
    Tween.tweens = {};
    return Tween;
}());
exports.Tween = Tween;
Node_1.Node.prototype.to = function (params) {
    var onFinish = params.onFinish;
    params.node = this;
    params.onFinish = function () {
        this.destroy();
        if (onFinish) {
            onFinish();
        }
    };
    var tween = new Tween(params);
    tween.play();
};
exports.Easings = {
    BackEaseIn: function (t, b, c, d) {
        var s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    BackEaseOut: function (t, b, c, d) {
        var s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    BackEaseInOut: function (t, b, c, d) {
        var s = 1.70158;
        if ((t /= d / 2) < 1) {
            return (c / 2) * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
        }
        return (c / 2) * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
    },
    ElasticEaseIn: function (t, b, c, d, a, p) {
        var s = 0;
        if (t === 0) {
            return b;
        }
        if ((t /= d) === 1) {
            return b + c;
        }
        if (!p) {
            p = d * 0.3;
        }
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else {
            s = (p / (2 * Math.PI)) * Math.asin(c / a);
        }
        return (-(a *
            Math.pow(2, 10 * (t -= 1)) *
            Math.sin(((t * d - s) * (2 * Math.PI)) / p)) + b);
    },
    ElasticEaseOut: function (t, b, c, d, a, p) {
        var s = 0;
        if (t === 0) {
            return b;
        }
        if ((t /= d) === 1) {
            return b + c;
        }
        if (!p) {
            p = d * 0.3;
        }
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else {
            s = (p / (2 * Math.PI)) * Math.asin(c / a);
        }
        return (a * Math.pow(2, -10 * t) * Math.sin(((t * d - s) * (2 * Math.PI)) / p) +
            c +
            b);
    },
    ElasticEaseInOut: function (t, b, c, d, a, p) {
        var s = 0;
        if (t === 0) {
            return b;
        }
        if ((t /= d / 2) === 2) {
            return b + c;
        }
        if (!p) {
            p = d * (0.3 * 1.5);
        }
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else {
            s = (p / (2 * Math.PI)) * Math.asin(c / a);
        }
        if (t < 1) {
            return (-0.5 *
                (a *
                    Math.pow(2, 10 * (t -= 1)) *
                    Math.sin(((t * d - s) * (2 * Math.PI)) / p)) +
                b);
        }
        return (a *
            Math.pow(2, -10 * (t -= 1)) *
            Math.sin(((t * d - s) * (2 * Math.PI)) / p) *
            0.5 +
            c +
            b);
    },
    BounceEaseOut: function (t, b, c, d) {
        if ((t /= d) < 1 / 2.75) {
            return c * (7.5625 * t * t) + b;
        }
        else if (t < 2 / 2.75) {
            return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
        }
        else if (t < 2.5 / 2.75) {
            return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
        }
        else {
            return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
        }
    },
    BounceEaseIn: function (t, b, c, d) {
        return c - exports.Easings.BounceEaseOut(d - t, 0, c, d) + b;
    },
    BounceEaseInOut: function (t, b, c, d) {
        if (t < d / 2) {
            return exports.Easings.BounceEaseIn(t * 2, 0, c, d) * 0.5 + b;
        }
        else {
            return exports.Easings.BounceEaseOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
        }
    },
    EaseIn: function (t, b, c, d) {
        return c * (t /= d) * t + b;
    },
    EaseOut: function (t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },
    EaseInOut: function (t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return (c / 2) * t * t + b;
        }
        return (-c / 2) * (--t * (t - 2) - 1) + b;
    },
    StrongEaseIn: function (t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    },
    StrongEaseOut: function (t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    StrongEaseInOut: function (t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return (c / 2) * t * t * t * t * t + b;
        }
        return (c / 2) * ((t -= 2) * t * t * t * t + 2) + b;
    },
    Linear: function (t, b, c, d) {
        return (c * t) / d + b;
    }
};

},{"./Animation":10,"./Global":18,"./Node":21,"./Util":26}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Global_1 = require("./Global");
var Collection = (function () {
    function Collection() {
    }
    Collection.toCollection = function (arr) {
        var collection = new Collection(), len = arr.length, n;
        for (n = 0; n < len; n++) {
            collection.push(arr[n]);
        }
        return collection;
    };
    Collection._mapMethod = function (methodName) {
        Collection.prototype[methodName] = function () {
            var len = this.length, i;
            var args = [].slice.call(arguments);
            for (i = 0; i < len; i++) {
                this[i][methodName].apply(this[i], args);
            }
            return this;
        };
    };
    Collection.mapMethods = function (constructor) {
        var prot = constructor.prototype;
        for (var methodName in prot) {
            Collection._mapMethod(methodName);
        }
    };
    return Collection;
}());
exports.Collection = Collection;
Collection.prototype = [];
Collection.prototype.each = function (func) {
    for (var n = 0; n < this.length; n++) {
        func(this[n], n);
    }
};
Collection.prototype.toArray = function () {
    var arr = [], len = this.length, n;
    for (n = 0; n < len; n++) {
        arr.push(this[n]);
    }
    return arr;
};
var Transform = (function () {
    function Transform(m) {
        if (m === void 0) { m = [1, 0, 0, 1, 0, 0]; }
        this.m = (m && m.slice()) || [1, 0, 0, 1, 0, 0];
    }
    Transform.prototype.copy = function () {
        return new Transform(this.m);
    };
    Transform.prototype.point = function (point) {
        var m = this.m;
        return {
            x: m[0] * point.x + m[2] * point.y + m[4],
            y: m[1] * point.x + m[3] * point.y + m[5]
        };
    };
    Transform.prototype.translate = function (x, y) {
        this.m[4] += this.m[0] * x + this.m[2] * y;
        this.m[5] += this.m[1] * x + this.m[3] * y;
        return this;
    };
    Transform.prototype.scale = function (sx, sy) {
        this.m[0] *= sx;
        this.m[1] *= sx;
        this.m[2] *= sy;
        this.m[3] *= sy;
        return this;
    };
    Transform.prototype.rotate = function (rad) {
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        var m11 = this.m[0] * c + this.m[2] * s;
        var m12 = this.m[1] * c + this.m[3] * s;
        var m21 = this.m[0] * -s + this.m[2] * c;
        var m22 = this.m[1] * -s + this.m[3] * c;
        this.m[0] = m11;
        this.m[1] = m12;
        this.m[2] = m21;
        this.m[3] = m22;
        return this;
    };
    Transform.prototype.getTranslation = function () {
        return {
            x: this.m[4],
            y: this.m[5]
        };
    };
    Transform.prototype.skew = function (sx, sy) {
        var m11 = this.m[0] + this.m[2] * sy;
        var m12 = this.m[1] + this.m[3] * sy;
        var m21 = this.m[2] + this.m[0] * sx;
        var m22 = this.m[3] + this.m[1] * sx;
        this.m[0] = m11;
        this.m[1] = m12;
        this.m[2] = m21;
        this.m[3] = m22;
        return this;
    };
    Transform.prototype.multiply = function (matrix) {
        var m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1];
        var m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1];
        var m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3];
        var m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3];
        var dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4];
        var dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];
        this.m[0] = m11;
        this.m[1] = m12;
        this.m[2] = m21;
        this.m[3] = m22;
        this.m[4] = dx;
        this.m[5] = dy;
        return this;
    };
    Transform.prototype.invert = function () {
        var d = 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]);
        var m0 = this.m[3] * d;
        var m1 = -this.m[1] * d;
        var m2 = -this.m[2] * d;
        var m3 = this.m[0] * d;
        var m4 = d * (this.m[2] * this.m[5] - this.m[3] * this.m[4]);
        var m5 = d * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
        this.m[0] = m0;
        this.m[1] = m1;
        this.m[2] = m2;
        this.m[3] = m3;
        this.m[4] = m4;
        this.m[5] = m5;
        return this;
    };
    Transform.prototype.getMatrix = function () {
        return this.m;
    };
    Transform.prototype.setAbsolutePosition = function (x, y) {
        var m0 = this.m[0], m1 = this.m[1], m2 = this.m[2], m3 = this.m[3], m4 = this.m[4], m5 = this.m[5], yt = (m0 * (y - m5) - m1 * (x - m4)) / (m0 * m3 - m1 * m2), xt = (x - m4 - m2 * yt) / m0;
        return this.translate(xt, yt);
    };
    Transform.prototype.decompose = function () {
        var a = this.m[0];
        var b = this.m[1];
        var c = this.m[2];
        var d = this.m[3];
        var e = this.m[4];
        var f = this.m[5];
        var delta = a * d - b * c;
        var result = {
            x: e,
            y: f,
            rotation: 0,
            scaleX: 0,
            scaleY: 0,
            skewX: 0,
            skewY: 0
        };
        if (a != 0 || b != 0) {
            var r = Math.sqrt(a * a + b * b);
            result.rotation = b > 0 ? Math.acos(a / r) : -Math.acos(a / r);
            result.scaleX = r;
            result.scaleY = delta / r;
            result.skewX = (a * c + b * d) / delta;
            result.skewY = 0;
        }
        else if (c != 0 || d != 0) {
            var s = Math.sqrt(c * c + d * d);
            result.rotation =
                Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s));
            result.scaleX = delta / s;
            result.scaleY = s;
            result.skewX = 0;
            result.skewY = (a * c + b * d) / delta;
        }
        else {
        }
        result.rotation = exports.Util._getRotation(result.rotation);
        return result;
    };
    return Transform;
}());
exports.Transform = Transform;
var OBJECT_ARRAY = '[object Array]', OBJECT_NUMBER = '[object Number]', OBJECT_STRING = '[object String]', OBJECT_BOOLEAN = '[object Boolean]', PI_OVER_DEG180 = Math.PI / 180, DEG180_OVER_PI = 180 / Math.PI, HASH = '#', EMPTY_STRING = '', ZERO = '0', KONVA_WARNING = 'Konva warning: ', KONVA_ERROR = 'Konva error: ', RGB_PAREN = 'rgb(', COLORS = {
    aliceblue: [240, 248, 255],
    antiquewhite: [250, 235, 215],
    aqua: [0, 255, 255],
    aquamarine: [127, 255, 212],
    azure: [240, 255, 255],
    beige: [245, 245, 220],
    bisque: [255, 228, 196],
    black: [0, 0, 0],
    blanchedalmond: [255, 235, 205],
    blue: [0, 0, 255],
    blueviolet: [138, 43, 226],
    brown: [165, 42, 42],
    burlywood: [222, 184, 135],
    cadetblue: [95, 158, 160],
    chartreuse: [127, 255, 0],
    chocolate: [210, 105, 30],
    coral: [255, 127, 80],
    cornflowerblue: [100, 149, 237],
    cornsilk: [255, 248, 220],
    crimson: [220, 20, 60],
    cyan: [0, 255, 255],
    darkblue: [0, 0, 139],
    darkcyan: [0, 139, 139],
    darkgoldenrod: [184, 132, 11],
    darkgray: [169, 169, 169],
    darkgreen: [0, 100, 0],
    darkgrey: [169, 169, 169],
    darkkhaki: [189, 183, 107],
    darkmagenta: [139, 0, 139],
    darkolivegreen: [85, 107, 47],
    darkorange: [255, 140, 0],
    darkorchid: [153, 50, 204],
    darkred: [139, 0, 0],
    darksalmon: [233, 150, 122],
    darkseagreen: [143, 188, 143],
    darkslateblue: [72, 61, 139],
    darkslategray: [47, 79, 79],
    darkslategrey: [47, 79, 79],
    darkturquoise: [0, 206, 209],
    darkviolet: [148, 0, 211],
    deeppink: [255, 20, 147],
    deepskyblue: [0, 191, 255],
    dimgray: [105, 105, 105],
    dimgrey: [105, 105, 105],
    dodgerblue: [30, 144, 255],
    firebrick: [178, 34, 34],
    floralwhite: [255, 255, 240],
    forestgreen: [34, 139, 34],
    fuchsia: [255, 0, 255],
    gainsboro: [220, 220, 220],
    ghostwhite: [248, 248, 255],
    gold: [255, 215, 0],
    goldenrod: [218, 165, 32],
    gray: [128, 128, 128],
    green: [0, 128, 0],
    greenyellow: [173, 255, 47],
    grey: [128, 128, 128],
    honeydew: [240, 255, 240],
    hotpink: [255, 105, 180],
    indianred: [205, 92, 92],
    indigo: [75, 0, 130],
    ivory: [255, 255, 240],
    khaki: [240, 230, 140],
    lavender: [230, 230, 250],
    lavenderblush: [255, 240, 245],
    lawngreen: [124, 252, 0],
    lemonchiffon: [255, 250, 205],
    lightblue: [173, 216, 230],
    lightcoral: [240, 128, 128],
    lightcyan: [224, 255, 255],
    lightgoldenrodyellow: [250, 250, 210],
    lightgray: [211, 211, 211],
    lightgreen: [144, 238, 144],
    lightgrey: [211, 211, 211],
    lightpink: [255, 182, 193],
    lightsalmon: [255, 160, 122],
    lightseagreen: [32, 178, 170],
    lightskyblue: [135, 206, 250],
    lightslategray: [119, 136, 153],
    lightslategrey: [119, 136, 153],
    lightsteelblue: [176, 196, 222],
    lightyellow: [255, 255, 224],
    lime: [0, 255, 0],
    limegreen: [50, 205, 50],
    linen: [250, 240, 230],
    magenta: [255, 0, 255],
    maroon: [128, 0, 0],
    mediumaquamarine: [102, 205, 170],
    mediumblue: [0, 0, 205],
    mediumorchid: [186, 85, 211],
    mediumpurple: [147, 112, 219],
    mediumseagreen: [60, 179, 113],
    mediumslateblue: [123, 104, 238],
    mediumspringgreen: [0, 250, 154],
    mediumturquoise: [72, 209, 204],
    mediumvioletred: [199, 21, 133],
    midnightblue: [25, 25, 112],
    mintcream: [245, 255, 250],
    mistyrose: [255, 228, 225],
    moccasin: [255, 228, 181],
    navajowhite: [255, 222, 173],
    navy: [0, 0, 128],
    oldlace: [253, 245, 230],
    olive: [128, 128, 0],
    olivedrab: [107, 142, 35],
    orange: [255, 165, 0],
    orangered: [255, 69, 0],
    orchid: [218, 112, 214],
    palegoldenrod: [238, 232, 170],
    palegreen: [152, 251, 152],
    paleturquoise: [175, 238, 238],
    palevioletred: [219, 112, 147],
    papayawhip: [255, 239, 213],
    peachpuff: [255, 218, 185],
    peru: [205, 133, 63],
    pink: [255, 192, 203],
    plum: [221, 160, 203],
    powderblue: [176, 224, 230],
    purple: [128, 0, 128],
    rebeccapurple: [102, 51, 153],
    red: [255, 0, 0],
    rosybrown: [188, 143, 143],
    royalblue: [65, 105, 225],
    saddlebrown: [139, 69, 19],
    salmon: [250, 128, 114],
    sandybrown: [244, 164, 96],
    seagreen: [46, 139, 87],
    seashell: [255, 245, 238],
    sienna: [160, 82, 45],
    silver: [192, 192, 192],
    skyblue: [135, 206, 235],
    slateblue: [106, 90, 205],
    slategray: [119, 128, 144],
    slategrey: [119, 128, 144],
    snow: [255, 255, 250],
    springgreen: [0, 255, 127],
    steelblue: [70, 130, 180],
    tan: [210, 180, 140],
    teal: [0, 128, 128],
    thistle: [216, 191, 216],
    transparent: [255, 255, 255, 0],
    tomato: [255, 99, 71],
    turquoise: [64, 224, 208],
    violet: [238, 130, 238],
    wheat: [245, 222, 179],
    white: [255, 255, 255],
    whitesmoke: [245, 245, 245],
    yellow: [255, 255, 0],
    yellowgreen: [154, 205, 5]
}, RGB_REGEX = /rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)/, animQueue = [];
exports.Util = {
    _isElement: function (obj) {
        return !!(obj && obj.nodeType == 1);
    },
    _isFunction: function (obj) {
        return !!(obj && obj.constructor && obj.call && obj.apply);
    },
    _isPlainObject: function (obj) {
        return !!obj && obj.constructor === Object;
    },
    _isArray: function (obj) {
        return Object.prototype.toString.call(obj) === OBJECT_ARRAY;
    },
    _isNumber: function (obj) {
        return (Object.prototype.toString.call(obj) === OBJECT_NUMBER &&
            !isNaN(obj) &&
            isFinite(obj));
    },
    _isString: function (obj) {
        return Object.prototype.toString.call(obj) === OBJECT_STRING;
    },
    _isBoolean: function (obj) {
        return Object.prototype.toString.call(obj) === OBJECT_BOOLEAN;
    },
    isObject: function (val) {
        return val instanceof Object;
    },
    isValidSelector: function (selector) {
        if (typeof selector !== 'string') {
            return false;
        }
        var firstChar = selector[0];
        return (firstChar === '#' ||
            firstChar === '.' ||
            firstChar === firstChar.toUpperCase());
    },
    _sign: function (number) {
        if (number === 0) {
            return 0;
        }
        if (number > 0) {
            return 1;
        }
        else {
            return -1;
        }
    },
    requestAnimFrame: function (callback) {
        animQueue.push(callback);
        if (animQueue.length === 1) {
            requestAnimationFrame(function () {
                var queue = animQueue;
                animQueue = [];
                queue.forEach(function (cb) {
                    cb();
                });
            });
        }
    },
    createCanvasElement: function () {
        var canvas = document.createElement('canvas');
        try {
            canvas.style = canvas.style || {};
        }
        catch (e) { }
        return canvas;
    },
    createImageElement: function () {
        return document.createElement('img');
    },
    _isInDocument: function (el) {
        while ((el = el.parentNode)) {
            if (el == document) {
                return true;
            }
        }
        return false;
    },
    _simplifyArray: function (arr) {
        var retArr = [], len = arr.length, util = exports.Util, n, val;
        for (n = 0; n < len; n++) {
            val = arr[n];
            if (util._isNumber(val)) {
                val = Math.round(val * 1000) / 1000;
            }
            else if (!util._isString(val)) {
                val = val.toString();
            }
            retArr.push(val);
        }
        return retArr;
    },
    _urlToImage: function (url, callback) {
        var imageObj = new Global_1.glob.Image();
        imageObj.onload = function () {
            callback(imageObj);
        };
        imageObj.src = url;
    },
    _rgbToHex: function (r, g, b) {
        return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    _hexToRgb: function (hex) {
        hex = hex.replace(HASH, EMPTY_STRING);
        var bigint = parseInt(hex, 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    },
    getRandomColor: function () {
        var randColor = ((Math.random() * 0xffffff) << 0).toString(16);
        while (randColor.length < 6) {
            randColor = ZERO + randColor;
        }
        return HASH + randColor;
    },
    get: function (val, def) {
        if (val === undefined) {
            return def;
        }
        else {
            return val;
        }
    },
    getRGB: function (color) {
        var rgb;
        if (color in COLORS) {
            rgb = COLORS[color];
            return {
                r: rgb[0],
                g: rgb[1],
                b: rgb[2]
            };
        }
        else if (color[0] === HASH) {
            return this._hexToRgb(color.substring(1));
        }
        else if (color.substr(0, 4) === RGB_PAREN) {
            rgb = RGB_REGEX.exec(color.replace(/ /g, ''));
            return {
                r: parseInt(rgb[1], 10),
                g: parseInt(rgb[2], 10),
                b: parseInt(rgb[3], 10)
            };
        }
        else {
            return {
                r: 0,
                g: 0,
                b: 0
            };
        }
    },
    colorToRGBA: function (str) {
        str = str || 'black';
        return (exports.Util._namedColorToRBA(str) ||
            exports.Util._hex3ColorToRGBA(str) ||
            exports.Util._hex6ColorToRGBA(str) ||
            exports.Util._rgbColorToRGBA(str) ||
            exports.Util._rgbaColorToRGBA(str) ||
            exports.Util._hslColorToRGBA(str));
    },
    _namedColorToRBA: function (str) {
        var c = COLORS[str.toLowerCase()];
        if (!c) {
            return null;
        }
        return {
            r: c[0],
            g: c[1],
            b: c[2],
            a: 1
        };
    },
    _rgbColorToRGBA: function (str) {
        if (str.indexOf('rgb(') === 0) {
            str = str.match(/rgb\(([^)]+)\)/)[1];
            var parts = str.split(/ *, */).map(Number);
            return {
                r: parts[0],
                g: parts[1],
                b: parts[2],
                a: 1
            };
        }
    },
    _rgbaColorToRGBA: function (str) {
        if (str.indexOf('rgba(') === 0) {
            str = str.match(/rgba\(([^)]+)\)/)[1];
            var parts = str.split(/ *, */).map(Number);
            return {
                r: parts[0],
                g: parts[1],
                b: parts[2],
                a: parts[3]
            };
        }
    },
    _hex6ColorToRGBA: function (str) {
        if (str[0] === '#' && str.length === 7) {
            return {
                r: parseInt(str.slice(1, 3), 16),
                g: parseInt(str.slice(3, 5), 16),
                b: parseInt(str.slice(5, 7), 16),
                a: 1
            };
        }
    },
    _hex3ColorToRGBA: function (str) {
        if (str[0] === '#' && str.length === 4) {
            return {
                r: parseInt(str[1] + str[1], 16),
                g: parseInt(str[2] + str[2], 16),
                b: parseInt(str[3] + str[3], 16),
                a: 1
            };
        }
    },
    _hslColorToRGBA: function (str) {
        if (/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.test(str)) {
            var _a = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(str), _ = _a[0], hsl = _a.slice(1);
            var h = Number(hsl[0]) / 360;
            var s = Number(hsl[1]) / 100;
            var l = Number(hsl[2]) / 100;
            var t2 = void 0;
            var t3 = void 0;
            var val = void 0;
            if (s === 0) {
                val = l * 255;
                return {
                    r: Math.round(val),
                    g: Math.round(val),
                    b: Math.round(val),
                    a: 1
                };
            }
            if (l < 0.5) {
                t2 = l * (1 + s);
            }
            else {
                t2 = l + s - l * s;
            }
            var t1 = 2 * l - t2;
            var rgb = [0, 0, 0];
            for (var i = 0; i < 3; i++) {
                t3 = h + (1 / 3) * -(i - 1);
                if (t3 < 0) {
                    t3++;
                }
                if (t3 > 1) {
                    t3--;
                }
                if (6 * t3 < 1) {
                    val = t1 + (t2 - t1) * 6 * t3;
                }
                else if (2 * t3 < 1) {
                    val = t2;
                }
                else if (3 * t3 < 2) {
                    val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
                }
                else {
                    val = t1;
                }
                rgb[i] = val * 255;
            }
            return {
                r: Math.round(rgb[0]),
                g: Math.round(rgb[1]),
                b: Math.round(rgb[2]),
                a: 1
            };
        }
    },
    haveIntersection: function (r1, r2) {
        return !(r2.x > r1.x + r1.width ||
            r2.x + r2.width < r1.x ||
            r2.y > r1.y + r1.height ||
            r2.y + r2.height < r1.y);
    },
    cloneObject: function (obj) {
        var retObj = {};
        for (var key in obj) {
            if (this._isPlainObject(obj[key])) {
                retObj[key] = this.cloneObject(obj[key]);
            }
            else if (this._isArray(obj[key])) {
                retObj[key] = this.cloneArray(obj[key]);
            }
            else {
                retObj[key] = obj[key];
            }
        }
        return retObj;
    },
    cloneArray: function (arr) {
        return arr.slice(0);
    },
    _degToRad: function (deg) {
        return deg * PI_OVER_DEG180;
    },
    _radToDeg: function (rad) {
        return rad * DEG180_OVER_PI;
    },
    _getRotation: function (radians) {
        return Global_1.Konva.angleDeg ? exports.Util._radToDeg(radians) : radians;
    },
    _capitalize: function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    throw: function (str) {
        throw new Error(KONVA_ERROR + str);
    },
    error: function (str) {
        console.error(KONVA_ERROR + str);
    },
    warn: function (str) {
        if (!Global_1.Konva.showWarnings) {
            return;
        }
        console.warn(KONVA_WARNING + str);
    },
    extend: function (child, parent) {
        function Ctor() {
            this.constructor = child;
        }
        Ctor.prototype = parent.prototype;
        var oldProto = child.prototype;
        child.prototype = new Ctor();
        for (var key in oldProto) {
            if (oldProto.hasOwnProperty(key)) {
                child.prototype[key] = oldProto[key];
            }
        }
        child.__super__ = parent.prototype;
        child.super = parent;
    },
    _getControlPoints: function (x0, y0, x1, y1, x2, y2, t) {
        var d01 = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2)), d12 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)), fa = (t * d01) / (d01 + d12), fb = (t * d12) / (d01 + d12), p1x = x1 - fa * (x2 - x0), p1y = y1 - fa * (y2 - y0), p2x = x1 + fb * (x2 - x0), p2y = y1 + fb * (y2 - y0);
        return [p1x, p1y, p2x, p2y];
    },
    _expandPoints: function (p, tension) {
        var len = p.length, allPoints = [], n, cp;
        for (n = 2; n < len - 2; n += 2) {
            cp = exports.Util._getControlPoints(p[n - 2], p[n - 1], p[n], p[n + 1], p[n + 2], p[n + 3], tension);
            allPoints.push(cp[0]);
            allPoints.push(cp[1]);
            allPoints.push(p[n]);
            allPoints.push(p[n + 1]);
            allPoints.push(cp[2]);
            allPoints.push(cp[3]);
        }
        return allPoints;
    },
    each: function (obj, func) {
        for (var key in obj) {
            func(key, obj[key]);
        }
    },
    _inRange: function (val, left, right) {
        return left <= val && val < right;
    },
    _getProjectionToSegment: function (x1, y1, x2, y2, x3, y3) {
        var x, y, dist;
        var pd2 = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
        if (pd2 == 0) {
            x = x1;
            y = y1;
            dist = (x3 - x2) * (x3 - x2) + (y3 - y2) * (y3 - y2);
        }
        else {
            var u = ((x3 - x1) * (x2 - x1) + (y3 - y1) * (y2 - y1)) / pd2;
            if (u < 0) {
                x = x1;
                y = y1;
                dist = (x1 - x3) * (x1 - x3) + (y1 - y3) * (y1 - y3);
            }
            else if (u > 1.0) {
                x = x2;
                y = y2;
                dist = (x2 - x3) * (x2 - x3) + (y2 - y3) * (y2 - y3);
            }
            else {
                x = x1 + u * (x2 - x1);
                y = y1 + u * (y2 - y1);
                dist = (x - x3) * (x - x3) + (y - y3) * (y - y3);
            }
        }
        return [x, y, dist];
    },
    _getProjectionToLine: function (pt, line, isClosed) {
        var pc = exports.Util.cloneObject(pt);
        var dist = Number.MAX_VALUE;
        line.forEach(function (p1, i) {
            if (!isClosed && i === line.length - 1) {
                return;
            }
            var p2 = line[(i + 1) % line.length];
            var proj = exports.Util._getProjectionToSegment(p1.x, p1.y, p2.x, p2.y, pt.x, pt.y);
            var px = proj[0], py = proj[1], pdist = proj[2];
            if (pdist < dist) {
                pc.x = px;
                pc.y = py;
                dist = pdist;
            }
        });
        return pc;
    },
    _prepareArrayForTween: function (startArray, endArray, isClosed) {
        var n, start = [], end = [];
        if (startArray.length > endArray.length) {
            var temp = endArray;
            endArray = startArray;
            startArray = temp;
        }
        for (n = 0; n < startArray.length; n += 2) {
            start.push({
                x: startArray[n],
                y: startArray[n + 1]
            });
        }
        for (n = 0; n < endArray.length; n += 2) {
            end.push({
                x: endArray[n],
                y: endArray[n + 1]
            });
        }
        var newStart = [];
        end.forEach(function (point) {
            var pr = exports.Util._getProjectionToLine(point, start, isClosed);
            newStart.push(pr.x);
            newStart.push(pr.y);
        });
        return newStart;
    },
    _prepareToStringify: function (obj) {
        var desc;
        obj.visitedByCircularReferenceRemoval = true;
        for (var key in obj) {
            if (!(obj.hasOwnProperty(key) && obj[key] && typeof obj[key] == 'object')) {
                continue;
            }
            desc = Object.getOwnPropertyDescriptor(obj, key);
            if (obj[key].visitedByCircularReferenceRemoval ||
                exports.Util._isElement(obj[key])) {
                if (desc.configurable) {
                    delete obj[key];
                }
                else {
                    return null;
                }
            }
            else if (exports.Util._prepareToStringify(obj[key]) === null) {
                if (desc.configurable) {
                    delete obj[key];
                }
                else {
                    return null;
                }
            }
        }
        delete obj.visitedByCircularReferenceRemoval;
        return obj;
    },
    _assign: function (target, source) {
        for (var key in source) {
            target[key] = source[key];
        }
        return target;
    },
    _getFirstPointerId: function (evt) {
        if (!evt.touches) {
            return 999;
        }
        else {
            return evt.changedTouches[0].identifier;
        }
    }
};

},{"./Global":18}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Global_1 = require("./Global");
var Util_1 = require("./Util");
function _formatValue(val) {
    if (Util_1.Util._isString(val)) {
        return '"' + val + '"';
    }
    if (Object.prototype.toString.call(val) === '[object Number]') {
        return val;
    }
    if (Util_1.Util._isBoolean(val)) {
        return val;
    }
    return Object.prototype.toString.call(val);
}
function RGBComponent(val) {
    if (val > 255) {
        return 255;
    }
    else if (val < 0) {
        return 0;
    }
    return Math.round(val);
}
exports.RGBComponent = RGBComponent;
function alphaComponent(val) {
    if (val > 1) {
        return 1;
    }
    else if (val < 0.0001) {
        return 0.0001;
    }
    return val;
}
exports.alphaComponent = alphaComponent;
function getNumberValidator() {
    if (Global_1.Konva.isUnminified) {
        return function (val, attr) {
            if (!Util_1.Util._isNumber(val)) {
                Util_1.Util.warn(_formatValue(val) +
                    ' is a not valid value for "' +
                    attr +
                    '" attribute. The value should be a number.');
            }
            return val;
        };
    }
}
exports.getNumberValidator = getNumberValidator;
function getNumberOrAutoValidator() {
    if (Global_1.Konva.isUnminified) {
        return function (val, attr) {
            var isNumber = Util_1.Util._isNumber(val);
            var isAuto = val === 'auto';
            if (!(isNumber || isAuto)) {
                Util_1.Util.warn(_formatValue(val) +
                    ' is a not valid value for "' +
                    attr +
                    '" attribute. The value should be a number or "auto".');
            }
            return val;
        };
    }
}
exports.getNumberOrAutoValidator = getNumberOrAutoValidator;
function getStringValidator() {
    if (Global_1.Konva.isUnminified) {
        return function (val, attr) {
            if (!Util_1.Util._isString(val)) {
                Util_1.Util.warn(_formatValue(val) +
                    ' is a not valid value for "' +
                    attr +
                    '" attribute. The value should be a string.');
            }
            return val;
        };
    }
}
exports.getStringValidator = getStringValidator;
function getFunctionValidator() {
    if (Global_1.Konva.isUnminified) {
        return function (val, attr) {
            if (!Util_1.Util._isFunction(val)) {
                Util_1.Util.warn(_formatValue(val) +
                    ' is a not valid value for "' +
                    attr +
                    '" attribute. The value should be a function.');
            }
            return val;
        };
    }
}
exports.getFunctionValidator = getFunctionValidator;
function getNumberArrayValidator() {
    if (Global_1.Konva.isUnminified) {
        return function (val, attr) {
            if (!Util_1.Util._isArray(val)) {
                Util_1.Util.warn(_formatValue(val) +
                    ' is a not valid value for "' +
                    attr +
                    '" attribute. The value should be a array of numbers.');
            }
            else {
                val.forEach(function (item) {
                    if (!Util_1.Util._isNumber(item)) {
                        Util_1.Util.warn('"' +
                            attr +
                            '" attribute has non numeric element ' +
                            item +
                            '. Make sure that all elements are numbers.');
                    }
                });
            }
            return val;
        };
    }
}
exports.getNumberArrayValidator = getNumberArrayValidator;
function getBooleanValidator() {
    if (Global_1.Konva.isUnminified) {
        return function (val, attr) {
            var isBool = val === true || val === false;
            if (!isBool) {
                Util_1.Util.warn(_formatValue(val) +
                    ' is a not valid value for "' +
                    attr +
                    '" attribute. The value should be a boolean.');
            }
            return val;
        };
    }
}
exports.getBooleanValidator = getBooleanValidator;
function getComponentValidator(components) {
    if (Global_1.Konva.isUnminified) {
        return function (val, attr) {
            if (!Util_1.Util.isObject(val)) {
                Util_1.Util.warn(_formatValue(val) +
                    ' is a not valid value for "' +
                    attr +
                    '" attribute. The value should be an object with properties ' +
                    components);
            }
            return val;
        };
    }
}
exports.getComponentValidator = getComponentValidator;

},{"./Global":18,"./Util":26}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Global_1 = require("./Global");
var Util_1 = require("./Util");
var Node_1 = require("./Node");
var Container_1 = require("./Container");
var Stage_1 = require("./Stage");
var Layer_1 = require("./Layer");
var FastLayer_1 = require("./FastLayer");
var Group_1 = require("./Group");
var DragAndDrop_1 = require("./DragAndDrop");
var Shape_1 = require("./Shape");
var Animation_1 = require("./Animation");
var Tween_1 = require("./Tween");
var Context_1 = require("./Context");
var Canvas_1 = require("./Canvas");
exports.Konva = Util_1.Util._assign(Global_1.Konva, {
    Collection: Util_1.Collection,
    Util: Util_1.Util,
    Transform: Util_1.Transform,
    Node: Node_1.Node,
    ids: Node_1.ids,
    names: Node_1.names,
    Container: Container_1.Container,
    Stage: Stage_1.Stage,
    stages: Stage_1.stages,
    Layer: Layer_1.Layer,
    FastLayer: FastLayer_1.FastLayer,
    Group: Group_1.Group,
    DD: DragAndDrop_1.DD,
    Shape: Shape_1.Shape,
    shapes: Shape_1.shapes,
    Animation: Animation_1.Animation,
    Tween: Tween_1.Tween,
    Easings: Tween_1.Easings,
    Context: Context_1.Context,
    Canvas: Canvas_1.Canvas
});

},{"./Animation":10,"./Canvas":12,"./Container":13,"./Context":14,"./DragAndDrop":15,"./FastLayer":17,"./Global":18,"./Group":19,"./Layer":20,"./Node":21,"./Shape":23,"./Stage":24,"./Tween":25,"./Util":26}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _CoreInternals_1 = require("./_CoreInternals");
var Arc_1 = require("./shapes/Arc");
var Arrow_1 = require("./shapes/Arrow");
var Circle_1 = require("./shapes/Circle");
var Ellipse_1 = require("./shapes/Ellipse");
var Image_1 = require("./shapes/Image");
var Label_1 = require("./shapes/Label");
var Line_1 = require("./shapes/Line");
var Path_1 = require("./shapes/Path");
var Rect_1 = require("./shapes/Rect");
var RegularPolygon_1 = require("./shapes/RegularPolygon");
var Ring_1 = require("./shapes/Ring");
var Sprite_1 = require("./shapes/Sprite");
var Star_1 = require("./shapes/Star");
var Text_1 = require("./shapes/Text");
var TextPath_1 = require("./shapes/TextPath");
var Transformer_1 = require("./shapes/Transformer");
var Wedge_1 = require("./shapes/Wedge");
var Blur_1 = require("./filters/Blur");
var Brighten_1 = require("./filters/Brighten");
var Contrast_1 = require("./filters/Contrast");
var Emboss_1 = require("./filters/Emboss");
var Enhance_1 = require("./filters/Enhance");
var Grayscale_1 = require("./filters/Grayscale");
var HSL_1 = require("./filters/HSL");
var HSV_1 = require("./filters/HSV");
var Invert_1 = require("./filters/Invert");
var Kaleidoscope_1 = require("./filters/Kaleidoscope");
var Mask_1 = require("./filters/Mask");
var Noise_1 = require("./filters/Noise");
var Pixelate_1 = require("./filters/Pixelate");
var Posterize_1 = require("./filters/Posterize");
var RGB_1 = require("./filters/RGB");
var RGBA_1 = require("./filters/RGBA");
var Sepia_1 = require("./filters/Sepia");
var Solarize_1 = require("./filters/Solarize");
var Threshold_1 = require("./filters/Threshold");
exports.Konva = _CoreInternals_1.Konva.Util._assign(_CoreInternals_1.Konva, {
    Arc: Arc_1.Arc,
    Arrow: Arrow_1.Arrow,
    Circle: Circle_1.Circle,
    Ellipse: Ellipse_1.Ellipse,
    Image: Image_1.Image,
    Label: Label_1.Label,
    Tag: Label_1.Tag,
    Line: Line_1.Line,
    Path: Path_1.Path,
    Rect: Rect_1.Rect,
    RegularPolygon: RegularPolygon_1.RegularPolygon,
    Ring: Ring_1.Ring,
    Sprite: Sprite_1.Sprite,
    Star: Star_1.Star,
    Text: Text_1.Text,
    TextPath: TextPath_1.TextPath,
    Transformer: Transformer_1.Transformer,
    Wedge: Wedge_1.Wedge,
    Filters: {
        Blur: Blur_1.Blur,
        Brighten: Brighten_1.Brighten,
        Contrast: Contrast_1.Contrast,
        Emboss: Emboss_1.Emboss,
        Enhance: Enhance_1.Enhance,
        Grayscale: Grayscale_1.Grayscale,
        HSL: HSL_1.HSL,
        HSV: HSV_1.HSV,
        Invert: Invert_1.Invert,
        Kaleidoscope: Kaleidoscope_1.Kaleidoscope,
        Mask: Mask_1.Mask,
        Noise: Noise_1.Noise,
        Pixelate: Pixelate_1.Pixelate,
        Posterize: Posterize_1.Posterize,
        RGB: RGB_1.RGB,
        RGBA: RGBA_1.RGBA,
        Sepia: Sepia_1.Sepia,
        Solarize: Solarize_1.Solarize,
        Threshold: Threshold_1.Threshold
    }
});

},{"./_CoreInternals":28,"./filters/Blur":30,"./filters/Brighten":31,"./filters/Contrast":32,"./filters/Emboss":33,"./filters/Enhance":34,"./filters/Grayscale":35,"./filters/HSL":36,"./filters/HSV":37,"./filters/Invert":38,"./filters/Kaleidoscope":39,"./filters/Mask":40,"./filters/Noise":41,"./filters/Pixelate":42,"./filters/Posterize":43,"./filters/RGB":44,"./filters/RGBA":45,"./filters/Sepia":46,"./filters/Solarize":47,"./filters/Threshold":48,"./shapes/Arc":50,"./shapes/Arrow":51,"./shapes/Circle":52,"./shapes/Ellipse":53,"./shapes/Image":54,"./shapes/Label":55,"./shapes/Line":56,"./shapes/Path":57,"./shapes/Rect":58,"./shapes/RegularPolygon":59,"./shapes/Ring":60,"./shapes/Sprite":61,"./shapes/Star":62,"./shapes/Text":63,"./shapes/TextPath":64,"./shapes/Transformer":65,"./shapes/Wedge":66}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Factory_1 = require("../Factory");
var Node_1 = require("../Node");
var Validators_1 = require("../Validators");
function BlurStack() {
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.a = 0;
    this.next = null;
}
var mul_table = [
    512,
    512,
    456,
    512,
    328,
    456,
    335,
    512,
    405,
    328,
    271,
    456,
    388,
    335,
    292,
    512,
    454,
    405,
    364,
    328,
    298,
    271,
    496,
    456,
    420,
    388,
    360,
    335,
    312,
    292,
    273,
    512,
    482,
    454,
    428,
    405,
    383,
    364,
    345,
    328,
    312,
    298,
    284,
    271,
    259,
    496,
    475,
    456,
    437,
    420,
    404,
    388,
    374,
    360,
    347,
    335,
    323,
    312,
    302,
    292,
    282,
    273,
    265,
    512,
    497,
    482,
    468,
    454,
    441,
    428,
    417,
    405,
    394,
    383,
    373,
    364,
    354,
    345,
    337,
    328,
    320,
    312,
    305,
    298,
    291,
    284,
    278,
    271,
    265,
    259,
    507,
    496,
    485,
    475,
    465,
    456,
    446,
    437,
    428,
    420,
    412,
    404,
    396,
    388,
    381,
    374,
    367,
    360,
    354,
    347,
    341,
    335,
    329,
    323,
    318,
    312,
    307,
    302,
    297,
    292,
    287,
    282,
    278,
    273,
    269,
    265,
    261,
    512,
    505,
    497,
    489,
    482,
    475,
    468,
    461,
    454,
    447,
    441,
    435,
    428,
    422,
    417,
    411,
    405,
    399,
    394,
    389,
    383,
    378,
    373,
    368,
    364,
    359,
    354,
    350,
    345,
    341,
    337,
    332,
    328,
    324,
    320,
    316,
    312,
    309,
    305,
    301,
    298,
    294,
    291,
    287,
    284,
    281,
    278,
    274,
    271,
    268,
    265,
    262,
    259,
    257,
    507,
    501,
    496,
    491,
    485,
    480,
    475,
    470,
    465,
    460,
    456,
    451,
    446,
    442,
    437,
    433,
    428,
    424,
    420,
    416,
    412,
    408,
    404,
    400,
    396,
    392,
    388,
    385,
    381,
    377,
    374,
    370,
    367,
    363,
    360,
    357,
    354,
    350,
    347,
    344,
    341,
    338,
    335,
    332,
    329,
    326,
    323,
    320,
    318,
    315,
    312,
    310,
    307,
    304,
    302,
    299,
    297,
    294,
    292,
    289,
    287,
    285,
    282,
    280,
    278,
    275,
    273,
    271,
    269,
    267,
    265,
    263,
    261,
    259
];
var shg_table = [
    9,
    11,
    12,
    13,
    13,
    14,
    14,
    15,
    15,
    15,
    15,
    16,
    16,
    16,
    16,
    17,
    17,
    17,
    17,
    17,
    17,
    17,
    18,
    18,
    18,
    18,
    18,
    18,
    18,
    18,
    18,
    19,
    19,
    19,
    19,
    19,
    19,
    19,
    19,
    19,
    19,
    19,
    19,
    19,
    19,
    20,
    20,
    20,
    20,
    20,
    20,
    20,
    20,
    20,
    20,
    20,
    20,
    20,
    20,
    20,
    20,
    20,
    20,
    21,
    21,
    21,
    21,
    21,
    21,
    21,
    21,
    21,
    21,
    21,
    21,
    21,
    21,
    21,
    21,
    21,
    21,
    21,
    21,
    21,
    21,
    21,
    21,
    21,
    21,
    21,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    22,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    23,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24,
    24
];
function filterGaussBlurRGBA(imageData, radius) {
    var pixels = imageData.data, width = imageData.width, height = imageData.height;
    var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum, r_out_sum, g_out_sum, b_out_sum, a_out_sum, r_in_sum, g_in_sum, b_in_sum, a_in_sum, pr, pg, pb, pa, rbs;
    var div = radius + radius + 1, widthMinus1 = width - 1, heightMinus1 = height - 1, radiusPlus1 = radius + 1, sumFactor = (radiusPlus1 * (radiusPlus1 + 1)) / 2, stackStart = new BlurStack(), stackEnd = null, stack = stackStart, stackIn = null, stackOut = null, mul_sum = mul_table[radius], shg_sum = shg_table[radius];
    for (i = 1; i < div; i++) {
        stack = stack.next = new BlurStack();
        if (i === radiusPlus1) {
            stackEnd = stack;
        }
    }
    stack.next = stackStart;
    yw = yi = 0;
    for (y = 0; y < height; y++) {
        r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;
        r_out_sum = radiusPlus1 * (pr = pixels[yi]);
        g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
        b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
        a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);
        r_sum += sumFactor * pr;
        g_sum += sumFactor * pg;
        b_sum += sumFactor * pb;
        a_sum += sumFactor * pa;
        stack = stackStart;
        for (i = 0; i < radiusPlus1; i++) {
            stack.r = pr;
            stack.g = pg;
            stack.b = pb;
            stack.a = pa;
            stack = stack.next;
        }
        for (i = 1; i < radiusPlus1; i++) {
            p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
            r_sum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - i);
            g_sum += (stack.g = pg = pixels[p + 1]) * rbs;
            b_sum += (stack.b = pb = pixels[p + 2]) * rbs;
            a_sum += (stack.a = pa = pixels[p + 3]) * rbs;
            r_in_sum += pr;
            g_in_sum += pg;
            b_in_sum += pb;
            a_in_sum += pa;
            stack = stack.next;
        }
        stackIn = stackStart;
        stackOut = stackEnd;
        for (x = 0; x < width; x++) {
            pixels[yi + 3] = pa = (a_sum * mul_sum) >> shg_sum;
            if (pa !== 0) {
                pa = 255 / pa;
                pixels[yi] = ((r_sum * mul_sum) >> shg_sum) * pa;
                pixels[yi + 1] = ((g_sum * mul_sum) >> shg_sum) * pa;
                pixels[yi + 2] = ((b_sum * mul_sum) >> shg_sum) * pa;
            }
            else {
                pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
            }
            r_sum -= r_out_sum;
            g_sum -= g_out_sum;
            b_sum -= b_out_sum;
            a_sum -= a_out_sum;
            r_out_sum -= stackIn.r;
            g_out_sum -= stackIn.g;
            b_out_sum -= stackIn.b;
            a_out_sum -= stackIn.a;
            p = (yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1)) << 2;
            r_in_sum += stackIn.r = pixels[p];
            g_in_sum += stackIn.g = pixels[p + 1];
            b_in_sum += stackIn.b = pixels[p + 2];
            a_in_sum += stackIn.a = pixels[p + 3];
            r_sum += r_in_sum;
            g_sum += g_in_sum;
            b_sum += b_in_sum;
            a_sum += a_in_sum;
            stackIn = stackIn.next;
            r_out_sum += pr = stackOut.r;
            g_out_sum += pg = stackOut.g;
            b_out_sum += pb = stackOut.b;
            a_out_sum += pa = stackOut.a;
            r_in_sum -= pr;
            g_in_sum -= pg;
            b_in_sum -= pb;
            a_in_sum -= pa;
            stackOut = stackOut.next;
            yi += 4;
        }
        yw += width;
    }
    for (x = 0; x < width; x++) {
        g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;
        yi = x << 2;
        r_out_sum = radiusPlus1 * (pr = pixels[yi]);
        g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
        b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
        a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);
        r_sum += sumFactor * pr;
        g_sum += sumFactor * pg;
        b_sum += sumFactor * pb;
        a_sum += sumFactor * pa;
        stack = stackStart;
        for (i = 0; i < radiusPlus1; i++) {
            stack.r = pr;
            stack.g = pg;
            stack.b = pb;
            stack.a = pa;
            stack = stack.next;
        }
        yp = width;
        for (i = 1; i <= radius; i++) {
            yi = (yp + x) << 2;
            r_sum += (stack.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
            g_sum += (stack.g = pg = pixels[yi + 1]) * rbs;
            b_sum += (stack.b = pb = pixels[yi + 2]) * rbs;
            a_sum += (stack.a = pa = pixels[yi + 3]) * rbs;
            r_in_sum += pr;
            g_in_sum += pg;
            b_in_sum += pb;
            a_in_sum += pa;
            stack = stack.next;
            if (i < heightMinus1) {
                yp += width;
            }
        }
        yi = x;
        stackIn = stackStart;
        stackOut = stackEnd;
        for (y = 0; y < height; y++) {
            p = yi << 2;
            pixels[p + 3] = pa = (a_sum * mul_sum) >> shg_sum;
            if (pa > 0) {
                pa = 255 / pa;
                pixels[p] = ((r_sum * mul_sum) >> shg_sum) * pa;
                pixels[p + 1] = ((g_sum * mul_sum) >> shg_sum) * pa;
                pixels[p + 2] = ((b_sum * mul_sum) >> shg_sum) * pa;
            }
            else {
                pixels[p] = pixels[p + 1] = pixels[p + 2] = 0;
            }
            r_sum -= r_out_sum;
            g_sum -= g_out_sum;
            b_sum -= b_out_sum;
            a_sum -= a_out_sum;
            r_out_sum -= stackIn.r;
            g_out_sum -= stackIn.g;
            b_out_sum -= stackIn.b;
            a_out_sum -= stackIn.a;
            p =
                (x +
                    ((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width) <<
                    2;
            r_sum += r_in_sum += stackIn.r = pixels[p];
            g_sum += g_in_sum += stackIn.g = pixels[p + 1];
            b_sum += b_in_sum += stackIn.b = pixels[p + 2];
            a_sum += a_in_sum += stackIn.a = pixels[p + 3];
            stackIn = stackIn.next;
            r_out_sum += pr = stackOut.r;
            g_out_sum += pg = stackOut.g;
            b_out_sum += pb = stackOut.b;
            a_out_sum += pa = stackOut.a;
            r_in_sum -= pr;
            g_in_sum -= pg;
            b_in_sum -= pb;
            a_in_sum -= pa;
            stackOut = stackOut.next;
            yi += width;
        }
    }
}
exports.Blur = function Blur(imageData) {
    var radius = Math.round(this.blurRadius());
    if (radius > 0) {
        filterGaussBlurRGBA(imageData, radius);
    }
};
Factory_1.Factory.addGetterSetter(Node_1.Node, 'blurRadius', 0, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);

},{"../Factory":16,"../Node":21,"../Validators":27}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Factory_1 = require("../Factory");
var Node_1 = require("../Node");
var Validators_1 = require("../Validators");
exports.Brighten = function (imageData) {
    var brightness = this.brightness() * 255, data = imageData.data, len = data.length, i;
    for (i = 0; i < len; i += 4) {
        data[i] += brightness;
        data[i + 1] += brightness;
        data[i + 2] += brightness;
    }
};
Factory_1.Factory.addGetterSetter(Node_1.Node, 'brightness', 0, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);

},{"../Factory":16,"../Node":21,"../Validators":27}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Factory_1 = require("../Factory");
var Node_1 = require("../Node");
var Validators_1 = require("../Validators");
exports.Contrast = function (imageData) {
    var adjust = Math.pow((this.contrast() + 100) / 100, 2);
    var data = imageData.data, nPixels = data.length, red = 150, green = 150, blue = 150, i;
    for (i = 0; i < nPixels; i += 4) {
        red = data[i];
        green = data[i + 1];
        blue = data[i + 2];
        red /= 255;
        red -= 0.5;
        red *= adjust;
        red += 0.5;
        red *= 255;
        green /= 255;
        green -= 0.5;
        green *= adjust;
        green += 0.5;
        green *= 255;
        blue /= 255;
        blue -= 0.5;
        blue *= adjust;
        blue += 0.5;
        blue *= 255;
        red = red < 0 ? 0 : red > 255 ? 255 : red;
        green = green < 0 ? 0 : green > 255 ? 255 : green;
        blue = blue < 0 ? 0 : blue > 255 ? 255 : blue;
        data[i] = red;
        data[i + 1] = green;
        data[i + 2] = blue;
    }
};
Factory_1.Factory.addGetterSetter(Node_1.Node, 'contrast', 0, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);

},{"../Factory":16,"../Node":21,"../Validators":27}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Factory_1 = require("../Factory");
var Node_1 = require("../Node");
var Util_1 = require("../Util");
var Validators_1 = require("../Validators");
exports.Emboss = function (imageData) {
    var strength = this.embossStrength() * 10, greyLevel = this.embossWhiteLevel() * 255, direction = this.embossDirection(), blend = this.embossBlend(), dirY = 0, dirX = 0, data = imageData.data, w = imageData.width, h = imageData.height, w4 = w * 4, y = h;
    switch (direction) {
        case 'top-left':
            dirY = -1;
            dirX = -1;
            break;
        case 'top':
            dirY = -1;
            dirX = 0;
            break;
        case 'top-right':
            dirY = -1;
            dirX = 1;
            break;
        case 'right':
            dirY = 0;
            dirX = 1;
            break;
        case 'bottom-right':
            dirY = 1;
            dirX = 1;
            break;
        case 'bottom':
            dirY = 1;
            dirX = 0;
            break;
        case 'bottom-left':
            dirY = 1;
            dirX = -1;
            break;
        case 'left':
            dirY = 0;
            dirX = -1;
            break;
        default:
            Util_1.Util.error('Unknown emboss direction: ' + direction);
    }
    do {
        var offsetY = (y - 1) * w4;
        var otherY = dirY;
        if (y + otherY < 1) {
            otherY = 0;
        }
        if (y + otherY > h) {
            otherY = 0;
        }
        var offsetYOther = (y - 1 + otherY) * w * 4;
        var x = w;
        do {
            var offset = offsetY + (x - 1) * 4;
            var otherX = dirX;
            if (x + otherX < 1) {
                otherX = 0;
            }
            if (x + otherX > w) {
                otherX = 0;
            }
            var offsetOther = offsetYOther + (x - 1 + otherX) * 4;
            var dR = data[offset] - data[offsetOther];
            var dG = data[offset + 1] - data[offsetOther + 1];
            var dB = data[offset + 2] - data[offsetOther + 2];
            var dif = dR;
            var absDif = dif > 0 ? dif : -dif;
            var absG = dG > 0 ? dG : -dG;
            var absB = dB > 0 ? dB : -dB;
            if (absG > absDif) {
                dif = dG;
            }
            if (absB > absDif) {
                dif = dB;
            }
            dif *= strength;
            if (blend) {
                var r = data[offset] + dif;
                var g = data[offset + 1] + dif;
                var b = data[offset + 2] + dif;
                data[offset] = r > 255 ? 255 : r < 0 ? 0 : r;
                data[offset + 1] = g > 255 ? 255 : g < 0 ? 0 : g;
                data[offset + 2] = b > 255 ? 255 : b < 0 ? 0 : b;
            }
            else {
                var grey = greyLevel - dif;
                if (grey < 0) {
                    grey = 0;
                }
                else if (grey > 255) {
                    grey = 255;
                }
                data[offset] = data[offset + 1] = data[offset + 2] = grey;
            }
        } while (--x);
    } while (--y);
};
Factory_1.Factory.addGetterSetter(Node_1.Node, 'embossStrength', 0.5, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
Factory_1.Factory.addGetterSetter(Node_1.Node, 'embossWhiteLevel', 0.5, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
Factory_1.Factory.addGetterSetter(Node_1.Node, 'embossDirection', 'top-left', null, Factory_1.Factory.afterSetFilter);
Factory_1.Factory.addGetterSetter(Node_1.Node, 'embossBlend', false, null, Factory_1.Factory.afterSetFilter);

},{"../Factory":16,"../Node":21,"../Util":26,"../Validators":27}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Factory_1 = require("../Factory");
var Node_1 = require("../Node");
var Validators_1 = require("../Validators");
function remap(fromValue, fromMin, fromMax, toMin, toMax) {
    var fromRange = fromMax - fromMin, toRange = toMax - toMin, toValue;
    if (fromRange === 0) {
        return toMin + toRange / 2;
    }
    if (toRange === 0) {
        return toMin;
    }
    toValue = (fromValue - fromMin) / fromRange;
    toValue = toRange * toValue + toMin;
    return toValue;
}
exports.Enhance = function (imageData) {
    var data = imageData.data, nSubPixels = data.length, rMin = data[0], rMax = rMin, r, gMin = data[1], gMax = gMin, g, bMin = data[2], bMax = bMin, b, i;
    var enhanceAmount = this.enhance();
    if (enhanceAmount === 0) {
        return;
    }
    for (i = 0; i < nSubPixels; i += 4) {
        r = data[i + 0];
        if (r < rMin) {
            rMin = r;
        }
        else if (r > rMax) {
            rMax = r;
        }
        g = data[i + 1];
        if (g < gMin) {
            gMin = g;
        }
        else if (g > gMax) {
            gMax = g;
        }
        b = data[i + 2];
        if (b < bMin) {
            bMin = b;
        }
        else if (b > bMax) {
            bMax = b;
        }
    }
    if (rMax === rMin) {
        rMax = 255;
        rMin = 0;
    }
    if (gMax === gMin) {
        gMax = 255;
        gMin = 0;
    }
    if (bMax === bMin) {
        bMax = 255;
        bMin = 0;
    }
    var rMid, rGoalMax, rGoalMin, gMid, gGoalMax, gGoalMin, bMid, bGoalMax, bGoalMin;
    if (enhanceAmount > 0) {
        rGoalMax = rMax + enhanceAmount * (255 - rMax);
        rGoalMin = rMin - enhanceAmount * (rMin - 0);
        gGoalMax = gMax + enhanceAmount * (255 - gMax);
        gGoalMin = gMin - enhanceAmount * (gMin - 0);
        bGoalMax = bMax + enhanceAmount * (255 - bMax);
        bGoalMin = bMin - enhanceAmount * (bMin - 0);
    }
    else {
        rMid = (rMax + rMin) * 0.5;
        rGoalMax = rMax + enhanceAmount * (rMax - rMid);
        rGoalMin = rMin + enhanceAmount * (rMin - rMid);
        gMid = (gMax + gMin) * 0.5;
        gGoalMax = gMax + enhanceAmount * (gMax - gMid);
        gGoalMin = gMin + enhanceAmount * (gMin - gMid);
        bMid = (bMax + bMin) * 0.5;
        bGoalMax = bMax + enhanceAmount * (bMax - bMid);
        bGoalMin = bMin + enhanceAmount * (bMin - bMid);
    }
    for (i = 0; i < nSubPixels; i += 4) {
        data[i + 0] = remap(data[i + 0], rMin, rMax, rGoalMin, rGoalMax);
        data[i + 1] = remap(data[i + 1], gMin, gMax, gGoalMin, gGoalMax);
        data[i + 2] = remap(data[i + 2], bMin, bMax, bGoalMin, bGoalMax);
    }
};
Factory_1.Factory.addGetterSetter(Node_1.Node, 'enhance', 0, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);

},{"../Factory":16,"../Node":21,"../Validators":27}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Grayscale = function (imageData) {
    var data = imageData.data, len = data.length, i, brightness;
    for (i = 0; i < len; i += 4) {
        brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
        data[i] = brightness;
        data[i + 1] = brightness;
        data[i + 2] = brightness;
    }
};

},{}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Factory_1 = require("../Factory");
var Node_1 = require("../Node");
var Validators_1 = require("../Validators");
Factory_1.Factory.addGetterSetter(Node_1.Node, 'hue', 0, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
Factory_1.Factory.addGetterSetter(Node_1.Node, 'saturation', 0, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
Factory_1.Factory.addGetterSetter(Node_1.Node, 'luminance', 0, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
exports.HSL = function (imageData) {
    var data = imageData.data, nPixels = data.length, v = 1, s = Math.pow(2, this.saturation()), h = Math.abs(this.hue() + 360) % 360, l = this.luminance() * 127, i;
    var vsu = v * s * Math.cos((h * Math.PI) / 180), vsw = v * s * Math.sin((h * Math.PI) / 180);
    var rr = 0.299 * v + 0.701 * vsu + 0.167 * vsw, rg = 0.587 * v - 0.587 * vsu + 0.33 * vsw, rb = 0.114 * v - 0.114 * vsu - 0.497 * vsw;
    var gr = 0.299 * v - 0.299 * vsu - 0.328 * vsw, gg = 0.587 * v + 0.413 * vsu + 0.035 * vsw, gb = 0.114 * v - 0.114 * vsu + 0.293 * vsw;
    var br = 0.299 * v - 0.3 * vsu + 1.25 * vsw, bg = 0.587 * v - 0.586 * vsu - 1.05 * vsw, bb = 0.114 * v + 0.886 * vsu - 0.2 * vsw;
    var r, g, b, a;
    for (i = 0; i < nPixels; i += 4) {
        r = data[i + 0];
        g = data[i + 1];
        b = data[i + 2];
        a = data[i + 3];
        data[i + 0] = rr * r + rg * g + rb * b + l;
        data[i + 1] = gr * r + gg * g + gb * b + l;
        data[i + 2] = br * r + bg * g + bb * b + l;
        data[i + 3] = a;
    }
};

},{"../Factory":16,"../Node":21,"../Validators":27}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Factory_1 = require("../Factory");
var Node_1 = require("../Node");
var Validators_1 = require("../Validators");
exports.HSV = function (imageData) {
    var data = imageData.data, nPixels = data.length, v = Math.pow(2, this.value()), s = Math.pow(2, this.saturation()), h = Math.abs(this.hue() + 360) % 360, i;
    var vsu = v * s * Math.cos((h * Math.PI) / 180), vsw = v * s * Math.sin((h * Math.PI) / 180);
    var rr = 0.299 * v + 0.701 * vsu + 0.167 * vsw, rg = 0.587 * v - 0.587 * vsu + 0.33 * vsw, rb = 0.114 * v - 0.114 * vsu - 0.497 * vsw;
    var gr = 0.299 * v - 0.299 * vsu - 0.328 * vsw, gg = 0.587 * v + 0.413 * vsu + 0.035 * vsw, gb = 0.114 * v - 0.114 * vsu + 0.293 * vsw;
    var br = 0.299 * v - 0.3 * vsu + 1.25 * vsw, bg = 0.587 * v - 0.586 * vsu - 1.05 * vsw, bb = 0.114 * v + 0.886 * vsu - 0.2 * vsw;
    var r, g, b, a;
    for (i = 0; i < nPixels; i += 4) {
        r = data[i + 0];
        g = data[i + 1];
        b = data[i + 2];
        a = data[i + 3];
        data[i + 0] = rr * r + rg * g + rb * b;
        data[i + 1] = gr * r + gg * g + gb * b;
        data[i + 2] = br * r + bg * g + bb * b;
        data[i + 3] = a;
    }
};
Factory_1.Factory.addGetterSetter(Node_1.Node, 'hue', 0, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
Factory_1.Factory.addGetterSetter(Node_1.Node, 'saturation', 0, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
Factory_1.Factory.addGetterSetter(Node_1.Node, 'value', 0, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);

},{"../Factory":16,"../Node":21,"../Validators":27}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invert = function (imageData) {
    var data = imageData.data, len = data.length, i;
    for (i = 0; i < len; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
    }
};

},{}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Factory_1 = require("../Factory");
var Node_1 = require("../Node");
var Util_1 = require("../Util");
var Validators_1 = require("../Validators");
var ToPolar = function (src, dst, opt) {
    var srcPixels = src.data, dstPixels = dst.data, xSize = src.width, ySize = src.height, xMid = opt.polarCenterX || xSize / 2, yMid = opt.polarCenterY || ySize / 2, i, x, y, r = 0, g = 0, b = 0, a = 0;
    var rad, rMax = Math.sqrt(xMid * xMid + yMid * yMid);
    x = xSize - xMid;
    y = ySize - yMid;
    rad = Math.sqrt(x * x + y * y);
    rMax = rad > rMax ? rad : rMax;
    var rSize = ySize, tSize = xSize, radius, theta;
    var conversion = ((360 / tSize) * Math.PI) / 180, sin, cos;
    for (theta = 0; theta < tSize; theta += 1) {
        sin = Math.sin(theta * conversion);
        cos = Math.cos(theta * conversion);
        for (radius = 0; radius < rSize; radius += 1) {
            x = Math.floor(xMid + ((rMax * radius) / rSize) * cos);
            y = Math.floor(yMid + ((rMax * radius) / rSize) * sin);
            i = (y * xSize + x) * 4;
            r = srcPixels[i + 0];
            g = srcPixels[i + 1];
            b = srcPixels[i + 2];
            a = srcPixels[i + 3];
            i = (theta + radius * xSize) * 4;
            dstPixels[i + 0] = r;
            dstPixels[i + 1] = g;
            dstPixels[i + 2] = b;
            dstPixels[i + 3] = a;
        }
    }
};
var FromPolar = function (src, dst, opt) {
    var srcPixels = src.data, dstPixels = dst.data, xSize = src.width, ySize = src.height, xMid = opt.polarCenterX || xSize / 2, yMid = opt.polarCenterY || ySize / 2, i, x, y, dx, dy, r = 0, g = 0, b = 0, a = 0;
    var rad, rMax = Math.sqrt(xMid * xMid + yMid * yMid);
    x = xSize - xMid;
    y = ySize - yMid;
    rad = Math.sqrt(x * x + y * y);
    rMax = rad > rMax ? rad : rMax;
    var rSize = ySize, tSize = xSize, radius, theta, phaseShift = opt.polarRotation || 0;
    var x1, y1;
    for (x = 0; x < xSize; x += 1) {
        for (y = 0; y < ySize; y += 1) {
            dx = x - xMid;
            dy = y - yMid;
            radius = (Math.sqrt(dx * dx + dy * dy) * rSize) / rMax;
            theta = ((Math.atan2(dy, dx) * 180) / Math.PI + 360 + phaseShift) % 360;
            theta = (theta * tSize) / 360;
            x1 = Math.floor(theta);
            y1 = Math.floor(radius);
            i = (y1 * xSize + x1) * 4;
            r = srcPixels[i + 0];
            g = srcPixels[i + 1];
            b = srcPixels[i + 2];
            a = srcPixels[i + 3];
            i = (y * xSize + x) * 4;
            dstPixels[i + 0] = r;
            dstPixels[i + 1] = g;
            dstPixels[i + 2] = b;
            dstPixels[i + 3] = a;
        }
    }
};
exports.Kaleidoscope = function (imageData) {
    var xSize = imageData.width, ySize = imageData.height;
    var x, y, xoff, i, r, g, b, a, srcPos, dstPos;
    var power = Math.round(this.kaleidoscopePower());
    var angle = Math.round(this.kaleidoscopeAngle());
    var offset = Math.floor((xSize * (angle % 360)) / 360);
    if (power < 1) {
        return;
    }
    var tempCanvas = Util_1.Util.createCanvasElement();
    tempCanvas.width = xSize;
    tempCanvas.height = ySize;
    var scratchData = tempCanvas
        .getContext('2d')
        .getImageData(0, 0, xSize, ySize);
    ToPolar(imageData, scratchData, {
        polarCenterX: xSize / 2,
        polarCenterY: ySize / 2
    });
    var minSectionSize = xSize / Math.pow(2, power);
    while (minSectionSize <= 8) {
        minSectionSize = minSectionSize * 2;
        power -= 1;
    }
    minSectionSize = Math.ceil(minSectionSize);
    var sectionSize = minSectionSize;
    var xStart = 0, xEnd = sectionSize, xDelta = 1;
    if (offset + minSectionSize > xSize) {
        xStart = sectionSize;
        xEnd = 0;
        xDelta = -1;
    }
    for (y = 0; y < ySize; y += 1) {
        for (x = xStart; x !== xEnd; x += xDelta) {
            xoff = Math.round(x + offset) % xSize;
            srcPos = (xSize * y + xoff) * 4;
            r = scratchData.data[srcPos + 0];
            g = scratchData.data[srcPos + 1];
            b = scratchData.data[srcPos + 2];
            a = scratchData.data[srcPos + 3];
            dstPos = (xSize * y + x) * 4;
            scratchData.data[dstPos + 0] = r;
            scratchData.data[dstPos + 1] = g;
            scratchData.data[dstPos + 2] = b;
            scratchData.data[dstPos + 3] = a;
        }
    }
    for (y = 0; y < ySize; y += 1) {
        sectionSize = Math.floor(minSectionSize);
        for (i = 0; i < power; i += 1) {
            for (x = 0; x < sectionSize + 1; x += 1) {
                srcPos = (xSize * y + x) * 4;
                r = scratchData.data[srcPos + 0];
                g = scratchData.data[srcPos + 1];
                b = scratchData.data[srcPos + 2];
                a = scratchData.data[srcPos + 3];
                dstPos = (xSize * y + sectionSize * 2 - x - 1) * 4;
                scratchData.data[dstPos + 0] = r;
                scratchData.data[dstPos + 1] = g;
                scratchData.data[dstPos + 2] = b;
                scratchData.data[dstPos + 3] = a;
            }
            sectionSize *= 2;
        }
    }
    FromPolar(scratchData, imageData, { polarRotation: 0 });
};
Factory_1.Factory.addGetterSetter(Node_1.Node, 'kaleidoscopePower', 2, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);
Factory_1.Factory.addGetterSetter(Node_1.Node, 'kaleidoscopeAngle', 0, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);

},{"../Factory":16,"../Node":21,"../Util":26,"../Validators":27}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Factory_1 = require("../Factory");
var Node_1 = require("../Node");
var Validators_1 = require("../Validators");
function pixelAt(idata, x, y) {
    var idx = (y * idata.width + x) * 4;
    var d = [];
    d.push(idata.data[idx++], idata.data[idx++], idata.data[idx++], idata.data[idx++]);
    return d;
}
function rgbDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1[0] - p2[0], 2) +
        Math.pow(p1[1] - p2[1], 2) +
        Math.pow(p1[2] - p2[2], 2));
}
function rgbMean(pTab) {
    var m = [0, 0, 0];
    for (var i = 0; i < pTab.length; i++) {
        m[0] += pTab[i][0];
        m[1] += pTab[i][1];
        m[2] += pTab[i][2];
    }
    m[0] /= pTab.length;
    m[1] /= pTab.length;
    m[2] /= pTab.length;
    return m;
}
function backgroundMask(idata, threshold) {
    var rgbv_no = pixelAt(idata, 0, 0);
    var rgbv_ne = pixelAt(idata, idata.width - 1, 0);
    var rgbv_so = pixelAt(idata, 0, idata.height - 1);
    var rgbv_se = pixelAt(idata, idata.width - 1, idata.height - 1);
    var thres = threshold || 10;
    if (rgbDistance(rgbv_no, rgbv_ne) < thres &&
        rgbDistance(rgbv_ne, rgbv_se) < thres &&
        rgbDistance(rgbv_se, rgbv_so) < thres &&
        rgbDistance(rgbv_so, rgbv_no) < thres) {
        var mean = rgbMean([rgbv_ne, rgbv_no, rgbv_se, rgbv_so]);
        var mask = [];
        for (var i = 0; i < idata.width * idata.height; i++) {
            var d = rgbDistance(mean, [
                idata.data[i * 4],
                idata.data[i * 4 + 1],
                idata.data[i * 4 + 2]
            ]);
            mask[i] = d < thres ? 0 : 255;
        }
        return mask;
    }
}
function applyMask(idata, mask) {
    for (var i = 0; i < idata.width * idata.height; i++) {
        idata.data[4 * i + 3] = mask[i];
    }
}
function erodeMask(mask, sw, sh) {
    var weights = [1, 1, 1, 1, 0, 1, 1, 1, 1];
    var side = Math.round(Math.sqrt(weights.length));
    var halfSide = Math.floor(side / 2);
    var maskResult = [];
    for (var y = 0; y < sh; y++) {
        for (var x = 0; x < sw; x++) {
            var so = y * sw + x;
            var a = 0;
            for (var cy = 0; cy < side; cy++) {
                for (var cx = 0; cx < side; cx++) {
                    var scy = y + cy - halfSide;
                    var scx = x + cx - halfSide;
                    if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                        var srcOff = scy * sw + scx;
                        var wt = weights[cy * side + cx];
                        a += mask[srcOff] * wt;
                    }
                }
            }
            maskResult[so] = a === 255 * 8 ? 255 : 0;
        }
    }
    return maskResult;
}
function dilateMask(mask, sw, sh) {
    var weights = [1, 1, 1, 1, 1, 1, 1, 1, 1];
    var side = Math.round(Math.sqrt(weights.length));
    var halfSide = Math.floor(side / 2);
    var maskResult = [];
    for (var y = 0; y < sh; y++) {
        for (var x = 0; x < sw; x++) {
            var so = y * sw + x;
            var a = 0;
            for (var cy = 0; cy < side; cy++) {
                for (var cx = 0; cx < side; cx++) {
                    var scy = y + cy - halfSide;
                    var scx = x + cx - halfSide;
                    if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                        var srcOff = scy * sw + scx;
                        var wt = weights[cy * side + cx];
                        a += mask[srcOff] * wt;
                    }
                }
            }
            maskResult[so] = a >= 255 * 4 ? 255 : 0;
        }
    }
    return maskResult;
}
function smoothEdgeMask(mask, sw, sh) {
    var weights = [1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9];
    var side = Math.round(Math.sqrt(weights.length));
    var halfSide = Math.floor(side / 2);
    var maskResult = [];
    for (var y = 0; y < sh; y++) {
        for (var x = 0; x < sw; x++) {
            var so = y * sw + x;
            var a = 0;
            for (var cy = 0; cy < side; cy++) {
                for (var cx = 0; cx < side; cx++) {
                    var scy = y + cy - halfSide;
                    var scx = x + cx - halfSide;
                    if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                        var srcOff = scy * sw + scx;
                        var wt = weights[cy * side + cx];
                        a += mask[srcOff] * wt;
                    }
                }
            }
            maskResult[so] = a;
        }
    }
    return maskResult;
}
exports.Mask = function (imageData) {
    var threshold = this.threshold(), mask = backgroundMask(imageData, threshold);
    if (mask) {
        mask = erodeMask(mask, imageData.width, imageData.height);
        mask = dilateMask(mask, imageData.width, imageData.height);
        mask = smoothEdgeMask(mask, imageData.width, imageData.height);
        applyMask(imageData, mask);
    }
    return imageData;
};
Factory_1.Factory.addGetterSetter(Node_1.Node, 'threshold', 0, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);

},{"../Factory":16,"../Node":21,"../Validators":27}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Factory_1 = require("../Factory");
var Node_1 = require("../Node");
var Validators_1 = require("../Validators");
exports.Noise = function (imageData) {
    var amount = this.noise() * 255, data = imageData.data, nPixels = data.length, half = amount / 2, i;
    for (i = 0; i < nPixels; i += 4) {
        data[i + 0] += half - 2 * half * Math.random();
        data[i + 1] += half - 2 * half * Math.random();
        data[i + 2] += half - 2 * half * Math.random();
    }
};
Factory_1.Factory.addGetterSetter(Node_1.Node, 'noise', 0.2, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);

},{"../Factory":16,"../Node":21,"../Validators":27}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Factory_1 = require("../Factory");
var Util_1 = require("../Util");
var Node_1 = require("../Node");
var Validators_1 = require("../Validators");
exports.Pixelate = function (imageData) {
    var pixelSize = Math.ceil(this.pixelSize()), width = imageData.width, height = imageData.height, x, y, i, red, green, blue, alpha, nBinsX = Math.ceil(width / pixelSize), nBinsY = Math.ceil(height / pixelSize), xBinStart, xBinEnd, yBinStart, yBinEnd, xBin, yBin, pixelsInBin, data = imageData.data;
    if (pixelSize <= 0) {
        Util_1.Util.error('pixelSize value can not be <= 0');
        return;
    }
    for (xBin = 0; xBin < nBinsX; xBin += 1) {
        for (yBin = 0; yBin < nBinsY; yBin += 1) {
            red = 0;
            green = 0;
            blue = 0;
            alpha = 0;
            xBinStart = xBin * pixelSize;
            xBinEnd = xBinStart + pixelSize;
            yBinStart = yBin * pixelSize;
            yBinEnd = yBinStart + pixelSize;
            pixelsInBin = 0;
            for (x = xBinStart; x < xBinEnd; x += 1) {
                if (x >= width) {
                    continue;
                }
                for (y = yBinStart; y < yBinEnd; y += 1) {
                    if (y >= height) {
                        continue;
                    }
                    i = (width * y + x) * 4;
                    red += data[i + 0];
                    green += data[i + 1];
                    blue += data[i + 2];
                    alpha += data[i + 3];
                    pixelsInBin += 1;
                }
            }
            red = red / pixelsInBin;
            green = green / pixelsInBin;
            blue = blue / pixelsInBin;
            alpha = alpha / pixelsInBin;
            for (x = xBinStart; x < xBinEnd; x += 1) {
                if (x >= width) {
                    continue;
                }
                for (y = yBinStart; y < yBinEnd; y += 1) {
                    if (y >= height) {
                        continue;
                    }
                    i = (width * y + x) * 4;
                    data[i + 0] = red;
                    data[i + 1] = green;
                    data[i + 2] = blue;
                    data[i + 3] = alpha;
                }
            }
        }
    }
};
Factory_1.Factory.addGetterSetter(Node_1.Node, 'pixelSize', 8, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);

},{"../Factory":16,"../Node":21,"../Util":26,"../Validators":27}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Factory_1 = require("../Factory");
var Node_1 = require("../Node");
var Validators_1 = require("../Validators");
exports.Posterize = function (imageData) {
    var levels = Math.round(this.levels() * 254) + 1, data = imageData.data, len = data.length, scale = 255 / levels, i;
    for (i = 0; i < len; i += 1) {
        data[i] = Math.floor(data[i] / scale) * scale;
    }
};
Factory_1.Factory.addGetterSetter(Node_1.Node, 'levels', 0.5, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);

},{"../Factory":16,"../Node":21,"../Validators":27}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Factory_1 = require("../Factory");
var Node_1 = require("../Node");
var Validators_1 = require("../Validators");
exports.RGB = function (imageData) {
    var data = imageData.data, nPixels = data.length, red = this.red(), green = this.green(), blue = this.blue(), i, brightness;
    for (i = 0; i < nPixels; i += 4) {
        brightness =
            (0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2]) / 255;
        data[i] = brightness * red;
        data[i + 1] = brightness * green;
        data[i + 2] = brightness * blue;
        data[i + 3] = data[i + 3];
    }
};
Factory_1.Factory.addGetterSetter(Node_1.Node, 'red', 0, function (val) {
    this._filterUpToDate = false;
    if (val > 255) {
        return 255;
    }
    else if (val < 0) {
        return 0;
    }
    else {
        return Math.round(val);
    }
});
Factory_1.Factory.addGetterSetter(Node_1.Node, 'green', 0, function (val) {
    this._filterUpToDate = false;
    if (val > 255) {
        return 255;
    }
    else if (val < 0) {
        return 0;
    }
    else {
        return Math.round(val);
    }
});
Factory_1.Factory.addGetterSetter(Node_1.Node, 'blue', 0, Validators_1.RGBComponent, Factory_1.Factory.afterSetFilter);

},{"../Factory":16,"../Node":21,"../Validators":27}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Factory_1 = require("../Factory");
var Node_1 = require("../Node");
var Validators_1 = require("../Validators");
exports.RGBA = function (imageData) {
    var data = imageData.data, nPixels = data.length, red = this.red(), green = this.green(), blue = this.blue(), alpha = this.alpha(), i, ia;
    for (i = 0; i < nPixels; i += 4) {
        ia = 1 - alpha;
        data[i] = red * alpha + data[i] * ia;
        data[i + 1] = green * alpha + data[i + 1] * ia;
        data[i + 2] = blue * alpha + data[i + 2] * ia;
    }
};
Factory_1.Factory.addGetterSetter(Node_1.Node, 'red', 0, function (val) {
    this._filterUpToDate = false;
    if (val > 255) {
        return 255;
    }
    else if (val < 0) {
        return 0;
    }
    else {
        return Math.round(val);
    }
});
Factory_1.Factory.addGetterSetter(Node_1.Node, 'green', 0, function (val) {
    this._filterUpToDate = false;
    if (val > 255) {
        return 255;
    }
    else if (val < 0) {
        return 0;
    }
    else {
        return Math.round(val);
    }
});
Factory_1.Factory.addGetterSetter(Node_1.Node, 'blue', 0, Validators_1.RGBComponent, Factory_1.Factory.afterSetFilter);
Factory_1.Factory.addGetterSetter(Node_1.Node, 'alpha', 1, function (val) {
    this._filterUpToDate = false;
    if (val > 1) {
        return 1;
    }
    else if (val < 0) {
        return 0;
    }
    else {
        return val;
    }
});

},{"../Factory":16,"../Node":21,"../Validators":27}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sepia = function (imageData) {
    var data = imageData.data, nPixels = data.length, i, r, g, b;
    for (i = 0; i < nPixels; i += 4) {
        r = data[i + 0];
        g = data[i + 1];
        b = data[i + 2];
        data[i + 0] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
        data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
        data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    }
};

},{}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Solarize = function (imageData) {
    var data = imageData.data, w = imageData.width, h = imageData.height, w4 = w * 4, y = h;
    do {
        var offsetY = (y - 1) * w4;
        var x = w;
        do {
            var offset = offsetY + (x - 1) * 4;
            var r = data[offset];
            var g = data[offset + 1];
            var b = data[offset + 2];
            if (r > 127) {
                r = 255 - r;
            }
            if (g > 127) {
                g = 255 - g;
            }
            if (b > 127) {
                b = 255 - b;
            }
            data[offset] = r;
            data[offset + 1] = g;
            data[offset + 2] = b;
        } while (--x);
    } while (--y);
};

},{}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Factory_1 = require("../Factory");
var Node_1 = require("../Node");
var Validators_1 = require("../Validators");
exports.Threshold = function (imageData) {
    var level = this.threshold() * 255, data = imageData.data, len = data.length, i;
    for (i = 0; i < len; i += 1) {
        data[i] = data[i] < level ? 0 : 255;
    }
};
Factory_1.Factory.addGetterSetter(Node_1.Node, 'threshold', 0.5, Validators_1.getNumberValidator(), Factory_1.Factory.afterSetFilter);

},{"../Factory":16,"../Node":21,"../Validators":27}],49:[function(require,module,exports){
var Konva = require('./_FullInternals').Konva;
Konva._injectGlobal(Konva);
exports['default'] = Konva;
module.exports = exports['default'];

},{"./_FullInternals":29}],50:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("../Util");
var Factory_1 = require("../Factory");
var Shape_1 = require("../Shape");
var Global_1 = require("../Global");
var Validators_1 = require("../Validators");
var Global_2 = require("../Global");
var Arc = (function (_super) {
    __extends(Arc, _super);
    function Arc() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Arc.prototype._sceneFunc = function (context) {
        var angle = Global_1.Konva.getAngle(this.angle()), clockwise = this.clockwise();
        context.beginPath();
        context.arc(0, 0, this.outerRadius(), 0, angle, clockwise);
        context.arc(0, 0, this.innerRadius(), angle, 0, !clockwise);
        context.closePath();
        context.fillStrokeShape(this);
    };
    Arc.prototype.getWidth = function () {
        return this.outerRadius() * 2;
    };
    Arc.prototype.getHeight = function () {
        return this.outerRadius() * 2;
    };
    Arc.prototype.setWidth = function (width) {
        this.outerRadius(width / 2);
    };
    Arc.prototype.setHeight = function (height) {
        this.outerRadius(height / 2);
    };
    return Arc;
}(Shape_1.Shape));
exports.Arc = Arc;
Arc.prototype._centroid = true;
Arc.prototype.className = 'Arc';
Arc.prototype._attrsAffectingSize = ['innerRadius', 'outerRadius'];
Global_2._registerNode(Arc);
Factory_1.Factory.addGetterSetter(Arc, 'innerRadius', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Arc, 'outerRadius', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Arc, 'angle', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Arc, 'clockwise', false, Validators_1.getBooleanValidator());
Util_1.Collection.mapMethods(Arc);

},{"../Factory":16,"../Global":18,"../Shape":23,"../Util":26,"../Validators":27}],51:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("../Util");
var Factory_1 = require("../Factory");
var Line_1 = require("./Line");
var Validators_1 = require("../Validators");
var Global_1 = require("../Global");
var Arrow = (function (_super) {
    __extends(Arrow, _super);
    function Arrow() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Arrow.prototype._sceneFunc = function (ctx) {
        _super.prototype._sceneFunc.call(this, ctx);
        var PI2 = Math.PI * 2;
        var points = this.points();
        var tp = points;
        var fromTension = this.tension() !== 0 && points.length > 4;
        if (fromTension) {
            tp = this.getTensionPoints();
        }
        var n = points.length;
        var dx, dy;
        if (fromTension) {
            dx = points[n - 2] - (tp[tp.length - 2] + tp[tp.length - 4]) / 2;
            dy = points[n - 1] - (tp[tp.length - 1] + tp[tp.length - 3]) / 2;
        }
        else {
            dx = points[n - 2] - points[n - 4];
            dy = points[n - 1] - points[n - 3];
        }
        var radians = (Math.atan2(dy, dx) + PI2) % PI2;
        var length = this.pointerLength();
        var width = this.pointerWidth();
        ctx.save();
        ctx.beginPath();
        ctx.translate(points[n - 2], points[n - 1]);
        ctx.rotate(radians);
        ctx.moveTo(0, 0);
        ctx.lineTo(-length, width / 2);
        ctx.lineTo(-length, -width / 2);
        ctx.closePath();
        ctx.restore();
        if (this.pointerAtBeginning()) {
            ctx.save();
            ctx.translate(points[0], points[1]);
            if (fromTension) {
                dx = (tp[0] + tp[2]) / 2 - points[0];
                dy = (tp[1] + tp[3]) / 2 - points[1];
            }
            else {
                dx = points[2] - points[0];
                dy = points[3] - points[1];
            }
            ctx.rotate((Math.atan2(-dy, -dx) + PI2) % PI2);
            ctx.moveTo(0, 0);
            ctx.lineTo(-length, width / 2);
            ctx.lineTo(-length, -width / 2);
            ctx.closePath();
            ctx.restore();
        }
        var isDashEnabled = this.dashEnabled();
        if (isDashEnabled) {
            this.attrs.dashEnabled = false;
            ctx.setLineDash([]);
        }
        ctx.fillStrokeShape(this);
        if (isDashEnabled) {
            this.attrs.dashEnabled = true;
        }
    };
    Arrow.prototype.getSelfRect = function () {
        var lineRect = _super.prototype.getSelfRect.call(this);
        var offset = this.pointerWidth() / 2;
        return {
            x: lineRect.x - offset,
            y: lineRect.y - offset,
            width: lineRect.width + offset * 2,
            height: lineRect.height + offset * 2
        };
    };
    return Arrow;
}(Line_1.Line));
exports.Arrow = Arrow;
Arrow.prototype.className = 'Arrow';
Global_1._registerNode(Arrow);
Factory_1.Factory.addGetterSetter(Arrow, 'pointerLength', 10, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Arrow, 'pointerWidth', 10, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Arrow, 'pointerAtBeginning', false);
Util_1.Collection.mapMethods(Arrow);

},{"../Factory":16,"../Global":18,"../Util":26,"../Validators":27,"./Line":56}],52:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("../Util");
var Factory_1 = require("../Factory");
var Shape_1 = require("../Shape");
var Validators_1 = require("../Validators");
var Global_1 = require("../Global");
var Circle = (function (_super) {
    __extends(Circle, _super);
    function Circle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Circle.prototype._sceneFunc = function (context) {
        context.beginPath();
        context.arc(0, 0, this.radius(), 0, Math.PI * 2, false);
        context.closePath();
        context.fillStrokeShape(this);
    };
    Circle.prototype.getWidth = function () {
        return this.radius() * 2;
    };
    Circle.prototype.getHeight = function () {
        return this.radius() * 2;
    };
    Circle.prototype.setWidth = function (width) {
        if (this.radius() !== width / 2) {
            this.radius(width / 2);
        }
    };
    Circle.prototype.setHeight = function (height) {
        if (this.radius() !== height / 2) {
            this.radius(height / 2);
        }
    };
    return Circle;
}(Shape_1.Shape));
exports.Circle = Circle;
Circle.prototype._centroid = true;
Circle.prototype.className = 'Circle';
Circle.prototype._attrsAffectingSize = ['radius'];
Global_1._registerNode(Circle);
Factory_1.Factory.addGetterSetter(Circle, 'radius', 0, Validators_1.getNumberValidator());
Util_1.Collection.mapMethods(Circle);

},{"../Factory":16,"../Global":18,"../Shape":23,"../Util":26,"../Validators":27}],53:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("../Util");
var Factory_1 = require("../Factory");
var Shape_1 = require("../Shape");
var Validators_1 = require("../Validators");
var Global_1 = require("../Global");
var Ellipse = (function (_super) {
    __extends(Ellipse, _super);
    function Ellipse() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Ellipse.prototype._sceneFunc = function (context) {
        var rx = this.radiusX(), ry = this.radiusY();
        context.beginPath();
        context.save();
        if (rx !== ry) {
            context.scale(1, ry / rx);
        }
        context.arc(0, 0, rx, 0, Math.PI * 2, false);
        context.restore();
        context.closePath();
        context.fillStrokeShape(this);
    };
    Ellipse.prototype.getWidth = function () {
        return this.radiusX() * 2;
    };
    Ellipse.prototype.getHeight = function () {
        return this.radiusY() * 2;
    };
    Ellipse.prototype.setWidth = function (width) {
        this.radiusX(width / 2);
    };
    Ellipse.prototype.setHeight = function (height) {
        this.radiusY(height / 2);
    };
    return Ellipse;
}(Shape_1.Shape));
exports.Ellipse = Ellipse;
Ellipse.prototype.className = 'Ellipse';
Ellipse.prototype._centroid = true;
Ellipse.prototype._attrsAffectingSize = ['radiusX', 'radiusY'];
Global_1._registerNode(Ellipse);
Factory_1.Factory.addComponentsGetterSetter(Ellipse, 'radius', ['x', 'y']);
Factory_1.Factory.addGetterSetter(Ellipse, 'radiusX', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Ellipse, 'radiusY', 0, Validators_1.getNumberValidator());
Util_1.Collection.mapMethods(Ellipse);

},{"../Factory":16,"../Global":18,"../Shape":23,"../Util":26,"../Validators":27}],54:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("../Util");
var Factory_1 = require("../Factory");
var Shape_1 = require("../Shape");
var Validators_1 = require("../Validators");
var Global_1 = require("../Global");
var Image = (function (_super) {
    __extends(Image, _super);
    function Image() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Image.prototype._useBufferCanvas = function () {
        return !!((this.hasShadow() || this.getAbsoluteOpacity() !== 1) &&
            this.hasStroke() &&
            this.getStage());
    };
    Image.prototype._sceneFunc = function (context) {
        var width = this.width(), height = this.height(), image = this.image(), cropWidth, cropHeight, params;
        if (image) {
            cropWidth = this.cropWidth();
            cropHeight = this.cropHeight();
            if (cropWidth && cropHeight) {
                params = [
                    image,
                    this.cropX(),
                    this.cropY(),
                    cropWidth,
                    cropHeight,
                    0,
                    0,
                    width,
                    height
                ];
            }
            else {
                params = [image, 0, 0, width, height];
            }
        }
        if (this.hasFill() || this.hasStroke()) {
            context.beginPath();
            context.rect(0, 0, width, height);
            context.closePath();
            context.fillStrokeShape(this);
        }
        if (image) {
            context.drawImage.apply(context, params);
        }
    };
    Image.prototype._hitFunc = function (context) {
        var width = this.width(), height = this.height();
        context.beginPath();
        context.rect(0, 0, width, height);
        context.closePath();
        context.fillStrokeShape(this);
    };
    Image.prototype.getWidth = function () {
        var _a;
        var image = this.image();
        return (_a = this.attrs.width) !== null && _a !== void 0 ? _a : (image ? image.width : 0);
    };
    Image.prototype.getHeight = function () {
        var _a;
        var image = this.image();
        return (_a = this.attrs.height) !== null && _a !== void 0 ? _a : (image ? image.height : 0);
    };
    Image.fromURL = function (url, callback) {
        var img = Util_1.Util.createImageElement();
        img.onload = function () {
            var image = new Image({
                image: img
            });
            callback(image);
        };
        img.crossOrigin = 'Anonymous';
        img.src = url;
    };
    return Image;
}(Shape_1.Shape));
exports.Image = Image;
Image.prototype.className = 'Image';
Global_1._registerNode(Image);
Factory_1.Factory.addGetterSetter(Image, 'image');
Factory_1.Factory.addComponentsGetterSetter(Image, 'crop', ['x', 'y', 'width', 'height']);
Factory_1.Factory.addGetterSetter(Image, 'cropX', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Image, 'cropY', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Image, 'cropWidth', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Image, 'cropHeight', 0, Validators_1.getNumberValidator());
Util_1.Collection.mapMethods(Image);

},{"../Factory":16,"../Global":18,"../Shape":23,"../Util":26,"../Validators":27}],55:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("../Util");
var Factory_1 = require("../Factory");
var Shape_1 = require("../Shape");
var Group_1 = require("../Group");
var Validators_1 = require("../Validators");
var Global_1 = require("../Global");
var ATTR_CHANGE_LIST = [
    'fontFamily',
    'fontSize',
    'fontStyle',
    'padding',
    'lineHeight',
    'text',
    'width'
], CHANGE_KONVA = 'Change.konva', NONE = 'none', UP = 'up', RIGHT = 'right', DOWN = 'down', LEFT = 'left', attrChangeListLen = ATTR_CHANGE_LIST.length;
var Label = (function (_super) {
    __extends(Label, _super);
    function Label(config) {
        var _this = _super.call(this, config) || this;
        _this.on('add.konva', function (evt) {
            this._addListeners(evt.child);
            this._sync();
        });
        return _this;
    }
    Label.prototype.getText = function () {
        return this.find('Text')[0];
    };
    Label.prototype.getTag = function () {
        return this.find('Tag')[0];
    };
    Label.prototype._addListeners = function (text) {
        var that = this, n;
        var func = function () {
            that._sync();
        };
        for (n = 0; n < attrChangeListLen; n++) {
            text.on(ATTR_CHANGE_LIST[n] + CHANGE_KONVA, func);
        }
    };
    Label.prototype.getWidth = function () {
        return this.getText().width();
    };
    Label.prototype.getHeight = function () {
        return this.getText().height();
    };
    Label.prototype._sync = function () {
        var text = this.getText(), tag = this.getTag(), width, height, pointerDirection, pointerWidth, x, y, pointerHeight;
        if (text && tag) {
            width = text.width();
            height = text.height();
            pointerDirection = tag.pointerDirection();
            pointerWidth = tag.pointerWidth();
            pointerHeight = tag.pointerHeight();
            x = 0;
            y = 0;
            switch (pointerDirection) {
                case UP:
                    x = width / 2;
                    y = -1 * pointerHeight;
                    break;
                case RIGHT:
                    x = width + pointerWidth;
                    y = height / 2;
                    break;
                case DOWN:
                    x = width / 2;
                    y = height + pointerHeight;
                    break;
                case LEFT:
                    x = -1 * pointerWidth;
                    y = height / 2;
                    break;
            }
            tag.setAttrs({
                x: -1 * x,
                y: -1 * y,
                width: width,
                height: height
            });
            text.setAttrs({
                x: -1 * x,
                y: -1 * y
            });
        }
    };
    return Label;
}(Group_1.Group));
exports.Label = Label;
Label.prototype.className = 'Label';
Global_1._registerNode(Label);
Util_1.Collection.mapMethods(Label);
var Tag = (function (_super) {
    __extends(Tag, _super);
    function Tag() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Tag.prototype._sceneFunc = function (context) {
        var width = this.width(), height = this.height(), pointerDirection = this.pointerDirection(), pointerWidth = this.pointerWidth(), pointerHeight = this.pointerHeight(), cornerRadius = Math.min(this.cornerRadius(), width / 2, height / 2);
        context.beginPath();
        if (!cornerRadius) {
            context.moveTo(0, 0);
        }
        else {
            context.moveTo(cornerRadius, 0);
        }
        if (pointerDirection === UP) {
            context.lineTo((width - pointerWidth) / 2, 0);
            context.lineTo(width / 2, -1 * pointerHeight);
            context.lineTo((width + pointerWidth) / 2, 0);
        }
        if (!cornerRadius) {
            context.lineTo(width, 0);
        }
        else {
            context.lineTo(width - cornerRadius, 0);
            context.arc(width - cornerRadius, cornerRadius, cornerRadius, (Math.PI * 3) / 2, 0, false);
        }
        if (pointerDirection === RIGHT) {
            context.lineTo(width, (height - pointerHeight) / 2);
            context.lineTo(width + pointerWidth, height / 2);
            context.lineTo(width, (height + pointerHeight) / 2);
        }
        if (!cornerRadius) {
            context.lineTo(width, height);
        }
        else {
            context.lineTo(width, height - cornerRadius);
            context.arc(width - cornerRadius, height - cornerRadius, cornerRadius, 0, Math.PI / 2, false);
        }
        if (pointerDirection === DOWN) {
            context.lineTo((width + pointerWidth) / 2, height);
            context.lineTo(width / 2, height + pointerHeight);
            context.lineTo((width - pointerWidth) / 2, height);
        }
        if (!cornerRadius) {
            context.lineTo(0, height);
        }
        else {
            context.lineTo(cornerRadius, height);
            context.arc(cornerRadius, height - cornerRadius, cornerRadius, Math.PI / 2, Math.PI, false);
        }
        if (pointerDirection === LEFT) {
            context.lineTo(0, (height + pointerHeight) / 2);
            context.lineTo(-1 * pointerWidth, height / 2);
            context.lineTo(0, (height - pointerHeight) / 2);
        }
        if (cornerRadius) {
            context.lineTo(0, cornerRadius);
            context.arc(cornerRadius, cornerRadius, cornerRadius, Math.PI, (Math.PI * 3) / 2, false);
        }
        context.closePath();
        context.fillStrokeShape(this);
    };
    Tag.prototype.getSelfRect = function () {
        var x = 0, y = 0, pointerWidth = this.pointerWidth(), pointerHeight = this.pointerHeight(), direction = this.pointerDirection(), width = this.width(), height = this.height();
        if (direction === UP) {
            y -= pointerHeight;
            height += pointerHeight;
        }
        else if (direction === DOWN) {
            height += pointerHeight;
        }
        else if (direction === LEFT) {
            x -= pointerWidth * 1.5;
            width += pointerWidth;
        }
        else if (direction === RIGHT) {
            width += pointerWidth * 1.5;
        }
        return {
            x: x,
            y: y,
            width: width,
            height: height
        };
    };
    return Tag;
}(Shape_1.Shape));
exports.Tag = Tag;
Tag.prototype.className = 'Tag';
Global_1._registerNode(Tag);
Factory_1.Factory.addGetterSetter(Tag, 'pointerDirection', NONE);
Factory_1.Factory.addGetterSetter(Tag, 'pointerWidth', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Tag, 'pointerHeight', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Tag, 'cornerRadius', 0, Validators_1.getNumberValidator());
Util_1.Collection.mapMethods(Tag);

},{"../Factory":16,"../Global":18,"../Group":19,"../Shape":23,"../Util":26,"../Validators":27}],56:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("../Util");
var Factory_1 = require("../Factory");
var Shape_1 = require("../Shape");
var Validators_1 = require("../Validators");
var Global_1 = require("../Global");
var Line = (function (_super) {
    __extends(Line, _super);
    function Line(config) {
        var _this = _super.call(this, config) || this;
        _this.on('pointsChange.konva tensionChange.konva closedChange.konva bezierChange.konva', function () {
            this._clearCache('tensionPoints');
        });
        return _this;
    }
    Line.prototype._sceneFunc = function (context) {
        var points = this.points(), length = points.length, tension = this.tension(), closed = this.closed(), bezier = this.bezier(), tp, len, n;
        if (!length) {
            return;
        }
        context.beginPath();
        context.moveTo(points[0], points[1]);
        if (tension !== 0 && length > 4) {
            tp = this.getTensionPoints();
            len = tp.length;
            n = closed ? 0 : 4;
            if (!closed) {
                context.quadraticCurveTo(tp[0], tp[1], tp[2], tp[3]);
            }
            while (n < len - 2) {
                context.bezierCurveTo(tp[n++], tp[n++], tp[n++], tp[n++], tp[n++], tp[n++]);
            }
            if (!closed) {
                context.quadraticCurveTo(tp[len - 2], tp[len - 1], points[length - 2], points[length - 1]);
            }
        }
        else if (bezier) {
            n = 2;
            while (n < length) {
                context.bezierCurveTo(points[n++], points[n++], points[n++], points[n++], points[n++], points[n++]);
            }
        }
        else {
            for (n = 2; n < length; n += 2) {
                context.lineTo(points[n], points[n + 1]);
            }
        }
        if (closed) {
            context.closePath();
            context.fillStrokeShape(this);
        }
        else {
            context.strokeShape(this);
        }
    };
    Line.prototype.getTensionPoints = function () {
        return this._getCache('tensionPoints', this._getTensionPoints);
    };
    Line.prototype._getTensionPoints = function () {
        if (this.closed()) {
            return this._getTensionPointsClosed();
        }
        else {
            return Util_1.Util._expandPoints(this.points(), this.tension());
        }
    };
    Line.prototype._getTensionPointsClosed = function () {
        var p = this.points(), len = p.length, tension = this.tension(), firstControlPoints = Util_1.Util._getControlPoints(p[len - 2], p[len - 1], p[0], p[1], p[2], p[3], tension), lastControlPoints = Util_1.Util._getControlPoints(p[len - 4], p[len - 3], p[len - 2], p[len - 1], p[0], p[1], tension), middle = Util_1.Util._expandPoints(p, tension), tp = [firstControlPoints[2], firstControlPoints[3]]
            .concat(middle)
            .concat([
            lastControlPoints[0],
            lastControlPoints[1],
            p[len - 2],
            p[len - 1],
            lastControlPoints[2],
            lastControlPoints[3],
            firstControlPoints[0],
            firstControlPoints[1],
            p[0],
            p[1]
        ]);
        return tp;
    };
    Line.prototype.getWidth = function () {
        return this.getSelfRect().width;
    };
    Line.prototype.getHeight = function () {
        return this.getSelfRect().height;
    };
    Line.prototype.getSelfRect = function () {
        var points = this.points();
        if (points.length < 4) {
            return {
                x: points[0] || 0,
                y: points[1] || 0,
                width: 0,
                height: 0
            };
        }
        if (this.tension() !== 0) {
            points = __spreadArrays([
                points[0],
                points[1]
            ], this._getTensionPoints(), [
                points[points.length - 2],
                points[points.length - 1]
            ]);
        }
        else {
            points = this.points();
        }
        var minX = points[0];
        var maxX = points[0];
        var minY = points[1];
        var maxY = points[1];
        var x, y;
        for (var i = 0; i < points.length / 2; i++) {
            x = points[i * 2];
            y = points[i * 2 + 1];
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    };
    return Line;
}(Shape_1.Shape));
exports.Line = Line;
Line.prototype.className = 'Line';
Line.prototype._attrsAffectingSize = ['points', 'bezier', 'tension'];
Global_1._registerNode(Line);
Factory_1.Factory.addGetterSetter(Line, 'closed', false);
Factory_1.Factory.addGetterSetter(Line, 'bezier', false);
Factory_1.Factory.addGetterSetter(Line, 'tension', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Line, 'points', [], Validators_1.getNumberArrayValidator());
Util_1.Collection.mapMethods(Line);

},{"../Factory":16,"../Global":18,"../Shape":23,"../Util":26,"../Validators":27}],57:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("../Util");
var Factory_1 = require("../Factory");
var Shape_1 = require("../Shape");
var Global_1 = require("../Global");
var Path = (function (_super) {
    __extends(Path, _super);
    function Path(config) {
        var _this = _super.call(this, config) || this;
        _this.dataArray = [];
        _this.pathLength = 0;
        _this.dataArray = Path.parsePathData(_this.data());
        _this.pathLength = 0;
        for (var i = 0; i < _this.dataArray.length; ++i) {
            _this.pathLength += _this.dataArray[i].pathLength;
        }
        _this.on('dataChange.konva', function () {
            this.dataArray = Path.parsePathData(this.data());
            this.pathLength = 0;
            for (var i = 0; i < this.dataArray.length; ++i) {
                this.pathLength += this.dataArray[i].pathLength;
            }
        });
        return _this;
    }
    Path.prototype._sceneFunc = function (context) {
        var ca = this.dataArray;
        context.beginPath();
        var isClosed = false;
        for (var n = 0; n < ca.length; n++) {
            var c = ca[n].command;
            var p = ca[n].points;
            switch (c) {
                case 'L':
                    context.lineTo(p[0], p[1]);
                    break;
                case 'M':
                    context.moveTo(p[0], p[1]);
                    break;
                case 'C':
                    context.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]);
                    break;
                case 'Q':
                    context.quadraticCurveTo(p[0], p[1], p[2], p[3]);
                    break;
                case 'A':
                    var cx = p[0], cy = p[1], rx = p[2], ry = p[3], theta = p[4], dTheta = p[5], psi = p[6], fs = p[7];
                    var r = rx > ry ? rx : ry;
                    var scaleX = rx > ry ? 1 : rx / ry;
                    var scaleY = rx > ry ? ry / rx : 1;
                    context.translate(cx, cy);
                    context.rotate(psi);
                    context.scale(scaleX, scaleY);
                    context.arc(0, 0, r, theta, theta + dTheta, 1 - fs);
                    context.scale(1 / scaleX, 1 / scaleY);
                    context.rotate(-psi);
                    context.translate(-cx, -cy);
                    break;
                case 'z':
                    isClosed = true;
                    context.closePath();
                    break;
            }
        }
        if (!isClosed && !this.hasFill()) {
            context.strokeShape(this);
        }
        else {
            context.fillStrokeShape(this);
        }
    };
    Path.prototype.getSelfRect = function () {
        var points = [];
        this.dataArray.forEach(function (data) {
            if (data.command === 'A') {
                var start = data.points[4];
                var dTheta = data.points[5];
                var end = data.points[4] + dTheta;
                var inc = Math.PI / 180.0;
                if (Math.abs(start - end) < inc) {
                    inc = Math.abs(start - end);
                }
                if (dTheta < 0) {
                    for (var t = start - inc; t > end; t -= inc) {
                        var point = Path.getPointOnEllipticalArc(data.points[0], data.points[1], data.points[2], data.points[3], t, 0);
                        points.push(point.x, point.y);
                    }
                }
                else {
                    for (var t = start + inc; t < end; t += inc) {
                        var point = Path.getPointOnEllipticalArc(data.points[0], data.points[1], data.points[2], data.points[3], t, 0);
                        points.push(point.x, point.y);
                    }
                }
            }
            else if (data.command === 'C') {
                for (var t = 0.0; t <= 1; t += 0.01) {
                    var point = Path.getPointOnCubicBezier(t, data.start.x, data.start.y, data.points[0], data.points[1], data.points[2], data.points[3], data.points[4], data.points[5]);
                    points.push(point.x, point.y);
                }
            }
            else {
                points = points.concat(data.points);
            }
        });
        var minX = points[0];
        var maxX = points[0];
        var minY = points[1];
        var maxY = points[1];
        var x, y;
        for (var i = 0; i < points.length / 2; i++) {
            x = points[i * 2];
            y = points[i * 2 + 1];
            if (!isNaN(x)) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
            }
            if (!isNaN(y)) {
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            }
        }
        return {
            x: Math.round(minX),
            y: Math.round(minY),
            width: Math.round(maxX - minX),
            height: Math.round(maxY - minY)
        };
    };
    Path.prototype.getLength = function () {
        return this.pathLength;
    };
    Path.prototype.getPointAtLength = function (length) {
        var point, i = 0, ii = this.dataArray.length;
        if (!ii) {
            return null;
        }
        while (i < ii && length > this.dataArray[i].pathLength) {
            length -= this.dataArray[i].pathLength;
            ++i;
        }
        if (i === ii) {
            point = this.dataArray[i - 1].points.slice(-2);
            return {
                x: point[0],
                y: point[1]
            };
        }
        if (length < 0.01) {
            point = this.dataArray[i].points.slice(0, 2);
            return {
                x: point[0],
                y: point[1]
            };
        }
        var cp = this.dataArray[i];
        var p = cp.points;
        switch (cp.command) {
            case 'L':
                return Path.getPointOnLine(length, cp.start.x, cp.start.y, p[0], p[1]);
            case 'C':
                return Path.getPointOnCubicBezier(length / cp.pathLength, cp.start.x, cp.start.y, p[0], p[1], p[2], p[3], p[4], p[5]);
            case 'Q':
                return Path.getPointOnQuadraticBezier(length / cp.pathLength, cp.start.x, cp.start.y, p[0], p[1], p[2], p[3]);
            case 'A':
                var cx = p[0], cy = p[1], rx = p[2], ry = p[3], theta = p[4], dTheta = p[5], psi = p[6];
                theta += (dTheta * length) / cp.pathLength;
                return Path.getPointOnEllipticalArc(cx, cy, rx, ry, theta, psi);
        }
        return null;
    };
    Path.getLineLength = function (x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    };
    Path.getPointOnLine = function (dist, P1x, P1y, P2x, P2y, fromX, fromY) {
        if (fromX === undefined) {
            fromX = P1x;
        }
        if (fromY === undefined) {
            fromY = P1y;
        }
        var m = (P2y - P1y) / (P2x - P1x + 0.00000001);
        var run = Math.sqrt((dist * dist) / (1 + m * m));
        if (P2x < P1x) {
            run *= -1;
        }
        var rise = m * run;
        var pt;
        if (P2x === P1x) {
            pt = {
                x: fromX,
                y: fromY + rise
            };
        }
        else if ((fromY - P1y) / (fromX - P1x + 0.00000001) === m) {
            pt = {
                x: fromX + run,
                y: fromY + rise
            };
        }
        else {
            var ix, iy;
            var len = this.getLineLength(P1x, P1y, P2x, P2y);
            if (len < 0.00000001) {
                return undefined;
            }
            var u = (fromX - P1x) * (P2x - P1x) + (fromY - P1y) * (P2y - P1y);
            u = u / (len * len);
            ix = P1x + u * (P2x - P1x);
            iy = P1y + u * (P2y - P1y);
            var pRise = this.getLineLength(fromX, fromY, ix, iy);
            var pRun = Math.sqrt(dist * dist - pRise * pRise);
            run = Math.sqrt((pRun * pRun) / (1 + m * m));
            if (P2x < P1x) {
                run *= -1;
            }
            rise = m * run;
            pt = {
                x: ix + run,
                y: iy + rise
            };
        }
        return pt;
    };
    Path.getPointOnCubicBezier = function (pct, P1x, P1y, P2x, P2y, P3x, P3y, P4x, P4y) {
        function CB1(t) {
            return t * t * t;
        }
        function CB2(t) {
            return 3 * t * t * (1 - t);
        }
        function CB3(t) {
            return 3 * t * (1 - t) * (1 - t);
        }
        function CB4(t) {
            return (1 - t) * (1 - t) * (1 - t);
        }
        var x = P4x * CB1(pct) + P3x * CB2(pct) + P2x * CB3(pct) + P1x * CB4(pct);
        var y = P4y * CB1(pct) + P3y * CB2(pct) + P2y * CB3(pct) + P1y * CB4(pct);
        return {
            x: x,
            y: y
        };
    };
    Path.getPointOnQuadraticBezier = function (pct, P1x, P1y, P2x, P2y, P3x, P3y) {
        function QB1(t) {
            return t * t;
        }
        function QB2(t) {
            return 2 * t * (1 - t);
        }
        function QB3(t) {
            return (1 - t) * (1 - t);
        }
        var x = P3x * QB1(pct) + P2x * QB2(pct) + P1x * QB3(pct);
        var y = P3y * QB1(pct) + P2y * QB2(pct) + P1y * QB3(pct);
        return {
            x: x,
            y: y
        };
    };
    Path.getPointOnEllipticalArc = function (cx, cy, rx, ry, theta, psi) {
        var cosPsi = Math.cos(psi), sinPsi = Math.sin(psi);
        var pt = {
            x: rx * Math.cos(theta),
            y: ry * Math.sin(theta)
        };
        return {
            x: cx + (pt.x * cosPsi - pt.y * sinPsi),
            y: cy + (pt.x * sinPsi + pt.y * cosPsi)
        };
    };
    Path.parsePathData = function (data) {
        if (!data) {
            return [];
        }
        var cs = data;
        var cc = [
            'm',
            'M',
            'l',
            'L',
            'v',
            'V',
            'h',
            'H',
            'z',
            'Z',
            'c',
            'C',
            'q',
            'Q',
            't',
            'T',
            's',
            'S',
            'a',
            'A'
        ];
        cs = cs.replace(new RegExp(' ', 'g'), ',');
        for (var n = 0; n < cc.length; n++) {
            cs = cs.replace(new RegExp(cc[n], 'g'), '|' + cc[n]);
        }
        var arr = cs.split('|');
        var ca = [];
        var coords = [];
        var cpx = 0;
        var cpy = 0;
        var re = /([-+]?((\d+\.\d+)|((\d+)|(\.\d+)))(?:e[-+]?\d+)?)/gi;
        var match;
        for (n = 1; n < arr.length; n++) {
            var str = arr[n];
            var c = str.charAt(0);
            str = str.slice(1);
            coords.length = 0;
            while ((match = re.exec(str))) {
                coords.push(match[0]);
            }
            var p = [];
            for (var j = 0, jlen = coords.length; j < jlen; j++) {
                var parsed = parseFloat(coords[j]);
                if (!isNaN(parsed)) {
                    p.push(parsed);
                }
                else {
                    p.push(0);
                }
            }
            while (p.length > 0) {
                if (isNaN(p[0])) {
                    break;
                }
                var cmd = null;
                var points = [];
                var startX = cpx, startY = cpy;
                var prevCmd, ctlPtx, ctlPty;
                var rx, ry, psi, fa, fs, x1, y1;
                switch (c) {
                    case 'l':
                        cpx += p.shift();
                        cpy += p.shift();
                        cmd = 'L';
                        points.push(cpx, cpy);
                        break;
                    case 'L':
                        cpx = p.shift();
                        cpy = p.shift();
                        points.push(cpx, cpy);
                        break;
                    case 'm':
                        var dx = p.shift();
                        var dy = p.shift();
                        cpx += dx;
                        cpy += dy;
                        cmd = 'M';
                        if (ca.length > 2 && ca[ca.length - 1].command === 'z') {
                            for (var idx = ca.length - 2; idx >= 0; idx--) {
                                if (ca[idx].command === 'M') {
                                    cpx = ca[idx].points[0] + dx;
                                    cpy = ca[idx].points[1] + dy;
                                    break;
                                }
                            }
                        }
                        points.push(cpx, cpy);
                        c = 'l';
                        break;
                    case 'M':
                        cpx = p.shift();
                        cpy = p.shift();
                        cmd = 'M';
                        points.push(cpx, cpy);
                        c = 'L';
                        break;
                    case 'h':
                        cpx += p.shift();
                        cmd = 'L';
                        points.push(cpx, cpy);
                        break;
                    case 'H':
                        cpx = p.shift();
                        cmd = 'L';
                        points.push(cpx, cpy);
                        break;
                    case 'v':
                        cpy += p.shift();
                        cmd = 'L';
                        points.push(cpx, cpy);
                        break;
                    case 'V':
                        cpy = p.shift();
                        cmd = 'L';
                        points.push(cpx, cpy);
                        break;
                    case 'C':
                        points.push(p.shift(), p.shift(), p.shift(), p.shift());
                        cpx = p.shift();
                        cpy = p.shift();
                        points.push(cpx, cpy);
                        break;
                    case 'c':
                        points.push(cpx + p.shift(), cpy + p.shift(), cpx + p.shift(), cpy + p.shift());
                        cpx += p.shift();
                        cpy += p.shift();
                        cmd = 'C';
                        points.push(cpx, cpy);
                        break;
                    case 'S':
                        ctlPtx = cpx;
                        ctlPty = cpy;
                        prevCmd = ca[ca.length - 1];
                        if (prevCmd.command === 'C') {
                            ctlPtx = cpx + (cpx - prevCmd.points[2]);
                            ctlPty = cpy + (cpy - prevCmd.points[3]);
                        }
                        points.push(ctlPtx, ctlPty, p.shift(), p.shift());
                        cpx = p.shift();
                        cpy = p.shift();
                        cmd = 'C';
                        points.push(cpx, cpy);
                        break;
                    case 's':
                        ctlPtx = cpx;
                        ctlPty = cpy;
                        prevCmd = ca[ca.length - 1];
                        if (prevCmd.command === 'C') {
                            ctlPtx = cpx + (cpx - prevCmd.points[2]);
                            ctlPty = cpy + (cpy - prevCmd.points[3]);
                        }
                        points.push(ctlPtx, ctlPty, cpx + p.shift(), cpy + p.shift());
                        cpx += p.shift();
                        cpy += p.shift();
                        cmd = 'C';
                        points.push(cpx, cpy);
                        break;
                    case 'Q':
                        points.push(p.shift(), p.shift());
                        cpx = p.shift();
                        cpy = p.shift();
                        points.push(cpx, cpy);
                        break;
                    case 'q':
                        points.push(cpx + p.shift(), cpy + p.shift());
                        cpx += p.shift();
                        cpy += p.shift();
                        cmd = 'Q';
                        points.push(cpx, cpy);
                        break;
                    case 'T':
                        ctlPtx = cpx;
                        ctlPty = cpy;
                        prevCmd = ca[ca.length - 1];
                        if (prevCmd.command === 'Q') {
                            ctlPtx = cpx + (cpx - prevCmd.points[0]);
                            ctlPty = cpy + (cpy - prevCmd.points[1]);
                        }
                        cpx = p.shift();
                        cpy = p.shift();
                        cmd = 'Q';
                        points.push(ctlPtx, ctlPty, cpx, cpy);
                        break;
                    case 't':
                        ctlPtx = cpx;
                        ctlPty = cpy;
                        prevCmd = ca[ca.length - 1];
                        if (prevCmd.command === 'Q') {
                            ctlPtx = cpx + (cpx - prevCmd.points[0]);
                            ctlPty = cpy + (cpy - prevCmd.points[1]);
                        }
                        cpx += p.shift();
                        cpy += p.shift();
                        cmd = 'Q';
                        points.push(ctlPtx, ctlPty, cpx, cpy);
                        break;
                    case 'A':
                        rx = p.shift();
                        ry = p.shift();
                        psi = p.shift();
                        fa = p.shift();
                        fs = p.shift();
                        x1 = cpx;
                        y1 = cpy;
                        cpx = p.shift();
                        cpy = p.shift();
                        cmd = 'A';
                        points = this.convertEndpointToCenterParameterization(x1, y1, cpx, cpy, fa, fs, rx, ry, psi);
                        break;
                    case 'a':
                        rx = p.shift();
                        ry = p.shift();
                        psi = p.shift();
                        fa = p.shift();
                        fs = p.shift();
                        x1 = cpx;
                        y1 = cpy;
                        cpx += p.shift();
                        cpy += p.shift();
                        cmd = 'A';
                        points = this.convertEndpointToCenterParameterization(x1, y1, cpx, cpy, fa, fs, rx, ry, psi);
                        break;
                }
                ca.push({
                    command: cmd || c,
                    points: points,
                    start: {
                        x: startX,
                        y: startY
                    },
                    pathLength: this.calcLength(startX, startY, cmd || c, points)
                });
            }
            if (c === 'z' || c === 'Z') {
                ca.push({
                    command: 'z',
                    points: [],
                    start: undefined,
                    pathLength: 0
                });
            }
        }
        return ca;
    };
    Path.calcLength = function (x, y, cmd, points) {
        var len, p1, p2, t;
        var path = Path;
        switch (cmd) {
            case 'L':
                return path.getLineLength(x, y, points[0], points[1]);
            case 'C':
                len = 0.0;
                p1 = path.getPointOnCubicBezier(0, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
                for (t = 0.01; t <= 1; t += 0.01) {
                    p2 = path.getPointOnCubicBezier(t, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
                    len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                    p1 = p2;
                }
                return len;
            case 'Q':
                len = 0.0;
                p1 = path.getPointOnQuadraticBezier(0, x, y, points[0], points[1], points[2], points[3]);
                for (t = 0.01; t <= 1; t += 0.01) {
                    p2 = path.getPointOnQuadraticBezier(t, x, y, points[0], points[1], points[2], points[3]);
                    len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                    p1 = p2;
                }
                return len;
            case 'A':
                len = 0.0;
                var start = points[4];
                var dTheta = points[5];
                var end = points[4] + dTheta;
                var inc = Math.PI / 180.0;
                if (Math.abs(start - end) < inc) {
                    inc = Math.abs(start - end);
                }
                p1 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], start, 0);
                if (dTheta < 0) {
                    for (t = start - inc; t > end; t -= inc) {
                        p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                        len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                        p1 = p2;
                    }
                }
                else {
                    for (t = start + inc; t < end; t += inc) {
                        p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                        len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                        p1 = p2;
                    }
                }
                p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], end, 0);
                len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                return len;
        }
        return 0;
    };
    Path.convertEndpointToCenterParameterization = function (x1, y1, x2, y2, fa, fs, rx, ry, psiDeg) {
        var psi = psiDeg * (Math.PI / 180.0);
        var xp = (Math.cos(psi) * (x1 - x2)) / 2.0 + (Math.sin(psi) * (y1 - y2)) / 2.0;
        var yp = (-1 * Math.sin(psi) * (x1 - x2)) / 2.0 +
            (Math.cos(psi) * (y1 - y2)) / 2.0;
        var lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);
        if (lambda > 1) {
            rx *= Math.sqrt(lambda);
            ry *= Math.sqrt(lambda);
        }
        var f = Math.sqrt((rx * rx * (ry * ry) - rx * rx * (yp * yp) - ry * ry * (xp * xp)) /
            (rx * rx * (yp * yp) + ry * ry * (xp * xp)));
        if (fa === fs) {
            f *= -1;
        }
        if (isNaN(f)) {
            f = 0;
        }
        var cxp = (f * rx * yp) / ry;
        var cyp = (f * -ry * xp) / rx;
        var cx = (x1 + x2) / 2.0 + Math.cos(psi) * cxp - Math.sin(psi) * cyp;
        var cy = (y1 + y2) / 2.0 + Math.sin(psi) * cxp + Math.cos(psi) * cyp;
        var vMag = function (v) {
            return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
        };
        var vRatio = function (u, v) {
            return (u[0] * v[0] + u[1] * v[1]) / (vMag(u) * vMag(v));
        };
        var vAngle = function (u, v) {
            return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(vRatio(u, v));
        };
        var theta = vAngle([1, 0], [(xp - cxp) / rx, (yp - cyp) / ry]);
        var u = [(xp - cxp) / rx, (yp - cyp) / ry];
        var v = [(-1 * xp - cxp) / rx, (-1 * yp - cyp) / ry];
        var dTheta = vAngle(u, v);
        if (vRatio(u, v) <= -1) {
            dTheta = Math.PI;
        }
        if (vRatio(u, v) >= 1) {
            dTheta = 0;
        }
        if (fs === 0 && dTheta > 0) {
            dTheta = dTheta - 2 * Math.PI;
        }
        if (fs === 1 && dTheta < 0) {
            dTheta = dTheta + 2 * Math.PI;
        }
        return [cx, cy, rx, ry, theta, dTheta, psi, fs];
    };
    return Path;
}(Shape_1.Shape));
exports.Path = Path;
Path.prototype.className = 'Path';
Path.prototype._attrsAffectingSize = ['data'];
Global_1._registerNode(Path);
Factory_1.Factory.addGetterSetter(Path, 'data');
Util_1.Collection.mapMethods(Path);

},{"../Factory":16,"../Global":18,"../Shape":23,"../Util":26}],58:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("../Util");
var Factory_1 = require("../Factory");
var Shape_1 = require("../Shape");
var Global_1 = require("../Global");
var Rect = (function (_super) {
    __extends(Rect, _super);
    function Rect() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rect.prototype._sceneFunc = function (context) {
        var cornerRadius = this.cornerRadius(), width = this.width(), height = this.height();
        context.beginPath();
        if (!cornerRadius) {
            context.rect(0, 0, width, height);
        }
        else {
            var topLeft = 0;
            var topRight = 0;
            var bottomLeft = 0;
            var bottomRight = 0;
            if (typeof cornerRadius === 'number') {
                topLeft = topRight = bottomLeft = bottomRight = Math.min(cornerRadius, width / 2, height / 2);
            }
            else {
                topLeft = Math.min(cornerRadius[0], width / 2, height / 2);
                topRight = Math.min(cornerRadius[1], width / 2, height / 2);
                bottomRight = Math.min(cornerRadius[2], width / 2, height / 2);
                bottomLeft = Math.min(cornerRadius[3], width / 2, height / 2);
            }
            context.moveTo(topLeft, 0);
            context.lineTo(width - topRight, 0);
            context.arc(width - topRight, topRight, topRight, (Math.PI * 3) / 2, 0, false);
            context.lineTo(width, height - bottomRight);
            context.arc(width - bottomRight, height - bottomRight, bottomRight, 0, Math.PI / 2, false);
            context.lineTo(bottomLeft, height);
            context.arc(bottomLeft, height - bottomLeft, bottomLeft, Math.PI / 2, Math.PI, false);
            context.lineTo(0, topLeft);
            context.arc(topLeft, topLeft, topLeft, Math.PI, (Math.PI * 3) / 2, false);
        }
        context.closePath();
        context.fillStrokeShape(this);
    };
    return Rect;
}(Shape_1.Shape));
exports.Rect = Rect;
Rect.prototype.className = 'Rect';
Global_1._registerNode(Rect);
Factory_1.Factory.addGetterSetter(Rect, 'cornerRadius', 0);
Util_1.Collection.mapMethods(Rect);

},{"../Factory":16,"../Global":18,"../Shape":23,"../Util":26}],59:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("../Util");
var Factory_1 = require("../Factory");
var Shape_1 = require("../Shape");
var Validators_1 = require("../Validators");
var Global_1 = require("../Global");
var RegularPolygon = (function (_super) {
    __extends(RegularPolygon, _super);
    function RegularPolygon() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RegularPolygon.prototype._sceneFunc = function (context) {
        var sides = this.sides(), radius = this.radius(), n, x, y;
        context.beginPath();
        context.moveTo(0, 0 - radius);
        for (n = 1; n < sides; n++) {
            x = radius * Math.sin((n * 2 * Math.PI) / sides);
            y = -1 * radius * Math.cos((n * 2 * Math.PI) / sides);
            context.lineTo(x, y);
        }
        context.closePath();
        context.fillStrokeShape(this);
    };
    RegularPolygon.prototype.getWidth = function () {
        return this.radius() * 2;
    };
    RegularPolygon.prototype.getHeight = function () {
        return this.radius() * 2;
    };
    RegularPolygon.prototype.setWidth = function (width) {
        this.radius(width / 2);
    };
    RegularPolygon.prototype.setHeight = function (height) {
        this.radius(height / 2);
    };
    return RegularPolygon;
}(Shape_1.Shape));
exports.RegularPolygon = RegularPolygon;
RegularPolygon.prototype.className = 'RegularPolygon';
RegularPolygon.prototype._centroid = true;
RegularPolygon.prototype._attrsAffectingSize = ['radius'];
Global_1._registerNode(RegularPolygon);
Factory_1.Factory.addGetterSetter(RegularPolygon, 'radius', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(RegularPolygon, 'sides', 0, Validators_1.getNumberValidator());
Util_1.Collection.mapMethods(RegularPolygon);

},{"../Factory":16,"../Global":18,"../Shape":23,"../Util":26,"../Validators":27}],60:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("../Util");
var Factory_1 = require("../Factory");
var Shape_1 = require("../Shape");
var Validators_1 = require("../Validators");
var Global_1 = require("../Global");
var PIx2 = Math.PI * 2;
var Ring = (function (_super) {
    __extends(Ring, _super);
    function Ring() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Ring.prototype._sceneFunc = function (context) {
        context.beginPath();
        context.arc(0, 0, this.innerRadius(), 0, PIx2, false);
        context.moveTo(this.outerRadius(), 0);
        context.arc(0, 0, this.outerRadius(), PIx2, 0, true);
        context.closePath();
        context.fillStrokeShape(this);
    };
    Ring.prototype.getWidth = function () {
        return this.outerRadius() * 2;
    };
    Ring.prototype.getHeight = function () {
        return this.outerRadius() * 2;
    };
    Ring.prototype.setWidth = function (width) {
        this.outerRadius(width / 2);
    };
    Ring.prototype.setHeight = function (height) {
        this.outerRadius(height / 2);
    };
    return Ring;
}(Shape_1.Shape));
exports.Ring = Ring;
Ring.prototype.className = 'Ring';
Ring.prototype._centroid = true;
Ring.prototype._attrsAffectingSize = ['innerRadius', 'outerRadius'];
Global_1._registerNode(Ring);
Factory_1.Factory.addGetterSetter(Ring, 'innerRadius', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Ring, 'outerRadius', 0, Validators_1.getNumberValidator());
Util_1.Collection.mapMethods(Ring);

},{"../Factory":16,"../Global":18,"../Shape":23,"../Util":26,"../Validators":27}],61:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("../Util");
var Factory_1 = require("../Factory");
var Shape_1 = require("../Shape");
var Animation_1 = require("../Animation");
var Validators_1 = require("../Validators");
var Global_1 = require("../Global");
var Sprite = (function (_super) {
    __extends(Sprite, _super);
    function Sprite(config) {
        var _this = _super.call(this, config) || this;
        _this._updated = true;
        _this.anim = new Animation_1.Animation(function () {
            var updated = _this._updated;
            _this._updated = false;
            return updated;
        });
        _this.on('animationChange.konva', function () {
            this.frameIndex(0);
        });
        _this.on('frameIndexChange.konva', function () {
            this._updated = true;
        });
        _this.on('frameRateChange.konva', function () {
            if (!this.anim.isRunning()) {
                return;
            }
            clearInterval(this.interval);
            this._setInterval();
        });
        return _this;
    }
    Sprite.prototype._sceneFunc = function (context) {
        var anim = this.animation(), index = this.frameIndex(), ix4 = index * 4, set = this.animations()[anim], offsets = this.frameOffsets(), x = set[ix4 + 0], y = set[ix4 + 1], width = set[ix4 + 2], height = set[ix4 + 3], image = this.image();
        if (this.hasFill() || this.hasStroke()) {
            context.beginPath();
            context.rect(0, 0, width, height);
            context.closePath();
            context.fillStrokeShape(this);
        }
        if (image) {
            if (offsets) {
                var offset = offsets[anim], ix2 = index * 2;
                context.drawImage(image, x, y, width, height, offset[ix2 + 0], offset[ix2 + 1], width, height);
            }
            else {
                context.drawImage(image, x, y, width, height, 0, 0, width, height);
            }
        }
    };
    Sprite.prototype._hitFunc = function (context) {
        var anim = this.animation(), index = this.frameIndex(), ix4 = index * 4, set = this.animations()[anim], offsets = this.frameOffsets(), width = set[ix4 + 2], height = set[ix4 + 3];
        context.beginPath();
        if (offsets) {
            var offset = offsets[anim];
            var ix2 = index * 2;
            context.rect(offset[ix2 + 0], offset[ix2 + 1], width, height);
        }
        else {
            context.rect(0, 0, width, height);
        }
        context.closePath();
        context.fillShape(this);
    };
    Sprite.prototype._useBufferCanvas = function () {
        return ((this.hasShadow() || this.getAbsoluteOpacity() !== 1) && this.hasStroke());
    };
    Sprite.prototype._setInterval = function () {
        var that = this;
        this.interval = setInterval(function () {
            that._updateIndex();
        }, 1000 / this.frameRate());
    };
    Sprite.prototype.start = function () {
        if (this.isRunning()) {
            return;
        }
        var layer = this.getLayer();
        this.anim.setLayers(layer);
        this._setInterval();
        this.anim.start();
    };
    Sprite.prototype.stop = function () {
        this.anim.stop();
        clearInterval(this.interval);
    };
    Sprite.prototype.isRunning = function () {
        return this.anim.isRunning();
    };
    Sprite.prototype._updateIndex = function () {
        var index = this.frameIndex(), animation = this.animation(), animations = this.animations(), anim = animations[animation], len = anim.length / 4;
        if (index < len - 1) {
            this.frameIndex(index + 1);
        }
        else {
            this.frameIndex(0);
        }
    };
    return Sprite;
}(Shape_1.Shape));
exports.Sprite = Sprite;
Sprite.prototype.className = 'Sprite';
Global_1._registerNode(Sprite);
Factory_1.Factory.addGetterSetter(Sprite, 'animation');
Factory_1.Factory.addGetterSetter(Sprite, 'animations');
Factory_1.Factory.addGetterSetter(Sprite, 'frameOffsets');
Factory_1.Factory.addGetterSetter(Sprite, 'image');
Factory_1.Factory.addGetterSetter(Sprite, 'frameIndex', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Sprite, 'frameRate', 17, Validators_1.getNumberValidator());
Factory_1.Factory.backCompat(Sprite, {
    index: 'frameIndex',
    getIndex: 'getFrameIndex',
    setIndex: 'setFrameIndex'
});
Util_1.Collection.mapMethods(Sprite);

},{"../Animation":10,"../Factory":16,"../Global":18,"../Shape":23,"../Util":26,"../Validators":27}],62:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("../Util");
var Factory_1 = require("../Factory");
var Shape_1 = require("../Shape");
var Validators_1 = require("../Validators");
var Global_1 = require("../Global");
var Star = (function (_super) {
    __extends(Star, _super);
    function Star() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Star.prototype._sceneFunc = function (context) {
        var innerRadius = this.innerRadius(), outerRadius = this.outerRadius(), numPoints = this.numPoints();
        context.beginPath();
        context.moveTo(0, 0 - outerRadius);
        for (var n = 1; n < numPoints * 2; n++) {
            var radius = n % 2 === 0 ? outerRadius : innerRadius;
            var x = radius * Math.sin((n * Math.PI) / numPoints);
            var y = -1 * radius * Math.cos((n * Math.PI) / numPoints);
            context.lineTo(x, y);
        }
        context.closePath();
        context.fillStrokeShape(this);
    };
    Star.prototype.getWidth = function () {
        return this.outerRadius() * 2;
    };
    Star.prototype.getHeight = function () {
        return this.outerRadius() * 2;
    };
    Star.prototype.setWidth = function (width) {
        this.outerRadius(width / 2);
    };
    Star.prototype.setHeight = function (height) {
        this.outerRadius(height / 2);
    };
    return Star;
}(Shape_1.Shape));
exports.Star = Star;
Star.prototype.className = 'Star';
Star.prototype._centroid = true;
Star.prototype._attrsAffectingSize = ['innerRadius', 'outerRadius'];
Global_1._registerNode(Star);
Factory_1.Factory.addGetterSetter(Star, 'numPoints', 5, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Star, 'innerRadius', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Star, 'outerRadius', 0, Validators_1.getNumberValidator());
Util_1.Collection.mapMethods(Star);

},{"../Factory":16,"../Global":18,"../Shape":23,"../Util":26,"../Validators":27}],63:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("../Util");
var Factory_1 = require("../Factory");
var Shape_1 = require("../Shape");
var Global_1 = require("../Global");
var Validators_1 = require("../Validators");
var Global_2 = require("../Global");
var AUTO = 'auto', CENTER = 'center', JUSTIFY = 'justify', CHANGE_KONVA = 'Change.konva', CONTEXT_2D = '2d', DASH = '-', LEFT = 'left', TEXT = 'text', TEXT_UPPER = 'Text', TOP = 'top', BOTTOM = 'bottom', MIDDLE = 'middle', NORMAL = 'normal', PX_SPACE = 'px ', SPACE = ' ', RIGHT = 'right', WORD = 'word', CHAR = 'char', NONE = 'none', ELLIPSIS = '…', ATTR_CHANGE_LIST = [
    'fontFamily',
    'fontSize',
    'fontStyle',
    'fontVariant',
    'padding',
    'align',
    'verticalAlign',
    'lineHeight',
    'text',
    'width',
    'height',
    'wrap',
    'ellipsis',
    'letterSpacing'
], attrChangeListLen = ATTR_CHANGE_LIST.length;
var dummyContext;
function getDummyContext() {
    if (dummyContext) {
        return dummyContext;
    }
    dummyContext = Util_1.Util.createCanvasElement().getContext(CONTEXT_2D);
    return dummyContext;
}
function _fillFunc(context) {
    context.fillText(this._partialText, this._partialTextX, this._partialTextY);
}
function _strokeFunc(context) {
    context.strokeText(this._partialText, this._partialTextX, this._partialTextY);
}
function checkDefaultFill(config) {
    config = config || {};
    if (!config.fillLinearGradientColorStops &&
        !config.fillRadialGradientColorStops &&
        !config.fillPatternImage) {
        config.fill = config.fill || 'black';
    }
    return config;
}
var trimRight = String.prototype.trimRight ||
    function polyfill() {
        return this.replace(/[\s\xa0]+$/, '');
    };
var Text = (function (_super) {
    __extends(Text, _super);
    function Text(config) {
        var _this = _super.call(this, checkDefaultFill(config)) || this;
        _this._partialTextX = 0;
        _this._partialTextY = 0;
        for (var n = 0; n < attrChangeListLen; n++) {
            _this.on(ATTR_CHANGE_LIST[n] + CHANGE_KONVA, _this._setTextData);
        }
        _this._setTextData();
        return _this;
    }
    Text.prototype._sceneFunc = function (context) {
        var padding = this.padding(), fontSize = this.fontSize(), lineHeightPx = this.lineHeight() * fontSize, textArr = this.textArr, textArrLen = textArr.length, verticalAlign = this.verticalAlign(), alignY = 0, align = this.align(), totalWidth = this.getWidth(), letterSpacing = this.letterSpacing(), fill = this.fill(), textDecoration = this.textDecoration(), shouldUnderline = textDecoration.indexOf('underline') !== -1, shouldLineThrough = textDecoration.indexOf('line-through') !== -1, n;
        var translateY = 0;
        var translateY = lineHeightPx / 2;
        var lineTranslateX = 0;
        var lineTranslateY = 0;
        context.setAttr('font', this._getContextFont());
        context.setAttr('textBaseline', MIDDLE);
        context.setAttr('textAlign', LEFT);
        if (verticalAlign === MIDDLE) {
            alignY = (this.getHeight() - textArrLen * lineHeightPx - padding * 2) / 2;
        }
        else if (verticalAlign === BOTTOM) {
            alignY = this.getHeight() - textArrLen * lineHeightPx - padding * 2;
        }
        context.translate(padding, alignY + padding);
        for (n = 0; n < textArrLen; n++) {
            var lineTranslateX = 0;
            var lineTranslateY = 0;
            var obj = textArr[n], text = obj.text, width = obj.width, lastLine = n !== textArrLen - 1, spacesNumber, oneWord, lineWidth;
            context.save();
            if (align === RIGHT) {
                lineTranslateX += totalWidth - width - padding * 2;
            }
            else if (align === CENTER) {
                lineTranslateX += (totalWidth - width - padding * 2) / 2;
            }
            if (shouldUnderline) {
                context.save();
                context.beginPath();
                context.moveTo(lineTranslateX, translateY + lineTranslateY + Math.round(fontSize / 2));
                spacesNumber = text.split(' ').length - 1;
                oneWord = spacesNumber === 0;
                lineWidth =
                    align === JUSTIFY && lastLine && !oneWord
                        ? totalWidth - padding * 2
                        : width;
                context.lineTo(lineTranslateX + Math.round(lineWidth), translateY + lineTranslateY + Math.round(fontSize / 2));
                context.lineWidth = fontSize / 15;
                context.strokeStyle = fill;
                context.stroke();
                context.restore();
            }
            if (shouldLineThrough) {
                context.save();
                context.beginPath();
                context.moveTo(lineTranslateX, translateY + lineTranslateY);
                spacesNumber = text.split(' ').length - 1;
                oneWord = spacesNumber === 0;
                lineWidth =
                    align === JUSTIFY && lastLine && !oneWord
                        ? totalWidth - padding * 2
                        : width;
                context.lineTo(lineTranslateX + Math.round(lineWidth), translateY + lineTranslateY);
                context.lineWidth = fontSize / 15;
                context.strokeStyle = fill;
                context.stroke();
                context.restore();
            }
            if (letterSpacing !== 0 || align === JUSTIFY) {
                spacesNumber = text.split(' ').length - 1;
                for (var li = 0; li < text.length; li++) {
                    var letter = text[li];
                    if (letter === ' ' && n !== textArrLen - 1 && align === JUSTIFY) {
                        lineTranslateX += Math.floor((totalWidth - padding * 2 - width) / spacesNumber);
                    }
                    this._partialTextX = lineTranslateX;
                    this._partialTextY = translateY + lineTranslateY;
                    this._partialText = letter;
                    context.fillStrokeShape(this);
                    lineTranslateX +=
                        Math.round(this.measureSize(letter).width) + letterSpacing;
                }
            }
            else {
                this._partialTextX = lineTranslateX;
                this._partialTextY = translateY + lineTranslateY;
                this._partialText = text;
                context.fillStrokeShape(this);
            }
            context.restore();
            if (textArrLen > 1) {
                translateY += lineHeightPx;
            }
        }
    };
    Text.prototype._hitFunc = function (context) {
        var width = this.getWidth(), height = this.getHeight();
        context.beginPath();
        context.rect(0, 0, width, height);
        context.closePath();
        context.fillStrokeShape(this);
    };
    Text.prototype.setText = function (text) {
        var str = Util_1.Util._isString(text)
            ? text
            : text === null || text === undefined
                ? ''
                : text + '';
        this._setAttr(TEXT, str);
        return this;
    };
    Text.prototype.getWidth = function () {
        var isAuto = this.attrs.width === AUTO || this.attrs.width === undefined;
        return isAuto ? this.getTextWidth() + this.padding() * 2 : this.attrs.width;
    };
    Text.prototype.getHeight = function () {
        var isAuto = this.attrs.height === AUTO || this.attrs.height === undefined;
        return isAuto
            ? this.fontSize() * this.textArr.length * this.lineHeight() +
                this.padding() * 2
            : this.attrs.height;
    };
    Text.prototype.getTextWidth = function () {
        return this.textWidth;
    };
    Text.prototype.getTextHeight = function () {
        Util_1.Util.warn('text.getTextHeight() method is deprecated. Use text.height() - for full height and text.fontSize() - for one line height.');
        return this.textHeight;
    };
    Text.prototype.measureSize = function (text) {
        var _context = getDummyContext(), fontSize = this.fontSize(), metrics;
        _context.save();
        _context.font = this._getContextFont();
        metrics = _context.measureText(text);
        _context.restore();
        return {
            width: metrics.width,
            height: fontSize
        };
    };
    Text.prototype._getContextFont = function () {
        if (Global_1.Konva.UA.isIE) {
            return (this.fontStyle() +
                SPACE +
                this.fontSize() +
                PX_SPACE +
                this.fontFamily());
        }
        return (this.fontStyle() +
            SPACE +
            this.fontVariant() +
            SPACE +
            this.fontSize() +
            PX_SPACE +
            this.fontFamily());
    };
    Text.prototype._addTextLine = function (line) {
        if (this.align() === JUSTIFY) {
            line = line.trim();
        }
        var width = this._getTextWidth(line);
        return this.textArr.push({ text: line, width: width });
    };
    Text.prototype._getTextWidth = function (text) {
        var letterSpacing = this.letterSpacing();
        var length = text.length;
        return (getDummyContext().measureText(text).width +
            (length ? letterSpacing * (length - 1) : 0));
    };
    Text.prototype._setTextData = function () {
        var lines = this.text().split('\n'), fontSize = +this.fontSize(), textWidth = 0, lineHeightPx = this.lineHeight() * fontSize, width = this.attrs.width, height = this.attrs.height, fixedWidth = width !== AUTO && width !== undefined, fixedHeight = height !== AUTO && height !== undefined, padding = this.padding(), maxWidth = width - padding * 2, maxHeightPx = height - padding * 2, currentHeightPx = 0, wrap = this.wrap(), shouldWrap = wrap !== NONE, wrapAtWord = wrap !== CHAR && shouldWrap, shouldAddEllipsis = this.ellipsis() && !shouldWrap;
        this.textArr = [];
        getDummyContext().font = this._getContextFont();
        var additionalWidth = shouldAddEllipsis ? this._getTextWidth(ELLIPSIS) : 0;
        for (var i = 0, max = lines.length; i < max; ++i) {
            var line = lines[i];
            var lineWidth = this._getTextWidth(line);
            if (fixedWidth && lineWidth > maxWidth) {
                while (line.length > 0) {
                    var low = 0, high = line.length, match = '', matchWidth = 0;
                    while (low < high) {
                        var mid = (low + high) >>> 1, substr = line.slice(0, mid + 1), substrWidth = this._getTextWidth(substr) + additionalWidth;
                        if (substrWidth <= maxWidth) {
                            low = mid + 1;
                            match = substr + (shouldAddEllipsis ? ELLIPSIS : '');
                            matchWidth = substrWidth;
                        }
                        else {
                            high = mid;
                        }
                    }
                    if (match) {
                        if (wrapAtWord) {
                            var wrapIndex;
                            var nextChar = line[match.length];
                            var nextIsSpaceOrDash = nextChar === SPACE || nextChar === DASH;
                            if (nextIsSpaceOrDash && matchWidth <= maxWidth) {
                                wrapIndex = match.length;
                            }
                            else {
                                wrapIndex =
                                    Math.max(match.lastIndexOf(SPACE), match.lastIndexOf(DASH)) +
                                        1;
                            }
                            if (wrapIndex > 0) {
                                low = wrapIndex;
                                match = match.slice(0, low);
                                matchWidth = this._getTextWidth(match);
                            }
                        }
                        match = match.trimRight();
                        this._addTextLine(match);
                        textWidth = Math.max(textWidth, matchWidth);
                        currentHeightPx += lineHeightPx;
                        if (!shouldWrap ||
                            (fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx)) {
                            break;
                        }
                        line = line.slice(low);
                        line = line.trimLeft();
                        if (line.length > 0) {
                            lineWidth = this._getTextWidth(line);
                            if (lineWidth <= maxWidth) {
                                this._addTextLine(line);
                                currentHeightPx += lineHeightPx;
                                textWidth = Math.max(textWidth, lineWidth);
                                break;
                            }
                        }
                    }
                    else {
                        break;
                    }
                }
            }
            else {
                this._addTextLine(line);
                currentHeightPx += lineHeightPx;
                textWidth = Math.max(textWidth, lineWidth);
            }
            if (fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx) {
                break;
            }
        }
        this.textHeight = fontSize;
        this.textWidth = textWidth;
    };
    Text.prototype.getStrokeScaleEnabled = function () {
        return true;
    };
    return Text;
}(Shape_1.Shape));
exports.Text = Text;
Text.prototype._fillFunc = _fillFunc;
Text.prototype._strokeFunc = _strokeFunc;
Text.prototype.className = TEXT_UPPER;
Text.prototype._attrsAffectingSize = [
    'text',
    'fontSize',
    'padding',
    'wrap',
    'lineHeight'
];
Global_2._registerNode(Text);
Factory_1.Factory.overWriteSetter(Text, 'width', Validators_1.getNumberOrAutoValidator());
Factory_1.Factory.overWriteSetter(Text, 'height', Validators_1.getNumberOrAutoValidator());
Factory_1.Factory.addGetterSetter(Text, 'fontFamily', 'Arial');
Factory_1.Factory.addGetterSetter(Text, 'fontSize', 12, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Text, 'fontStyle', NORMAL);
Factory_1.Factory.addGetterSetter(Text, 'fontVariant', NORMAL);
Factory_1.Factory.addGetterSetter(Text, 'padding', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Text, 'align', LEFT);
Factory_1.Factory.addGetterSetter(Text, 'verticalAlign', TOP);
Factory_1.Factory.addGetterSetter(Text, 'lineHeight', 1, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Text, 'wrap', WORD);
Factory_1.Factory.addGetterSetter(Text, 'ellipsis', false);
Factory_1.Factory.addGetterSetter(Text, 'letterSpacing', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Text, 'text', '', Validators_1.getStringValidator());
Factory_1.Factory.addGetterSetter(Text, 'textDecoration', '');
Util_1.Collection.mapMethods(Text);

},{"../Factory":16,"../Global":18,"../Shape":23,"../Util":26,"../Validators":27}],64:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("../Util");
var Factory_1 = require("../Factory");
var Shape_1 = require("../Shape");
var Path_1 = require("./Path");
var Text_1 = require("./Text");
var Validators_1 = require("../Validators");
var Global_1 = require("../Global");
var EMPTY_STRING = '', NORMAL = 'normal';
function _fillFunc(context) {
    context.fillText(this.partialText, 0, 0);
}
function _strokeFunc(context) {
    context.strokeText(this.partialText, 0, 0);
}
var TextPath = (function (_super) {
    __extends(TextPath, _super);
    function TextPath(config) {
        var _this = _super.call(this, config) || this;
        _this.dummyCanvas = Util_1.Util.createCanvasElement();
        _this.dataArray = [];
        _this.dataArray = Path_1.Path.parsePathData(_this.attrs.data);
        _this.on('dataChange.konva', function () {
            this.dataArray = Path_1.Path.parsePathData(this.attrs.data);
            this._setTextData();
        });
        _this.on('textChange.konva alignChange.konva letterSpacingChange.konva kerningFuncChange.konva', _this._setTextData);
        if (config && config['getKerning']) {
            Util_1.Util.warn('getKerning TextPath API is deprecated. Please use "kerningFunc" instead.');
            _this.kerningFunc(config['getKerning']);
        }
        _this._setTextData();
        return _this;
    }
    TextPath.prototype._sceneFunc = function (context) {
        context.setAttr('font', this._getContextFont());
        context.setAttr('textBaseline', this.textBaseline());
        context.setAttr('textAlign', 'left');
        context.save();
        var textDecoration = this.textDecoration();
        var fill = this.fill();
        var fontSize = this.fontSize();
        var glyphInfo = this.glyphInfo;
        if (textDecoration === 'underline') {
            context.beginPath();
        }
        for (var i = 0; i < glyphInfo.length; i++) {
            context.save();
            var p0 = glyphInfo[i].p0;
            context.translate(p0.x, p0.y);
            context.rotate(glyphInfo[i].rotation);
            this.partialText = glyphInfo[i].text;
            context.fillStrokeShape(this);
            if (textDecoration === 'underline') {
                if (i === 0) {
                    context.moveTo(0, fontSize / 2 + 1);
                }
                context.lineTo(fontSize, fontSize / 2 + 1);
            }
            context.restore();
        }
        if (textDecoration === 'underline') {
            context.strokeStyle = fill;
            context.lineWidth = fontSize / 20;
            context.stroke();
        }
        context.restore();
    };
    TextPath.prototype._hitFunc = function (context) {
        context.beginPath();
        var glyphInfo = this.glyphInfo;
        if (glyphInfo.length >= 1) {
            var p0 = glyphInfo[0].p0;
            context.moveTo(p0.x, p0.y);
        }
        for (var i = 0; i < glyphInfo.length; i++) {
            var p1 = glyphInfo[i].p1;
            context.lineTo(p1.x, p1.y);
        }
        context.setAttr('lineWidth', this.fontSize());
        context.setAttr('strokeStyle', this.colorKey);
        context.stroke();
    };
    TextPath.prototype.getTextWidth = function () {
        return this.textWidth;
    };
    TextPath.prototype.getTextHeight = function () {
        Util_1.Util.warn('text.getTextHeight() method is deprecated. Use text.height() - for full height and text.fontSize() - for one line height.');
        return this.textHeight;
    };
    TextPath.prototype.setText = function (text) {
        return Text_1.Text.prototype.setText.call(this, text);
    };
    TextPath.prototype._getContextFont = function () {
        return Text_1.Text.prototype._getContextFont.call(this);
    };
    TextPath.prototype._getTextSize = function (text) {
        var dummyCanvas = this.dummyCanvas;
        var _context = dummyCanvas.getContext('2d');
        _context.save();
        _context.font = this._getContextFont();
        var metrics = _context.measureText(text);
        _context.restore();
        return {
            width: metrics.width,
            height: parseInt(this.attrs.fontSize, 10)
        };
    };
    TextPath.prototype._setTextData = function () {
        var that = this;
        var size = this._getTextSize(this.attrs.text);
        var letterSpacing = this.letterSpacing();
        var align = this.align();
        var kerningFunc = this.kerningFunc();
        this.textWidth = size.width;
        this.textHeight = size.height;
        var textFullWidth = Math.max(this.textWidth + ((this.attrs.text || '').length - 1) * letterSpacing, 0);
        this.glyphInfo = [];
        var fullPathWidth = 0;
        for (var l = 0; l < that.dataArray.length; l++) {
            if (that.dataArray[l].pathLength > 0) {
                fullPathWidth += that.dataArray[l].pathLength;
            }
        }
        var offset = 0;
        if (align === 'center') {
            offset = Math.max(0, fullPathWidth / 2 - textFullWidth / 2);
        }
        if (align === 'right') {
            offset = Math.max(0, fullPathWidth - textFullWidth);
        }
        var charArr = this.text().split('');
        var spacesNumber = this.text().split(' ').length - 1;
        var p0, p1, pathCmd;
        var pIndex = -1;
        var currentT = 0;
        var getNextPathSegment = function () {
            currentT = 0;
            var pathData = that.dataArray;
            for (var j = pIndex + 1; j < pathData.length; j++) {
                if (pathData[j].pathLength > 0) {
                    pIndex = j;
                    return pathData[j];
                }
                else if (pathData[j].command === 'M') {
                    p0 = {
                        x: pathData[j].points[0],
                        y: pathData[j].points[1]
                    };
                }
            }
            return {};
        };
        var findSegmentToFitCharacter = function (c) {
            var glyphWidth = that._getTextSize(c).width + letterSpacing;
            if (c === ' ' && align === 'justify') {
                glyphWidth += (fullPathWidth - textFullWidth) / spacesNumber;
            }
            var currLen = 0;
            var attempts = 0;
            p1 = undefined;
            while (Math.abs(glyphWidth - currLen) / glyphWidth > 0.01 &&
                attempts < 25) {
                attempts++;
                var cumulativePathLength = currLen;
                while (pathCmd === undefined) {
                    pathCmd = getNextPathSegment();
                    if (pathCmd &&
                        cumulativePathLength + pathCmd.pathLength < glyphWidth) {
                        cumulativePathLength += pathCmd.pathLength;
                        pathCmd = undefined;
                    }
                }
                if (pathCmd === {} || p0 === undefined) {
                    return undefined;
                }
                var needNewSegment = false;
                switch (pathCmd.command) {
                    case 'L':
                        if (Path_1.Path.getLineLength(p0.x, p0.y, pathCmd.points[0], pathCmd.points[1]) > glyphWidth) {
                            p1 = Path_1.Path.getPointOnLine(glyphWidth, p0.x, p0.y, pathCmd.points[0], pathCmd.points[1], p0.x, p0.y);
                        }
                        else {
                            pathCmd = undefined;
                        }
                        break;
                    case 'A':
                        var start = pathCmd.points[4];
                        var dTheta = pathCmd.points[5];
                        var end = pathCmd.points[4] + dTheta;
                        if (currentT === 0) {
                            currentT = start + 0.00000001;
                        }
                        else if (glyphWidth > currLen) {
                            currentT += ((Math.PI / 180.0) * dTheta) / Math.abs(dTheta);
                        }
                        else {
                            currentT -= ((Math.PI / 360.0) * dTheta) / Math.abs(dTheta);
                        }
                        if ((dTheta < 0 && currentT < end) ||
                            (dTheta >= 0 && currentT > end)) {
                            currentT = end;
                            needNewSegment = true;
                        }
                        p1 = Path_1.Path.getPointOnEllipticalArc(pathCmd.points[0], pathCmd.points[1], pathCmd.points[2], pathCmd.points[3], currentT, pathCmd.points[6]);
                        break;
                    case 'C':
                        if (currentT === 0) {
                            if (glyphWidth > pathCmd.pathLength) {
                                currentT = 0.00000001;
                            }
                            else {
                                currentT = glyphWidth / pathCmd.pathLength;
                            }
                        }
                        else if (glyphWidth > currLen) {
                            currentT += (glyphWidth - currLen) / pathCmd.pathLength;
                        }
                        else {
                            currentT -= (currLen - glyphWidth) / pathCmd.pathLength;
                        }
                        if (currentT > 1.0) {
                            currentT = 1.0;
                            needNewSegment = true;
                        }
                        p1 = Path_1.Path.getPointOnCubicBezier(currentT, pathCmd.start.x, pathCmd.start.y, pathCmd.points[0], pathCmd.points[1], pathCmd.points[2], pathCmd.points[3], pathCmd.points[4], pathCmd.points[5]);
                        break;
                    case 'Q':
                        if (currentT === 0) {
                            currentT = glyphWidth / pathCmd.pathLength;
                        }
                        else if (glyphWidth > currLen) {
                            currentT += (glyphWidth - currLen) / pathCmd.pathLength;
                        }
                        else {
                            currentT -= (currLen - glyphWidth) / pathCmd.pathLength;
                        }
                        if (currentT > 1.0) {
                            currentT = 1.0;
                            needNewSegment = true;
                        }
                        p1 = Path_1.Path.getPointOnQuadraticBezier(currentT, pathCmd.start.x, pathCmd.start.y, pathCmd.points[0], pathCmd.points[1], pathCmd.points[2], pathCmd.points[3]);
                        break;
                }
                if (p1 !== undefined) {
                    currLen = Path_1.Path.getLineLength(p0.x, p0.y, p1.x, p1.y);
                }
                if (needNewSegment) {
                    needNewSegment = false;
                    pathCmd = undefined;
                }
            }
        };
        var testChar = 'C';
        var glyphWidth = that._getTextSize(testChar).width + letterSpacing;
        var lettersInOffset = offset / glyphWidth - 1;
        for (var k = 0; k < lettersInOffset; k++) {
            findSegmentToFitCharacter(testChar);
            if (p0 === undefined || p1 === undefined) {
                break;
            }
            p0 = p1;
        }
        for (var i = 0; i < charArr.length; i++) {
            findSegmentToFitCharacter(charArr[i]);
            if (p0 === undefined || p1 === undefined) {
                break;
            }
            var width = Path_1.Path.getLineLength(p0.x, p0.y, p1.x, p1.y);
            var kern = 0;
            if (kerningFunc) {
                try {
                    kern = kerningFunc(charArr[i - 1], charArr[i]) * this.fontSize();
                }
                catch (e) {
                    kern = 0;
                }
            }
            p0.x += kern;
            p1.x += kern;
            this.textWidth += kern;
            var midpoint = Path_1.Path.getPointOnLine(kern + width / 2.0, p0.x, p0.y, p1.x, p1.y);
            var rotation = Math.atan2(p1.y - p0.y, p1.x - p0.x);
            this.glyphInfo.push({
                transposeX: midpoint.x,
                transposeY: midpoint.y,
                text: charArr[i],
                rotation: rotation,
                p0: p0,
                p1: p1
            });
            p0 = p1;
        }
    };
    TextPath.prototype.getSelfRect = function () {
        if (!this.glyphInfo.length) {
            return {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            };
        }
        var points = [];
        this.glyphInfo.forEach(function (info) {
            points.push(info.p0.x);
            points.push(info.p0.y);
            points.push(info.p1.x);
            points.push(info.p1.y);
        });
        var minX = points[0] || 0;
        var maxX = points[0] || 0;
        var minY = points[1] || 0;
        var maxY = points[1] || 0;
        var x, y;
        for (var i = 0; i < points.length / 2; i++) {
            x = points[i * 2];
            y = points[i * 2 + 1];
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }
        var fontSize = this.fontSize();
        return {
            x: minX - fontSize / 2,
            y: minY - fontSize / 2,
            width: maxX - minX + fontSize,
            height: maxY - minY + fontSize
        };
    };
    return TextPath;
}(Shape_1.Shape));
exports.TextPath = TextPath;
TextPath.prototype._fillFunc = _fillFunc;
TextPath.prototype._strokeFunc = _strokeFunc;
TextPath.prototype._fillFuncHit = _fillFunc;
TextPath.prototype._strokeFuncHit = _strokeFunc;
TextPath.prototype.className = 'TextPath';
TextPath.prototype._attrsAffectingSize = ['text', 'fontSize', 'data'];
Global_1._registerNode(TextPath);
Factory_1.Factory.addGetterSetter(TextPath, 'data');
Factory_1.Factory.addGetterSetter(TextPath, 'fontFamily', 'Arial');
Factory_1.Factory.addGetterSetter(TextPath, 'fontSize', 12, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(TextPath, 'fontStyle', NORMAL);
Factory_1.Factory.addGetterSetter(TextPath, 'align', 'left');
Factory_1.Factory.addGetterSetter(TextPath, 'letterSpacing', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(TextPath, 'textBaseline', 'middle');
Factory_1.Factory.addGetterSetter(TextPath, 'fontVariant', NORMAL);
Factory_1.Factory.addGetterSetter(TextPath, 'text', EMPTY_STRING);
Factory_1.Factory.addGetterSetter(TextPath, 'textDecoration', null);
Factory_1.Factory.addGetterSetter(TextPath, 'kerningFunc', null);
Util_1.Collection.mapMethods(TextPath);

},{"../Factory":16,"../Global":18,"../Shape":23,"../Util":26,"../Validators":27,"./Path":57,"./Text":63}],65:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("../Util");
var Factory_1 = require("../Factory");
var Node_1 = require("../Node");
var Shape_1 = require("../Shape");
var Rect_1 = require("./Rect");
var Group_1 = require("../Group");
var Global_1 = require("../Global");
var Validators_1 = require("../Validators");
var Global_2 = require("../Global");
var EVENTS_NAME = 'tr-konva';
var ATTR_CHANGE_LIST = [
    'resizeEnabledChange',
    'rotateAnchorOffsetChange',
    'rotateEnabledChange',
    'enabledAnchorsChange',
    'anchorSizeChange',
    'borderEnabledChange',
    'borderStrokeChange',
    'borderStrokeWidthChange',
    'borderDashChange',
    'anchorStrokeChange',
    'anchorStrokeWidthChange',
    'anchorFillChange',
    'anchorCornerRadiusChange',
    'ignoreStrokeChange',
]
    .map(function (e) { return e + ("." + EVENTS_NAME); })
    .join(' ');
var NODES_RECT = 'nodesRect';
var TRANSFORM_CHANGE_STR = [
    'widthChange',
    'heightChange',
    'scaleXChange',
    'scaleYChange',
    'skewXChange',
    'skewYChange',
    'rotationChange',
    'offsetXChange',
    'offsetYChange',
    'transformsEnabledChange',
    'strokeWidthChange',
]
    .map(function (e) { return e + ("." + EVENTS_NAME); })
    .join(' ');
var ANGLES = {
    'top-left': -45,
    'top-center': 0,
    'top-right': 45,
    'middle-right': -90,
    'middle-left': 90,
    'bottom-left': -135,
    'bottom-center': 180,
    'bottom-right': 135,
};
var TOUCH_DEVICE = 'ontouchstart' in Global_1.Konva._global;
function getCursor(anchorName, rad) {
    if (anchorName === 'rotater') {
        return 'crosshair';
    }
    rad += Util_1.Util._degToRad(ANGLES[anchorName] || 0);
    var angle = ((Util_1.Util._radToDeg(rad) % 360) + 360) % 360;
    if (Util_1.Util._inRange(angle, 315 + 22.5, 360) || Util_1.Util._inRange(angle, 0, 22.5)) {
        return 'ns-resize';
    }
    else if (Util_1.Util._inRange(angle, 45 - 22.5, 45 + 22.5)) {
        return 'nesw-resize';
    }
    else if (Util_1.Util._inRange(angle, 90 - 22.5, 90 + 22.5)) {
        return 'ew-resize';
    }
    else if (Util_1.Util._inRange(angle, 135 - 22.5, 135 + 22.5)) {
        return 'nwse-resize';
    }
    else if (Util_1.Util._inRange(angle, 180 - 22.5, 180 + 22.5)) {
        return 'ns-resize';
    }
    else if (Util_1.Util._inRange(angle, 225 - 22.5, 225 + 22.5)) {
        return 'nesw-resize';
    }
    else if (Util_1.Util._inRange(angle, 270 - 22.5, 270 + 22.5)) {
        return 'ew-resize';
    }
    else if (Util_1.Util._inRange(angle, 315 - 22.5, 315 + 22.5)) {
        return 'nwse-resize';
    }
    else {
        Util_1.Util.error('Transformer has unknown angle for cursor detection: ' + angle);
        return 'pointer';
    }
}
var ANCHORS_NAMES = [
    'top-left',
    'top-center',
    'top-right',
    'middle-right',
    'middle-left',
    'bottom-left',
    'bottom-center',
    'bottom-right',
];
var MAX_SAFE_INTEGER = 100000000;
function getCenter(shape) {
    return {
        x: shape.x +
            (shape.width / 2) * Math.cos(shape.rotation) +
            (shape.height / 2) * Math.sin(-shape.rotation),
        y: shape.y +
            (shape.height / 2) * Math.cos(shape.rotation) +
            (shape.width / 2) * Math.sin(shape.rotation),
    };
}
function rotateAroundPoint(shape, angleRad, point) {
    var x = point.x +
        (shape.x - point.x) * Math.cos(angleRad) -
        (shape.y - point.y) * Math.sin(angleRad);
    var y = point.y +
        (shape.x - point.x) * Math.sin(angleRad) +
        (shape.y - point.y) * Math.cos(angleRad);
    return __assign(__assign({}, shape), { rotation: shape.rotation + angleRad, x: x,
        y: y });
}
function rotateAroundCenter(shape, deltaRad) {
    var center = getCenter(shape);
    return rotateAroundPoint(shape, deltaRad, center);
}
function getSnap(snaps, newRotationRad, tol) {
    var snapped = newRotationRad;
    for (var i = 0; i < snaps.length; i++) {
        var angle = Global_1.Konva.getAngle(snaps[i]);
        var absDiff = Math.abs(angle - newRotationRad) % (Math.PI * 2);
        var dif = Math.min(absDiff, Math.PI * 2 - absDiff);
        if (dif < tol) {
            snapped = angle;
        }
    }
    return snapped;
}
var Transformer = (function (_super) {
    __extends(Transformer, _super);
    function Transformer(config) {
        var _this = _super.call(this, config) || this;
        _this._transforming = false;
        _this._createElements();
        _this._handleMouseMove = _this._handleMouseMove.bind(_this);
        _this._handleMouseUp = _this._handleMouseUp.bind(_this);
        _this.update = _this.update.bind(_this);
        _this.on(ATTR_CHANGE_LIST, _this.update);
        if (_this.getNode()) {
            _this.update();
        }
        return _this;
    }
    Transformer.prototype.attachTo = function (node) {
        this.setNode(node);
        return this;
    };
    Transformer.prototype.setNode = function (node) {
        Util_1.Util.warn('tr.setNode(shape), tr.node(shape) and tr.attachTo(shape) methods are deprecated. Please use tr.nodes(nodesArray) instead.');
        return this.setNodes([node]);
    };
    Transformer.prototype.getNode = function () {
        return this._nodes && this._nodes[0];
    };
    Transformer.prototype.setNodes = function (nodes) {
        var _this = this;
        if (nodes === void 0) { nodes = []; }
        if (this._nodes && this._nodes.length) {
            this.detach();
        }
        this._nodes = nodes;
        if (nodes.length === 1) {
            this.rotation(nodes[0].rotation());
        }
        else {
            this.rotation(0);
        }
        this._nodes.forEach(function (node) {
            var additionalEvents = node._attrsAffectingSize
                .map(function (prop) { return prop + 'Change.' + EVENTS_NAME; })
                .join(' ');
            var onChange = function () {
                _this._resetTransformCache();
                if (!_this._transforming) {
                    _this.update();
                }
            };
            node.on(additionalEvents, onChange);
            node.on(TRANSFORM_CHANGE_STR, onChange);
            node.on("_clearTransformCache." + EVENTS_NAME, onChange);
            node.on("xChange." + EVENTS_NAME + " yChange." + EVENTS_NAME, onChange);
            _this._proxyDrag(node);
        });
        this._resetTransformCache();
        var elementsCreated = !!this.findOne('.top-left');
        if (elementsCreated) {
            this.update();
        }
        return this;
    };
    Transformer.prototype._proxyDrag = function (node) {
        var _this = this;
        var lastPos;
        node.on("dragstart." + EVENTS_NAME, function () {
            lastPos = node.getAbsolutePosition();
        });
        node.on("dragmove." + EVENTS_NAME, function () {
            if (!lastPos) {
                return;
            }
            var abs = node.getAbsolutePosition();
            var dx = abs.x - lastPos.x;
            var dy = abs.y - lastPos.y;
            _this.nodes().forEach(function (otherNode) {
                if (otherNode === node) {
                    return;
                }
                if (otherNode.isDragging()) {
                    return;
                }
                var otherAbs = otherNode.getAbsolutePosition();
                otherNode.setAbsolutePosition({
                    x: otherAbs.x + dx,
                    y: otherAbs.y + dy,
                });
                otherNode.startDrag();
            });
            lastPos = null;
        });
    };
    Transformer.prototype.getNodes = function () {
        return this._nodes;
    };
    Transformer.prototype.getActiveAnchor = function () {
        return this._movingAnchorName;
    };
    Transformer.prototype.detach = function () {
        if (this._nodes) {
            this._nodes.forEach(function (node) {
                node.off('.' + EVENTS_NAME);
            });
        }
        this._nodes = [];
        this._resetTransformCache();
    };
    Transformer.prototype._resetTransformCache = function () {
        this._clearCache(NODES_RECT);
        this._clearCache('transform');
        this._clearSelfAndDescendantCache('absoluteTransform');
    };
    Transformer.prototype._getNodeRect = function () {
        return this._getCache(NODES_RECT, this.__getNodeRect);
    };
    Transformer.prototype.__getNodeShape = function (node, rot, relative) {
        if (rot === void 0) { rot = this.rotation(); }
        var rect = node.getClientRect({
            skipTransform: true,
            skipShadow: true,
            skipStroke: this.ignoreStroke(),
        });
        var absScale = node.getAbsoluteScale(relative);
        var absPos = node.getAbsolutePosition(relative);
        var dx = rect.x * absScale.x - node.offsetX() * absScale.x;
        var dy = rect.y * absScale.y - node.offsetY() * absScale.y;
        var rotation = (Global_1.Konva.getAngle(node.getAbsoluteRotation()) + Math.PI * 2) %
            (Math.PI * 2);
        var box = {
            x: absPos.x + dx * Math.cos(rotation) + dy * Math.sin(-rotation),
            y: absPos.y + dy * Math.cos(rotation) + dx * Math.sin(rotation),
            width: rect.width * absScale.x,
            height: rect.height * absScale.y,
            rotation: rotation,
        };
        return rotateAroundPoint(box, -Global_1.Konva.getAngle(rot), {
            x: 0,
            y: 0,
        });
    };
    Transformer.prototype.__getNodeRect = function () {
        var _this = this;
        var node = this.getNode();
        if (!node) {
            return {
                x: -MAX_SAFE_INTEGER,
                y: -MAX_SAFE_INTEGER,
                width: 0,
                height: 0,
                rotation: 0,
            };
        }
        var totalPoints = [];
        this.nodes().map(function (node) {
            var box = node.getClientRect({
                skipTransform: true,
                skipShadow: true,
                skipStroke: _this.ignoreStroke(),
            });
            var points = [
                { x: box.x, y: box.y },
                { x: box.x + box.width, y: box.y },
                { x: box.x + box.width, y: box.y + box.height },
                { x: box.x, y: box.y + box.height },
            ];
            var trans = node.getAbsoluteTransform();
            points.forEach(function (point) {
                var transformed = trans.point(point);
                totalPoints.push(transformed);
            });
        });
        var tr = new Util_1.Transform();
        tr.rotate(-Global_1.Konva.getAngle(this.rotation()));
        var minX, minY, maxX, maxY;
        totalPoints.forEach(function (point) {
            var transformed = tr.point(point);
            if (minX === undefined) {
                minX = maxX = transformed.x;
                minY = maxY = transformed.y;
            }
            minX = Math.min(minX, transformed.x);
            minY = Math.min(minY, transformed.y);
            maxX = Math.max(maxX, transformed.x);
            maxY = Math.max(maxY, transformed.y);
        });
        tr.invert();
        var p = tr.point({ x: minX, y: minY });
        return {
            x: p.x,
            y: p.y,
            width: maxX - minX,
            height: maxY - minY,
            rotation: Global_1.Konva.getAngle(this.rotation()),
        };
    };
    Transformer.prototype.getX = function () {
        return this._getNodeRect().x;
    };
    Transformer.prototype.getY = function () {
        return this._getNodeRect().y;
    };
    Transformer.prototype.getWidth = function () {
        return this._getNodeRect().width;
    };
    Transformer.prototype.getHeight = function () {
        return this._getNodeRect().height;
    };
    Transformer.prototype._createElements = function () {
        this._createBack();
        ANCHORS_NAMES.forEach(function (name) {
            this._createAnchor(name);
        }.bind(this));
        this._createAnchor('rotater');
    };
    Transformer.prototype._createAnchor = function (name) {
        var _this = this;
        var anchor = new Rect_1.Rect({
            stroke: 'rgb(0, 161, 255)',
            fill: 'white',
            strokeWidth: 1,
            name: name + ' _anchor',
            dragDistance: 0,
            draggable: true,
            hitStrokeWidth: TOUCH_DEVICE ? 10 : 'auto',
        });
        var self = this;
        anchor.on('mousedown touchstart', function (e) {
            self._handleMouseDown(e);
        });
        anchor.on('dragstart', function (e) {
            anchor.stopDrag();
            e.cancelBubble = true;
        });
        anchor.on('dragend', function (e) {
            e.cancelBubble = true;
        });
        anchor.on('mouseenter', function () {
            var rad = Global_1.Konva.getAngle(_this.rotation());
            var cursor = getCursor(name, rad);
            anchor.getStage().content.style.cursor = cursor;
            _this._cursorChange = true;
        });
        anchor.on('mouseout', function () {
            anchor.getStage().content.style.cursor = '';
            _this._cursorChange = false;
        });
        this.add(anchor);
    };
    Transformer.prototype._createBack = function () {
        var _this = this;
        var back = new Shape_1.Shape({
            name: 'back',
            width: 0,
            height: 0,
            draggable: true,
            sceneFunc: function (ctx) {
                var tr = this.getParent();
                var padding = tr.padding();
                ctx.beginPath();
                ctx.rect(-padding, -padding, this.width() + padding * 2, this.height() + padding * 2);
                ctx.moveTo(this.width() / 2, -padding);
                if (tr.rotateEnabled()) {
                    ctx.lineTo(this.width() / 2, -tr.rotateAnchorOffset() * Util_1.Util._sign(this.height()) - padding);
                }
                ctx.fillStrokeShape(this);
            },
            hitFunc: function (ctx, shape) {
                if (!_this.shouldOverdrawWholeArea()) {
                    return;
                }
                var padding = _this.padding();
                ctx.beginPath();
                ctx.rect(-padding, -padding, shape.width() + padding * 2, shape.height() + padding * 2);
                ctx.fillStrokeShape(shape);
            },
        });
        this.add(back);
        this._proxyDrag(back);
    };
    Transformer.prototype._handleMouseDown = function (e) {
        this._movingAnchorName = e.target.name().split(' ')[0];
        var attrs = this._getNodeRect();
        var width = attrs.width;
        var height = attrs.height;
        var hypotenuse = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
        this.sin = Math.abs(height / hypotenuse);
        this.cos = Math.abs(width / hypotenuse);
        window.addEventListener('mousemove', this._handleMouseMove);
        window.addEventListener('touchmove', this._handleMouseMove);
        window.addEventListener('mouseup', this._handleMouseUp, true);
        window.addEventListener('touchend', this._handleMouseUp, true);
        this._transforming = true;
        var ap = e.target.getAbsolutePosition();
        var pos = e.target.getStage().getPointerPosition();
        this._anchorDragOffset = {
            x: pos.x - ap.x,
            y: pos.y - ap.y,
        };
        this._fire('transformstart', { evt: e, target: this.getNode() });
        this.getNode()._fire('transformstart', { evt: e, target: this.getNode() });
    };
    Transformer.prototype._handleMouseMove = function (e) {
        var x, y, newHypotenuse;
        var anchorNode = this.findOne('.' + this._movingAnchorName);
        var stage = anchorNode.getStage();
        stage.setPointersPositions(e);
        var pp = stage.getPointerPosition();
        var newNodePos = {
            x: pp.x - this._anchorDragOffset.x,
            y: pp.y - this._anchorDragOffset.y,
        };
        var oldAbs = anchorNode.getAbsolutePosition();
        anchorNode.setAbsolutePosition(newNodePos);
        var newAbs = anchorNode.getAbsolutePosition();
        if (oldAbs.x === newAbs.x && oldAbs.y === newAbs.y) {
            return;
        }
        if (this._movingAnchorName === 'rotater') {
            var attrs = this._getNodeRect();
            x = anchorNode.x() - attrs.width / 2;
            y = -anchorNode.y() + attrs.height / 2;
            var delta = Math.atan2(-y, x) + Math.PI / 2;
            if (attrs.height < 0) {
                delta -= Math.PI;
            }
            var oldRotation = Global_1.Konva.getAngle(this.rotation());
            var newRotation = oldRotation + delta;
            var tol = Global_1.Konva.getAngle(this.rotationSnapTolerance());
            var snappedRot = getSnap(this.rotationSnaps(), newRotation, tol);
            var diff = snappedRot - attrs.rotation;
            var shape = rotateAroundCenter(attrs, diff);
            this._fitNodesInto(shape, e);
            return;
        }
        var keepProportion = this.keepRatio() || e.shiftKey;
        var centeredScaling = this.centeredScaling() || e.altKey;
        if (this._movingAnchorName === 'top-left') {
            if (keepProportion) {
                var comparePoint = centeredScaling
                    ? {
                        x: this.width() / 2,
                        y: this.height() / 2,
                    }
                    : {
                        x: this.findOne('.bottom-right').x(),
                        y: this.findOne('.bottom-right').y(),
                    };
                newHypotenuse = Math.sqrt(Math.pow(comparePoint.x - anchorNode.x(), 2) +
                    Math.pow(comparePoint.y - anchorNode.y(), 2));
                var reverseX = this.findOne('.top-left').x() > comparePoint.x ? -1 : 1;
                var reverseY = this.findOne('.top-left').y() > comparePoint.y ? -1 : 1;
                x = newHypotenuse * this.cos * reverseX;
                y = newHypotenuse * this.sin * reverseY;
                this.findOne('.top-left').x(comparePoint.x - x);
                this.findOne('.top-left').y(comparePoint.y - y);
            }
        }
        else if (this._movingAnchorName === 'top-center') {
            this.findOne('.top-left').y(anchorNode.y());
        }
        else if (this._movingAnchorName === 'top-right') {
            if (keepProportion) {
                var comparePoint = centeredScaling
                    ? {
                        x: this.width() / 2,
                        y: this.height() / 2,
                    }
                    : {
                        x: this.findOne('.bottom-left').x(),
                        y: this.findOne('.bottom-left').y(),
                    };
                newHypotenuse = Math.sqrt(Math.pow(anchorNode.x() - comparePoint.x, 2) +
                    Math.pow(comparePoint.y - anchorNode.y(), 2));
                var reverseX = this.findOne('.top-right').x() < comparePoint.x ? -1 : 1;
                var reverseY = this.findOne('.top-right').y() > comparePoint.y ? -1 : 1;
                x = newHypotenuse * this.cos * reverseX;
                y = newHypotenuse * this.sin * reverseY;
                this.findOne('.top-right').x(comparePoint.x + x);
                this.findOne('.top-right').y(comparePoint.y - y);
            }
            var pos = anchorNode.position();
            this.findOne('.top-left').y(pos.y);
            this.findOne('.bottom-right').x(pos.x);
        }
        else if (this._movingAnchorName === 'middle-left') {
            this.findOne('.top-left').x(anchorNode.x());
        }
        else if (this._movingAnchorName === 'middle-right') {
            this.findOne('.bottom-right').x(anchorNode.x());
        }
        else if (this._movingAnchorName === 'bottom-left') {
            if (keepProportion) {
                var comparePoint = centeredScaling
                    ? {
                        x: this.width() / 2,
                        y: this.height() / 2,
                    }
                    : {
                        x: this.findOne('.top-right').x(),
                        y: this.findOne('.top-right').y(),
                    };
                newHypotenuse = Math.sqrt(Math.pow(comparePoint.x - anchorNode.x(), 2) +
                    Math.pow(anchorNode.y() - comparePoint.y, 2));
                var reverseX = comparePoint.x < anchorNode.x() ? -1 : 1;
                var reverseY = anchorNode.y() < comparePoint.y ? -1 : 1;
                x = newHypotenuse * this.cos * reverseX;
                y = newHypotenuse * this.sin * reverseY;
                anchorNode.x(comparePoint.x - x);
                anchorNode.y(comparePoint.y + y);
            }
            pos = anchorNode.position();
            this.findOne('.top-left').x(pos.x);
            this.findOne('.bottom-right').y(pos.y);
        }
        else if (this._movingAnchorName === 'bottom-center') {
            this.findOne('.bottom-right').y(anchorNode.y());
        }
        else if (this._movingAnchorName === 'bottom-right') {
            if (keepProportion) {
                var comparePoint = centeredScaling
                    ? {
                        x: this.width() / 2,
                        y: this.height() / 2,
                    }
                    : {
                        x: this.findOne('.top-left').x(),
                        y: this.findOne('.top-left').y(),
                    };
                newHypotenuse = Math.sqrt(Math.pow(anchorNode.x() - comparePoint.x, 2) +
                    Math.pow(anchorNode.y() - comparePoint.y, 2));
                var reverseX = this.findOne('.bottom-right').x() < comparePoint.x ? -1 : 1;
                var reverseY = this.findOne('.bottom-right').y() < comparePoint.y ? -1 : 1;
                x = newHypotenuse * this.cos * reverseX;
                y = newHypotenuse * this.sin * reverseY;
                this.findOne('.bottom-right').x(comparePoint.x + x);
                this.findOne('.bottom-right').y(comparePoint.y + y);
            }
        }
        else {
            console.error(new Error('Wrong position argument of selection resizer: ' +
                this._movingAnchorName));
        }
        var centeredScaling = this.centeredScaling() || e.altKey;
        if (centeredScaling) {
            var topLeft = this.findOne('.top-left');
            var bottomRight = this.findOne('.bottom-right');
            var topOffsetX = topLeft.x();
            var topOffsetY = topLeft.y();
            var bottomOffsetX = this.getWidth() - bottomRight.x();
            var bottomOffsetY = this.getHeight() - bottomRight.y();
            bottomRight.move({
                x: -topOffsetX,
                y: -topOffsetY,
            });
            topLeft.move({
                x: bottomOffsetX,
                y: bottomOffsetY,
            });
        }
        var absPos = this.findOne('.top-left').getAbsolutePosition();
        x = absPos.x;
        y = absPos.y;
        var width = this.findOne('.bottom-right').x() - this.findOne('.top-left').x();
        var height = this.findOne('.bottom-right').y() - this.findOne('.top-left').y();
        this._fitNodesInto({
            x: x,
            y: y,
            width: width,
            height: height,
            rotation: Global_1.Konva.getAngle(this.rotation()),
        }, e);
    };
    Transformer.prototype._handleMouseUp = function (e) {
        this._removeEvents(e);
    };
    Transformer.prototype.getAbsoluteTransform = function () {
        return this.getTransform();
    };
    Transformer.prototype._removeEvents = function (e) {
        if (this._transforming) {
            this._transforming = false;
            window.removeEventListener('mousemove', this._handleMouseMove);
            window.removeEventListener('touchmove', this._handleMouseMove);
            window.removeEventListener('mouseup', this._handleMouseUp, true);
            window.removeEventListener('touchend', this._handleMouseUp, true);
            var node = this.getNode();
            this._fire('transformend', { evt: e, target: node });
            if (node) {
                node.fire('transformend', { evt: e, target: node });
            }
            this._movingAnchorName = null;
        }
    };
    Transformer.prototype._fitNodesInto = function (newAttrs, evt) {
        var _this = this;
        var oldAttrs = this._getNodeRect();
        var minSize = 1;
        if (Util_1.Util._inRange(newAttrs.width, -this.padding() * 2 - minSize, minSize)) {
            this.update();
            return;
        }
        if (Util_1.Util._inRange(newAttrs.height, -this.padding() * 2 - minSize, minSize)) {
            this.update();
            return;
        }
        var allowNegativeScale = true;
        var t = new Util_1.Transform();
        t.rotate(Global_1.Konva.getAngle(this.rotation()));
        if (this._movingAnchorName &&
            newAttrs.width < 0 &&
            this._movingAnchorName.indexOf('left') >= 0) {
            var offset = t.point({
                x: -this.padding() * 2,
                y: 0,
            });
            newAttrs.x += offset.x;
            newAttrs.y += offset.y;
            newAttrs.width += this.padding() * 2;
            this._movingAnchorName = this._movingAnchorName.replace('left', 'right');
            this._anchorDragOffset.x -= offset.x;
            this._anchorDragOffset.y -= offset.y;
            if (!allowNegativeScale) {
                this.update();
                return;
            }
        }
        else if (this._movingAnchorName &&
            newAttrs.width < 0 &&
            this._movingAnchorName.indexOf('right') >= 0) {
            var offset = t.point({
                x: this.padding() * 2,
                y: 0,
            });
            this._movingAnchorName = this._movingAnchorName.replace('right', 'left');
            this._anchorDragOffset.x -= offset.x;
            this._anchorDragOffset.y -= offset.y;
            newAttrs.width += this.padding() * 2;
            if (!allowNegativeScale) {
                this.update();
                return;
            }
        }
        if (this._movingAnchorName &&
            newAttrs.height < 0 &&
            this._movingAnchorName.indexOf('top') >= 0) {
            var offset = t.point({
                x: 0,
                y: -this.padding() * 2,
            });
            newAttrs.x += offset.x;
            newAttrs.y += offset.y;
            this._movingAnchorName = this._movingAnchorName.replace('top', 'bottom');
            this._anchorDragOffset.x -= offset.x;
            this._anchorDragOffset.y -= offset.y;
            newAttrs.height += this.padding() * 2;
            if (!allowNegativeScale) {
                this.update();
                return;
            }
        }
        else if (this._movingAnchorName &&
            newAttrs.height < 0 &&
            this._movingAnchorName.indexOf('bottom') >= 0) {
            var offset = t.point({
                x: 0,
                y: this.padding() * 2,
            });
            this._movingAnchorName = this._movingAnchorName.replace('bottom', 'top');
            this._anchorDragOffset.x -= offset.x;
            this._anchorDragOffset.y -= offset.y;
            newAttrs.height += this.padding() * 2;
            if (!allowNegativeScale) {
                this.update();
                return;
            }
        }
        if (this.boundBoxFunc()) {
            var bounded = this.boundBoxFunc()(oldAttrs, newAttrs);
            if (bounded) {
                newAttrs = bounded;
            }
            else {
                Util_1.Util.warn('boundBoxFunc returned falsy. You should return new bound rect from it!');
            }
        }
        var baseSize = 10000000;
        var oldTr = new Util_1.Transform();
        oldTr.translate(oldAttrs.x, oldAttrs.y);
        oldTr.rotate(oldAttrs.rotation);
        oldTr.scale(oldAttrs.width / baseSize, oldAttrs.height / baseSize);
        var newTr = new Util_1.Transform();
        newTr.translate(newAttrs.x, newAttrs.y);
        newTr.rotate(newAttrs.rotation);
        newTr.scale(newAttrs.width / baseSize, newAttrs.height / baseSize);
        var delta = newTr.multiply(oldTr.invert());
        this._nodes.forEach(function (node) {
            var parentTransform = node.getParent().getAbsoluteTransform();
            var localTransform = node.getTransform().copy();
            localTransform.translate(node.offsetX(), node.offsetY());
            var newLocalTransform = new Util_1.Transform();
            newLocalTransform
                .multiply(parentTransform.copy().invert())
                .multiply(delta)
                .multiply(parentTransform)
                .multiply(localTransform);
            var attrs = newLocalTransform.decompose();
            node._batchTransformChanges(function () {
                node.setAttrs(attrs);
            });
            _this._fire('transform', { evt: evt, target: node });
            node._fire('transform', { evt: evt, target: node });
        });
        this.rotation(Util_1.Util._getRotation(newAttrs.rotation));
        this._resetTransformCache();
        this.update();
        this.getLayer().batchDraw();
    };
    Transformer.prototype.forceUpdate = function () {
        this._resetTransformCache();
        this.update();
    };
    Transformer.prototype._batchChangeChild = function (selector, attrs) {
        var anchor = this.findOne(selector);
        anchor._batchTransformChanges(function () {
            anchor.setAttrs(attrs);
        });
    };
    Transformer.prototype.update = function () {
        var _this = this;
        var attrs = this._getNodeRect();
        this.rotation(Util_1.Util._getRotation(attrs.rotation));
        var width = attrs.width;
        var height = attrs.height;
        var enabledAnchors = this.enabledAnchors();
        var resizeEnabled = this.resizeEnabled();
        var padding = this.padding();
        var anchorSize = this.anchorSize();
        this.find('._anchor').each(function (node) {
            node._batchTransformChanges(function () {
                node.setAttrs({
                    width: anchorSize,
                    height: anchorSize,
                    offsetX: anchorSize / 2,
                    offsetY: anchorSize / 2,
                    stroke: _this.anchorStroke(),
                    strokeWidth: _this.anchorStrokeWidth(),
                    fill: _this.anchorFill(),
                    cornerRadius: _this.anchorCornerRadius(),
                });
            });
        });
        this._batchChangeChild('.top-left', {
            x: 0,
            y: 0,
            offsetX: anchorSize / 2 + padding,
            offsetY: anchorSize / 2 + padding,
            visible: resizeEnabled && enabledAnchors.indexOf('top-left') >= 0,
        });
        this._batchChangeChild('.top-center', {
            x: width / 2,
            y: 0,
            offsetY: anchorSize / 2 + padding,
            visible: resizeEnabled && enabledAnchors.indexOf('top-center') >= 0,
        });
        this._batchChangeChild('.top-right', {
            x: width,
            y: 0,
            offsetX: anchorSize / 2 - padding,
            offsetY: anchorSize / 2 + padding,
            visible: resizeEnabled && enabledAnchors.indexOf('top-right') >= 0,
        });
        this._batchChangeChild('.middle-left', {
            x: 0,
            y: height / 2,
            offsetX: anchorSize / 2 + padding,
            visible: resizeEnabled && enabledAnchors.indexOf('middle-left') >= 0,
        });
        this._batchChangeChild('.middle-right', {
            x: width,
            y: height / 2,
            offsetX: anchorSize / 2 - padding,
            visible: resizeEnabled && enabledAnchors.indexOf('middle-right') >= 0,
        });
        this._batchChangeChild('.bottom-left', {
            x: 0,
            y: height,
            offsetX: anchorSize / 2 + padding,
            offsetY: anchorSize / 2 - padding,
            visible: resizeEnabled && enabledAnchors.indexOf('bottom-left') >= 0,
        });
        this._batchChangeChild('.bottom-center', {
            x: width / 2,
            y: height,
            offsetY: anchorSize / 2 - padding,
            visible: resizeEnabled && enabledAnchors.indexOf('bottom-center') >= 0,
        });
        this._batchChangeChild('.bottom-right', {
            x: width,
            y: height,
            offsetX: anchorSize / 2 - padding,
            offsetY: anchorSize / 2 - padding,
            visible: resizeEnabled && enabledAnchors.indexOf('bottom-right') >= 0,
        });
        this._batchChangeChild('.rotater', {
            x: width / 2,
            y: -this.rotateAnchorOffset() * Util_1.Util._sign(height) - padding,
            visible: this.rotateEnabled(),
        });
        this._batchChangeChild('.back', {
            width: width,
            height: height,
            visible: this.borderEnabled(),
            stroke: this.borderStroke(),
            strokeWidth: this.borderStrokeWidth(),
            dash: this.borderDash(),
            x: 0,
            y: 0,
        });
    };
    Transformer.prototype.isTransforming = function () {
        return this._transforming;
    };
    Transformer.prototype.stopTransform = function () {
        if (this._transforming) {
            this._removeEvents();
            var anchorNode = this.findOne('.' + this._movingAnchorName);
            if (anchorNode) {
                anchorNode.stopDrag();
            }
        }
    };
    Transformer.prototype.destroy = function () {
        if (this.getStage() && this._cursorChange) {
            this.getStage().content.style.cursor = '';
        }
        Group_1.Group.prototype.destroy.call(this);
        this.detach();
        this._removeEvents();
        return this;
    };
    Transformer.prototype.toObject = function () {
        return Node_1.Node.prototype.toObject.call(this);
    };
    return Transformer;
}(Group_1.Group));
exports.Transformer = Transformer;
function validateAnchors(val) {
    if (!(val instanceof Array)) {
        Util_1.Util.warn('enabledAnchors value should be an array');
    }
    if (val instanceof Array) {
        val.forEach(function (name) {
            if (ANCHORS_NAMES.indexOf(name) === -1) {
                Util_1.Util.warn('Unknown anchor name: ' +
                    name +
                    '. Available names are: ' +
                    ANCHORS_NAMES.join(', '));
            }
        });
    }
    return val || [];
}
Transformer.prototype.className = 'Transformer';
Global_2._registerNode(Transformer);
Factory_1.Factory.addGetterSetter(Transformer, 'enabledAnchors', ANCHORS_NAMES, validateAnchors);
Factory_1.Factory.addGetterSetter(Transformer, 'resizeEnabled', true);
Factory_1.Factory.addGetterSetter(Transformer, 'anchorSize', 10, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Transformer, 'rotateEnabled', true);
Factory_1.Factory.addGetterSetter(Transformer, 'rotationSnaps', []);
Factory_1.Factory.addGetterSetter(Transformer, 'rotateAnchorOffset', 50, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Transformer, 'rotationSnapTolerance', 5, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Transformer, 'borderEnabled', true);
Factory_1.Factory.addGetterSetter(Transformer, 'anchorStroke', 'rgb(0, 161, 255)');
Factory_1.Factory.addGetterSetter(Transformer, 'anchorStrokeWidth', 1, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Transformer, 'anchorFill', 'white');
Factory_1.Factory.addGetterSetter(Transformer, 'anchorCornerRadius', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Transformer, 'borderStroke', 'rgb(0, 161, 255)');
Factory_1.Factory.addGetterSetter(Transformer, 'borderStrokeWidth', 1, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Transformer, 'borderDash');
Factory_1.Factory.addGetterSetter(Transformer, 'keepRatio', true);
Factory_1.Factory.addGetterSetter(Transformer, 'centeredScaling', false);
Factory_1.Factory.addGetterSetter(Transformer, 'ignoreStroke', false);
Factory_1.Factory.addGetterSetter(Transformer, 'padding', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Transformer, 'node');
Factory_1.Factory.addGetterSetter(Transformer, 'nodes');
Factory_1.Factory.addGetterSetter(Transformer, 'boundBoxFunc');
Factory_1.Factory.addGetterSetter(Transformer, 'shouldOverdrawWholeArea', false);
Factory_1.Factory.backCompat(Transformer, {
    lineEnabled: 'borderEnabled',
    rotateHandlerOffset: 'rotateAnchorOffset',
    enabledHandlers: 'enabledAnchors',
});
Util_1.Collection.mapMethods(Transformer);

},{"../Factory":16,"../Global":18,"../Group":19,"../Node":21,"../Shape":23,"../Util":26,"../Validators":27,"./Rect":58}],66:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = require("../Util");
var Factory_1 = require("../Factory");
var Shape_1 = require("../Shape");
var Global_1 = require("../Global");
var Validators_1 = require("../Validators");
var Global_2 = require("../Global");
var Wedge = (function (_super) {
    __extends(Wedge, _super);
    function Wedge() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Wedge.prototype._sceneFunc = function (context) {
        context.beginPath();
        context.arc(0, 0, this.radius(), 0, Global_1.Konva.getAngle(this.angle()), this.clockwise());
        context.lineTo(0, 0);
        context.closePath();
        context.fillStrokeShape(this);
    };
    Wedge.prototype.getWidth = function () {
        return this.radius() * 2;
    };
    Wedge.prototype.getHeight = function () {
        return this.radius() * 2;
    };
    Wedge.prototype.setWidth = function (width) {
        this.radius(width / 2);
    };
    Wedge.prototype.setHeight = function (height) {
        this.radius(height / 2);
    };
    return Wedge;
}(Shape_1.Shape));
exports.Wedge = Wedge;
Wedge.prototype.className = 'Wedge';
Wedge.prototype._centroid = true;
Wedge.prototype._attrsAffectingSize = ['radius'];
Global_2._registerNode(Wedge);
Factory_1.Factory.addGetterSetter(Wedge, 'radius', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Wedge, 'angle', 0, Validators_1.getNumberValidator());
Factory_1.Factory.addGetterSetter(Wedge, 'clockwise', false);
Factory_1.Factory.backCompat(Wedge, {
    angleDeg: 'angle',
    getAngleDeg: 'getAngle',
    setAngleDeg: 'setAngle'
});
Util_1.Collection.mapMethods(Wedge);

},{"../Factory":16,"../Global":18,"../Shape":23,"../Util":26,"../Validators":27}],67:[function(require,module,exports){
var indexOf = function (xs, item) {
    if (xs.indexOf) return xs.indexOf(item);
    else for (var i = 0; i < xs.length; i++) {
        if (xs[i] === item) return i;
    }
    return -1;
};
var Object_keys = function (obj) {
    if (Object.keys) return Object.keys(obj)
    else {
        var res = [];
        for (var key in obj) res.push(key)
        return res;
    }
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

var defineProp = (function() {
    try {
        Object.defineProperty({}, '_', {});
        return function(obj, name, value) {
            Object.defineProperty(obj, name, {
                writable: true,
                enumerable: false,
                configurable: true,
                value: value
            })
        };
    } catch(e) {
        return function(obj, name, value) {
            obj[name] = value;
        };
    }
}());

var globals = ['Array', 'Boolean', 'Date', 'Error', 'EvalError', 'Function',
'Infinity', 'JSON', 'Math', 'NaN', 'Number', 'Object', 'RangeError',
'ReferenceError', 'RegExp', 'String', 'SyntaxError', 'TypeError', 'URIError',
'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape',
'eval', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'undefined', 'unescape'];

function Context() {}
Context.prototype = {};

var Script = exports.Script = function NodeScript (code) {
    if (!(this instanceof Script)) return new Script(code);
    this.code = code;
};

Script.prototype.runInContext = function (context) {
    if (!(context instanceof Context)) {
        throw new TypeError("needs a 'context' argument.");
    }
    
    var iframe = document.createElement('iframe');
    if (!iframe.style) iframe.style = {};
    iframe.style.display = 'none';
    
    document.body.appendChild(iframe);
    
    var win = iframe.contentWindow;
    var wEval = win.eval, wExecScript = win.execScript;

    if (!wEval && wExecScript) {
        // win.eval() magically appears when this is called in IE:
        wExecScript.call(win, 'null');
        wEval = win.eval;
    }
    
    forEach(Object_keys(context), function (key) {
        win[key] = context[key];
    });
    forEach(globals, function (key) {
        if (context[key]) {
            win[key] = context[key];
        }
    });
    
    var winKeys = Object_keys(win);

    var res = wEval.call(win, this.code);
    
    forEach(Object_keys(win), function (key) {
        // Avoid copying circular objects like `top` and `window` by only
        // updating existing context properties or new properties in the `win`
        // that was only introduced after the eval.
        if (key in context || indexOf(winKeys, key) === -1) {
            context[key] = win[key];
        }
    });

    forEach(globals, function (key) {
        if (!(key in context)) {
            defineProp(context, key, win[key]);
        }
    });
    
    document.body.removeChild(iframe);
    
    return res;
};

Script.prototype.runInThisContext = function () {
    return eval(this.code); // maybe...
};

Script.prototype.runInNewContext = function (context) {
    var ctx = Script.createContext(context);
    var res = this.runInContext(ctx);

    if (context) {
        forEach(Object_keys(ctx), function (key) {
            context[key] = ctx[key];
        });
    }

    return res;
};

forEach(Object_keys(Script.prototype), function (name) {
    exports[name] = Script[name] = function (code) {
        var s = Script(code);
        return s[name].apply(s, [].slice.call(arguments, 1));
    };
});

exports.isContext = function (context) {
    return context instanceof Context;
};

exports.createScript = function (code) {
    return exports.Script(code);
};

exports.createContext = Script.createContext = function (context) {
    var copy = new Context();
    if(typeof context === 'object') {
        forEach(Object_keys(context), function (key) {
            copy[key] = context[key];
        });
    }
    return copy;
};

},{}]},{},[7]);
