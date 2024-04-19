var fps           = 60;

window.raf = (function(){
  return requestAnimationFrame || webkitRequestAnimationFrame || mozRequestAnimationFrame || function(c){setTimeout(c,1000/fps);};
})();
/*--------------=== Slot machine definition ===--------------*/
(function() {
  var NAME        = "SlotMachine",
  defaultSettings = {
    width           : "700",
    height          : "600",
    colNum          : 3,
    rowNum          : 9,
    winRate         : 30,
    minBet          : 10,
    maxBet          : 30,
    betIncrement    : 10,
    bet             : 10, 
    autoPlay        : false,
    autoSize        : true,
    autoPlayTime    : 5,
    layout          : 'compact',
    handleShow      : true,
    handleWidth     : 35,
    handleHeight    : 30,
    machineBorder   : 15,
    machineColor    : 'rgba(120,60,30,1)',
    names           : [
      "seven",
      "lemon",
      "cherry",
      "watermelon",
      "banana",
      "bar",
      "prune",
      "bigwin",
      "orange"
    ]
  },
  completed       = true,
  isShuffle       = true,
  supportTouch    = 'ontouchstart' in window || navigator.msMaxTouchPoints,
  firstTime       = true,
  nextLoop        = null ;
  SlotMachine = function (argument) {
    this.init = this.init.bind(this);
    this.run = this.run.bind(this);
    this.addListener = this.addListener.bind(this);
    this.beforeRun = this.beforeRun.bind(this);
    this.afterRun = this.afterRun.bind(this);
    this.showWin = this.showWin.bind(this);
    this.rotateHandle = this.rotateHandle.bind(this);
    this.colArr = [];
    this.options = {};
    this.credits = 260; // Starting credits
    this.bet = 10; // Initial bet
    this.winnerPaid = 0; // Initial winner paid
    this.increaseBet = this.increaseBet.bind(this);
    this.decreaseBet = this.decreaseBet.bind(this);
    this.updateCreditDisplay = this.updateCreditDisplay.bind(this);

    // Bind new method
    this.updateCreditDisplay = this.updateCreditDisplay.bind(this);

    // Call to update the display at initialization
    this.updateCreditDisplay();

    this.setupListeners();
  }

  SlotMachine.prototype.setupListeners = function() {
    var self = this;
    document.getElementById('betIncrease').addEventListener('click', function() {
        self.increaseBet();
    });

    document.getElementById('betDecrease').addEventListener('click', function() {
        self.decreaseBet();
    });
};
  SlotMachine.prototype.updateCreditDisplay = function() {
    document.getElementById('credits').textContent = this.credits;
    document.getElementById('bet').textContent = this.bet;
    document.getElementById('winner-paid').textContent = this.winnerPaid;
};
SlotMachine.prototype.increaseBet = function() {
  if (this.bet < this.options.maxBet) {
      this.bet += this.options.betIncrement;
      this.updateCreditDisplay();
  }
};

SlotMachine.prototype.decreaseBet = function() {
  if (this.bet > this.options.minBet) {
      this.bet -= this.options.betIncrement;
      this.updateCreditDisplay();
  }
};
  SlotMachine.prototype.beforeRun = function(){    
    if (completed) {
      // Deduct bet from credits when the game starts
      this.credits -= this.bet;

      // Call to update the display
      this.updateCreditDisplay();
      this.showWin(false);
      completed = false;
      var result = null;
      result = this.options.names[random(this.options.rowNum*100/this.options.winRate)|0];//set winrate
      for(var i=0;i<this.options.colNum;i++){
        this.colArr[i].beforeRun(result);
      }      
      this.rotateHandle();
      this.run();
    }    
    if (this.options.autoPlay) nextLoop = setTimeout(function(){this.beforeRun()}.bind(this),this.options.autoPlayTime*1000);
  }
  SlotMachine.prototype.afterRun = function(){
    completed = true;
    var results = [],win=true;
    for(var i=0;i<this.options.colNum;i++){
      results.push(this.colArr[i].getResult());
      if (i>0 && results[i]!=results[i-1]) {
        win = false;
        break;
      }
    }
    if(win){
      this.showWin(true);
      if (results.every(val => val === 'bigwin')){
        this.winnerPaid = this.bet * 10;
      }
      else if (results.every(val => val === 'seven')){
        this.winnerPaid = this.bet * 5;
      }
      else if (results.every(val => val === 'prune')){
        this.winnerPaid = this.bet * 5;
      }
      else {
      this.winnerPaid = this.bet*3; }// This should be calculated based on the actual win
      
      let increments = 10; // Number of increments to display the counting
      let incrementAmount = this.winnerPaid / increments;
      let count = 0;

      var creditSound = document.getElementById('creditcount');
      creditSound.play();
      //this.credits += this.winnerPaid;

      // Play the credit adding sound
      var creditSound = document.getElementById('creditcount');
      creditSound.play();

      // Increment credits with a delay to sync with sound
      var intervalId = setInterval(() => {
        this.credits += incrementAmount;
        count++;
        this.updateCreditDisplay();

        if (count >= increments) {
          clearInterval(intervalId);
          creditSound.pause();
          creditSound.currentTime = 0; // Reset the sound to the start
          setTimeout(() => {
              this.showWin(false);
          }, this.options.autoPlayTime * 1000);
      }
  }, 100);
}

};
    
  SlotMachine.prototype.rotateHandle = function(){
    var handle = document.querySelector(".handle");
    if (handle) {
      handle.addClass("active");
      setTimeout(function(){
        handle.removeClass("active");
      },1000); 
    }
  }

  document.getElementById('viewPayTable').addEventListener('click', function() {
    var payTableSection = document.getElementById('payTableSection');
    if (payTableSection) {
        payTableSection.scrollIntoView({ behavior: 'smooth' });
    }
});
  
  SlotMachine.prototype.run = function(){    
    var done = true;   
    var reelSound = document.getElementById('reelSound');
    reelSound.play(); 
    for(var i=0;i<this.options.colNum;i++){
      done &= this.colArr[i].run();
    }
    if (!done) raf(this.run)
    else {
    this.afterRun();
    reelSound.pause();
    reelSound.currentTime = 0;
    }
  }
  document.getElementById('soundToggle').addEventListener('click', function() {
    var sounds = document.querySelectorAll('audio');
    var isMuted = sounds[0] && sounds[0].muted;  // Check the current state based on the first audio element
    Array.prototype.forEach.call(sounds, function(sound) {
        sound.muted = !isMuted;  // Toggle the state
    });
    this.textContent = isMuted ? "Unmute Sound" : "Mute Sound";  // Update button text accordingly
});
  SlotMachine.prototype.showWin = function(show){
    var winner = document.querySelector(".winner");
    if (winner) winner.className= show ? "winner active" : "winner";

    // Update the display of winner-paid based on the 'show' flag
    var winnerPaidDisplay = document.getElementById('winner-paid');
    if (winnerPaidDisplay) {
        winnerPaidDisplay.style.display = show ? "block" : "none"; // Toggle display
    }
  }
  SlotMachine.prototype.init = function(){
    //reset all
    completed = true;
    clearTimeout(nextLoop);
    //get settings
    var BannerFlow = arguments[0],
        settingStyle = "",
        machine = document.querySelector(".machine"),
        container = document.querySelector(".container");
    machine.style.opacity = 0;
    for(var key in defaultSettings) {
      this.options[key] = defaultSettings[key];
    }
    
    if (BannerFlow!==undefined){
      var settings = BannerFlow.settings;
      this.options.winRate = settings.winRate ? settings.winRate : defaultSettings.winRate;
      this.options.autoPlay = settings.autoPlay;
      this.options.colNum = settings.numberColumn ? settings.numberColumn : defaultSettings.colNum;
      this.options.layout = settings.layout ? settings.layout : defaultSettings.layout;
      this.options.machineColor = settings.machineColor ? settings.machineColor : defaultSettings.machineColor;
      this.options.machineBorder = settings.machineBorder>=0 ? settings.machineBorder : defaultSettings.machineBorder;
      this.options.height = settings.height ? settings.height : defaultSettings.height;
      this.options.width = settings.width ? settings.width : defaultSettings.width;
      this.options.autoSize = settings.autoSize;            
      if (this.options.autoSize) {
        this.options.height = window.innerHeight;
        this.options.width = window.innerWidth;
      }
      this.options.handleShow = settings.handleShow;
      this.options.handleWidth = this.options.handleShow ? defaultSettings.handleWidth : 0;      
      this.options.autoPlayTime = settings.autoPlayTime ? settings.autoPlayTime : defaultSettings.autoPlayTime;
      this.options.customImage = settings.customImage;
    }
    //apply settings
    if (this.options.customImage){
      var urls = BannerFlow.text.strip().split(",");
      this.options.names = [];
      for(var i=0;i<urls.length;i++){
        var name = "image-"+i ; urls[i];
        this.options.names.push(name);
        settingStyle += getStyle("."+name+":after",{
          "background-image"  : "url('"+urls[i]+"')"
        });
      }      
    }
    settingStyle += getStyle(".machine",{      
      "margin-top"          : (window.innerHeight - this.options.height)/2 +"px",
      "margin-left"         : (window.innerWidth - this.options.width)/2 +"px"
    });
    settingStyle += getStyle(".container",{
      "height"              : this.options.height+"px",
      "width"               : this.options.width - this.options.handleWidth +"px",
      "border-width"        : this.options.machineBorder + "px",
      "border-color"        : this.options.machineColor + " " + getLighter(this.options.machineColor)
    });
    var winnerSize = 1.2*Math.max(this.options.height,this.options.width);
    settingStyle += getStyle(".winner:before,.winner:after",{
      "height"              : winnerSize+"px",
      "width"               : winnerSize+"px",
      "top"                 : (this.options.height-winnerSize)/2 - 20 + "px",
      "left"                : (this.options.width-winnerSize)/2 - this.options.handleWidth + "px"
    });
    settingStyle += getStyle(".handle",{
      "margin-top"          : this.options.height/2-this.options.handleHeight+"px"
    });
    document.querySelector("#setting").innerHTML = settingStyle;    
    //remove old cols
    if (this.colArr && this.colArr.length > 0)
      for (var i=0;i<this.colArr.length;i++){
        container.removeChild(this.colArr[i].getDOM());
      }
    this.colArr = [];
    // add new cols
    for(var i=0;i<this.options.colNum;i++){
      var col = new SlotColumn();
      col.init(this.options.names.slice(0,this.options.rowNum),isShuffle);
      this.colArr.push(col);
      document.querySelector(".container").appendChild(col.getDOM());
    }
    machine.style.opacity = "1";
    
  }

  SlotMachine.prototype.addListener = function(){
    var BannerFlow=arguments[0],timer,
        that = this ,
        container = document.querySelector(".container");
    if (typeof BannerFlow!= 'undefined') {
      // BannerFlow event
      BannerFlow.addEventListener(BannerFlow.RESIZE, function() {
        //clearTimeout(timer);
        //timer = setTimeout(function(){that.init(BannerFlow);that.beforeRun()},500);
      });
      BannerFlow.addEventListener(BannerFlow.CLICK, function() {
        that.beforeRun();
      });
    } else {
      // Window event
      window.addEventListener('resize', function(){
        //clearTimeout(timer);
        //timer = setTimeout(function(){that.init(BannerFlow);that.beforeRun()},500)
      });
      
      
      var handle = document.querySelector(".handle");
if (handle) {
    handle.addEventListener('click', function(event) {
        event.stopPropagation();
        that.beforeRun();
    });
}
    }
    var slotTrigger = document.querySelector("#slot-trigger");
    if (slotTrigger) {
      slotTrigger.addEventListener("click",function(e){
        this.addClass('slot-triggerDown');
      })
    }    
  }
  window[NAME]= SlotMachine;
})();
/*--------------=== Slot Column definition ===--------------*/
(function(){
  var NAME = "SlotColumn";
  SlotColumn = function(){
    this.col = document.createElement("div");
    this.col.className = "col";
    this.init = this.init.bind(this);
    this.run = this.run.bind(this);
    this.beforeRun = this.beforeRun.bind(this);
    this.getResult = this.getResult.bind(this);
    this.getDOM = this.getDOM.bind(this);
    this.arr = [];
    this.colHeight=this.rowHeight=0;
    this.loop = 2;
  }
  SlotColumn.prototype.init = function(){
    this.col.empty();
    this.arr=arguments[0];
    var isShuffle=arguments[1];
    if(isShuffle) shuffle(this.arr);
    for(var i=0; i<this.arr.length*this.loop;i++){
      var row = document.createElement("div");
      row.className = "row "+this.arr[i%this.arr.length];
      this.col.appendChild(row);
    }
    this.top = 0;
  }
  SlotColumn.prototype.beforeRun = function(){
    this.halfHeight = this.col.offsetHeight/this.loop;
    this.colHeight = this.col.scrollHeight/2;
    this.rowHeight = this.colHeight/this.arr.length;
    this.nextResult = arguments[0];
    var next = this.arr.indexOf(this.nextResult);
    if (next==-1) next=random(0,this.arr.length-1)|0;
    var s = this.top + (random(2,10)|0)*this.colHeight + ((next+0.5)*this.rowHeight|0) - this.halfHeight;
    var n = (random(2,6)|0) * fps;
    this.speed = 2*s/(n+1);
    this.acceleration = this.speed/n;
  }
  SlotColumn.prototype.getResult = function(){
    var result = Math.ceil(((this.halfHeight-this.top)%this.colHeight)/this.rowHeight)-1;
    //console.log(this.top,result,this.arr[result],this.halfHeight,this.colHeight,this.rowHeight);
    return this.arr[result];
  }
  SlotColumn.prototype.run = function(){
    if(this.speed <= 0) return true;//completed
    this.top = (this.top - this.speed) % this.colHeight;
    this.speed -= this.acceleration;
    this.top %= this.colHeight;
    this.col.style.transform = "translateY("+this.top+"px)";
    return false;//not completed
  }
  SlotColumn.prototype.getDOM = function(){
    return this.col;
  }
  window[NAME] = SlotColumn;
}());
/*--------------=== Utils definition ===--------------*/
//random in range
var random = function(){
  var isNumeric = function(n){return !isNaN(parseFloat(n)) && isFinite(n)},
      val = Math.random(),
      arg = arguments;
  return isNumeric(arg[0]) ? isNumeric(arg[1]) ? arg[0] + val*(arg[1] - arg[0]) : val*arg[0] : val;
};
//shuffle an array
var shuffle = function(arr){
  var j,tmp;
  for(var i=0;i<arr.length;i++){
    j = random(arr.length)|0;
    tmp = arr[i];arr[i]=arr[j];arr[j]=tmp;
  }
}
//get CSS3 style
var setStyleCss3 = function (object, key, value) {
  object.style['-webkit-'+ key] = value;
  object.style['-moz-'+key] = value;
  object.style['-ms-'+key] = value;
  object.style[key] = value;
}
//get name from url
var getNameFromUrl = function(url){
  if (url) {
    var s=url.lastIndexOf("/")+1,e =url.lastIndexOf(".");
    return s<e ? url.substring(s,e) : "";
  }
  return "";
}
//get style from object style
var getStyle = function(selector,styleObj){
  var isAttribute = false;
  var newStyle = selector+"{";
  for(var attr in styleObj) {
    if (styleObj[attr]) {
      isAttribute = true;
      newStyle += attr+" : "+styleObj[attr]+";";
    }
  }
  newStyle+="}";
  return isAttribute ? newStyle : "";
}
// get lighter color from rgba colors
var getLighter = function(rgba){
  var o = /[^,]+(?=\))/g.exec(rgba)[0]*0.75;
  return rgba.replace(/[^,]+(?=\))/g,o);
}
//remove html from text
if (!String.prototype.strip) {
    String.prototype.strip = function() {
        return this.replace(/(<[^>]+>)/ig," ").trim();
    }
}
//remove all child node
if (!Node.prototype.empty) {
    Node.prototype.empty = function(){
        while (this.firstChild) {
            this.removeChild(this.firstChild);
        }
    }
}
if (!HTMLElement.prototype.hasClass) {
    Element.prototype.hasClass = function(c) {
        return (" "+this.className+" ").replace(/[\n\t]/g, " ").indexOf(" "+c+" ") > -1;
    }
}
if (!HTMLElement.prototype.addClass) {
    HTMLElement.prototype.addClass = function(c) {
        if (!this.hasClass(c)) this.className += (" " +c);
        return this;
    }
}
if (!HTMLElement.prototype.removeClass) {
    HTMLElement.prototype.removeClass = function(c) {
        if (this.hasClass(c)) this.className = (" "+this.className+" ").replace(" "+c+" "," ").trim();
        return this;
    }
}
/*--------------=== Main function ===--------------*/
var timer,widget = null;
if (typeof BannerFlow != 'undefined') {
  BannerFlow.addEventListener(BannerFlow.SETTINGS_CHANGED, function() {
    clearTimeout(timer);
    timer = setTimeout(function(){
      if (widget==null) {
        widget = new SlotMachine();
        widget.addListener(BannerFlow);
      }
      widget.init(BannerFlow);
      widget.beforeRun();
    },500);
  });
}else {
  window.addEventListener("load",function(e){
    if (widget==null) {
      widget = new SlotMachine();
      widget.addListener();
    }
    widget.init();
    widget.beforeRun();
  })
}