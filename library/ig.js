let max_len = 1000;
let interval_millis = 200;
let check_millis = 5000;

let chatbox = document.querySelectorAll("._ab5z ")[0];
let prev_len_10 = chatbox.scrollHeight;
let i_ = 0;

let my_name = "Me";
let my_el = document.querySelectorAll("._aacl._aacp._aacw._aacx._aada._aade");
if (my_el === null || my_el.length === 0){
    my_name = "Me";
} else {
    my_name = my_el[0].innerHTML;
}

let sender_name = "Them";
let sender_el = document.querySelectorAll("._ab8w._ab94._ab99._ab9f._ab9k._ab9p._abcm > ._aacl._aacp._aacw._aacx._aada");
if (sender_el === null || sender_el.length === 0){
    sender_name = "Them";
} else {
    sender_name = sender_el[0].innerHTML;
}

let messages = [];
class Message {
    constructor(sender, el) {
        this.sender = sender;
        this.el = el;
        this.text = el.innerHTML;
    };
};

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};

function output(){
    let chats = document.querySelectorAll("._ab9k > ._ac72 > .x78zum5.xdt5ytf > ._acd3 > ._acqt");
    let text = "";
    for (let chat of chats){
        let textArr = chat.querySelectorAll("._aacl._aaco._aacu._aacx._aad6._aade");
        if (textArr === null || textArr.length === 0){
            continue;
        }
        // output to class Message
        if (chat.classList.contains("_acqv")){
            // me
            messages.push(new Message(my_name, textArr[0]));
        } else {
            // them
            messages.push(new Message(sender_name, textArr[0]));
        }
        // output to .txt
        if (chat.classList.contains("_acqv")){
            // me
            text += my_name + ": " + textArr[0].innerHTML;
        } else {
            // them
            text += sender_name + ": " + textArr[0].innerHTML;
        }
        text += "\n";
    }
    // download txt
    download(my_name + "_" + sender_name + ".txt", text);
    console.log("Outputted file '" + my_name + "_" + sender_name + ".txt'");
}

function fitv(){
    i_++;
    chatbox.scrollTo(0, 0);
    if (i_ > max_len){
        clearInterval(itv);
        console.log("Haven't reached max length");
    }
    if (i_%(Math.floor(check_millis/interval_millis)) === 0){
        if (prev_len_10 === chatbox.scrollHeight){
            chatbox.scrollTo(0, 0);
            clearInterval(itv);
            output();
        } else {
            prev_len_10 = chatbox.scrollHeight;
        }
    }
}
let itv = setInterval(fitv, interval_millis);