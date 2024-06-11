// point in polygon function
// raycasting courtesy of chatgpt
function pointInPolygon(point, vs) {
  let x = point.x,
    y = point.y;
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    let xi = vs[i].x,
      yi = vs[i].y;
    let xj = vs[j].x,
      yj = vs[j].y;
    let intersect =
      yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// grid drawing function
function drawGrid(corners, size) {
  stroke(25);
  strokeWeight(1);

  for (let i = 0; i <= (corners.x2 - corners.x1) / size; i++) {
    line(i * size + corners.x1, corners.y1, i * size + corners.x1, corners.y2);
  }
  for (let i = 0; i <= (corners.y2 - corners.y1) / size; i++) {
    line(corners.x1, i * size + corners.y1, corners.x2, i * size + corners.y1);
  }
}

function drawSquares(
  col,
  row,
  m,
  corners,
  size,
  strokeColor,
  fillColor,
  rounded = 0
) {
  let numCols = col;
  let numRows = row;
  let margin = m;

  rectMode(CENTER);
  let squareSize = size - margin;

  for (let i = 0; i < numCols; i++) {
    for (let j = 0; j < numRows; j++) {
      let x =
        corners.x1 + margin / 2 + (squareSize + margin) * i + squareSize / 2;
      let y =
        corners.y1 + margin / 2 + (squareSize + margin) * j + squareSize / 2;
      push();
      blendMode(ADD);
      stroke(strokeColor);
      strokeWeight(1);
      fill(fillColor);
      // noStroke();
      // fill("rgba(255, 255, 255, 0.1)");
      rect(x, y, squareSize, squareSize, rounded);
      pop();
    }
  }
  blendMode(BLEND); // reset blend mode
}

// create random rgb color string
function randomFill() {
  let r = round(random(0, 255));
  let g = round(random(0, 255));
  let b = round(random(0, 255));
  return `rgb(${r}, ${g}, ${b})`;
}

function nextItem() {
  activeItem++;
  if (activeItem > snappables.length - 1) {
    activeItem = 0;
  }
}

function prevItem() {
  activeItem--;
  if (activeItem < 0) {
    activeItem = snappables.length - 1;
  }
}
