let buttons = [];

let rectWidth,
  rectHeight,
  rectPadding,
  numRows,
  gridWidth,
  gridHeight,
  startX,
  startY;

let sections = {
  snapping: {
    index: 0,
    score: 0,
    title: "Packing for Expedition",
    maxScore: 7,
    description: "Drag the items into the correct grid",
    url: "../activities/snapping/index.html",
  },
  mcq: {
    index: 1,
    score: 0,
    title: "Finding Insects",
    maxScore: 4,
    description: "Find insects",
    url: "../activities/finding/index.html",
  },
  sorting: {
    index: 2,
    score: 0,
    title: "Obtaining Specimens",
    maxScore: 11,
    description: "Sort the items into the correct boxes",
    url: "../activities/sorting/index.html",
  },
  dragging: {
    index: 3,
    score: 0,
    title: "A New Discovery",
    maxScore: 8,
    description: "Drag the animals into the correct area",
    url: "../activities/dragging/index.html",
  },
};

function setup() {
  // populate the local storage if sections doesnt exist
  for (let section in sections) {
    // make sure you dont overwrite if the storage already exists
    if (localStorage.getItem(section) == null) {
      localStorage.setItem(section, JSON.stringify(sections[section]));
    } else {
      // if it exists, then update the sections object with the data from local storage
      sections[section] = JSON.parse(localStorage.getItem(section));
    }

    console.log(`section ${section} populated`);
  }
  console.log("yo");
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);
  imageMode(CORNER);
  rectMode(CORNER);
  rectWidth = width / 3;
  rectHeight = height / 4;
  rectPadding = 20;

  numRows = 2;
  gridWidth = (rectWidth + rectPadding) * 2 - rectPadding;
  gridHeight = (rectHeight + rectPadding) * numRows - rectPadding;
  startX = (windowWidth - gridWidth) / 2;
  startY = (windowHeight - gridHeight) / 2 - rectHeight / 2;
  for (section in sections) {
    // console.log(section);
    let sect = sections[section];
    let i = sect.index;
    let row = Math.floor(sect.index / 2);
    let col = sect.index % 2;
    let x = startX + (rectWidth + rectPadding) * col;
    let y = startY + (rectHeight + rectPadding) * row;

    let checkScore = sect.score != undefined ? sect.score : 0;
    rectMode(CORNER);
    // let btn = rect(x, y, rectWidth, rectHeight, 20);
    let sizeAdaptive = min(windowWidth, windowHeight) / 30;
    buttons[i] = createButton(
      sect.title +
      " (" +
      checkScore +
      "/" +
      sect.maxScore +
      ")" +
      " " +
      sect.description
    );
    buttons[i].position(x, y);
    buttons[i].size(rectWidth, rectHeight);
    if (checkScore == sect.maxScore) {
      // completed
      buttons[i].style("background-color", "#EEEEEE");
    } else {
      buttons[i].style("background-color", "#666666");
    }
    buttons[i].style("font-size", sizeAdaptive + "px");
    buttons[i].style("border", "none");
    buttons[i].style("outline", "none");
    buttons[i].style("border-radius", "20px");
    buttons[i].style("box-shadow", "2px 2px 4px 1px rgba(0,0,0,0.4)");
    buttons[i].mousePressed(() => {
      window.location.href = sect.url;
    });
  }
}

function draw() {
  clear();
  // console.log("draw");
  background(200);

  // update button values
  for (section in sections) {
    let sect = sections[section];
    let index = sect.index;
    let checkScore = sect.score != undefined ? sect.score : 0;

    buttons[index].elt.innerHTML =
      sect.title +
      " (" +
      checkScore +
      "/" +
      sect.maxScore +
      ")" +
      " " +
      sect.description;
  }

  // draw completion box
  fill(180);
  noStroke();
  rectMode(CORNER);
  rect(
    startX,
    startY + gridHeight + rectPadding,
    rectWidth * 2 + rectPadding,
    rectHeight,
    20
  );
  // draw completion text
  fill(80);
  textSize(min(windowWidth, windowHeight) / 30);
  textAlign(CENTER, CENTER);
  disText = "Incomplete";
  rectMode(CENTER);
  text(disText, width / 2, startY + gridHeight + rectPadding + rectHeight / 2);
}
