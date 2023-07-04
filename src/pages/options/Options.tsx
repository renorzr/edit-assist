import React, {useEffect, useState} from "react";
import "@pages/options/Options.css";
import logo from "@assets/img/icon-64.png";
import { set } from "yaml/dist/schema/yaml-1.1/set";

const LANGUAGES = [
  {code: 'en', name: 'English'},
  {code: 'zh', name: '中文'},
  {code: 'ja', name: '日本語'},
  {code: 'ko', name: '한국어'},
  {code: 'fr', name: 'Français'},
  {code: 'de', name: 'Deutsch'},
  {code: 'es', name: 'Español'},
  {code: 'pt', name: 'Português'},
  {code: 'it', name: 'Italiano'},
  {code: 'ru', name: 'Русский'},
];

const Options: React.FC = () => {
  const [userLanguage, setUserLanguage] = useState('');
  const [secondLanguage, setSecondLanguage] = useState('');
  const [gptApiKey, setGptApiKey] = useState('');
  const [gptModel, setGptModel] = useState('');
  const [gptMaxTokens, setGptMaxTokens] = useState(1000);
  const [gptTemperature, setGptTemperature] = useState(0.7);

  useEffect(() => {
    // Load options from storage
    chrome.storage.sync.get(null, (result) => {
      console.log('Options retrieved', result);
      setUserLanguage(result.userLanguage || 'auto');
      setSecondLanguage(result.secondLanguage || 'none');
      setGptApiKey(result.gptApiKey || '');
      setGptModel(result.gptModel || 'text-davinci-003');
      setGptMaxTokens(result.gptMaxTokens || 1000);
      setGptTemperature(result.gptTemperature || 0.7);
    });
  }, []);

  function handleValueChange(key: string) {
    return (event) => {
      console.log('handleValueChange', key, event.target.value);
      const value = event.target.value;
      switch (key) {
        case 'userLanguage':
          setUserLanguage(value);
          break;
        case 'secondLanguage':
          setSecondLanguage(value);
          break;
        case 'gptApiKey':
          setGptApiKey(value);
          break;
        case 'gptModel':
          setGptModel(value);
          break;
        case 'gptMaxTokens':
          setGptMaxTokens(value);
          break;
        case 'gptTemperature':
          setGptTemperature(value);
          break;
      }

      chrome.storage.sync.set({ [key]: value });
    };
  }

  return <div className="OptionsContainer">
    <div>
      <h1><img src={logo} alt="logo"/>Text Assist</h1>
      <hr/>
    </div>
    <h2>{chrome.i18n.getMessage('optionsTitle')}</h2>
    <hr/>
    <h3>{chrome.i18n.getMessage('Translation')}</h3>
    <div className="user_setting_options">
      <label>{chrome.i18n.getMessage('UserLanguage')}</label>
      <select className="user_setting_select" onChange={handleValueChange('userLanguage')} value={userLanguage}>
        <option value="auto">{chrome.i18n.getMessage('Auto')}</option>
        {LANGUAGES.map(language => <option value={language.code}>{language.name}</option>)}
      </select>
      <span className="tip">{chrome.i18n.getMessage('UserLanguageTip')}</span>
    </div>
    <div className="user_setting_options">
      <label>{chrome.i18n.getMessage('SecondLanguage')}</label>
      <select className="user_setting_select" onChange={handleValueChange('secondLanguage')} value={secondLanguage}>
        <option value="none">{chrome.i18n.getMessage('None')}</option>
        {LANGUAGES.map(language => <option value={language.code}>{language.name}</option>)}
      </select>
      <span className="tip">{chrome.i18n.getMessage('SecondLanguageTip')}</span>
    </div>

    <h3>GPT</h3>
    <div className="user_setting_options">
      <label>API Key</label>
      <input onChange={handleValueChange('gptApiKey')} value={gptApiKey}/>
    </div>

    <div className="user_setting_options">
      <label>Model</label>
      <select className="user_setting_select" onChange={handleValueChange('gptModel')} value={gptModel}>
        <option value="text-davinci-003">text-davinci-003</option>
      </select>
    </div>

    <div className="user_setting_options">
      <label>Max Tokens</label>
      <input type="number" max={10000} onChange={handleValueChange('gptMaxTokens')} value={gptMaxTokens} />
    </div>

    <div className="user_setting_options">
      <label>Temperature</label>
      <input type="number" step={0.1} max={1} min={0} onChange={handleValueChange('gptTemperature')} value={gptTemperature} />
    </div>
  </div>;
};

export default Options;
