class FloatingTarget {
  constructor(key, x, y, size, hintUrl, hintFoundUrl) {
    this.key = key;
    this.x0 = x;
    this.y0 = y;
    this.x = this.x0;
    this.y = this.y0;
    this.initPos = { x: x * width, y: y * height };
    this.size = size;
    this.found = false;
    this.active = true;
    this.hintUrl = hintUrl;
    this.hintFoundUrl = hintFoundUrl;
  }

  validate() {
    if (windowWidth && windowHeight) {
      this.x = this.x0 * windowWidth;
      this.y = this.y0 * windowHeight;
      this.initPos = { x: this.x0 * windowWidth, y: this.y0 * windowHeight };
    } else {
      setTimeout(() => {
        this.validate();
      }, 100);
    }
  }

  display() {
    // dont show when not active (on another game state)
    push();
    if (this.active) {
      this.x = this.initPos.x + cMouseDiff.x;
      this.y = this.initPos.y + cMouseDiff.y;
      imageMode(CENTER);
      if (!this.found) {
        blendMode(MULTIPLY);
      }
      image(
        this.found ? this.hintFoundUrl : this.hintUrl,
        this.x,
        this.y,
        this.size * 1.2,
        this.size * 1.2
      );
    }
    pop();
  }

  onPress() {
    let circleCollision = dist(this.x, this.y, mouseX, mouseY) < this.size / 2;

    if (circleCollision && !this.found && this.active) {
      console.log(`${this.key} selected!`);
      this.onSelected();
    } else if (circleCollision && this.found && this.active) {
      popups.find((p) => p.key == this.key).show();
    }
  }

  onSelected() {
    this.found = true;
    this.active = false;
    toState(this.key);
  }
}

class HiddenObject {
  constructor(
    key,
    x,
    y,
    width,
    height,
    imageUrl,
    bgImageUrl,
    iconUrl,
    iconFoundUrl,
    text1 = "",
    text2 = "",
    text3 = ""
  ) {
    this.key = key;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.adjustedDimension = { x: 0, y: 0, width: 0, height: 0 };
    this.imageUrl = imageUrl;
    this.bgImageUrl = bgImageUrl;
    this.iconUrl = iconUrl;
    this.iconFoundUrl = iconFoundUrl;
    this.text1 = text1;
    this.text2 = text2;
    this.text3 = text3;
    this.active = false;
    this.found = false;
  }

  display() {
    push();
    imageMode(CENTER);

    // ensures that relative pos/size is done in the draw function
    let imageSize = min(
      this.width * window.innerWidth,
      this.height * window.innerHeight
    );
    let whRatio = this.imageUrl.width / this.imageUrl.height;

    this.adjustedDimension.x = this.x * window.innerWidth;
    this.adjustedDimension.y = this.y * window.innerHeight;
    this.adjustedDimension.width = imageSize;
    this.adjustedDimension.height = imageSize * whRatio;

    image(
      this.imageUrl,
      this.adjustedDimension.x,
      this.adjustedDimension.y,
      this.adjustedDimension.width,
      this.adjustedDimension.height,
      0,
      0,
      this.imageUrl.width,
      this.imageUrl.height,
      CONTAIN
    );
    pop();
  }

  onPress() {
    let rectCollision =
      this.adjustedDimension.x - this.adjustedDimension.width / 2 < mouseX &&
      mouseX < this.adjustedDimension.x + this.adjustedDimension.width / 2 &&
      this.adjustedDimension.y - this.adjustedDimension.height / 2 < mouseY &&
      mouseY < this.adjustedDimension.y + this.adjustedDimension.height / 2;

    if (rectCollision && this.active) {
      console.log(`${this.key} pressed!`);
      this.onFound();
    }
  }

  onFound() {
    this.active = false;
    this.found = true;
    console.log(this.key + " found");
    // toMain();
    gameState.incrementScore();
    console.log(`${gameState.score} / ${gameState.maxScore}`);
    popups.find((p) => p.key == this.key).show();
  }
}
