const inputTextDom = document.getElementById("inputText");
const outputTextDom = document.getElementById("outputText");
const directionBtnDom = document.getElementById("direction");

let convertible = false;
let mapping = {};        // Will map Code -> Character (for decoding)
let reverseMapping = {}; // Will map Character -> Code (for encoding)
let direction = false;

// Since python now outputs string codes directly, we can use them as-is.
// mappingRaw format from JSON: { "char": "code" } or { "code": "char" } 
// Let's assume Python output: mapping[prefix] = node.val (Code -> Char)
const genMapping = (mappingRaw) => {
    // mappingRaw is already Code -> Char
    return mappingRaw;
}

const genReverseMapping = (mappingRaw) => {
    const reverseMapping = {};
    for (let code in mappingRaw) {
        let char = mappingRaw[code];
        reverseMapping[char] = code;
    }
    return reverseMapping;
}

fetch('huffman_mapping.json')
    .then(res => res.json())
    .then(data => {
        // data comes in as { "code": "char" } from Python
        mapping = genMapping(data);
        reverseMapping = genReverseMapping(mapping);
        console.log("Mapping (Code -> Char):", mapping);
        console.log("Reverse Mapping (Char -> Code):", reverseMapping);
        convertible = true;
    })
    .catch(err => console.error(err));

directionBtnDom.onclick = e => {
    direction = !direction;
    directionBtnDom.innerHTML = direction ? "Plain Text -> Encoded Text" : "Encoded Text -> Plain Text";
};
directionBtnDom.click();

inputTextDom.oninput = function(e) {
    if (!convertible) return;
    if (direction) {
        // Plain Text -> Encoded Text
        let ret = "";
        for (let ch of e.target.value) {
            if (ch in mapping) {
                ret += mapping[ch];
            } else {
                ret += "[?]"; // Handle characters not present in the Huffman tree
            }
        }
        console.log(ret);
        outputTextDom.innerHTML = ret;
    } else {
        // Encoded Text -> Plain Text
        let ret = "";
        let accum = "";
        for (let ch of e.target.value) {
            accum += ch;
            if (accum in reverseMapping) {
                ret += reverseMapping[accum];
                accum = "";
            }
        }
        if (accum.length > 0) {
            ret += "[Error: Unrecognized code: " + accum + "]";
        }
        console.log(ret);
        outputTextDom.innerHTML = ret;
    }
};