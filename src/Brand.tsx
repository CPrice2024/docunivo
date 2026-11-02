import {Instagram, Linkedin, ScanText} from 'lucide-react';

export function Brand(){
 return <a className="brand" href="/" aria-label="Docunivo home"><span className="brand-icon" aria-hidden="true"><ScanText size={23}/><span className="brand-scan"/></span><span>Docu<span className="brand-accent">nivo</span></span></a>;
}

function XIcon(){
 return <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22H17l-4.8-7.3L5.8 22H2.6l7.9-9L.8 2h6.4l4.4 6.7L18.9 2Zm-1.1 18h1.7L6.3 3.9H4.5L17.8 20Z"/></svg>;
}

export function SocialLinks(){
 const links=[
  {name:'Instagram',icon:Instagram},
  {name:'LinkedIn',icon:Linkedin},
  {name:'X',icon:XIcon},
 ];
 return <div className="social-icons" role="group" aria-label="Social media">{links.map(({name,icon:Icon})=><span className="social-icon" key={name} role="img" aria-label={name} title={name}><Icon aria-hidden="true"/></span>)}</div>;
}
