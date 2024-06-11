class Snappable {
  constructor(
    arr,
    gridSize,
    luggage,
    correctPos,
    name,
    fullName,
    imageObj,
    imageSize,
    imageLocation,
    title = "",
    description = ""
  ) {
    this.correctPos = correctPos; // the last object in the array is the correct position, excluded in some of the loops
    this.curFill = randomFill(); // call this once to get a random fill
    this.gridSize = gridSize; // passed on global var
    this.imageLocation = imageLocation; // an object with x and y
    this.imageObj = imageObj; // loaded p5 image object
    this.imageSize = imageSize; // an object with width and height
    this.isDragging = false;
    this.luggage = luggage; // passed on global var
    this.name = name; // string
    this.fullName = fullName; // string
    this.pos = { x: 0, y: 0 }; // position of the first vertex in the array, snapped to the grid number
    this.stroke = "rgb(255)";
    this.strokeWeight = 0;
    this.vertices = arr; // array of p5 vectors
    this.active = false;
    this.done = false; // boolean to check if the object is in the correct position
    this.title = title;
    this.description = description;
  }

  validate() {
    // update all position, otherwise the item with (0,0) correct pos will already be correct without being moved
    this.pos.x = round((this.vertices[0].x - this.luggage.x1) / this.gridSize);
    this.pos.y = round((this.vertices[0].y - this.luggage.y1) / this.gridSize);
    // prevention of showing up correct right away
    if (this.pos.x == this.correctPos.x0 && this.pos.y == this.correctPos.y0) {
      let randX = () => int(random(1, 3));
      let randY = () => int(random(1, 3));

      let newX = randX();
      let newY = randY();
      console.log(`${this.name} is at (${this.pos.x}, ${this.pos.y})`);
      console.log(`${this.name} rerolled with x: ${newX}, y: ${newY}`);

      this.vertices.forEach((vertex) => {
        // move each vertex by rerolled value
        vertex.x = vertex.x + newX * this.gridSize;
        vertex.y = vertex.y + newY * this.gridSize;
      });

      // update the image location just like the vertices
      this.imageLocation.x += newX * this.gridSize;
      this.imageLocation.y += newY * this.gridSize;

      this.pos.x = round(
        (this.vertices[0].x - this.luggage.x1) / this.gridSize
      );
      this.pos.y = round(
        (this.vertices[0].y - this.luggage.y1) / this.gridSize
      );

      console.log(`${this.name} is now at (${this.pos.x}, ${this.pos.y})`);

      this.done = false;
    }
  }

  display() {
    // push pop important here to ensure the shadow is only applied to the current polygon
    push();

    if (this.done) {
      // opaque green overlay when done
      fill("rgba(255,150,10,0.1)");
      noStroke();
      beginShape();
      for (let i = 0; i < this.vertices.length; i++) {
        vertex(this.vertices[i].x, this.vertices[i].y);
      }
      endShape(CLOSE);
    }

    pop();

    push();
    // html dom shadow stuff
    if (this.isDragging && !this.isDone) {
      drawingContext.shadowOffsetX = 5;
      drawingContext.shadowOffsetY = 5;
      drawingContext.shadowBlur = 10;
      drawingContext.shadowColor = "#222";
    }

    stroke(this.stroke);
    strokeWeight(this.strokeWeight); // change the stroke weight when dragging, default is 0

    if (this.active && this.done) {
      stroke(color(Honey));
      strokeWeight(2);
      noFill();
      beginShape();
      for (let i = 0; i < this.vertices.length; i++) {
        vertex(this.vertices[i].x, this.vertices[i].y);
      }
      endShape(CLOSE);
    } else if (this.active && !this.done && !this.isDragging) {
      drawingContext.shadowOffsetX = 0;
      drawingContext.shadowOffsetY = 0;
      drawingContext.shadowBlur = 6;
      drawingContext.shadowColor = "#fff";
    }

    if (this.imageObj) {
      // if there's an image url, draw the image
      imageMode(CORNER);
      this.done ? tint(255, 190) : noTint();
      image(
        this.imageObj,
        this.imageLocation.x,
        this.imageLocation.y,
        this.imageSize.width,
        this.imageSize.height
      );
    } else {
      // if image doesnt exist
      // draw the polygon instead
      fill(this.curFill);
      beginShape();
      for (let i = 0; i < this.vertices.length; i++) {
        vertex(this.vertices[i].x, this.vertices[i].y);
      }
      endShape(CLOSE);
    }

    pop();
  }

  handlePress() {
    // check raycast position of mouse against the vertices of the polygon
    if (pointInPolygon({ x: mouseX, y: mouseY }, this.vertices)) {
      this.isDragging = true;
      return true;
    } else {
      return false;
    }
  }

  onCorrectPos() {
    // console.log("correct");
    gameState.incrementScore();
    console.log(`${gameState.score} / ${gameState.maxScore}`);
    nextItem();
  }

  onWrongPos() {}

  handleRelease() {
    this.isDragging = false;
    this.strokeWeight = 0;

    if (this.pos.x == this.correctPos.x0 && this.pos.y == this.correctPos.y0) {
      if (this.done == false) {
        this.onCorrectPos();
        this.done = true;
      }
    } else {
      this.onWrongPos();
      this.done = false;
    }
  }

  handleDrag() {
    if (this.isDragging) {
      // snap the mouse position to the grid (virtually)
      let snapMouseX = round(mouseX / gridSize) * gridSize;
      let snapMouseY = round(mouseY / gridSize) * gridSize;
      let psnapMouseX = round(pmouseX / gridSize) * gridSize;
      let psnapMouseY = round(pmouseY / gridSize) * gridSize;

      // mouse diff
      let mouseDiff = {
        x: snapMouseX - psnapMouseX,
        y: snapMouseY - psnapMouseY,
      };

      // // constrain the movement of the polygon to within the canvas boundaries
      this.vertices.forEach((vertex) => {
        if (vertex.x + mouseDiff.x < 0 || vertex.x + mouseDiff.x > width) {
          mouseDiff.x = 0;
        }

        if (
          vertex.y + mouseDiff.y < height * 0.1 ||
          vertex.y + mouseDiff.y > height
        ) {
          mouseDiff.y = 0;
        }
      });

      this.vertices.forEach((vertex) => {
        // move each vertex by the difference between the snapped mouse position and the previous snapped mouse position
        vertex.x = vertex.x + mouseDiff.x;
        vertex.y = vertex.y + mouseDiff.y;
      });

      // update the image location just like the vertices
      this.imageLocation.x += mouseDiff.x;
      this.imageLocation.y += mouseDiff.y;

      // change the stroke weight when dragging
      this.strokeWeight = 4;

      // update the position of the first vertex in the array, snapped to the grid number
      this.pos.x = round(
        (this.vertices[0].x - this.luggage.x1) / this.gridSize
      );
      this.pos.y = round(
        (this.vertices[0].y - this.luggage.y1) / this.gridSize
      );
    }
  }
}
