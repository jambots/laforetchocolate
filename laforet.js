var sourceWidth=798;
var sourceHeight=1092;
var sourceAspect=sourceWidth/sourceHeight;
var thumbWidth;
var thumbHeight;
var rotorItemWidth=100;
var rotorItemHeight=100;
var rotorItemFit="unset";
var flowItemWidth=100;
var flowItemHeight=100;
var absScreenWidth=100;
var absScreenHeight=100;
var viewportWidth=100;
var viewportHeight=100;
var viewportAspect=1;
var portraitScreenHeight=100;
var landscapeScreenHeight=100;
var portraitScreenWidth=100;
var landscapeScreenWidth=100;
var blingHeight=0;
var screenAspect=1;
var landscapeKnown=false;
var portraitKnown=false;
var portraitContentHeight=0;
var portraitContentWidth=0;
var portraitContentAspect=0;
var orient="unset";
var cellsDown=10;
var cellsAcross=33;
var deviceWidth=330;
var modalWidth=32;	
var selectWidth=28;	
var modalMargin=(cellsAcross-modalWidth)/2;
var bothKnown=false;
var flowWidth=0;
var flowAtItem=0;
var flowProg=1;
var flowMax=0;
var flowDockStartAt=0;
var flowDockStartX=0;
var flowDragStartAt=0;
var flowDragStartX=0;
var selectPopulated=false;
var setTappedNum=0;
var setTappedMs=-1;
var thumbTappedNum=0;
var thumbTappedMs=-1;
var rotorTappedNum=0;
var rotorTappedMs=-1;
var touchingRotor=false;
var flowTappedNum=0;
var flowTappedMs=-1;
var touchingFlow=false;
var rotorUp=false;
var rotorWidth=0;
var rotorAtItem=0;
var rotorProg=1;
var rotorMax=0;
var rotorDockStartAt=0;
var rotorDockStartX=0;
var rotorDragStartAt=0;
var rotorDragStartX=0;
var mouseX=0;



var flipDeg=0;
var flip=false;
var flipTarget=-1;
var infoUp=false;
var cols;
var rows;
var defaultBase64="";
var scrollsSet=false;
var grid=3;

var includedImageUrls=[];
var unfaveArray=[];
var faveItem;
var holdThumbRef;
var ddiv;
var sdiv
var agent="unknown";
var fileSystem;
var db;
var loadQueue=[];
var setKeys=["9999_Favorites"];
var sets={"9999_Favorites":[]};
var selectUp=true;
var setReady=false;
var selectedSetNum=0;
var selectedThumbNum=-1;

var loadTimeout;
var animTimeout;
var orientationInterval;




function init(){
  ddiv=document.getElementById('debugDiv');
  sdiv=document.getElementById('setSelectScroller'); 
  if(navigator.userAgent.indexOf('Windows')>-1){agent="windows";}
  if(navigator.userAgent.indexOf('Linux')>-1){agent="droid";}
  if(navigator.userAgent.indexOf('Mac')>-1){agent="mac";}
  if(navigator.userAgent.indexOf('iPad')>-1){agent="ios";}
  if(navigator.userAgent.indexOf('iPhone')>-1){agent="ios";}
  //dbuga("agent="+agent);
  //dbuga("web="+web);
  
  if(web){resumeInit();}
  else{
    document.addEventListener("deviceready", resumeInit, false);
    //dbuga("uh... web="+web);
    }
  }

function debugSelect(selectString){
   db.transaction(function(tx) {
            tx.executeSql(selectString, [], function(tx, results) {
              for (var i=0; i < results.rows.length; i++){
                row = results.rows.item(i);
                var rowString=JSON.stringify(row);
                var temp=rowString.split("/");
                rowString=temp.pop();
                //dbuga("row is " + rowString);
                }
            });
   });


}

function setupDb(){
  if(web==false){
    db = window.sqlitePlugin.openDatabase({name: "my.db", location: 2});
    //dbuga('setupDb() ');
    
    if(localStorage.getItem("tableCreated") == "false"){
      //dbuga('tableCreated=false ');
      db.transaction(function(tx) {
        tx.executeSql('DROP TABLE IF EXISTS test_table');
        tx.executeSql('CREATE TABLE IF NOT EXISTS test_table (id integer primary key, image_url text, image_data text)');
        localStorage.setItem("tableCreated", "true");
        //dbuga('tableCreated=true ');
        });
      localStorage.setItem("nameStack", JSON.stringify([]));
      }
    }
  }
function appPaused(){
  localStorage.setItem("selectedSetNum", selectedSetNum);
  //dbuga('appPaused()');
  }
function appResumed(){
  //dbuga('appResumed()');
  loadDataWp();
  }
function resumeInit(){
  dbug('');
  document.addEventListener("pause", appPaused, false);
  document.addEventListener("resume", appResumed, false);

  //retrieves and sets defaultBase64 
  var stashObj = new stashDefault("uploads/default.png");
  stashObj.LoadPage();
  

  
  orientationTick();
  //debugGeometry();
  //dbuga('end of resumeInit orientationTick() ran');
  setKeys=["9999_Favorites"];
  sets={"9999_Favorites":[]};
  setupLocalStorage();
  setupDb();
  setupEvents();
  includedImageUrls=[];
  parseDataWp(includedFeed, true);
  //dbuga("includedImageUrls ="+includedImageUrls.length);
  loadDataWp();
  clearInterval(orientationInterval);
  orientationInterval=setInterval('orientationTick()', 100);
  }
function saveSetsToLocalStorage(){
  //dbuga("saveSetsToLocalStorage() "+setKeys.length);
  localStorage.setItem("selectedSetNum", "0");
  localStorage.setItem("sets", JSON.stringify(sets));
  localStorage.setItem("setKeys", JSON.stringify(setKeys));
  }
function setupLocalStorage(){
  if(localStorage.getItem("tableCreated") === null) {
    localStorage.setItem("tableCreated", "false");
    }
  else{
    
    }

  if(localStorage.getItem("selectedSetNum") === null) {
    localStorage.setItem("selectedSetNum", "0");
    }
  else{
    selectedSetNum=Number(localStorage.getItem("selectedSetNum"));
    }
  
  if(localStorage.getItem("sets") === null) {
    localStorage.setItem("sets", JSON.stringify(sets));
    }
  else{
    sets =JSON.parse(localStorage.getItem("sets"));
    }

  if(localStorage.getItem("setKeys") === null) {
    localStorage.setItem("setKeys", JSON.stringify(setKeys));
    //dbuga('localStorage set setKeys:'+setKeys.length);
    }
  else{
    setKeys=JSON.parse(localStorage.getItem("setKeys"));
    //dbuga('localStorage get setKeys:'+setKeys.length);
    }

  if(localStorage.getItem("nameStack") === null) {
    localStorage.setItem("nameStack", "[]");
    }
  else{
    //dbuga("nameStack "+JSON.parse(localStorage.getItem("nameStack")).length);
    }
  }
function setupEvents(){
  //dbuga('setupEvents() '+agent);
  if((agent=="windows")||(agent=="mac")){
    document.onmousemove=function(e){
      //dbug(e.pageX);
      if((touchingRotor)||(touchingFlow)){
        e.preventDefault();
        mouseSwipe(e);
        }
      }
    document.getElementById("infoCancel").onmousedown=function(e){infoCancel();}
    document.getElementById("jambotsButton").onmousedown=function(e){jambotsButton();}
    document.getElementById("setSelectCancel").onmousedown=function(e){hideSetSelect();}
    document.getElementById("setSelectButton").onmousedown=function(e){showSetSelect();}
    document.getElementById("infoButton").onmousedown=function(e){showInfo();}
    document.getElementById("thumbsButton").onmousedown=function(e){hideRotor();}
    document.getElementById("mailButton").onmousedown=function(e){mailButton();}
    document.getElementById("linkButton").onmousedown=function(e){linkButton();}
    document.getElementById("saveButton").onmousedown=function(e){saveButton();}
    document.getElementById("prevButton").onmousedown=function(e){prevButton();}
    document.getElementById("nextButton").onmousedown=function(e){nextButton();}
    document.getElementById("faveButton").onmousedown=function(e){faveButton();}
    document.getElementById("landscapeMain").onmousedown=function(e){flowClick(event);}
    document.getElementById("landscapeMain").onmouseup=function(e){flowMouseup(event);}
    }
  if((agent=="droid")||(agent=="ios")){
    document.ontouchmove=function(e){
      if((touchingRotor)||(touchingFlow)){
        e.preventDefault();
        touchSwipe(e);
        }
      }
    document.getElementById("infoCancel").ontouchstart=function(e){infoCancel();}
    document.getElementById("jambotsButton").ontouchstart=function(e){jambotsButton();}
    document.getElementById("setSelectCancel").ontouchend=function(e){hideSetSelect();}
    document.getElementById("setSelectButton").ontouchstart=function(e){showSetSelect();}
    document.getElementById("infoButton").ontouchstart=function(e){showInfo();}
    document.getElementById("thumbsButton").ontouchstart=function(e){hideRotor(); initOrRefreshScrolls();}
    document.getElementById("mailButton").ontouchstart=function(e){mailButton();}
    document.getElementById("linkButton").ontouchstart=function(e){linkButton();}
    document.getElementById("saveButton").ontouchstart=function(e){saveButton();}
    document.getElementById("prevButton").ontouchstart=function(e){prevButton();}
    document.getElementById("nextButton").ontouchstart=function(e){nextButton();}
    document.getElementById("faveButton").ontouchstart=function(e){faveButton();}
    document.getElementById("landscapeMain").ontouchstart=function(e){flowTap(event);}
    document.getElementById("landscapeMain").ontouchend=function(e){flowRelease(event);}
    document.addEventListener("backbutton", onBackKeyDown, false);
    }
  }
function mailButton(){
  window.location='mailto:info@laforetchocolate.com';
  }
function linkButton(){
  //dbuga('linkButton');
  //window.plugins.ChildBrowser.showWebPage('http://www.laforetchocolate.com',{ showLocationBar: true });
  //navigator.app.loadUrl("http://www.laforetchocolate.com", {openExternal: true});
  window.open("http://www.laforetchocolate.com", "_system");
  }
function jambotsButton(){
  //dbuga('jambotsButton');
  //window.plugins.ChildBrowser.showWebPage('http://www.jambots.com',{ showLocationBar: true });
  //navigator.app.loadUrl("http://www.jambots.com", {openExternal: true});
  window.open("http://www.jambots.com", "_system");
  }
function purgeCache(){
  dbuga('purgeCache()');
  var nameStack=JSON.parse(localStorage.getItem('nameStack'));
  for (var n=0; n<nameStack.length; n++){
    localStorage.setItem(nameStack[n], "");
    }
  localStorage.setItem("nameStack", "[]");
  updateSet();
  }
function saveButton(){
  var saveName=faveItem.largeUrl;
  var temp=saveName.split("/");
  var cat=temp[0];
  var season=temp[1];
  var fileName=temp[2];
  fileName = fileName.replace(".jpg", "");

  //dbuga('saveButton() fileName='+fileName); 
  var temp=season.split("_");
  season=temp[1];
  saveName=season+"_"+fileName;
  
            uiMessage('Saving...');
  
  var dstCanvas = document.createElement('canvas');
  dstCanvas.width = rotorItemWidth;
  dstCanvas.height = rotorItemHeight;
    
    // Draw Image content in canvas
  var dstContext = dstCanvas.getContext('2d');
  dstContext.fillStyle="white";
  dstContext.fillRect(0, 0, rotorItemWidth, rotorItemHeight);
  var imageObject=document.getElementById('rotorImage~'+faveItem.largeUrl);
  dstContext.drawImage(imageObject, 0, 0, rotorItemWidth, rotorItemHeight);



    window.canvas2ImagePlugin.saveImageDataToLibrary(
        function(msg){
            uiMessage('Saved');
        },
        function(err){
            uiMessage('Error: '+err);
        },
        dstCanvas
    );

  var canv=document.getElementById("saveButton");
  canv.width=Math.floor(grid*3);
  canv.height=Math.floor(grid*3);
  canv.style.top=grid*.5+"px";
  canv.style.left=grid*.5+"px";
  //roundRect(canv, "rgba(0,0,0,0)", "rgba(255,0,0,0)", "G", "#fff", Math.floor(grid*2)+"px signify", false);
  roundRect(canv, "#666", "#66f", "G", "#fff", Math.floor(grid*2)+"px signify", false);

  }
function uiMessage(msg){
  document.getElementById("rotorLabel").innerHTML=msg;
  }
function isFavorite(largeUrl){
  var isFav=false;
  var faveSet=sets["9999_Favorites"];
  for (var f=0; f<faveSet.length; f++){
    if(faveSet[f].largeUrl==largeUrl){isFav=true;}
    }
  return isFav;
  }
function listFavorites(largeUrl){
  //dbuga("faveItem=" +faveItem.title);
  var faveSet=sets["9999_Favorites"];
  for (var f=0; f<faveSet.length; f++){
    //dbuga(faveSet[f].title);
    }
  }

function removeFavorite(largeUrl){
  var faveSet=sets["9999_Favorites"];
  var keepSet=[];
  for (var f=0; f<faveSet.length; f++){
    if(faveSet[f].largeUrl != largeUrl){keepSet.push(faveSet[f]);}
    }
  sets["9999_Favorites"]=keepSet;
  saveSetsToLocalStorage();
  listFavorites();
  }

function addFavorite(item){
  if(isFavorite(item.largeUrl)==false){
    var clone=JSON.parse(JSON.stringify(item));
    sets["9999_Favorites"].push(clone);
    saveSetsToLocalStorage();
    }
  listFavorites();
  }
function faveButton(){
  //dbuga("faveButton faveItem.largeUrl="+faveItem.largeUrl);
  var faveCanv=document.getElementById('faveButton'); 
  var selectedSetKey=setKeys[selectedSetNum];
  var set=sets[selectedSetKey];
  if(selectedSetKey=="9999_Favorites"){//toggle unfave
    if(unfaveArray.indexOf(faveItem.largeUrl) == -1){
      unfaveArray.push(faveItem.largeUrl);
      }
    else{
      var temp=unfaveArray;
      unfaveArray=[];
      for (var i=0; i<temp.length; i++){
        if(temp[i]!=faveItem.largeUrl){
          unfaveArray.push(temp[i]);
          }
        }
      }
    }
  else{// in normal set so toggle immediately
    if(isFavorite(faveItem.largeUrl)==true){// copy remove loop
      removeFavorite(faveItem.largeUrl);
      }
    else{
      addFavorite(faveItem);
      }
    }

  // update button display
  if((isFavorite(faveItem.largeUrl)==true)&&(unfaveArray.indexOf(faveItem.largeUrl) == -1)){
    roundRect(faveCanv, "#666", "#66f", "H", "#fff", Math.floor(grid*2)+"px signify", false);
    }
  else{
    roundRect(faveCanv, "#666", "#222", "H", "#fff", Math.floor(grid*2)+"px signify", false);
    }
  }
function orientationTick(){
  if(viewportWidth != window.innerWidth){
    measure();
    }
  }

function measure(){ //fires after window.innerWidth changed in orientation tick
  //dbuga("<br />measure()");
  bothKnown=false;
  if((portraitKnown)&&(landscapeKnown)){bothKnown=true;}
  viewportWidth=window.innerWidth;
  viewportHeight=window.innerHeight;
  var prevOrient=orient;
  var matched=false;
  if(viewportWidth>viewportHeight){
    orient="landscape";
    landscapeKnown=true;
    if((landscapeScreenWidth==viewportWidth)&&(landscapeScreenHeight==viewportHeight)){matched=true;}
    landscapeScreenWidth=viewportWidth;
    landscapeScreenHeight=viewportHeight;
    absScreenHeight=landscapeScreenWidth;
    if(portraitKnown==false){// let's play guess the portrait dimension! 
      portraitScreenWidth=viewportHeight;
      portraitScreenHeight=viewportWidth;
      absScreenWidth=portraitScreenWidth;
      }
    }
  else{
    orient="portrait";
    portraitKnown=true;
    if((portraitScreenWidth==viewportWidth)&&(portraitScreenHeight==viewportHeight)){matched=true;}

    portraitScreenWidth=viewportWidth;
    portraitScreenHeight=viewportHeight;
    absScreenWidth= portraitScreenWidth;
    if(landscapeKnown==false){// let's play guess the landscape dimension! 
      landscapeScreenWidth=viewportHeight;
      landscapeScreenHeight=viewportWidth;
      absScreenHeight=viewportWidth;
      }
    }
  var needsUpdateSet=false;
  if(orient != prevOrient){
    if((portraitKnown)&&(landscapeKnown)&&(bothKnown==false)){
      bothKnown=true;
      absScreenWidth=portraitScreenWidth;
      absScreenHeight=landscapeScreenWidth;
      blingHeight=portraitScreenWidth-landscapeScreenHeight;
      cellsDown=Math.floor((absScreenHeight-blingHeight)/grid);
      //dbuga("blingHeight ="+ blingHeight +' cellsDown:'+cellsDown);
      //flowItemHeight=Math.floor(landscapeScreenHeight*.8);
      //flowItemWidth=Math.floor(flowItemHeight*sourceAspect);


      //dbuga('just learned both dimension so updateSet() after imageGeometry');
      if(matched==false){
        //dbuga('mismatch so, update needed');
        needsUpdateSet=true;
        }
      else{
        //dbuga('predicted correctly, no update needed!');
        }
      }
    }
  if(orient != prevOrient){
    if(orient=="portrait"){
      rotorAtItem=flowAtItem;
      initOrRefreshScrolls();
      //dbuga('changed to portrait so populateSelect()  or  updateSelectButtons()');
      //if(selectPopulated==false){
      //  //dbuga('selectPopulated false so populateSelect()');
      //  populateSelect();
      //  }
      //else{updateSelectButtons();}
      }
    else{
      flowAtItem=rotorAtItem;
      flowDockStartAt=rotorAtItem;
      flowProg=0;
      //dbuga('changed to landscape flowAtItem='+ flowAtItem +' flowDockStartAt='+ flowDockStartAt);
      }
    }
  cellsAcross=32;
  if(absScreenWidth>540){cellsAcross=48;}
  var newGrid=absScreenWidth/cellsAcross;
  if(grid != newGrid){// init or resize somehow, not on rotate
    grid=newGrid;
    cellsDown=Math.floor((absScreenHeight-blingHeight)/grid);
    }
  if(orient=="landscape"){
    //main hide landscape
    document.getElementById('portraitMain').style.display="none";
    document.getElementById('landscapeMain').style.display="block";
    }
  else{
    //main hide portrait
    document.getElementById('portraitMain').style.display="block";
    document.getElementById('landscapeMain').style.display="none";
    }
  imageGeometry();
  if(needsUpdateSet){
    //dbuga('needsUpdateSet so populateSelect() updateSet()');
    populateSelect(); //will style ui then refresh scrolls
    updateSet();
    }
  //debugGeometry();
  //dbuga("measured");
  }



function returnWidthHeight(imageData){
  var img=new Image();
  img.src=imageData;
  return {"width":img.width, "height":img.height};
  }
function debugGeometry(){
dbug("<br>grid="+ grid);

dbuga("loadQueue="+ loadQueue.length);
//dbuga("modalWidth="+ modalWidth);
//dbuga("modalMargin ="+ modalMargin);
dbuga("selectWidth="+ selectWidth);

//dbuga("web="+ web);
dbuga("flip="+flip);
dbuga("rotorAtItem="+ rotorAtItem);
dbuga("flowAtItem="+ flowAtItem);
dbuga("rotorAtItem="+ rotorAtItem);
dbuga("flowAtItem="+ flowAtItem);
dbuga("rotorItemFit="+ rotorItemFit);
dbuga("portraitKnown="+ portraitKnown);
dbuga("landscapeKnown ="+ landscapeKnown);
dbuga("sourceHeight="+ sourceHeight);
dbuga("sourceWidth="+ sourceWidth);
dbuga("sourceAspect="+ sourceAspect);
dbuga("thumbWidth="+ thumbWidth);
dbuga("thumbHeight="+thumbHeight);
dbuga("rotorItemWidth="+rotorItemWidth);
dbuga("rotorItemHeight="+rotorItemHeight);
dbuga("flowItemWidth="+ flowItemWidth);
dbuga("flowItemHeight="+ flowItemHeight);
dbuga("absScreenWidth="+ absScreenWidth);
dbuga("absScreenHeight="+ absScreenHeight);
dbuga("viewportWidth="+ viewportWidth);
dbuga("viewportHeight="+ viewportHeight);
dbuga("portraitScreenWidth="+ portraitScreenWidth);
dbuga("portraitScreenHeight="+ portraitScreenHeight);
dbuga("portraitContentWidth="+ portraitContentWidth);
dbuga("portraitContentHeight="+ portraitContentHeight);
dbuga("portraitContentAspect="+ portraitContentAspect);
dbuga("landscapeScreenWidth="+ landscapeScreenWidth);
dbuga("landscapeScreenHeight="+ landscapeScreenHeight);
dbuga("blingHeight="+ blingHeight);
dbuga("selectedSetNum="+ selectedSetNum);
  }

function imageGeometry(){
  //dbuga('imageGeometry()');
  flowItemHeight=Math.floor(landscapeScreenHeight*.8);
  flowItemWidth=Math.floor(flowItemHeight*sourceAspect);
  if(orient=="landscape"){
    var prevWidth=landscapeScreenWidth; 
    if(prevWidth==100){
      //dbuga("image geometry prevWidth==100 so prepareRotor");
      prepareRotor();
      }
    }
  else{// portrait
    var prevWidth=portraitScreenWidth;

    
    thumbWidth=Math.floor(portraitScreenWidth/3);
    thumbHeight=Math.floor(thumbWidth/sourceAspect);
    portraitContentHeight=portraitScreenHeight-grid*8;
    portraitContentWidth=portraitScreenWidth;
    portraitContentAspect=portraitContentWidth/portraitContentHeight;
    if(portraitContentAspect<sourceAspect){// squatter so pad top
      //dbuga('squater');
      rotorItemWidth=Math.floor(portraitScreenWidth);
      rotorItemHeight=Math.floor(rotorItemWidth/sourceAspect);
      rotorItemFit="squatter";
      }
    else{// taller
      //dbuga('taller');
      rotorItemHeight=Math.floor(portraitContentHeight);
      rotorItemWidth=Math.floor(rotorItemHeight*sourceAspect);
      rotorItemFit="taller";
      }
    if(prevWidth==100){
      //dbuga('prevWidth==100 so updateThumbButtons('+thumbWidth+') and prepareFlow('+flowItemWidth+') ');
      prepareFlow();
      prepareRotor();
      updateThumbButtons();
      }
    }
  }

function selectSet(setNum){
  if(selectedSetNum != setNum){
    selectedSetNum=setNum;
    localStorage.setItem("selectedSetNum", setNum);
    //dbuga("selectSet("+setNum+") so updateSet()");
    
    updateSet();
    }
  hideSetSelect();
  }
function hideRotor(){
  rotorUp=false;
  document.getElementById('thumbsUi').style.display="block";
  document.getElementById('rotorUi').style.display="none";
  var selectedSetKey=setKeys[selectedSetNum];

  if(selectedSetKey=="9999_Favorites"){
    //purge unfaves
    for (var u=0; u<unfaveArray.length; u++){
      removeFavorite(unfaveArray[u]);
      }
    unfaveArray=[];
    //dbuga('hideRotor updateSet()');
    updateSet();
    }
  }
function updateSet(){
  //alert("updateSet()");
  //dbuga('updateSet()');
  updateThumbButtons();
  //dbuga("updateThumbButtons() ran");
  updateSelectButtons();
  //dbuga("updateSelectButtons() ran");
  prepareFlow();
  //dbuga('prepareFlow() ran');
  prepareRotor();
  //dbuga('prepareRotor() ran');
  animTick();
  setReady=true;
  }
function prepareFlow(){
  var selectedSetKey=setKeys[selectedSetNum];
  var set=sets[selectedSetKey];

  var htmlString="";

  for (var i=0; i<set.length; i++){
    
    htmlString+='<canvas class="flowPanel" id="flowBack~'+set[i].largeUrl+'" style="background-color:#fff; position:absolute;" width='+flowItemWidth+'  height='+flowItemHeight+'></canvas>';

    htmlString+='<div class="flowPanel" id="flowImage~'+set[i].largeUrl+'" style="background-color:#fff; width:'+flowItemWidth+'px; height:'+flowItemHeight+'px; position:absolute; left:'+flowItemWidth*i+'px;"></div>';

    }

  flowWidth=(flowItemWidth*set.length);
  flowMax=flowWidth-flowItemWidth;
  document.getElementById("flow").innerHTML=htmlString;
  //document.getElementById("flow").style.width=flowWidth+"px";
  // resize?
  for (var i=0; i<set.length; i++){
    var flowBackRef=document.getElementById('flowBack~'+set[i].largeUrl);
    var context = flowBackRef.getContext('2d');
    var maxWidth = flowItemWidth*.95;// was .8 march 1 2016
    var lineHeight = flowItemWidth/10;
    var x = (flowItemWidth) / 2;
    var y = lineHeight*2;
    context.font = flowItemWidth/14+'pt engoth';
    context.fillStyle = '#000';
      context.strokeStyle = '#000';
      context.lineWidth = lineHeight/40;
    context.textAlign="center";
    context.textBaseline="middle";

    //var titleLines=wrapText(context, set[i].title, x, y, maxWidth, lineHeight,true);
    //y=lineHeight*(2.5+titleLines);
    y=lineHeight*2;
    context.font = flowItemWidth/14+'pt filoital';
    var descLines=wrapText(context, set[i].desc, x, y, maxWidth, lineHeight,false);
    }
  }

function flowClick(e){
  //dbuga('flowClick');
  if(agent=="droid"){return false;}
  e.preventDefault();
  mouseX=e.pageX;
  touchingFlow=true;
  flowDragStartX=mouseX;
  flowDragStartAt=flowAtItem;
  //rotorTappedNum=i;
  var d = new Date();
  flowTappedMs=d.getTime();
  }
function flowMouseup(e){
  //dbuga('flowMouseup');
  if(agent=="droid"){return false;}
  if(flowTappedMs==-1){
    return false;
    }
  var d = new Date();
  var deltaT=d.getTime()-flowTappedMs;
  if(deltaT<400){
    //selectFlow(flowTappedNum);
    }
  else{
    }
  flowProg=1;
  flowDockStartAt=flowAtItem;
  flowDockStartX=mouseX;
  touchingFlow=false;
  flowTappedMs=-1;
  }

function roundRect(canv, color, background, label, labelColor, font, pointy){
  var ctx=canv.getContext('2d');
  var rad=grid/2;
  var pad=grid/8;
  ctx.lineWidth=grid/8; 
  ctx.strokeStyle=color;
  ctx.beginPath();
  ctx.arc(canv.width-rad-pad,rad+pad, rad, pi*1.5, pi*2, false);
  ctx.arc(canv.width-rad-pad,canv.height-rad-pad, rad, pi*0, pi*.5, false);
  if(pointy){
    ctx.lineTo(pad+canv.height/2,canv.height-pad);
    ctx.lineTo(0,canv.height/2);
    ctx.lineTo(pad+canv.height/2,pad);
    }
  else{
    ctx.arc(rad+pad,canv.height-rad-pad, rad, pi*.5, pi*1, false);
    ctx.arc(rad+pad,rad+pad, rad, pi*1, pi*1.5, false);
    }
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle=background;
  ctx.fill();
  ctx.fillStyle=labelColor;
  ctx.textBaseline= "middle";  
  ctx.textAlign= "center";  
  ctx.font=font;  
  ctx.fillText(label,canv.width/2,canv.height/2);
  }
function infoCancel(){
  //dbuga('infoCancel()');
  hideInfo();
  }

function populateSelect(){
  document.getElementById('setSelectDim').style.display="none";

  setKeys=setKeys.sort();
  setKeys=setKeys.reverse();
  selectPopulated=true;
  //dbuga('populateSelect() setKeys.length='+ setKeys.length);
  modalWidth=32;	
  selectWidth=28;	
  modalMargin=(cellsAcross-modalWidth)/2;
  //dbuga(modalMargin);
  var htmlString="";
  htmlString+='<div style="height:'+grid*2+'px; width:'+grid*selectWidth+'px;float:left;"></div>';
  for (var s=0; s<setKeys.length; s++){
    htmlString+='<div style="height:'+grid*4+'px; width:'+grid*selectWidth+'px; padding-left:'+grid*2+'px; float:left;">';
    htmlString+='<canvas ontouchstart="setTap('+s+')" ontouchend="setRelease('+s+')" height='+Math.floor(grid*4)+' width='+Math.floor(grid*selectWidth)+' id="canv_'+s+'" style="position:absolute;"></canvas>';
    htmlString+='</div>';
    if(s==0){// fav spacer
    htmlString+='<div style="height:'+grid*2+'px; width:'+grid*selectWidth+'px;float:left;"></div>';
      }
    }
  sdiv.innerHTML=htmlString;
  window.setTimeout("styleUi()", 100);
  if(selectUp){
    document.getElementById('setSelectDim').style.display="block";
    }
  }
function styleUi(){
  document.getElementById("infoLabel").style.width=grid*modalWidth/2+"px";
  document.getElementById("infoLabel").style.left=grid*modalWidth/4+"px";
  document.getElementById("infoLabel").style.top=grid*1+"px";
  document.getElementById("infoLabel").style.fontSize=grid*2+"px";

  document.getElementById("setSelectLabel").style.width=grid*modalWidth/2+"px";
  document.getElementById("setSelectLabel").style.left=grid*modalWidth/4+"px";
  document.getElementById("setSelectLabel").style.top=grid*1+"px";
  document.getElementById("setSelectLabel").style.fontSize=grid*2+"px";

  document.getElementById("thumbsLabel").style.width=portraitScreenWidth/2+"px";
  document.getElementById("thumbsLabel").style.left=portraitScreenWidth/4+"px";
  document.getElementById("thumbsLabel").style.top=grid*1+"px";
  document.getElementById("thumbsLabel").style.fontSize=grid*2+"px";
   
  document.getElementById("rotorLabel").style.width=portraitScreenWidth/2+"px";
  document.getElementById("rotorLabel").style.left=portraitScreenWidth/4+"px";
  document.getElementById("rotorLabel").style.top=grid*1+"px";
  document.getElementById("rotorLabel").style.fontSize=grid*2+"px";
   
  document.getElementById("setSelectModal").style.width=grid*modalWidth+"px";
  document.getElementById("setSelectModal").style.height=(grid*(cellsDown-2*modalMargin))+"px";
  document.getElementById("setSelectModal").style.top=grid*modalMargin+"px";
  document.getElementById("setSelectModal").style.left=grid*modalMargin+"px";

  document.getElementById("setSelectHolder").style.width=grid*modalWidth+"px";
  document.getElementById("setSelectHolder").style.height=(portraitScreenHeight-grid*4-grid*modalMargin*2)+"px";
  document.getElementById("setSelectHolder").style.top=grid*4+"px";
  document.getElementById("setSelectScroller").style.width=grid*modalWidth+"px";

  document.getElementById("infoModal").style.width=grid*modalWidth+"px";
  document.getElementById("infoModal").style.height=(grid*(cellsDown-2*modalMargin))+"px";
  document.getElementById("infoModal").style.top=grid*modalMargin+"px";
  document.getElementById("infoModal").style.left=grid*modalMargin+"px";

  document.getElementById("infoHolder").style.width=grid*modalWidth+"px";
  document.getElementById("infoHolder").style.height=(portraitScreenHeight-grid*8-grid*modalMargin*2)+"px";
  document.getElementById("infoHolder").style.top=grid*4+"px";

  document.getElementById("infoNavTop").style.height=grid*4+"px";
  document.getElementById("infoNavTop").style.width=grid*modalWidth+"px";
  document.getElementById("infoNavBottom").style.top=(portraitScreenHeight-grid*4-grid*modalMargin*2)+"px";
  document.getElementById("infoNavBottom").style.height=grid*4+"px";
  document.getElementById("infoNavBottom").style.width=grid*modalWidth+"px";


  sdiv.style.height=(setKeys.length+1.5)*grid*4+"px";

  document.getElementById("thumbsHolder").style.height=(portraitScreenHeight-grid*8)+"px";
  document.getElementById("thumbsHolder").style.top=grid*4+"px";
  document.getElementById("thumbsNavTop").style.height=grid*4+"px";
  document.getElementById("thumbsNavTop").style.width=portraitScreenWidth+"px";
  document.getElementById("thumbsNavBottom").style.top=(portraitScreenHeight-grid*4)+"px";
  document.getElementById("thumbsNavBottom").style.height=grid*4+"px";
  document.getElementById("thumbsNavBottom").style.width=portraitScreenWidth+"px";

  document.getElementById("rotor").style.top=(grid*4)+"px";
  document.getElementById("rotorNavTop").style.height=grid*4+"px";
  document.getElementById("rotorNavTop").style.width=portraitScreenWidth+"px";
  document.getElementById("rotorNavBottom").style.top=(portraitScreenHeight-grid*4)+"px";
  document.getElementById("rotorNavBottom").style.height=grid*4+"px";
  document.getElementById("rotorNavBottom").style.width=portraitScreenWidth+"px";

  document.getElementById("setSelectNavTop").style.height=grid*4+"px";
  // buttons  
  var canv=document.getElementById("mailButton");
  canv.width=Math.floor(grid*3);
  canv.height=Math.floor(grid*3);
  canv.style.top=grid*.5+"px";
  canv.style.left=grid*.5+"px";
  roundRect(canv, "rgba(0,0,0,0)", "rgba(255,0,0,0)", "E", "#fff", Math.floor(grid*2)+"px signify", false);

  var canv=document.getElementById("linkButton");
  canv.width=Math.floor(grid*3);
  canv.height=Math.floor(grid*3);
  canv.style.top=grid*.5+"px";
  canv.style.left=portraitScreenWidth-grid*3.5+"px";
  roundRect(canv, "rgba(0,0,0,0)", "rgba(255,0,0,0)", "A", "#fff", Math.floor(grid*2)+"px signify", false);

  var canv=document.getElementById("jambotsButton");
  canv.width=Math.floor(grid*9);
  canv.height=Math.floor(grid*3);
  canv.style.top=grid*.5+"px";
  canv.style.left=(grid*modalWidth-grid*9.5)+"px";
  roundRect(canv, "#666", "#222", "jambots apps", "#fff", Math.floor(grid*1.25)+"px Arial", false);

  var canv=document.getElementById("saveButton");
  canv.width=Math.floor(grid*3);
  canv.height=Math.floor(grid*3);
  canv.style.top=grid*.5+"px";
  canv.style.left=grid*.5+"px";
  roundRect(canv, "rgba(0,0,0,0)", "rgba(255,0,0,0)", "G", "#fff", Math.floor(grid*2)+"px signify", false);

  var canv=document.getElementById("prevButton");
  canv.width=Math.floor(grid*3);
  canv.height=Math.floor(grid*3);
  canv.style.top=grid*.5+"px";
  canv.style.left=portraitScreenWidth*.333-grid*1.5+"px";
  roundRect(canv, "rgba(0,0,0,0)", "rgba(255,0,0,0)", "4", "#fff", Math.floor(grid*2)+"px signify", false);

  var canv=document.getElementById("nextButton");
  canv.width=Math.floor(grid*3);
  canv.height=Math.floor(grid*3);
  canv.style.top=grid*.5+"px";
  canv.style.left=portraitScreenWidth*.666-grid*1.5+"px";
  roundRect(canv, "rgba(0,0,0,0)", "rgba(255,0,0,0)", "2", "#fff", Math.floor(grid*2)+"px signify", false);

  var canv=document.getElementById("faveButton");
  canv.width=Math.floor(grid*3);
  canv.height=Math.floor(grid*3);
  canv.style.top=grid*.5+"px";
  canv.style.left=portraitScreenWidth-grid*3.5+"px";
  roundRect(canv, "#666", "#222", "H", "#fff", Math.floor(grid*2)+"px signify", false);





  var canv=document.getElementById("setSelectCancel");
  canv.width=Math.floor(grid*6);
  canv.height=Math.floor(grid*3);
  canv.style.top=grid*.5+"px";
  canv.style.left=grid*.5+"px";
  roundRect(canv, "#666", "#222", "Cancel", "#fff", Math.floor(grid*1.25)+"px Arial", false);

  var canv=document.getElementById("infoCancel");
  canv.width=Math.floor(grid*6);
  canv.height=Math.floor(grid*3);
  canv.style.top=grid*.5+"px";
  canv.style.left=grid*.5+"px";
  roundRect(canv, "#666", "#222", "Done", "#fff", Math.floor(grid*1.25)+"px Arial", false);

  var canv=document.getElementById("infoButton");
  canv.width=Math.floor(grid*3);
  canv.height=Math.floor(grid*3);
  canv.style.top=grid*.5+"px";
  canv.style.left=(grid*modalWidth-grid*4.5)+"px";

  var ctx=canv.getContext('2d');
  ctx.beginPath();
  ctx.arc(grid*1.5, grid*1.5,grid*1,0,pi*2,true);
  ctx.fillStyle="#fff";
  ctx.fill();
  ctx.font = "italic";
  roundRect(canv, "rgba(0,0,0,0)", "rgba(255,0,0,0)", "i", "#444", "bold italic "+Math.floor(grid*1.5)+"px Georgia", false);

  var canv=document.getElementById("setSelectButton");
  canv.width=Math.floor(grid*4);
  canv.height=Math.floor(grid*3);
  canv.style.top=grid*.5+"px";
  canv.style.left=grid*.5+"px";
  roundRect(canv, "#666", "#222", "", "", "", false);
  var ctx=canv.getContext('2d');
  ctx.lineWidth=grid/4; 
  ctx.strokeStyle="#fff";
  ctx.beginPath();
  ctx.moveTo(grid,grid*1);
  ctx.lineTo(grid*3,grid*1);
  ctx.moveTo(grid,grid*1.5);
  ctx.lineTo(grid*3,grid*1.5);
  ctx.moveTo(grid,grid*2.0);
  ctx.lineTo(grid*3,grid*2.0);
  ctx.stroke();
  ctx.strokeStyle="black";
  ctx.beginPath();
  ctx.moveTo(grid*1.5,grid*.5);
  ctx.lineTo(grid*1.5,grid*2.5);
  ctx.stroke();

  //dbuga('styleUi flowItemHeight='+flowItemHeight);
  initOrRefreshScrolls();

  }
function updateCacheButton(){
  var canv=document.getElementById("cacheButton");
  canv.style.top=grid*.5+"px";
  canv.style.left=(grid*.5)+"px";
  canv.width=Math.floor(grid*16);
  canv.height=Math.floor(grid*3);
  var cached=JSON.parse(localStorage.getItem('nameStack')).length;
  var label="JPEG ";
  if(cached>0){label+=" ("+cached+")";}
  roundRect(canv, "#666", "#222", label, "#fff", Math.floor(grid*1.25)+"px Arial", false);
  }

function rotorTap(i, e){
  //dbug('rotorTap '+rotorTappedMs);
  e.preventDefault();
  mouseX=e.touches[0].pageX;
  touchingRotor=true;
  rotorDragStartX=mouseX;
  rotorDragStartAt=rotorAtItem;
  rotorTappedNum=i;
  var d = new Date();
  rotorTappedMs=d.getTime();
  }
function rotorClick(i, e){
  if(agent=="droid"){return false;}
  e.preventDefault();
  mouseX=e.pageX;
  //dbuga('rotorClick '+rotorTappedMs);
  touchingRotor=true;
  rotorDragStartX=mouseX;
  rotorDragStartAt=rotorAtItem;
  rotorTappedNum=i;
  var d = new Date();
  rotorTappedMs=d.getTime();
  }

function prevButton(){// fake a gesture
  rotorProg=1;
  rotorDockStartAt=rotorAtItem-.01;
  rotorDockStartX=1;
  rotorDragStartX=0;
  }
function nextButton(){//fake a gesture
  rotorProg=1;
  rotorDockStartAt=rotorAtItem+.01;
  rotorDockStartX=0;
  rotorDragStartX=1;
  }

function thumbClick(i){
  if(agent=="droid"){return false;}
  thumbTappedNum=i;
  //dbuga("thumbTap("+i+") ");
  var d = new Date();
  thumbTappedMs=d.getTime();
  }

function thumbTap(i){
  thumbTappedNum=i;
  var d = new Date();
  thumbTappedMs=d.getTime();
  window.clearTimeout(loadTimeout);
  if(loadQueue.length>0){
    loadTimeout=window.setTimeout("loadTick()", 100);
    }
  }
function thumbRelease(i){
  if(thumbTappedMs==-1){
    return false;
    }
  var d = new Date();
  var deltaT=d.getTime()-thumbTappedMs;
  if(deltaT<200){
    //dbuga("thumbRelease("+i+") so selectThumb "+thumbTappedNum);
    selectThumb(thumbTappedNum);
    }
  thumbTappedMs=-1;
  }

function flowTap(e){
  //dbug('flowTap');
  e.preventDefault();
  mouseX=e.touches[0].pageX;
  touchingFlow=true;
  flowDragStartX=mouseX;
  flowDragStartAt=flowAtItem;
  var d = new Date();
  flowTappedMs=d.getTime();
  }

function flowRelease(){
  //dbuga('flowRelease '+ flowDockStartAt+' to '+flowAtItem);
  if(flowTappedMs==-1){
    return false;
    }
  flowProg=1;
  //dbuga('flowDockStartAt='+ flowDockStartAt);
  //dbuga('flowAtItem ='+flowAtItem);

  var deltaX=Math.abs(mouseX-flowDragStartX);
  //dbuga("touchEnd deltaX="+deltaX);
  if(deltaX<landscapeScreenWidth/16){ 
  //if(Math.abs(flowDockStartAt-flowAtItem)<.1){// barely dragged
    flowAtItem=flowDockStartAt;
    //dbuga("barely set flowAtItem="+flowAtItem);
    flowProg=0;
    if(flip){
      flip=false;
      }
    else{
      flip=true;
      flipTarget=flowDockStartAt;
      }
    //dbuga( " - flip="+flip);
    }
  else{
    if(flip){
      if(flowDockStartAt!=flowAtItem){
        flip=false;
        //dbuga("flowRelease un-flip");

        }
      }
    }
  //dbuga("so - flip="+flip);
  flowDockStartAt=flowAtItem;
  flowDockStartX=mouseX;
  touchingFlow=false;
  flowTappedMs=-1;
  }

function rotorRelease(i){
  if(rotorTappedMs==-1){
    return false;
    }

  rotorProg=1;
  //dbuga('rotorDockStartAt='+ rotorDockStartAt);
  //dbuga('rotorAtItem ='+rotorAtItem);
  //if(Math.abs(rotorDockStartAt-rotorAtItem)<.1){// barely dragged
  var deltaX=Math.abs(mouseX-rotorDragStartX);
  if(deltaX<landscapeScreenWidth/10){ 
    //dbuga("barely dragged flip="+flip);
    rotorAtItem=rotorDockStartAt;
    rotorProg=0;
    if(flip){
      flip=false;
      }
    else{
      flip=true;
      flipTarget=rotorDockStartAt;
      }
    //dbuga( " - flip="+flip);
    }
  else{
    if(flip){
      if(rotorDockStartAt!=rotorAtItem){
        flip=false;
        //dbuga("rotorRelease un-flip");

        }
      }
    }
  //dbuga("rotorAtItem = "+rotorAtItem + " so - flip="+flip);
  //dbuga("rotorProg="+rotorProg );
  rotorDockStartAt=rotorAtItem;

  rotorDockStartX=mouseX;
  touchingRotor=false;
  rotorTappedMs=-1;
  }

function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}
function isCached(imageKey){
  return inArray(imageKey, JSON.parse(localStorage.getItem("nameStack"))); 
  }
/*
.filo{font-family:filo,Georgia, Serif;}
.filoital{font-family:filoital,Georgia, Serif;}
.filoscaps{font-family:filoscaps,Georgia, Serif;}
.engoth{font-family:engoth,Arial,Helvetica,sans-serif;}
.sackm{font-family:sackm;}
.sackh{font-family:sackh;}
*/
function wrapText(context, text, x, y, maxWidth, lineHeight, stroke) {
  
  var words = text.split(' ');
        var line = '';
        var lineCount=0;
        for(var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          var metrics = context.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            if(stroke){context.strokeText(line, x, y);}
            line = words[n] + ' ';
            y += lineHeight;
            lineCount++;
          }
          else {
            line = testLine;
          }
        }
      context.fillText(line, x, y);
      if(stroke){context.strokeText(line, x, y);}
      lineCount++;
      return lineCount;
      }


function prepareRotor(){
  var selectedSetKey=setKeys[selectedSetNum];
  var set=sets[selectedSetKey];

  //dbuga("prepareRotor "+selectedSetKey+" "+set.length);
  var htmlString="";
  for (var i=0; i<set.length; i++){
    if((agent=="windows")||(agent=="mac")){
      htmlString+='<img id="rotorImage_'+set[i].largeUrl+'" onmousedown="rotorClick('+i+', event); return false;" onmouseup="rotorMouseup('+i+')"   src="spiral.gif" />';
      }

    if((agent=="droid")||(agent=="ios")){
      var itemLeft=Math.floor(i*rotorItemWidth);
      var style='style="background-color:white; ';
      style +='-webkit-transform:translate3d('+i*rotorItemWidth+'px,0,'+1*rotorItemWidth+'px);';
      style +=' -webkit-perspective: 2000; ';
      style +='position:absolute;  ';
      style +='left:'+itemLeft+'px;" ';
      style +='width='+(rotorItemWidth-2)+'  ';
      style +='height='+rotorItemHeight+'  ';
      
      htmlString+='<canvas id="rotorImage~'+set[i].largeUrl+'" ';
      htmlString+=style+' ';
      htmlString+='ontouchstart="rotorTap('+i+', event); return false;"  ';
      htmlString+='ontouchend="rotorRelease('+i+')"></canvas>';

      htmlString+='<canvas id="rotorBack~'+set[i].largeUrl+'" ';
      htmlString+=style+' ';
      htmlString+='ontouchstart="rotorTap('+i+', event); return false;" ';
      htmlString+='ontouchend="rotorRelease('+i+')">';
      htmlString+='</canvas>';
      }
    }

  rotorWidth=(rotorItemWidth*set.length);
  rotorMax=rotorWidth-rotorItemWidth;
  document.getElementById("rotor").innerHTML=htmlString;
  document.getElementById("rotor").style.width=portraitScreenWidth+"px";
  // desktop stops here, no ref wtf?
  //dbuga('prepareRotor completed setTimeout');
  window.setTimeout("resumePrepareRotor()", 100);
  }
function resumePrepareRotor(){

  //dbuga('resumePrepareRotor');
  var selectedSetKey=setKeys[selectedSetNum];
  var set=sets[selectedSetKey];

  for (var i=0; i<set.length; i++){
    var rotorRefId="rotorImage~"+set[i].largeUrl;
    //dbuga('resumePrepareRotor 3 i='+i+" "+rotorRefId);
    
    var rotorRef=document.getElementById(rotorRefId);
    var rotorBackRef=document.getElementById("rotorBack~"+set[i].largeUrl);
    var flowRef=document.getElementById("flowImage~"+set[i].largeUrl);
    var ctx=rotorRef.getContext("2d");
    ctx.strokeStyle="black";
    ctx.lineWidth=4;
    //ctx.strokeRect(0,0,rotorRef.width,rotorRef.height);


    var ctx=rotorBackRef.getContext("2d");
    ctx.strokeStyle="blue";
    ctx.lineWidth=4;
    //ctx.strokeRect(0,0,rotorRef.width,rotorRef.height);
    var context = rotorBackRef.getContext('2d');
    var maxWidth = rotorItemWidth*.95;
    var lineHeight = rotorItemWidth/10;
    var x = (rotorItemWidth) / 2;
    var y = lineHeight*2;
    context.font = rotorItemWidth/14+'pt engoth';
    context.fillStyle = '#000';
    context.strokeStyle = '#000';
    context.lineWidth = lineHeight/40;
    context.textAlign="center";
    context.textBaseline="middle";
    
    //var titleLines=wrapText(context, set[i].title, x, y, maxWidth, lineHeight,true);
    //y=lineHeight*(2.5+titleLines);
    y=lineHeight*2;
    context.font = rotorItemWidth/14+'pt filoital';
    var descLines=wrapText(context, set[i].desc, x, y, maxWidth, lineHeight,false);

    
    var largeUrl=set[i].largeUrl;
    if(isCached(largeUrl)==false){
      if((navigator.connection.type=="none")&&(inArray(largeUrl,includedImageUrls)==false)){
        //dbuga("no connection, not included so defaultBase64 to rotor and flow");
        base64toElement(defaultBase64, rotorRef);
        base64toElement(defaultBase64, flowRef);
        }
      else{
        //dbuga(i + " included:"+inArray(largeUrl,includedImageUrls)+" connection:"+navigator.connection.type+"  not cached, so loadQueue rotor and flow");
        var targetIds=["rotorImage~"+set[i].largeUrl,"flowImage~"+set[i].largeUrl];
        var targetUrl=set[i].largeUrl;
        var loadObj={"targetIds":targetIds, "targetUrl":targetUrl};
        loadQueue.push(loadObj);
        }
      }
    else{//use cached dataUrl
      if(web){
        base64toCanv(localStorage.getItem(set[i].largeUrl), rotorRef);
        flowRef.style.backgroundImage="url('" + localStorage.getItem(set[i].largeUrl) + "')";
        }
      else{
        //implement db to targets
        var refs=[flowRef, rotorRef];


        //dbuga("CDU 0 pg cached set["+i+"].thumbUrl="+set[i].thumbUrl);
        var largeUrl=set[i].largeUrl;
        //dbuga("CDU 5 largeUrl ="+ largeUrl);
        (function(refs,largeUrl){
          db.transaction(function(tx) {
          //dbuga("6 largeUrl ="+ largeUrl);

          var sqlString='SELECT image_data FROM test_table WHERE image_url="'+largeUrl+'"';
          //dbuga("sqlString="+sqlString);
          tx.executeSql(sqlString, [], 
          (function(refs, largeUrl){
            return function(tx,results){
              //dbuga("7 largeUrl ="+ largeUrl);
              //dbuga("7 refs.length ="+ refs.length);
              for(var r=0; r<refs.length; r++){
                
                //dbuga("from db to tagName ="+ refs[r].tagName);
                base64toElement(results.rows.item(0).image_data, refs[r]);
                }
              };
            })(refs,largeUrl), errorCB );
           });
          })(refs,largeUrl);



        }
      }
    //dbuga('resumePrepareRotor 3 end i='+i);
    }
  //dbuga('resumePrepareRotor 4');

  window.clearTimeout(loadTimeout);
  updateLoadingCanvas();
  if(loadQueue.length>0){
    loadTimeout=window.setTimeout("loadTick()", 100);
    //dbuga('in resumePrepareRotor loadQueue.length='+loadQueue.length+' so setTimeout loadTick()');
    }
  //dbuga('resumePrepareRotor complete');
  }
function loadTick(){
  //dbuga('<br>loadTick '+loadQueue.length);
  window.clearTimeout(loadTimeout);
  if(loadQueue.length==0){
    //dbuga(' loadQueue=[] so bail');
    return false;
    }

  var loadItem=loadQueue.shift();
  //dbuga(' - loadTick '+JSON.stringify(loadItem));
  var tempObj = new urlToSrcs(loadItem.targetUrl, loadItem.targetIds);
  tempObj.LoadPage();
  //dbuga('loadTick completed');
  }
function updateLoadingCanvas(){
  var canv=document.getElementById("loadingCanvas");
  var pips=loadQueue.length;
  //dbuga("updateLoadingCanvas() "+pips);
  canv.width=Math.floor(grid*12);
  //if(pips==0){canv.width=0;}
  canv.height=Math.floor(grid*4);
  canv.style.top="0px";
  canv.style.left=grid*(cellsAcross-12)+"px";
  if(pips>0){
    canv.style.display="block";
    var ctx=canv.getContext("2d");
    ctx.fillStyle="rgba(255,255,255,.5)";
    //ctx.fillStyle="#f00";
    //ctx.fillRect(0,0,1000,1000);
    //ctx.fillStyle="#aaa";
    ctx.textAlign="left";
    ctx.textBaseline="middle";
    ctx.font=Math.floor(grid*1)+"px Arial";
    
    ctx.fillText("Loading",grid*7,grid);
    for (var p=0; p<pips; p++){
      ctx.fillRect(grid*10.5-grid*p*1,grid*2,grid*.75,grid);
      }
    }
  }

 
function saveImageDataLocalStorage(key, data){
  //dbuga("saveImageDataLocalStorage <br>"+key);
  
  var purged=0;
  var nameStack=JSON.parse(localStorage.getItem("nameStack"));
  var currentName="not set";
  if(setKeys.length>1){currentName=setKeys[1];}
  var favorites=sets["9999_Favorites"];
  var favStack=[];
  var normStack=[];
  var currentStack=[];
  for (var n=0; n<nameStack.length; n++){
    var thisName=nameStack[n];
    var isFav=false;
    for (var f=0; f<favorites.length; f++){
      var favName=favorites[f].largeUrl;
      if(thisName.indexOf(favName)>-1){isFav=true;}
      }
    if(isFav){
      favStack.push(thisName);
      }
    else{
      if(thisName.indexOf(currentName)>-1){
        currentStack.push(thisName);
        }
      else{
        normStack.push(thisName);
        }
      }
    }
  nameStack=normStack.concat(currentStack, favStack);

  
  var saved=true;
  
  try{
    localStorage.setItem(key, data);
    } catch(e) {
    //dbuga(e);
    saved=false;
    }
  while((saved==false)&&(nameStack.length>0)){
    var delKey=nameStack.shift();
    localStorage.setItem(delKey, "");
    //dbuga(' -  purge '+delKey);
    purged++;
    saved=true;
    try{
      localStorage.setItem(key, data);
      } catch(e) {
      //dbuga(e);
      saved=false;
      }
    }

  if(saved){
    nameStack.push(key);
    //dbuga(' saved: '+nameStack.length+" "+key);
    purged=0;
    }
  else{
    //dbuga('failed '+key);
    }
  localStorage.setItem("nameStack", JSON.stringify(nameStack));
  }

function clip(num){
  return Math.floor(num*100)/100;
  }
function updateRotorButtons(){
        var canv=document.getElementById("saveButton");
          roundRect(canv, "#666", "#222", "G", "#fff", Math.floor(grid*2)+"px signify", false);
        var canv=document.getElementById("faveButton");

        //draw heart
        if((isFavorite(faveItem.largeUrl))&&(unfaveArray.indexOf(faveItem.largeUrl) == -1)){
          roundRect(canv, "#666", "#66f", "H", "#fff", Math.floor(grid*2)+"px signify", false);
          }
        else{
          roundRect(canv, "#666", "#222", "H", "#fff", Math.floor(grid*2)+"px signify", false);
          }
  }
var flowPerspective=.9;
var flowZoom=.2;
function animTick(){
  window.clearTimeout(animTimeout);
  if(setReady){
    if(orient=="portrait"){portraitAnim();}
    else{landscapeAnim();}
    }
  animTimeout=window.setTimeout("animTick()", 25);
  }
function landscapeAnim(){
  if((flip==false)&&(flipDeg>0)){
    flipDeg-=18;
    }
  if((flip==true)&&(flipDeg<180)){
    flipDeg+=18;
    }
  
  if(landscapeKnown==false){return false;}
  var imgHeight= flowItemHeight;
  var imgWidth=imgHeight*sourceAspect;
  var setKey=setKeys[selectedSetNum];
  var set=sets[setKeys[selectedSetNum]];
  
  if(touchingFlow==true){
    var deltaX=mouseX-flowDragStartX;
    var deltaItem=deltaX/imgWidth;
    flowAtItem=flowDragStartAt-deltaItem;
    //dbuga("1 touchingFlow set flowAtItem="+flowAtItem);
    if(flowAtItem<-.1){flowAtItem=-.1;}
    if(flowAtItem>set.length-.9){flowAtItem=set.length-.9;}
    //dbuga("1a touchingFlow set flowAtItem="+flowAtItem);
    var d = new Date();
    var deltaT=d.getTime()-flowTappedMs;
    if(deltaT>1000){
      if(flip){
        //dbuga('held unflip');
        flip=false;
        }
      }
    }
  else{
    if(flowProg>0){
      flowProg-=.1;
      if(flowProg<0){flowProg=0;}
      var target=Math.floor(flowDockStartAt);
      if(flowDockStartX>flowDragStartX){target=Math.floor(flowDockStartAt);}
      if(flowDockStartX<flowDragStartX){target=Math.floor(flowDockStartAt+1);}
      if(target<0){target=0;}
      if(target>set.length-1){target=set.length-1;}
      //dbug("target "+target);
      if(target>flowDragStartAt+1){
        target--;
        //dbuga("target--");
        }
      if(target<flowDragStartAt-1){
        target++;
        //dbuga("target++");
        }
      var atDelta=target-flowDockStartAt;
      var atDeltaProg=atDelta*(1-flowProg*flowProg);
      flowAtItem=flowDockStartAt+atDeltaProg;
      //dbuga("landscapeAnim flowProg="+flowProg+" set flowAtItem="+flowAtItem);
    
      if(flowProg<=0){
        rotorAtItem=flowAtItem; 
        rotorDockStartAt=rotorAtItem;
        flowDockStartAt=flowAtItem;      
        document.getElementById("rotorLabel").innerHTML=(target+1)+" of "+set.length;
        faveItem=set[target];
        //dbuga("flow dock "+faveItem.title);
        updateRotorButtons();
        }
      }
    }
  var middle=landscapeScreenWidth/2-imgWidth/2;
  document.getElementById('flow').style.webkitPerspective= landscapeScreenWidth/flowPerspective +"px";
  document.getElementById('flow').style.webkitTransform="translate3d(0,0,0)";//orig
  //document.getElementById('flow').style.webkitTransform="translate3d(0,0,"+landscapeScreenWidth+"px)";
  //dbug('');

  //dbug(" "+Math.floor(flowAtItem*100)/100);

  for(var i=0; i<set.length; i++){
    var deltaAt=(i-flowAtItem);
    var itemsFromAt=Math.abs(deltaAt);
    var filedAmount=deltaAt;
    if(filedAmount>1){filedAmount=1;}
    if(filedAmount<-1){filedAmount=-1;}
    var filedFraction=Math.abs(filedAmount);
    //if(i==3){dbuga(Math.floor(filedFraction*100)/100);}
    var x=Math.floor(imgWidth*(i-flowAtItem+filedAmount)/2);
    var y=0;
    var z=-Math.floor(imgWidth*(filedFraction/3+itemsFromAt/3));
    var z=imgHeight*flowZoom-Math.floor(imgWidth*(filedFraction/3+itemsFromAt/3));
    var r=-90*filedAmount;
    if(i==flipTarget){
      if(r>0){
        r+=flipDeg;
        }
      else{
        r-=flipDeg;
        }
      }

    var thisBack=document.getElementById("flowBack~"+set[i].largeUrl);
    thisBack.style.left=middle+"px";
    thisBack.style.top= portraitScreenHeight*.05+"px";
    thisBack.style.webkitTransformOrigin="center center";
    thisBack.style.webkitTransform="translateZ("+(z)+"px) translateX("+x+"px) rotateX(180deg) rotateY("+(-r)+"deg) rotateZ(180deg)";

    var thisFlow=document.getElementById("flowImage~"+set[i].largeUrl);
    thisFlow.style.left=middle+"px";
    thisFlow.style.top= portraitScreenHeight*.05+"px";
    thisFlow.style.webkitTransformOrigin="center center";
    thisFlow.style.webkitTransform="translateZ("+z+"px) translateX("+x+"px) rotateY("+r+"deg)";
    }
  }

function portraitAnim(){
  if((flip==false)&&(flipDeg>0)){
    flipDeg-=36;
    }
  if((flip==true)&&(flipDeg<180)){
    flipDeg+=18;
    }
  
  var setKey=setKeys[selectedSetNum];
  var set=sets[setKeys[selectedSetNum]];
  
  if(touchingRotor==true){
    var deltaX=mouseX-rotorDragStartX;
    var deltaItem=deltaX/portraitScreenWidth;
    rotorAtItem=rotorDragStartAt-deltaItem;
    //dbug(rotorAtItem);
    if(rotorAtItem<-.1){rotorAtItem=-.1;}
    if(rotorAtItem>set.length-.9){rotorAtItem=set.length-.9;}
    var d = new Date();
    var deltaT=d.getTime()-rotorTappedMs;
    if(deltaT>2000){
      if(flip){
        //dbuga('portrait held unflip');
        flip=false;
        }
      }

    }
  else{
    if(rotorProg>0){
      rotorProg-=.1;
      if(rotorProg<0){rotorProg=0;}
      //dbug("rotorDockStartAt "+ rotorDockStartAt);
      var target=Math.floor(rotorDockStartAt);
      if(rotorDockStartX>rotorDragStartX){target=Math.floor(rotorDockStartAt);}
      if(rotorDockStartX<rotorDragStartX){target=Math.floor(rotorDockStartAt+1);}
      if(target<0){target=0;}
      if(target>set.length-1){target=set.length-1;}
      //dbuga("rotorProg "+ rotorProg);
      //dbuga("target "+target);
      var atDelta=target-rotorDockStartAt;
      var atDeltaProg=atDelta*(1-rotorProg*rotorProg);
      rotorAtItem=rotorDockStartAt+atDeltaProg;
      if(rotorProg<=0){
        flowAtItem=rotorAtItem;
        //dbuga("rotorProg<=0 set flowAtItem="+flowAtItem);
    
        rotorDockStartAt=rotorAtItem;      
        document.getElementById("rotorLabel").innerHTML=(target+1)+" of "+set.length;
        faveItem=set[target];
        //dbuga("rotor dock "+faveItem.title);
        updateRotorButtons();
        }
      }
    }
  if(rotorUp){
    var rotorOffset=0;
    if(rotorItemWidth<portraitScreenWidth){rotorOffset=(portraitScreenWidth-rotorItemWidth)/2;}
    //var translate=(0-rotorAtItem*rotorItemWidth+rotorOffset);
    //document.getElementById("rotor").style.webkitTransform='translate3d('+translate+',0,-100)';

    //dbug(translate);
      
    var translate=(0-rotorAtItem*rotorItemWidth+rotorOffset);

    for(var i=0; i<set.length; i++){
      var r=0;
      if(i==flipTarget){r+=flipDeg;}
      var flipFrac=r/180;
      var thisBack=document.getElementById("rotorBack~"+set[i].largeUrl);
      thisBack.style.opacity=flipFrac;
      thisBack.style.webkitTransform='translate3d('+translate+'px,0,0px)';
      var thisRotor=document.getElementById("rotorImage~"+set[i].largeUrl);
      thisRotor.style.webkitTransform='translate3d('+translate+'px,0,0px)';
      
      //thisRotor.style.opacity=1-flipFrac;
      }
    }
  }


function setTap(i){
  //dbug("setTap("+i+") ");

  setTappedNum=i;
  var d = new Date();
  setTappedMs=d.getTime();
  }
function setRelease(i){
  if(setTappedMs==-1){
    return false;
    }
  var d = new Date();
  var deltaT=d.getTime()-setTappedMs;
  if(deltaT<300){
    //dbuga("setRelease("+i+") "+deltaT);
    selectSet(setTappedNum);
    }
  setTappedMs=-1;
  }
function selectThumb(num){

  flowAtItem=num;
  rotorAtItem=num;
  rotorDockStartAt=rotorAtItem;      

  //dbuga("selectThumb("+num+") rotorUp set "+ rotorUp +" to true");
  rotorUp=true;
  document.getElementById('thumbsUi').style.display="none";
  document.getElementById('rotorUi').style.display="block";
  selectedThumbNum=num;
  var set=sets[setKeys[selectedSetNum]];
  document.getElementById("rotorLabel").innerHTML=(selectedThumbNum+1)+" of "+set.length;
  
  faveItem=set[selectedThumbNum];
  //dbuga("selectThumb "+faveItem.title);
  updateRotorButtons();
  }
function hideInfo(){
  infoUpUp=false; 
  document.getElementById('infoDim').style.display="none";
  }
function showInfo(){
  //dbuga("showInfo()" +infoUp);
  infoUp=true;
  updateCacheButton();
  document.getElementById('infoDim').style.display="block";
  //dbuga("showInfo completed");
  }

function hideSetSelect(){
  updateLoadingCanvas();
  //dbuga("hideSetSelect() called" +selectUp);
  selectUp=false;
  //dbuga('rotorUp='+rotorUp);
  window.setTimeout('document.getElementById("setSelectDim").style.display="none"', 100);
  }

function onBackKeyDown() {
  // Handle the back button
  if(orient=="portrait"){
    showSetSelect();
    hideInfo();
    }
  }

function showSetSelect(){
  //dbuga("showSetSelect()" +selectUp);
  loadQueue=[];
  updateLoadingCanvas();
  selectUp=true;
  document.getElementById('setSelectDim').style.display="block";
  initOrRefreshScrolls();
  }
function errorCB(e){
  uiMessage("error: "+e);
  }
//cur|gif|ico|jpe?g|png|svgz?|webp
function updateThumbButtons(){
  var selectedSetKey=setKeys[selectedSetNum];
  var set=sets[selectedSetKey];
  //dbuga("updateThumbButtons() "+selectedSetKey+" "+set.length);
  
  var temp=selectedSetKey.split("_");
  var title=temp[1];
  document.getElementById("thumbsLabel").innerHTML=title;
  // create innerHTML for thumbsScroller
  cols=Math.floor(cellsAcross/16);
  var htmlString="";
  rows=1+Math.floor((set.length-1)/cols);
  for (var i=0; i<set.length; i++){
    htmlString+='<img id="thumbImage~'+set[i].largeUrl+'" ontouchstart="thumbTap('+i+')" ontouchend="thumbRelease('+i+');" width='+thumbWidth+' src="'+defaultBase64+'" />';
    }
  //spiral.gif
  document.getElementById("thumbsScroller").innerHTML=htmlString;
  for (var i=0; i<set.length; i++){
    var ref=document.getElementById("thumbImage~"+set[i].largeUrl);
    //dbuga("thumb "+i+" isCached="+isCached(set[i].thumbUrl));
    var thumbUrl=set[i].thumbUrl;
    if(isCached(thumbUrl)==false){
      if((navigator.connection.type=="none")&&(inArray(thumbUrl,includedImageUrls)==false)){
        ref.src=defaultBase64;
        //dbuga('thumb no connection, not cached, not included, use default');
        }
      else{// 
        var targetIds=["thumbImage~"+set[i].largeUrl];
        var targetUrl=thumbUrl;
        //dbuga(i + " included:"+inArray(thumbUrl,includedImageUrls)+" connection:"+navigator.connection.type+"  not cached so q");
        var loadObj={"targetIds":targetIds, "targetUrl":targetUrl};
        loadQueue.push(loadObj);
        }
      }
    else{//use cached dataUrl
      if(web){
        //dbuga("use cached thumb "+ i);
        ref.src=localStorage.getItem(set[i].thumbUrl);
        }
      else{
        //implement db

        //dbuga("0 pg cached set["+i+"].thumbUrl="+set[i].thumbUrl);
        var thumbUrl=set[i].thumbUrl;
        //dbuga("0 thumbUrl ="+ thumbUrl);
        var thumbRef=ref;
        (function(thumbRef,thumbUrl){
          db.transaction(function(tx) {
          //dbuga("1 thumbUrl ="+ thumbUrl);

          var sqlString='SELECT image_data FROM test_table WHERE image_url="'+thumbUrl+'"';
          //dbuga("sqlString="+sqlString);
          tx.executeSql(sqlString, [], 
          (function(thumbRef, thumbUrl){
            return function(tx,results){
              //dbuga("2 thumb from db");
              base64toElement(results.rows.item(0).image_data,thumbRef);
              };
            })(thumbRef,thumbUrl), errorCB );
           });
          })(thumbRef,thumbUrl);

        }
      }
    }
  document.getElementById("thumbsScroller").style.height=(thumbHeight*rows)+"px";
  if(loadQueue.length>0){
    //dbuga('in updateThumbButtons loadQueue.length='+loadQueue.length+' so loadTick()');
    loadTick();
    }
  //dbuga('updateThumbButtons scrollsSet='+scrollsSet );
  initOrRefreshScrolls();
  if(scrollsSet){
    tScroll.scrollTo(0,0);
    }
  }
function arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}
function base64toElement(result, el){
  //var sizeObj=returnWidthHeight(e.target.result);
  //var imageWidth=sizeObj.width;
  //var imageHeight=sizeObj.height;
  //var imageAspect=imageWidth/imageHeight;
  
  //dbuga(JSON.stringify(sizeObj));
  //dbuga(result.length+' el.tagName:'+el.tagName);
  
  if(el.tagName=="CANVAS"){//rotor
    base64toCanv(result, el);
  }
  if(el.tagName=="IMG"){//thumb
    base64toImage(result, el, thumbWidth);
    }
  if(el.tagName=="DIV"){//flow - background automatically contained and centered
      el.style.backgroundImage="url('" + result + "')";
    }
  }
function base64toImage(data,el,widthPx){
  //dbuga("data:"+data.length+", el:"+ el.tagName +", widthPx:"+ widthPx);
  var img = new Image();
  img.onload = (function (data, elem, usePx) {
    return function() {
      //dbuga("data:"+data.length+", elem:"+ elem.tagName +", usePx:"+ usePx);
      var iw=this.width;
      var ih=this.height;
      var ia=iw/ih;
      if((iw==0)||(ih==0)){
        ia=sourceAspect;
        //dbuga('this zeros, sourceAspect:'+sourceAspect);
        }

      var ew=usePx;
      var eh=ew/sourceAspect;
      var ea=sourceAspect;

      var topPad=0;
      var leftPad=0;
      var drawWidth=ew;
      var drawHeight=eh;

      if(ia>ea){//image wider, pad top, fit width
        drawHeight=drawWidth/ia;
        topPad=(eh-drawHeight)/2;
        //dbuga("wide t:"+topPad+" l:"+leftPad+" w:"+drawWidth+" h:"+drawHeight);        
        }
      else{//image taller, pad left, fit height
        drawWidth=drawHeight*ia;
        leftPad=(ew-drawWidth)/2;
        //dbuga("tall t:"+topPad+" l:"+leftPad+" w:"+drawWidth +" h:"+drawHeight);        
        }
      elem.width=drawWidth;
      elem.height=drawHeight;
      elem.style.margin=topPad+"px "+leftPad+"px "+ topPad+"px "+leftPad+"px ";
      elem.src=data;
      }
    }(data, el, widthPx));      
  img.src = data;
  }

function base64toCanv(data, canv){
  var img = new Image();
  
  img.onload = (function (elem) {
    return function() {
      var iw=this.width;
      var ih=this.height;
      var ia=iw/ih;
      var ew=elem.width;
      var eh=elem.height;
      var ea=ew/eh;
      var topPad=0;
      var leftPad=0;
      var drawWidth=ew;
      var drawHeight=eh;

      if(ia>ea){//image wider, pad top, fit width
        drawHeight=drawWidth/ia;
        topPad=(eh-drawHeight)/2;
        }
      else{//image taller, pad left, fit height
        //dbuga(Math.floor(drawWidth)+" x "+Math.floor(drawHeight));
        drawWidth=drawHeight*ia;
        leftPad=(ew-drawWidth)/2;
        }
      var ctx=elem.getContext("2d");
      ctx.drawImage(this, leftPad, topPad, drawWidth, drawHeight);
      //ctx.lineWidth=4;
      //ctx.strokeStyle="red";
      //ctx.strokeRect(0, 0,elem.width, elem.height);
      
      }
    }(canv)); 
       
  img.src = data;
  }
urlToSrcs = function(imageUrl,imageIds) {
  //dbuga("urlToSrcs "+imageUrl);
  var included=false;
  var loadUrl=imageUrl;
  if(inArray(loadUrl,includedImageUrls)){
    var parts=loadUrl.split("uploads");
    loadUrl="uploads"+parts[1];
    included=true;
    }

  this.status = 0;
  this.webUrl = imageUrl;
  this.loadUrl = loadUrl;
  this.included = included;
  this.myIds = imageIds;
  //dbuga("imageIds ="+ imageIds.length);
  var req = this;
  function onLoad (e){
      //dbuga("onLoad(e) req.myIds="+req.myIds.length);
      var blob = new Blob([e.target.response], {type: "image/jpeg"});
      var reader = new FileReader();
      reader.targetImageIds=req.myIds;
      reader.onloadend = (function(theBlob,targetImageIds,loadUrl,webUrl,included) {
        return function(e) {
          //dbuga('reader.onloadend');
          var result=e.target.result;
          for(var t=0; t<targetImageIds.length; t++){
            var el=document.getElementById(targetImageIds[t]);
            //dbuga('el.tagName='+el.tagName+" "+targetImageIds[t]);
            base64toElement(result, el);
            }
          if(included==false){
            saveImageData(webUrl, result);
            }
          else{
            //dbuga("included "+loadUrl);
            }
          //dbuga('reader.onloadend completed');

          }
        })(blob,req.myIds,req.loadUrl,req.webUrl,req.included);    
      reader.readAsDataURL(blob);
      window.clearTimeout(loadTimeout);
      updateLoadingCanvas();
      if(loadQueue.length>0){
        loadTimeout=window.setTimeout("loadTick()", 100);
        }

  }
  this.LoadPage = function() {
    var r = new XMLHttpRequest();
    r.onloadend = onLoad;
    //dbuga("loadPage GET "+this.loadUrl);
    r.open ("GET", this.loadUrl, true);
    r.responseType = 'blob';
    r.send (null);
  }
}
stashDefault = function(loadUrl) {
  //dbuga("stashDefault "+ loadUrl);
  this.status = 0;
  this.loadUrl = loadUrl;
  var req = this;
  function onLoad (e){
    var blob = new Blob([e.target.response], {type: "image/jpeg"});
    var reader = new FileReader();
    reader.onloadend = (function(theBlob) {
      return function(e) {
      defaultBase64=e.target.result;
      //dbuga('  in stasheDefault');
      }
    })(blob);    
    reader.readAsDataURL(blob);
    }
  this.LoadPage = function() {
    var r = new XMLHttpRequest();
    r.onloadend = onLoad;
    console.log("GET this.LoadPage");
    r.open ("GET", this.loadUrl, true);
    r.responseType = 'blob';
    r.send (null);
    }
  }

function saveImageData(key, data){
  if(web){
    saveImageDataLocalStorage(key, data);
    }
  else{
    saveImageDataPhonegap(key, data);
    }
  }
function saveImageDataPhonegap(key, data){
  //dbuga("<br>saveImageDataPhonegap "+key);
  var nameStack=JSON.parse(localStorage.getItem("nameStack"));
  nameStack.push(key);
  var temp=key.split("/");
  var fname=temp.pop();
  //dbuga(fname +" save to db" );
  localStorage.setItem("nameStack", JSON.stringify(nameStack));
  db.transaction(function(tx) {
    tx.executeSql("INSERT INTO test_table (image_url, image_data) VALUES (?,?)", [key, data], function(tx, res){
      //dbuga("inserted");
      }, function(e) {
        //dbuga("not inserted ERROR: " + e.message);
      });
    });

  }
function initOrRefreshScrolls(){
  setTimeout(function() {
    //dbuga('initOrRefreshScrolls scrollsSet='+ scrollsSet +' orient ='+orient);
    if(scrollsSet==false){
      tScroll=new iScroll("thumbsHolder");
      sScroll=new iScroll("setSelectHolder");
      scrollsSet=true;
      }
    else{// iscroll is fucked when div or parent gets display:none, must refresh when block.
      if(orient=="portrait"){
        if(rotorUp==false){
          //dbuga(' -- rotorUp==false so tScroll.refresh()');
          tScroll.refresh();
          }
        if(selectUp){
          document.getElementById('setSelectDim').style.display="block";
         document.getElementById('setSelectDim').style.left="0";
           document.getElementById("setSelectModal").style.top=grid*modalMargin+"px";
          sScroll.refresh();
          //dbuga(' -- selectUp so sScroll.refresh()');
          }
        }
      else{
        //dbuga(' --- skip refreshes');
        }
      }

    }, 100);
  }

function updateSelectButtons(){
 for (var s=0; s<setKeys.length; s++){
    var canv=document.getElementById("canv_"+s);
    canv.width=canv.width;
    var ctx=canv.getContext('2d');
    var rad=grid/2;
    var pad=grid/8;
    ctx.lineWidth=grid/8; 
    ctx.strokeStyle="#444";
    ctx.beginPath();

    if(s==0){
      ctx.moveTo(pad+rad,pad);
      ctx.lineTo(canv.width-rad-pad,pad);
      ctx.arc(canv.width-rad-pad,rad+pad, rad, pi*1.5, pi*2, false);
      ctx.arc(canv.width-rad-pad,canv.height-rad-pad, rad, pi*0, pi*.5, false);
      ctx.arc(rad+pad,canv.height-rad-pad, rad, pi*.5, pi*1, false);
      ctx.arc(rad+pad,rad+pad, rad, pi*1, pi*1.5, false);
      }
    else if(s==1){
      ctx.arc(rad+pad,rad+pad, rad, pi*1, pi*1.5, false);
      ctx.arc(canv.width-rad-pad,rad+pad, rad, pi*1.5, pi*2, false);
      ctx.lineTo(canv.width-pad,canv.height-pad);
      ctx.lineTo(pad,canv.height-pad);
      ctx.lineTo(pad,pad+rad);
      }
    else if(s==setKeys.length-1){
      ctx.moveTo(pad,pad);
      ctx.lineTo(canv.width-pad,pad);
      ctx.arc(canv.width-rad-pad,canv.height-rad-pad, rad, pi*0, pi*.5, false);
      ctx.arc(rad+pad,canv.height-rad-pad, rad, pi*.5, pi*1, false);
      ctx.lineTo(pad,pad);
      }
    else{
      ctx.moveTo(pad,pad);
      ctx.lineTo(canv.width-pad,pad);
      ctx.lineTo(canv.width-pad,canv.height-pad);
      ctx.lineTo(pad,canv.height-pad);
      ctx.lineTo(pad,pad);
      }
    ctx.stroke();
    ctx.fillStyle="#fff";
    ctx.fill();

    var temp=setKeys[s].split("_");
    var title=temp[1];
    ctx.fillStyle="#333";
    ctx.font=Math.floor(grid*2)+"px Arial";
    ctx.textBaseline= "middle";  
    ctx.textAlign= "left";    
    ctx.fillText(title,grid*1,canv.height/2);

    

    if(selectedSetNum==s){
      ctx.lineWidth=grid/3;
      ctx.strokeStyle="#555";
      ctx.beginPath();
      ctx.moveTo(canv.width-grid*2, grid*2);
      ctx.lineTo(canv.width-grid*1.5, grid*2.75);
      ctx.lineTo(canv.width-grid*1, grid*1.25);
      ctx.stroke();


      var canv=document.getElementById("thumbsButton");
      canv.width=Math.floor(grid*10);
      canv.height=Math.floor(grid*3);
      canv.style.top=grid*.5+"px";
      canv.style.left=grid*.5+"px";
      roundRect(canv, "#666", "#222", title, "#fff", Math.floor(grid*1.25)+"px Arial", true);


      }
    }
  }
var pi=Math.PI;
var dataLoaded=false;
var feedURL="http://www.chromaris.org/api/get_category_posts/?slug=allocation-chocolates&count=100";
//move to config.js 
//var feedURL="http://www.chromaris.org/category/allocation-chocolates/feed/?json=1";
//var feedURL="http://www.laforetchocolate.com/wordpress/category/allocation-chocolates/json";
//feedURL="http://www.laforetchocolate.com/test/category/allocation-chocolates/json";
// remember wordpress may need allow cors plugin then settings > cors to allow *. May not for app shell.

function loadDataWp(){
    $.getJSON(feedURL, function(json) {
      parseDataWp(json, false);
      if(setKeys.length>1){selectedSetNum=1;}
        dataLoaded=true;
        populateSelect();
        updateSet();
      }).fail( function(d, textStatus, error) {
        if(setKeys.length>1){selectedSetNum=1;}
        populateSelect();
        updateSet();
        dataLoaded=false;
      });
  }
function parseDataWp(feed, included){
  entries=feed.posts;
  //dbuga('parseDataWp  entries.length='+entries.length);
  for (var e=0; e<entries.length; e++){
    var entry=entries[e];
    var entryDate=entry.date.split(" ")[0];
    var setKey=entryDate+"_"+entry.title;
    //dbuga("<br >setKey="+setKey +"<br>included="+included);
    var set=[];

    var items=entry.attachments;
    //dbuga("items.length="+ items.length);
    for (var i=0; i<items.length; i++){
      var item=items[i];
      var title=item.title;
      title=title.replace("&amp;", "&");
      //title=title.toLowerCase();
      var desc=item.description;
      //desc=desc.replace("&amp;", "&");
      var largeUrl= item.url;
      var thumbUrl= item.images.medium.url;
      set.push({"largeUrl":largeUrl, "thumbUrl":thumbUrl, "title":title, "desc":desc});
      if(included){
        includedImageUrls.push(largeUrl);
        includedImageUrls.push(thumbUrl);
        }
      }

    if(set.length>0){
      if(inArray(setKey, setKeys)==false){
        setKeys.push(setKey);
        sets[setKey]=set;
        //dbuga("added new set "+setKey);
        }
      else{
        if(included){
          //dbuga("included, don't update set "+setKey);
          }
        else{
          //dbuga("not included, update set "+setKey);
          sets[setKey]=set;
          }
        }
      }
    else{//empty set, remove setKey
      var tempKeys=setKeys;
      setKeys=[];
      for(var k=0; k<tempKeys.length; k++){
        var thisKey=tempKeys[k];
        if(thisKey != setKey){
          //dbuga('empty, keep '+thisKey);
          setKeys.push(thisKey);
          }
        else{
          //dbuga("empty, remove "+thisKey);
          }
        }
      }
    //dbuga(" setKeys.length="+setKeys.length);
    }
  saveSetsToLocalStorage();

  }
function textInItem(item){
  var val="";
  if(item.indexOf("</a>")>-1){
    var parts=item.split("</a>");
    val=parts[1];
    }
  return val;
  }
function attributeInItem(attribute,item){
  var val="";
  if(item.indexOf(' '+attribute+'=')>-1){
    var parts=item.split(' '+attribute+'=');
    var suffix=parts[1];
    var quoteParts=suffix.split('\"');
    val=quoteParts[1];
    }
  return val;
  }
function returnItemsInContent(content){
  var items=[];
  if(content.indexOf("[/caption]")>-1){
    var endSplit=content.split("[/caption]");
    var junk=endSplit.pop();
    for (var i=0; i<endSplit.length; i++){
      var part=endSplit[i];
      var beginSplit=part.split("]");
      var item=beginSplit[1];
      items.push(item);
      }
    }
  return items;
  }
function inArray(needle, haystack) {
  var length = haystack.length;
  for(var i = 0; i < length; i++) {
    if(haystack[i] == needle) return true;
    }
  return false;
  }
function dbug(str) {
  if(str==''){
    ddiv.style.display = "none";
    }
  else{ddiv.style.display = "block";}
  ddiv.innerHTML = str;
  }
function dbuga(str) {
  ddiv.style.display = "block";
  ddiv.innerHTML += "<br />"+str;
  }
function rnd(range) {
  return Math.floor(Math.random()*range);
  }
function mouseSwipe(e){
  //dbug(e.pageX);
  mouseX=e.pageX;
  }
function touchSwipe(e){
  if(touchingRotor){
    e.preventDefault();
    mouseX=event.touches[0].pageX;
    }
  if(touchingFlow){
    e.preventDefault();
    mouseX=event.touches[0].pageX;
    }
  }
function gestureStart(e){
  e.preventDefault();
  }
