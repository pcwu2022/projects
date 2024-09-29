'use strict';

function Game(_level = 1, _numbers = 9){
    //keys
    let numbers = _numbers;
    let grid = [];
    this.interface = [];
    this.history = [];
    this.level = (_level<5 && _level>=0) ? _level : 1;
    this.buttons = [];
    this.levelThreshold = 1;    //with or without hint
    this.gameStatus = false;

    //constants
    const OCCUPIED_L = -2;    //locally occupied
    const OCCUPIED_G = -1;    //globally occupied
    const OCCUPIED_T = -3;    //temporarily occupied
    const CLOSED = -1;

    //pick random available index in array
    const randomAvailable = (_array, _definition = 0) => {
        let newArray = [];
        for (let i = 0; i < _array.length; i++){
            if (_array[i] === _definition){
                newArray.push(i);
            }
        }
        return newArray[Math.floor(Math.random()*newArray.length)];
    }

    //deep copy
    const deepCopy = (_array) => JSON.parse(JSON.stringify(_array));
    
    //color to rgb
    const colorToRGB = (..._array) => "rgb("+_array[0]+","+_array[1]+","+_array[2]+")";
    
    //initialize
    this.initialize = () => {
        this.gameStatus = true;
        for (let i = 0; i < numbers; i++){
            grid[i] = [];
            this.interface[i] = [];
            for (let j = 0; j < numbers; j++){
                grid[i][j] = 0;
                this.interface[i][j] = 0;
            }
        }
    }

    //set numbers
    this.setNumbers = () => {
        for (let n = 1; n < numbers+1; n++){
            //loop from 1 to 9
            let occupiedArray = Array(numbers).fill(0);
            for (let i = 0; i < numbers; i++){
                let copiedArray = deepCopy(grid[i]); 
                //record occupied array
                for (let oa = 0; oa < numbers; oa++){
                    if (i*3%numbers === 0){
                        if (occupiedArray[oa] === OCCUPIED_L){
                            //erase local occupied data
                            occupiedArray[oa] = 0;
                        }
                    }
                    if (occupiedArray[oa] === OCCUPIED_L){
                        copiedArray[oa] = OCCUPIED_L;
                    } else if (occupiedArray[oa] === OCCUPIED_G){
                        copiedArray[oa] = OCCUPIED_G;
                    }
                }
                
                //find the most occupied unit => optimize
                let mostUnit = 0;
                let maxSum = 0;
                let currentSum = 0;
                for (let j = 0; j < numbers; j++){
                    if (j*3%numbers === 0){
                        currentSum = 0;
                    }
                    if (copiedArray[j] != 0){
                        currentSum++;
                    }
                    if (currentSum > maxSum){
                        maxSum = currentSum;
                        mostUnit = Math.floor(j*3/numbers);
                    } else if (currentSum === maxSum){
                        mostUnit = Math.floor(j*3/numbers);
                    }
                }

                for (let uj = mostUnit*numbers/3; uj < (mostUnit+1)*numbers/3; uj++){
                    copiedArray[uj] = OCCUPIED_T;
                }
                
                //randomly pick an index
                let indexJ = randomAvailable(copiedArray, 0);
                //check if indexJ is valid
                if (indexJ === undefined){
                    //restart n and n-1
                    for (let ri = 0; ri < numbers; ri++){
                        for (let rj = 0; rj < numbers; rj++){
                            if (grid[ri][rj] === n || grid[ri][rj] === n-1){
                                grid[ri][rj] = 0;
                            }
                        }
                    }
                    n -= 2;
                    break;
                }
                
                let unit = Math.floor(indexJ*3/numbers);
                grid[i][indexJ] = n;

                //set occupied
                occupiedArray[indexJ] = OCCUPIED_G;
                for (let oa = unit*numbers/3; oa < (unit+1)*numbers/3; oa++){
                    if (occupiedArray[oa] === 0){
                        occupiedArray[oa] = OCCUPIED_L;
                    }
                }
            }
        }
        //console.log(grid);
    }

    //set interface
    this.setInterface = () => {
        for (let i = 0; i < numbers; i++){
            for (let j = 0; j < numbers; j++){
                if (Math.random()*numbers >= (5-this.level)){
                    this.interface[i][j] = CLOSED;
                } else {
                    this.interface[i][j] = grid[i][j];
                }
                //temp
                rect(i*50+Math.floor(i*3/numbers)*3+50,j*50+Math.floor(j*3/numbers)*3+50, 50, 50).innerHTML = (this.interface[i][j]===CLOSED) ? "" : this.interface[i][j];
            }
        }
    }

    this.getIncorrectNumber = () => {
        let incorrectNumber = 0;
        for (let i = 0; i < numbers; i++){
            for (let j = 0; j < numbers; j++){
                if (grid[i][j] !== this.interface[i][j]){
                    incorrectNumber++;
                }
            }
        }
        return incorrectNumber;
    }
    const getAnswer = () => {
        if (this.displayMode !== "processing"){
            return;
        }
        this.gameStatus = false;
        noFill();
        noStroke();
        this.displayWin = rect(this.left + this.boxSize*3, this.top + this.boxSize*(numbers+1), this.boxSize*5, this.boxSize/2);
        this.displayWin.style.color = colorToRGB(...this.colors[3]);
        if (this.getIncorrectNumber() === 0){
            this.displayWin.innerHTML = "ALL CORRECT! YOU WIN!";
            return;
        } else {
            this.displayWin.innerHTML = "FOUND " + this.getIncorrectNumber() + " MISTAKES.";
        }
        for (let i = 0; i < numbers; i++){
            for (let j = 0; j < numbers; j++){
                if (this.interface[i][j] !== grid[i][j]){
                    this.boxElements[i][j].innerHTML = grid[i][j];
                    this.boxElements[i][j].style.color = colorToRGB(...this.colors[3]);
                }
            }
        }
    }

    //output private grid
    this.getGrid = (password) => {
        if (password === "12345678"){
            return grid;
        }
        return undefined
    }

    //click and set value
    this.clickSet = (clickX, clickY, value) => {
        this.interface[clickX][clickY] = value;
        if (this.displayMode !== "processing"){
            return;
        }
        let element = this.boxElements[clickX][clickY];
        element.style.backgroundColor = colorToRGB(...this.colors[0]);
        element.innerHTML = (value === CLOSED) ? "" : value;
    }
    const clickSet = (clickX, clickY, value) => {
        this.clickSet(clickX, clickY, value);
    }

    //display action buttons
    const displayButtons = (clickX, clickY) => {
        for (let i = 0; i < this.buttons.length; i++){
            this.append.removeChild(this.buttons[i]);
        }
        this.buttons = [];
        stroke(...this.colors[1]);
        fill(...this.colors[2]);
        for (let i = 0; i < numbers+1; i++){
            this.buttons.push(ellipse(this.left + this.boxSize*(numbers+1), this.top + this.boxSize*(i+0.5), this.boxSize*0.8, this.boxSize*0.8));
            this.buttons[i].append(this.append);
            this.buttons[i].innerHTML = (i === 0) ? "X" : i;
            this.buttons[i].style.textAlign = "center";
            this.buttons[i].style.fontSize = this.boxSize/2 + "px";
            this.buttons[i].index = (i === 0) ? CLOSED : i;
            this.buttons[i].indexI = clickX;
            this.buttons[i].indexJ = clickY;
            this.buttons[i].style.cursor = "pointer";
            this.buttons[i].addEventListener("click", function(){
                clickSet(this.indexI, this.indexJ, this.index);
            });

            //check if number is valid
            if (this.level < this.levelThreshold){
                for (let ci = 0; ci < numbers; ci++){
                    if (this.interface[ci][clickY] === i){
                        this.buttons[i].style.opacity = "0.5";
                    }
                }
                for (let cj = 0; cj < numbers; cj++){
                    if (this.interface[clickX][cj] === i){
                        this.buttons[i].style.opacity = "0.5";
                    }
                }
                let unitX = Math.floor(clickX*3/numbers);
                let unitY = Math.floor(clickY*3/numbers);
                for (let ui = unitX*numbers/3; ui < (unitX+1)*numbers/3; ui++){
                    for (let uj = unitY*numbers/3; uj < (unitY+1)*numbers/3; uj++){
                        if (this.interface[ui][uj] === i){
                            this.buttons[i].style.opacity = "0.5";
                        }
                    }
                }
            }
        }
    }
    
    //click event
    const click = (clickX, clickY) => {
        if (this.displayMode !== "processing"){
            return;
        }
        if (this.gameStatus === false){
            return;
        }
        let element = this.boxElements[clickX][clickY];
        for (let i = 0; i < numbers; i++){
            for (let j = 0; j < numbers; j++){
                this.boxElements[i][j].style.backgroundColor = colorToRGB(...this.colors[0]);
            }
        }
        element.style.backgroundColor = colorToRGB(...this.colors[2]);
        displayButtons(clickX, clickY);
    }
    
    //display with processing
    this.display = (_displayMode="none", _append=document.body, _boxSize=50, _left=50, _top=50, ..._colors) => {
        this.displayMode = _displayMode;
        if (this.displayMode !== "processing"){
            return;
        }
        this.append = _append;
        this.boxSize = _boxSize;
        this.left = _left;
        this.top = _top;
        this.colors = [[220,220,220],[0,0,0],[200,200,200],[255,0,0],[0,0,255]];
        for (let i = 0; i < this.colors.length; i++){
            if (_colors[i] != undefined){
                this.colors[i] = deepCopy(_colors[i]);
            }
        }

        strokeWeight(1);
        stroke(...this.colors[1]);
        fill(...this.colors[1]);
        this.gameElement = rect(this.left, this.top, this.boxSize*numbers+6, this.boxSize*numbers+6);
        this.gameElement.append(this.append);

        this.boxElements = [];

        fill(...this.colors[0]);
        for (let i = 0; i < numbers; i++){
            this.boxElements[i] = [];
            for (let j = 0; j < numbers; j++){
                let left = this.left + this.boxSize*i + Math.floor(i*3/numbers)*3;
                let top = this.top + this.boxSize*j + Math.floor(j*3/numbers)*3;
                this.boxElements[i][j] = rect(left, top, this.boxSize, this.boxSize);
                this.boxElements[i][j].indexI = i;
                this.boxElements[i][j].indexJ = j;
                if (this.interface[i][j] != CLOSED){
                    this.boxElements[i][j].innerHTML = this.interface[i][j];
                    this.boxElements[i][j].style.color = colorToRGB(...this.colors[1]);
                } else {
                    this.boxElements[i][j].style.color = colorToRGB(...this.colors[4]);
                    this.boxElements[i][j].style.cursor = "pointer";
                    this.boxElements[i][j].addEventListener("click", function(){
                        click(this.indexI, this.indexJ);
                    });
                }
                this.boxElements[i][j].style.textAlign = "center";
                this.boxElements[i][j].style.fontSize = this.boxSize/2 + "px";
            }
        }

        //display answer button
        fill(...this.colors[2]);
        this.answerButton = rect(this.left, this.top + this.boxSize*(numbers+1), this.boxSize*2, this.boxSize/2);
        this.answerButton.style.borderRadius = this.boxSize/4 + "px";
        this.answerButton.innerHTML = "ANSWER";
        this.answerButton.style.textAlign = "center";
        this.answerButton.style.cursor = "pointer";
        this.answerButton.addEventListener("click", function(){
            getAnswer();
        });
    }
    
    //load histories[] ready to display
    this.loadHistories = () => {
        
    }

    //run
    this.run = () => {
        this.initialize();
        this.setNumbers();
        this.setInterface();
        this.display("processing");
    }
    return this;
}

rect(0,0,600,600);
let level = prompt("Enter a level: 1~5");
//let level = 2;
let game = new Game(parseInt(level)-1);
game.run();