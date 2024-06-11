/*
 * Game: Finding
 * Project: LKCNHM Musee
 * Description: Pan around the scene to click on [floatingTargets] objects. Click on the [hiddenObjects] to reveal more information.
 * Library: p5.js
 * Author: @kent12t @didny
 * Last Modified: 2023-04-13
 */

let forestImg;

let easingFactor = 0.8; // You can change this value to adjust the inertia speed
let easingScale = 5;
let velocity = { x: 0, y: 0 };

let mouseDiff = { x: 0, y: 0 };
let cMouseDiff = { x: 0, y: 0 };
let targetArray = []; // from airtable
let itemLoaded = false;
let floatingTargets = [];
let hiddenObjects = [];
let popups = [];
let Lato = {};
let isDragging = false;

let gameType = "default";
let gameState = new GameState("finding");
let DEBUG = false;

width = window.innerWidth;
height = window.innerHeight;
console.log(width, height);

bgSize = { width: width * 3, height: height };
boxConstrain = {
  width: (bgSize.width - width) / 2,
  height: (bgSize.height - height) / 2,
};
console.log(bgSize, boxConstrain);

const ForestUrl = "../../assets/images/finding-forest-bg.png";

// main game awaits forestImg, floating target, and hidden object
// all within display so in draw only
let mainGame = {
  display: () => {
    push();
    noStroke();
    imageMode(CENTER);
    image(
      forestImg,
      width / 2 + cMouseDiff.x,
      height / 2 + cMouseDiff.y,
      bgSize.width,
      bgSize.height,
      0,
      0,
      forestImg.width,
      forestImg.height,
      COVER
    );
    pop();

    floatingTargets.forEach((target) => {
      target.display();
    });

    createFloatingBar();
  },
};

// hidden game awaits hidden object
// all within display so in draw only
let hiddenGame = {
  bgImageUrl: "",
  hidingInfo: {},

  display: (name) => {
    push();
    imageMode(CORNER);
    currentObject = hiddenObjects.find((item) => item.key == name);

    image(
      currentObject.bgImageUrl,
      0,
      0,
      window.innerWidth,
      window.innerHeight,
      0,
      0,
      currentObject.bgImageUrl.width,
      currentObject.bgImageUrl.height,
      COVER
    );

    let offset;
    let textBound = window.innerWidth * 0.7;
    let textY = window.innerHeight * 0.75;
    textAlign(CENTER, TOP);
    textSize(20);
    textFont(Lato.regular);
    fill(color(White));

    if (textWidth(currentObject.text1) > textBound) {
      offset = textLeading() * 2;
    } else {
      offset = textLeading();
    }
    text(currentObject.text1, window.innerWidth / 2, textY, textBound, offset);

    textFont(Lato.bold);
    text(
      currentObject.text2.toUpperCase(),
      window.innerWidth / 2,
      textY + offset,
      textBound,
      offset
    );

    currentObject.display();
    currentObject.active = true;
    pop();
  },
};

function preload() {
  forestImg = loadImage(ForestUrl);
  headingFont = loadFont(HeadingUrl, () => console.log("heading font loaded"));
  for (let key in LatoUrl) {
    Lato[key] = loadFont(LatoUrl[key]);
  }
  loadGameObjectsFromJson("../../assets/jsons/insect_items.json");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  gameState.setState("loading");
}

function draw() {
  background(color(Sand));

  if (gameState.state == "loading") {
    drawLoadingScreen();
    // check if item is loaded
    if (itemLoaded) {
      gameState.setState("gameplay");
    }
  } else if (gameState.state == "gameplay") {
    if (popups.find((popup) => popup.state != "hidden") != undefined) {
      isDragging = false;
    }

    if (isDragging) {
      velocity.x = (mouseX - pmouseX) * easingScale * easingFactor;
      velocity.y = (mouseY - pmouseY) * easingScale * easingFactor;
      mouseDiff.x += mouseX - pmouseX;
      mouseDiff.y += mouseY - pmouseY;
    } else {
      velocity.x *= easingFactor;
      velocity.y *= easingFactor;
      mouseDiff.x += velocity.x;
      mouseDiff.y += velocity.y;
    }

    constrainMouseDiff();
    if (gameType == "default") {
      mainGame.display();
    } else {
      hiddenGame.display(gameType);
    }

    popups.forEach((popup) => popup.display());
  } else if (gameState.state == "completed") {
    if (popups.find((popup) => popup.state != "hidden") != undefined) {
      isDragging = false;
    }

    if (isDragging) {
      velocity.x = (mouseX - pmouseX) * easingScale * easingFactor;
      velocity.y = (mouseY - pmouseY) * easingScale * easingFactor;
      mouseDiff.x += mouseX - pmouseX;
      mouseDiff.y += mouseY - pmouseY;
    } else {
      velocity.x *= easingFactor;
      velocity.y *= easingFactor;
      mouseDiff.x += velocity.x;
      mouseDiff.y += velocity.y;
    }

    constrainMouseDiff();
    if (gameType == "default") {
      mainGame.display();
    } else {
      hiddenGame.display(gameType);
    }
    popups.forEach((popup) => popup.display());
  }
}

function mouseDragged() {
  // return false;
}

function touchStarted() {
  mousePressed();
  return false;
}

function touchEnded() {
  mouseReleased();
  return false;
}

function mousePressed() {
  if (popups.find((popup) => popup.state != "hidden") == undefined) {
    if (gameType == "default") {
      floatingTargets.forEach((target) => {
        target.onPress();
      });
      isDragging = true;
    } else {
      currentObject = hiddenObjects.find((item) => item.key == gameType);
      currentObject.onPress();
    }
  }
  popups.forEach((popup) => popup.handlePress());
  // return false;
}

function mouseReleased() {
  if (gameType == "default") {
    isDragging = false;
  }
  // return false;
}

function loadGameObjectsFromJson(jsonFile) {
  fetch(jsonFile)
    .then((response) => response.json())
    .then((data) => {
      print(data);
      data.forEach((record) => {
        console.log("Retrieved", record.id);
        let entry = {};
        entry.key = record.id;
        entry.imageUrl = record.imageUrl;
        entry.popupImageUrl = record.popupImageUrl;
        entry.bgImageUrl = record.bgImageUrl;
        entry.illustrationUrl = record.illustrationUrl;
        entry.iconUrl = record.iconUrl;
        entry.iconFoundUrl = record.iconFoundUrl;
        entry.hintUrl = record.hintUrl;
        entry.hintFoundUrl = record.hintFoundUrl;
        entry.correctArea = record.correctArea[0];
        entry.text1 = record.text1;
        entry.text2 = record.text2;
        entry.text3 = record.text3;
        entry.text4 = record.text4;
        entry.x = record.x;
        entry.y = record.y;
        entry.hiding = JSON.parse(record.hiding); // object in json format
        targetArray.push(entry);
      });

      console.log("data loaded:", targetArray);
      onLoadGameObjects(targetArray);
    })
    .catch((err) => console.error(err));
}

function loadGameObjects() {
  base("InsectItems")
    .select({
      pageSize: 99,
      maxRecords: 1000,
      view: "Grid view",
    })
    .eachPage(
      function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.
        records.forEach(function (record) {
          console.log("Retrieved", record.get("id"));
          let data = {};
          data.key = record.get("id");
          data.imageUrl = record.get("imageUrl");
          data.popupImageUrl = record.get("popupImageUrl");
          data.bgImageUrl = record.get("bgImageUrl");
          data.illustrationUrl = record.get("illustrationUrl");
          data.iconUrl = record.get("iconUrl");
          data.iconFoundUrl = record.get("iconFoundUrl");
          data.hintUrl = record.get("hintUrl");
          data.hintFoundUrl = record.get("hintFoundUrl");
          data.correctArea = record.get("correctArea")[0];
          data.text1 = record.get("text1");
          data.text2 = record.get("text2");
          data.text3 = record.get("text3");
          data.text4 = record.get("text4");
          data.x = record.get("x");
          data.y = record.get("y");
          data.hiding = JSON.parse(record.get("hiding")); // object in json format
          targetArray.push(data);
        });

        console.log("data loaded:", targetArray);
        fetchNextPage();
      },
      function done(err) {
        if (err) {
          console.error(err);
          return;
        }
        onLoadGameObjects(targetArray);
      }
    );
}

function onLoadGameObjects(targetArray) {
  console.log("==== game objects loaded");
  targetArray.forEach(function (data) {
    // if imageurl doesnt exist then set to null (prevent loadimage from error)
    if (data.imageUrl) {
      data.imageUrl = loadImage(data.imageUrl);
      data.popupImageUrl = loadImage(data.popupImageUrl);
      data.bgImageUrl = loadImage(data.bgImageUrl);
      data.illustrationUrl = loadImage(data.illustrationUrl);
      data.iconUrl = loadImage(data.iconUrl);
      data.iconFoundUrl = loadImage(data.iconFoundUrl);
      data.hintUrl = loadImage(data.hintUrl);
      data.hintFoundUrl = loadImage(data.hintFoundUrl);
    } else {
      data.imageUrl = null;
      data.popupImageUrl = null;
      data.bgImageUrl = null;
      data.illustrationUrl = null;
      data.iconUrl = null;
      data.iconFoundUrl = null;
      data.hintUrl = null;
      data.hintFoundUrl = null;
    }
  });
  console.log("data image loaded:", targetArray);
  gameState.setMaxScore(targetArray.length);
  itemLoaded = true;
  makeGameObjects(targetArray);
}

function makeGameObjects(targetArray) {
  for (let key in targetArray) {
    let target = targetArray[key];
    // console.log(target);
    let item = new FloatingTarget(
      target.key,
      target.x,
      target.y,
      window.innerHeight / 8,
      target.hintUrl,
      target.hintFoundUrl
    );
    floatingTargets.push(item);

    let hiddenObj = new HiddenObject(
      target.key,
      target.hiding.x,
      target.hiding.y,
      target.hiding.width,
      target.hiding.height,
      target.illustrationUrl,
      target.bgImageUrl,
      target.iconUrl,
      target.iconFoundUrl,
      target.text1,
      target.text2,
      target.text3
    );
    hiddenObjects.push(hiddenObj);
    // console.log(hiddenObj);
  }

  makePopups();
  floatingTargets.forEach((target) => {
    target.validate();
  });

  gameState.setMaxScore(hiddenObjects.length);
}

function toMain() {
  floatingTargets.forEach((target) => {
    target.active = true;
  });
  gameType = "default";
}

function toState(state) {
  floatingTargets.forEach((target) => {
    // set all targets to inactive so theyre unclickable
    target.active = false;
  });
  gameType = state;
}

function createFloatingBar() {
  let iconSize = width / 9;
  let iconMargin = 20;
  let barPaddingHori = 20;
  let barPaddingVert = 5;
  let barWidth =
    iconSize * hiddenObjects.length +
    iconMargin * (hiddenObjects.length - 1) +
    barPaddingHori * 2;
  let barHeight = iconSize + barPaddingVert * 2;
  let barPos = { x: width / 2, y: height * 0.85 - barHeight / 2 };

  // display everything in a bottom bar
  rectMode(CENTER);
  noStroke();
  fill("rgba(0,0,0,0.75)");
  rect(barPos.x, barPos.y, barWidth, barHeight, barHeight / 2);
  for (let i = 0; i < floatingTargets.length; i++) {
    target = floatingTargets[i];
    push();

    let foundObject = hiddenObjects.find((item) => item.key == target.key);
    imageMode(CORNER);
    if (!target.found) {
      tint(255, 255 * 0.75);
    }
    image(
      target.found ? foundObject.iconFoundUrl : foundObject.iconUrl,
      barPos.x - barWidth / 2 + barPaddingHori + i * (iconSize + iconMargin),
      barPos.y - iconSize / 2,
      iconSize,
      iconSize,
      0,
      0,
      foundObject.iconUrl.width,
      foundObject.iconUrl.height,
      CONTAIN
    );
    pop();
  }
}

function constrainMouseDiff() {
  cMouseDiff.x = constrain(
    mouseDiff.x,
    -boxConstrain.width,
    boxConstrain.width
  );

  cMouseDiff.y = constrain(
    mouseDiff.y,
    -boxConstrain.height,
    boxConstrain.height
  );

  mouseDiff.x = cMouseDiff.x;
  mouseDiff.y = cMouseDiff.y;
}

function makePopups() {
  targetArray.forEach((item) => {
    let popup = new Popup(
      item.key,
      item.illustrationUrl,
      item.popupImageUrl,
      item.text1,
      item.text2,
      item.text3,
      DEBUG
    );
    popups.push(popup);
  });
}

class Popup {
  constructor(key, image1, image2, text1, text2, text3, debug = false) {
    this.key = key;
    this.title = text2;
    this.image1 = image1;
    this.image2 = image2;
    this.text1 = text1;
    this.text2 = text2;
    this.text3 = text3;
    this.state = "hidden";
    this.debug = debug;
    this.buttonArea = {};
  }

  display() {
    if (this.state == "hidden") {
      return;
    }

    let boxWidth = width * 0.85;
    let boxHeight = boxWidth * 1.75;
    let x = width / 2;
    let y = height / 2;
    let hPadding = width / 10;
    let vPadding = height / 25;
    let top = y - boxHeight / 2 + vPadding * 2;
    let bgColor = color(Forest);
    let imageSize = min(boxWidth * 0.6, boxHeight * 0.45);
    rectMode(CENTER);
    imageMode(CENTER);
    noStroke();
    // bg overlay
    fill("rgba(0,0,0,0.5)");
    rect(width / 2, height / 2, width, height);
    // box
    fill(bgColor);
    rect(x, y, boxWidth, boxHeight);
    // title
    textAlign(CENTER, CENTER);
    textSize(34);
    textFont(headingFont);
    fill(color(White));
    text(this.title, x, y - boxHeight / 2 + vPadding * 2);

    // image
    let imageY = top + vPadding * 2 + imageSize / 2;
    if (this.state == "first") {
      image(this.image1, x, imageY, imageSize, imageSize);
    } else if (this.state == "second") {
      image(this.image2, x, imageY, imageSize, imageSize);
    }

    // boxy text
    let buttonHeight = 50;
    let buttonWidth = 100;
    let textHeight = boxHeight - imageSize - vPadding * 6 - buttonHeight;
    let textY = imageY + imageSize / 2 + vPadding;
    let buttonY = textY + textHeight + buttonHeight / 2;

    this.buttonArea = {
      x: x,
      y: buttonY,
      w: buttonWidth,
      h: buttonHeight,
    };

    this.makeButton(
      this.buttonArea.x,
      this.buttonArea.y,
      this.buttonArea.w,
      this.buttonArea.h
    );

    let offset = 32;
    if (this.state == "first") {
      textAlign(CENTER, TOP);
      textSize(20);
      textFont(Lato.regular);
      fill(color(White));

      let tHeight = textAscent() + textDescent();
      if (textWidth(this.text1) > boxWidth - hPadding * 2) {
        offset = tHeight * 2;
      } else {
        offset = tHeight;
      }
      text(this.text1, x, textY + tHeight / 2, boxWidth - hPadding * 2);

      textFont(Lato.bold);

      text(
        this.text2.toUpperCase(),
        x,
        textY + textHeight / 2 + offset,
        boxWidth - hPadding * 2,
        textHeight - offset
      );
    } else if (this.state == "second") {
      textAlign(CENTER, TOP);
      textSize(16);
      textFont(Lato.regular);
      fill(color(White));
      text(
        this.text3,
        x,
        textY + textHeight / 2,
        boxWidth - hPadding * 2,
        textHeight
      );
    }

    if (this.debug) {
      stroke(255, 0, 0);
      strokeWeight(2);
      noFill();
      stroke(0, 255, 0);
      rect(x, imageY, imageSize, imageSize);
      stroke(0, 0, 255);
      rect(x, textY + textHeight / 2, boxWidth - hPadding * 2, textHeight);
    }
  }

  makeButton(x, y, w, h) {
    push();
    rectMode(CENTER);
    fill(color(Honey));
    rect(x, y, w, h, h / 2);
    textAlign(CENTER, CENTER);
    textFont(Lato.regular);
    textSize(16);
    fill("white");
    text("NEXT", x - this.buttonArea.w * 0.125, y - 2);

    // arrow on right side of button
    let arrowSize = 13;
    let arrowX = x + this.buttonArea.w * 0.375 - arrowSize;
    let arrowY = y;

    stroke("white");
    strokeWeight(1.3);
    line(arrowX, arrowY, arrowX + arrowSize, arrowY);
    line(
      arrowX + arrowSize,
      arrowY,
      arrowX + arrowSize / 2,
      arrowY + arrowSize / 2
    );
    line(
      arrowX + arrowSize,
      arrowY,
      arrowX + arrowSize / 2,
      arrowY - arrowSize / 2
    );

    pop();
  }

  handlePress() {
    if (this.state == "hidden") {
      return;
    }
    if (
      mouseX > this.buttonArea.x - this.buttonArea.w / 2 &&
      mouseX < this.buttonArea.x + this.buttonArea.w / 2 &&
      mouseY > this.buttonArea.y - this.buttonArea.h / 2 &&
      mouseY < this.buttonArea.y + this.buttonArea.h / 2
    ) {
      if (this.state == "second") {
        this.state = "hidden";
        toMain();
        // check if all items are found
        if (
          floatingTargets.every((item) => item.found) &&
          hiddenObjects.every((item) => item.found) &&
          gameState.state == "gameplay"
        ) {
          gameState.setState("completed");
        }
      }
    }
  }

  show() {
    this.state = "second";
  }
}
