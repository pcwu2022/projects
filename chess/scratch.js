/********* move *********/

const move = function(element, x, y, time=0){
    element.style.position = "absolute";
        element.style.transitionTimingFunction = "linear";
        element.style.transitionDelay = "0";
        element.style.transitionDuration = time + "s";
        element.style.left = parseFloat(element.style.left) + x + "px";
        element.style.top = parseFloat(element.style.top) + y + "px";


};
const moveTo = function(element, x, y, time=0){
    element.style.position = "absolute";
    if (element.style.borderRadius === "50%"){
        x = x - parseFloat(element.style.width)/2;
        y = y - parseFloat(element.style.height)/2;
    }
    element.style.transitionTimingFunction = "linear";
    element.style.transitionDelay = "0";
    element.style.transitionDuration = time + "s";
    element.style.left = x + "px";
    element.style.top = y + "px";
};
const size = function(element, size){
    element.style.position = "absolute";
    element.style.transform = "scale(" + size + ")";
};

const repeat = function(n, funct){
    for (let i = 0; i < n; i++){
        funct();
    }
};

const delay = function(funct, time){
    
    let i = 0;
    let fitv = function(){
        if (i === time*100){
            funct();
            window.clearInterval(itv);
            
        }
        i++;
    };
    let itv = window.setInterval(fitv,10);
};

