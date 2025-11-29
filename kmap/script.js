function findImplicants(implicants, power, domain = 0) {
    if (implicants.length === 0) {
        return;
    }
    let newImplicants = [];
    let usedImplicants = {};
    for (let i = 0; i < power; i++) {
        newImplicants.push([]);
    }
    for (let i = 0; i < implicants.length; i++) {
        for (let j = 0; j < i; j++) {
            let a = implicants[i];
            let b = implicants[j];
            let c = Math.floor(a / ((a ^ b) * 2)) * (a ^ b) + a % (a ^ b);
            let d = a ^ b; //domain
            if (Math.log2(d) === Math.round(Math.log2(d))) {
                newImplicants[Math.log2(d)].push(c);
                usedImplicants[a] = true;
                usedImplicants[b] = true;
            }
        }
    }
    let returnImplicants = [];
    for (let i = 0; i < power; i++) {
        // recursion
        if (newImplicants[i].length === 0) {
            continue;
        }
        let foundImplicants = findImplicants(newImplicants[i], power - 1, i);
        let isEmpty = true;
        for (let j = 0; j < foundImplicants.length; j++) {
            if (foundImplicants[j].length !== 0) {
                isEmpty = false;
                let modifiedJ = [];
                for (let k = 0; k < foundImplicants[j].length; k++) {
                    let a = foundImplicants[j][k];
                    // two cases: 0 or 1
                    modifiedJ.push(((((a >> i) << 1) + 0) << i) + a % (2 ** i));
                    modifiedJ.push(((((a >> i) << 1) + 1) << i) + a % (2 ** i));
                }
                foundImplicants[j] = modifiedJ;
            }
        }
        if (isEmpty) {
            // no higher-leveled pis
            returnImplicants.push(newImplicants[i]);
        } else {
            returnImplicants.push(...foundImplicants);
        }
    }

    for (let i = 0; i < implicants.length; i++) {
        if (usedImplicants[implicants[i]] === true) {
            continue;
        }
        returnImplicants.push([implicants[i]]);
    }

    let sortDict = {};
    for (let i = 0; i < returnImplicants.length; i++) {
        returnImplicants[i].sort();
        sortDict[JSON.stringify(returnImplicants[i])] = true;
    }
    returnImplicants = [];
    for (let key in sortDict) {
        returnImplicants.push(JSON.parse(key));
    }

    return returnImplicants;
};

// UI glue: attach form handler and display results
document.addEventListener('DOMContentLoaded', () => {
    const powerInput = document.getElementById('power');
    const mintermsInput = document.getElementById('minterms');
    const form = document.getElementById('kmap-form');
    const resultEl = document.getElementById('result');

    if (!form || !powerInput || !mintermsInput || !resultEl) {
        return;
    }

    form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        resultEl.textContent = '';
        const powerVal = parseInt(powerInput.value);
        if (!Number.isInteger(powerVal) || powerVal <= 0) {
            resultEl.innerHTML = '<span class="error">Please enter a valid positive integer for variables.</span>';
            return;
        }

        try {
            const ipc = JSON.parse('[' + mintermsInput.value + ']');
            const imp = findImplicants(ipc, powerVal);
            resultEl.innerHTML = `<strong>Solution to σ-m( ${mintermsInput.value} ):</strong><pre>${JSON.stringify(imp, null, 2)}</pre>`;
        } catch (err) {
            resultEl.innerHTML = `<span class="error">${String(err)}</span>`;
        }
    });
});
