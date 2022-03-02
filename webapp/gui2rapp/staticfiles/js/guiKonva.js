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

function addGrid(layer, blockSnapSize) {
  var padding = blockSnapSize;
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
  updateObjects();
  //Update the player
  if (guiNodes) {
    createKonvaPlayer();
  }
}

function computeIntersections(e, pointerPosition) {
  var target = e.target;
  var pointerRect = {
    x: pointerPosition.x,
    y: pointerPosition.y,
    width: 2,
    height: 2,
  };
  interRectIds = [];
  layer.children.each(function (component) {

    let compRect = {
      x: component.x(),
      y: component.y(),
      width: component.width(),
      height: component.height(),
    };
    if (Konva.Util.haveIntersection(compRect, pointerRect)) {
      if (component.getAttr('id')) {
        interRectIds.push(component.getAttr('id'));
      }
    }
    // do not need to call layer.draw() here
    // because it will be called by dragmove action
  });
  let tempIdArr = interRectIds.slice();
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
  intersectionId = filteredInterRectIds[filteredInterRectIds.length - 1];
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
    var detectedColor = colorThief.getColor(image);
    var detextedHexColor = rgbToHex(
      detectedColor[0],
      detectedColor[1],
      detectedColor[2]
    );

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
    darthNode.visible(false);
    group.add(darthNode);
  } else {
    group.add(darthNode);
    darthNode.setZIndex(0);
  }

  // add cursor styling
  darthNode.on('mouseover', function () {
    document.body.style.cursor = 'pointer';
  });
  darthNode.on('mouseout', function () {
    document.body.style.cursor = 'default';
  });

  let forCondition = blank ? 10 : uiCompObjects.length;
  let forBegin = blank ? 9 : 0;

  for (let i = forBegin; i < forCondition; i++) {
    currUICompObject = uiCompObjects[i];
    comp_bounds = currUICompObject['comp_bounds'];
    comp_label = currUICompObject['comp_label'];
    let a = comp_bounds;
    let factor =
      (1440 / image.width) * (1 / scaling_factor) * (image.width / 540);
    normalizedA = a.map(function (x) {
      return x / factor;
    });
    let width = normalizedA[2] - normalizedA[0];
    let height = normalizedA[3] - normalizedA[1];
    let unnormWidth = a[2] - a[0];
    let unnormHeight = a[3] - a[1];

    stroke_color = component_color_mapping[comp_label] || 'black';
    stroke_color = 'blue';
    name = `gui_${index}_${i}`;
    // Set the id we use to identify the konva ui comp group also in the data model
    uiCompObjects[i]['id'] = name;
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
          crop.setAttr('name', name + '_img');
          crop.setAttr('id', name + '_img');
        } else {
          crop.forEach((c) => {
            c.setAttr('comp_label', comp_label);
            c.setAttr('x', 0);
            c.setAttr('y', 0);
            c.visible(true);
            c.moveToTop();
            c.setAttr('name', name + '_img');
            c.setAttr('id', name + '_img');
          });
        }

        var box2 = new Konva.Rect({
          x: 0,
          y: 0,
          width: width,
          height: height,
          stroke_ori: stroke_color,
          stroke: stroke_color,
          strokeWidth: 2,
          opacity: 0.3,
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
                  co['zIndex']
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
            var copiedUICompObject = Object.assign({}, uiCompObject1);
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
            }
            createKonvaPlayer();
            updateObjects();
          } else {
            // We need to transform it back to original scale
            var newX1 = e.target.x() * factor;
            var newY1 = e.target.y() * factor;
            var newX2 = (e.target.x() + e.target.width()) * factor;
            var newY2 = (e.target.y() + e.target.height()) * factor;
            var parentNode = e.target.getParent();
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
            guiNode1.uiCompObjects[uiCompObjectIndex]['updated_comp_bounds'] = [
              newX1,
              newY1,
              newX2,
              newY2,
            ];
          }
          createKonvaPlayer();
        });

        group.add(compGroup);

        box2.setAttr('editable', true);
        box2.on('mousedown', function (e) {
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
            console.log(currentSelectedComp.value);
          }
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
        id: name,
        name: name,
      });
      box2.setAttr('editable', false);
      group.add(box2);
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
      });
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

  layer.add(group);
  stage.add(layer);

  for (i = 0; i < uiCompObjects.length; i++) {
    if (uiCompObjects[i]['comp_label'] == 'Icon') {
      var iconNode = layer.findOne(`#${uiCompObjects[i]['id']}`);
      iconNode.moveToTop();
    }
  }
  updateObjects();
  layer.batchDraw();
  //Update the player
  if (guiNodes) {
    createKonvaPlayer();
  }

  //add gui to guisLoaded
  importHelper.guisLoaded.push(tempIndex);
}

function getUICompObjects(
  jsonDataCombined,
  jsonDataSemantic,
  jsonDataCombinedExtended
) {

  uiCompObjects = [];
  compLabelParents = JSONPath({
    path: '$..componentLabel^',
    json: jsonDataSemantic,
  });
  if (jsonDataCombinedExtended) {
    compLabelParents = jsonDataCombinedExtended['ui_comps'];
    let uiCompGroups = getUICompGroups(jsonDataCombinedExtended);
    uiCompGroups.forEach((g) => {
      uiCompObjects.push(g);
    });
  }
  for (i = 0; i < compLabelParents.length; i++) {
    currCompLabelParent = compLabelParents[i];
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
    });
  });
  return uiCompGroups;
}

function createKonvaPlayer() {

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

    scaling_factor = 0.5;

    var imgNodePlay = new Konva.Image({
      x: 0,
      y: 0,
      image: guiNode.image,
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
      var detextedHexColor = rgbToHex(
        detectedColor[0],
        detectedColor[1],
        detectedColor[2]
      );
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

      imgNodePlay.visible(false);
      groupPlay.add(imgNodePlay);
    } else {
      groupPlay.add(imgNodePlay);
      imgNodePlay.setZIndex(0);
    }


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
      normalizedA = a.map(function (x) {
        return x / factor;
      });
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

            var box2Play = new Konva.Rect({
              x: 0,
              y: 0,
              width: width,
              height: height,
              stroke_ori: stroke_color,
              stroke: stroke_color,
              strokeWidth: 2,
              opacity: 0.3,
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
            normalizedA1 = a1.map(function (x) {
              return x / factor;
            });
            let width1 = normalizedA1[2] - normalizedA1[0];
            let height1 = normalizedA1[3] - normalizedA1[1];

            var compGroup = new Konva.Group({
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
            compGroup.add(crop);
            compGroup.add(box2Play);
            groupPlay.add(compGroup);


          } else {
            //Use the updated comp positions to change the group position
            updated_comp_bounds = currUICompObject['updated_comp_bounds'];
            let a1 = updated_comp_bounds;
            let factor =
              (1440 / guiNode.image.width) *
              (1 / scaling_factor) *
              (guiNode.image.width / 540) *
              (1 / scalingPlayer);
            normalizedA1 = a1.map(function (x) {
              return x / factor;
            });
            let width1 = normalizedA1[2] - normalizedA1[0];
            let height1 = normalizedA1[3] - normalizedA1[1];

            compGroup = currUICompObject['crop_group'];
            compGroup.setAttr('x', normalizedA1[0]);
            compGroup.setAttr('y', normalizedA1[1]);
            compGroup.setAttr('width', width1);
            compGroup.setAttr('height', height1);
            compGroup.children.each(function (child) {
            });
            crop = compGroup.find(`#${compGroup.getAttr('id') + '_img'}`);

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

            box2Play.off('mousedown');
            box2Play.setAttr('fill', undefined);
          }

          for (let t of transitions) {
            if (t.from == box2Play.getAttr('id')) {
              box2Play.setAttr('fill', 'green');
              box2Play.setAttr('opacity', 0.2);
              box2Play.on('mousedown', function () {
                this.getParent().getParent().moveToBottom();
                var nextNode = layerPlay.findOne(`#${t.to}`);
                nextNode.moveToTop();
                guiStack.push(this.getParent().getParent().getAttr('id'));
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

      } else {
        if (showUICinPreview.value) {
          stroke_color = component_color_mapping[comp_label] || 'black';
        } else {
          stroke_color = undefined;
        }
        name = `${guiNode.id}_${i}`;
        var box2Play = new Konva.Rect({
          x: normalizedA[0],
          y: normalizedA[1],
          width: width,
          height: height,
          stroke_ori: stroke_color,
          stroke: stroke_color,
          strokeWidth: 2,
          opacity: 0.2,
          id: name,
          name: name,
        });
        groupPlay.add(box2Play);
        for (let t of transitions) {
          if (t.from == box2Play.getAttr('id')) {
            box2Play.setAttr('fill', 'green');
            box2Play.on('mousedown', function () {
              this.getParent().moveToBottom();
              var nextNode = layerPlay.findOne(`#${t.to}`);
              nextNode.moveToTop();
              guiStack.push(this.getParent().getAttr('id'));
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
    layerPlay.children.each(function (child) {
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
          console.log(notGroupNode.getAttr('zIndex'));
        }
      }
    }
    for (i = 0; i < guiNode.uiCompObjects.length; i++) {
      if (guiNode.uiCompObjects[i]['comp_label'] == 'Icon') {
        var iconNode = groupPlay.findOne(`#${guiNode.uiCompObjects[i]['id']}`);
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

  imgNodeClone.setAttr('x', x1);
  imgNodeClone.setAttr('y', y1);
  imgNodeClone.setAttr('width', width1);
  imgNodeClone.setAttr('height', height1);

  var crop = imgNodeClone.crop({
    x: x2,
    y: y2,
    width: width2,
    height: height2,
  });

  return crop;
}

function updateObjects() {
  transitions.forEach((transition) => {
    var transArrow = layer.findOne(`#${transition.id}`);
    var fromNode = layer.findOne(`#${transition.from}`);
    var toNode = layer.findOne(`#${transition.to}`);
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
  normalizedA = a.map(function (x) {
    return x / factor;
  });
  let width = normalizedA[2] - normalizedA[0];
  let height = normalizedA[3] - normalizedA[1];

  if (showUICinPreview.value) {
    stroke_color = 'white';
  } else {
    stroke_color = undefined;
  }
  name = `${guiNode.id}_back_btn`;
  var backButton = new Konva.Rect({
    x: normalizedA[0],
    y: normalizedA[1],
    width: width,
    height: height,
    opacity: 0.05,
    id: name,
    name: name,
  });
  groupPlay.add(backButton);
  backButton.on('mouseover', function () {
    document.body.style.cursor = 'pointer';
  });
  backButton.on('mouseout', function () {
    document.body.style.cursor = 'default';
  });

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
    allGuiNodes = guiNodes.map((n) => n.id);
    startGuiNodes = allGuiNodes.filter((e) => !toGuiNodes.includes(e));
    if (startGuiNodes.length == 0) {
      return allGuiNodes[0];
    } else {
      fromGuiNodes = transitions.map(
        (t) => t.from.split('_')[0] + '_' + t.from.split('_')[1]
      );
      return modeI(fromGuiNodes);
    }
  }

}

function removeAllTransitionsForGUINode(guiNode) {
  mappings = transitions.map((t) => [t.to, t.from]);
  matches = transitions.filter(
    (t) => t.to == guiNode.id || t.from.includes(guiNode.id)
  );
  var arrowNodes = matches.map((t) => layer.findOne(`#${t.id}`));
  for (i = 0; i < arrowNodes.length; i++) {
    arrowNodes[i].remove();
  }
  matchesIndexes = matches.map((m) => transitions.indexOf(m));
  while (matchesIndexes.length) {
    transitions.splice(matchesIndexes.pop(), 1);
  }
  layer.batchDraw();
}

function removeUIComponent(uiComponent, isParent = false) {
  var uiCompParent = uiComponent.getParent();
  if (isParent) {
    uiCompParent = uiComponent;
  }
  var splitIds = uiCompParent.getAttr('id').split('_');
  var guiNodeId = splitIds[0] + '_' + splitIds[1];
  //Find guiNode and remove the ui component from the data model
  var guiNode = guiNodes.find((n) => n.id == guiNodeId);
  var uiCompObject = guiNode.uiCompObjects.find(
    (n) => n['id'] == uiCompParent.getAttr('id')
  );
  var uiCompObjectIndex = guiNode.uiCompObjects.indexOf(uiCompObject);
  guiNode.uiCompObjects.splice(uiCompObjectIndex, 1);

  matches = transitions.filter((t) => t.from == uiCompParent.getAttr('id'));
  var arrowNodes = matches.map((t) => layer.findOne(`#${t.id}`));
  for (i = 0; i < arrowNodes.length; i++) {
    arrowNodes[i].remove();
  }
  matchesIndexes = matches.map((m) => transitions.indexOf(m));
  while (matchesIndexes.length) {
    transitions.splice(matchesIndexes.pop(), 1);
  }

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

  let shadowGuisLength = shadowGuis.length;
  for (let i = shadowGuisLength - 1; i >= 0; i--) {
    shadowGuis[i].destroy();
  }
  //Update the player
  if (guiNodes) {
    createKonvaPlayer();
  }
  currentSelectedComp.value = null;
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


function addBoxTransitionEventListener(e, box) {
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
