'use strict';
/*emergency pause*/
let pauseLearning = false;

/*constant setup*/
const TANH = 0;
const LOGISTIC = 1;
const RELU = 2;
const OUTPUT = 3;
const LEAKYRELU = 4;

const SUPERVISED = 0;
const UNSUPERVISED = 1;
const REINFORCEMENT = 2;

/*Layer object*/
function Layer(nodeNum = 1, sigmaNum = 1, functionType = TANH){
    this.X = [];
    this.W = [];
    this.nodeNum = nodeNum;
    this.sigmaNum = sigmaNum;
    this.functionType = functionType;
    for (let j = 0; j < this.nodeNum; j++){
        this.X[j] = 1;
        this.W[j] = [];
        for (let k = 0; k < this.sigmaNum; k++){
            this.W[j][k] = Math.random()*2-1;
        }
    }
    return this;
};

/*Network object*/
function Network(nodeNum, functionType, learningType_ = SUPERVISED){
    let layers = [];
    let layerNum = nodeNum.length;
    let dataX = [];
    let dataY = [];
    let propagationInterval = 1000;
    let accuracy = 0.05;
    let learningType = learningType_;
    let stochastic = false;
    let runTimes = 0;
    let learningStatus = false;
    let lossObserve = 0;
    /**
        In reinforcement learning, dataX is the input while dataY is the calculated output + gain.
        When feeding, inputX is the input while outputY is the gain.
        [gain = -loss]
        The feed function will automatically update the previous values in dataY with respect to dataX.
    **/

    /*setup layers*/
    for (let i = 0; i < layerNum-1; i++){    /*excluding output layer*/
        layers[i] = new Layer(nodeNum[i]+1, nodeNum[i+1], functionType[i]);    /*including bias*/
    }
    layers[layerNum-1] = new Layer(nodeNum[layerNum-1]+1, 1, OUTPUT);    /*output, including bias*/
    /*layers[layerNum-1].X[0] is no use*/

    /*output private "layers"*/
    Object.defineProperty(this, 'layers', {
        get: function(){
            return layers;
        }
    });

    /*output private "learningStatus"*/
    Object.defineProperty(this, 'learningStatus', {
        get: function(){
            return learningStatus;
        }
    });

    /*output private "loss"*/
    Object.defineProperty(this, 'loss', {
        get: function(){
            return lossObserve;
        }
    });

    /*output private "data"*/
    Object.defineProperty(this, 'dataX', {
        get: function(){
            return dataX;
        }
    });
    Object.defineProperty(this, 'dataY', {
        get: function(){
            return dataY;
        }
    });

    /*input private "runTimes"*/
    Object.defineProperty(this, 'runTimes', {
        get: function(){
            return runTimes;
        },
        set: function(_runTimes){
            runTimes = _runTimes;
        }
    });

    /*input private "accuracy"*/
    Object.defineProperty(this, 'accuracy', {
        get: function(){
            return accuracy;
        },
        set: function(accuracy_){
            accuracy = accuracy_;
        }
    });

    /*input private "stochastic"*/
    Object.defineProperty(this, 'stochastic', {
        get: function(){
            return stochastic;
        },
        set: function(stochastic_){
            stochastic = stochastic_;
        }
    });

    /*format X and    of each layer*/
    this.print = () => {
        let outputObject = {};
        for (let i = 0; i < layers.length-1; i++){ /*excluding output*/
            outputObject["layer-"+i] = [];
            for (let j = 0; j < layers[i].nodeNum; j++){
                outputObject["layer-"+i][j] = Math.round(layers[i].X[j]*100)/100 + " -> ";
                for (let k = 0; k < layers[i].sigmaNum; k++){
                    outputObject["layer-"+i][j] += Math.round(layers[i].W[j][k]*100)/100 + " ";
                }
            }
        }
        outputObject["output-layer"] = [];
        for (let j = 0; j < layers[layers.length-1].nodeNum; j++){
            outputObject["output-layer"][j] = Math.round(layers[layers.length-1].X[j]*100)/100;
        }
        return outputObject;
    };

    /*read weight values*/
    this.readArray = () => {
        let outputArray = [];
        for (let i = 0; i < layers.length-1; i++){ /*excluding output*/
            outputArray[i] = [];
            for (let j = 0; j < layers[i].nodeNum; j++){
                outputArray[i][j] = [];
                for (let k = 0; k < layers[i].sigmaNum; k++){
                    outputArray[i][j][k] = Math.round(layers[i].W[j][k]*100)/100;
                }
            }
        }
        return outputArray;
    };
    this.readString = () => {
        return JSON.stringify(this.readArray());
    };

    /*write weight values*/
    this.writeArray = (inputArray) => {
        for (let i = 0; i < layers.length-1; i++){ /*excluding output*/
            for (let j = 0; j < layers[i].nodeNum; j++){
                for (let k = 0; k < layers[i].sigmaNum; k++){
                    layers[i].W[j][k] = inputArray[i][j][k];
                }
            }
        }
    };
    this.writeString = (inputString) => {
        this.writeArray(JSON.parse(inputString));
    };

    /*feed one piece of data X[x1,x2,x3...] Y[y1,y2,y3...]*/
    this.feed = (inputX, outputY) => {
        let feedX = [1];    /*bias*/
        let feedY = [1];    /*bias*/
        for (let j = 1; j < layers[0].nodeNum; j++){    /*excluding bias*/
            feedX[j] = inputX[j-1];
        }
        for (let j = 1; j < layers[layers.length-1].nodeNum; j++){    /*excluding bias*/
            if (learningType === SUPERVISED){
                feedY[j] = outputY[j-1];
            } else if (learningType === REINFORCEMENT){
                feedY[j] = 0-outputY[j-1]; /*gain = -loss*/
            }
        }

        if (learningType === REINFORCEMENT){ 
            /*run propagation with y=-gain*/
            
            let loss = propagation(feedX,feedY);
            /*update y to loss*/
            feedY = loss;
            feedY[0] = 1; /*set bias to 1*/
        }
        
        if (learningType === SUPERVISED){
            dataX.push(feedX);
            dataY.push(feedY);
        } else if (learningType === REINFORCEMENT){ /*update dataY*/
            let indexD = -1;
            /*find the same dataX array*/
            for (let n = 0; n < dataX.length; n++){
                if ((dataX[n] + "") === (feedX + "")){
                    indexD = n;
                }
            }
            if (indexD != -1){ 
                dataY[indexD] = feedY;
            } else {
                dataX.push(feedX);
                dataY.push(feedY);
            }
        }
    };

    /*feed multiple pieces of data [[X[],Y[]], [X[],Y[]]...]*/
    this.feedMulti = (dataArray) => {
        if (typeof dataArray === "string"){
            let stringArr = dataArray.split(" ");
            for (let x = 0; x < stringArr.length; x++){
                if (stringArr[x] === " "){

                }
                stringArr[x] = parseFloat(stringArr[x]);
            }
            for (let x = 0; x < stringArr.length/(layers[0].nodeNum + layers[layers.length-1].nodeNum); x++){
                this.feed(stringArr.slice(x*(layers[0].nodeNum + layers[layers.length-1].nodeNum),x*(layers[0].nodeNum + layers[layers.length-1].nodeNum)+layers[0].nodeNum), stringArr.slice(x*(layers[0].nodeNum + layers[layers.length-1].nodeNum)+layers[0].nodeNum),(x+1)*(layers[0].nodeNum + layers[layers.length-1].nodeNum));
            }
        } else if (dataArray[0][0][0] === undefined){
            throw new Error("Incorrect Feeding.");
            return;
        } else {
            for(let n = 0; n < dataArray.length; n++){
                this.feed(dataArray[n][0], dataArray[n][1]);
            }
        }
    };

    /*clear stored data*/
    this.clearData = () => {
        dataX = [];
        dataY = [];
    }

    /*calculate the derivative of the activation function h at layer i by h(x)*/
    const dh = (i, hx) => {
        if (layers[i].functionType === TANH){
            return (1 - hx*hx);
        }
        if (layers[i].functionType === LOGISTIC){
            return (hx*(1-hx));
        }
        if (layers[i].functionType === RELU){
            return (hx>0) ? 1 : 0;
        }
        if (layers[i].functionType === LEAKYRELU){
            return (hx>0) + (hx<=0)*0.01;
        }
    } ;

    this.test = (inputX = dataX[dataX.length-1]) => {
        for (let j = 1; j < layers[0].nodeNum; j++){    /*feed input*/
            layers[0].X[j] = inputX[j-1];
        }
        for (let i = 0; i < layers.length-1; i++){ /*propagation, excluding output layer*/
            for (let k = 0; k < layers[i].sigmaNum; k++){
                let sum = 0;
                for (let j = 0; j < layers[i].nodeNum; j++){
                    sum += layers[i].X[j]*layers[i].W[j][k];
                }
                switch(layers[i].functionType){
                    case TANH:
                        sum = Math.tanh(sum);
                        break;
                    case LOGISTIC:
                        sum = 1/(1+Math.exp(0-sum));
                        break;
                    case RELU:
                        sum = Math.max(0, sum);
                        break;
                    case OUTPUT:
                        break;
                    case LEAKYRELU:
                        sum = Math.max(0, sum) + (sum <= 0)*0.01*sum;
                        break;
                }
                layers[i+1].X[k+1] = sum; /*feed to next layer*/
            }
        }
        let maxIndex = 1;
        for (let j = 1; j < layers[layers.length-1].X.length; j++){
            if (layers[layers.length-1].X[j] > layers[layers.length-1].X[maxIndex]){
                maxIndex = j;
            }
        }
        /*stochastic*/
        if (stochastic === true){
            let outputSum = 0;
            for (let j = 1; j < layers[layers.length-1].nodeNum; j++){ /*excluding bias*/
                outputSum += layers[layers.length-1].X[j];
            }
            outputSum = Math.abs(outputSum);
            let randNum = Math.random()*2-1;
            let maxNum = 1;
            for (let j = 1; j < layers[layers.length-1].nodeNum; j++){ /*excluding bias*/
                maxNum -= 2*layers[layers.length-1].X[j]/outputSum;
                if (randNum >= maxNum){
                    maxIndex = j;
                    break;
                }
            }
            if (Math.random() < 0.05){ //increase uncertainty
                maxIndex = Math.floor(Math.random()*4)+1;
            }
        }
        /*output result*/
        /*console.log(layers[layers.length-1].X);*/
        return maxIndex;
    };

    /*forward propagation, returns the loss(error)*/
    const propagation = (inputX = dataX[dataX.length-1], outputY = dataY[dataY.length-1]) => {
        for (let j = 0; j < layers[0].nodeNum; j++){    /*feed input*/
            layers[0].X[j] = inputX[j];
        }
        for (let i = 0; i < layers.length-1; i++){ /*propagation, excluding output layer*/
            for (let k = 0; k < layers[i].sigmaNum; k++){
                let sum = 0;
                for (let j = 0; j < layers[i].nodeNum; j++){
                    sum += layers[i].X[j]*layers[i].W[j][k];
                }
                switch(layers[i].functionType){
                    case TANH:
                        sum = Math.tanh(sum);
                        break;
                    case LOGISTIC:
                        sum = 1/(1+Math.exp(0-sum));
                        break;
                    case RELU:
                        sum = Math.max(0, sum);
                        break;
                    case OUTPUT:
                        break;
                    case LEAKYRELU:
                        sum = Math.max(0, sum) + (sum <= 0)*0.01*sum;
                        break;
                }
                layers[i+1].X[k+1] = sum; /*feed to next layer*/
            }
        }
        
        let loss = [0]; /*bias*/
        for (let j = 1; j < layers[layers.length-1].nodeNum; j++){ /*calculating loss (loss = yCalculated - yData), excluding bias*/
            loss[j] = layers[layers.length-1].X[j] - outputY[j];
        }
        return loss;
    };

    /*backward propagation (loss, data index, output index, layer index, node index, weight index, adjust rate)*/
    const backPropagation = (loss, n, oj, i, j, k, adjustRate) => {
        if (i === layers.length-2){
            if (k !== oj-1){    /*ignore all w's unrelated to y[oj]*/
                return;
            }
        }
        let dedw = 1;
        for (let i0 = i, k0 = k, k1 = k; i0 < layers.length-1; i0++){
            if (i0 === i){    /*the frontmost layer*/
                dedw *= layers[i0].X[j] * dh(i0, layers[i0+1].X[k1+1]); /*Xi0j * dh(Xi0+1k1+1)*/
            } else {
                dedw *= layers[i0].W[k0+1][k1] * dh(i0, layers[i0+1].X[k1+1]); /*Wk0+1k1 * dh(Xi0+1k1+1)*/
            }
            k0 = k1;
            k1 = Math.floor(Math.random()*(layers[i0+1].sigmaNum)); /*random number in [0, sigmaNum)*/
            if (i0 === layers.length-3){    /*second last laer*/
                k1 = oj-1;
            }
        }
        if (dedw != 0){
            /*if loss>0, descend*/
            layers[i].W[j][k] += adjustRate*loss*(0-dedw);    /*gradient descent*/
            /* layers[i].W[j][k] = (dedw*layers[i].W[j][k]-loss)/dedw    //Newton's method*/
        }
    };

    /*repeat propagation and back propagation several times*/
    this.learn = () => {
        /*console.log("learning started");*/
        pauseLearning = false;
        learningStatus = true;
        let adjustRate = 0.01;
        let loss = [0];
        let learnProcess = true;
        let count = 0;
        let sum = 0;
        let prevSum = -1;
        let batchGradientDescent = function(){ 
            let startTime = Date.now();
            if (pauseLearning === true){    /*emergency pause*/
                return;
            }
            for (let i = layers.length-2; i >= 0; i--){ /*loop backwards through every layer*/
                for (let j = 0; j < layers[i].nodeNum; j++){    /*loop through every W in a layer*/
                    for (let k = 0; k < layers[i].sigmaNum; k++){ 
                        for (let oj = 1; oj < layers[layers.length-1].nodeNum; oj++){ /*loop through every output y, excluding bias*/
                            for (let n = 0; n < dataX.length; n++){ /*loop through every piece of data*/
                                loss = propagation(dataX[n], dataY[n]);
                                backPropagation(loss[oj], n, oj, i, j, k, adjustRate);
                            }
                        }
                    }
                }
            }
            learnProcess = false;
            for (let oj = 1; oj < loss.length; oj++){
                sum += loss[oj];
                if (Math.round(loss[oj]/accuracy/2) !== 0){    /*accuracy: 0.05*/
                    learnProcess = true;
                    break;
                }
            }
            lossObserve = sum/(count%100+1);
            if (count%100 === 99){
                if (Math.round(prevSum/adjustRate) === Math.round(sum/adjustRate)){
                    adjustRate /= 1+Math.abs(prevSum/100);
                    console.log("adjust", adjustRate);
                } else {
                    prevSum = sum;
                    sum = 0;
                }
            }
            if (count%100 == 0 && learnProcess === true){
                propagationInterval = Date.now() - startTime + 10;
                clearInterval(itv);
                itv = setInterval(batchGradientDescent, propagationInterval); /*dynamically change the runtime interval*/
            }
            if (learnProcess === false){
                /*console.log("propagation finished");*/
                learningStatus = false;
                clearInterval(itv);
                pauseLearning = true;
            }
            count++;
            runTimes++;
        };
        let itv = setInterval(batchGradientDescent, propagationInterval);
    };

    /*output user manual*/
    this.getManual = () => {
        let manual = `
        ***network.js user manual***
        
        Network constructor(nodeNum[],functionType[],*learningType)
        Network.feed(inputX[],outputY)
        Network.feedMulti([[X1[],Y1[]], [X2[],Y2[]]...])
        Network.learn()
        Network.test(inputX[])
        Network.print()
        
        `;
        console.log(manual);
        return manual
    }
    return this;
};

module.exports.Network = Network;