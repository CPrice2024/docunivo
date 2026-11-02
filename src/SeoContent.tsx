import pages from './seo-pages.json';

export function SeoContent({path,heading=false}:{path:string;heading?:boolean}){
 const page=pages.find(page=>page.path===path);
 if(!page?.intro)return null;
 const related=pages.filter(item=>item.tool&&item.path!==path);
 return <section className="search-content container" lang="en" aria-labelledby="page-overview-title">
  <span className="workspace-kicker">DOCUNIVO / DOCUMENT & IMAGE TOOLS</span>
  {heading?<h1 id="page-overview-title">{page.heading}</h1>:<h2 id="page-overview-title">{page.heading}</h2>}
  <p>{page.intro}</p><p>{page.details}</p>
  <nav className="related-tools" aria-label="Explore document and image tools">{related.map(item=><a key={item.path} href={item.path}>{item.heading}<span aria-hidden="true"> ↗</span></a>)}</nav>
 </section>;
}
