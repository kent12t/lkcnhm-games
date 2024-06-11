class Draggable {
  constructor(name, x, y, w, h, correctArea, img, debug) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.correctArea = correctArea;
    this.isDragging = false;
    this.objectSprite = createSprite(-1000, y, this.width, this.height);
    this.objectSprite.collider = "k"; // moveable code but not involved with physics sim
    this.img = img; // could be null
    this.done = false;
    this.debug = debug;
    this.correct = false;
    this.active = false;

    // custom draw function to display the image
    this.objectSprite.draw = () => {
      // if no image is provided, draw a rectangle
      if (this.objectSprite.visible) {
        if (this.img == null) {
          push();
          fill(255, 0, 255);
          rectMode(CENTER);
          rect(0, 0, this.objectSprite.w, this.objectSprite.h);
          pop();
        } else {
          push();
          imageMode(CENTER);
          rectMode(CENTER);
          // keep the x,y as 0,0 for it to draw the image where the sprite is positioned at
          image(this.img, 0, 0, this.objectSprite.w, this.objectSprite.h);
          pop();
        }
        if (this.debug) {
          push();
          stroke(255, 0, 0);
          noFill();
          rect(0, 0, this.objectSprite.w, this.objectSprite.h);
          pop();
        }
      }
    };
  }

  update() {
    if (this.isDragging && !this.done) {
      if (touches.length > 0) {
        // if theres touch events then use those instead
        this.x = touches[0].x;
        this.y = touches[0].y;
      } else {
        this.x = mouseX;
        this.y = mouseY;
      }
    }

    if (this.active) {
      this.objectSprite.visible = true;
    } else if (this.done) {
      this.objectSprite.visible = true;
    } else {
      this.objectSprite.visible = false;
    }
  }

  display() {
    push();
    this.objectSprite.x = this.x;
    this.objectSprite.y = this.y;
    this.objectSprite.w = this.width;
    this.objectSprite.h = this.height;

    if (this.isDragging) {
      drawingContext.shadowOffsetX = 5;
      drawingContext.shadowOffsetY = 5;
      drawingContext.shadowBlur = 10;
      drawingContext.shadowColor = "#333";
    }
    if (this.active) {
      push();
      noStroke();
      fill(255, 255, 255, 100);
      pop();
    }

    // always call the draw
    this.objectSprite.draw();

    if (this.done) {
      if (this.correct) {
        push();
        noFill();
        stroke(255, 0, 0, 100);
        strokeWeight(10);
        pop();
      } else {
      }
    }

    pop();
  }

  checkCorrectArea() {
    // only checks when the object is being dragged
    if (this.isDragging) {
      // if item is within the correct area
      if (this.collision(this.objectSprite, this.correctArea)) {
        // run the correct code and remove the dragging status
        this.isCorrect();
        this.handleRelease();

        // snap to the box
        this.x = this.correctArea.x + this.correctArea.width / 2;
        this.y = this.correctArea.y + height * 0.1;
        this.objectSprite.pos.x = this.x;
        this.objectSprite.pos.y = this.y;

        return true;
      } else {
        // run the wrong code and remove dragging status
        this.isWrong(); // fire onWrongArea event
        this.handleRelease();
        return false;
      }
    }
    return false;
  }

  handlePress() {
    // if press is within this object
    if (
      mouseX > this.x - this.width / 2 &&
      mouseX < this.x + this.width / 2 &&
      mouseY > this.y - this.height / 2 &&
      mouseY < this.y + this.height / 2
    ) {
      this.isDragging = true;
    } else {
      this.isDragging = false;
    }

    return this.isDragging;
  }

  handleRelease() {
    this.isDragging = false;
  }

  setDone() {
    this.done = true;
  }

  isDone() {
    return this.done;
  }

  isCorrect() {
    console.log("correct");
    this.correct = true;
    this.onCorrectArea();

    // sets the timer (in frames) for the overlay to disappear
    // positive so code knows the overlay is for correct answer
    overlayTimer = 20;
  }

  // event for when the object is dropped in the correct area
  onCorrectArea() {}

  resetPosition() {
    this.x = draggableDefault.x;
    this.y = draggableDefault.y;
    this.objectSprite.x = draggableDefault.x;
    this.objectSprite.y = draggableDefault.y;
  }

  isWrong() {
    // return the draggable into the initial position when dropped wrongly
    console.log("wrong");
    this.correct = false;
    this.onWrongArea(); // fire onWrongArea event

    // sets the timer (in frames) for the overlay to disappear
    // negative so code knows the overlay is for wrong answer
    overlayTimer = -20;
  }

  // event for when the object is dropped in the wrong area
  onWrongArea() {}

  collision(a, b) {
    let i, j, k, l;

    // a is draggable
    // b is area

    i = a.pos.x > b.x;
    j = a.pos.x < b.x + b.width;
    k = a.pos.y > b.y;
    l = a.pos.y < b.y + b.height;

    return i && j && k && l;
  }
}
