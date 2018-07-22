var tileHeight    = 20;
var tileWidth     = 20;
var boardHeight   = 10;
var boardWidth    = 10;
var canvasHeight  = 1 + (tileHeight * boardHeight);
var canvasWidth   = 1 + (tileWidth * boardWidth);

var sweeperCanvas;
var sweeperContext;

var sweeperBoard  = Array(100);
var playerBoard   = Array(100).fill(null);

var pendingClearStack = Array(100);
var pendingClearDepth = 0;
var pendingClearTiles = Array(100);

var tileZero  = "#808080";
var tileOne   = "#0100FE";
var tileTwo   = "#017F01";
var tileThree = "#FE0000";
var tileFour  = "#010080";
var tileFlag  = "#000000";

// this shit is eventually going away.
// hopefully sooner rather than later.
// bombs:
// sweeperBoard[19] = "B";
// sweeperBoard[21] = "B";
// sweeperBoard[34] = "B";
// sweeperBoard[35] = "B";
// sweeperBoard[43] = "B";
// sweeperBoard[45] = "B";
// sweeperBoard[66] = "B";
// sweeperBoard[68] = "B";
// sweeperBoard[71] = "B";
// sweeperBoard[72] = "B";
// sweeperBoard[77] = "B";

function tileCoord(row, column) {
  this.row = row;
  this.column = column;
}

function pushPendingClear(tile) {
  //todo: bounds checking should happen. eventually.

  // when I push a pending tile, check a 3rd 'pendingtiles' array
  // to see if that tile is already pending. if not pending, mark it,
  // push it onto pendingClearStack. if pending, do nothing.
  // when popping, won't remove notation from 3rd array because it
  // doesn't matter
  var idx = tile.column + (tile.row * boardWidth);
  if(pendingClearTiles[idx] != "pending") {
    pendingClearStack[pendingClearDepth++] = tile;
    pendingClearTiles[idx] = "pending";
  }
}

function popPendingClear() {
  return pendingClearStack[--pendingClearDepth];
}

function hasPendingClear() {
  return pendingClearDepth > 0;
}

// explanation on how this works:
//    http://diveintohtml5.info/canvas.html#halma
function getCursorPosition(event) {
  var x;
  var y;
  if(event.pageX != undefined && event.pageY != undefined) {
    x = event.pageX;
    y = event.pageY;
  } else {
    x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  x -= sweeperCanvas.offsetLeft;
  y -= sweeperCanvas.offsetTop;

  var tilePos = new tileCoord(Math.floor(y/tileHeight),Math.floor(x/tileWidth));
  return tilePos;
}

function sweeperClick(event) {
  // get which tile (x,y) I clicked
  var tile = getCursorPosition(event);
  // turn tile (x,y) into array position
  var sweeperIdx = tile.column + (tile.row * boardWidth);

  // handle shift+click (flagging)
  if(event.shiftKey == true) {
    // has this tile already been flagged?
    if(playerBoard[sweeperIdx] == "F") {
      //   yes flag: unflag
      playerBoard[sweeperIdx] = null;
      clearFlag(tile);
    } else if(playerBoard[sweeperIdx] == null) {
      // no flag and no number (hasn't been cleared): flag it
      playerBoard[sweeperIdx] = "F";
      drawTile(tile, "F");
    }
  } else {
    // is the tile I clicked flagged? if no, we can do stuff.
    if(playerBoard[sweeperIdx] != "F") {
      // is sweeperBoard[sweeperIdx] a bomb?
      if(sweeperBoard[sweeperIdx] == "B") {
        // yes: uh... figure out later (pretend never a bomb)
      } else {
        // no:
        //   have I been clicked before? no:
        if(playerBoard[sweeperIdx] == null) {
          //   calculate num of surrounding bombs
          var bombCount = countAdjBombs(tile);
          playerBoard[sweeperIdx] = bombCount;
          drawTile(tile, bombCount);
          if(bombCount == "0") {
            clearPropagate(tile);
          }
        }
      }
    }
  }
}

function clearPropagate(tile) {
  pushPendingClear(tile);

  while(hasPendingClear()) {
    var tileToClear = popPendingClear();
    var xCtr = tileToClear.column;
    var yCtr = tileToClear.row;
    var xMin = Math.max(xCtr - 1, 0);
    var yMin = Math.max(yCtr - 1, 0);
    var xMax = Math.min(xCtr + 1, boardWidth - 1);
    var yMax = Math.min(yCtr + 1, boardHeight - 1);

    for(var x = xMin; x <= xMax; x++) {
      for(var y = yMin; y <= yMax; y++) {
        var idx = x + (y * boardWidth);
        var tempTile = new tileCoord(y, x);

        if(playerBoard[idx] == null) {
          var bombs = countAdjBombs(tempTile);
          playerBoard[idx] = bombs;
          drawTile(tempTile, bombs);

          if(bombs == "0") {
            pushPendingClear(tempTile);
          }
        }
      }
    }
  }
}

function countAdjBombs(tile) {
  //   calculates the num of surrounding bombs
  var xCenter = tile.column;
  var yCenter = tile.row;
  var bombs = 0;
  var xMin = Math.max(xCenter - 1, 0);
  var yMin = Math.max(yCenter - 1, 0);
  var xMax = Math.min(xCenter + 1, boardWidth - 1);
  var yMax = Math.min(yCenter + 1, boardHeight - 1);

  for(var x = xMin; x <= xMax; x++) {
    for(var y = yMin; y <= yMax; y++) {
      bombs += (sweeperBoard[x + (y * boardWidth)] == "B");
    }
  }

  return bombs.toString();
}

function drawBoard() {
  // lines: first veritical then horizontal
  for(var x = 0.5; x <= canvasWidth; x += tileWidth) {
    sweeperContext.moveTo(x, 0);
    sweeperContext.lineTo(x, canvasHeight);
  }
  for(var y = 0.5; y <= canvasHeight; y += tileHeight) {
    sweeperContext.moveTo(0, y);
    sweeperContext.lineTo(canvasWidth, y);
  }

  sweeperContext.strokeStyle = "#808080";
  sweeperContext.stroke();
}

function drawTile(tileCoord, tileToDraw) {
  var x = (tileCoord.column + 0.5) * tileWidth;
  var y = ((tileCoord.row + 1) * tileHeight) - 2;
  sweeperContext.font = "20px monospace";
  sweeperContext.textAlign = "center";

  // "0" - "4", "F"
  switch(tileToDraw) {
    case "0":
      sweeperContext.fillStyle = tileZero;
      sweeperContext.fillText("0", x, y);
      break;
    case "1":
      sweeperContext.fillStyle = tileOne;
      sweeperContext.fillText("1", x, y);
      break;
    case "2":
      sweeperContext.fillStyle = tileTwo;
      sweeperContext.fillText("2", x, y);
      break;
    case "3":
      sweeperContext.fillStyle = tileThree;
      sweeperContext.fillText("3", x, y);
      break;
    case "4":
      sweeperContext.fillStyle = tileFour;
      sweeperContext.fillText("4", x, y);
      break;
    case "F":
      sweeperContext.fillStyle = tileFlag;
      sweeperContext.fillText("F", x, y);
      break;
    default:
      // right now, do nothing.
  }
}

function clearFlag(tileCoord) {
  var x = (tileCoord.column * tileWidth) + 1;
  var y = (tileCoord.row * tileHeight) + 1;
  sweeperContext.clearRect(x, y, 18, 18);
}

function newGame() {
  var tempArray = Array(100);
  for(var i = 0; i < 100; i++) {
    tempArray[i] = {name: i, value: Math.random()};
  }
  tempArray.sort(function(a, b) {
    return a.value - b.value;
  });
  for(var i = 0; i < 11; i++) {
    sweeperBoard[tempArray[i].name] = "B";
  }
  console.log(sweeperBoard);
}

function initSweeper(canvasEl) {
  if(!canvasEl) {
    canvasEl = document.createElement("canvas");
    canvasEl.id = "sweeper";
    canvasEl.setAttribute("style", "background: #C0C0C0;");
    document.body.appendChild(canvasEl);
  }
  sweeperCanvas = canvasEl;
  sweeperCanvas.width = canvasWidth;
  sweeperCanvas.height = canvasHeight;
  sweeperCanvas.addEventListener("click", sweeperClick, false);
  sweeperContext = sweeperCanvas.getContext("2d");

  newGame();
  drawBoard();
}
