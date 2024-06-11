/*
 * Game: Snapping
 * Project: LKCNHM Musee
 * Description: Drag and drop puzzle game where [snappable] items are placed into the luggage. Objects snap to an invisible grid. User can learn more about the items during and after placing the items.
 * Library: p5.js
 * Author: @kent12t @didny
 * Last Modified: 2023-04-13
 */

let gameState = new GameState("snapping");

// Grid and playing area settings
let gridSize;
let gridDef = { x: 6, y: 8 };
const MARGIN = { x: 0, y: 0 }; // margin awaits window size
let luggageCorners; // playable grid area (x1, x2, y1, y2) for start and end points

let itemTable = []; // loading from airtable to local array
let itemLoaded = false; // flag to check if itemTable is loaded
let snappables = []; // array of class objects
let snappableLoaded = false;
let coordArrArr = []; // answer coordinates array of vectors
let navButtons = []; // array of button objects
let activeItem = 0; // index of active item in snappables array

// replace once assets are done
let luggageImg;
let bgImg;
let Lato = {};
let headingFont;
let luggageOffset = { x: 0, y: 0 };
let luggageSizeOffset = { w: 0, h: 0 };

let gridStrokeColor;
let gridFillColor;

function preload() {
  let width = window.innerWidth;
  let height = window.innerHeight;

  gridStrokeColor = color(255, 255, 255, 15);
  gridFillColor = color(255, 255, 255, 15);

  let playable = {};
  playable.x = width * 0.8; // playable area is 60% of the screen width
  playable.y = height * 0.43; // playable area is 70% of the screen height

  // if the playable area is limited by x, adjust height accordingly (grid is always 4:3)
  // else if limited by y, then use that as max height
  luggageCorners = {
    x1: 0,
    x2: 0,
    y1: 0,
    y2: min((playable.x * 4) / 3, playable.y), // 4:3 ratio
  };
  gridSize = (luggageCorners.y2 - luggageCorners.y1) / gridDef.y; // define grid size based on target grid area
  luggageCorners.x2 = gridSize * gridDef.x; // set the width of target grid

  // center the luggage
  MARGIN.x = (width - luggageCorners.x2) / 2;
  luggageCorners.x1 += MARGIN.x;
  luggageCorners.x2 += MARGIN.x;

  // move it up a bit
  MARGIN.y = 0.17 * height;
  luggageCorners.y1 += MARGIN.y;
  luggageCorners.y2 += MARGIN.y;

  // load luggage image
  luggageImg = loadImage(
    "../../assets/images/wallace-packing/chapter1-luggage.png"
  );
  // load font
  headingFont = loadFont(HeadingUrl, () => console.log("heading font loaded"));
  for (let key in LatoUrl) {
    Lato[key] = loadFont(LatoUrl[key]);
  }
  // load background image
  bgImg = loadImage("../../assets/images/wallace-packing/chapter1-bg.png");

  //load from AirTable
  //loadSnappables();

  // load from local json
  loadSnappablesFromJson("../../assets/jsons/snappable_items.json");
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  print(
    "DEBUG: windowWidth: " + windowWidth + " windowHeight: " + windowHeight
  );
  print("DEBUG: width: " + width + " height: " + height);
  print(
    "DEBUG: window.innerWidth: " +
      window.innerWidth +
      " window.innerHeight: " +
      window.innerHeight
  );

  navHeight = height * 0.705;

  navButtons.push(
    new NavButton(
      width * 0.1,
      navHeight,
      32,
      32,
      prevItem,
      "left",
      "rgba(0, 0, 0, 0)",
      Forest
    )
  );
  navButtons.push(
    new NavButton(
      width * 0.9,
      navHeight,
      32,
      32,
      nextItem,
      "right",
      "rgba(0, 0, 0, 0)",
      Forest
    )
  );
}

function draw() {
  clear();
  push();
  imageMode(CENTER);
  image(bgImg, width / 2, height / 2, width, height);
  pop();

  if (gameState.state == "loading") {
    drawLoadingScreen();
    if (itemLoaded && snappableLoaded) {
      gameState.setState("gameplay");
    }
  }
  // make sure item is loaded first, cos if not at 0 loaded it's considered don
  else if (gameState.state == "gameplay") {
    drawLuggage();

    makeAnswer(coordArrArr);

    navButtons.forEach((b) => b.display());
    drawSnappableLabelText();

    for (let i = 0; i < snappables.length; i++) {
      if (i == activeItem) {
        snappables[i].active = true;
      } else {
        snappables[i].active = false;
      }

      if (snappables[i].done) {
        snappables[i].display();
      }
    }

    for (let i = 0; i < snappables.length; i++) {
      // draw the undone ones on top of the done ones
      if (!snappables[i].done && i == activeItem) {
        snappables[i].display();
        snappables[i].handleDrag();
      }
    }

    if (snappables.every((a) => a.done)) {
      // once the game is completed, this loop will not happen again
      gameState.setState("completed");
    }
  } else if (gameState.state == "completed") {
    drawLuggage();
    navButtons.forEach((b) => b.display());
    drawSnappableLabelText();

    for (let i = 0; i < snappables.length; i++) {
      if (i == activeItem) {
        snappables[i].active = true;
      } else {
        snappables[i].active = false;
      }

      if (snappables[i].done) {
        snappables[i].display();
      } else {
        if (i == activeItem) {
          snappables[i].display();
          snappables[i].handleDrag();
        }
      }
    }
  }
}

function loadSnappablesFromJson(jsonFileName) {
  fetch(jsonFileName)
    .then((response) => response.json())
    .then((data) => {
      data.forEach((record) => {
        let entry = {};
        entry.name = record.name;
        entry.fullName = record.fullName;
        entry.shape = JSON.parse(record.shape); // object
        entry.imageUrl = record.imageUrl;
        entry.correctPos = JSON.parse(record.correctPos); // object
        entry.title = record.title;
        entry.description = record.description;
        entry.imageSize = JSON.parse(record.imageSize); // object
        itemTable.push(entry);
      });

      console.log("data loaded:", itemTable);
      onLoadSnappables(itemTable);
    })
    .catch((err) => console.error(err));
}

function loadSnappables() {
  // airtable config
  base("SnappableItems")
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
          console.log("Retrieved", record.get("name"));
          let data = {};
          data.name = record.get("name");
          data.fullName = record.get("fullName");
          data.shape = JSON.parse(record.get("shape")); // object
          data.imageUrl = record.get("imageUrl");
          data.correctPos = JSON.parse(record.get("correctPos")); // object
          data.title = record.get("title");
          data.description = record.get("description");
          data.imageSize = JSON.parse(record.get("imageSize")); // object
          itemTable.push(data);
        });

        console.log("data loaded:", itemTable);
        fetchNextPage();
      },
      function done(err) {
        if (err) {
          console.error(err);
          return;
        }
        console.log(`gridSize: ${gridSize}`);
        onLoadSnappables(itemTable);
      }
    );
}

function onLoadSnappables(itemTable) {
  console.log("===== snappables loaded");
  // console.log(gridSize);
  itemTable.forEach(function (data) {
    // if imageurl doesnt exist then set to null (prevent loadimage from error)
    if (data.imageUrl) {
      data.iconImage = loadImage(data.imageUrl);
    } else {
      data.iconImage = null;
    }

    let correctPos = data.correctPos;
    let coords = data.shape; // array of x,y coordinates
    let coordArr = []; // array of p5 vectors

    for (let coord in coords) {
      coordArr.push(
        createVector(
          (coords[coord].x + (correctPos.x0 - coords[1].x)) * gridSize +
            MARGIN.x,
          (coords[coord].y + (correctPos.y0 - coords[1].y)) * gridSize +
            MARGIN.y
        )
      );
    }

    coordArrArr.push(coordArr);
  });
  console.log("data image loaded:", itemTable);
  itemLoaded = true;
  makeSnappables(itemTable);
}

function makeSnappables(itemTable) {
  console.log(
    `when making snappables, tableLoaded is ${itemLoaded} with length ${itemTable.length}`
  );
  for (let i = 0; i < itemTable.length; i++) {
    // each data in itemTable has
    // name, shape, imageUrl, correctPos, imageSize
    // shape, correctPos and imageSize are js objects
    let item = itemTable[i];

    // unrandomise the position
    let curX = gridDef.x / 2 - floor(item.imageSize.width / 2);
    let curY = gridDef.y / 2 - floor(item.imageSize.height / 2);

    let name = item.name; // key value of the object
    let fullName = item.fullName; // key value of the object
    let coords = item.shape; // array of x,y coordinates
    let coordArr = [];
    let correctPos = item.correctPos; // x,y coordinates
    let imageObj = item.iconImage; // loaded p5 image object
    let title = item.title;
    let description = item.description;

    // image size is multiplied by gridSize to allow for adaptivity
    let imageSize = {
      width: item.imageSize.width * gridSize,
      height: item.imageSize.height * gridSize,
    };
    // image location is offset by the margin and the random positioning (same as whats in the loop below)
    let imageLocation = {
      x: curX * gridSize + luggageCorners.x1,
      y: curY * gridSize + luggageCorners.y1,
    };

    for (let coord in coords) {
      // convert the array of object coordinates to p5 vectors
      // allow the use of gridSize adaptively here, keep the json clean
      coordArr.push(
        createVector(
          coords[coord].x * gridSize + imageLocation.x,
          coords[coord].y * gridSize + imageLocation.y
        )
      );

      // console.log(coords[coord]);
      // coordArr.push(coords[coord]);
    }

    // object creation
    // (arr, gridSize, luggage, correctPos)
    // >> arr: array of vectors
    // >> gridSize: grid size variable to be passed in for access within object
    // >> luggage: playable area variable to be passed in for access within object
    // >> name: name of the object
    // >> correctPos: the last object in the array is the correct position, excluded in some of the loops
    // >> imageObj: loaded p5 image object
    // >> imageSize: object with width and height properties
    // >> imageLocation: object with x and y properties

    snappables.push(
      new Snappable(
        coordArr,
        gridSize,
        luggageCorners,
        correctPos,
        name,
        fullName,
        imageObj,
        imageSize,
        imageLocation,
        title,
        description
      )
    );
    gameState.setMaxScore(snappables.length);
  }

  // validate all the created objects
  snappables.forEach((a) => a.validate());
  snappableLoaded = true;
}

function makeAnswer(arr) {
  for (let index = 0; index < arr.length; index++) {
    const element = arr[index];
    let r = index * 40 + 25;
    let g = (255 * 2) / (index + 2) + 25;
    let b = map(sin(index), -1, 1, 0, 255) + 25;

    snappables[index].done ? fill(0, 0, 0, 0) : fill(r, g, b, 60);
    stroke(0);
    strokeWeight(0);
    beginShape();
    for (let i = 0; i < element.length; i++) {
      vertex(element[i].x, element[i].y);
    }
    endShape(CLOSE);
  }
}

function drawLuggage() {
  push();
  w = (luggageCorners.x2 - luggageCorners.x1) * 1.4;
  h = (luggageCorners.y2 - luggageCorners.y1) * 1.75;
  x = width * 0.5 + (luggageCorners.x2 - luggageCorners.x1) * 0.03;
  y = MARGIN.y + w / 2 - (luggageCorners.y2 - luggageCorners.y1) * 0.03;

  imageMode(CENTER);
  image(luggageImg, x, y, w, h);
  pop();
}

function drawSnappableLabelText() {
  push();

  let fontSizeAddition = height / 400;

  textAlign(CENTER, CENTER);
  textSize(23 + fontSizeAddition);
  noStroke();
  fill(color(Forest));
  textFont(Lato.light);
  text(
    `${snappables[activeItem].fullName}`,
    width / 2,
    navHeight - height * 0.005
  );
  rectMode(CENTER);

  fill(color(Forest));
  textSize(16 + fontSizeAddition);
  textFont(Lato.bold);
  textAlign(CENTER, BOTTOM);
  text(
    snappables[activeItem].title,
    width / 2,
    navHeight + 30,
    width * 0.8,
    40
  );

  fill(color(Forest));
  noStroke();
  textSize(14 + fontSizeAddition);
  textFont(Lato.regular);
  textAlign(CENTER, TOP);
  text(
    snappables[activeItem].description,
    width / 2,
    navHeight + 95,
    width * 0.8,
    80
  );

  pop();
}

// mouse events
function mousePressed() {
  for (let i = snappables.length - 1; i >= 0; i--) {
    // snappables[i].handlePress();
    if (!snappables[i].done) {
      if (snappables[activeItem].handlePress()) {
        // ensure only the topmost object is dragged
        break;
      }
    }
  }
  navButtons.forEach((button) => button.handlePress());
  return false;
}

function mouseReleased() {
  for (let i = 0; i < snappables.length; i++) {
    snappables[i].handleRelease();
  }

  return false;
}

// handle touch events for mobile
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
