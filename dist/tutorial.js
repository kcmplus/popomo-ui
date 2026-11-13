const tutorialDialog=document.querySelector('#tutorial-dialog');
const tutorialVideo=document.querySelector('#tutorial-video');
document.querySelector('#tutorial-button').addEventListener('click',()=>{tutorialDialog.showModal();tutorialVideo.currentTime=0;const play=tutorialVideo.play();if(play)play.catch(()=>{});});
tutorialDialog.addEventListener('close',()=>{tutorialVideo.pause();});
