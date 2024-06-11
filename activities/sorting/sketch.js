/*
 * Game: Sorting
 * Project: LKCNHM Musee
 * Description: Drag and drop game to sort insect to categories. Insect snap to the box when correct.
 * Library: p5.js, p5play
 * Author: @kent12t @didny
 * Last Modified: 2023-04-13
 */

let gameState = new GameState("sorting");

// draggable object position
let draggableDefault = {};

// draggable object position
let initPos = {};

// draggable object arrays
let draggables = [];
let draggableTable = [];
let draggableLoaded = false;

// airtable data
let targetableData;
let draggableData;

// area object arrays
let targetAreas = {};
let targetAreaTable = [];
let targetAreaLoaded = false;

// score
let activeDraggableId = 0;
// correct/wrong overlay
let overlayTimer = 0;
let isDone = [];

// playing area
const framePadding = 5;
const targetWidth = window.innerWidth;
const targetHeight = 0.8 * window.innerHeight;

// one off assets
let trayImg, bgImg;
let Lato = {};

// buttons
let navButtons = [];

const DEBUG = false;

function preload() {
  width = window.innerWidth;
  height = window.innerHeight;

  draggableDefault = {
    x: window.innerWidth / 2,
    y: window.innerHeight * 0.2,
  };

  // load assets
  headingFont = loadFont(HeadingUrl);
  for (let key in LatoUrl) {
    Lato[key] = loadFont(LatoUrl[key]);
  }
  trayImg = loadImage("../../assets/images/insect-sorting/sorting-tray.png");
  bgImg = loadImage("../../assets/images/insect-sorting/sorting-bg.png");

  // load the json files

  try {
    //targetableData = loadTargetAreas("InsectAreas");
    targetableData = loadTargetAreasFromJson(
      "../../assets/jsons/insect_areas.json"
    );
  } catch (error) {
    console.log(error);
    // location.reload();
  }

  try {
    //draggableData = loadDraggables("InsectItems");
    draggableData = loadDraggablesFromJson(
      "../../assets/jsons/insect_items.json"
    );
  } catch (error) {
    console.log(error);
  } finally {
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // important to set a return point / reference
  // all draggables will appear here
  draggableDefault = {
    x: window.innerWidth / 2,
    y: window.innerHeight * 0.2,
  };

  navButtons.push(
    new NavButton(
      width * 0.1,
      draggableDefault.y,
      width * 0.15,
      width * 0.15,
      prevDraggable,
      "left",
      "rgba(0, 0, 0, 0)",
      Forest
    )
  );
  navButtons.push(
    new NavButton(
      width * 0.9,
      draggableDefault.y,
      width * 0.15,
      width * 0.15,
      nextDraggable,
      "right",
      "rgba(0, 0, 0, 0)",
      Forest
    )
  );
  // tell Flutter screen the first draggable name
  sendActiveDraggableName();
}

function draw() {
  background(color(Sand));

  if (gameState.state == "loading") {
    drawLoadingScreen();

    if (targetAreaLoaded && draggableLoaded && !gameState.loaded) {
      draggables[activeDraggableId].active = true;
      gameState.setState("gameplay");
    }
  } else if (gameState.state == "gameplay") {
    push();
    imageMode(CORNER);
    // constrain bg to width and prevent excessive stretching
    let minBgHeight = (width * bgImg.height) / bgImg.width;
    image(bgImg, 0, 0 - (minBgHeight - height) / 2, width, minBgHeight);

    imageMode(CENTER);
    // tray img exactly at the return point of draggables
    image(
      trayImg,
      draggableDefault.x,
      draggableDefault.y,
      width * 0.525,
      height * 0.15
    );
    pop();

    isDone = draggables.map((a) => a.done);

    navButtons.forEach((b) => b.display());
    // display the target areas
    drawTargetArea();

    // technically active ele is their score lol weirdly enough, tho can defo use a score count also

    // follow mouse on drag
    for (let i = 0; i < draggables.length; i++) {
      if (i == activeDraggableId) {
        draggables[i].update();
        draggables[i].display();
        draggables[i].active = true;
      } else {
        draggables[i].active = false;
        draggables[i].update();
      }
    }

    // draw the correctness overlay animation
    // currently its not clear when the overlay is shown.
    screenFlash();

    if (draggables.every((a) => a.done)) {
      console.log("completed");
      // once the game is completed, this loop will not happen again
      gameState.setState("completed");
    }
  } else if (gameState.state == "completed") {
    push();
    imageMode(CORNER);
    // constrain bg to width and prevent excessive stretching
    let minBgHeight = (width * bgImg.height) / bgImg.width;
    image(bgImg, 0, 0 - (minBgHeight - height) / 2, width, minBgHeight);

    imageMode(CENTER);
    // tray img exactly at the return point of draggables
    image(
      trayImg,
      draggableDefault.x,
      draggableDefault.y,
      width * 0.525,
      height * 0.15
    );
    pop();

    navButtons.forEach((b) => b.display());
    drawTargetArea();

    // follow mouse on drag
    for (let i = 0; i < draggables.length; i++) {
      draggables[i].update();
      draggables[i].display();
    }
  }
}

function mousePressed() {
  // the if check make sure it catches any error, pressing reset button once (activeEle == objects.length) is giving a lot of issues
  if (activeDraggableId < draggables.length && gameState.state == "gameplay") {
    if (draggables[activeDraggableId].handlePress()) {
      sendActiveDraggableName();
    }
  }
  navButtons.forEach((button) => button.handlePress());
}

function mouseReleased() {
  // the if check make sure it catches any error, pressing reset button once (activeEle == objects.length) is giving a lot of issues
  if (activeDraggableId < draggables.length) {
    if (!draggables[activeDraggableId].done) {
      draggables[activeDraggableId].checkCorrectArea();
    }
  }
}

function correctColor(alpha = 1) {
  // returns a p5 color item with alpha when answer is correct
  return `rgba(0,255,0,${alpha})`;
}

function wrongColor(alpha = 1) {
  // returns a p5 color item with alpha when answer is wrong
  return `rgba(255,0,0,${alpha})`;
}

// draw the correctness overlay animation
function screenFlash() {
  push();
  rectMode(CENTER);

  // for overlay
  // if incorrect
  if (overlayTimer < 0) {
    // turns transparent
    fill(wrongColor(-overlayTimer / 100));
    overlayTimer++;
  } else if (overlayTimer > 0) {
    // turns transparent
    fill(correctColor(overlayTimer / 100));
    overlayTimer--;
  } else if (overlayTimer == 0) {
    // dont show overlay
    fill(`rgba(0,0,0,0)`);
  }

  rect(width / 2, height / 2, width, height);
  pop();
}

function drawTargetArea() {
  for (const key in targetAreas) {
    push();
    rectMode(CENTER);
    imageMode(CENTER);
    targetAreas[key].display();
    pop();
  }
}

function drawAllDraggables() {}

// TODO: make this more abstract so that it can be used for other activities
//       and shift to gameLogic.js
function sendActiveDraggableName() {
  if (typeof draggables[activeDraggableId] !== "undefined") {
    console
      .log
      // `select draggables[${activeDraggableId}]:${draggables[activeDraggableId].name}`
      ();
    if (typeof flutterScreen !== "undefined")
      flutterScreen.postMessage(`${draggables[activeDraggableId].name}`);
  } else {
    console.log(`select draggables[${activeDraggableId}]:undefined`);
  }
}

function touchStarted() {
  mousePressed();
  return false;
}

function touchEnded() {
  mouseReleased();
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Fisher-Yates Shuffle Algorithm from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

function loadTargetAreasFromJson(jsonFileName) {
  fetch(jsonFileName)
    .then((response) => response.json())
    .then((data) => {
      targetAreaTable = data;
      targetAreaLoaded = true;
      onLoadTargetables(targetAreaTable);
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
}
// preload the api stuff
let loadCount = 0;
function loadTargetAreas(baseName) {
  base(baseName)
    .select({
      // Selecting the first 3 records in Grid view:
      pageSize: 99,
      maxRecords: 1000,
      view: "Grid view",
    })
    .eachPage(
      function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.
        records.forEach(function (record) {
          let data = {};
          data.name = record.get("name");
          data.imageUrl = record.get("imageUrl");
          data.description = record.get("description");
          targetAreaTable.push(data);
        });

        targetAreaLoaded = true;
        fetchNextPage();
      },
      function done(err) {
        if (err) {
          console.error(err);
          return null;
        }
        onLoadTargetables(targetAreaTable);
        // makeTargetables(areaTable);
        return targetAreaTable;
      }
    );
}

function onLoadTargetables(table) {
  // console.log("======targetables loaded");
  table.forEach(function (data) {
    // print(data.imageUrl);
    // if imageurl doesnt exist then set to null (prevent loadimage from error)
    if (data.imageUrl) {
      data.iconImage = loadImage(data.imageUrl);
    } else {
      data.iconImage = null;
    }
  });

  targetAreaLoaded = true;
  makeTargetables(table);
  targetableData = table;
}

function loadDraggablesFromJson(jsonFile) {
  loadJSON(jsonFile, function (data) {
    draggableTable = data;

    draggableTableLoaded = true;
    onLoadDraggables(draggableTable);
  });
}

function loadDraggables(baseName) {
  base(baseName)
    .select({
      // Selecting the first 3 records in Grid view:
      pageSize: 99,
      maxRecords: 10000,
      view: "Grid view",
    })
    .eachPage(
      function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.
        records.forEach(function (record) {
          let data = {};
          data.name = record.get("name");
          data.imageUrl = record.get("imageUrl");
          data.correctArea = record.get("correctArea");
          draggableTable.push(data);
        });

        draggableTableLoaded = true;
        fetchNextPage();
      },
      function done(err) {
        if (err) {
          console.error(err);
          // location.reload();
          return null;
        } else {
          //flutterScreen.postMessage(`=========== makeDraggables ========= `);

          onLoadDraggables(draggableTable);

          //makeDraggables(dataTable);
          return draggableTable;
        }
      }
    );
}

function onLoadDraggables(table) {
  if (Object.keys(targetAreas).length == 0) {
    console.log("No data found. Please check your Airtable.");
    setTimeout(() => onLoadDraggables(table), 100);
  } else {
    console.log("Data issue resolved");
    table.forEach(function (data) {
      // if imageurl doesnt exist then set to null (prevent loadimage from error)
      if (data.imageUrl) {
        data.iconImage = loadImage(data.imageUrl);
      } else {
        data.iconImage = null;
      }
    });
    draggableLoaded = true;
    shuffleArray(table);
    makeDraggables(table);
    draggableData = table;
  }
}

// proceed to next draggable , the arrows cycle through the items
function nextDraggable() {
  if (isDone.find((element) => element == false) != undefined) {
    let undoneIndex = [];
    isDone.forEach((element, index) => {
      element == false ? undoneIndex.push(index) : null;
    });

    if (activeDraggableId == draggables.length - 1) {
      activeDraggableId = undoneIndex[0];
      draggables[activeDraggableId].active = true;
    } else {
      activeDraggableId =
        undoneIndex[
          (undoneIndex.indexOf(activeDraggableId) + 1) % undoneIndex.length
        ];
      draggables[activeDraggableId].active = true;
    }

    sendActiveDraggableName();
  } else {
    onLastDraggable();
  }
}

// back to previous draggable and notify flutter screen
function prevDraggable() {
  if (isDone.find((element) => element == false) != undefined) {
    let undoneIndex = [];
    isDone.forEach((element, index) => {
      element == false ? undoneIndex.push(index) : null;
    });

    if (activeDraggableId == undoneIndex[0]) {
      activeDraggableId = undoneIndex[undoneIndex.length - 1];
      draggables[activeDraggableId].active = true;
    } else {
      activeDraggableId =
        undoneIndex[
          (undoneIndex.indexOf(activeDraggableId) - 1) % undoneIndex.length
        ];
      draggables[activeDraggableId].active = true;
    }

    sendActiveDraggableName();
  } else {
    onLastDraggable();
  }
}

// this function is called when the last draggable is completed
// it will check if the game is completed and show the result

function onLastDraggable() {
  console.log("last element cant next");
}

function onCorrectArea() {
  gameState.incrementScore();
  console.log(`${gameState.score} / ${gameState.maxScore}`);
  sendCorrectAnswerResponse();
  draggables[activeDraggableId].setDone();
  isDone = draggables.map((a) => a.done);
  if (isDone.find((element) => element == false) != undefined) {
    nextDraggable();
  } else {
    onLastDraggable();
  }
}

function onWrongArea() {
  sendWrongAnswerResponse();
  draggables[activeDraggableId].resetPosition();
}

// to be called in the airtable callback
function makeTargetables(table) {
  let width = window.innerWidth;
  let height = window.innerHeight;

  let maxHeight = height * 0.81;
  let maxWidth = width * 1.1;

  let wProp = width * 0.53;
  let hProp = wProp / 1.135;
  let totalHeight = hProp * 2 + wProp;
  let totalWidth = wProp + hProp;

  while (totalHeight < maxHeight) {
    wProp *= 1.1;
    hProp = wProp / 1.135;
    totalHeight = hProp * 2 + wProp;
    totalWidth = wProp + hProp;
  }

  let margin = -width * 0.05;
  let topBound = height / 2 - totalHeight * 0.3;
  let leftBound = width / 2 - totalWidth * 0.5 - margin;

  // i swear the stuff is rect mode center but the values seem to want to be rectmode corner
  let posArr = [
    { x: width / 2 - wProp * 0.7, y: topBound, w: wProp, h: hProp },
    {
      x: leftBound,
      y: topBound + hProp + margin,
      w: hProp,
      h: wProp,
    },
    {
      x: leftBound + hProp + margin,
      y: topBound + hProp + margin,
      w: wProp,
      h: hProp,
    },
    {
      x: leftBound + hProp + margin,
      y: topBound + 2 * hProp + 2 * margin,
      w: hProp,
      h: wProp,
    },
  ];

  for (let i = 0; i < table.length; i++) {
    // custom grid positioning

    let thisX = posArr[i].x;
    let thisY = posArr[i].y;
    let rectWidth = posArr[i].w;
    let rectHeight = posArr[i].h;

    // rectMode(CORNER);

    let data = table[i];
    let targetable = new NewTargetArea(
      i,
      "",
      data.iconImage,
      "",
      thisX,
      thisY,
      rectWidth,
      rectHeight,
      0,
      DEBUG
    );

    targetAreas = { ...targetAreas, [data.name]: targetable };
  }

  targetAreaLoaded = true;
}

function makeDraggables(table) {
  for (let i = 0; i < table.length; i++) {
    let item = table[i];
    let name = item.name;
    // correctArea need to be a string
    let correctArea = item.correctArea;
    // loadedImg need to be a p5.image object (from loadImage in preload)
    let loadedImg = item.iconImage;

    // simplify what you pass into the collision function
    // it only needs x y width height
    // passing it the class object proved to be buggy
    let areaXY = {
      x: targetAreas[`${correctArea}`].x,
      y: targetAreas[`${correctArea}`].y,
      width: targetAreas[`${correctArea}`].w,
      height: targetAreas[`${correctArea}`].h,
    };

    let itemSize = window.innerWidth * 0.32;

    let draggable = new Draggable(
      name,
      draggableDefault.x,
      draggableDefault.y,
      itemSize,
      itemSize,
      areaXY,
      loadedImg,
      DEBUG
    );

    draggable.onCorrectArea = onCorrectArea;
    draggable.onWrongArea = onWrongArea;

    draggables.push(draggable);
    gameState.setMaxScore(draggables.length);
  }

  draggableLoaded = true;
}
