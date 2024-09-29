let my_name = "Me"; // 自己改
let max_len = 1000;
let interval_millis = 500;
let check_millis = 10000;

let chatbox = document.querySelectorAll(".x78zum5.xdt5ytf.x1iyjqo2.xs83m0k.x1xzczws.x6ikm8r.x1rife3k.x1n2onr6.xh8yej3")[1];
let prev_len_10 = chatbox.scrollHeight;
let i_ = 0;

let my_el = document.querySelectorAll('x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.xudqn12.x676frb.x1jchvi3.x1lbecb7.x1s688f.xzsf02u.x1yc453h');
if (my_el === null || my_el.length === 0) {
} else {
  my_name = my_el[0].innerHTML;
}

let sender_name = "Them";
let sender_el = document.querySelectorAll(".x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.xudqn12.x3x7a5m.x1jchvi3.x1lbecb7.x1s688f.xzsf02u.x2b8uid > .x1lliihq.x6ikm8r.x10wlt62.x1n2onr6.xlyipyv.xuxw1ft.x1j85h84");
if (sender_el === null || sender_el.length === 0) {
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

function output() {
  let chats = document.querySelectorAll(".x63ui4o.x18i3tt1.x6ikm8r.x10wlt62 > .x1n2onr6");
  let text = "";
  for (let chat of chats) {
    let textArr = chat.querySelectorAll(".x6prxxf.x1fc57z9.x1yc453h.x126k92a");
    // .x6prxxf.x1fc57z9.x1yc453h.x126k92a.x14ctfv -> me?
    // .x6prxxf.x1fc57z9.x1yc453h.x126k92a.xzsf02u -> them?
    if (textArr === null || textArr.length === 0) {
      continue;
    }
    // output to class Message
    if (textArr[0].classList.contains("x14ctfv")) {
      // me
      messages.push(new Message(my_name, textArr[0]));
    } else {
      // them
      messages.push(new Message(sender_name, textArr[0]));
    }
    // output to .txt
    // change emoji
    let textObj = textArr[0];
    let localText = "";
    for (let child of textObj.childNodes){
      try {
        if (child.classList.contains("x3nfvp2")){
          if (child.childNodes[0].alt !== undefined){
            localText += child.childNodes[0].alt;
          }
          continue;
        }
      } catch {}
      localText += child.textContent;
    }
    
    if (textArr[0].classList.contains("x14ctfv")) {
      // me
      text += my_name + ": " + localText;
    } else {
      // them
      text += sender_name + ": " + localText;
    }
    text += "\n";
  }
  // download txt
  download(my_name + "_" + sender_name + ".txt", text);
  // console.log(text);
  console.log("Outputted file '" + my_name + "_" + sender_name + ".txt'");
}

function fitv() {
  i_++;
  chatbox.scrollTo(0, 0);
  if (i_ > max_len) {
    clearInterval(itv);
    console.log("Haven't reached max length");
  }
  if (i_ % (Math.floor(check_millis / interval_millis)) === 0) {
    if (prev_len_10 === chatbox.scrollHeight) {
      chatbox.scrollTo(0, 0);
      clearInterval(itv);
      output();
    } else {
      prev_len_10 = chatbox.scrollHeight;
    }
  } 
}
let itv = setInterval(fitv, interval_millis);