import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Brand} from './Brand';
import {InformationPage,informationPages,ToolGuide} from './PageContent';
import {SeoContent} from './SeoContent';
import pages from './seo-pages.json';

export function renderPage(path:string){
 const page=pages.find(page=>page.path===path)!;
 return renderToStaticMarkup(<div className="app"><a className="skip-link" href="#main-content">Skip to content</a><header className="nav container"><Brand/><nav aria-label="Main navigation"><a href="/">All tools</a><a href="/about/">About</a><a href="/contact/">Contact</a></nav></header><main id="main-content">
  {informationPages[path]?<InformationPage path={path}/>:<><SeoContent path={path} heading/><p className="container">The interactive upload and editing tools require JavaScript. Your files are processed in your browser.</p>{page.tool&&<ToolGuide tool={page.tool} title={page.heading}/>}</>}
 </main><footer className="footer container"><Brand/><nav className="footer-links" aria-label="Site information">{Object.entries(informationPages).map(([href,title])=><a key={href} href={href}>{title}</a>)}</nav></footer></div>);
}
