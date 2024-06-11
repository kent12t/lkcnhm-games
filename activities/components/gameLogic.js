function sendActivityComplete(name, score, maxScore) {
  console.log(`complete => name:${name},score:${score},maxScore:${maxScore}`);
  if (typeof activityComplete !== "undefined")
    activityComplete.postMessage(
      `{"complete": {"name":"${name}","score":${score},"maxScore":${maxScore}} }`
    );
  else {
    console.error(`select activityComplete:undefined`);
  }
}

function sendCorrectAnswerResponse() {
  if (typeof draggables[activeDraggableId] !== "undefined") {
    console.log(
      `send Correct Answer Response draggables[${activeDraggableId}]:${draggables[activeDraggableId].name}`
    );
    if (typeof showCorrectAnswerResponse !== "undefined") {
      showCorrectAnswerResponse.postMessage(
        `{"name":"${draggables[activeDraggableId].name}}"`
      );
    } else {
      console.error(`select showCorrectAnswerResponse:undefined`);
    }
  } else {
    console.error(`select draggables[${activeDraggableId}]:undefined`);
  }
}

function sendWrongAnswerResponse() {
  if (typeof draggables[activeDraggableId] !== "undefined") {
    console.log(
      `send Wrong Answer Response draggables[${activeDraggableId}]:${draggables[activeDraggableId].name}`
    );
    if (typeof showWrongAnswerResponse !== "undefined") {
      showWrongAnswerResponse.postMessage(
        `{"name":"${draggables[activeDraggableId].name}}"`
      );
    } else {
      console.error(`select showWrongAnswerResponse:undefined`);
    }
  } else {
    console.error(`select draggables[${activeDraggableId}]:undefined`);
  }
}

function sendActiveDraggableName() {
  if (typeof draggables[activeDraggableId] !== "undefined") {
    console.log(
      `select draggables[${activeDraggableId}]:${draggables[activeDraggableId].name}`
    );
    if (typeof flutterScreen !== "undefined")
      flutterScreen.postMessage(`${draggables[activeDraggableId].name}`);
  } else {
    console.log(`select draggables[${activeDraggableId}]:undefined`);
  }
}

class GameState {
  constructor(gamename) {
    this.gameName = gamename;
    this.state = "loading";
    this.loaded = false;
    this.completed = false;
    this.score = 0;
    this.maxScore = 0;
  }

  setMaxScore(maxScore) {
    this.maxScore = maxScore;
  }

  setGameName(gameName) {
    this.gameName = gameName;
  }

  setState(state) {
    this.state = state;
    if (state == "gameplay") {
      this.loaded = true;
    } else if (state == "completed") {
      this.completed = true;
      this.onCompleted();
    }
  }

  onLoaded() {}

  onCompleted() {
    sendActivityComplete(this.gameName, this.score, this.maxScore);
  }
  incrementScore() {
    this.score++;
  }

  decrementScore() {
    this.score--;
  }

  isComplete(game, score) {
    // console.log(localStorage.getItem(game));
    // convert the json string from local storage to an object
    let currentGameObj = JSON.parse(localStorage.getItem(game));
    // update the score
    if (currentGameObj != null) {
      currentGameObj.score = score;
    }
    // convert the object back to a json string to store in local storage
    localStorage.setItem(game, JSON.stringify(currentGameObj));

    // send the score to the flutter screen
    this.sendActivityComplete(score);

    console.log(`game ${game} completed with score ${score}`);
  }

  sendActivityComplete(score) {
    if (typeof activityComplete !== "undefined")
      activityComplete.postMessage(
        `{message="activity complete", score=${score}}`
      );
  }
}

// Fisher-Yates Shuffle Algorithm from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

let loadingProgress = 0;

function drawLoadingScreen() {
  push();
  background(color(Sand));
  textAlign(CENTER, CENTER);
  textSize(20);
  noStroke();
  fill(color(Forest));
  textFont(Lato.regular);
  text("Loading...", width / 2, height / 2 - 40);

  let loadDiameter = 40;

  // filled up bar
  noFill();
  strokeWeight(6);
  stroke(color(Forest));

  loadingProgress++;
  if (loadingProgress == 60) {
    loadingProgress = 0;
  }

  let adjustedLoading = map2(loadingProgress, 0, 60, 0, TWO_PI, SQRT, BOTH);

  angleMode(RADIANS);
  arc(
    window.innerWidth / 2,
    window.innerHeight / 2 + 20,
    loadDiameter,
    loadDiameter,
    0 + adjustedLoading,
    HALF_PI + adjustedLoading
  );

  pop();
}
