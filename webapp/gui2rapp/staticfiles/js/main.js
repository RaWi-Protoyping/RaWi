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
const { getNextId } = require('./helpers');
const { vars } = require('./vars');
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
  nodeId = nodeId.slice(0, nodeId.length - 2);
  guiNode = guiNodes.find(
    (n) => n.id == currentShape.getParent().getAttr('id')
  );
  if (!guiNode.editable) {
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
});

window.addEventListener('click', () => {

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
    stage.getPointerPosition().y + 90 + 'px';
  menuNode.style.left =
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

container.tabIndex = 1;
container.focus();

const DELTA = 4;

container.addEventListener('keydown', function (e) {
  if (e.keyCode === 46 || e.keyCode === 8) {
    if (currentSelectedComp.value) {

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

query = 'login remember account';
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
  e.preventDefault();
});

container.addEventListener('drop', function (e) {
  e.preventDefault();
  stage.setPointersPositions(e);

  addGUIToEditor(
    guiIndexDrag,
    stage.getPointerPosition().x,
    stage.getPointerPosition().y,
    isEditModeOn.value
  );
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


    box.width(fill.width());
    box.height(fill.height());
    box.x(fill.x());
    box.y(fill.y());

    buttonGroup.setAttr('width', box.width());
    buttonGroup.setAttr('height', box.height());
    buttonGroup.fire('dragend');

    //update ui comp object in data model
    let dataModelId = buttonIdSpan.dataset.buttonId.split('_');
    let compId = dataModelId[0] + '_' + dataModelId[1] + '_' + dataModelId[2];
    let nodeId = dataModelId[0] + '_' + dataModelId[1];

    let nodeObj = guiNodes.find((node) => node.id === nodeId);
    let compObj = nodeObj.uiCompObjects.find((comp) => comp.id === compId);

    if (compObj) {
      compObj['crop_group'] = buttonGroup.clone();
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


    inputGroup.setAttr('width', box.width());
    inputGroup.setAttr('height', box.height());

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
      x: 0,
      y: 0,
      width: imageSizeWidth,
      height: imageSizeHeight,
      fill: imageColor,

      id: newId + '_img',
      name: newId + '_img',
    });

    let box = new Konva.Rect({
      x: image.x(),
      y: image.y(),
      width: image.width(),
      height: image.height(),
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

    guiNode.uiCompObjects.push(newCompObj);
    var currGroup = currentShape.getParent().getParent();

    currGroup.add(imageGroup);

    imageGroup.fire('dragend');
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


    imageGroup.setAttr('width', box.width());
    imageGroup.setAttr('height', box.height());
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