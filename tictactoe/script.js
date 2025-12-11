'use strict';

const RED = 1;
const BLACK = -1;
const EMPTY = 0;

class Game {
    constructor (size = 3, initGrid = null) {
        if (initGrid === null) initGrid = Array.from({ length: size }, () => Array(size).fill(0)); 
        this.size = size;
        this.grid = initGrid;
        this.maxRedNum = size;
        this.maxBlackNum = size;
        this.currRedNum = 0;
        this.currBlackNum = 0;
        this.win = EMPTY;
    }

    findPieces (color = RED) {
        let pieces = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === color) pieces.push([i, j]);
            }
        }
        return pieces;
    }

    validMoves (player = RED) {
        let fromArr = null;
        if (player === RED) {
            if (this.currRedNum >= this.maxRedNum) fromArr = this.findPieces(RED);
            else fromArr = [null];
        } else {
            if (this.currBlackNum >= this.maxBlackNum) fromArr = this.findPieces(BLACK);
            else fromArr = [null];
        }
        let toArr = this.findPieces(EMPTY);
        return [fromArr, toArr];
    }

    isValidMove (from, to, player = RED) {
        if (player === RED) {
            if (this.currRedNum >= this.maxRedNum) return this.grid[from[0]][from[1]] === RED && this.grid[to[0]][to[1]] === EMPTY;
            else return from === null && this.grid[to[0]][to[1]] === EMPTY; 
        } else {
            if (this.currBlackNum >= this.maxBlackNum) return this.grid[from[0]][from[1]] === BLACK && this.grid[to[0]][to[1]] === EMPTY;
            else return from === null && this.grid[to[0]][to[1]] === EMPTY;  
        }
    }

    move (from, to, player = RED) {
        if (this.win !== EMPTY) return false;
        if (!this.isValidMove(from, to, player)) return false;
        if (from !== null) this.grid[from[0]][from[1]] = EMPTY;
        this.grid[to[0]][to[1]] = player;
        if (from === null) {
            if (player === RED) this.currRedNum += 1;
            else this.currBlackNum += 1;
        }
        this.win = this.detectWin();
        return true;
    }

    detectWin () {
        for (let i = 0; i < this.size; i++) {
            let rowWin = this.grid[i][0];
            if (rowWin === EMPTY) continue;
            for (let j = 1; j < this.size; j++) {
                if (this.grid[i][j] !== rowWin) {
                    rowWin = EMPTY;
                    break;
                }
            }
            if (rowWin !== EMPTY) return rowWin;
        }
        for (let j = 0; j < this.size; j++) {
            let colWin = this.grid[0][j];
            if (colWin === EMPTY) continue;
            for (let i = 1; i < this.size; i++) {
                if (this.grid[i][j] !== colWin) {
                    colWin = EMPTY;
                    break;
                }
            }
            if (colWin !== EMPTY) return colWin;
        }
        let diagWin = this.grid[0][0];
        if (diagWin != EMPTY) {
            for (let i = 1; i < this.size; i++) {
                if (this.grid[i][i] !== diagWin) {
                    diagWin = EMPTY;
                    break;
                }
            }
            if (diagWin !== EMPTY) return diagWin;
        }
        diagWin = this.grid[this.size - 1][0];
        if (diagWin != EMPTY) {
            for (let i = 1; i < this.size; i++) {
                if (this.grid[this.size - 1 - i][i] !== diagWin) {
                    diagWin = EMPTY;
                    break;
                }
            }
            if (diagWin !== EMPTY) return diagWin;
        }
        return EMPTY;
    }

    print () {
        console.log(this.grid);
    }
}

class GameState {
    constructor (hash, player) {
        this.hash = hash;
        this.player = player;
    }
}

class Computer {
    constructor (game, player = RED) {
        this.game = game;
        this.player = player;
        this.cache = {};
        this.GAMMA = 0.9;
        this.REWARDINF = 1000;
    }

    rotateGrid (grid, times = 1) {
        let newGrid = Array.from({ length: this.game.size }, () => Array(this.game.size).fill(0));
        for (let i = 0; i < this.game.size; i++) {
            for (let j = 0; j < this.game.size; j++) {
                if (times === 1) newGrid[j][this.game.size - 1 - i] = grid[i][j];
                else if (times === 2) newGrid[this.game.size - 1 - i][this.game.size - 1 - j] = grid[i][j];
                else if (times === 3) newGrid[this.game.size - 1 - j][i] = grid[i][j];
            }
        }
        return newGrid;
    }

    rotateCoordinates (i, j, times = 1) {
        if (times === 1) return [j, this.game.size - 1 - i];
        if (times === 2) return [this.game.size - 1 - i, this.game.size - 1 - j];
        if (times === 3) return [this.game.size - 1 - j, i];
        return [i, j];
    }

    flipCoordinates (i, j, axis = 0) {
        if (axis === 0) return [this.game.size - 1 - i, j];
        if (axis === 1) return [i, this.game.size - 1 - j];
        return [i, j];
    }

    flipGrid (grid, axis = 0) {
        let newGrid = Array.from({ length: this.game.size }, () => Array(this.game.size).fill(0));
        for (let i = 0; i < this.game.size; i++) {
            for (let j = 0; j < this.game.size; j++) {
                if (axis === 0) newGrid[this.game.size - 1 - i][j] = grid[i][j];
                else newGrid[i][this.game.size - 1 - j] = grid[i][j];
            }
        }
        return newGrid;
    }

    hashGrid (grid) {
        let hash = 0;
        for (let i = 0; i < this.game.size; i++) {
            for (let j = 0; j < this.game.size; j++) {
                hash += (grid[i][j] + 1) * (3 ** (i * this.game.size + j));
            }
        }
        return hash;
    }

    checkIdentical (grid, hash) {
        if (this.hashGrid(grid) === hash) return true;
        for (let t = 1; t <= 3; t++) {
            if (this.hashGrid(this.rotateGrid(grid, t)) === hash) return true;
        }
        for (let a = 0; a <= 1; a++) {
            if (this.hashGrid(this.flipGrid(grid, a)) === hash) return true;
        }
        return false;
    }

    unRotateCached (cached, times) {
        if (!cached || !cached[1]) return cached;
        for (let m = 0; m < cached[1].length; m++) {
            const move = cached[1][m];
            const from = move[0];
            const to = move[1];
            const newFrom = (from === null) ? null : this.rotateCoordinates(from[0], from[1], 4 - times);
            const newTo = (to === null) ? null : this.rotateCoordinates(to[0], to[1], 4 - times);
            cached[1][m] = [newFrom, newTo];
        }
        return cached;
    }

    unFlipCached (cached, axis) {
        if (!cached || !cached[1]) return cached;
        for (let m = 0; m < cached[1].length; m++) {
            const move = cached[1][m];
            const from = move[0];
            const to = move[1];
            const newFrom = (from === null) ? null : this.flipCoordinates(from[0], from[1], axis);
            const newTo = (to === null) ? null : this.flipCoordinates(to[0], to[1], axis);
            cached[1][m] = [newFrom, newTo];
        }
        return cached;
    }

    searchCache (grid) {
        // console.log("Searching Cache:", grid);
        let hash = this.hashGrid(grid);
        if (hash in this.cache) return this.cache[hash];
        for (let t = 1; t <= 3; t++) {
            hash = this.hashGrid(this.rotateGrid(grid, t))
            if (hash in this.cache) return this.unRotateCached(this.cache[hash], t);
        }
        for (let a = 0; a <= 1; a++) {
            hash = this.hashGrid(this.flipGrid(grid, a));
            if (hash in this.cache) return this.unFlipCached(this.cache[hash], a);
        }
        return null;
    }

    miniMaxRecursive (state, path) {
        console.log("\nPath:", path);

        let validMoves = this.game.validMoves(state.player);
        let bestMoveSequence = [];
        let localReward = 0; // no reward for each step
        // For the maximizing player initialize to very small, for minimizing initialize to very large
        let bestReward = (state.player === this.player) ? (0 - this.REWARDINF) : this.REWARDINF;
        let winFound = false;
        for (let from of validMoves[0]) {
            for (let to of validMoves[1]) {
                let gridSave = structuredClone(this.game.grid);

                console.log(`Test Move: ${(this.player === state.player) ? "(MAX)" : "(MIN)"}`, from, to);
                this.game.move(from, to, state.player);

                let nextHash = this.hashGrid(this.game.grid);
                if (nextHash in path) {
                    this.game.grid = gridSave;
                    console.log("Move in path. Trying next move...")
                    continue;
                }

                if (this.game.win === state.player) { 
                    // someone wins
                    if (state.player === this.player) bestReward = this.REWARDINF;
                    else bestReward = 0 - this.REWARDINF;
                    bestMoveSequence = [[from, to]]; // the last move
                    console.log(`Player ${state.player} WINS!`);
                    winFound = true;
                    this.game.grid = gridSave;
                    break;
                } else {
                    let cachedInfo = this.searchCache(this.game.grid);
                    if (cachedInfo === null) {
                        // newly discovered state
                        let nextPlayer = (state.player === RED) ? BLACK : RED;
                        let [reward, moveSequence] = this.miniMaxRecursive(new GameState(nextHash, nextPlayer), [...path, nextHash]);
                        console.log("Move Sequence:", moveSequence);
                        if (this.player === state.player) {
                            // maximize reward
                            if (reward > bestReward) {
                                bestReward = reward;
                                bestMoveSequence = [[from, to], ...moveSequence];
                                console.log("New Best Move Sequence: ", bestMoveSequence);
                            }
                        } else {
                            // minimize reward
                            if (reward < bestReward) {
                                bestReward = reward;
                                bestMoveSequence = [[from, to], ...moveSequence];
                                console.log("New Best Move Sequence: ", bestMoveSequence);
                            }
                        }
                    } else {
                        // cached state (maybe flipped or rotated)
                        let reward = cachedInfo[0];
                        console.log("Cached! ", JSON.stringify(cachedInfo));
                        if (this.player === state.player) {
                            // maximize reward
                            if (reward > bestReward) {
                                bestReward = reward;
                                bestMoveSequence = [[from, to], ...cachedInfo[1]];
                                console.log("New Best Move Sequence: ", bestMoveSequence);
                            }
                        } else {
                            // minimize reward
                            if (reward < bestReward) {
                                bestReward = reward;
                                bestMoveSequence = [[from, to], ...cachedInfo[1]];
                                console.log("New Best Move Sequence: ", bestMoveSequence);
                            }
                        }
                    }
                }
                this.game.grid = gridSave;
            }
            if (winFound) break;
        }
        
        this.cache[state.hash] = [localReward + this.GAMMA * bestReward, bestMoveSequence];
        console.log("Return:");
        console.log(JSON.stringify(this.cache[state.hash]));
        return this.cache[state.hash];
    }

    miniMax () {
        let initHash = this.hashGrid(this.game.grid);
        this.cache = {}; // clear cache (maybe not needed)
        let [reward, moveSequence] = this.miniMaxRecursive(new GameState(initHash, this.player), [initHash]);
        return moveSequence;
    }

    move () {
        let moveSequence = this.miniMax();
        let move = moveSequence[0];
        this.game.move(move[0], move[1], this.player);
    }

}

/** Testing **/

const G = new Game(3);
const CR = new Computer(G, RED);
const CB = new Computer(G, BLACK);
let player = RED;
while (G.win === EMPTY) {
    let moveSequence = CR.miniMax();
    console.log(moveSequence);
    for (let move of moveSequence) {
        console.log(`Player ${player} moved ${((move[0] === null) ? "" : "from " + move[0] + " ")}to ${move[1]}`);
        G.move(move[0], move[1], player);
        player = 0 - player;
    }
    break;
    // CB.miniMax();
}

// let player = RED;
// for (let i = 0; i < 100; i++) {
//     let validMoves = G.validMoves(player);
//     let fromIndex = Math.floor(Math.random() * validMoves[0].length);
//     let toIndex = Math.floor(Math.random() * validMoves[1].length);
//     let move = [validMoves[0][fromIndex], validMoves[1][toIndex]];
//     G.move(move[0], move[1], player);
//     console.log(`Player ${player} moved ${((move[0] === null) ? "" : "from " + move[0] + " ")}to ${move[1]}`);
//     G.print();
//     console.log(C.hashGrid(G.grid));
//     if (G.win !== EMPTY) {
//         console.log(`Player ${player} WON!`);
//         break;
//     }
//     player = (player === RED) ? BLACK : RED;
// }