'use strict';

//mineSweeper class
function Game(_mineNumber, _gridX, _gridY){    //x:left-right, y:up-down
    //constants
    const MINE = -1;
    const CLOSED = -2;
    const FLAG = -3;
    const WIN = 1;
    const PLAYING = 0;
    const LOSE = -1;

    //keys
    let grid = [];    //private
    this.mineNumber = (_mineNumber > 0) ? _mineNumber : 1;
    this.gridNumber = [_gridX, _gridY];
    this.interface = [];
    this.gameStatus = PLAYING;
    this.displayMode = "none";
    this.history = [];

    //display keys
    

    //error handling
    if (this.gridNumber[0] <= 0 || this.gridNumber[1] <= 0){
        this.mineNumber = 10;
        this.gridNumber = [10,10];
    }
    if (this.mineNumber > this.gridNumber[0]*this.gridNumber[1]){
        this.mineNumber = this.gridNumber[0]*this.gridNumber[1];
    }

    //grid getter
    this.grid = (password) => {
        return (password === 12345678) ? grid : undefined;
    }

    //interface conversion
    this.interface1D = () => {
        let oneD = [];
        for (let i = 0; i < this.interface.length; i++){
            for (let j = 0; j < this.interface[i].length; j++){
                oneD.push(this.interface[i][j]);
            }
        }
        return oneD;
    }
    this.interface2D = (oneD) => {
        for (let i = 0; i < this.interface.length; i++){
            for (let j = 0; j < this.interface[i].length; j++){
                this.interface[i][j] = oneD[i*this.interface.length + j];
            }
        }
    }
    
    //initialization => automatic
    this.initialize = () => {
        this.history = [];
        this.gameStatus = PLAYING;
        this.interface = [];
        for (let i = 0; i < this.gridNumber[0]; i++){
            grid[i] = [];
            this.interface[i] = [];
            for (let j = 0; j < this.gridNumber[1]; j++){
                grid[i][j] = 0;
                this.interface[i][j] = CLOSED;
            }
        }
        this.history.push([[-1,-1], JSON.parse(JSON.stringify(this.interface))]);
    }

    //set mine => automatic
    this.setMine = () => {
        let _x = this.gridNumber[0];
        let _y = this.gridNumber[1];
        let totalNumber = _x * _y;
        let mines = [];    //absolute index
        for (let n = 0; n < this.mineNumber; n++){
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random()*totalNumber);
            } while (mines.indexOf(randomIndex) != -1)
            mines.push(randomIndex);
        }
        for (let n = 0; n < mines.length; n++){
            let gridX = Math.floor(mines[n]/_y);
            let gridY = mines[n]%_y;
            grid[gridX][gridY] = MINE;
        }
        
        //set numbers beside mines
        let addIndex = [0-_y-1, 0-_y, 0-_y+1, -1, 0, 1, _y-1, _y, _y+1];
        for (let n = 0; n < mines.length; n++){
            for (let p = 0; p < addIndex.length; p++){
                /*
                */
                let nX = Math.floor(mines[n]/_y);
                let nY = mines[n]%_y;
                if (nX === 0){
                    if (p < 3){
                        continue;
                    }
                }
                if (nX === _x-1){
                    if (p > 5){
                        continue;
                    }
                }
                if (nY === 0){
                    if (p%3 === 0){
                        continue;
                    }
                }
                if (nY === _y-1){
                    if (p%3 === 2){
                        continue;
                    }
                }
                let pIndex = mines[n] + addIndex[p];
                if (pIndex < 0 || pIndex >= totalNumber){
                    continue;
                }
                let gridX = Math.floor(pIndex/_y);
                let gridY = pIndex%_y;
                if (grid[gridX][gridY] != MINE){
                    grid[gridX][gridY]++;
                }
            }
        }
        //console.log(grid);
    }

    //open adjacent boxes
    const open = (gridX, gridY) => {
        if (gridX >= this.gridNumber[0] || gridX < 0){
            return;
        }
        if (gridY >= this.gridNumber[1] || gridY < 0){
            return;
        }
        if (this.interface[gridX][gridY] === FLAG){
            return;
        }
        if (this.interface[gridX][gridY] != CLOSED){
            return;
        }
        this.interface[gridX][gridY] = grid[gridX][gridY];
        if (grid[gridX][gridY] === 0){
            open(gridX+1, gridY);
            open(gridX, gridY+1);
            open(gridX-1, gridY);
            open(gridX, gridY-1);
        } 
    }

    //when clicked
    this.click = (clickX, clickY) => {
        if (this.gameStatus === LOSE){
            return;
        }
        if (grid[clickX][clickY] === MINE){
            //lose
            this.interface[clickX][clickY] = MINE;
            this.gameStatus = LOSE;
        } else {
            //open 
            open(clickX, clickY);
        }
        this.refreshDisplay();
        if (this.checkWin()){
            this.gameStatus = WIN;
            this.displayWin();
        }
        if (this.gameStatus === LOSE){
            this.displayLose();
        }
        this.addToHistory([clickX,clickY]);
        return this.gameStatus;
    }
    const callClick = (clickX, clickY) => {
        this.click(clickX, clickY);
    }

    //right click
    const rightClick = (clickX, clickY, element) => {
        if (this.interface[clickX][clickY] === FLAG){
            this.interface[clickX][clickY] = CLOSED;
            element.style.backgroundColor = "rgb("+this.colors[2][0]+","+this.colors[2][1]+","+this.colors[2][2]+")";
            element.innerHTML = "";
        } else {
            this.interface[clickX][clickY] = FLAG;
            element.style.backgroundColor = "rgb("+this.colors[4][0]+","+this.colors[4][1]+","+this.colors[4][2]+")";
            element.innerHTML = "🚩";
        }
    }
    
    //check win => automatic
    this.checkWin = () => {
        for (let i = 0; i < this.gridNumber[0]; i++){
            for (let j = 0; j < this.gridNumber[1]; j++){
                if (this.interface[i][j] === CLOSED && grid[i][j] != MINE){
                    return false;
                }
            }
        }
        this.gameStatus = WIN;
        return true;
    }
    
    //display
    this.display = (_displayMode, _boxSize=50, _left=50, _right=50, _background=[255,255,255], _color1=[0,0,0], _color2=[100,100,100], _color3=[255,0,0], _color4=[0,255,0]) => {
        this.displayMode = _displayMode;
        if (this.displayMode != "processing"){
            return;
        }
        this.boxSize = _boxSize;
        this.left = _left;
        this.right = _right;
        this.colors = [_background, _color1, _color2, _color3, _color4];

        //display using processing.js
        let _x = this.gridNumber[0];
        let _y = this.gridNumber[1];
        stroke(...this.colors[1]);
        strokeWeight(Math.ceil(this.boxSize/20));
        fill(...this.colors[0]);
        this.gameElement = rect(this.left, this.right, this.boxSize*_x, this.boxSize*_y);

        this.boxElements = [];
        for (let i = 0; i < _x; i++){
            this.boxElements[i] = [];
            for (let j = 0; j < _y; j++){
                this.boxElements[i][j] = rect(this.left + i*this.boxSize, this.right + j*this.boxSize, this.boxSize, this.boxSize);
                this.boxElements[i][j].indexI = i;
                this.boxElements[i][j].indexJ = j;

                this.boxElements[i][j].addEventListener("click", function(){
                    callClick(this.indexI, this.indexJ);
                });
                this.boxElements[i][j].addEventListener("contextmenu", function(event){
                    event.preventDefault();
                    rightClick(this.indexI, this.indexJ, this);
                });
                //set style
                this.boxElements[i][j].style.textAlign = "center";
                this.boxElements[i][j].color = "rgb("+this.colors[1][0]+","+this.colors[1][1]+","+this.colors[1][2]+")";
                this.boxElements[i][j].style.fontSize = this.boxSize/2 + "px";
                this.boxElements[i][j].style.padding = "0px";
            }
        }
        this.refreshDisplay();
    }

    //refresh display => automatic
    this.refreshDisplay = () => {
        if (this.displayMode != "processing"){
            return;
        }
        let _x = this.gridNumber[0];
        let _y = this.gridNumber[1];
        for (let i = 0; i < _x; i++){
            for (let j = 0; j < _y; j++){
                let colorArr = [];
                let color = "";
                let text = "";
                if (this.interface[i][j] === MINE){
                    colorArr = this.colors[3];
                } else if (this.interface[i][j] === CLOSED){
                    colorArr = this.colors[2];
                } else if (this.interface[i][j] === FLAG){
                    colorArr = this.colors[4];
                    text = "🚩";
                } else if (this.interface[i][j] === 0){
                    colorArr = this.colors[0];
                } else {
                    colorArr = this.colors[0];
                    text = this.interface[i][j];
                }
                color = colorArr[0] + "," + colorArr[1] + "," + colorArr[2];
                this.boxElements[i][j].style.backgroundColor = "rgb("+color+")";
                this.boxElements[i][j].innerHTML = text;
            }
        }
    }

    //display lose => automatic
    this.displayLose = () => {
        console.log("You Lose!");
        if (this.displayMode != "processing"){
            return;
        }
        fill(...this.colors[0],0.5);
        let _x = this.gridNumber[0];
        let _y = this.gridNumber[1];
        let shield = rect(this.left, this.right, this.boxSize*_x, this.boxSize*_y);
        shield.style.textAlign = "center";
        shield.style.fontSize = "500%";
        this.interface = grid;
        this.refreshDisplay();
        shield.innerHTML = "YOU LOSE!";
    }

    //display win => automatic
    this.displayWin = () => {
        console.log("You Win!");
        if (this.displayMode != "processing"){
            return;
        }
        fill(...this.colors[0],0.5);
        let _x = this.gridNumber[0];
        let _y = this.gridNumber[1];
        let shield = rect(this.left, this.right, this.boxSize*_x, this.boxSize*_y);
        shield.style.textAlign = "center";
        shield.style.fontSize = "500%";
        shield.innerHTML = "YOU WIN!";
    }

    //add to history => automatic
    this.addToHistory = (click) => {
        this.history.push([click, JSON.parse(JSON.stringify(this.interface))]);
    }

    //print history
    this.printHistory = () => {
        for (let i = 0; i < this.history.length; i++){
            console.log(this.history[i][0], this.history[i][1]);
        }
    }

    //print manual
    this.getManual = () => {
        let manual = `
            ***minesweeper.js user manual***
            
            Game constructor(mineNumber, gridX, gridY)
            Game.run()
            Game.click(clickX, clickY)
            Game.display(displayMode, ...params)
            Game.interface
            Game.gameStatus
        `
        console.log(manual);
        return manual;
    }
    
    this.run = () => {
        this.initialize();
        this.setMine();
        console.log(`${this.mineNumber} mines set in grid[${this.gridNumber[0]}][${this.gridNumber[1]}]`);
        console.log(this.interface);
    }
    return this;
}

//main function
let mineSweeper;
function execute(){
    rect(0,0,600,600);
    mineSweeper = new Game(10,10,10);
    mineSweeper.run();
    mineSweeper.display("processing");
}
execute();