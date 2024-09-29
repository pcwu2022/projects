'use strict';

function Game(gridX = 5, gridY = 2, mouseWidth = 50){
    this.points = 0;
    this.gridX = gridX;
    this.gridY = gridY;
    this.mouseWidth = mouseWidth;
    const click = (i,j) => {
        let element = this.mice[i][j];
        if (element.status){
            element.style.backgroundColor = "rgb(0,255,0)";
            element.status = false;
            this.points++;
            this.pointsDiv.innerHTML = "POINTS: " + this.points;
        } 
    }
    this.activate = (control,i,j) => {
        let element = this.mice[i][j];
        if (element.status){
            element.style.backgroundColor = "rgb(0,255,0)";
            element.status = false;
        } else {
            if (control === false){
                return;
            }
            element.style.backgroundColor = "red";
            element.status = true;
        }
    }
    this.initialize = () => {
        fill(255,255,250);
        noStroke();
        this.pointsDiv = rect(0,0,100,50);
        strokeWeight(1);
        stroke(0,0,0);
        this.pointsDiv.innerHTML = "POINTS: 0";
        fill(255,255,0);
        this.element = rect(50,50,this.gridX*this.mouseWidth*2, this.gridY*this.mouseWidth*2);
        this.mice = [];
        fill(0,255,0);
        for (let i = 0; i < this.gridX; i++){
            this.mice[i] = [];
            for (let j = 0; j < this.gridY; j++){
                this.mice[i][j] = ellipse(50+(2*i+1)*this.mouseWidth,50+(2*j+1)*this.mouseWidth,this.mouseWidth,this.mouseWidth);
                this.mice[i][j].I = i;
                this.mice[i][j].J = j;
                this.mice[i][j].status = false;
                this.mice[i][j].addEventListener("click", function(){
                    click(this.I,this.J);
                })
            }
        }
        
    }
    this.intervalFunction = () => {
        let randomI = Math.floor(Math.random()*this.gridX);
        let randomJ = Math.floor(Math.random()*this.gridY);
        if (Math.random() > 0.5){
            this.activate(true, randomI, randomJ);
            setTimeout(() => {
                this.activate(false, randomI, randomJ);
            }, 500);
        }
    }
    this.run = () => {
        this.points = 0;
        this.initialize();
        this.gameItv = setInterval(this.intervalFunction,500);
    }
    return this;
}

let game = new Game();
game.run();