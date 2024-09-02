const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const SW = canvas.width;
const SH = canvas.height;
const TILE_COUNT = 32;
const TILE_W = SW / TILE_COUNT;
const bgColor = "green";
const road = "brown";
const FPS = 60;

class Vector {
  constructor(x, y) {
    this.x = x, this.y = y;
  }
}
const startPos = new Vector(1, 1);
const path = [
  new Vector(0, 10),
  new Vector(10, 0),
  new Vector(0, 10),
  new Vector(10, 0),
  new Vector(0, 10),
  new Vector(11, 0),

];
const quad = [[0, 0], [-TILE_W, -TILE_W], [-TILE_W, 0], [0, -TILE_W]];
let pathCoord = [...Array(32)].map(e => Array(32));

function fillPath(x, y) {
  context.fillStyle = road;
  let cx = x, cy = y;
  for (let q of quad) {
    cx = x + q[0];
    cy = y + q[1];
    if (cx < 0 || cx > SW) continue;
    if (cy < 0 || cy > SH) continue;
    if(pathCoord[cy/TILE_W][cx/TILE_W] == 1) continue;
    context.fillRect(cx, cy, TILE_W, TILE_W);
    pathCoord[cy/TILE_W][cx/TILE_W] = 1;
  }
}

function renderPath() {
  let pos = new Vector(startPos.x, startPos.y);
  pathCoord = [...Array(32)].map(e => Array(32));
  for (let direction of path) {
    //moving on x axis
    if (direction.y == 0) {
      for (let i = 0; i < direction.x; i++) {
        fillPath(TILE_W * (pos.x + i), TILE_W * pos.y);
      }
    } else {
      for (let i = 0; i < direction.y; i++) {
        fillPath(TILE_W * pos.x, TILE_W * (pos.y + i));
      }
    }
    pos.x += direction.x;
    pos.y += direction.y;
  }
}

class Solder{
  constructor(context, x, y, speed, health){
    this.context = context;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.accumulatedPath = new Vector(startPos.x, startPos.y);
    this.currentVector = 0;
    this.health = health;
  }
  updatePosition = () =>{
    if(this.x >= SW || this.y >= SH) return;
    if(path[this.currentVector].x == 0){
      this.y += this.speed;
    } else {
      this.x += this.speed;
    }
    if(this.x >= (this.accumulatedPath.x + path[this.currentVector].x) * TILE_W
      && this.y >= (this.accumulatedPath.y + path[this.currentVector].y) * TILE_W){
        this.accumulatedPath.x += path[this.currentVector].x;
        this.accumulatedPath.y += path[this.currentVector].y;
        this.currentVector++;
      }

  }
  render = ()=>{
    this.updatePosition();
    this.context.fillStyle = 'blue';
    this.context.beginPath();
    this.context.arc(this.x, this.y, TILE_W * 0.8, 0, 2 * Math.PI);
    this.context.fill();
  }
}

let solders = [
  new Solder(context, TILE_W * startPos.x, TILE_W * startPos.y, 1, 100),
  new Solder(context, TILE_W * startPos.x, TILE_W * startPos.y, 2, 200),
];

function renderSolders(){
  solders = solders.filter(solder => solder.health > 0);
  for(let solder of solders){
    if(solder.health > 0) solder.render();
  }
}

class Tower{
  //x and y are top left corner co-ordinates
  //rate is every rateth frame it will do damage on one closest solder
  constructor(context, x, y, rate, damage){
    this.context = context;
    this.x = this.find(x);
    this.y = this.find(y);
    console.log("found", this.x, this.y);
  }
  find = (value) => {
    return Math.ceil( value / TILE_W/2 ) * (TILE_W*2) - TILE_W * 2;
  }
  render = ()=>{
    this.context.fillStyle = 'orange';
    this.context.beginPath();
    this.context.arc(this.x + TILE_W, this.y + TILE_W , TILE_W * 0.8, 0, 2 * Math.PI);
    this.context.fill();
  }
}
const towers = [];

function renderTowers(){
  for(let tower of towers){
    tower.render();
  }
}

function addTower(x, y){
  console.log(pathCoord);
  const tower = new Tower(context, x, y, 10, 5)
  if(validCellForTower(tower))
    towers.push(tower);
}

function validCellForTower(tower){
  return pathCoord[tower.y/TILE_W][tower.x / TILE_W] != 1;
}

function updateState() {
  
}

function renderGrid() {
  for (let i = 0; i < TILE_COUNT; i+=2) {
    drawLine(context, i * TILE_W, 0, i * TILE_W, SH);
  }
  for (let i = 0; i < TILE_COUNT; i+=2) {
    drawLine(context, 0, i * TILE_W, SW, i * TILE_W);
  }
}
function drawLine(context, x1, y1, x2, y2) {
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
}

function render() {
  context.fillStyle = bgColor;
  context.clearRect(0, 0, SW, SH);
  context.fillRect(0, 0, SW, SH);
  renderGrid();
  renderPath();
  renderSolders();
  renderTowers();
}

function play() {
  updateState();
  render();
}

setInterval(() => play(), 1000 / FPS);
//play();

canvas.addEventListener("click", (event)=>{
  console.log(event.pageX, event.pageY);
  addTower(event.pageX, event.pageY);
});