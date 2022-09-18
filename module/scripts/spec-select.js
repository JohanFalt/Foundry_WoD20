export const registerCustomSelectBoxes = async function(html, parentSheet) {
  let parentEle = html.get(0);
    parentEle.querySelectorAll('input[data-koptions]').forEach( ele => { if(! ele.classList.contains('fancyComboBox')){
      ele.classList.add('fancyComboBox');
      ele.insertAdjacentHTML('afterend',`<div>${ele.dataset.koptions.split('/').reduce((a,v)=>
        a+`<div${v.match(/^-+$/)?' class="kOptionDelimiter"':v.match(/^--.+--$/)?' class="kOptionHeader"':''}>${
          v.match(/^-+$/)?'':( v.match(/^--.+--$/) )?v.slice(2,-2):v
      }</div>`,'')}</div>`);
      let search = (ele.dataset.koptionsSearch)?true:false;
      let dropDown = ele.nextElementSibling;
      dropDown.classList.add('fancyTextArea');
      let options = Array.from(dropDown.children).filter(v=>(v.classList.contains('kOptionDelimiter')||v.innerText!=''));
      let activeEle = null;
      let eIndex = 0;
      let reRenderOptions = (searchFilter=false) => {
        let r = new RegExp(`.*${ele.value.toLowerCase().split('').join('.*')}.*`,'i');
        let opDel = false;
        let opHed = false;
        let op = options.reduce( (a,v,i,o) => {
          if( ((search)?v.innerText.match(r):true)  && !v.classList.contains('kOptionDelimiter')  && !v.classList.contains('kOptionHeader')){
            if(opDel) { a.push(opDel); opDel = false; }
            if(opHed) { a.push(opHed); opHed = false; }
            a.push(v)
          }
          else if( v.classList.contains('kOptionDelimiter') && a[0]){ opDel=v; }
          else if( v.classList.contains('kOptionHeader')){ opHed=v; }
          return a;
        },[]);
        dropDown.innerHTML = '';
        op.forEach( o => dropDown.appendChild(o) );
      }
      let fillEle = (sourceEle,blurBool=false) => { ele.value = sourceEle.innerText; if(blurBool){ ele.blur() }
                                                   ele.dispatchEvent( new Event('change',{'bubbles':true}) ) }

      function rafDebounce(fn){
        let timerId;
        return function (...args) {
          if(timerId){ window.cancelAnimationFrame(timerId); }
          timerId = window.requestAnimationFrame(() => { fn.apply(this, args); timerId = null; });
        }
      }
      
      let scrollParent = parentEle.parentNode;
      let scrollFix = rafDebounce(e => {
        let cRect = ele.getBoundingClientRect();
        let x = ele.offsetLeft ;
        let y = ele.offsetTop + cRect.height - e.target.scrollTop;
        dropDown.style.cssText += `;left:${x}px; top:${y}px`;
        dropDown.scrollTop = 0;
      });
      
      ele.addEventListener('focus', e => {
        let cRect = ele.getBoundingClientRect();
        let x = ele.offsetLeft ;
        let y = ele.offsetTop + cRect.height - scrollParent.scrollTop;
        dropDown.style.cssText += `; display:block; left:${x}px; top:${y}px; min-width:${cRect.width}px`;
        dropDown.scrollTop = 0;
        options.forEach(ele => ele.classList.remove('active'));
        reRenderOptions();
        activeEle = null;
        eIndex=-1;
        
        scrollParent.addEventListener('scroll',scrollFix);
      });

      ele.addEventListener('blur', e => {
        document.activeElement.blur();
        dropDown.style.display = 'none';
        dropDown.innerHTML = '';
        
        scrollParent.removeEventListener('scroll',scrollFix);
      });

      dropDown.addEventListener('pointerdown', e => {
        let x = e.target.closest('input.fancyComboBox + div > div');
        if(x){ fillEle(x); }
      });

      // search filter functionality (optionaly)
      if(search){  ele.addEventListener('input', e => reRenderOptions() );  }

      // Keyboard controls, up/down arrow keys, enter to choose option
      ele.addEventListener('keydown', e => {if(['ArrowDown','ArrowUp','Enter'].includes(e.key)){
        if(e.key == "Enter" && activeEle && activeEle.parentNode){
          fillEle(activeEle,1)
        } else {
          e.preventDefault();  e.stopPropagation();
          eIndex = eIndex + ((e.key=='ArrowDown')?1:-1);
          eIndex = (eIndex>=dropDown.children.length)?0:(eIndex<0)?dropDown.children.length-1:eIndex;
          while(['kOptionDelimiter','kOptionHeader'].some( v => dropDown.children[eIndex].classList.contains(v))){
            eIndex = eIndex + ((e.key=='ArrowDown')?1:-1);
          }
          activeEle = dropDown.children[eIndex];
          options.forEach(ele => ele.classList.remove('active'));
          activeEle.classList.add('active');
          activeEle.scrollIntoView({'block':'nearest'});
        }
      }});
    }});
}