import React, { useEffect } from "react";
import logo from "@assets/img/icon-menu.png";

export default function App() {
  function makeDraggable(titleElement: any) {
    let pos3 = 0, pos4 = 0;
    const windowElement = titleElement.parentElement;
  
    titleElement.onmousedown = dragMouseDown;
  
    function dragMouseDown(e: any) {
      e = e || window.event;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = stopDrag;
      document.onmousemove = elementDrag;
    }
  
    function elementDrag(e: any) {
      e = e || window.event;
      e.preventDefault();
      let pos1 = pos3 - e.clientX;
      let pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      windowElement.style.top = (windowElement.offsetTop - pos2) + "px";
      windowElement.style.left = (windowElement.offsetLeft - pos1) + "px";
    }
  
    function stopDrag() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  document.onkeydown = function (e) {
    if (e.code === 'KeyC' && e.ctrlKey && e.altKey) {
      const node = document.getSelection().anchorNode;
      console.log('complete', node);
      const rect = node.parentElement.getBoundingClientRect();
      // find first child textarea or input of node.parentElement
      const input = node.parentElement.querySelector('textarea, input');
      const text = input ? input['value'] : node.textContent;
      showWindow("complete", rect, text);
      e.stopPropagation();
    } else if (e.code === 'Tab' && windowPosition) {
      paste();
      setWindowPosition(null);
      e.stopPropagation();
    }
  }

  document.onmouseup = function (e) {
    if (findAncestor(e.target, 'window')) {
      return;
    }

    const text = window.getSelection()?.toString();
    if (text) {
      setMenuPosition({x: e.pageX + 4, y: e.pageY + 4});
      setWindowPosition(null);
    } else {
      setMenuPosition(null);
    }
  }

  function findAncestor(el: any, cls: string) {
    while ((el = el?.parentElement) && !el.classList.contains(cls));
    return el;
  }

  async function showWindow(type: string, position: any, _text?: string) {
    console.log('showWindow', type, position, _text);
    const selectedText = _text || window.getSelection()?.toString();
    setLines(['proceeding...']);
    setMenuPosition(null);
    setWindowPosition(position);
    setWindowType(type);
    switch (type) {
      case 'translate':
        setLines(await doTranslate(selectedText));
        break;
      case 'complete':
        setLines(await doComplete(selectedText));
        break;
      case 'summary':
        setLines(await doSummary(selectedText));
        break;
      case 'extend':
        setLines(await doExtend(selectedText));
        break;
      case 'polish':
        setLines(await doPolish(selectedText));
        break;
    }

    adjustWindowPosition(document.querySelector('.window'));
  }

  function adjustWindowPosition(windowElement: any) {
    const windowRect = windowElement.getBoundingClientRect();
    const { top, left, width, height } = windowRect;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
  
    let newTop = top + scrollY;
    let newLeft = left + scrollX;
  
    if (newTop < scrollY) {
      newTop = scrollY;
    } else if (newTop + height > scrollY + viewportHeight) {
      newTop = scrollY + viewportHeight - height;
    }
  
    if (newLeft < scrollX) {
      newLeft = scrollX;
    } else if (newLeft + width > scrollX + viewportWidth) {
      newLeft = scrollX + viewportWidth - width;
    }
  
    windowElement.style.top = newTop + 'px';
    windowElement.style.left = newLeft + 'px';
  }

  async function doTranslate(text: string) {
    const options = await chrome.storage.sync.get(['userLanguage','secondLanguage']);
    console.log('options', options);
    const userLanguage = (!options.userLanguage || options.userLanguage === 'auto') ? Intl.NumberFormat().resolvedOptions().locale : options.userLanguage;
    const textLanguage = await chrome.i18n.detectLanguage(text);
    console.log('textLanguage/userLanguage', textLanguage, userLanguage);
    const toLanguage = textLanguage.languages[0]?.language.split('-')[0] === userLanguage.split('-')[0] ? (options.secondLanguage || 'en') : userLanguage;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${toLanguage}&dt=t&q=${text}`;
    const res = await fetch(url);
    const json = await res.json();
    console.log('translate', json);
    return json[0].map((item: any) => item[0]);
  }

  function doComplete(text: string): Promise<string[]> {
    return callGPT({
          prompt: 'I want to complete this text: ' + text,
          max_tokens: 100,
          model: 'text-davinci-003',
    });
  }

  function doSummary(text: string): Promise<string[]> {
    return callGPT({
          prompt: 'I want to summary this text: ' + text,
          max_tokens: 1000,
          model: 'text-davinci-003',
    });
  }

  function doExtend(text: string): Promise<string[]> {
    return callGPT({
          prompt: 'I want to extend this text: ' + text,
          max_tokens: 1000,
          model: 'text-davinci-003',
    });
  }

  function doPolish(text: string): Promise<string[]> {
    return callGPT({
          prompt: 'I want to polish this text: ```' + text + '```',
          max_tokens: 1000,
          model: 'text-davinci-003',
    });
  }

  function paste() {
    // iterate every chars in `lines`, and paste to current cursor position
    document.execCommand('insertText', false, lines.join('\n'));
  }

  // call GPT API
  async function callGPT(params: {[key: string]: any}): Promise<string[]> {
    const apiUrl = 'https://api.openai.com/v1/completions';
  
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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',
        },
        body: JSON.stringify(params),
      });
  
      const data = await response.json();
      return [data.choices[0].text.trim()];
    } catch (error) {
      console.error('Error calling ChatGPT API:', error);
      throw error;
    }
  }

  const [lines, setLines] = React.useState([]);
  const [menuPosition, setMenuPosition] = React.useState(null);
  const [windowPosition, setWindowPosition] = React.useState(null);
  const [windowType, setWindowType] = React.useState("");

  useEffect(() => {
    console.log("content view loaded");
  }, []);

  useEffect(() => {
    if (windowPosition) {
      makeDraggable(document.querySelector('.title'));
    }
  }, [windowPosition]);

  return <div className="content-view">
    { menuPosition && <div className="menu" style={{top: menuPosition.y, left: menuPosition.x, position: 'absolute', zIndex: '1000'}}>
      {["translate", "complete", "summary", "extend", "polish"].map(type => [
        <button title={chrome.i18n.getMessage(type + 'WindowTitle')} className="menu-button" onClick={() => showWindow(type, menuPosition)}>
          {chrome.i18n.getMessage(type + 'Button')}
        </button>])}
        <img className="icon" style={{position: 'absolute'}} src={logo} />
    </div> }
    { windowPosition && <div className="window" style={{top: windowPosition.y, left: windowPosition.x, position: 'absolute', zIndex: '1000'}}>
      <div className="title">
        {chrome.i18n.getMessage(windowType + 'WindowTitle')}
        <button className="close" title={chrome.i18n.getMessage("close")} onClick={() => setWindowPosition(null)}>x</button>
        <button className="paste" title={chrome.i18n.getMessage("paste")} onClick={() => {paste(); setWindowPosition(null)}}>p</button>
      </div>
      <div className="body">
      {lines.map(line => <p>{line}</p>)}
      </div>
    </div> }
  </div>;
}
