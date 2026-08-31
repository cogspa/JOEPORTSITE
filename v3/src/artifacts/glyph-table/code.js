// Glyph Table — Figma plugin main thread.
// Responsibilities: clientStorage bridge, scanning the page for glyph frames,
// and inserting drawn glyphs onto the canvas. All font math lives in the UI.

figma.showUI(__html__, { width: 780, height: 660, themeColors: true });

// Frame names the compiler recognizes: any single character, or these aliases.
var NAME_ALIASES = {
  space: " ", period: ".", comma: ",", colon: ":", semicolon: ";",
  slash: "/", quote: "'", dquote: '"', hyphen: "-", question: "?", exclaim: "!"
};

function frameChar(name) {
  var n = name.trim();
  if (n.length === 1) return n;
  var lower = n.toLowerCase();
  if (NAME_ALIASES[lower] !== undefined) return NAME_ALIASES[lower];
  return null;
}

function matMul(a, b) {
  // 2x3 affine: [[a,c,e],[b,d,f]]
  return [
    [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1], a[0][0] * b[0][2] + a[0][1] * b[1][2] + a[0][2]],
    [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1], a[1][0] * b[0][2] + a[1][1] * b[1][2] + a[1][2]]
  ];
}
var IDENTITY = [[1, 0, 0], [0, 1, 0]];

function collectGeometry(node, m, out) {
  var fills = node.fillGeometry || [];
  var strokes = node.strokeGeometry || [];
  var i;
  for (i = 0; i < fills.length; i++) out.push({ data: fills[i].data, m: m });
  for (i = 0; i < strokes.length; i++) out.push({ data: strokes[i].data, m: m });
  if ("children" in node) {
    for (i = 0; i < node.children.length; i++) {
      var c = node.children[i];
      if (c.visible === false || c.locked === true) continue;
      collectGeometry(c, matMul(m, c.relativeTransform), out);
    }
  }
}

function scanPage() {
  var frames = [];
  var kids = figma.currentPage.children;
  for (var i = 0; i < kids.length; i++) {
    var f = kids[i];
    if (f.type !== "FRAME" && f.type !== "COMPONENT") continue;
    var ch = frameChar(f.name);
    if (ch === null) continue;
    var geoms = [];
    for (var j = 0; j < f.children.length; j++) {
      var c = f.children[j];
      if (c.visible === false || c.locked === true) continue;
      collectGeometry(c, c.relativeTransform, geoms);
    }
    frames.push({ char: ch, name: f.name, w: f.width, h: f.height, geoms: geoms });
  }
  return frames;
}

figma.ui.onmessage = function (msg) {
  if (msg.type === "save") {
    figma.clientStorage.setAsync(msg.key, msg.value).then(function () {
      figma.ui.postMessage({ type: "saved", id: msg.id });
    });
  } else if (msg.type === "load") {
    figma.clientStorage.getAsync(msg.key).then(function (value) {
      figma.ui.postMessage({ type: "loaded", id: msg.id, value: value === undefined ? null : value });
    });
  } else if (msg.type === "scan") {
    figma.ui.postMessage({ type: "scan-result", id: msg.id, frames: scanPage() });
  } else if (msg.type === "insert") {
    var v = figma.createVector();
    v.vectorPaths = [{ windingRule: "NONZERO", data: msg.pathData }];
    v.fills = [{ type: "SOLID", color: { r: 0.09, g: 0.12, b: 0.18 } }];
    v.strokes = [];
    v.name = "glyph " + msg.char;
    var center = figma.viewport.center;
    v.x = Math.round(center.x - v.width / 2);
    v.y = Math.round(center.y - v.height / 2);
    figma.currentPage.appendChild(v);
    figma.currentPage.selection = [v];
    figma.notify("Placed \u201C" + msg.char + "\u201D on the canvas");
  } else if (msg.type === "make-template") {
    makeTemplate();
  } else if (msg.type === "notify") {
    figma.notify(msg.text);
  }
};

// Lays out empty, correctly proportioned frames for A–Z a–z 0–9 so the
// pen-tool workflow starts from a ready grid. Frame height maps to the
// full ascender→descender band; guides mark baseline / x-height / cap.
function makeTemplate() {
  var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var H = 500; // px per frame; 1 px = 2 font units
  var W = 300;
  var GAP = 60;
  var PER_ROW = 13;
  var startX = Math.round(figma.viewport.center.x);
  var startY = Math.round(figma.viewport.center.y);
  var made = [];
  for (var i = 0; i < CHARS.length; i++) {
    var f = figma.createFrame();
    f.name = CHARS[i];
    f.resize(W, H);
    f.x = startX + (i % PER_ROW) * (W + GAP);
    f.y = startY + Math.floor(i / PER_ROW) * (H + GAP + 40);
    f.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    // guide lines: ascender(top=0) cap xheight baseline descender(bottom)
    var lines = [
      { y: H * 0.1, w: 1 },  // cap (700 of 1000 band → 10% from top of 800..-200 span)
      { y: H * 0.3, w: 1 },  // x-height (500)
      { y: H * 0.8, w: 2 }   // baseline (0)
    ];
    for (var L = 0; L < lines.length; L++) {
      var ln = figma.createLine();
      ln.resize(W, 0);
      ln.x = 0;
      ln.y = lines[L].y;
      ln.strokes = [{ type: "SOLID", color: { r: 0.55, g: 0.7, b: 0.85 } }];
      ln.strokeWeight = lines[L].w;
      ln.locked = true;
      f.appendChild(ln);
    }
    made.push(f);
  }
  figma.viewport.scrollAndZoomIntoView(made);
  figma.notify("Template ready \u2014 draw inside the frames, guides are locked");
}
