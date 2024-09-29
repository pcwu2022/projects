/***************************
PROCESSING JS USER MANUAL

# Shapes:
    * rect(x, y, width, height);
    * image(x, y, width, height, src);
    * ellipse(x, y, width, height);
    * line(x1, y1, x2, y2);
    * point(x, y);

# Color and Stroke:
    * background(r, g, b);
    * fill(r, g, b, a);
    * noFill();
    * stroke(r, g, b);
    * noStroke();
    * strokeWeight(weight);

# Transform:
    * translate(x, y);
    * rotate(deg);

# Global variables:
    * mouseIsPressed
    * keyIsPressed
    * mouseX
    * mouseY

# Environmental functions:
    * mouseMoved = function(){}
    * mousePressed = function(){}
    * mouseReleased = function(){}
    * mouseClicked = function(){}
    * keyPressed = function(){}
    * keyReleased = function(){}
    * draw = function(){}

***************************/

/********* arrays *********/
let array_points = [];
let array_rects = [];
let array_ells = [];
let array_lines = [];


/********* variables *********/
let rotateCenterX = innerWidth/2;
let rotateCenterY = innerHeight/2;
let translateXFloat = 0;
let translateYFloat = 0;
let rotateFloat = 0;
let int_pointNum = 0;
let int_rectNum = 0;
let int_ellNum = 0;
let int_lineNum = 0;
let float_strokeWeight = 1;
let int_red = 0;
let int_green = 0;
let int_blue = 0;
let int_opacity = 1;
let string_stroke = "(0,0,0)";
let boolean_stroke = true;
let string_fill = "(0,0,0)";
let boolean_fill = true;
let string_background = "(0,0,0)";
let mouseMoved;
let mousePressed;
let mouseReleased;
let mouseClicked;
let keyPressed;
let keyReleased;
let mouseIsPressed = false;
let keyIsPressed = false;
let draw;
let mouseX;
let mouseY;
let mouseXS;
let mouseYS;
let int_xPos;
let int_yPos;

/********* functions *********/
const sin = (num) => Math.sin(num);
const cos = (num) => Math.cos(num);
const tan = (num) => Math.tan(num);
const asin = (num) => Math.asin(num);
const acos = (num) => Math.acos(num);
const atan = (num) => Math.atan(num);
const round = (num) => Math.round(num);
const floor = (num) => Math.floor(num);
const abs = (num) => Math.abs(num);
const sqrt = (num) => Math.sqrt(num);
const log = (num) => Math.log(num);
const log10 = (num) => Math.log(num)/Math.log(10);
const log2 = (num) => Math.log(num)/Math.log(2);
const PI = () => Math.PI;

const strokeWeight = function(strokeweight){
    float_strokeWeight = strokeweight;
};
const stroke = function(r, g, b){
    int_red = r;
    int_green = g;
    int_blue = b;
    string_stroke = "rgb("+r+","+g+","+b+")";
    boolean_stroke = true;
};
const fill = function(r, g, b, a=1){
    string_fill = "rgba("+r+","+g+","+b+")";
    int_opacity = a;
    if (int_opacity > 1 || int_opacity < 0){
        int_opacity = 1;
    }
    boolean_fill = true;
};
const noFill = function(){
    boolean_fill = false;
};
const noStroke = function(){
    boolean_stroke = false;
};
const println = function(print){
    let printlnDiv = document.getElementById("printlnDiv");
    print = print.replaceAll("\n","<br>");
    console.log(print);
    if (printlnDiv !== undefined){
        printlnDiv.style.opacity = "1";
        printlnDiv.innerHTML += "<span style = 'color:yellow'>&gt</span>&nbsp";
        printlnDiv.innerHTML += print;
        printlnDiv.innerHTML += "<br>";
    }
};
const translate = function(x, y){
    translateXFloat = translateXFloat + x;
    translateYFloat = translateYFloat + y;
    mouseX = mouseX - x;
    mouseY = mouseY - y;
};
const rotate = function(angle){
    rotateFloat = angle + rotateFloat;
    int_xPos = mouseX;
    int_yPos = mouseY;
    rotateF(int_xPos, int_yPos);
    mouseX = int_xPos;
    mouseY = int_yPos;
};
const rotateF = function(x, y){
    if (x !== 0) {
        let len = Math.sqrt( x*x + y*y );
        let theta1 = Math.atan( y/x );
        if ((x < 0 && y < 0) || ((x > 0 && y < 0))){
            //theta1 = theta1 + Math.PI;
        }
        int_xPos = len*Math.cos( theta1 + rotateFloat*Math.PI/180 );
        int_yPos = len*Math.sin( theta1 + rotateFloat*Math.PI/180 );
    }
};
const background = function(r, g, b){
    document.body.style.backgroundColor = "rgb("+r+","+g+","+b+")";
    for (let i = 0; i < array_ells.length; i++){
        array_ells[i].parentNode.removeChild(array_ells[i]);
    }
    array_ells = [];
    for (let i = 0; i < array_points.length; i++){
        array_points[i].parentNode.removeChild(array_points[i]);
    }
    array_points = [];
    for (let i = 0; i < array_rects.length; i++){
        array_rects[i].parentNode.removeChild(array_rects[i]);
    }
    array_rects = [];
    for (let i = 0; i < array_lines.length; i++){
        array_lines[i].parentNode.removeChild(array_lines[i]);
    }
    array_lines = [];
};
const point = function( x, y){
    int_xPos = x;
    int_yPos = y;
    rotateF(int_xPos, int_yPos);
    x = int_xPos;
    y = int_yPos;
    let xp = x - float_strokeWeight/2;
    let yp = y - float_strokeWeight/2;
    array_points.push(document.createElement("div"));
    let el = array_points[array_points.length - 1];
    el.style.width = float_strokeWeight + "px";
    el.style.height = float_strokeWeight + "px";
    el.style.borderRadius = float_strokeWeight + "px";
    el.style.position = "absolute";
    el.style.left = xp + translateXFloat + "px";
    el.style.top = yp + translateYFloat + "px";
    el.style.backgroundColor = string_stroke;
    el.style.opacity = "1";
    if (boolean_stroke === false){
        el.style.backgroundColor = "rgba("+int_red+","+int_green+","+int_blue+",0)";
    }
    document.body.appendChild(el);
    int_pointNum++;

    el.append = function(target){
        document.body.removeChild(el);
        target.appendChild(el);
        target.style.position = "relative";
        el.style.position = "absolute";
    }
    return el;
};
const rect = function( x, y ,width, height, radius = 0){
    int_xPos = x;
    int_yPos = y;
    rotateF(int_xPos, int_yPos);
    x = int_xPos;
    y = int_yPos;

    array_rects.push(document.createElement("div"));
    let el = array_rects[array_rects.length - 1];
    el.style.width = width + "px";
    el.style.height = height + "px";
    el.style.position = "absolute";
    el.style.left = x + translateXFloat + "px";
    el.style.top = y + translateYFloat + "px";
    el.style.backgroundColor = string_fill;
    el.style.opacity = int_opacity + "";
    if (boolean_fill === false){
        el.style.backgroundColor = "rgba("+int_red+","+int_green+","+int_blue+",0)";
    }
    el.style.border = float_strokeWeight + "px " + "solid " + string_stroke;
    if (boolean_stroke === false){
        el.style.border = "";
    }
    el.style.borderRadius = radius + "px";
    el.style.transform = "rotate(" + rotateFloat + "deg)"; 
    document.body.appendChild(el);
    int_rectNum++;

    el.append = function(target){
        document.body.removeChild(el);
        target.appendChild(el);
        target.style.position = "relative";
        el.style.position = "absolute";
    }
    return el;
};
const image = function(x, y, width, height, src){
    let el = rect();
    el.style.backgroundImage = src;
    el.style.backgroundSize = "100%";
    return el;
};
const ellipse = function( x, y ,width, height){
    int_xPos = x;
    int_yPos = y;
    rotateF(int_xPos, int_yPos);
    x = int_xPos;
    y = int_yPos;
    let xp = x - width/2;
    let yp = y - height/2;
    array_ells.push(document.createElement("div"));
    let el = array_ells[array_ells.length - 1];
    el.style.width = width + "px";
    el.style.height = height + "px";
    el.style.position = "absolute";
    el.style.left = xp + translateXFloat + "px";
    el.style.top = yp + translateYFloat + "px";
    el.style.backgroundColor = string_fill;
    el.style.opacity = int_opacity + "";
    if (boolean_fill === false){
        el.style.backgroundColor = "rgba("+int_red+","+int_green+","+int_blue+",0)";
    }
    el.style.borderRadius = "50%";
    el.style.border = float_strokeWeight + "px " + "solid " + string_stroke;
    if (boolean_stroke === false){
        el.style.border = "";
    }
    document.body.appendChild(el);
    int_ellNum++;

    el.append = function(target){
        document.body.removeChild(el);
        target.appendChild(el);
        target.style.position = "relative";
        el.style.position = "absolute";
    }
    return el;
};
const line = function( x1, y1, x2, y2){
    int_xPos = x1;
    int_yPos = y1;
    rotateF(int_xPos, int_yPos);
    x1 = int_xPos;
    y1 = int_yPos;
    int_xPos = x2;
    int_yPos = y2;
    rotateF(int_xPos, int_yPos);
    x2 = int_xPos;
    y2 = int_yPos;
    let t = 0 - (Math.atan((x2 - x1)/(y2 - y1)))*180/Math.PI;
    let xp = (x1 + x2)/2;
    let yp = (y1 + y2)/2;
    let l = Math.sqrt((x2 - x1)*(x2 - x1)+(y2 - y1)*(y2 - y1));
    array_lines.push(document.createElement("div"));
    let el = array_lines[array_lines.length - 1];
    el.style.width = float_strokeWeight + "px";
    el.style.height = l + "px";
    el.style.position = "absolute";
    el.style.left = xp + translateXFloat - float_strokeWeight/2 + "px";
    el.style.top = yp + translateYFloat - l/2 + "px";
    el.style.backgroundColor = string_stroke;
    el.style.opacity = "1";
    if (boolean_stroke === false){
        el.style.opacity = "0";
    }
    el.style.transform = "rotate(" + t + "deg)";
    document.body.appendChild(el);
    int_lineNum++;

    el.append = function(target){
        document.body.removeChild(el);
        target.appendChild(el);
        target.style.position = "relative";
        el.style.position = "absolute";
    }
    return el;
};
const function_mouseMove = function(e){
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseXS = e.clientX + window.scrollX;
    mouseYS = e.clientY + window.scrollY;
    if (mouseMoved === undefined){

    } else {
        mouseMoved();
    }
};
const function_mouseMoveT = function(e){
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
    mouseXS = e.touches[0].clientX + window.scrollX;
    mouseYS = e.touches[0].clientY + window.scrollY;
    if (mouseMoved === undefined){

    } else {
        mouseMoved();
    }
};
const function_mousePress = function(){
    mouseIsPressed = true;
    if (mousePressed === undefined){

    } else {
        mousePressed();
    }
};
const function_mouseRelease = function(){
    mouseIsPressed = false;
    if (mouseReleased === undefined){

    } else {
        mouseReleased();
    }
};
const function_mouseClick = function(){
    if (mouseClicked === undefined){

    } else {
        mouseClicked();
    }
};
const function_keyPress= function(){
    keyIsPressed = true;
    if (keyPressed === undefined){

    } else {
        keyPressed();
    }
};
const function_keyRelease= function(){
    keyIsPressed = false;
    if (keyReleased === undefined){

    } else {
        keyReleased();
    }
};
const function_draw = function(){
    if (draw === undefined){

    } else {
        draw();
    }
};

/********* animation *********/
document.body.addEventListener("mousemove", function_mouseMove);document.body.addEventListener("touchmove", function_mouseMoveT);
document.body.addEventListener("mousedown", function_mousePress);
document.body.addEventListener("mouseup", function_mouseRelease);
document.body.addEventListener("click", function_mouseClick);
document.body.addEventListener("keydown", function_keyPress);
document.body.addEventListener("keyup", function_keyRelease);
window.setInterval(function_draw, 10);