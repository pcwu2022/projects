let positionBoolean = false;
let diePos = 90;
let dieBoolean = false;
let finishBoolean = false;
let turns = "black";

/********* red *********/
let blackDie = function(id){
    dieBoolean = true;
    judge("吃！");
    blackEl[blackId.indexOf(id)].style.transitionDelay = "0.3s";
    moveBlack(blackId.indexOf(id), diePos);
    let index = blackId.indexOf(id);
    blackEl.splice(index,1);
    blackId.splice(index,1);
    blackName.splice(index,1);
    blackMoved.splice(index, 1);

    diePos++;
    dieBoolean = false;
};

let senseRed = function(pos, move){
    if (pos + move >= 0 && pos + move <= 89){
        if (positionBoolean === true){
            if (piecePos[pos + move] === null){
                createDot(pos + move);
            }
            if (blackId.includes(piecePos[pos + move])){
                createDot(pos + move);
            }
        }
    }
};
let blockRed = function(pos, block){
    if (pos + block >= 0 && pos + block <= 89){
        if (piecePos[pos + block] !== null){
            positionBoolean = false;
        } else {
            positionBoolean = true;
        }
    }
};


senseK = function(pos){
    positionBoolean =true;
    if (pos%9 !== 5){
        senseRed(pos, 1);
    }
    if (pos%9 !== 3){
        senseRed(pos, -1);
    }
    if (pos <= 90){
        senseRed(pos, 9);
    }
    if (pos >= 72){
        senseRed(pos, -9);
    }
    if (piecePos.indexOf("k1")%9 === pos%9){
        let kPos = pos;
        while (kPos > 0){
            kPos -= 9;
            if (piecePos[kPos] === "k1"){
                createDot(kPos);
                break;
            } else if (piecePos[kPos] != null){
                break;
            }
        }
    }
};
senseA = function(pos){
    positionBoolean =true;
    if (pos === 76){
        senseRed(pos, 8);
        senseRed(pos, -8);
        senseRed(pos, 10);
        senseRed(pos, -10);
    }
    if (pos === 84){
        senseRed(pos, -8);
    }
    if (pos === 86){
        senseRed(pos, -10);
    }
    if (pos === 66){
        senseRed(pos, 10);
    }
    if (pos === 68){
        senseRed(pos, 8);
    }
};
senseE = function(pos){
    positionBoolean =true;
    if (pos >= 54){
        if (pos%9 !== 0){
            blockRed(pos, -10);
            senseRed(pos, -20);
            blockRed(pos, 8);
            senseRed(pos, 16);
        }
        if (pos%9 !== 8){
            blockRed(pos, 10);
            senseRed(pos, 20);
            blockRed(pos, -8);
            senseRed(pos, -16);
        }
    } else {
        if (pos%9 !== 0){
            blockRed(pos, 8);
            senseRed(pos, 16);
        }
        if (pos%9 !== 8){
            blockRed(pos, 10);
            senseRed(pos, 20);
        }
    }
};
senseH = function(pos){
    positionBoolean =true;
    if (pos%9 !== 0){
        blockRed(pos, 9);
        senseRed(pos, 17);
        blockRed(pos, -9);
        senseRed(pos, -19);
        if (pos%9 !== 1){
            blockRed(pos, -1);
            senseRed(pos, 7);
            blockRed(pos, -1);
            senseRed(pos, -11);
        }
    }
    if (pos%9 !== 8){
        blockRed(pos, -9);
        senseRed(pos, -17);
        blockRed(pos, 9);
        senseRed(pos, 19);
        if (pos%9 !== 7){
            blockRed(pos, 1);
            senseRed(pos, -7);
            blockRed(pos, 1);
            senseRed(pos, 11);
        }
    }
};

senseR = function(pos){
    positionBoolean =true;
    let i = 0;
    while ((pos+i)%9 !== 0){
        i = i - 1;
        if (redId.includes(piecePos[pos + i]) !== true){
            if (blackId.includes(piecePos[pos + i]) !== true){
                senseRed(pos, i);
            } else {
                senseRed(pos, i);
                break;
            }
        } else {
            break;
        }
    }
    i = 0;
    while ((pos+i)%9 !== 8){
        i = i + 1;
        if (redId.includes(piecePos[pos + i]) !== true){
            if (blackId.includes(piecePos[pos + i]) !== true){
                senseRed(pos, i);
            } else {
                senseRed(pos, i);
                break;
            }
        } else {
            break;
        }
    }
    i = 0;
    while (pos+i <= 89){
        i = i + 9;
        if (redId.includes(piecePos[pos + i]) !== true){
            if (blackId.includes(piecePos[pos + i]) !== true){
                senseRed(pos, i);
            } else {
                senseRed(pos, i);
                break;
            }
        } else {
            break;
        }
    }
    i = 0;
    while (pos+i >= 0){
        i = i - 9;
        if (redId.includes(piecePos[pos + i]) !== true){
            if (blackId.includes(piecePos[pos + i]) !== true){
                senseRed(pos, i);
            } else {
                senseRed(pos, i);
                break;
            }
        } else {
            break;
        }
    }
};

senseC = function(pos){
    positionBoolean =true;
    let i = 0;
    while ((pos+i)%9 !== 0){
        i = i - 1;
        if (piecePos[pos + i] !== null){
            while ((pos+i)%9 !== 0){
                i = i - 1;
                if (redId.includes(piecePos[pos + i]) 
                === true){
                    break;
                }
                if (blackId.includes(piecePos[pos + i]) === true){
                    senseRed(pos, i);
                    break;
                }
            }
            break;
        } else {
            senseRed(pos, i);
        }
    }
    i = 0;
    while ((pos+i)%9 !== 8){
        i = i + 1;
        if (piecePos[pos + i] !== null){
            while ((pos+i)%9 !== 8){
                i = i + 1;
                if (redId.includes(piecePos[pos + i]) 
                === true){
                    break;
                }
                if (blackId.includes(piecePos[pos + i]) === true){
                    senseRed(pos, i);
                    break;
                }
            }
            break;
        } else {
            senseRed(pos, i);
        }
    }
    i = 0;
    while (pos+i <= 89){
        i = i + 9;
        if (piecePos[pos + i] !== null){
            while (pos+i <= 89){
                i = i + 9;
                if (redId.includes(piecePos[pos + i]) 
                === true){
                    break;
                }
                if (blackId.includes(piecePos[pos + i]) === true){
                    senseRed(pos, i);
                    break;
                }
            }
            break;
        } else {
            senseRed(pos, i);
        }
    }
    i = 0;
    while (pos+i >= 0){
        i = i - 9;
        if (piecePos[pos + i] !== null){
            while (pos+i >= 0){
                i = i - 9;
                if (redId.includes(piecePos[pos + i]) 
                === true){
                    break;
                }
                if (blackId.includes(piecePos[pos + i]) === true){
                    senseRed(pos, i);
                    break;
                }
            }
            break;
        } else {
            senseRed(pos, i);
        }
    }
};
senseP = function(pos){
    positionBoolean =true;
    senseRed(pos,-9);
    if (pos < 45){
        if (pos%9 !== 0){
            senseRed(pos,-1);
        }
        if (pos%9 !== 8){
            senseRed(pos,1);
        }
    }
};


redAction = function(){
    let id = redId[redEl.indexOf(redClicked)];
    let pos = piecePos.indexOf(id);
    if (id === "K1"){
        senseK(pos);
    } else if ( id === "A1" || id === "A2"){
        senseA(pos);
    } else if ( id === "E1" || id === "E2"){
        senseE(pos);
    } else if ( id === "H1" || id === "H2"){
        senseH(pos);
    } else if ( id === "R1" || id === "R2"){
        senseR(pos);
    } else if ( id === "C1" || id === "C2"){
        senseC(pos);
    } else if ( id === "P1" || id === "P2"|| id === "P3" || id === "P4" || id === "P5"){
        senseP(pos);
    }
};

/********* black *********/

let redDie = function(id){
    dieBoolean = true;
    judge("吃！");
    redEl[redId.indexOf(id)].style.transitionDelay = "0.3s";
    if (id === "K1"){
            judge("黑方獲勝！");
            finishBoolean = true;
            //throw new Error("紅方獲勝！");
    }
    moveRed(redId.indexOf(id), diePos);
    let index = redId.indexOf(id)
    redEl.splice(index,1);
    redId.splice(index,1);
    redName.splice(index,1);
    redMoved.splice(index,1);

    diePos++;
    dieBoolean = false;
};

let senseBlack = function(pos,move){
    if (pos + move >= 0 && pos + move <= 89){
        if (positionBoolean === true){
            if (piecePos[pos + move] === null){
                createDot(pos + move);
            }
            if (redId.includes(piecePos[pos + move])){
                createDot(pos + move);
            }
        }
    }
};
let blockBlack = function(pos, block){
    if (pos + block > 0 || pos + block < 89){
        if (piecePos[pos + block] !== null){
            positionBoolean = false;
        } else {
            positionBoolean = true;
        }
    }
};

senseKB = function(pos){
    positionBoolean =true;
    if (pos%9 !== 5){
        senseBlack(pos, 1);
    }
    if (pos%9 !== 3){
        senseBlack(pos, -1);
    }
    if (pos <= 18){
        senseBlack(pos, 9);
    }
    if (pos >= 9){
        senseBlack(pos, -9);
    }
    if (piecePos.indexOf("K1")%9 === pos%9){
        let kPos = pos;
        while (kPos < 81){
            kPos += 9;
            if (piecePos[kPos] === "K1"){
                createDot(kPos);
                break;
            } else if (piecePos[kPos] != null){
                break;
            }
        }
    }
};
senseAB = function(pos){
    positionBoolean =true;
    if (pos === 13){
        senseBlack(pos, 8);
        senseBlack(pos, -8);
        senseBlack(pos, 10);
        senseBlack(pos, -10);
    }
    if (pos === 5){
        senseBlack(pos, 8);
    }
    if (pos === 3){
        senseBlack(pos, 10);
    }
    if (pos === 23){
        senseBlack(pos, -10);
    }
    if (pos === 21){
        senseBlack(pos, -8);
    }
};
senseEB = function(pos){
    positionBoolean =true;
    if (pos <= 35){
        if (pos%9 !== 0){
            blockBlack(pos, -10);
            senseBlack(pos, -20);
            blockBlack(pos, 8);
            senseBlack(pos, 16);
        }
        if (pos%9 !== 8){
            blockBlack(pos, 10);
            senseBlack(pos, 20);
            blockBlack(pos, -8);
            senseBlack(pos, -16);
        }
    } else {
        if (pos%9 !== 0){
            blockBlack(pos, -10);
            senseBlack(pos, -20);
        }
        if (pos%9 !== 8){
            blockBlack(pos, -8);
            senseBlack(pos, -16);
        }
    }
};
senseHB = function(pos){
    positionBoolean =true;
    if (pos%9 !== 8){
        blockBlack(pos, -9);
        senseBlack(pos, -17);
        blockBlack(pos, 9);
        senseBlack(pos, 19);
        if (pos%9 !== 1){
            blockBlack(pos, 1);
            senseBlack(pos, -7);
            blockBlack(pos, 1);
            senseBlack(pos, 11);
        }
    }
    if (pos%9 !== 0){
        blockBlack(pos, 9);
        senseBlack(pos, 17);
        blockBlack(pos, -9);
        senseBlack(pos, -19);
        if (pos%9 !== 7){
            blockBlack(pos, -1);
            senseBlack(pos, 7);
            blockBlack(pos, -1);
            senseBlack(pos, -11);
        }
    }
};

senseRB = function(pos){
    positionBoolean =true;
    let i = 0;
    while ((pos+i)%9 !== 0){
        i = i - 1;
        if (blackId.includes(piecePos[pos + i]) !== true){
            if (redId.includes(piecePos[pos + i]) !== true){
                senseBlack(pos, i);
            } else {
                senseBlack(pos, i);
                break;
            }
        } else {
            break;
        }
    }
    i = 0;
    while ((pos+i)%9 !== 8){
        i = i + 1;
        if (blackId.includes(piecePos[pos + i]) !== true){
            if (redId.includes(piecePos[pos + i]) !== true){
                senseBlack(pos, i);
            } else {
                senseBlack(pos, i);
                break;
            }
        } else {
            break;
        }
    }
    i = 0;
    while (pos+i <= 89){
        i = i + 9;
        if (blackId.includes(piecePos[pos + i]) !== true){
            if (redId.includes(piecePos[pos + i]) !== true){
                senseBlack(pos, i);
            } else {
                senseBlack(pos, i);
                break;
            }
        } else {
            break;
        }
    }
    i = 0;
    while (pos+i >= 0){
        i = i - 9;
        if (blackId.includes(piecePos[pos + i]) !== true){
            if (redId.includes(piecePos[pos + i]) !== true){
                senseBlack(pos, i);
            } else {
                senseBlack(pos, i);
                break;
            }
        } else {
            break;
        }
    }
};

senseCB = function(pos){
    positionBoolean =true;
    let i = 0;
    while ((pos+i)%9 !== 0){
        i = i - 1;
        if (piecePos[pos + i] !== null){
            while ((pos+i)%9 !== 0){
                i = i - 1;
                if (blackId.includes(piecePos[pos + i]) 
                === true){
                    break;
                }
                if (redId.includes(piecePos[pos + i]) === true){
                    senseBlack(pos, i);
                    break;
                }
            }
            break;
        } else {
            senseBlack(pos, i);
        }
    }
    i = 0;
    while ((pos+i)%9 !== 8){
        i = i + 1;
        if (piecePos[pos + i] !== null){
            while ((pos+i)%9 !== 8){
                i = i + 1;
                if (blackId.includes(piecePos[pos + i]) 
                === true){
                    break;
                }
                if (redId.includes(piecePos[pos + i]) === true){
                    senseBlack(pos, i);
                    break;
                }
            }
            break;
        } else {
            senseBlack(pos, i);
        }
    }
    i = 0;
    while (pos+i <= 89){
        i = i + 9;
        if (piecePos[pos + i] !== null){
            while (pos+i <= 89){
                i = i + 9;
                if (blackId.includes(piecePos[pos + i]) 
                === true){
                    break;
                }
                if (redId.includes(piecePos[pos + i]) === true){
                    senseBlack(pos, i);
                    break;
                }
            }
            break;
        } else {
            senseBlack(pos, i);
        }
    }
    i = 0;
    while (pos+i >= 0){
        i = i - 9;
        if (piecePos[pos + i] !== null){
            while (pos+i >= 0){
                i = i - 9;
                if (blackId.includes(piecePos[pos + i]) 
                === true){
                    break;
                }
                if (redId.includes(piecePos[pos + i]) === true){
                    senseBlack(pos, i);
                    break;
                }
            }
            break;
        } else {
            senseBlack(pos, i);
        }
    }
};
sensePB = function(pos){
    positionBoolean =true;
    senseBlack(pos, 9);
    if (pos > 46){
        if (pos%9 !== 0){
            senseBlack(pos, -1);
        }
        if (pos%9 !== 8){
            senseBlack(pos, 1);
        }
    }
};

blackAction = function(){
    let id = blackId[blackEl.indexOf(blackClicked)];
    let pos = piecePos.indexOf(id);
    if (id === "k1"){
        senseKB(pos);
    } else if ( id === "a1" || id === "a2"){
        senseAB(pos);
    } else if ( id === "e1" || id === "e2"){
        senseEB(pos);
    } else if ( id === "h1" || id === "h2"){
        senseHB(pos);
    } else if ( id === "r1" || id === "r2"){
        senseRB(pos);
    } else if ( id === "c1" || id === "c2"){
        senseCB(pos);
    } else if ( id === "p1" || id === "p2"|| id === "p3" || id === "p4" || id === "p5"){
        sensePB(pos);
    }
};
/********* action *********/

dotAction = function(){
    if (turns === "red"){
        let index = redEl.indexOf(redClicked);
        let goTo = dotPos[(dots.indexOf(nowClicked))];
        moveRed(index,goTo);
    } else if (turns === "black") {
        let index = blackEl.indexOf(blackClicked);
        let goTo = dotPos[(dots.indexOf(nowClicked))];
        moveBlack(index,goTo);
    }
};