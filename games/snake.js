'use strict'

function Game(){
    //constants
    const OBSTACLE = -2;
    const EMPTY = -1;
    const SNAKE = 0;
    const POINT = 1;    //points count from 1 to infinity
    const LEFT = 0;
    const RIGHT = 1;
    const UP = 2;
    const DOWN = 3;
    
    //game variables
    let score = 0;
    let frameDelay = 15;
    let direction = RIGHT;
    let gameStart = false;
    let snakeArr = [];
    let longDelay = 0;
    let mainItv;
    let lost = false;
    
    //display variables
    let gridX = 10; //vertical boxes 2:45 start
    let gridY = 20; //horizontal boxes
    let grid = [];
    let gridEl = [];
    let boxWidth = 30;
    let marginTop = 50;
    let marginLeft = 50;
    let snakeColor = "rgb(0,255,0)";
    let gemColor = [
        "rgb(255,0,0)",
        "rgb(0,255,255)",
        "rgb(255,255,0)",
        "rgb(0,0,255)",
        "rgb(0,200,255)"
    ];
    
    //set points
    noFill();
    noStroke();
    let scoreDiv = rect(marginLeft, marginTop - 40, 200, 30);
    scoreDiv.innerHTML = "score: " + score;
    scoreDiv.style.fontSize = "30px";
    function updateScore(deltaP){
        score += deltaP;
        scoreDiv.innerHTML = "score: " + score;
    };
    function lose(){
        console.log("lose");
        window.clearInterval(mainItv);
        fill(200,200,200);
        stroke(50,50,50);
        strokeWeight(1);
        let loseDiv = rect(marginLeft, marginTop, boxWidth*gridY, boxWidth*gridX);
        loseDiv.style.fontSize = boxWidth*gridX/12 + "px";
        loseDiv.align = "center";
        loseDiv.innerHTML = "----HAHA LOSER----<br>THE HIGH SCORE IS " + (score + Math.ceil(Math.random()*5));
        lost = true;
    };
    
    //set grid
    fill(0,0,0);
    stroke(50,50,50);
    strokeWeight(1);
    for (let i = 0; i < gridX; i++){
        grid[i] = [];
        gridEl[i] = [];
        for (let j = 0; j < gridY; j++){
            grid[i][j] = EMPTY; 
            gridEl[i][j] = rect(marginLeft + j*boxWidth, marginTop + i*boxWidth, boxWidth, boxWidth);
            gridEl[i][j].style.fontSize = boxWidth-5 + "px";
            gridEl[i][j].align = "center";
        }
    }
    
    
    //keyboard controls
    document.body.addEventListener("keydown", function(e){
        if (e.key === "ArrowRight" || e.key === "d"){
            direction = RIGHT;
        } else if (e.key === "ArrowLeft" || e.key === "a"){
            direction = LEFT;
        } else if (e.key === "ArrowUp" || e.key === "w"){
            direction = UP;
        } else if (e.key === "ArrowDown" || e.key === "s"){
            direction = DOWN;
        }
    });
    
    fill(100,100,100);
    let leftButton = rect(marginLeft + gridY*boxWidth + 50, marginTop + gridX*0.5*boxWidth, 50, 50);
    let rightButton = rect(marginLeft + gridY*boxWidth + 190, marginTop + gridX*0.5*boxWidth, 50, 50);
    let upButton = rect(marginLeft + gridY*boxWidth + 120, marginTop + gridX*0.5*boxWidth - 50, 50, 50);
    let downButton = rect(marginLeft + gridY*boxWidth + 120, marginTop + gridX*0.5*boxWidth + 50, 50, 50);
    
    leftButton.innerHTML = "◀";
    rightButton.innerHTML = "▶";
    upButton.innerHTML = "▲";
    downButton.innerHTML = "▼";
    leftButton.style.fontSize = "30px";
    rightButton.style.fontSize = "30px";
    upButton.style.fontSize = "30px";
    downButton.style.fontSize = "30px";
    leftButton.align = "center";
    rightButton.align = "center";
    upButton.align = "center";
    downButton.align = "center";
    
    leftButton.addEventListener("click", function(){direction = LEFT;});
    rightButton.addEventListener("click", function(){direction = RIGHT;});
    upButton.addEventListener("click", function(){direction = UP;});
    downButton.addEventListener("click", function(){direction = DOWN;});
    
    rect(marginLeft + gridY*boxWidth + 390, marginTop + gridX*0.5*boxWidth, 0, 0);
    
    //create snake
    let randI = Math.floor(Math.random()*gridX);
    let randJ = Math.floor(Math.random()*gridY/2);
    grid[randI][randJ] = SNAKE;
    gridEl[randI][randJ].style.backgroundColor = snakeColor;
    snakeArr.unshift([randI,randJ]);
    
    //create gem
    function gem(deltaP){
        if (deltaP === 0){
            deltaP = 1;
        }
        let randI = Math.floor(Math.random()*gridX);
        let randJ = Math.floor(Math.random()*gridY);
        while(grid[randI][randJ] != EMPTY){
            randI = Math.floor(Math.random()*gridX);
            randJ = Math.floor(Math.random()*gridY);
        }
        grid[randI][randJ] = deltaP;
        gridEl[randI][randJ].style.backgroundColor = gemColor[Math.floor(Math.random()*gemColor.length)];
        gridEl[randI][randJ].innerHTML = deltaP;
    };
    
    //main function
    let count = 0;
    function main(){
        count++;
        if (frameDelay === 0){
            mainItv = window.setInterval(main, 2);
        } else {
            if (count%round(frameDelay) !== 0){
                return;
            }
        }
        if (gameStart === false){
            return;
        }
    
        //move around
        snakeArr.unshift([snakeArr[0][0],snakeArr[0][1]]);
        if (direction === RIGHT){
            snakeArr[0][1] += 1;
        } else if (direction === LEFT){
            snakeArr[0][1] += -1;
        } else if (direction === UP){
            snakeArr[0][0] += -1;
        } else {
            snakeArr[0][0] += 1;
        }
    
        //out -> lose
        if (snakeArr[0][0] < 0 || snakeArr[0][0] >= gridX || snakeArr[0][1] < 0 || snakeArr[0][1] >= gridY){    
            gameStart = false;
            lose();
            return;
        }
        
        //crash -> lose
        if (grid[snakeArr[0][0]][snakeArr[0][1]] === SNAKE || grid[snakeArr[0][0]][snakeArr[0][1]] === OBSTACLE){ 
            gameStart == false;
            lose();
            return;
        } 
        
        //get point
        if (grid[snakeArr[0][0]][snakeArr[0][1]] > 0){    
            gridEl[snakeArr[0][0]][snakeArr[0][1]].innerHTML = "";
            gem(Math.ceil(score*Math.random()/5));
            if (Math.random()*11 > 10){
                gem(Math.ceil(score*Math.random()));
            }
            if (Math.random()*3 > 2){
                gem(Math.ceil(score*Math.random()/3));
            }
            updateScore(grid[snakeArr[0][0]][snakeArr[0][1]]);
            longDelay += grid[snakeArr[0][0]][snakeArr[0][1]];
            frameDelay *= 0.95;
            
            grid[snakeArr[0][0]][snakeArr[0][1]] = SNAKE;
            window.clearInterval(mainItv);
            mainItv = window.setInterval(main, frameDelay);
        }
    
        grid[snakeArr[0][0]][snakeArr[0][1]] = SNAKE; //head
        gridEl[snakeArr[0][0]][snakeArr[0][1]].style.backgroundColor = snakeColor; //head
    
        if (longDelay === 0){
            grid[snakeArr[snakeArr.length-1][0]][snakeArr[snakeArr.length-1][1]] = EMPTY; //tail
            gridEl[snakeArr[snakeArr.length-1][0]][snakeArr[snakeArr.length-1][1]].style.backgroundColor = "rgb(0,0,0)"; //tail
            snakeArr.pop(); //tail
        } else {
            longDelay--;
        }
    };
    
    //game start
    fill(0,0,0);
    stroke(100,100,100);
    strokeWeight(5);
    let startButton = rect(marginLeft, marginTop + gridX*boxWidth + 20, 100, 40);
    startButton.innerHTML = "START";
    startButton.style.color = "rgb(255,255,255)";
    startButton.style.fontSize = "30px";
    startButton.style.cursor = "pointer";
    startButton.align = "center";
    startButton.addEventListener("click", function(){
        if (lost === true){
            window.location.href = window.location.href;
        }
        gameStart = true;
        gem(1);
        mainItv = window.setInterval(main, frameDelay);
    });
}

let game = new Game();