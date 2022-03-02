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
