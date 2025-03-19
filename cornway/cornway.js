RANDOM_START = true;

class Cornway {
    constructor (boardSize = [50, 20], timestep = 1000, initializedPattern = [[0]], displayMode = "processingJs", parentElement = document.body, boxSize = 10, multiColor = true){
        this.boardSize = boardSize;
        this.timestep = timestep;
        if (!initializedPattern){
            this.board = this.newBoard();
        } else {
            this.board = this.newBoard();
            this.initializePattern(initializedPattern);
        }
        this.runInterval = 0;

        if (displayMode === "processingJs"){
            if (typeof rect === "function"){
                this.displayMode = displayMode;
                this.parentElement = parentElement;
                this.boxSize = boxSize;
                this.displayInit();
                this.multiColor = multiColor;
            } else {
                this.displayMode = null;
                this.parentElement = null;
                this.boxSize = 0;
                this.multiColor = false;
            }
        }
    }

    initializePattern (pattern){
        const offsetI = Math.floor(this.boardSize[0] / 2 - pattern.length / 2);
        if (offsetI < 0){
            return;
        }
        for (let i = 0; i < pattern.length; i++){
            const offsetJ = Math.floor(this.boardSize[1] / 2 - pattern[i].length / 2);
            if (offsetJ < 0){
                return;
            }
            for (let j = 0; j < pattern[i].length; j++){
                this.board[i + offsetI][j + offsetJ] = pattern[i][j];
            }
        }
        // console.log(JSON.stringify(this.board));
    }

    displayInit (){
        if (!this.displayMode || !this.parentElement){
            return;
        }
        this.physicalBoard = this.newBoard();
        noStroke();
        // fill(255, 255, 255);
        for (let i = 0; i < this.physicalBoard.length; i++){
            for (let j = 0; j < this.physicalBoard[i].length; j++){
                if (this.board[i][j] > 0){
                    fill(0, 0, 0);
                } else {
                    fill(255, 255, 255);
                }
                this.physicalBoard[i][j] = rect(i*this.boxSize, j*this.boxSize, this.boxSize, this.boxSize);
                this.parentElement.appendChild(this.physicalBoard[i][j]);
            }
        }
    }

    display (){
        if (!this.displayMode || !this.parentElement){
            return;
        }
        // console.log(JSON.stringify(this.board));
        for (let i = 0; i < this.physicalBoard.length; i++){
            for (let j = 0; j < this.physicalBoard[i].length; j++){
                if (this.multiColor){
                    if (this.board[i][j] === 1){
                        this.physicalBoard[i][j].setFill(0, 0, 0);
                    } else if (this.board[i][j] === 0.5){
                        this.physicalBoard[i][j].setFill(0, 50, 0);
                    } else if (this.board[i][j] === -0.5){
                        this.physicalBoard[i][j].setFill(255, 255, 200);
                    } else if (this.board[i][j] === -1){
                        this.physicalBoard[i][j].setFill(255, 220, 220);
                    } else {
                        this.physicalBoard[i][j].setFill(255, 255, 255);
                    }
                } else {
                    if (this.board[i][j] > 0){
                        this.physicalBoard[i][j].setFill(0, 0, 0);
                    } else {
                        this.physicalBoard[i][j].setFill(255, 255, 255);
                    }
                }
            }
        }
    }

    newBoard (){
        return Array.from({ length: this.boardSize[0] }, () => Array(this.boardSize[1]).fill(0));
    }

    calculateLife (){
        const prevBoard = this.board;
        this.board = this.newBoard();
        for (let i = 0; i < this.boardSize[0]; i++){
            for (let j = 0; j < this.boardSize[1]; j++){
                const adjacent = [
                    [-1, -1], [-1, 0], [-1, 1],
                    [0, -1], [0, 1],
                    [1, -1], [1, 0], [1, 1]
                ];
                let adjAlive = 0;
                for (let relCell of adjacent){
                    const adjCellI = relCell[0] + i;
                    const adjCellJ = relCell[1] + j;
                    // out of range cells
                    if (adjCellI < 0 || adjCellI >= this.boardSize[0] || adjCellJ < 0 || adjCellJ >= this.boardSize[1]){
                        continue;
                    }
                    if (prevBoard[adjCellI][adjCellJ] > 0){
                        adjAlive += 1;
                    }
                }
                if (prevBoard[i][j] > 0){
                    // last time alive
                    if (adjAlive < 2){
                        // underpopulation: light red
                        this.board[i][j] = -1;
                    } else if (adjAlive > 3){
                        // overpopulation: light yellow
                        this.board[i][j] = -0.5;
                    } else {
                        // lives: black
                        this.board[i][j] = 1;
                    }
                } else {
                    // last time dead
                    if (adjAlive == 3){
                        // reproduction: green
                        this.board[i][j] = 0.5;
                    } else {
                        this.board[i][j] = 0;
                    }
                }
            }
        }
    }

    run (){
        this.runInterval = setInterval(() => {
            this.calculateLife();
            this.display();
        }, this.timestep);
    }

    stop (){
        clearInterval(this.runInterval);
    }
}

const SPACESHIP = [
    [1, 0, 0],
    [0, 1, 1],
    [1, 1, 0]
];

const LWSS = [
    [0, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0]
];

const MWSS = [
    [0, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0]
];

const HWSS = [
    [0, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0]
];

const GOSPER_GLIDER_GUN = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  
    [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  
    [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]  
];

const PUFFER_TRAIN = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1]
];


/* Vanilla */
const controlDiv = gebi("controlDiv");

const startMapping = {
    "RandomStart": Array.from({ length: Math.floor(innerWidth / 10 / 5) }, () => Array(Math.floor(innerHeight / 10 / 5)).fill(Math.round(Math.random()))),
    "Spaceship": SPACESHIP,
    "LightweightSpaceship": LWSS,
    "MiddleweightSpaceship": MWSS,
    "HeavyweightSpaceship": HWSS,
    "GosperGliderGun": GOSPER_GLIDER_GUN,
    "PufferTrain": PUFFER_TRAIN
};

let cornway = null;
for (let key in startMapping){
    const button = crea("button", controlDiv);
    button.id = key;
    crea("br", controlDiv);
    crea("br", controlDiv);
    button.innerHTML = "Start with " + key;
    button.onclick = (e) => {
        cornway = new Cornway([Math.floor(innerWidth / 10), Math.floor(innerHeight / 10)], 100, startMapping[key]);
        cornway.run();
        controlDiv.parentElement.removeChild(controlDiv);
    }
}

if (RANDOM_START){
    gebi("RandomStart").click();
}
