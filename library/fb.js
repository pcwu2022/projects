let my_name = "Me"; // 自己改
let max_len = 1000;
let interval_millis = 500;
let check_millis = 10000;

let chatbox = document.querySelector("div > div > div:nth-child(1) > div > div.x9f619.x1n2onr6.x1ja2u2z > div > div > div.x78zum5.xdt5ytf.x1t2pt76.x1n2onr6.x1ja2u2z.x10cihs4 > div.x9f619.x2lah0s.x1nhvcw1.x1qjc9v5.xozqiw3.x1q0g3np.x78zum5.x1iyjqo2.x1t2pt76.x1n2onr6.x1ja2u2z > div.x9f619.x1n2onr6.x1ja2u2z.xdt5ytf.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k.x78zum5.x1t2pt76 > div > div > div > div.x1ja2u2z.x9f619.x78zum5.xdt5ytf.x193iq5w.x1l7klhg.x1iyjqo2.xs83m0k.x2lwn1j.xcrg951.x6prxxf.x85a59c.x6ikm8r.x10wlt62.x1n2onr6 > div > div > div > div > div > div.x78zum5.xdt5ytf.x1iyjqo2.xs83m0k.x1n2onr6 > div > div > div > div.x78zum5.xdt5ytf.x1iyjqo2 > div > div > div > div > div > div > div.x78zum5.xdt5ytf.x1iyjqo2.x6ikm8r.x1odjw0f.x16o0dkt");
let prev_len_10 = chatbox.scrollHeight;
let i_ = 0;

let sender_name = "Them";
let sender_el = document.querySelector("div > div > div:nth-child(1) > div > div.x9f619.x1n2onr6.x1ja2u2z > div > div > div.x78zum5.xdt5ytf.x1t2pt76.x1n2onr6.x1ja2u2z.x10cihs4 > div.x9f619.x2lah0s.x1nhvcw1.x1qjc9v5.xozqiw3.x1q0g3np.x78zum5.x1iyjqo2.x1t2pt76.x1n2onr6.x1ja2u2z > div.x9f619.x1n2onr6.x1ja2u2z.xdt5ytf.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k.x78zum5.x1t2pt76 > div > div > div > div.x1ja2u2z.x9f619.x78zum5.xdt5ytf.x193iq5w.x1l7klhg.x1iyjqo2.xs83m0k.x2lwn1j.xcrg951.x6prxxf.x85a59c.x6ikm8r.x10wlt62.x1n2onr6 > div > div > div > div > div > div.xfpmyvw.x1u998qt.x1vjfegm > div:nth-child(1) > div > div > div.x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k.xsyo7zv.x16hj40l > div > div > div > a > div.x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x2lah0s.x193iq5w.xeuugli.xsyo7zv.x16hj40l.x10b6aqq.x1yrsyyn > div > div.x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x193iq5w.xeuugli.x1r8uery.xs83m0k.xsyo7zv.x10b6aqq.x1yrsyyn.x1iyjqo2.x1h0ha7o > div > div:nth-child(1) > h2 > span > span > span > span");
if (sender_el === null) {
  sender_name = "Them";
} else {
  sender_name = sender_el.innerHTML;
}

let messages = [];
let textList = [];
class Message {
  constructor(sender, text) {
    this.sender = sender;
    this.text = text;
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

function scrape() {
  let chats = document.querySelector("div > div > div:nth-child(1) > div > div.x9f619.x1n2onr6.x1ja2u2z > div > div > div.x78zum5.xdt5ytf.x1t2pt76.x1n2onr6.x1ja2u2z.x10cihs4 > div.x9f619.x2lah0s.x1nhvcw1.x1qjc9v5.xozqiw3.x1q0g3np.x78zum5.x1iyjqo2.x1t2pt76.x1n2onr6.x1ja2u2z > div.x9f619.x1n2onr6.x1ja2u2z.xdt5ytf.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k.x78zum5.x1t2pt76 > div > div > div > div.x1ja2u2z.x9f619.x78zum5.xdt5ytf.x193iq5w.x1l7klhg.x1iyjqo2.xs83m0k.x2lwn1j.xcrg951.x6prxxf.x85a59c.x6ikm8r.x10wlt62.x1n2onr6 > div > div > div > div > div > div.x78zum5.xdt5ytf.x1iyjqo2.xs83m0k.x1n2onr6 > div > div > div > div.x78zum5.xdt5ytf.x1iyjqo2 > div > div > div > div > div > div > div.x78zum5.xdt5ytf.x1iyjqo2.x6ikm8r.x1odjw0f.x16o0dkt > div").childNodes;
  let text = "";
  for (let i = chats.length - 1; i >= 0; i--) {
    let chat = chats[i];
    let textArr = chat.querySelectorAll("div.html-div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x6ikm8r.x10wlt62 > div > span > div");
    if (textArr === null || textArr.length === 0) {
      continue;
    }
    
    // output to .txt
    // change emoji
    let textObj = textArr[0];
    let localText = JSON.parse(JSON.stringify(textObj.innerHTML));
    localSplit = localText.split("<");
    localText = localSplit[0];
    if (localSplit.length > 1){
      for (let i = 1; i < localSplit.length; i++){
        let tuple = localSplit[i].split(">");
        if (tuple.length > 1){
          localText += tuple[1];
        }
      }
    }
    // for (let child of textObj.childNodes){
    //   try {
    //     if (child.classList.contains("xz74otr")){
    //       if (child.childNodes[0].alt !== undefined){
    //         localText += child.childNodes[0].alt;
    //       }
    //       continue;
    //     }
    //   } catch {}
    //   localText += child.textContent;
    // }

    // output to class Message
    if (localText in textList){
      continue;
    }
    textList.push(localText);
    if (textArr[0].closest(".xuk3077")) {
      // me
      messages.unshift(new Message(my_name, localText));
    } else {
      // them
      messages.unshift(new Message(sender_name, localText));
    }
    
    // if (textArr[0].closest(".xuk3077")) {
    //   // me
    //   text += my_name + ": " + localText;
    // } else {
    //   // them
    //   text += sender_name + ": " + localText;
    // }
    // text += "\n";
  }
  
}

function output(){
  let text = "";
  for (let message of messages){
    text += message.sender + ": " + message.text + "\n";
  }
  download(my_name + "_" + sender_name + ".txt", text);
  console.log("Outputted file '" + my_name + "_" + sender_name + ".txt'");
};

function fitv() {
  i_++;
  chatbox.scrollTo(0, 0);
  if (i_ > max_len) {
    clearInterval(itv);
    console.log("Haven't reached max length");
    output();
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
  scrape();
}
let itv = setInterval(fitv, interval_millis);