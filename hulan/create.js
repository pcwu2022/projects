let ipt = document.getElementById("ipt");
let mdv = document.getElementById("mainText");
let sub = document.getElementById("submit");
let iv = ipt.value;
let n = [];//save things
let a;//save numbers
let b;//save numbers
let c;//save numbers
let d;//save numbers
let e;//save numbers
let par = [];
let ps = -1;
let keyL = true;
let usedIndexArr = [];
let usedIndexArrB = [];

let randomNum = function(max){
    return Math.floor(Math.random()*max);
}; 
let lowerCase = function(obj){
    return obj.charAt(0).toLowerCase() + obj.slice(1);
};
let upperCase = function(obj){
    return obj.charAt(0).toUpperCase() + obj.slice(1);
};
let contains = function(word, arr){
    word = lowerCase(word);
    let ret = -1;
    while (ret == -1){
        for (let i = 0; i < arr.length; i++){
            if (arr[i].indexOf(word) != -1){
                if (usedIndexArr.indexOf(i) !== -1){
                        continue;
                    } else {
                        usedIndexArr.push(i);
                    }
                    return i;
            }
        }
        //cut the word to fit the search
        if (word[word.length-1] == " "){
            word = word.substr(1);
        } else if (word[0] == " "){
            word = word.substr(0, word.length-1);
        } else if (randomNum(5) > 3){
            word = word.substr(1);
        } else {
            word = word.substr(0, word.length-1);
        }
    }
    return ret;
}
let contains2D = function(word, arr){
    word = lowerCase(word);
    let ret = -1;
    while (ret == -1){
        for (let i = 0; i < arr.length; i++){
            for (let j = 0; j < arr[i].length; j++){
                if (arr[i][j].indexOf(word) != -1){
                    if (randomNum(8) > 3){
                        if (usedIndexArr.indexOf(i) !== -1){
                            continue;
                        } else {
                            usedIndexArr.push(i);
                        }
                        return i;
                    }
                }
            }
                
        }
        console.log(word);
        //cut the word to fit the search
        if (word[word.length-1] == " "){
            word = word.substr(1);
        } else if (word[0] == " "){
            word = word.substr(0, word.length-1);
        } else if (randomNum(5) > 3){
            word = word.substr(1);
        } else {
            word = word.substr(0, word.length-1);
        }
    }
    return ret;
}

let createQuote = function(){
    //a = randomNum(quote1[0].length);
    a = contains(iv, quote1[0]);
    n[0] = quote1[0][a];
    n[1] = quote1[1][a];
    b = randomNum(6);
    if ( b === 0){
        return (' ' + n[1] + ' once said, "' + n[0] + '."');
    } else if ( b === 1){
        return (' As the saying goes, "' + n[0] + '."');
    } else if ( b === 2){
        return (' "' + n[0] + '" says ' + n[1] + '.');
    } else if ( b === 3){
        return (' ' + n[1] + ' claimed, ' + lowerCase(n[0])    + '.');
    } else if ( b === 4){
        return (' As ' + n[1] + ' points out, ' + lowerCase(n[0]) + '.');
    } else {
        return (' People always say, "' + n[0] + '."');
    }
};
let afterQuote = function(){
    //a = randomNum(sen2.length);
    a = contains(iv, sen2);
    b = randomNum(conj1.length);
    n[0] = sen2[a];
    n[1] = conj1[b] + ", ";
    
    return (" " + n[0] + ".");
};
let addKeyword = function(){
    //a = randomNum(sen1.length);
    a = contains2D(iv, sen1);
    n[0] = sen1[a][0];
    n[1] = sen1[a][1];
    if (n[1][0] === "," || n[1][0] === "."){
        if (n[0] === ""){
            return (" " + upperCase(iv) + n[1]    + ".");
        }
        return (" " + n[0] + " " + iv + n[1]    + ".");
    } else {
        if (n[0] === ""){
            return (" " + upperCase(iv) + " " + n[1]    + ".");
        }
        if (n[1] === ""){
            return (" " + n[0] + " " + iv + ".");
        }
        return (" " + n[0] + " " + iv + " " + n[1]    + ".");
    }
};
//未完成
let addStart = function(){
    a = randomNum(sen1.length);
    n[0] = sen1[a][0];
    n[1] = sen1[a][1];
    n[2] = conj6[randomNum(conj6.length)];
    if (n[1][0] === "," || n[1][0] === "."){
        if (n[2] === ""){
            return (" " + upperCase(n[0]) + " " + iv + n[1]    + ".");
        }
        return (" " + upperCase(n[2])+ ", " + lowerCase(n[0]) + " " + iv + n[1]    + ".");
    } else {
        if (n[2] === ""){
            return (" " + upperCase(n[0]) + " " + iv + " " + n[1]    + ".");
        }
        if (n[1] === ""){
            return (" " + upperCase(n[2])+ ", " + n[0] + " " + iv + ".");
        }
        return (" " + upperCase(n[2])+ ", " + lowerCase(n[0]) + " " + iv + " " + n[1]    + ".");
    }
    
};
let pureBullshit = function(){
    //a = randomNum(sen3.length);
    a = contains(iv, sen3);
    b = randomNum(conj1.length);
    n[0] = sen3[a];
    n[1] = conj1[b];
    return (" " + n[1] + ", " + lowerCase(n[0]) + ".");
};
let conclusion = function(){
    a = randomNum(sen4.length);
    b = randomNum(conj4.length);
    n[0] = lowerCase(sen4[a][0]);
    n[1] = sen4[a][1];
    n[2] = conj4[b];
    if (n[1][0] === "," || n[1][0] === "."){
        return (" " + n[2] + ", " + n[0] + " " + iv + n[1]    + ".");
    } else {
        if (n[1] === ""){
            return (" " + n[2] + ", " + n[0] + " " + iv + ".");
        }
        return (" " + n[2] + ", " + n[0] + " " + iv + " " + n[1]    + ".");
    }
    
};
let title_ = function(){
    a = randomNum(title1.length);
    return( "<h4>" + title1[a] + " " + upperCase(iv) + "</h4>" );
};

let tab_ = function(){
    par[ps].innerHTML += "&nbsp&nbsp&nbsp&nbsp";
};
let createP = function(){
    ps++;
    par[ps] = document.createElement("p");
    mdv.appendChild(par[ps]);
};

let createHulan = function(){
    
    iv = ipt.value;
    usedIndexArr = [];
    if (keyL === false){
        mdv.innerHTML = "";
        keyL = true;
    }
    createP();
    
    par[ps].innerHTML += title_();
    tab_();
    if (randomNum(2) === 0){
        par[ps].innerHTML += addStart();
    } else {
        par[ps].innerHTML += createQuote();
        par[ps].innerHTML += afterQuote();
        par[ps].innerHTML += addKeyword();
    }
    if (randomNum(3) === 0){
        par[ps].innerHTML += pureBullshit();
        par[ps].innerHTML += addKeyword();
        par[ps].innerHTML += pureBullshit();
        par[ps].innerHTML += addKeyword();
    }
    par[ps].innerHTML += pureBullshit();
    par[ps].innerHTML += addKeyword();
    par[ps].innerHTML += pureBullshit();
    par[ps].innerHTML += addKeyword();
    par[ps].innerHTML += pureBullshit();
    par[ps].innerHTML += conclusion();
    if (iv === ""){
        mdv.innerHTML = "Type in a keyword first";
        keyL = false;
    }
    mdv.innerHTML += "<br>";
};
sub.addEventListener("click", createHulan);
document.body.addEventListener("keypress", function(e){
    if (e.key === "Enter"){
        createHulan();
    }
});