import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {languages,suggestedLanguage,supportedLanguage,translations,type Language} from './languages';
const preferenceKey='doculens-language';
function storedLanguage(){try{return supportedLanguage(localStorage.getItem(preferenceKey));}catch{return undefined;}}
const Context=createContext({language:'en' as Language,setLanguage:(_language:Language)=>{},t:(text:string)=>text});
export const useLanguage=()=>useContext(Context);
export function LanguageProvider({children}:{children:ReactNode}){
 const [language,setCurrent]=useState<Language>(()=>storedLanguage()??'en');
 const [suggestion,setSuggestion]=useState<Language>(()=>storedLanguage()?'en':suggestedLanguage(navigator.languages??[navigator.language]));
 const setLanguage=(value:Language)=>{setCurrent(value);setSuggestion('en');try{localStorage.setItem(preferenceKey,value);}catch{/* Language selection still works without storage. */}};
 const t=(text:string)=>language==='en'?text:translations[language][text]??text;
 useEffect(()=>{document.documentElement.lang=language;},[language]);
 const suggested=languages.find(item=>item.code===suggestion)!;
 return <Context.Provider value={{language,setLanguage,t}}>{children}{suggestion!=='en'&&<aside className="language-suggestion" aria-label="Language suggestion"><p>Your browser prefers <strong lang={suggestion}>{suggested.name}</strong>.</p><div><button onClick={()=>setLanguage(suggestion)}>Use {suggested.name}</button><button onClick={()=>setLanguage('en')}>Stay in English</button></div><small>Suggested from browser settings, not your physical location.</small></aside>}</Context.Provider>;
}
export function LanguageSelector(){const {language,setLanguage,t}=useLanguage();return <label className="language-picker"><span className="sr-only">{t('Interface language')}</span><select aria-label={t('Interface language')} value={language} onChange={event=>setLanguage(event.target.value as Language)}>{languages.map(item=><option key={item.code} value={item.code}>{item.code.toUpperCase()} · {item.name}</option>)}</select></label>;}
export function DocumentLanguage({value,onChange,disabled}:{value:string;onChange:(value:string)=>void;disabled:boolean}){const {t}=useLanguage();return <label className="document-language">{t('Document language')}<select value={value} disabled={disabled} onChange={event=>onChange(event.target.value)}>{languages.map(item=><option key={item.ocr} value={item.ocr}>{item.name}</option>)}</select></label>;}
