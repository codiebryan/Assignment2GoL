
var AM = new AssetManager();
var width = 20;
var height = 20;
var gameEngine = new GameEngine();
var socket = io("http://24.16.255.56:8888");

function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

function speedup() {
    gameEngine.speedqt -= .2;
}
function speeddown() {
    gameEngine.speedqt += .2;
}


function save() {
    console.log("save");

    socket.emit('save', {data: {studentname: "Codie Bryan", statename: "test"}, generation:gameEngine.generation, livecells:gameEngine.livecells, theGrid:gameEngine.grid});

}
function load() {
    socket.emit('load', {data: '{studentname: Codie Bryan, statename: test}'});
    socket.on('load', function(socket) {
        console.log("loaded");
        console.log(socket.generation);
        console.log(socket.livecells);
        console.log(socket.data);
        gameEngine.generation = socket.generation;
        gameEngine.livecells = socket.livecells;
        gameEngine.grid = socket.theGrid;
        console.log(socket.theGrid);
    });
    
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }

///// play animation in reverse /////
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

// inheritance 
function Pixel(game, spritesheet, x, y, color, i, j,alive) {
	this.alive = alive;
    this.x = x;
    this.y = y;
    this.i = i;
    this.j = j;
    this.width = 1;
    this.height = 1;
    this.game = game;
    this.ticks = Math.floor((Math.random() * 500) + 500);
    this.count = 0;
    this.spritesheet = spritesheet;
    this.color = color;
    //console.log(color);
    this.animation = new Animation(spritesheet, 20, 0, 5, 5, 1, 5, true, false);
   
    this.ctx = game.ctx;
    this.xv = 0;
    this.yv = 0;
    Entity.call(this, game, x, y);
}

Pixel.prototype = new Entity();
Pixel.prototype.constructor = Pixel;

Pixel.prototype.update = function () {
    Entity.prototype.update.call(this);
}

Pixel.prototype.draw = function () {
    if (this.alive == 1) {
    	this.animation = new Animation(AM.getAsset("./img/white.png"), 20, 0, 10, 10, 1, 5, true, false);
    } else {
    	this.animation = new Animation(AM.getAsset("./img/blue.png"), 0, 0, 10, 10, 1, 1, true, false);
    }
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 100);
    //drawRectangles(this.ctx);
    Entity.prototype.draw.call(this);
}
function drawRectangles(ctx) {
    //for each input n, draw a rectangle which scales with n
    for (var i = 1; i <= n; i++) {
        ctx.beginPath();
        ctx.rect(i * (width/n) - (width/n), (height/n) + height-((height/n) * i) - (height*.025),(width/n), (height/n) + ((height/n) * i));
        ctx.fillText(i, (width/n) * i - (width/n/2), (height/n) + height-((height/n) * i) - (height*.025));
        ctx.stroke();
        
    }
}
AM.queueDownload("./img/white.png");
AM.queueDownload("./img/blue.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    gameEngine.init(ctx);
    gameEngine.start();
    for (var i = 0; i < gameEngine.grid.length; i++) {
    	for (var j = 0; j < gameEngine.grid[i].length; j++) {
    		if (gameEngine.grid[i][j] === 0)
    			gameEngine.addEntity(new Pixel(gameEngine, AM.getAsset("./img/blue.png"), j*10, i*10, "black", i, j,0));
    		else
    			gameEngine.addEntity(new Pixel(gameEngine, AM.getAsset("./img/white.png"), j*10, i*10, "blue", i, j,1));	
    	}
    }
    console.log("All Done!");
});