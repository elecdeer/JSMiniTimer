
//参考
//https://qiita.com/Keita_I/items/72f302b6470a2ccdd9f4

class CircleProgress{
  constructor(id, frontColor = "#333", backColor = "#999"){
    this.id = id;
    this.rate = 0.0;
    this.frontColor = frontColor;
    this.backColor = backColor;

    this.circle = document.getElementById(id);
    // this.circle.classList.add("circle");

    this.innerCircle = document.createElement("div");
    this.innerCircle.classList.add("circle-back");
    this.circle.appendChild(this.innerCircle);

    this.right = document.createElement("div");
    this.right.classList.add("circle-right-block");
    this.circle.appendChild(this.right);

    this.left = document.createElement("div");
    this.left.classList.add("circle-left-block");
    this.circle.appendChild(this.left);

  }

  setRate(rate){
    this.rate = rate;
    this.update(rate);
  }

  setFrontColor(color){
    this.frontColor = color;
    this.update();
  }

  setBackColor(backColor){
    this.backColor = backColor;
    this.update();
  }

  update(){
    if(this.rate <= 0.5){
      this.right.style.transform = `rotate(${360.0 * this.rate}deg)`;
      this.right.style.background = this.backColor;

      this.left.style.transform = `rotate(0deg)`;
    }else{
      this.right.style.transform = `rotate(360deg)`;
      this.right.style.background = this.frontColor;

      this.left.style.transform = `rotate(${360.0 * (this.rate - 0.5)}deg)`;
    }

    this.circle.style.background = this.frontColor;
    this.left.style.background = this.backColor;
  }

}



const timeCounter = (() => {
  let maxMs = 0;
  let remainingMs = 0;

  // let counting = false;

  const setMaxMs = (ms) => {
    maxMs = ms;
  };

  const addTimeMs = (ms, isCounting) => {
    remainingMs += ms;
    if(remainingMs > maxMs){
      if(isCounting){
        remainingMs = maxMs;
      }else{
        setMaxMs(remainingMs);
      }
    }
  }

  const countDownMs = (decMs, onTimeOut) => {
    remainingMs -= decMs;
    if(remainingMs <= 0){
      remainingMs = 0;
      onTimeOut();
    }
  }

  const resetTime = () => {
    remainingMs = maxMs;
  }

  const getProgressRate = () => remainingMs / maxMs;
  const getRemainingMs = () => remainingMs;
  const getMaxMs = () => maxMs;
  const getMMSSText = () => msToMMSS(remainingMs);

  return {
    setMaxMs,
    addTimeMs,
    countDownMs,
    resetTime,
    getProgressRate,
    getRemainingMs,
    getMaxMs,
    getMMSSText,
  }
})();

const msToMMSS = (ms) => {
  const remainingSec = ms / 1000;
  const min = ("00" + Math.floor(remainingSec/60)).slice(-2);
  const sec = ("00" + Math.floor(remainingSec%60)).slice(-2);
  return `${min}${sec}`;
}



//0-3が編集中
let editingPlace = -1;

const isEditing = () => {
  return 0 <= editingPlace && editingPlace <= 3;
}

let isCounting = false;

const toggleCounting = (set) => {
  if(set == null){
    isCounting = !isCounting;
  }else{
    isCounting = set;
  }

  const text = isCounting ? "PAUSE" : "START";

  document.getElementById("startStop").innerText = text;
}


const placeIdMap = {
  0: "tenMin",
  1: "oneMin",
  2: "tenSec",
  3: "oneSec",
}

const updateDisplay = (counter, progress) => {
  const mmss = counter.getMMSSText();

  // const countDownDom = document.getElementById("timer");
  document.getElementById("tenMin").innerText = mmss.charAt(0);
  document.getElementById("oneMin").innerText = mmss.charAt(1);
  document.getElementById("tenSec").innerText = mmss.charAt(2);
  document.getElementById("oneSec").innerText = mmss.charAt(3);

  const domCollection = document.getElementsByClassName("timerNum");
  for(let i = 0; i < domCollection.length; i++){
    const dom = domCollection[i];
    if(dom.id === placeIdMap[editingPlace]){
      dom.classList.add("edit-blink");
    }else{
      dom.classList.remove("edit-blink");
    }
  }


  progress.setRate(timeCounter.getProgressRate());
  if(timeCounter.getRemainingMs() < 10*1000){
    progress.setFrontColor("#ff6347");
  }else{
    progress.setFrontColor("#ff8c00");
  }

  const maxMMSS = msToMMSS(counter.getMaxMs());

  const dispMMSS = `${maxMMSS.slice(0, 2)}:${maxMMSS.slice(2, 4)}`
  document.getElementById("setMaxTime").innerText = dispMMSS;

}

const setCharAt = (str,index,chr) => {
  if(index > str.length-1) return str;
  return str.substring(0,index) + chr + str.substring(index+1);
}

window.addEventListener("DOMContentLoaded", () => {
  const progress = new CircleProgress("progressCircle");
  progress.setRate(1.0);
  progress.setBackColor("#696969");
  progress.setFrontColor("#ff8c00");

  timeCounter.setMaxMs(0);
  timeCounter.resetTime();

  updateDisplay(timeCounter, progress);
  toggleCounting(false);


  document.getElementById("startStop").addEventListener("click", ev => {
    toggleCounting();
  });


  document.getElementById("plusTenSec").addEventListener("click", ev => {
    timeCounter.addTimeMs(10 * 1000, isCounting);
  });

  document.getElementById("plusOneMin").addEventListener("click", ev => {
    timeCounter.addTimeMs(60 * 1000, isCounting);
  });

  document.getElementById("setTime").addEventListener("click", ev => {
    if(isEditing()){
      editingPlace = -1;
    }else{
      editingPlace = 0;
    }
    toggleCounting(false);
  });

  document.getElementById("setMaxTime").addEventListener("click", ev => {
    timeCounter.resetTime();
  });


  document.addEventListener("keypress", event => {
    if(!event.key.match(/\d/)) return;
    if(!isEditing()) return;

    //かなり強引
    const currentMMSS = timeCounter.getMMSSText();
    const editedStr = setCharAt(currentMMSS, editingPlace, event.key);

    const setMs = (parseInt(editedStr.substring(0, 2)) * 60 + parseInt(editedStr.substring(2, 4))) * 1000;

    // console.log("currentMMSS", currentMMSS);
    // console.log("editedStr", editedStr);
    // console.log("setMs", setMs);

    timeCounter.setMaxMs(setMs);
    timeCounter.resetTime();

    editingPlace++;

  })


  const timerInterval = 10;
  const timer = setInterval(() => {

    if(isCounting){

      const timeOut = () => {
        toggleCounting(false);

        const domCollection = document.getElementsByClassName("timerNum");
        for(let i = 0; i < domCollection.length; i++){
          const dom = domCollection[i];
          dom.classList.add("finish-blink");
        }

        setTimeout(() => {
          for(let i = 0; i < domCollection.length; i++){
            const dom = domCollection[i];
            dom.classList.remove("finish-blink");
          }
        }, 3000);
      }


      timeCounter.countDownMs(timerInterval, timeOut);

    }

    updateDisplay(timeCounter, progress);


  }, timerInterval);


})