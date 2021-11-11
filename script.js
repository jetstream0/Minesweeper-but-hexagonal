class Map {
  constructor(size, name, tile_size, z, parent_id=undefined) {
    let canvas = document.createElement("CANVAS")
    canvas.id = name+"-canvas";
    canvas.width = size[0];
    canvas.height = size[1];
    canvas.style.zIndex = z;
    canvas.classList.add("canvas")
    if (parent_id) {
      document.getElementById(parent_id).appendChild(canvas);
    } else {
      document.body.appendChild(canvas);
    }
    this.id = name+"-canvas";
    this.size = size;
    //this.tile_size is half the length/width of hexagon
    this.tile_size = tile_size;
    this.canvas = document.getElementById(name+"-canvas");
    this.context = canvas.getContext("2d");
  }
  addClickHandler(handler) {
    document.addEventListener("click", handler)
  }
  removeClickHander(handler) {
    document.removeEventListener("click", handler)
  }
  clear() {
    this.context.clearRect(0, 0,  this.context.canvas.width,  this.context.canvas.height);
  }
  create_map(tiles) {
    function draw_hexagon(canvas, x, y, color, text) {
      const angle = 2 * Math.PI / 6;
      let unrev = new Path2D();
      for (let j=0; j < 6; j++) {
        unrev.lineTo(x+canvas.tile_size*Math.cos(angle*j), y+canvas.tile_size*Math.sin(angle*j));
      }
      unrev.closePath();
      canvas.context.fillStyle = "dimgray";
      canvas.context.fill(unrev);
      return unrev
    }
    let shapes = {};
    let y = this.tile_size;
    let x = this.tile_size;
    for (let rows=0; rows < tiles.length; rows++) {
      x = this.tile_size;
      y = this.tile_size+rows*2*this.tile_size
      for (let column=0; column < tiles[0].length; column++) {
        x += this.tile_size*2;
        //number is even
        if (column%2 == 0) {
          y = this.tile_size+rows*2*this.tile_size
        } else {
          y = this.tile_size+rows*2*this.tile_size-this.tile_size
        }
        let color;
        if (tiles[rows][column] == "mine") {
          color = 'grey';
        } else {
          color = "green";
        }
        let hexagon = draw_hexagon(this, x, y, color, tiles[rows][column]);
        shapes[String(column)+","+String(rows)] = [hexagon, tiles[rows][column]];
      }
    }
    return shapes
  }
  draw_revealed_hexagon(x, y, color, text) {
    //(x,y) is center
    const angle = 2 * Math.PI / 6;
    this.context.beginPath();
    for (let j=0; j < 6; j++) {
      this.context.lineTo(x+this.tile_size*Math.cos(angle*j), y+this.tile_size*Math.sin(angle*j));
    }
    this.context.closePath();
    this.context.fillStyle = color;
    this.context.fill();
    this.context.fillStyle = "black";
    this.context.fillText(text, x, y, this.tile_size*2);
  }
  static two_points_distance(p1, p2) {
    let dif_x = Math.abs(p1[0]-p2[0])
    let dif_y = Math.abs(p1[1]-p2[1])
    if (p1[0] == p2[0]) {
      return dif_y
    } else if (p1[1] == p2[1]) {
      return dif_x
    } else {
      return Math.round(Math.sqrt(dif_x**2+dif_y**2))
    }
  }
  point_in_shape(p, shape) {
    return this.context.isPointInPath(shape, p[0], p[1]);
  }
}

//make the little number things in minesweeper
function numberify(tiles) {
  let new_tiles = [];
  for (y=0; y < tiles.length; y++) {
    let row = [];
    for (x=0; x < tiles[0].length; x++) {
      let touching = 0;
      if (tiles[y][x] == "mine") {
        touching = "mine";
      } else if (x%2 != 0) {
        if (y-1 >= 0) {
          if (x-1 >= 0) {
            if (tiles[y-1][x-1] == "mine") {
              touching += 1;
            }
          }
          if (tiles[y-1][x] == "mine") {
            touching += 1;
          }
          if (x+1 < tiles[0].length) {
            if (tiles[y-1][x+1] == "mine") {
              touching += 1;
            }
          }
        }
        if (x-1 >= 0) {
          if (tiles[y][x-1] == "mine") {
            touching += 1;
          }
        }
        if (x+1 < tiles[0].length) {
          if (tiles[y][x+1] == "mine") {
            touching += 1;
          }
        }
        if (y+1 < tiles.length) {
          if (tiles[y+1][x] == "mine") {
            touching += 1;
          }
        }
      } else {
        if (y-1 >= 0) {
          if (tiles[y-1][x] == "mine") {
            touching += 1;
          }
        }
        if (x-1 > 0) {
          if (tiles[y][x-1] == "mine") {
            touching += 1;
          }
        }
        if (x+1 < tiles[0].length) {
          if (tiles[y][x+1] == "mine") {
            touching += 1;
          }
        }
        if (y+1 < tiles.length) {
          if (x-1 > 0) {
            if (tiles[y+1][x-1] == "mine") {
              touching += 1;
            }
          }
          if (tiles[y+1][x] == "mine") {
            touching += 1;
          }
          if (x+1 < tiles[0].length) {
            if (tiles[y+1][x+1] == "mine") {
              touching += 1;
            }
          }
        }
      }
      row.push(String(touching));
    }
    new_tiles.push(row);
  }
  return new_tiles
}

function random_map(size) {
  let tiles = [];
  for (y=0; y < size[1]; y++) {
    let row = [];
    for (x=0; x < size[0]; x++) {
      if (Math.random() < 0.18) {
        row.push("mine");
      } else {
        row.push("safe")
      }
    }
    tiles.push(row);
  }
  let tiles_status = [];
  for (y=0; y < size[1]; y++) {
    let row = [];
    for (x=0; x < size[0]; x++) {
      row.push("unrev")
    }
    tiles_status.push(row);
  }
  return [tiles, tiles_status]
}

let size = [15,15];

let map_canvas = new Map([660,660], "map", 20, 0);
let map = random_map(size);
let tiles = map[0];
let status = map[1];
tiles = numberify(tiles);
let shapes = map_canvas.create_map(tiles);
let previous_shape;

function reveal(coords, tiles, s) {
  function array_in_array(parent, search) {
    for (j=0; j < parent.length; j++) {
      if (parent[j][0] == search[0] && parent[j][1] == search[1]) {
        return true
      }
    }
    return false
  }
  let click = s[coords[1]+","+coords[0]]
  if (click[2] == "revealed") {
    return false;
  }
  //get every tile around it, and reveal. if tile is 0, repeat process
  //use queue system
  let processed = [];
  let queue = [];
  queue.push(coords)
  while (true) {
  //for (d=0; d < 10; d++) {
    coords = queue[0];
    //get tiles around
    if (coords[0]%2 != 0) {
      if (coords[1]-1 >= 0) {
          if (coords[0]-1 >= 0) {
            if (tiles[coords[1]-1][coords[0]-1] != "mine") {
              let current_coords = [coords[0]-1, coords[1]-1];
              let center = calculateCenter(current_coords[0], current_coords[1]);
              map_canvas.draw_revealed_hexagon(center[0], center[1], "green", tiles[current_coords[1]][current_coords[0]]);
              status[current_coords[1]][current_coords[0]] = "rev";
              if (array_in_array(processed, current_coords) || array_in_array(queue, current_coords)) {
              } else if (tiles[current_coords[1]][current_coords[0]] == "0") {
                queue.push(current_coords);
              }
            }
          }
          if (tiles[coords[1]-1][coords[0]] != "mine") {
            let current_coords = [coords[0], coords[1]-1];
            let center = calculateCenter(current_coords[0], current_coords[1]);
            map_canvas.draw_revealed_hexagon(center[0], center[1], "green", tiles[current_coords[1]][current_coords[0]]);
            status[current_coords[1]][current_coords[0]] = "rev";
            if (array_in_array(processed, current_coords) || array_in_array(queue, current_coords)) {
            } else if (tiles[current_coords[1]][current_coords[0]] == "0") {
              queue.push(current_coords);
            }
          }
          if (coords[0]+1 < tiles[0].length) {
            if (tiles[coords[1]-1][coords[0]+1] != "mine") {
              let current_coords = [coords[0]+1, coords[1]-1];
              let center = calculateCenter(current_coords[0], current_coords[1]);
              map_canvas.draw_revealed_hexagon(center[0], center[1], "green", tiles[current_coords[1]][current_coords[0]]);
              status[current_coords[1]][current_coords[0]] = "rev";
              if (array_in_array(processed, current_coords) || array_in_array(queue, current_coords)) {
              } else if (tiles[current_coords[1]][current_coords[0]] == "0") {
                queue.push(current_coords);
              }
            }
          }
      }
      if (coords[0]-1 >= 0) {
        if (tiles[coords[1]][coords[0]-1] != "mine") {
          let current_coords = [coords[0]-1, coords[1]];
          let center = calculateCenter(current_coords[0], current_coords[1]);
          map_canvas.draw_revealed_hexagon(center[0], center[1], "green", tiles[current_coords[1]][current_coords[0]]);
          status[current_coords[1]][current_coords[0]] = "rev";
          if (array_in_array(processed, current_coords) || array_in_array(queue, current_coords)) {
          } else if (tiles[current_coords[1]][current_coords[0]] == "0") {
            queue.push(current_coords);
          }
        }
      }
      if (coords[0]+1 < tiles[0].length) {
        if (tiles[coords[1]][coords[0]+1] != "mine") {
          let current_coords = [coords[0]+1, coords[1]];
          let center = calculateCenter(current_coords[0], current_coords[1]);
          map_canvas.draw_revealed_hexagon(center[0], center[1], "green", tiles[current_coords[1]][current_coords[0]]);
          status[current_coords[1]][current_coords[0]] = "rev";
          if (array_in_array(processed, current_coords) || array_in_array(queue, current_coords)) {
          } else if (tiles[current_coords[1]][current_coords[0]] == "0") {
            queue.push(current_coords);
          }
        }
      }
      if (coords[1]+1 < tiles.length) {
        if (tiles[coords[1]+1][coords[0]] != "mine") {
          let current_coords = [coords[0], coords[1]+1];
          let center = calculateCenter(current_coords[0], current_coords[1]);
          map_canvas.draw_revealed_hexagon(center[0], center[1], "green", tiles[current_coords[1]][current_coords[0]]);
          status[current_coords[1]][current_coords[0]] = "rev";
          if (array_in_array(processed, current_coords) || array_in_array(queue, current_coords)) {
          } else if (tiles[current_coords[1]][current_coords[0]] == "0") {
            queue.push(current_coords);
          }
        }
      }
    } else {
      if (coords[1]-1 >= 0) {
        if (tiles[coords[1]-1][coords[0]] != "mine") {
          let current_coords = [coords[0], coords[1]-1];
          let center = calculateCenter(current_coords[0], current_coords[1]);
          map_canvas.draw_revealed_hexagon(center[0], center[1], "green", tiles[current_coords[1]][current_coords[0]]);
          status[current_coords[1]][current_coords[0]] = "rev";
          if (array_in_array(processed, current_coords) || array_in_array(queue, current_coords)) {
          } else if (tiles[current_coords[1]][current_coords[0]] == "0") {
            queue.push(current_coords);
          }
        }
      }
      if (coords[0]-1 > 0) {
        if (tiles[coords[1]][coords[0]-1] != "mine") {
          let current_coords = [coords[0]-1, coords[1]];
          let center = calculateCenter(current_coords[0], current_coords[1]);
          map_canvas.draw_revealed_hexagon(center[0], center[1], "green", tiles[current_coords[1]][current_coords[0]]);
          status[current_coords[1]][current_coords[0]] = "rev";
          if (array_in_array(processed, current_coords) || array_in_array(queue, current_coords)) {
          } else if (tiles[current_coords[1]][current_coords[0]] == "0") {
            queue.push(current_coords);
          }
        }
      }
      if (coords[0]+1 < tiles[0].length) {
        if (tiles[coords[1]][coords[0]+1] != "mine") {
          let current_coords = [coords[0]+1, coords[1]];
          let center = calculateCenter(current_coords[0], current_coords[1]);
          map_canvas.draw_revealed_hexagon(center[0], center[1], "green", tiles[current_coords[1]][current_coords[0]]);
          status[current_coords[1]][current_coords[0]] = "rev";
          if (array_in_array(processed, current_coords) || array_in_array(queue, current_coords)) {
          } else if (tiles[current_coords[1]][current_coords[0]] == "0") {
            queue.push(current_coords);
          }
        }
      }
      if (coords[1]+1 < tiles.length) {
          if (coords[0]-1 > 0) {
            if (tiles[coords[1]+1][coords[0]-1] != "mine") {
              let current_coords = [coords[0]-1, coords[1]+1];
              let center = calculateCenter(current_coords[0], current_coords[1]);
              map_canvas.draw_revealed_hexagon(center[0], center[1], "green", tiles[current_coords[1]][current_coords[0]]);
              status[current_coords[1]][current_coords[0]] = "rev";
              if (array_in_array(processed, current_coords) || array_in_array(queue, current_coords)) {
              } else if (tiles[current_coords[1]][current_coords[0]] == "0") {
                queue.push(current_coords);
              }
            }
          }
          if (tiles[coords[1]+1][coords[0]] != "mine") {
            let current_coords = [coords[0], coords[1]+1];
            let center = calculateCenter(current_coords[0], current_coords[1]);
            map_canvas.draw_revealed_hexagon(center[0], center[1], "green", tiles[current_coords[1]][current_coords[0]]);
            status[current_coords[1]][current_coords[0]] = "rev";
            if (array_in_array(processed, current_coords) || array_in_array(queue, current_coords)) {
            } else if (tiles[current_coords[1]][current_coords[0]] == "0") {
              queue.push(current_coords);
            }
          }
          if (coords[0]+1 < tiles[0].length) {
            if (tiles[coords[1]+1][coords[0]+1] != "mine") {
              let current_coords = [coords[0]+1, coords[1]+1];
              let center = calculateCenter(current_coords[0], current_coords[1]);
              map_canvas.draw_revealed_hexagon(center[0], center[1], "green", tiles[current_coords[1]][current_coords[0]]);
              status[current_coords[1]][current_coords[0]] = "rev";
              if (array_in_array(processed, current_coords) || array_in_array(queue, current_coords)) {
              } else if (tiles[current_coords[1]][current_coords[0]] == "0") {
                queue.push(current_coords);
              }
            }
          }
      }
    }
    queue.shift();
    processed.push(coords);
    if (queue.length == 0) {
      break;
    }
  }
}

function calculateCenter(x_column, y_row) {
  let y = map_canvas.tile_size;
  let x = map_canvas.tile_size;
  for (let rows=0; rows < tiles.length; rows++) {
    x = map_canvas.tile_size;
    y = map_canvas.tile_size+rows*2*map_canvas.tile_size
    for (let column=0; column < tiles[0].length; column++) {
      x += map_canvas.tile_size*2;
      //number is even
      if (column%2 == 0) {
        y = map_canvas.tile_size+rows*2*map_canvas.tile_size
      } else {
        y = map_canvas.tile_size+rows*2*map_canvas.tile_size-map_canvas.tile_size
      }
      if (x_column == column && y_row == rows) {
        return [x,y]
      }
    }
  }
}

function checkForWin(shapes, size) {
  for (y=0; y < size[1]; y++) {
    for (x=0; x < size[0]; x++) {
      if (status[y][x] == "unrev" && shapes[String(x)+","+String(y)][1] != "mine") {
        return false
      }
    }
  }
  return true
}

function firstClick(event) {
  //while (true) {
  for (j=0; j < 10; j++) {
    console.log('a', shapes)
    for (i=0; i < Object.keys(shapes).length; i++) {
      if (map_canvas.point_in_shape([event.clientX, event.clientY], shapes[Object.keys(shapes)[i]][0])) {
        if (shapes[Object.keys(shapes)[i]][1] == "0") {
          clickHandler(event);
          map_canvas.removeClickHander(firstClick);
          map_canvas.addClickHandler(clickHandler);
          return
        } else {
          regen()
          break
        }
      }
    }
  }
}

function clickHandler(event) {
  for (i=0; i < Object.keys(shapes).length; i++) {
    if (map_canvas.point_in_shape([event.clientX, event.clientY], shapes[Object.keys(shapes)[i]][0])) {
      //0 tile path, 1 number/mine
      let coords = [Number(Object.keys(shapes)[i].split(",")[0]), Number(Object.keys(shapes)[i].split(",")[1])];
      let center = calculateCenter(coords[0], coords[1]);
      let color;
      if (shapes[Object.keys(shapes)[i]][1] == "mine") {
        color = "gray"
      } else {
        color = "green"
      }
      map_canvas.draw_revealed_hexagon(center[0], center[1], color, shapes[Object.keys(shapes)[i]][1]);
      status[coords[1]][coords[0]] = "rev";
      if (shapes[Object.keys(shapes)[i]][1] == "mine") {
        alert("You lost");
      } else if (shapes[Object.keys(shapes)[i]][1] == "0") {
        reveal(coords, tiles, shapes);
      }
      if (checkForWin(shapes, size)) {
        alert("You won")
      }
      return
    }
  }
}

map_canvas.addClickHandler(firstClick)

function regen() {
  previous_shape = shapes;
  map_canvas.clear();
  map = random_map(size);
  tiles = map[0];
  status = map[1];
  tiles = numberify(tiles);
  shapes = map_canvas.create_map(tiles);
}