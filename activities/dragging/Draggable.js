class Draggable {
  constructor(
    key,
    name,
    x,
    y,
    w,
    h,
    correctArea,
    img,
    iconImage,
    debug = false,
    type = "mammal"
  ) {
    this.key = key;
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
    this.iconImage = iconImage;
    this.done = false;
    this.debug = debug;
    this.correct = false;
    this.active = false;
    this.type = type;

    // custom draw function to display the image
    this.objectSprite.draw = () => {
      // if no image is provided, draw a rectangle
      if (this.objectSprite.visible) {
        push();
        imageMode(CENTER);
        rectMode(CENTER);
        // keep the x,y as 0,0 for it to draw the image where the sprite is positioned at
        image(this.img, 0, 0, this.objectSprite.w, this.objectSprite.h);
        pop();

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
      this.objectSprite.visible = false;
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
    // always call the draw
    this.objectSprite.draw();

    pop();
  }

  checkCorrectArea() {
    // if the item is within the radius of center of page, reset position
    let allowanceWidth = 45;
    if (
      this.x > draggableDefault.x - allowanceWidth &&
      this.x < draggableDefault.x + allowanceWidth &&
      this.y > draggableDefault.y - height / 2 &&
      this.y < draggableDefault.y + height / 2
    ) {
      console.log("released middle");
      this.resetPosition();
      this.handleRelease();
      return false;
    }

    // if the item is below or above the playing area, reset position
    if (
      this.y > this.correctArea.y + this.correctArea.height ||
      this.y < this.correctArea.y
    ) {
      console.log("released above or below");
      this.resetPosition();
      this.handleRelease();
    }

    // only checks when the object is being dragged
    if (this.isDragging) {
      // if item is within the correct area
      if (this.collision(this.objectSprite, this.correctArea)) {
        // run the correct code and remove the dragging status
        this.isCorrect();
        this.handleRelease();
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
    this.done = true;
    this.correct = true;
    inventories.find((i) => i.name == this.correctArea.name).addItem(this);
    toasts
      .find((i) => i.correct == true)
      .enable(`${this.name} is from the ${this.correctArea.name}.`);
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
  }

  isWrong() {
    // return the draggable into the initial position when dropped wrongly
    this.done = true;
    this.correct = false;
    inventories.find((i) => i.name == this.correctArea.name).addItem(this);
    toasts
      .find((i) => i.correct == false)
      .enable(`${this.name} is from the ${this.correctArea.name}.`);
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
