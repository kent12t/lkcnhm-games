class NewTargetArea {
  constructor(_key, name, description, x, y, w, h, rotation, debug) {
    this.key = _key;
    this.name = name;
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

    if (this.debug) {
      rectMode(CENTER);
      stroke(255, 0, 255);
      noFill();
      strokeWeight(1);
      rect(0, 0, this.w, this.h);
    }

    // draw the text title
    noStroke();
    this.name == "west" ? fill(color(Honey)) : fill(color(Forest));
    textSize(32);
    textAlign(CENTER, TOP);
    textFont(headingFont);
    text(this.name, 0, -this.h * 0.55);

    // debug text box
    if (this.debug) {
      stroke(0, 255, 0);
      noFill();
      rect(0, 0, this.paddedWidth, this.paddedHeight);
    }
    pop();
  }
}
