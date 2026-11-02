import {useLanguage} from './Language';
import {useEffect,useRef,useState} from 'react';
import config from './site-config.json';

declare global {
  interface Window {
    doculensAdsAllowed?:boolean;
    adsbygoogle?:Record<string,unknown>[];
  }
}

// A certified CMP integration sets doculensAdsAllowed and dispatches this event
// only when its regional consent logic permits an ad request.
export function AdSlot({placement}:{placement:'content'|'footer'}){
 const {t}=useLanguage();
  const [allowed,setAllowed]=useState(window.doculensAdsAllowed===true);
  const element=useRef<HTMLModElement>(null),requested=useRef(false);
  const valid=config.ads.enabled&&/^ca-pub-\d{16}$/.test(config.ads.publisherId)&&/^\d+$/.test(config.ads.slots[placement]);
  useEffect(()=>{
    const update=()=>setAllowed(window.doculensAdsAllowed===true);
    window.addEventListener('doculens:ads-consent',update);
    return ()=>window.removeEventListener('doculens:ads-consent',update);
  },[]);
  useEffect(()=>{
    if(!valid||!allowed||!element.current||requested.current)return;
    const observer=new IntersectionObserver(entries=>{
      if(!entries.some(entry=>entry.isIntersecting)||requested.current)return;
      requested.current=true;
      if(!document.getElementById('doculens-adsense')){
        const script=document.createElement('script');
        script.id='doculens-adsense';script.async=true;script.crossOrigin='anonymous';
        script.src=`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.ads.publisherId}`;
        document.head.appendChild(script);
      }
      (window.adsbygoogle=window.adsbygoogle||[]).push({});
      observer.disconnect();
    },{rootMargin:'200px'});
    observer.observe(element.current);
    return ()=>observer.disconnect();
  },[valid,allowed]);
  if(!(valid&&allowed)&&!config.ads.preview)return null;
  return <aside className="ad-region container" aria-label="Advertisement"><span className="ad-label">{t("Advertisement")}</span><div className="ad-space">{valid&&allowed?<ins ref={element} className="adsbygoogle" style={{display:'block'}} data-ad-client={config.ads.publisherId} data-ad-slot={config.ads.slots[placement]} data-ad-format="auto" data-full-width-responsive="true"/>:<span className="ad-preview">Ad placement preview</span>}</div></aside>;
}
