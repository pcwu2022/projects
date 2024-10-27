// prevent redirect
window.onbeforeunload = function(){
    return 'Are you sure you want to leave?';
};

class Hack {
    /*
        current supporting send types: "get", "post", "form"
        current supporting generate types: 
            "stringX", "numberX", -> string or number of length X
            "phone", "password", "email", "id" -> special formats
            "any" -> as long as it can get
        keys: {
            [key: string]: generate type
        }
    */
    constructor(baseURL, type="get", keys={}, charsMax=1000){
        this.baseURL = baseURL;
        this.type = type;
        if (["get", "post", "form"].indexOf(type) === -1){
            this.type = "get";
        }
        this.keys = keys;
        this.alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        this.num = "0123456789";
        this.chars = "~!@#$%^&*()_+=-[]{}\\|\'\":;?/><,.";
        this.charsMax = charsMax;
    }
    // data generation
    randomChoice(base){
        let index = Math.floor(Math.random()*base.length);
        return base[index];
    }
    stringGen(length){
        let ret = "";
        let base = this.alpha + this.num;
        for (let i = 0; i < length; i++){
            ret += this.randomChoice(base);
        }
        return ret;
    }
    anyGen(length){
        let ret = "";
        let base = this.alpha + this.num + this.chars;
        for (let i = 0; i < length; i++){
            ret += this.randomChoice(base);
        }
        return ret;
    }
    numGen(length){
        let ret = "";
        let base = this.num;
        for (let i = 0; i < length; i++){
            ret += this.randomChoice(base);
        }
        return ret;
    }
    phoneGen(){
        return "09" + this.numGen(8);
    }
    passwordGen(){
        return this.anyGen(this.maxLength);
    }
    emailGen(){
        return this.stringGen(this.charsMax - 10) + "@" + this.stringGen(5) + ".com";
    }
    idGen(){
        return this.numGen(1).toUpperCase() + this.numGen(9);
    }
    // send
    send(defKeys={}){ // defKeys: keys that are defined to be a specific value
        return new Promise((resolve, reject) => {
            let url = new URL(this.baseURL);
            let params = {};
            let sendObj = {};
            for (let key in this.keys){
                if (key in defKeys){
                    sendObj[key] = defKeys[key];
                } else {
                    if (this.keys[key].indexOf("number") !== -1){
                        let type = this.keys[key];
                        sendObj[key] = this.numGen(parseInt(type.slice(6)));
                    } else if (this.keys[key].indexOf("string") !== -1){
                        let type = this.keys[key];
                        sendObj[key] = this.stringGen(parseInt(type.slice(6)));
                    } else if (this.keys[key] === "phone"){
                        sendObj[key] = this.phoneGen();
                    } else if (this.keys[key] === "password"){
                        sendObj[key] = this.passwordGen();
                    } else if (this.keys[key] === "email"){
                        sendObj[key] = this.emailGen();
                    } else if (this.keys[key] === "id"){
                        sendObj[key] = this.idGen();
                    } else {
                        sendObj[key] = this.anyGen(this.maxLength);
                    }
                }
            }
            if (this.type === "form"){
                const formData = new FormData();
                for (let key in sendObj){
                    formData.append(key, sendObj[key]);
                }
                params = {
                    method: "POST",
                    body: formData,
                    mode: 'no-cors'
                }
            } else if (this.type === "post"){
                params = {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(sendObj),
                    mode: 'no-cors'
                }
            } else {
                for (let key in sendObj){
                    url.searchParams.append(key, sendObj[key]);
                }
                params = {
                    method: "GET",
                    mode: 'no-cors'
                }
            }
            fetch(url, params).then(async (data) => {
                let parsed = await data.json();
                resolve(parsed);
            }).catch((err) => {
                reject(err);
            });
        });
    }
    // send large amounts
    sendMulti(amount=20, batch=5, delay=0, defKeys={}){
        return new Promise((resolve, reject) => {
            let errorLogs = [];
            let start = (new Date()).getMilliseconds();
            for (let i = 0; i < batch - 1; i++){
                this.send(defKeys).catch((err) => {
                    errorLogs.push(err);
                });
            }
            this.send(defKeys).then((data) => {
                let end = (new Date()).getMilliseconds();
                console.log(`Batch of ${5} successfully sent in ${end - start} milliseconds.`);
                console.log(errorLogs);
                setTimeout(() => {
                    let newAmount = amount - batch;
                    if (newAmount < 0){
                        console.log("--- Finished ---")
                    } else {
                        this.sendMulti(newAmount, batch, delay, defKeys);
                    }
                }, delay);
            })
        });
    }
}

// const h = new Hack("example.com", type="get", keys={username: "any", password: "password"});
// h.sendMulti();
const h = new Hack("", "form", {}, 1000);