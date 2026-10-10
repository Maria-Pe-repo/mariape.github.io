document.querySelectorAll('[data-copy]').forEach(function(b){
  b.addEventListener('click', function(){
    var el=document.getElementById(b.dataset.copy), msg=b.nextElementSibling;
    var done=function(t){ msg.textContent=t; setTimeout(function(){msg.textContent='';},3000); };
    var selectCopy=function(){ var r=document.createRange(); r.selectNodeContents(el); var s=getSelection(); s.removeAllRanges(); s.addRange(r);
      var ok=false; try{ ok=document.execCommand('copy'); }catch(e){} s.removeAllRanges(); done(ok?'Copied. Now paste into Gmail.':'Select the signature and press Cmd+C.'); };
    try{
      var item=new ClipboardItem({'text/html':new Blob([el.innerHTML],{type:'text/html'}),'text/plain':new Blob([el.innerText],{type:'text/plain'})});
      navigator.clipboard.write([item]).then(function(){done('Copied. Now paste into Gmail.');},selectCopy);
    }catch(e){ selectCopy(); }
  });
});
