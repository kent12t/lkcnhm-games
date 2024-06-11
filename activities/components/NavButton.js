class NavButton {
  constructor(
    x,
    y,
    w,
    h,
    callback,
    direction = "right",
    color = "rgba(0,0,0,0)",
    onColor = "#000",
    stroke = "rgba(0,0,0,0)"
  ) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.direction = direction;
    this.color = color;
    this.onColor = onColor;
    this.callback = callback;
    this.stroke = stroke;
    this.overlayTime = 0;
  }

  display() {
    push();
    rectMode(CENTER);
    stroke(this.stroke);
    strokeWeight(2);
    fill(this.color);
    rect(this.x, this.y, this.w, this.h);

    this.drawArrow(this.direction);
    pop();
  }

  handlePress() {
    if (
      mouseX > this.x - this.w / 2 &&
      mouseX < this.x + this.w / 2 &&
      mouseY > this.y - this.h / 2 &&
      mouseY < this.y + this.h / 2
    ) {
      this.callback();
      this.overlayTime = 90;
    }
  }

  drawOverlay(time) {
    push();
    noStroke();
    rectMode(CENTER);
    fill(`rgba(255,255,255,${time / 180})`);
    rect(this.x, this.y, this.w, this.h, 80);
    pop();
  }

  drawArrow(direction) {
    let arrowSize = min(this.w * 0.6, this.h * 0.6);

    push();

    translate(this.x, this.y);
    stroke(this.onColor);
    strokeWeight(1);

    if (direction == "right") {
      // right arrow
      line(arrowSize / 4, 0, -arrowSize / 4, -arrowSize / 2);
      line(arrowSize / 4, 0, -arrowSize / 4, arrowSize / 2);
    } else if (direction == "left") {
      // left arrow
      line(-arrowSize / 4, 0, arrowSize / 4, -arrowSize / 2);
      line(-arrowSize / 4, 0, arrowSize / 4, arrowSize / 2);
    }

    pop();

    this.drawOverlay(this.overlayTime);
    if (this.overlayTime > 0) {
      this.overlayTime -= 2;
    } else {
      this.overlayTime = 0;
    }
  }
}
