let speed = 0.4;

/********* judge *********/
let changePlayerF = function(){
    if (finishBoolean === true){
        turns = undefined;
    }
    if (turns === "red"){
        turns = "black";
        judge("黑方請走子");
        if (level !== 3){
            delay(computer,speed);
        }
    } else if (turns === "black"){
        turns = "red";
        judge("紅方請走子");
    }
};

let changePlayer = function(){
    delay(changePlayerF,speed);
};
changePlayerF();

/********* computer *********/
let depthLimit = 3;
let alphaList = [Infinity];

//debug
let debug_tree = {"num":0,"next":{}};
let debug_el = debug_tree.next;
let final_leaf_num = 0;
let moveList = [];

let depthFirst = function(minMax, depth){
    if (depth > depthLimit){
        final_leaf_num++;
        return minMax + Math.floor(Math.random()*50)/10;
    }
    if (depth%2 === 1){
        alphaList[depth] = 0-Infinity;
        if (depth === 1){
            moveList = [];    
        }
        let maxList = [];
        //sense black
        for (let k = 0; k < blackId.length; k++){
            let i = (k + 5)%blackId.length;
            
            let id = blackId[i];
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
            let dotLocal = dotPos;//save position
            clearDots();
            for (let j = 0; j < dotLocal.length; j++){
                //test red
                let redLocal = piecePos[dotLocal[j]];
                let minMaxPlus = 0;
                if (redLocal === "K1"){
                    minMaxPlus = 120;
                } else if (redLocal === "R1" || redLocal === "R2"){
                    minMaxPlus = 100;
                } else if (redLocal === "C1" || redLocal === "C2"){
                    minMaxPlus = 80;
                } else if (redLocal === "H1" || redLocal === "H2"){
                    minMaxPlus = 60;
                } else if (redLocal === "E1" || redLocal === "E2" || redLocal === "A1" || redLocal === "A2"){
                    minMaxPlus = 20;
                } else if (redLocal === "P1" || redLocal === "P2" || redLocal === "P4" || redLocal === "P5"){
                    minMaxPlus = 10;
                } else if (redLocal === "P3"){
                    minMaxPlus = 40;
                } else {
                }
                minMaxPlus += 0 - blackMoved[i];
                if (depth === 1){
                    moveList.push([i, dotLocal[j]]);
                }
                minMax += minMaxPlus;
                piecePos[dotLocal[j]] = blackId[i];
                piecePos[pos] = null;
                //recursion
                let prev_debug_el = debug_el;
                debug_el[blackId[i]+dotLocal[j]] = {"num":minMax,"next":{}};
                debug_el = debug_el[blackId[i]+dotLocal[j]].next;

                maxList.push(depthFirst(minMax, depth + 1));

                debug_el = prev_debug_el;
                debug_el[blackId[i]+dotLocal[j]].final = maxList[maxList.length-1];
                //debug_el[blackId[i]+dotLocal[j]].alpha = alphaList[depth-1];
                //debug_el[blackId[i]+dotLocal[j]].depth = depth;

                alphaList[depth] = Math.max(...maxList);
                piecePos[dotLocal[j]] = redLocal;
                piecePos[pos] = blackId[i];
                minMax -= minMaxPlus;
                //cut
                if ((alphaList[depth-1] < maxList[maxList.length-1]) && (maxList.length === 1)){
                    return maxList[maxList.length-1];
                }
            }
        }
        if (depth === 1){
            if ( Math.max(...maxList) < -8000){
                judge("倒棋！紅方獲勝！");
                throw new Error("RED WIN!!!");
                return "RED WIN";
            }
            debug_tree.final = Math.max(...maxList);
            moveBlack(...moveList[maxList.indexOf(Math.max(...maxList))]);
        }
        return Math.max(...maxList);
    } else {
        alphaList[depth] = Infinity;
        let minList = [];
        //sense red
        for (let k = 0; k < redId.length; k++){
            let i = (k + 5)%redId.length;

            let id = redId[i];
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
            let dotLocal = dotPos;//save position
            clearDots();
            for (let j = 0; j < dotLocal.length; j++){
                //test black
                let blackLocal = piecePos[dotLocal[j]];
                let minMaxPlus = 0;
                if (blackLocal === "k1"){
                    minMaxPlus = -10000;
                } else if (blackLocal === "r1" || blackLocal === "r2"){
                    minMaxPlus = -100;
                } else if (blackLocal === "c1" || blackLocal === "c2"){
                    minMaxPlus = -80;
                } else if (blackLocal === "h1" || blackLocal === "h2"){
                    minMaxPlus = -60;
                } else if (blackLocal === "e1" || blackLocal === "e2" || blackLocal === "a1" || blackLocal === "a2"){
                    minMaxPlus = -20;
                } else if (blackLocal === "p1" || blackLocal === "p2" || blackLocal === "p4" || blackLocal === "p5"){
                    minMaxPlus = -10;
                } else if (blackLocal === "p3"){
                    minMaxPlus = -40;
                } else {
                }
                minMaxPlus += redMoved[i];
                minMax += minMaxPlus;
                piecePos[dotLocal[j]] = redId[i];
                piecePos[pos] = null;
                //recursion
                let prev_debug_el = debug_el;
                debug_el[redId[i]+dotLocal[j]] = {"num":minMax,"next":{}};
                debug_el = debug_el[redId[i]+dotLocal[j]].next;

                minList.push(depthFirst(minMax, depth + 1));

                debug_el = prev_debug_el;
                debug_el[redId[i]+dotLocal[j]].final = minList[minList.length - 1];
                //debug_el[redId[i]+dotLocal[j]].alpha = alphaList[depth-1];
                //debug_el[redId[i]+dotLocal[j]].depth = depth;

                alphaList[depth] = Math.min(...minList);
                piecePos[dotLocal[j]] = blackLocal;
                piecePos[pos] = redId[i];
                minMax -= minMaxPlus;
                //cut
                if ((alphaList[depth-1] > minList[minList.length-1]) && (minList.length === 1)){
                    return minList[minList.length-1];
                }
            }
        }
        return Math.min(...minList);
    }
};
let computer = function(){
    debug_tree = {"num":0,"next":{}};
    debug_el = debug_tree.next;
    final_leaf_num = 0;
    // console.log("comp!");
    alphaList = [Infinity];
    depthFirst(0, 1);
    // console.log(debug_tree);
    // console.log(final_leaf_num);
};
