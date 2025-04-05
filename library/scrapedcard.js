const maxLength = 1000;
const height = 156;
const interval = 1000;
const clickInterval = 100;

const clickLinks = true;

const delay = (time) => new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(true);
    }, time);
});

let title = location.pathname.replaceAll("/", "_");
if (title.indexOf("search") !== -1){
    title = decodeURI(location.search.substring(location.search.indexOf("=") + 1));
}

const parent = document.querySelector("#__next > div.d_a5_22.d_jm_12n979t.d_gz_29.d_m4_l9tp1y.d_eg_2t9vxr.d_vl_1ft4lg7.ft1v5tm > div.d_ju_gro691.d_dr_1c2m9s5.f1og407v > div > div > div.d_mk_1s.d_2l_f.m1lmxu0d > div > div:nth-child(3) > div > div:nth-child(1) > div");

const feed  = [];

const scrollAndScrape = async () => {
    let children = parent.childNodes;
    let notFound = true;
    for (let child of children){
        let index = parseInt(child.getAttribute("data-key"));
        if (feed[index] === undefined){
            let article = child.childNodes[0].childNodes[0];
            try {
                feed[index] = [article.childNodes[1]?.textContent, article.childNodes[2]?.textContent, article.childNodes[1]?.childNodes[0].href]
                // if(clickLinks){
                //     let aTag = article.childNodes[1]?.childNodes[0];
                //     aTag.click();
                //     let t = await delay(clickInterval);
                //     let popUp = document.querySelector("body > div.__portal > div.d_piekax_fxhsv8.d_ng_2y.d_ut_1s.d_g7_1s.d_xf_1r.d_ej_1r.d_y6_41.d_lc_b4ywaf.d_kx_1x.sdhhcat.overlay-enter-done > div.d_ej_1r.d_xf_40.d_gz_29.d_2e_f.d_ng_1z.c1hkrwjp");
                //     feed[index][2] += popUp.textContent;
                //     t = await delay(clickInterval);
                //     history.back();
                // }
            }
            catch {

            }
            notFound = false;
        }
    }
    return notFound?0:children.length;
}

const downloadFile = (filename, content) => {
    // Create a new Blob object with the content
    const blob = new Blob([content], { type: 'text/plain' });
    
    // Create a temporary link element
    const link = document.createElement("a");
    
    // Set the download attribute with the filename
    link.download = filename;
    
    // Create a URL for the Blob and set it as the href of the link
    link.href = URL.createObjectURL(blob);
    
    // Programmatically click the link to trigger the download
    link.click();
    
    // Clean up by revoking the Object URL
    URL.revokeObjectURL(link.href);
}

/*******************************/

let y = 0;
let prevY = -1;
let counter = 0;
let itv = setInterval(async () => {
    scroll(0, y);
    y += await scrollAndScrape() * height;
    if (prevY == y){
        counter += 1;
    }
    if (y > height * maxLength || counter > 5){
        clearInterval(itv);
        downloadFile(`${title}.json`, JSON.stringify(feed.filter(el => el), null, 4));
        downloadFile(`${title}.txt`, feed.reduce(((prev, curr) => (prev + curr[0] + "：" + curr[1] + "\n")), ""));
    }
    prevY = y;
}, interval);
