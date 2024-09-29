let localIP = window.location.href;
let interact = function(action){
    let send = new XMLHttpRequest();
    send.open('GET', localIP+"/"+action,true);
    send.send();
    shield.innerHTML = action;
};

document.body.style.zoom = "100%";
background(100,230,255);
let wiw = window.innerWidth;
let wih = window.innerHeight;
let centerX = wiw/2;
let centerY = wih/2;
noStroke();
fill(175,175,175);
let leftC = ellipse(centerX - 150,centerY,200,200);
leftC.align = "center";
leftC.style.fontSize = "40px";
leftC.style.padding = "16px 0px 0px 0px";
leftC.style.overFlow = "hidden";
leftC.style.lineHeight = "1.4";
leftC.innerHTML = "&#9650 <br><br> &#9660";
let rightC = ellipse(centerX + 150,centerY,200,200);
rightC.align = "center";
rightC.style.fontSize = "40px";
rightC.style.padding = "16px 0px 0px 0px";
rightC.style.overFlow = "hidden";
rightC.style.lineHeight = "1.4";
rightC.innerHTML = "&#9650 <br> &#9664 &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&#9654 <br> &#9660";
noFill();

let words = rect(centerX-250,centerY-100,500,20);
words.align = "center";
words.innerHTML = "Speed &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp Direction";

let shield = rect(0,0,wiw,wih);
fill(125,125,125);
let leftJ = ellipse(centerX - 150,centerY,70,70);
let rightJ = ellipse(centerX + 150,centerY,70,70);

let cx = centerX + 150;
let cy = centerY;
let tx = [];
let ty = [];
let dlr = dud = ds = 0;
let n = 0;
leftJ.style.transform = "translateY(50px)";
ds = 50;
let spd = function(e){
    if (e.touches.length === 2){
        if (abs(e.touches[1].clientX - (centerX - 150)) <= 50){
            n = 1;
        } else {
            n = 0;
        }
    } else {
        n = 0;
    }
    //tx = e.touches[0].clientX;
    ty[0] = e.touches[n].clientY;
    if (abs(ty[0] - cy) <= 50){
        if (abs(ds - (ty[0]-cy))>=2){
            ds = ty[0]-cy;
            interact("s="+(50-ds));
        }
        
        leftJ.style.transform = "translateY("+(ty[0]-cy)+"px)";
    }
};
let dir = function(e){
    if (e.touches.length === 2){
        if (abs(e.touches[1].clientX - cx) <= 50){
            n = 1;
        } else {
            n = 0;
        }
    } else {
        n = 0;
    }
    tx[1] = e.touches[n].clientX;
    ty[1] = e.touches[n].clientY;
    if (abs(ty[1] - cy) <= 50 && abs(tx[1] - cx) <= 50){
        if (abs(dlr - (tx[1]-cx))>=2){
            dlr = tx[1]-cx;
            interact("lr="+dlr);

        }
        if (abs(dud - (ty[1]-cy))>=2){
            dud = ty[1]-cy;
            interact("ud="+dud);

        }
        rightJ.style.transform = "translate("+(tx[1]-cx)+"px,"+(ty[1]-cy)+"px)";
    }
};
let neutral = function(){
    rightJ.style.transform = "translate(0px,0px)";
    dlr = 0;
    

    dud = 0;
    interact("NEUTRAL");

};
leftJ.addEventListener("touchmove", spd);
rightJ.addEventListener("touchmove", dir);
rightJ.addEventListener("touchend", neutral);