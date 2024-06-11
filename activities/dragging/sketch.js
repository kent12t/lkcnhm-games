/*
 * Game: Dragging
 * Project: LKCNHM Musee
 * Description: A drag and drop activity for Wallace sorting activity. Sorts [draggable] items into the correct [target area]. Inventory is the stacked items on the left and right side, and the toast is the pop-up message when the item is dropped in the correct or wrong area.
 * Library: p5.js, p5play
 * Author: @kent12t @didny
 * Last Modified: 2023-04-13
 */

let gameState = new GameState("dragging");

// draggable object arrays
let draggables = [];
let draggableTable = [];
let draggableTableLoaded = false;
let draggableLoaded = false;
let draggableDefault = {}; // draggable object position

// airtable data
let targetableData;
let draggableData;

// target area object arrays
let targetAreas = {};
let targetAreaTable = [];
let targetAreaLoaded = false;

// active draggable object
let activeDraggableId = 0;

// correct/wrong overlay
let overlayTimer = 0;

// assets confirmed
let bgImage, overlayImage;
let Lato = {};

let isDone = []; // mapped array of doneness of each draggable object

// nav
let navButtons = [];
let navY; // ypos of the nav items

// storage
let inventories = [];
let latestClickedItem = null;

// toasts
let toasts = [];
let toaster = [];
let toastIcon = {
  correct: "../../assets/images/activity2-correct.png",
  wrong: "../../assets/images/activity2-wrong.png",
};

const DEBUG = false;

function preload() {
  // pixelDensity(1); // to address slow response issue on mobile phone.
  width = window.innerWidth;
  height = window.innerHeight;

  // set the default position and size of the draggable objects
  draggableDefault = {
    x: width / 2,
    //y: height * 0.1,
    y: height * 0.5,
    width: 0.18 * windowHeight + 40,
    height: 0.18 * windowHeight + 40,
  };
  headingFont = loadFont(HeadingUrl, () => console.log("heading font loaded"));
  for (let key in LatoUrl) {
    Lato[key] = loadFont(LatoUrl[key]);
  }
  bgImage = loadImage("../../assets/images/wallace-sorting/act4-bg.png");
  overlayImage = loadImage(
    "../../assets/images/wallace-sorting/act4-wallaceline.png"
  );

  for (let icon in toastIcon) {
    toastIcon[icon] = loadImage(toastIcon[icon]);
  }

  loadTargetAreasFromJson("../../assets/jsons/draggable_areas.json");
  // try {
  //   loadTargetAreas();
  // } catch (error) {
  //   console.log(error);
  // }

  loadDraggablesFromJson("../../assets/jsons/draggable_items.json");
  // try {
  //   loadDraggables();
  // } catch (error) {
  //   console.log(error);
  // } finally {
  // }
}

function setup() {
  gameState.setState("loading");

  createCanvas(windowWidth, windowHeight);

  navY = height * 0.87;
  navButtons.push(
    new NavButton(
      width * 0.1,
      navY,
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
      navY,
      width * 0.15,
      width * 0.15,
      nextDraggable,
      "right",
      "rgba(0, 0, 0, 0)",
      Forest
    )
  );

  inventories.push(new Inventory("west", width * 0.1, height / 2));
  inventories.push(new Inventory("east", width * 0.9, height / 2));

  toasts.push(new Toast(true));
  toasts.push(new Toast(false));

  // tell Flutter screen the first draggable name
  sendActiveDraggableName();
}

function draw() {
  background(color(Sand));
  textAlign(LEFT, TOP);

  if (gameState.state == "loading") {
    drawLoadingScreen();

    // check if both data tables are loaded,
    if (targetAreaLoaded && draggableLoaded) {
      gameState.setState("gameplay");
      draggables[activeDraggableId].active = true;
    }
  } else if (gameState.state == "gameplay") {
    push();
    // draw bg
    let minBgHeight = (width * bgImage.height) / bgImage.width;
    imageMode(CORNER);
    image(bgImage, 0, 0 - (minBgHeight - height) / 2, width, minBgHeight);

    // draw the overlay
    imageMode(CENTER);
    image(
      overlayImage,
      width / 2,
      height * 0.475,
      width,
      (width * overlayImage.height) / overlayImage.width
    );
    pop();

    isDone = draggables.map((a) => a.done);

    navButtons.forEach((b) => b.display());
    drawSnappableLabelText();

    // display the target areas
    for (const key in targetAreas) {
      targetAreas[key].display();
    }
    // follow mouse on drag
    for (let i = 0; i < draggables.length; i++) {
      if (i == activeDraggableId) {
        draggables[i].active = true;
      } else {
        draggables[i].active = false;
      }

      if (draggables[i].done) {
        draggables[i].active = false;
        draggables[i].update();
      } else {
        if (i == activeDraggableId) {
          draggables[i].update();
          draggables[i].display();
        }
      }
    }

    // display the inventory
    inventories.forEach((i) => i.display());

    // display the toasts
    toaster.forEach((t) => t.display());

    // draw the debug rects
    if (DEBUG) {
      rectMode(CENTER);
      stroke(255, 0, 0, 100);
      noFill();
      rect(draggableDefault.x, draggableDefault.y, 45 * 2, height);
    }

    // draw the correctness overlay animation
    screenFlash();

    // check if all draggables are done
    if (draggables.every((a) => a.done)) {
      console.log("completed");
      // once the game is completed, this loop will not happen again
      //gameState.onCompleted();
      gameState.setState("completed");
      activeDraggableId = -1;
      // reset draggables position and state
      draggables.forEach((d) => {
        d.x = draggableDefault.x;
        d.y = draggableDefault.y;
        d.done = true;
        d.active = false;
        d.objectSprite.visible = false;
      });
    }
  } else if (gameState.state == "completed") {
    push();
    // draw bg
    let minBgHeight = (width * bgImage.height) / bgImage.width;
    imageMode(CORNER);
    image(bgImage, 0, 0 - (minBgHeight - height) / 2, width, minBgHeight);

    // draw the overlay
    imageMode(CENTER);
    image(
      overlayImage,
      width / 2,
      height * 0.475,
      width,
      (width * overlayImage.height) / overlayImage.width
    );
    pop();

    for (const key in targetAreas) {
      targetAreas[key].display();
    }

    // display the inventory
    inventories.forEach((i) => i.display());

    // display the toasts
    toaster.forEach((t) => t.display());

    // draw only the clicked item
    draggables.forEach((d) => {
      if (d.active) {
        d.objectSprite.visible = true;
        // console.log(`active: ${d.name}`);
        d.display();
        activeDraggableId = d.key;
      } else {
        d.objectSprite.visible = false;
      }
    });

    drawSnappableLabelText();
  }
}

function mousePressed() {
  // the if check make sure it catches any error, pressing reset button once (activeEle == objects.length) is giving a lot of issues
  if (activeDraggableId < draggables.length && gameState.state == "gameplay") {
    if (
      draggables[activeDraggableId].handlePress() &&
      !draggables[activeDraggableId].done
    ) {
      sendActiveDraggableName();
    }
  }

  navButtons.forEach((button) => button.handlePress());
  toaster.forEach((toast) => toast.handlePress());

  if (gameState.state == "completed") {
    inventories.forEach((i) => i.handlePress());
  }
}

function mouseReleased() {
  // the if check make sure it catches any error, pressing reset button once (activeEle == objects.length) is giving a lot of issues
  if (gameState.state == "gameplay") {
    if (activeDraggableId < draggables.length) {
      if (!draggables[activeDraggableId].done) {
        draggables[activeDraggableId].checkCorrectArea();
      }
    }

    draggables.forEach((draggable) => {
      if (draggable.done) {
        if (!draggable.handlePress()) {
          draggable.active = false;
        }
      }
    });
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

function loadTargetAreasFromJson(jsonFileName) {
  fetch(jsonFileName)
    .then((response) => response.json())
    .then((data) => {
      data.forEach((record) => {
        console.log("Retrieved", record.name);
        let entry = {};
        entry.name = record.name;
        entry.description = "";
        targetAreaTable.push(entry);
      });

      console.log("data loaded:", targetAreaTable);
      targetAreaLoaded = true;
      onLoadTargetables(targetAreaTable);
    })
    .catch((err) => console.error(err));
}

// preload the api stuff
let loadCount = 0;
function loadTargetAreas() {
  base("DraggableAreas")
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
          data.description = "";
          targetAreaTable.push(data);
        });

        console.log("data loaded:", targetAreaTable);

        // console.log("data image loaded:", areaTable);
        targetAreaLoaded = true;
        fetchNextPage();
      },
      function done(err) {
        if (err) {
          console.error(err);
          // location.reload();
          return null;
        }
        console.log("loadcount:", loadCount++);
        onLoadTargetables(targetAreaTable);
        // makeTargetables(areaTable);
        return targetAreaTable;
      }
    );
}

function onLoadTargetables(table) {
  console.log("======targetables loaded");
  console.log("area image loaded; ", table);
  targetAreaLoaded = true;
  makeTargetables(table);
  targetableData = table;
}

function loadDraggablesFromJson(jsonFileName) {
  fetch(jsonFileName)
    .then((response) => response.json())
    .then((data) => {
      data.forEach((record) => {
        console.log("Retrieved", record.name);
        let entry = {};
        entry.name = record.name;
        entry.imageUrl = record.imageUrl;
        entry.iconImageUrl = record.iconImageUrl;
        entry.correctArea = record.correctArea;
        entry.type = record.type[0];
        draggableTable.push(entry);
      });

      console.log("data loaded:", draggableTable);
      draggableTableLoaded = true;
      onLoadDraggables(draggableTable);
    });
}

function loadDraggables() {
  base("DraggableItems")
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
          console.log("Retrieved", record.get("name"));
          let data = {};
          data.name = record.get("name");
          data.imageUrl = record.get("imageUrl");
          data.iconImageUrl = record.get("iconImageUrl");
          data.correctArea = record.get("correctArea");
          draggableTable.push(data);
        });

        console.log("data loaded:", draggableTable);

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
          return draggableTable;
        }
      }
    );
}

function onLoadDraggables(table) {
  console.log("======draggables loaded");
  if (Object.keys(targetAreas).length == 0) {
    console.log("No data found. Please check your Airtable.");
    setTimeout(() => onLoadDraggables(table), 100);
  } else {
    console.log("Data retrieval resolved");
    table.forEach(function (data) {
      // if imageurl doesnt exist then set to null (prevent loadimage from error)
      data.imageUrl ? (data.imageUrl = loadImage(data.imageUrl)) : null;
      data.iconImageUrl
        ? (data.iconImageUrl = loadImage(data.iconImageUrl))
        : null;
    });
    console.log("data image loaded:", table);
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
    draggables[activeDraggableId].active = false;
    draggables[activeDraggableId].update();
    if (activeDraggableId == draggables.length - 1) {
      activeDraggableId = undoneIndex[0];
      draggables[activeDraggableId].active = true;
      console.log("next element: " + draggables[activeDraggableId].name);
    } else {
      activeDraggableId =
        undoneIndex[
          (undoneIndex.indexOf(activeDraggableId) + 1) % undoneIndex.length
        ];
      draggables[activeDraggableId].active = true;
      console.log("next element: " + draggables[activeDraggableId].name);
    }
    draggables[activeDraggableId].update();
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
    draggables[activeDraggableId].active = false;
    draggables[activeDraggableId].update();
    if (activeDraggableId == undoneIndex[0]) {
      activeDraggableId = undoneIndex[undoneIndex.length - 1];
      draggables[activeDraggableId].active = true;
      draggables[activeDraggableId].update();

      console.log("next element: " + draggables[activeDraggableId].name);
    } else {
      activeDraggableId =
        undoneIndex[
          (undoneIndex.indexOf(activeDraggableId) - 1) % undoneIndex.length
        ];
      draggables[activeDraggableId].active = true;
      draggables[activeDraggableId].update();
      console.log("next element: " + draggables[activeDraggableId].name);
    }

    draggables[activeDraggableId].update();
    sendActiveDraggableName();
  } else {
    onLastDraggable();
  }
}

// this function is called when the last draggable is completed
// it will check if the game is completed and show the result

function onLastDraggable() {
  //check if completed and show the result
  console.log("last element cant next");
}

function onCorrectArea() {
  console.log("correct");
  gameState.incrementScore();
  console.log(`${gameState.score} / ${gameState.maxScore}`);
  draggables[activeDraggableId].done = true;
  isDone = draggables.map((a) => a.done);
  nextDraggable();
}

function onWrongArea() {
  sendWrongAnswerResponse();
  draggables[activeDraggableId].done = true;
  isDone = draggables.map((a) => a.done);
  nextDraggable();
}

// to be called in the airtable callback
function makeTargetables(areaTable) {
  console.log(
    `when making targetables, areaLoaded is ${targetAreaLoaded} with length ${areaTable.length}`
  );

  let rectWidth = 0.5 * windowWidth;
  let rectHeight = 0.65 * windowHeight;
  let rectPadding = 0;

  let numRows = 1;
  let gridWidth = rectWidth * 2 + rectPadding;
  let gridHeight = (rectHeight + rectPadding) * numRows - rectPadding;
  let startX = (windowWidth - gridWidth) / 2;
  let startY = (windowHeight - gridHeight) / 2;

  for (let i = 0; i < areaTable.length; i++) {
    // custom grid positioning
    let row = Math.floor(i / 2);
    let col = i % 2;

    let thisX = startX + (rectWidth + rectPadding) * col;
    let thisY = startY + (rectHeight + rectPadding) * row;

    let data = areaTable[i];
    let targetable = new NewTargetArea(
      i,
      data.name,
      data.description,
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
  console.log(`targetableLoaded is ${targetAreaLoaded}`);
}

function makeDraggables(dataTable) {
  console.log(
    `when making draggables, tableLoaded is ${draggableTableLoaded} with length ${dataTable.length}`
  );
  for (let i = 0; i < dataTable.length; i++) {
    let item = dataTable[i];
    let name = item.name;
    // correctArea need to be a string
    let correctArea = item.correctArea;
    // loadedImg need to be a p5.image object (from loadImage in preload)
    let imageUrl = item.imageUrl;
    let iconImageUrl = item.iconImageUrl;
    let mammalType = item.type;

    // simplify what you pass into the collision function
    // it only needs x y width height
    // passing it the class object proved to be buggy
    let areaXY = {
      name: targetAreas[`${correctArea}`].name,
      x: targetAreas[`${correctArea}`].x,
      y: targetAreas[`${correctArea}`].y,
      width: targetAreas[`${correctArea}`].w,
      height: targetAreas[`${correctArea}`].h,
    };

    let draggable = new Draggable(
      i,
      name,
      draggableDefault.x,
      draggableDefault.y,
      draggableDefault.width,
      draggableDefault.height,
      areaXY,
      imageUrl,
      iconImageUrl,
      DEBUG,
      mammalType
    );

    draggable.onCorrectArea = onCorrectArea;
    draggable.onWrongArea = onWrongArea;

    draggables.push(draggable);
  }

  draggableLoaded = true;
  console.log(`draggableLoaded is ${draggableLoaded}`);
  gameState.setMaxScore(draggables.length);
}

function drawSnappableLabelText() {
  push();
  textAlign(CENTER, CENTER);
  textSize(24);
  noStroke();
  fill(color(Forest));
  textFont(Lato.light);
  if (activeDraggableId >= 0) {
    text(draggables[activeDraggableId].name, width / 2, navY - 4);
    if (gameState.state == "completed") {
      textSize(12);
      textFont(Lato.bold);
      stroke(255);
      strokeWeight(2);

      let type = draggables[activeDraggableId].type;
      text(
        `type: ${
          type[type.length - 1] == "s"
            ? type.substring(0, type.length - 1)
            : type
        }`.toUpperCase(),
        width / 2,
        navY - 28
      );
    }
  }
  rectMode(CENTER);
  pop();
}

class Inventory {
  constructor(name, x, y) {
    this.inventory = [];
    this.name = name; // either 'west' or 'east'
    this.x = x;
    this.y = y;
    this.latestClickedItem = null;
  }

  addItem(item) {
    this.inventory.find((i) => i === item)
      ? console.log("duplicate add")
      : this.inventory.push(item);
  }

  removeItem(item) {
    this.inventory = this.inventory.filter((i) => i !== item);
  }

  hasItem(item) {
    return this.inventory.includes(item);
  }

  display() {
    push();
    let padding = 10;
    let gutter = width * 0.05;
    let imageSize = width * 0.12;

    let bar = {
      w: imageSize + padding * 2,
      h:
        this.inventory.length * imageSize +
        (this.inventory.length - 1) * gutter +
        padding * 2,
    };

    rectMode(CENTER);
    imageMode(CENTER);
    noStroke();
    fill("rgba(255, 255,255, 0.5)");

    // for loop to center a stacked set of inventory images within the vertical bar
    for (let i = 0; i < this.inventory.length; i++) {
      let item = this.inventory[i];
      let itemX = this.x;
      let itemY =
        this.y - bar.h / 2 + padding + imageSize / 2 + i * (imageSize + gutter);

      item.correct ? fill(67, 170, 0, 255) : fill(224, 0, 0, 255);
      circle(itemX, itemY, imageSize * 1.15);
      image(item.iconImage, itemX, itemY, imageSize, imageSize);
    }
    pop();
  }

  handlePress() {
    let padding = 10;
    let gutter = width * 0.05;
    let imageSize = width * 0.12;

    let bar = {
      w: imageSize + padding * 2,
      h:
        this.inventory.length * imageSize +
        (this.inventory.length - 1) * gutter +
        padding * 2,
    };

    for (let i = 0; i < this.inventory.length; i++) {
      let item = this.inventory[i];
      let itemX = this.x;
      let itemY =
        this.y - bar.h / 2 + padding + imageSize / 2 + i * (imageSize + gutter);

      // circle collision code
      let d = dist(mouseX, mouseY, itemX, itemY);
      if (d < imageSize / 2) {
        if (latestClickedItem != item) {
          // if there is a previous item, set it to inactive
          if (latestClickedItem != null) {
            draggables.find(
              (d) => d.name === latestClickedItem.name
            ).active = false;
            // console.log("set previous item to inactive");
          }
          // set the new item to active
          latestClickedItem = item;
          draggables.find(
            (d) => d.name === latestClickedItem.name
          ).active = true;
          // console.log(`new clicked item is ${latestClickedItem.name}`);
        }
      }
    }
  }
}

class Toast {
  constructor(correct) {
    this.message = "";
    this.correct = correct;
    this.x = width / 2;
    this.y = height * 0.225;
    this.modulatedY = this.y;
    this.w = 240;
    this.h = 70;
    this.timer = 0;
    this.maxTimer = 100;
    this.timestamp;
    this.visible = false; // true, false
    this.alpha = 0; // 0-255
    this.state = false; // false, 'increase', 'decrease'
  }

  display() {
    this.update();
    textSize(16);
    textFont(Lato.regular);
    textSize(16);
    textFont(Lato.bold);

    let textHeight = 20;
    let hPadding = 20;
    let vPadding = 15;
    let gutter = 5;
    this.w = 225;
    this.h = textHeight * 2 + vPadding * 2 + gutter;

    if (this.visible) {
      // set alpha to the colors
      let correctBoxColor = color(0, 180, 0);
      correctBoxColor.setAlpha(this.alpha);
      let wrongBoxColor = color(180, 0, 0);
      wrongBoxColor.setAlpha(this.alpha);
      let correctTextColor = color(255);
      correctTextColor.setAlpha(this.alpha);
      let wrongTextColor = color(255);
      wrongTextColor.setAlpha(this.alpha);

      push();
      translate(this.x, this.modulatedY);
      // draw rounded rectangle as box
      rectMode(CENTER);
      noStroke();
      this.correct ? fill(correctBoxColor) : fill(wrongBoxColor);
      rect(0, 0, this.w, this.h, 10);

      // draw notification message
      textAlign(LEFT, TOP);
      this.correct ? fill(correctTextColor) : fill(wrongTextColor);

      rectMode(CORNER);
      textSize(16);
      textFont(Lato.bold);
      text(
        this.correct ? "CORRECT!" : "WRONG!",
        -this.w / 2 + hPadding,
        -textHeight - gutter / 2,
        this.w - hPadding,
        this.h
      );

      textSize(16);
      textFont(Lato.regular);
      text(
        this.message,
        -this.w / 2 + hPadding,
        +gutter / 2,
        this.w - hPadding,
        this.h
      );

      // draw close button
      stroke("white");
      strokeWeight(2);
      let cross = {
        x: this.w / 2 - hPadding - 3,
        y: -this.h / 2 + vPadding + 6,
        size: 3,
      };
      line(
        cross.x - cross.size,
        cross.y - cross.size,
        cross.x + cross.size,
        cross.y + cross.size
      );
      line(
        cross.x - cross.size,
        cross.y + cross.size,
        cross.x + cross.size,
        cross.y - cross.size
      );

      pop();
    }
  }

  enable(msg) {
    // end prev cycle
    if (this.timer > 0) {
      this.timer = 0;
    }
    // start the state cycle
    this.state = "increase";
    this.message = msg;
    toaster.push(this);
  }

  update() {
    this.timer > 0 ? (this.visible = true) : (this.visible = false);

    switch (this.state) {
      case "increase":
        // continue to next cycle at max timer
        if (this.timer >= this.maxTimer) {
          this.timestamp = millis();
          this.state = "hold";
        }

        this.modulatedY = map2(
          this.timer,
          0,
          this.maxTimer,
          this.y - height * 0.02,
          this.y,
          CUBIC,
          BOTH
        );

        this.timer += 3;
        break;

      case "hold":
        // continue to next cycle after 1 second
        if (millis() - this.timestamp >= 500) {
          this.state = "decrease";
        }

        this.timer = this.maxTimer;
        this.easedTimer = 255;
        break;

      case "decrease":
        // continue to next cycle at min timer
        this.timer <= 0 ? (this.state = false) : null;
        this.modulatedY = map2(
          this.timer,
          0,
          this.maxTimer,
          this.y + height * 0.02,
          this.y,
          CUBIC,
          BOTH
        );
        this.timer -= 2;
        break;

      case false:
        this.x = width / 2;
        this.timer = 0;
        toaster.shift();
        break;
    }

    // map timer to alpha with easing
    this.alpha = map2(this.timer, 0, this.maxTimer, 0, 255, QUADRATIC, BOTH);
  }

  handlePress() {
    if (
      mouseX > this.x - this.w / 2 &&
      mouseX < this.x + this.w / 2 &&
      mouseY > this.y - this.h / 2 &&
      mouseY < this.y + this.h / 2 &&
      (this.state == "hold" || this.state == "increase")
    ) {
      this.timer = this.maxTimer;
      this.state = "decrease";
    }
  }
}
