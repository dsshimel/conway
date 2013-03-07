int WIDTH = 235;			// grid width in number of cells
int HEIGHT = 115;			// grid height in number of cells
int GRID_SIZE = 8;			// cell size in pixels
int WRAP_HORIZ = true;		// grid is endless along the horizontal axis
int WRAP_VERT = true;		// grid is endless along the vertical axis
int DENSITY = 0.30;			// percentage of cells to populate in initial grid
int ALIVE_COLOR_BW = 0; 	// color of living cells in grayscale
int DEAD_COLOR_BW = 191;	// color of dead cells in grayscale
int STROKE_COLOR_BW = 0;	// color of cell outline in grayscale
int FRAMERATE = 60;			// frames per second at which game runs

int HUE_OFFSET;;	// amount to translate hue to get shifting color effect
int RATE;			// how fast the HUE_OFFSET changes
int DIRECTION = 1;	// which way the HUE_OFFSET changes

boolean[][] GRID;	// the game board
int GENERATIONS;	// the number of generations run so far
			
void setup() { // setup processing canvas
	size(WIDTH * GRID_SIZE, HEIGHT * GRID_SIZE);
	stroke(STROKE_COLOR_BW);
	colorMode(HSB);
	frameRate(FRAMERATE);
	
	HUE_OFFSET = Math.floor(Math.random() * 256);
	RATE = 2 + Math.floor(6 * Math.random());
	
	initializeGrid();
}

void draw() { // controls behavior of each frame in animation
	//background(DEAD_COLOR_BW); // maybe do transparent alpha?
	drawGrid();
	generate();
	adjustHue();
	
	if(GENERATIONS > (FRAMERATE * 300)) setup(); // reset game after 5 minutes
}

// click the canvas to restart the game
void mousePressed() {
	setup();
}

function initializeGrid() {
	GRID = constructNewGrid();
	populateGrid();
	GENERATIONS = 1;
}

// make an empty WIDTH x HEIGHT matrix
function constructNewGrid() {
	var result = new Array(WIDTH);
	
	for(var i = 0; i < WIDTH; i++) {
		result[i] = new Array(HEIGHT);
	}
	
	return result;
}

// randomly mark each cell as alive or dead
function populateGrid() {
	for(var i = 0; i < WIDTH; i++) {
		for(var j = 0; j < HEIGHT; j++) {
			GRID[i][j] = Math.random() < DENSITY;
		}
	}
}

// render the current game state
function drawGrid() {
	iterateGrid(function(i, j, isAlive) {
		if(isAlive) {
			// calculate circle midpoint
			var x = GRID_SIZE * (i + 0.5);
			var y = GRID_SIZE * (j + 0.5);
		
			setFillByLocation(i, j);
			ellipse(x, y, GRID_SIZE, GRID_SIZE);
		}
		// let the background "fill in" the dead cells
	});
}

// choose cell color based on its coordinates
function setFillByLocation(i, j) {
	hue = Math.floor(i * (256 / WIDTH)) + HUE_OFFSET;
	if(255 < hue || 0 > hue) {
		hue = (hue + 256) % 256;
	}
	
	brightness = 256 - Math.floor(j * (256 / HEIGHT));
			
	fill(hue, 255, brightness);
}

// create the GRID for the next generation based on the current GRID
function generate() {
	var nextGeneration = constructNewGrid();
	
	iterateGrid(function(i, j, isAlive) {
		nextGeneration[i][j] = cellWillBeAlive(i, j, isAlive);
	});
		
	GRID = nextGeneration;
	addRandomPointsToGrid(5);
	
	GENERATIONS++;
}

function addRandomPointsToGrid(n) {
	while(n-- > 0) addRandomPointToGrid();
}

function addRandomPointToGrid() {
	var i = Math.floor(Math.random() * WIDTH);
	var j = Math.floor(Math.random() * HEIGHT);
	GRID[i][j] = true;
}

// based on current game state, determine if cell (i, j) will be alive next generation
function cellWillBeAlive(i, j, isAlive) {
	var cellLives = false;
	
	var neighbors = countLivingNeighbors(i, j);
		
	if(3 == neighbors) {
		cellLives = true;
	}
	else if(isAlive && 2 == neighbors)
		cellLives = true;
		
	return cellLives;
}

// count the number of living cells that are adjacent to cell (i, j)
function countLivingNeighbors(i, j) {
	var neighborCount = 0;
	
	for(var x = i - 1; x <= i + 1; x++) {
		var tempX = x;
		
		if(x < 0 || x >= WIDTH) {
			if(WRAP_HORIZ) {
				x = (x + WIDTH) % WIDTH;
			}
			else continue;
		}
		
		for(var y = j - 1; y <= j + 1; y++) {
			var tempY = y;
			
			if(tempX == i && tempY == j) continue; // don't check the center square
		
			if(y < 0 || y >= HEIGHT) {
				if(WRAP_VERT) {
					y = (y + HEIGHT) % HEIGHT;
				}
				else continue;
			}
			
			if(GRID[x][y]) {
				neighborCount++;
			}
			
			y = tempY;
		}
		
		x = tempX;
	}
	
	return neighborCount;
}

// change HUE_OFFSET to achieve color shifting effect
function adjustHue() {
	HUE_OFFSET += RATE * DIRECTION;
	
	if(255 < HUE_OFFSET || 0 > HUE_OFFSET) {
		DIRECTION *= -1;
	}
}

// apply function 'func' to all elements of the game board
function iterateGrid(func) {
	for(var i = 0; i < WIDTH; i++) {
		for(var j = 0; j < HEIGHT; j++) {
			func(i, j, GRID[i][j]);
		}
	}
}

// not in use
function getRandomColor() {
	return Math.floor(Math.random() * 256);
}

function setFillRandom() {
	fill(getRandomColor(), getRandomColor(), getRandomColor());
}