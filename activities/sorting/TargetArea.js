class NewTargetArea {
  constructor(_key, name, image, description, x, y, w, h, rotation, debug) {
    this.key = _key;
    this.name = name;
    this.image = image;
    this.description = description;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.cx = this.x + this.w / 2; // center
    this.cy = this.y + this.h / 2;
    this.padding = 10; // padding for text
    this.paddedX = this.x + this.padding / 2; // padded position (top left)
    this.paddedY = this.y + this.padding / 2;
    this.paddedWidth = this.w - this.padding; // padded width and height
    this.paddedHeight = this.h - this.padding;
    this.rotation = rotation;
    this.textColor = color(White);
    this.debug = debug;
  }

  display() {
    push();

    //center positioning
    this.cx = 0 + this.w / 2;
    this.cy = 0 + this.h / 2;

    rectMode(CENTER);
    imageMode(CENTER);
    translate(this.x + this.w / 2, this.y + this.h / 2);
    rotate(this.rotation);
    angleMode(DEGREES);
    // if image isnt provided, draw a rectangle
    noStroke();
    if (this.image == null) {
      fill(255, 0, 255);
      rect(0, 0, this.w, this.h);
    } else {
      push();
      image(this.image, 0, 0, this.w, this.h);
      pop();
    }
    if (this.debug) {
      stroke(255, 0, 0);
      noFill();
      rect(0, 0, this.w, this.h);
    }

    // draw the text title
    noStroke();
    fill(this.textColor);
    textSize(min(this.w, this.h) / 8);
    textAlign(CENTER, TOP);
    textFont(headingFont);
    text(this.name, 0, this.padding / 2 - this.h / 2);

    // draw the text description

    textSize(min(this.w, this.h) / 20);
    textAlign(CENTER, BOTTOM);
    rectMode(CENTER);
    textWrap(WORD);
    text(
      this.description,
      0,
      0,
      this.paddedWidth, // last 2 param = text box for the wrapping area
      this.paddedHeight
    );
    // debug text box
    if (this.debug) {
      stroke(0, 255, 0);
      noFill();
      rect(0, 0, this.paddedWidth, this.paddedHeight);
    }
    pop();
  }
}
