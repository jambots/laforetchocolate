console.log ('homerotor.js ran');
var holders=document.getElementsByClassName('homerotorholder');
var useDelay=5000;
var useChange=500;
var homeRotorInterval;
var panels=[];
var rotorHolder;
var w=0;
var h=0;
if(typeof rotorDelay != 'undefined'){useDelay=rotorDelay;}
if(typeof rotorChange != 'undefined'){useChange=rotorChange;}
console.log('useDelay='+useDelay);
console.log('useChange='+useChange);
var atPanel=-1;

if(holders.length>0){
  console.log('holder found');
  rotorHolder=holders[0];
  w=rotorHolder.offsetWidth;
  h=rotorHolder.offsetHeight;
  panels=document.getElementsByClassName('homeSquarePanel');
  console.log(panels.length+' panels found');
  console.log('w='+w+' h='+h);
  if(panels.length>0){
    homeRotorInterval=window.setInterval('positionPanels()', useDelay)
    positionPanels();
    setTransitions();
    }    
  }
function positionPanels(){
  atPanel++;
  atPanel=atPanel%(panels.length); //0-4
  console.log('positionPanels() atPanel='+atPanel +' panels.length='+panels.length);
  for (var p=0; p<panels.length; p++){//p 0 to 4
    var pMod=((p+2+atPanel)%(panels.length))-2;//pMod -2 to 2
    panel=panels[p];
    panel.style.left=w*(pMod)+"px";
    var useTop=0;
    if (Math.abs(pMod)>1){useTop=0-h;}
    panel.style.top=useTop+"px";
    }
  }
function setTransitions(){
  for (var p=0; p<panels.length; p++){
    panel=panels[p];
    panel.style.transition = "all "+useChange+"ms";
    }

  }
  