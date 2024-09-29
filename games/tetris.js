'use strict';

function Block(type, i, j, boxSize, marginSize, xTranslate, yTranslate) {
    // const
    const Empty = 0;
    const Hidden = -1;

    // colors
    this.colors = [
        [0, 0, 0],
        [255, 255, 255],
        [100, 100, 100],
        [255, 0, 0],
        [0, 255, 0],
        [0, 0, 255],
        [255, 255, 0],
        [255, 0, 255],
        [0, 255, 255]
    ];

    // attributes
    this.type = type;
    this.i = i;
    this.j = j;
    this.boxSize = boxSize;
    this.el = rect(marginSize + xTranslate + this.j * this.boxSize, marginSize + yTranslate + this.i * this.boxSize, this.boxSize, this.boxSize);

    // methods
    this.setType = (type) => {
        this.type = type;
        this.el.style.backgroundColor = `rgb(${this.colors[this.type][0]},${this.colors[this.type][1]},${this.colors[this.type][2]})`;
    }
    return this;
};

function Game(gridI, gridJ, boxSize = 20, marginSize = 40, xTranslate = 0, yTranslate = 0) {
    // const
    const Empty = 0;
    const Hidden = -1;

    // colors
    this.colors = [
        [0, 0, 0],
        [255, 255, 255],
        [100, 100, 100],
        [255, 0, 0],
        [0, 255, 0],
        [0, 0, 255],
        [255, 255, 0],
        [255, 0, 255],
        [0, 255, 255]
    ];

    // bricks
    this.bricks = [
        [[0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]],
        [[0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]],
        [[0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0]],
        [[0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0]],

        [[0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]],
        [[0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]],
        [[0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]],
        [[0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]],

        [[0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0]],
        [[0, 0, 0, 0],
        [0, 1, 1, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 0]],
        [[0, 0, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 1, 1, 0]],
        [[0, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0]],

        [[0, 0, 0, 0],
        [0, 0, 1, 1],
        [0, 1, 1, 0],
        [0, 0, 0, 0]],
        [[0, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 1, 0]],
        [[0, 0, 0, 0],
        [0, 1, 1, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0]],
        [[0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 0]],

        [[0, 0, 0, 0],
        [1, 0, 1, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0]],
        [[0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]],
        [[0, 0, 0, 0],
        [0, 1, 1, 1],
        [0, 1, 0, 1],
        [0, 0, 0, 0]],
        [[0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 1, 1, 0]]
    ]

    // attributes
    this.run = true;
    this.grid = [];
    this.gridI = gridI;
    this.gridJ = gridJ;
    this.boxSize = boxSize;
    this.marginSize = marginSize;
    this.xTranslate = xTranslate;
    this.yTranslate = yTranslate;
    this.interval = 500;
    this.time = 0;
    this.runTimes = 0;
    this.el = rect(this.xTranslate, this.yTranslate, this.gridJ * this.boxSize + this.marginSize * 2, this.gridI * this.boxSize + this.marginSize * 2)

    // brick attributes
    this.hasBrick = false;
    this.brickType = 0;
    this.brick = [[]];
    this.brickI = 0;
    this.brickJ = -4;

    // create boxes
    strokeWeight(2);
    stroke(...this.colors[2]);
    fill(...this.colors[0]);
    for (let i = 0; i < this.gridI; i++) {
        this.grid.push([]);
        for (let j = 0; j < this.gridJ; j++) {
            this.grid[i].push(new Block(Empty, i, j, this.boxSize, this.marginSize, this.xTranslate, this.yTranslate));
        }
    }

    // event handlers
    const handleUp = () => {

    };
    const handleDown = () => {

    };
    const handleLeft = () => {
        this.brickLeft();
    };
    const handleRight = () => {
        this.brickRight();
    };

    window.addEventListener("keydown", function(e) {
        if (e.key === "ArrowUp") {
            handleUp();
        } else if (e.key === "ArrowDown") {
            handleDown();
        } else if (e.key === "ArrowLeft") {
            handleLeft();
        } else if (e.key === "ArrowRight") {
            handleRight();
        }
    });

    // methods
    this.generateBrick = (index) => {
        this.brick = this.bricks[index * 4 + Math.floor(Math.random() * 4)];
        this.brickI = -4;
        this.brickJ = Math.floor(Math.random() * (this.gridJ - 3));
    };

    this.brickFall = () => {
        let crash = false;
        // detect if it is at the bottom
        for (let i = 0; i < 4; i++) {
            let detectI = i + this.brickI + 1;
            if (detectI < 0) {
                continue;
            }
            if (detectI >= gridI) {
                for (let j = 0; j < 4; j++) {
                    if (this.brick[i][j] != 0) {
                        crash = true;
                    }
                }
                continue;
            }
            for (let j = 0; j < 4; j++) {
                let detectJ = j + this.brickJ;
                if (detectJ >= gridJ || detectJ < 0) {
                    continue;
                }
                if (this.grid[detectI][detectJ].type !== 0) {
                    if (this.brick[i][j] !== 0) {
                        if (i != 3) {
                            if (this.brick[i + 1][j] === 0) {
                                crash = true;
                            }
                        } else {
                            crash = true;
                        }
                    }
                }
            }
        }


        if (crash) {
            this.hasBrick = false;
        } else {
            // update
            for (let i = 0; i < 5; i++) {
                let changeI = i + this.brickI;
                if (changeI < 0 || changeI >= this.gridI) {
                    continue;
                }
                for (let j = 0; j < 4; j++) {
                    let changeJ = j + this.brickJ;
                    if (changeJ < 0 || changeJ >= this.gridJ) {
                        continue;
                    }
                    if (i === 0) {
                        if (this.brick[i][j] !== 0) {
                            this.grid[changeI][changeJ].setType(0);
                        }
                    } else {
                        if (this.brick[i - 1][j] !== 0) {
                            this.grid[changeI][changeJ].setType(this.brickType);
                        } else {
                            if (i === 4) {

                            } else if (this.brick[i][j] !== 0) {
                                this.grid[changeI][changeJ].setType(0);
                            }
                        }
                    }
                }
            }
            this.brickI += 1;
        }
    };

    this.brickLeft = () => {
        let crash = false;
        // detect if it is at the bottom
        for (let i = 0; i < 4; i++) {
            let detectI = i + this.brickI;
            if (detectI < 0 || detectI >= gridI) {
                continue;
            }
            for (let j = 0; j < 4; j++) {
                let detectJ = j + this.brickJ - 1;
                if (detectJ < 0) {
                    if (this.brick[i][j] != 0) {
                        crash = true;
                    }
                    continue;
                }
                if (detectJ >= gridJ) {
                    continue;
                }
                if (this.grid[detectI][detectJ].type !== 0) {
                    if (this.brick[i][j] !== 0) {
                        if (j != 0) {
                            if (this.brick[i][j - 1] === 0) {
                                crash = true;
                            }
                        } else {
                            crash = true;
                        }
                    }
                }
            }
        }

        if (!crash) {
            // update
            for (let i = 0; i < 4; i++) {
                let changeI = i + this.brickI;
                if (changeI < 0 || changeI >= this.gridI) {
                    continue;
                }
                for (let j = -1; j < 4; j++) {
                    let changeJ = j + this.brickJ;
                    if (changeJ < 0 || changeJ >= this.gridJ) {
                        continue;
                    }
                    if (j === 3) {
                        if (this.brick[i][j] !== 0) {
                            this.grid[changeI][changeJ].setType(0);
                        }
                    } else {
                        if (this.brick[i][j + 1] !== 0) {
                            this.grid[changeI][changeJ].setType(this.brickType);
                        } else {
                            if (j === -1) {

                            } else if (this.brick[i][j] !== 0) {
                                this.grid[changeI][changeJ].setType(0);
                            }
                        }
                    }
                }
            }
            this.brickJ -= 1;
        }
    };

    this.brickRight = () => {
        let crash = false;
        // detect if it is at the bottom
        for (let i = 0; i < 4; i++) {
            let detectI = i + this.brickI;
            if (detectI < 0 || detectI >= gridI) {
                continue;
            }
            for (let j = 0; j < 4; j++) {
                let detectJ = j + this.brickJ + 1;
                if (detectJ < 0) {
                    continue;
                }
                if (detectJ >= gridJ) {
                    if (this.brick[i][j] != 0) {
                        crash = true;
                    }
                    continue;
                }
                if (this.grid[detectI][detectJ].type !== 0) {
                    if (this.brick[i][j] !== 0) {
                        if (j != 3) {
                            if (this.brick[i][j + 1] === 0) {
                                crash = true;
                            }
                        } else {
                            crash = true;
                        }
                    }
                }
            }
        }

        if (!crash) {
            // update
            for (let i = 0; i < 4; i++) {
                let changeI = i + this.brickI;
                if (changeI < 0 || changeI >= this.gridI) {
                    continue;
                }
                for (let j = 0; j < 5; j++) {
                    let changeJ = j + this.brickJ;
                    if (changeJ < 0 || changeJ >= this.gridJ) {
                        continue;
                    }
                    if (j === 0) {
                        if (this.brick[i][j] !== 0) {
                            this.grid[changeI][changeJ].setType(0);
                        }
                    } else {
                        if (this.brick[i][j - 1] !== 0) {
                            this.grid[changeI][changeJ].setType(this.brickType);
                        } else {
                            if (j === 4) {

                            } else if (this.brick[i][j] !== 0) {
                                this.grid[changeI][changeJ].setType(0);
                            }
                        }
                    }
                }
            }
            this.brickJ += 1;
        }
    };


    this.main = () => {
        if (!this.run) {
            clearInterval(this.intervalObj);
            alert("You Lose");
            // game over
            return;
        }
        this.time += 1;
        if (this.hasBrick) {
            this.runTimes++;
            this.brickFall();
        } else {
            if (this.runTimes == 1 || this.runTimes == 2) {
                this.run = false;
            }
            for (let i = 0; i < this.gridI; i++) {
                let isFull = true;
                for (let j = 0; j < this.gridJ; j++) {
                    if (this.grid[i][j].type === 0) {
                        isFull = false;
                        break;
                    }
                }
                if (isFull) {
                    for (let mi = i; mi > 0; mi--) {
                        for (let j = 0; j < this.gridJ; j++) {
                            this.grid[mi][j].setType(this.grid[mi - 1][j].type);
                        }
                    }
                    for (let j = 0; j < this.gridJ; j++) {
                        this.grid[0][j].setType(0);
                    }
                }
            }
            this.generateBrick(Math.floor((this.bricks.length) / 4 * Math.random()));
            this.hasBrick = true;
            this.brickType = Math.floor(Math.random() * (this.colors.length - 3)) + 3;
            this.runTimes = 0;
        }
    };

    this.run = (interval = 500) => {
        this.interval = interval;
        this.time = 0;
        this.intervalObj = setInterval(this.main, this.interval);
    };

    return this;
};

let game = new Game(20, 15);
game.run(200);
