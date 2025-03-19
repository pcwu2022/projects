const gebi = (id) => document.getElementById(id);
const qsa = (selector) => document.querySelectorAll(selector);
const appC = (parent, el) => parent.appendChild(el);
const cre = (tag) => document.createElement(tag);
const crea = (tag, parent = document.body) => appC(parent, cre(tag));