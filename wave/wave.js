let graphArr = [50, 50, 850, 350];
let V = 100;
let nodeArr = [];
nodeArr.fill()


//background settings
if (window.outerWidth < 800){
    graphArr = [50, 50, window.outerWidth-100, 350];
}
noFill();
stroke(0,0,0);
strokeWeight(2);
let graphRect = rect(graphArr[0],graphArr[1],graphArr[2]-graphArr[0],graphArr[3]-graphArr[1]);
let paramsDiv = document.getElementById("parameters");
paramsDiv.style.position = "absolute";
paramsDiv.style.left = graphArr[0]+"px";
paramsDiv.style.top = graphArr[3]+10+"px";
paramsDiv.style.lineHeight = "170%";
let button = document.getElementById("bt");

//constructor
function Wave(ymax, k, omega, phi){
    this.YMAX = ymax;
    this.K = k;
    this.OMEGA = omega;
    this.PHI = phi;
    this.waveFunction = function(x,t){
        return this.YMAX*sin(this.K*x - this.OMEGA*t + this.PHI);
    };
    this.drawWave = function(x,t){
        let y = this.YMAX*sin(this.K*x - this.OMEGA*t + this.PHI);
        if (0 - y + (graphArr[3]+graphArr[1])/2 >= graphArr[3] || 0 - y + (graphArr[3]+graphArr[1])/2 <=graphArr[1]){
            return;
        }
        point(x + graphArr[0], 0 - y + (graphArr[3]+graphArr[1])/2);
    }
};

//functions
let time = 0;
function main(){
    //clear all
    background(255,255,255);
    noFill();
    stroke(0,0,0);
    strokeWeight(2);
    graphRect = rect(graphArr[0],graphArr[1],graphArr[2]-graphArr[0],graphArr[3]-graphArr[1]);
    stroke(100,220,255);
    strokeWeight(3);
    for (let x = 2; x < graphArr[2]-graphArr[0]; x+=1){
        Wave1.drawWave(x,time);
    }
    stroke(255,0,0);
    strokeWeight(8);
    Wave1.drawWave(1,time);
    stroke(220,100,255);
    // strokeWeight(3);
    // for (let x = 2; x < graphArr[2]-graphArr[0]; x+=1){
    //     Wave2.drawWave(x,time);
    // }
    // stroke(255,0,0);
    // strokeWeight(8);
    // Wave2.drawWave(1,time);
    time++;
};

//program
let Wave1 = new Wave(50, 0.2, -0.25, 0);
//let Wave2 = new Wave(50, 0.2, -0.25, 1);
let mainItv = window.setInterval(main, 1000/V);

const change = () => {
    time = 0;
    Wave1 = new Wave(document.getElementById("Ymax").value, document.getElementById("K").value, document.getElementById("Omega").value, document.getElementById("Phi").value);
}

button.addEventListener("click", change);