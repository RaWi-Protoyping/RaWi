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
    x: 0,
    y: 0,
    width: text.width(),
    height: text.height(),
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

  guiNode.uiCompObjects.push(newCompObj);
  var currGroup = currentShape.getParent().getParent();

  currGroup.add(labelGroup);
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
    text: buttonText,
    id: newId + '_img',
    name: newId + '_img',
    fontSize,
    fill: fontColor,
    verticalAlign: 'middle',
    align: 'center',
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


  let buttonFill = new Konva.Rect({
    width: text.width(),
    height: text.height(),
    fill: buttonColor,
    cornerRadius: text.width() / 15,
    id: newId + '_img',
    name: newId + '_img',
  });

  if (extraInformation) {
    buttonFill.setAttr('fixedWidth', buttonFill.width());
    buttonFill.setAttr('fixedHeight', buttonFill.height());
  }

  let box = new Konva.Rect({
    x: buttonFill.x(),
    y: buttonFill.y(),
    width: buttonFill.width(),
    height: buttonFill.height(),
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

  guiNode.uiCompObjects.push(newCompObj);

  //fire these two events in order to display component correctly
  buttonGroup.fire('dragstart');
  buttonGroup.fire('dragend');

  if (extraInformation) {
    buttonGroup.fire('dblclick');
  }

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
    x: buttonFill.x(),
    y: buttonFill.y(),
    width: buttonFill.width(),
    height: buttonFill.height(),
    stroke_ori: 'green',
    stroke: 'green',
    strokeWidth: 2,
    opacity: 0.3,
    id: boxId,
    name: boxId,
  });

  //set editable on box to true
  box.setAttr('editable', true);

  box.on('mousedown', (e) => addBoxTransitionEventListener(e, box));
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

  text.width(inputWidth - 10);

  text.height(text.getTextHeight() + inputExtraHeight);

  if (extraInformation) {
    text.width(extraInformation.width);
    text.height(extraInformation.height);
    inputWidth = extraInformation.width;
  }

  let inputFill = new Konva.Rect({
    x: 0,
    y: 0,
    width: inputWidth,
    height: text.height(),
    fill: inputColor,
    opacity: 0.3,
    id: newId + '_img',
    name: newId + '_img',
  });

  inputFill.setAttr('inputSize', inputSize);
  if (extraInformation) inputFill.setAttr('inputSize', 'custom');

  let box = new Konva.Rect({
    x: inputFill.x(),
    y: inputFill.y(),
    width: inputFill.width(),
    height: inputFill.height(),
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
    x: 0,
    y: 0,
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
