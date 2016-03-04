var videoLoaded=-1;
var headerHeight=48;
var headerPad=2;
var headerButton=headerHeight-headerPad*2;
var panelInverse=1.625
var panelAspect=1/panelInverse;
var g=320/64; // 5
var pt=1;
var folder="smallcards";
var slotScale;
var slotY;
var slotX;
var slotZ;
var dockZ;
var dragZ;
var flowZ;
var cardHeight=1;
var cardTop=1;
var cardWidth=1;
var cardLeft=1;

var flowTimeout;
var flowArray=[];
var flowUp=false;
var atFlow=1;
var selectedCardIds=[];
var unselectedCardIds=[];
var cardGestureStartMs=0;
var cardGestureStartX=-1;
var cardGestureStartY=-1;
var cardGestureLastX=-1;
var cardGestureLastY=-1;
var cardDragging=-1;
var flowDocking=false;
var dockingProg=0;

var gestureLog=[];

var wloc=""+window.location.href;
console.log('videocards.js loaded and ran on '+wloc +' as '+wpUserLogin);

if(typeof videocards != 'undefined'){
  //if(wpUserLogin=="tschubring"){
    console.log('videocards='+videocards);
    var iframes=document.getElementsByTagName("iframe");
    for (var i=0; i<iframes.length; i++){
      //console.log(iframes[i].src);
      }
    var accordions=document.getElementsByClassName('organic-accordion');
    console.log(accordions.length+' accordions');
    for (var a=0; a<accordions.length; a++){
      accordions[a].style.display="none";
      }
    preloadCards();
  //  }
  }
function preloadCards(){
  var preHtml="";
  for(var v=0; v<videocards.length; v++){
    preHtml+='<img src="/webapp/'+folder+'/front_'+videocards[v]+'.png" width=2 />'
    preHtml+='<img src="/webapp/'+folder+'/back_'+videocards[v]+'.png" width=2 />'
    }
  document.getElementById('wrap').innerHTML+=preHtml;
  }
function initCards(){
  console.log('initCards()');
  geometry();
  if(document.getElementById('flowDiv')==null){
    console.log("('flowDiv')==null");
    var flowHtml='<div id="flowDiv" style="width:100%; height:100%; top:0; z-index:100000; display:block; background-color:rgba(0,0,0,.85); position:fixed;" ontouchstart="event.preventDefault()" ontouchmove="event.preventDefault()" ontouchend="event.preventDefault()"></div>';
    document.getElementById('wrap').innerHTML+=flowHtml;
    }
  flowDiv=document.getElementById('flowDiv');
  gotoFlow();
  }
function hideFlow(){
  document.getElementById('flowDiv').style.display="none";
  }
var flowDiv;
function gotoFlow(){
  selectedCardIds=[];//dev
  unselectedCardIds=[];

  console.log('gotoFlow()');
  flowUp=true;
  atFlow=0;
  var colorByOrder=["#fe0000", "#ff4001", "#ff8001", "#ffbe00", "#ffff00", "#c1c1c1", "#c1c1c1", "#c1c1c1", "#c1c1c1", "#c1c1c1", "#c1c1c1", "#c1c1c1"];

  flowArray = [];
  colorByOrder=["#c1c1c1", "#c1c1c1", "#c1c1c1", "#c1c1c1", "#c1c1c1", "#c1c1c1", "#c1c1c1", "#c1c1c1", "#c1c1c1", "#c1c1c1", "#c1c1c1", "#c1c1c1"];
  for (var c=1; c<=12; c++){
    var flowRecord={
      "corePassionTitle":videocards[12-c], 
      "sort":c, 
      "strength":0, 
      "color":"#00f", 
      "type":"", 
      "ord":0, 
      "pos":{}, 
      "side":0, 
      "selected":false
      };
    flowArray.push(flowRecord);
    }
  flowArray.sort(function(a, b) {return b.sort - a.sort});
  
  for (var b=0; b<flowArray.length; b++){
    unselectedCardIds.push(b);
    flowArray[b].color=colorByOrder[b];
    }
  //if(selectedCardIds.length>0){flowStatusDiv.style.display="block";}
  //else{flowStatusDiv.style.display="none";}
  //console.log("flowArray");
  //console.log(flowArray);
  placeCards();
  restyleCards();
  destinateFlow();
  dockingProg=0;
  flowDocking=true;
  clearTimeout(flowTimeout);
  flowTimeout=window.setTimeout('flowTick(true)', 16);
}

function placeCards(){
  flowDiv.style.display="block";
  flowDiv.style.perspective="1000px";
  flowDiv.style.zIndex="100000";
  flowDiv.innerHTML=returnCards();

  var startPos=returnPos("flow",12, flowZ, 0);
  for(var u=0; u<unselectedCardIds.length; u++){
    var c=unselectedCardIds[u]; 
    var ref=document.getElementById('card_'+c);
    var pos=returnPos("flow",u-atFlow, flowZ, flowArray[c].side*180);
    flowArray[c].pos=startPos;
    flowArray[c].startPos=startPos;
    flowArray[c].destPos=pos;
    flowArray[c].type="flow";
    flowArray[c].ord=u-atFlow;
  }

  //console.log('placeCards() completed');

  }  
function returnCards(){
  var cards="";
  cards+='<div id="flowStatusDiv" class="flowStatus">Select codes to view videos</div>';
  cards+='<iframe id="flowVideoIframe" class="flowVideo"></iframe>';

  for(var c=0; c<flowArray.length; c++){
    var touchEvents='ontouchstart="cardTouchStart(event, '+c+');" ontouchmove="cardTouchMove(event, '+c+');" ontouchend="cardTouchEnd(event, '+c+');"';
    touchEvents+=' onmousedown="cardMouseDown(event, '+c+');" onmousemove="cardMouseMove(event, '+c+');" onmouseup="cardMouseUp(event, '+c+');" ';
    var deg=0;
    if(flowArray[c].selected){deg=180;}
    var card='<div id="card_'+c+'" class="flowCard cardSize" style="-webkit-transform:rotateY('+deg+'deg) tanslateX(-2000px); background-color:'+flowArray[c].color+';">';
    card+=   '  <div class="flowCardFront cardSize" style="background-image:url(/webapp/'+folder+'/front_'+flowArray[c].corePassionTitle.toLowerCase()+'.png);"  '+touchEvents+'>';
    if(flowArray[c].strength>0){
      card+=   '    <div class="flowCardNum" style="">'+flowArray[c].strength+'</div>';
    }
    card+=   '  </div>';
    card+=   '  <div class="flowCardBack cardSize" style="background-image:url(/webapp/'+folder+'/back_'+flowArray[c].corePassionTitle.toLowerCase()+'.png);"  '+touchEvents+'>';
    card+=   '</div>';
    card+='</div>';
    cards+=card; 
    }
  cards+='<div id="flowDoneDiv" class="flowDone" ontouchend="event.preventDefault(); hideFlow();" onclick="hideFlow()">DONE</div>';
  return cards;
  }
function loadVideo(videoNum){
  //console.log('loadVideo('+videoNum+')');
  var iframes=document.getElementsByTagName("iframe");
  document.getElementById('flowVideoIframe').src=iframes[videoNum].src;
  videoLoaded=videoNum;
  }
function destinateFlow(){
  //console.log('destinateFlow()');
  if(videoLoaded != atFlow){
    loadVideo(atFlow);
    }

  if(atFlow>=unselectedCardIds.length){
    atFlow=unselectedCardIds.length-1
  }
  for(var u=0; u<unselectedCardIds.length; u++){
    var c=unselectedCardIds[u]; 
    var ref=document.getElementById('card_'+c);
    var pos=returnPos("flow",u-atFlow, flowZ, flowArray[c].side*180);
    
    flowArray[c].startPos=flowArray[c].pos;
    flowArray[c].destPos=pos;
    flowArray[c].type="flow";
    flowArray[c].ord=u-atFlow;
  }
  for(var s=0; s<selectedCardIds.length; s++){
    var c=selectedCardIds[s]; 
    var pos=returnPos("slot",s-1, slotZ, 0);
    flowArray[c].destPos=pos;
    flowArray[c].type="slot";
    flowArray[c].ord=s-1;
  }
  var flowStatusDiv=document.getElementById('flowStatusDiv');
  if(selectedCardIds.length==0){flowStatusDiv.style.display="block";}
  else{flowStatusDiv.style.display="none";}
  //dbug(JSON.stringify(flowArray[0]));
  //dbuga(posToTransform(flowArray[0].destPos));
}

function returnPos(type,ord, z, r){
  var pos={"x":0, "y":0, "z":z, "s":0, "r":0};
  if(type=="slot"){
    pos={"x":slotX*ord, "y":0-slotY, "z":z, "s":slotScale, "r":r};
  }
  if(type=="flow"){
    if(ord==0){
      pos={"x":0, "y":0, "z":z, "s":1, "r":r};
    }
    else{
      pos={"x":cardWidth*ord*1, "y":0, "z":z, "s":.9, "r":r};
    }
  }
  return pos;
}
function posToTransform(pos){
  return "translateX("+pos.x+"px) translateY("+pos.y+"px) translateZ("+pos.z+"px) scale("+pos.s+") rotateY("+pos.r+"deg)";
  }
function posBetweenProg(pos0,pos1,prog){
  return {"x":pos1.x*prog+pos0.x*(1-prog), "y":pos1.y*prog+pos0.y*(1-prog), "z":Math.floor(1000*(pos1.z*prog)+1000*(pos0.z*(1-prog)))/1000, "s":pos1.s*prog+pos0.s*(1-prog), "r":Math.floor(100*(pos1.r*prog+pos0.r*(1-prog)))/100};
}
function flowTick(forceAll){
  clearTimeout(flowTimeout);
  
  if(flowUp){
    if((pageHeight!=window.innerHeight)||(pageWidth!=window.innerWidth)){
      geometry();
      restyleCards();
      }
    //dbuga('cardDragging:'+cardDragging);
    if(flowDocking){
      dockingProg+=.08;
      //dbuga('flowDocking '+dockingProg);
      if(dockingProg>1){
        dockingProg=1;
      } 
    }
    if((flowDocking)||(cardDragging>-1)){
      //dbuga('passed');
      //var rules=[];
      //dbugStr="";
      for(var c=0; c<flowArray.length; c++){
        var ref=document.getElementById('card_'+c);
        var nowPos={};
        if(cardDragging>-1){
          nowPos=flowArray[c].pos;
        }
        if(flowDocking){
          nowPos=posBetweenProg(flowArray[c].startPos,flowArray[c].destPos,dockingProg);
        }
        flowArray[c].pos=nowPos;
        var inView=true;
        if(nowPos.x<0-(pageWidth/2 + cardWidth/2)){inView=false;}
        if(nowPos.x>(pageWidth/2 + cardWidth/2)){inView=false;}
        if(forceAll){inView=true;}
        if(inView){
          var trans=posToTransform(nowPos);
          //dbugStr+=trans+"\n";
          ref.style.webkitTransform=trans;
        }
      }

    }
    if(dockingProg==1){
      flowDocking=false;
      if(videoLoaded != atFlow){
        loadVideo(atFlow);
        }

    }
    flowTimeout=window.setTimeout('flowTick(false)', 16);
  }
  else{
    //dbug('');
  }
}
function geometry(){
  //console.log('geometry()');
  pageHeight=window.innerHeight;
  pageWidth=window.innerWidth;

  videoHeight=Math.floor(pageHeight*.4);
  videoWidth=Math.floor(videoHeight*16/9);
  videoTop=pageHeight*.05;
  videoLeft=(pageWidth-videoWidth)/2;

  cardHeight=pageHeight*.4;
  cardWidth=cardHeight*11/17;
  cardTop=pageHeight*.475;
  cardLeft=(pageWidth-cardWidth)/2;

  slotScale=.5*.75;
  slotY=cardHeight/1.41;
  slotX=cardWidth/2.25;
  dockZ=0-cardWidth/20;
  slotZ=0-cardWidth/25;
  flowZ=0;
  dragZ=0+cardWidth/25;
  layoutHeight=pageHeight-headerHeight;
  if(pageHeight>pageWidth){deviceOrientation="portrait";}
  else{deviceOrientation="landscape";}
  console.log("cardHeight "+cardHeight);
  console.log("cardWidth "+cardWidth);
  console.log("cardTop "+cardTop);
  console.log("cardLeft "+cardLeft);

}


function restyleCards(){
  flowDiv.style.display="none";
  console.log('restyleCards()');
  var glossaryPt=14;
  var style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = '.cardSize{position:absolute; width:'+cardWidth/1+'px; height:'+cardHeight/1+'px;  background-size:contain;}';
  style.innerHTML += '.flowCard{-webkit-transform-style: preserve-3d; -webkit-perspective: 1000; -webkit-backface-visibility: visible; left:'+cardLeft+'px; top:'+cardTop+'px; border-radius:'+cardWidth/11+'px;}';

  style.innerHTML += '.flowCardBack{z-index:'+rnd(3)+'; Z-webkit-backface-visibility: hidden; -webkit-transform:rotateY(180deg) translateZ(5px); translateY(-45px);}';

  style.innerHTML += '.flowCardFront{z-index:'+rnd(3)+'; -webkit-backface-visibility: hidden;  translateZ(1px);}';

  style.innerHTML += '.flowCardNum{position:absolute; width:'+cardWidth+'px; top:'+cardHeight*.865+'px; text-align:center; font:'+cardHeight/14+'px OpenSans;}';

  style.innerHTML += '.flowStatus{position:absolute; left:'+0+'px; top:'+pageHeight*.01+'px; width:'+pageWidth+'px; color:white; text-align:center; font:'+cardHeight/18+'px OpenSans;}';
  style.innerHTML += '.flowVideo{position:absolute; left:'+videoLeft+'px; top:'+videoTop+'px; width:'+videoWidth+'px;  height:'+videoHeight+'px; background-color:white; text-align:center; font:'+cardHeight/18+'px OpenSans;}';
  style.innerHTML += '.flowDone{background-color:#ba1c1b;  border-radius:'+cardWidth/40+'px; position:absolute; left:'+cardLeft+'px; top:'+pageHeight*.9+'px; width:'+cardWidth+'px; color:white; text-align:center; font:'+cardHeight/16+'px OpenSans;}';
  document.getElementsByTagName('head')[0].appendChild(style);
  if(flowUp){
    flowDiv.style.display="block";
    //console.log('in restyleCards()');
    destinateFlow();
    flowDocking=true;
    dockingProg=0;
  }
  
}
function rnd(range){
  return Math.floor(Math.random()*range);
  }

function nowMs(){
  var nowDate= new Date();
  return nowDate.getTime();
}

// gestures - start
function cardMouseDown(e, c){
  e.preventDefault();
  cardGestureStart(e, c);
  }
function cardTouchStart(e, c){
  e.preventDefault();
  e.pageX=e.touches[0].pageX;
  e.pageY=e.touches[0].pageY;
  cardGestureStart(e, c);  
  }

function cardGestureStart(e, c){
  cardGestureStartMs=nowMs();
  console.log('Start '+c);
  cardDragging=c;
  cardGestureStartX=e.pageX;
  cardGestureStartY=e.pageY;
  gestureLog=[{"type":"start", "x":e.pageX, "y":e.pageY}];
  cardGestureMove(e, c);
  }
function cardMouseMove(e, c){
  e.preventDefault();
  cardGestureMove(e, c);
  }

function cardTouchMove(e, c){

  e.preventDefault();
  e.pageX=e.touches[0].pageX;
  e.pageY=e.touches[0].pageY;
  cardGestureMove(e, c);
  }

function cardGestureMove(e, c){
  gestureLog.push({"type":"move", "x":e.pageX, "y":e.pageY});
  var deltaY= e.pageY-cardGestureStartY;
  deltaY=0;
  var origPos=returnPos(flowArray[c].type, flowArray[c].ord, dragZ, flowArray[c].side*180);
  var deltaX=e.pageX-cardGestureStartX;
  var pos;
  if(flowArray[c].type=="flow"){
    var yFrac=deltaY/slotY;
    if(yFrac>0){yFrac=0;}
    if(yFrac<-1){yFrac=-1;}
    var s=1+yFrac+(0-yFrac)*slotScale;
    pos={"x":origPos.x+deltaX, "y":yFrac*slotY, "z": dragZ, "s":s, "r":flowArray[c].pos.r};
    }
  else{// slot dragging
    var yFrac=deltaY/slotY;
    if(yFrac<0){yFrac=0;}
    if(yFrac>1){yFrac=1;}
    var s=yFrac+(1-yFrac)*slotScale;
    var y=(yFrac)*slotY-slotY;
    //dbug("deltaY : "+deltaY);
    //dbuga("yFrac : "+yFrac);
    //dbuga("y : "+y);
    //dbuga("s : "+s);

    pos={"x":origPos.x+deltaX, "y":y, "s":s, "z":dragZ, "r":flowArray[c].pos.r};
    }
  flowArray[c].pos=pos;
  // rotor track
  if(flowArray[c].type=="flow"){
    for(var u=0; u<unselectedCardIds.length; u++){
      var cardId= unselectedCardIds[u];
      if(cardId != c){
        var origPos=returnPos(flowArray[cardId].type, flowArray[cardId].ord, flowZ, flowArray[cardId].side*180);
        var pos={"x":origPos.x+deltaX, "y":origPos.y, "z":flowZ, "s":.9, "r":flowArray[cardId].pos.r};
        flowArray[cardId].pos=pos;
        }
      }
    }
  cardGestureLastX=e.pageX;
  cardGestureLastY=e.pageY;
  }

var verticalFrac=6;
var horizontalFrac=5;
var flickMs=200;
function cardMouseUp(e, c){
  e.preventDefault();
  cardGestureEnd(e, c);
  }
function cardTouchEnd(e, c){
  e.preventDefault();
  cardGestureEnd(e, c);
  }
function cardGestureEnd(e, c){
  cardDragging=-1;
  var deltaMs=nowMs()- cardGestureStartMs;
  console.log('End '+c +" "+ deltaMs);
  for (var a=0; a<flowArray.length; a++){//save starts
    flowArray[a].startPos=flowArray[a].pos;
    }
  
  // determine dests
  var deltaX= cardGestureLastX-cardGestureStartX;
  var deltaY= cardGestureLastY-cardGestureStartY;
  deltaY=0;
  console.log("deltaX "+cardGestureLastX+"-"+cardGestureStartX+"="+deltaX);
  if((deltaMs<flickMs)&&(Math.abs(deltaX)<cardWidth/horizontalFrac)&&(Math.abs(deltaY)<cardHeight/verticalFrac)){//tap
    if(flowArray[c].type=="flow"){
      if(flowArray[c].ord==0){// 0 is flip Tap
        flowArray[c].side=Math.abs(flowArray[c].side-1);
        flowArray[c].destPos=returnPos("flow", 0, flowZ, flowArray[c].side*180);
      }
      else{//select flow Tap
        atFlow+=flowArray[c].ord;
        for(var u=0; u<unselectedCardIds.length; u++){
          var cardId=unselectedCardIds[u]; 
          var ref=document.getElementById('card_'+ cardId);
          var pos=returnPos("flow",u-atFlow, flowZ, flowArray[cardId].side*180);

          flowArray[cardId].destPos=pos;
          flowArray[cardId].type="flow";
          flowArray[cardId].ord=u-atFlow;        
        }
      }
    }// end flow tap
    else{//slot tap
      unselectCardId(c);
    }
  }//end  of tap
  else{//drop
    if(flowArray[c].type=="flow"){// drop flow
      if(Math.abs(deltaX)>Math.abs(deltaY)){//horizontal drag drop of flow
        if(deltaMs<flickMs){// flicked horizontal
          if(deltaX<0){deltaFlow=-1;}
          else{deltaFlow=1;}
        }
        else{deltaFlow=Math.round(deltaX/cardWidth);}
        atFlow-=deltaFlow;
        if(atFlow<0){atFlow=0;}
        if(atFlow>unselectedCardIds.length-1){atFlow=unselectedCardIds.length-1;}
        for(var u=0; u<unselectedCardIds.length; u++){//destinate
          var cardId=unselectedCardIds[u]; 
          var ref=document.getElementById('card_'+ cardId);
          var pos=returnPos("flow",u-atFlow, flowZ, flowArray[cardId].side*180);
 
          flowArray[cardId].destPos=pos;
          flowArray[cardId].type="flow";
          flowArray[cardId].ord=u-atFlow;        
        } 
      }//end of  horizontal flow drag
      else{//vert drag flow = select
        if((selectedCardIds.length<3)&&(Math.abs(deltaY)>cardHeight/verticalFrac)){
          selectCardId(c);
        }
      }//end of vert drag flow
    }// end of drag flow
    else{ //drag slot
      if(Math.abs(deltaX)>Math.abs(deltaY)){//horizontal slot drag
      }
      else{// vertical slot Drag
        if(Math.abs(deltaY)>cardHeight/6){
          unselectCardId(c);
        }
    
      }
    }
  }//end of drag
  
  for(var s=0; s<selectedCardIds.length; s++){
    var c=selectedCardIds[s]; 
    var pos=returnPos("slot",s-1, slotZ, 0);
    flowArray[c].destPos=pos;
    flowArray[c].type="slot";
    flowArray[c].ord=s-1;
  }
  gestureLog.push({"type":"end", "x":-1, "y":-1});
  console.log(gestureLog);
  flowDocking=true;
  dockingProg=0;

}
