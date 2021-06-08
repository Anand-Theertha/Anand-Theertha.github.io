function removeFromArray(arr, elt) {
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == elt) {
      arr.splice(i, 1);
    }
  }
}

function heuristic(a, b) {
  var d = dist(a.i, a.j, b.i, b.j); //dist is a p5 cmd --> calculating raw ecludian dist
  //var d = abs(a.i - b.i) + abs(a.j - b.j); // Taxi-cab heuristic calculation
  return d;
}

var cols = 100;
var rows = 100;
var grid = new Array(cols);

var openSet = [];
var closedSet = [];
var start;
var end;
var w, h;
var path = [];

// Constructor function to create an object to represent the nodes
function Spot(i, j) {
  this.i = i;
  this.j = j;
  this.f = 0;
  this.g = 0;
  this.h = 0;
  this.neighbors = [];
  this.previous = undefined;
  this.wall = false;

  if (random(1) < 0.3) {
    //random wall generator
    this.wall = true;
  }

  this.addNeighbors = function (grid) {
    // to add neighbors to a spot at any particular grid value
    var i = this.i;
    var j = this.j;
    if (i < cols - 1) {
      this.neighbors.push(grid[i + 1][j]);
    }
    if (i > 0) {
      this.neighbors.push(grid[i - 1][j]);
    }
    if (j < rows - 1) {
      this.neighbors.push(grid[i][j + 1]);
    }
    if (j > 0) {
      this.neighbors.push(grid[i][j - 1]);
    }
    //adding diagonal neighbors
    if (i > 0 && j > 0) {
      this.neighbors.push(grid[i - 1][j - 1]);
    }
    if (i < cols - 1 && j > 0) {
      this.neighbors.push(grid[i + 1][j - 1]);
    }
    if (i > 0 && j < rows - 1) {
      this.neighbors.push(grid[i - 1][j + 1]);
    }
    if (i < cols - 1 && j < rows - 1) {
      this.neighbors.push(grid[i + 1][j + 1]);
    }
  };

  this.show = function (col) {
    // fill(col);
    if (this.wall) { //obstacle or wall
      fill(0);
      
    noStroke();
    ellipse(this.i * w + w / 2, this.j * h + h / 2, w / 2, h / 2);
    }
    // rect(this.i * w, this.j * h, w - 1, h - 1);
  };
}

// To build the grid on the screen
function setup() {
  createCanvas(400, 400);
  console.log("A*");
  w = width / cols;
  h = height / rows;

  // Making a two D array
  for (var i = 0; i < cols; i++) {
    grid[i] = new Array(rows);
  }

  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j] = new Spot(i, j); //each node in the grid
    }
  }

  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j].addNeighbors(grid); //add neighbors to the created nodes
    }
  }

  start = grid[0][0]; //top left node
  end = grid[cols - 1][rows - 1]; // bottom right node
  start.wall = false; //start node cant be a wall
  end.wall = false; //end node cant be a wall

  openSet.push(start);
  console.log(grid);
}

// To run the loop -->  A* algo
function draw() {
  //Running through the unvisited nodes
  if (openSet.length > 0) {
    var winner = 0;
    for (var i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[winner].f) {
        winner = i;
      }
    }
    var current = openSet[winner];

    if (current === end) {
      //Find the path
      noLoop();
      console.log("DONE");
    }

    removeFromArray(openSet, current); // remove current from openSet once its the smallest
    closedSet.push(current); // add it in closedSet

    var neighbors = current.neighbors;
    for (var i = 0; i < neighbors.length; i++) {
      // evaluating the neighbors
      var neighbor = neighbors[i];

      if (!closedSet.includes(neighbor) && !neighbor.wall) {
        //checking to see if the node exists in the closedSet
        var tempG = current.g + 1; //tentative gScore

        var newPath = false;
        if (openSet.includes(neighbor)) {
          if (tempG < neighbor.g) {
            neighbor.g = tempG;
            newPath = true;
          }
        } else {
          // not in the openSet
          neighbor.g = tempG;
          newPath = true;
          openSet.push(neighbor);
        }

        if (newPath) {
          neighbor.h = heuristic(neighbor, end);
          neighbor.f = neighbor.g + neighbor.h; // f(n) = g(n) + h(n)
          neighbor.previous = current;
        }
      }
    }
  } else {
    console.log("No Solution!");
    noLoop();
    return;
    //fill this up
  }

  background(255);

  // Draw spots on the grid -> debugging help
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j].show(color(255));
    }
  }

  //Adding colors to the visited and unvisited nodes
  for (var i = 0; i < closedSet.length; i++) {
    closedSet[i].show(color(0, 255, 0));
  }
  for (var i = 0; i < openSet.length; i++) {
    openSet[i].show(color(255, 0, 0));
  }
  path = [];
  var temp = current;
  path.push(temp);
  while (temp.previous) {
    // Backtracking
    path.push(temp.previous);
    temp = temp.previous;
  }

  for (var i = 0; i < path.length; i++) {
    //visualize the path
    //path[i].show(color(0, 0, 255));
  }
  //Changing visualization of the path
  noFill();
  stroke(10, 10, 242);
  strokeWeight(w/1.5);
  beginShape();
  for (var i = 0; i < path.length; i++) {
    vertex(path[i].i * w + w / 2, path[i].j * h + h / 2);
  }
  endShape();
}
