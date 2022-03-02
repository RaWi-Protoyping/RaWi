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
  return [x1, y1, x2, y2];
}

function getArrowPoints2(fromNode, toNode) {
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

  var nextId = Math.max.apply(null, idMapping) + 1;

  return nextId;
}


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
