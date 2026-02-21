import { supabase } from './supabaseClient'
import { useEffect, useState } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=Instrument+Serif:ital@0;1&display=swap');`;

const MOCK_REGRETS = [
  { id: 1, text: "Told my boss I was 'basically a people person' in my interview. I have not spoken to a coworker voluntarily since 2019.", category: "Career", name: "Corporate Hermit", votes: 847, timestamp: "2 days ago", tags: ["Funniest","Dumbest"], pinned: true, badge: "Legendary Mistake" },
  { id: 2, text: "Sent 'I love you' to my landlord instead of my partner. He raised my rent anyway.", category: "Relationships", name: "Regretful Legend", votes: 1203, timestamp: "3 days ago", tags: ["Funniest"], pinned: false, badge: null },
  { id: 3, text: "Quit my stable job to become a crypto influencer in November 2021. I now sell insurance.", category: "Money", name: "Former Visionary", votes: 2891, timestamp: "1 week ago", tags: ["Dumbest","Most Dramatic"], pinned: false, badge: "Historic Regret", locked: true },
  { id: 4, text: "Convinced my entire family to go vegan for a month. We don't talk about that month.", category: "Family", name: "The Instigator", votes: 634, timestamp: "4 days ago", tags: ["Funniest"], pinned: false, badge: null },
  { id: 5, text: "Got my ex's name tattooed. We broke up 3 days later. They were also named Alex. My new partner is also named Alex. This is fine.", category: "Relationships", name: "Statistically Cursed", votes: 4102, timestamp: "2 weeks ago", tags: ["Most Dramatic","Funniest"], pinned: false, badge: "Emotional Damage Award" },
  { id: 6, text: "Told my therapist I was 'actually doing great' to save money. I was not doing great.", category: "Life Decisions", name: "Economical Liar", votes: 1567, timestamp: "5 days ago", tags: ["Dumbest"], pinned: false, badge: null },
  { id: 7, text: "Invested my emergency fund in NFTs of 'emotionally complex frogs.' They are gone. I am not emotionally complex, apparently.", category: "Money", name: "Amphibian Investor", votes: 3241, timestamp: "1 week ago", tags: ["Dumbest","Funniest"], pinned: true, badge: "Certified Poor Decision" },
  { id: 8, text: "Replied all to a company-wide email. 847 people now know about my lasagna situation.", category: "Embarrassment", name: "Lasagna Person", votes: 5623, timestamp: "3 weeks ago", tags: ["Funniest","Most Dramatic"], pinned: false, badge: null },
  { id: 9, text: "Said 'you too' when a waiter told me to enjoy my meal. Then said 'I will' to cover it. Then winked. I don't know why I winked.", category: "Embarrassment", name: "The Winker", votes: 2109, timestamp: "6 days ago", tags: ["Funniest"], pinned: false, badge: null },
  { id: 10, text: "Moved across the country for someone I'd met twice. Once on a Tuesday. We were together for 11 days.", category: "Relationships", name: "Romantic Optimist", votes: 1834, timestamp: "1 week ago", tags: ["Most Dramatic"], pinned: false, badge: null },
  { id: 11, text: "Told my entire LinkedIn network I was 'excited for new opportunities' before I'd actually quit. My CEO is a connection.", category: "Career", name: "Networking Innovator", votes: 987, timestamp: "4 days ago", tags: ["Dumbest"], pinned: false, badge: null },
  { id: 12, text: "Bought a boat. I live in a landlocked state. I thought it would motivate me to move. I still live in the landlocked state.", category: "Life Decisions", name: "Maritime Dreamer", votes: 2345, timestamp: "2 weeks ago", tags: ["Dumbest","Funniest"], pinned: false, badge: null },
];

const CATEGORIES = ["Relationships","Career","Money","Family","Embarrassment","Life Decisions","Secrets","Other"];
const CAT_ICONS = { Relationships:"💔", Career:"💼", Money:"💸", Family:"👨‍👩‍👧", Embarrassment:"😬", "Life Decisions":"🎲", Secrets:"🤫", Other:"🌀" };

const BADGES = [
  { id:"legendary", label:"Legendary Mistake", emoji:"🏅", desc:"For the rare few who outdid themselves." },
  { id:"certified", label:"Certified Poor Decision", emoji:"📜", desc:"Officially documented. Officially yours." },
  { id:"historic", label:"Historic Regret", emoji:"🏛️", desc:"Future generations will study this." },
  { id:"emotional", label:"Emotional Damage Award", emoji:"💔", desc:"The feelings. The consequences. The chaos." },
];

const ALL_UPSELLS = [
  { id:"delete", emoji:"🗑️", title:"Delete Your Regret", subtitle:"Escape Fee", price:5, desc:"Regrets are permanent… unless you buy closure. Removes your entry from the public archive. We'll pretend it never happened. (We will remember.)" },
  { id:"edit", emoji:"✏️", title:"Edit Your Regret", subtitle:"One Edit Per Purchase", price:2, desc:"Rethought the wording at 3am? One chance to fix what you wrote. Cannot undo the original decision — only the documentation of it." },
  { id:"pin", emoji:"📌", title:"Pin Your Regret", subtitle:"Top of Archive · 7 Days", price:3, desc:"Make your regret impossible to miss. Featured at the top of the archive for a full week. Maximum visibility. Minimum dignity." },
  { id:"badge", emoji:"👑", title:"Fame Badge", subtitle:"Anonymous Glory", price:4, desc:"A special label on your regret forever. Choose from Legendary Mistake, Certified Poor Decision, Historic Regret, or Emotional Damage Award." },
  { id:"lock", emoji:"🔒", title:"Lock Forever", subtitle:"Irreversible by Design", price:3, desc:"Pay to make your regret permanently undeletable. Even you can't remove it. Philosophical. Dramatic. A commitment you'll probably also regret." },
  { id:"bump", emoji:"🔁", title:"Bump to Top", subtitle:"Re-promote Your Entry", price:2, desc:"Old regret slipping into obscurity? Resurrect it. One bump puts you back at the top. Like boosting a post, but sadder." },
];

const css = `
${FONTS}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--cream:#f5f0e8;--ink:#1a1208;--red:#c8392b;--gold:#b8860b;--gray:#8a7d6b;--paper:#ede8dc;--border:rgba(26,18,8,0.13);--green:#2a7a4b}
html{scroll-behavior:smooth}
body{background:var(--cream);color:var(--ink);font-family:'DM Mono',monospace;min-height:100vh}

/* NAV — all links always visible */
.nav{position:sticky;top:0;z-index:100;background:var(--ink);border-bottom:3px solid var(--red);padding:0 1.5rem;display:flex;align-items:center;justify-content:space-between;height:58px;gap:1rem}
.nav-logo{font-family:'Playfair Display',serif;font-weight:900;font-style:italic;color:var(--cream);font-size:1rem;letter-spacing:-.02em;cursor:pointer;transition:color .2s;white-space:nowrap;flex-shrink:0}
.nav-logo:hover{color:var(--red)}
.nav-links{display:flex;flex-wrap:wrap;gap:0;align-items:center}
.nl{color:var(--gray);font-size:.6rem;letter-spacing:.09em;text-transform:uppercase;padding:0 .85rem;height:58px;display:flex;align-items:center;cursor:pointer;transition:all .2s;white-space:nowrap}
.nl:hover,.nl.active{color:var(--cream);background:rgba(255,255,255,.05)}
.nl.cta{background:var(--red);color:var(--cream)!important;font-weight:500}
.nl.cta:hover{background:#a02d22}

/* PAYMENT BANNER */
.pay-banner{background:var(--ink);border-bottom:1px solid rgba(255,255,255,.07);padding:.55rem 1.5rem;display:flex;align-items:center;justify-content:center;gap:.6rem;flex-wrap:wrap}
.pay-banner-text{font-size:.6rem;color:var(--gray);letter-spacing:.05em;text-align:center}
.pay-banner-text strong{color:var(--cream)}
.pay-pill{font-size:.55rem;letter-spacing:.1em;text-transform:uppercase;padding:.2rem .65rem;border:1px solid rgba(255,255,255,.2);color:rgba(245,240,232,.7);display:inline-flex;align-items:center;gap:.3rem}

.page{min-height:calc(100vh - 58px);animation:fi .3s ease}
@keyframes fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* HERO */
.hero{padding:5rem 2rem 3.5rem;max-width:900px;margin:0 auto;text-align:center}
.stamp{display:inline-block;border:2.5px solid var(--red);color:var(--red);font-size:.58rem;letter-spacing:.2em;text-transform:uppercase;padding:.3rem .9rem;margin-bottom:2.5rem;transform:rotate(-1deg)}
.hero-title{font-family:'Playfair Display',serif;font-size:clamp(3rem,8vw,7rem);font-weight:900;line-height:.92;letter-spacing:-.03em;margin-bottom:.5rem}
.hero-title em{font-style:italic;color:var(--red)}
.hero-sub{font-family:'Instrument Serif',serif;font-size:clamp(.95rem,2.5vw,1.35rem);color:var(--gray);font-style:italic;margin:1.3rem 0 .5rem;line-height:1.5}
.hero-desc{font-size:.78rem;color:var(--gray);line-height:1.75;max-width:500px;margin:0 auto 2.8rem}
.hero-ctas{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}

.btn{padding:.85rem 1.9rem;font-family:'DM Mono',monospace;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:all .2s;border:2px solid var(--ink);display:inline-block}
.btn-p{background:var(--ink);color:var(--cream)}
.btn-p:hover{background:var(--red);border-color:var(--red);transform:translateY(-2px)}
.btn-s{background:transparent;color:var(--ink)}
.btn-s:hover{border-color:var(--red);color:var(--red);transform:translateY(-2px)}
.btn-ghost{background:transparent;color:var(--cream);border-color:rgba(245,240,232,.3)}
.btn-ghost:hover{border-color:var(--cream)}
.btn-green{background:var(--green);color:var(--cream);border-color:var(--green)}
.btn-green:hover{background:#1e5c38;border-color:#1e5c38}

.divider{border:none;border-top:1px solid var(--border);max-width:900px;margin:0 auto}
.stats{display:flex;justify-content:center;gap:4rem;padding:3rem 2rem;max-width:900px;margin:0 auto}
.stat .n{font-family:'Playfair Display',serif;font-size:2.5rem;font-weight:900;color:var(--red);line-height:1}
.stat .l{font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:var(--gray);margin-top:.3rem}

.dark-section{background:var(--ink);padding:4rem 2rem}
.dark-inner{max-width:900px;margin:0 auto}
.section-label{font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;color:var(--red);margin-bottom:1.5rem}
.feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1px;background:rgba(255,255,255,.08)}
.feat-card{background:var(--ink);padding:2rem;transition:background .2s}
.feat-card:hover{background:#1e160a}
.feat-cat{font-size:.58rem;letter-spacing:.15em;text-transform:uppercase;color:var(--red);margin-bottom:.7rem}
.feat-text{font-family:'Instrument Serif',serif;font-size:1rem;font-style:italic;color:var(--cream);line-height:1.5;margin-bottom:.9rem}
.feat-meta{font-size:.62rem;color:var(--gray);display:flex;justify-content:space-between}

.cta-section{padding:5rem 2rem;text-align:center;max-width:700px;margin:0 auto}
.cta-title{font-family:'Playfair Display',serif;font-size:2.4rem;font-weight:900;font-style:italic;margin-bottom:1rem}
.cta-sub{font-size:.78rem;color:var(--gray);line-height:1.75;margin-bottom:2rem}

/* ARCHIVE */
.arch-head{background:var(--ink);padding:3rem 2rem;text-align:center}
.arch-title{font-family:'Playfair Display',serif;font-size:2.8rem;font-weight:900;font-style:italic;color:var(--cream);margin-bottom:.5rem}
.arch-sub{font-size:.7rem;color:var(--gray);margin-bottom:1.5rem}
.arch-controls{max-width:1100px;margin:0 auto;padding:1.3rem 2rem;display:flex;gap:.7rem;align-items:center;flex-wrap:wrap;border-bottom:1px solid var(--border)}
.fbtn{padding:.38rem .9rem;font-family:'DM Mono',monospace;font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;border:1px solid var(--border);background:transparent;color:var(--gray);cursor:pointer;transition:all .15s}
.fbtn:hover,.fbtn.act{border-color:var(--red);color:var(--red)}
.sort-sel{margin-left:auto;padding:.38rem .9rem;font-family:'DM Mono',monospace;font-size:.6rem;border:1px solid var(--border);background:transparent;color:var(--ink);cursor:pointer}
.arch-grid{max-width:1100px;margin:0 auto;padding:2rem;display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:1px;background:var(--border)}
.rcard{background:var(--cream);padding:1.7rem;transition:all .2s;position:relative}
.rcard:hover{background:var(--paper);z-index:1;box-shadow:4px 4px 0 var(--ink);transform:translate(-2px,-2px)}
.rcard.pinned{background:white;border-top:3px solid var(--gold)}
.rcard-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.9rem}
.rcat{font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--red)}
.rvotes{font-size:.62rem;color:var(--gray)}
.rtext{font-family:'Instrument Serif',serif;font-size:.97rem;font-style:italic;line-height:1.55;color:var(--ink);margin-bottom:1.1rem}
.rfoot{display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:.4rem}
.rname{font-size:.62rem;color:var(--gray)}
.rtags{display:flex;gap:.35rem;flex-wrap:wrap}
.tag{font-size:.52rem;letter-spacing:.08em;text-transform:uppercase;padding:.18rem .45rem;border:1px solid var(--border);color:var(--gray)}
.tag.f{border-color:#c8392b33;color:var(--red)}
.tag.d{border-color:#b8860b33;color:var(--gold)}
.tag.m{border-color:rgba(26,18,8,.25);color:var(--ink)}
.badge-tag{font-size:.52rem;letter-spacing:.06em;text-transform:uppercase;padding:.22rem .6rem;background:var(--ink);color:var(--cream);display:inline-block;margin-bottom:.5rem}
.locked-tag{font-size:.5rem;letter-spacing:.08em;text-transform:uppercase;padding:.15rem .45rem;border:1px solid rgba(26,18,8,.3);color:var(--gray);display:inline-flex;align-items:center;gap:.25rem}
.pin-label{font-size:.52rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);margin-bottom:.6rem;display:flex;align-items:center;gap:.3rem}

/* SUBMIT */
.sub-wrap{max-width:660px;margin:0 auto;padding:3rem 2rem 5rem}
.sub-head{text-align:center;margin-bottom:3rem}
.sub-title{font-family:'Playfair Display',serif;font-size:2.7rem;font-weight:900;font-style:italic;line-height:1;margin-bottom:.8rem}
.sub-desc{font-size:.75rem;color:var(--gray);line-height:1.75}
.steps{display:flex;justify-content:center;gap:0;margin-bottom:3rem;flex-wrap:wrap}
.step{font-size:.6rem;letter-spacing:.08em;text-transform:uppercase;color:var(--gray);padding:.55rem 1rem;border:1px solid var(--border);margin-right:-1px}
.step.active{color:var(--ink);border-color:var(--ink);background:var(--paper);z-index:1}
.step.done{color:var(--red);border-color:var(--red)}
.fg{margin-bottom:2rem}
.fl{display:block;font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;margin-bottom:.5rem}
.fsl{display:block;font-size:.62rem;color:var(--gray);margin-bottom:.55rem;font-style:italic}
.fta{width:100%;padding:1rem;font-family:'Instrument Serif',serif;font-size:1.05rem;font-style:italic;border:2px solid var(--ink);background:var(--cream);color:var(--ink);resize:vertical;min-height:120px;line-height:1.5;transition:border-color .2s}
.fta:focus{outline:none;border-color:var(--red)}
.fi{width:100%;padding:.75rem 1rem;font-family:'DM Mono',monospace;font-size:.78rem;border:2px solid var(--border);background:var(--cream);color:var(--ink);transition:border-color .2s}
.fi:focus{outline:none;border-color:var(--ink)}
.cc{font-size:.58rem;color:var(--gray);text-align:right;margin-top:.3rem}
.cc.warn{color:var(--red)}
.cat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:0;border:2px solid var(--ink)}
.copt{padding:.75rem 1rem;font-family:'DM Mono',monospace;font-size:.68rem;border:none;border-right:1px solid var(--border);border-bottom:1px solid var(--border);background:var(--cream);color:var(--gray);cursor:pointer;text-align:left;transition:all .15s}
.copt:nth-child(even){border-right:none}
.copt:nth-last-child(-n+2){border-bottom:none}
.copt:hover{background:var(--paper);color:var(--ink)}
.copt.sel{background:var(--ink);color:var(--cream)}
.cbwrap{display:flex;align-items:flex-start;gap:.75rem;cursor:pointer;padding:.8rem;border:1px solid var(--border);transition:background .15s}
.cbwrap:hover{background:var(--paper)}
.cbwrap input{margin-top:2px;accent-color:var(--ink);width:15px;height:15px;cursor:pointer;flex-shrink:0}
.cblabel{font-size:.73rem;color:var(--ink);line-height:1.5}
.fnav{display:flex;justify-content:space-between;margin-top:2.5rem;gap:1rem}

.rv-box{border:2px solid var(--ink);padding:2rem;margin-bottom:2rem;background:var(--paper)}
.rv-row{padding:.9rem 0;border-bottom:1px solid var(--border)}
.rv-row:last-child{border-bottom:none}
.rv-lbl{font-size:.58rem;letter-spacing:.15em;text-transform:uppercase;color:var(--gray);margin-bottom:.35rem}
.rv-val{font-family:'Instrument Serif',serif;font-size:1.05rem;font-style:italic;line-height:1.5}
.rv-val.sm{font-family:'DM Mono',monospace;font-size:.78rem;font-style:normal}
.price-box{border:3px solid var(--red);padding:1.5rem;text-align:center;margin-bottom:2rem}
.price-big{font-family:'Playfair Display',serif;font-size:3rem;font-weight:900;color:var(--red)}
.price-note{font-size:.68rem;color:var(--gray);margin-top:.35rem}

.pay-methods{display:grid;grid-template-columns:1fr 1fr;gap:0;border:2px solid var(--ink);margin-bottom:2rem}
.popt{padding:1.4rem;cursor:pointer;transition:all .2s;border-right:1px solid var(--border);text-align:center;background:var(--cream)}
.popt:last-child{border-right:none}
.popt:hover{background:var(--paper)}
.popt.sel{background:var(--ink)}
.plogo{font-size:1.4rem;margin-bottom:.4rem}
.pname{font-size:.68rem;letter-spacing:.1em;text-transform:uppercase}
.popt:not(.sel) .pname{color:var(--gray)}
.popt.sel .pname{color:var(--cream)}
.pregion{font-size:.58rem;color:var(--gray);margin-top:.2rem}
.popt.sel .pregion{color:rgba(245,240,232,.45)}
.secure{font-size:.62rem;color:var(--gray);text-align:center;padding:.75rem;border:1px solid var(--border);margin-bottom:2rem}

/* SUCCESS + MANAGE */
.success-pg{max-width:660px;margin:0 auto;padding:4rem 2rem 6rem}
.suc-stamp{display:inline-block;border:4px solid var(--red);color:var(--red);font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:900;font-style:italic;padding:1rem 2rem;transform:rotate(-3deg);margin-bottom:2.5rem;letter-spacing:.05em}
.suc-title{font-family:'Playfair Display',serif;font-size:2.4rem;font-weight:900;line-height:1.1;margin-bottom:1rem}
.suc-sub{font-size:.78rem;color:var(--gray);line-height:1.85;margin-bottom:2.5rem;max-width:480px}

.manage-box{border:2px solid var(--ink);background:var(--paper);padding:2rem;margin-bottom:2rem}
.manage-box-title{font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;margin-bottom:.4rem}
.manage-box-sub{font-size:.68rem;color:var(--gray);line-height:1.6;margin-bottom:1.2rem}
.link-display{background:white;border:1px solid var(--border);padding:.7rem 1rem;font-size:.65rem;color:var(--gray);letter-spacing:.03em;word-break:break-all;margin-bottom:.75rem;display:flex;align-items:center;justify-content:space-between;gap:.5rem}
.link-copy{background:var(--ink);color:var(--cream);border:none;font-family:'DM Mono',monospace;font-size:.6rem;letter-spacing:.08em;text-transform:uppercase;padding:.4rem .8rem;cursor:pointer;white-space:nowrap;transition:background .15s;flex-shrink:0}
.link-copy:hover{background:var(--red)}
.link-warn{font-size:.62rem;color:var(--red);display:flex;align-items:center;gap:.35rem;margin-top:.5rem}

.email-sent{background:rgba(42,122,75,.08);border:1px solid rgba(42,122,75,.25);padding:.75rem 1rem;font-size:.68rem;color:var(--green);margin-top:.75rem;display:flex;align-items:center;gap:.5rem}

/* MANAGE PAGE */
.mgmt-wrap{max-width:680px;margin:0 auto;padding:3rem 2rem 5rem}
.mgmt-header{margin-bottom:2.5rem}
.mgmt-title{font-family:'Playfair Display',serif;font-size:2rem;font-weight:900;font-style:italic;margin-bottom:.4rem}
.mgmt-sub{font-size:.7rem;color:var(--gray);line-height:1.6}
.mgmt-regret{background:var(--paper);border-left:4px solid var(--red);padding:1.2rem 1.5rem;margin-bottom:2rem}
.mgmt-regret-cat{font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--red);margin-bottom:.5rem}
.mgmt-regret-text{font-family:'Instrument Serif',serif;font-size:1rem;font-style:italic;line-height:1.5}
.mgmt-regret-name{font-size:.62rem;color:var(--gray);margin-top:.5rem}
.mgmt-status-row{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:2rem}
.status-badge{font-size:.58rem;letter-spacing:.1em;text-transform:uppercase;padding:.25rem .7rem;border:1px solid}
.status-badge.live{border-color:var(--green);color:var(--green)}
.status-badge.pinned{border-color:var(--gold);color:var(--gold)}
.status-badge.locked{border-color:var(--ink);color:var(--ink)}

.upsell-action-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border);margin-bottom:2rem}
.upsell-action{background:var(--cream);padding:1.3rem;display:flex;flex-direction:column;gap:.4rem}
.upsell-action:hover{background:white}
.ua-top{display:flex;justify-content:space-between;align-items:flex-start}
.ua-name{font-size:.78rem;font-weight:500}
.ua-price{font-family:'Playfair Display',serif;font-size:1rem;font-weight:900;color:var(--red)}
.ua-sub{font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:var(--red);margin-bottom:.3rem}
.ua-desc{font-size:.62rem;color:var(--gray);line-height:1.6}
.ua-btn{margin-top:.8rem;padding:.5rem .9rem;font-family:'DM Mono',monospace;font-size:.6rem;letter-spacing:.08em;text-transform:uppercase;border:1px solid var(--ink);background:transparent;color:var(--ink);cursor:pointer;transition:all .15s;align-self:flex-start}
.ua-btn:hover{background:var(--ink);color:var(--cream)}
.ua-btn.done{border-color:var(--green);color:var(--green);cursor:default}
.ua-btn.done:hover{background:transparent;color:var(--green)}

/* LEADERBOARD */
.lb-head{background:var(--ink);padding:3.5rem 2rem;text-align:center}
.lb-title{font-family:'Playfair Display',serif;font-size:2.8rem;font-weight:900;font-style:italic;color:var(--cream);margin-bottom:.5rem}
.lb-sub{font-size:.7rem;color:var(--gray)}
.lb-content{max-width:900px;margin:0 auto;padding:3rem 2rem 5rem}
.lb-sec{margin-bottom:4rem}
.lb-sec-title{font-family:'Playfair Display',serif;font-size:1.75rem;font-weight:900;font-style:italic;margin-bottom:.4rem;display:flex;align-items:center;gap:.7rem}
.lb-sec-desc{font-size:.67rem;color:var(--gray);margin-bottom:1.3rem}
.lb-entries{border:1px solid var(--border)}
.lb-entry{display:grid;grid-template-columns:3rem 1fr auto;gap:1.2rem;align-items:center;padding:1.4rem;border-bottom:1px solid var(--border);transition:background .2s}
.lb-entry:last-child{border-bottom:none}
.lb-entry:hover{background:var(--paper)}
.lb-rank{font-family:'Playfair Display',serif;font-size:2rem;font-weight:900;color:var(--red);text-align:center;line-height:1}
.lb-etext{font-family:'Instrument Serif',serif;font-size:.93rem;font-style:italic;line-height:1.5}
.lb-ename{font-size:.62rem;color:var(--gray);margin-top:.3rem}
.lb-score{font-size:.62rem;color:var(--gray);white-space:nowrap;text-align:right}
.lb-cta{background:var(--paper);border:1px solid var(--border);padding:2rem;text-align:center;margin-bottom:3rem}
.lb-cta-txt{font-size:.78rem;color:var(--gray);margin-bottom:1rem;font-style:italic}

/* ADMIN */
.adm-wrap{max-width:1000px;margin:0 auto;padding:2rem}
.adm-title{font-family:'Playfair Display',serif;font-size:2rem;font-weight:900;margin-bottom:2rem}
.adm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:1rem}
.adm-card{border:1px solid var(--border);padding:1.2rem;background:var(--paper)}
.adm-cat{font-size:.58rem;color:var(--red);margin-bottom:.5rem;letter-spacing:.1em;text-transform:uppercase}
.adm-text{font-family:'Instrument Serif',serif;font-style:italic;font-size:.88rem;margin-bottom:1rem;line-height:1.5}
.adm-acts{display:flex;gap:.5rem;flex-wrap:wrap}
.abtn{padding:.28rem .75rem;font-family:'DM Mono',monospace;font-size:.58rem;letter-spacing:.08em;text-transform:uppercase;border:1px solid;cursor:pointer;transition:all .15s;background:transparent}
.abtn.del{color:var(--red);border-color:var(--red)}
.abtn.del:hover{background:var(--red);color:white}
.abtn.feat{color:var(--gold);border-color:var(--gold)}
.abtn.feat:hover{background:var(--gold);color:white}
.abtn.lb{color:var(--gray);border-color:var(--gray)}
.abtn.lb:hover{background:var(--gray);color:white}
.login-box{max-width:380px;margin:5rem auto;padding:2.5rem;border:2px solid var(--ink)}
.login-title{font-family:'Playfair Display',serif;font-size:1.7rem;font-weight:900;font-style:italic;margin-bottom:1.5rem;text-align:center}

/* LEGAL */
.legal-wrap{max-width:700px;margin:0 auto;padding:4rem 2rem 6rem}
.legal-title{font-family:'Playfair Display',serif;font-size:2.4rem;font-weight:900;font-style:italic;margin-bottom:.4rem}
.legal-date{font-size:.62rem;color:var(--gray);margin-bottom:3rem}
.leg-sec{margin-bottom:1.8rem}
.leg-h{font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;margin-bottom:.55rem}
.leg-b{font-size:.78rem;color:var(--gray);line-height:1.85;white-space:pre-line}

footer{background:var(--ink);padding:2.5rem 2rem;margin-top:auto}
.foot-in{max-width:1100px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem}
.foot-copy{font-size:.62rem;color:var(--gray);cursor:default;user-select:none}
.foot-links{display:flex;gap:1.5rem;flex-wrap:wrap}
.fl-link{font-size:.62rem;color:var(--gray);cursor:pointer;transition:color .15s;letter-spacing:.05em;background:none;border:none;font-family:'DM Mono',monospace}
.fl-link:hover{color:var(--cream)}

@media(max-width:640px){
  .nl{font-size:.55rem;padding:0 .6rem}
  .stats{gap:1.5rem}
  .arch-grid,.adm-grid,.upsell-action-grid{grid-template-columns:1fr}
  .pay-methods,.cat-grid{grid-template-columns:1fr}
  .copt{border-right:none!important}
  .lb-entry{grid-template-columns:2.5rem 1fr}
  .lb-score{display:none}
  .foot-in{flex-direction:column;text-align:center}
}
`;

// Utility: generate a fake management token

function Nav({ page, setPage }) {
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => setPage("home")}>Regret Registry™</div>
      <div className="nav-links">
        <div className={`nl ${page==="home"?"active":""}`} onClick={() => setPage("home")}>Home</div>
        <div className={`nl ${page==="archive"?"active":""}`} onClick={() => setPage("archive")}>Archive</div>
        <div className={`nl ${page==="leaderboard"?"active":""}`} onClick={() => setPage("leaderboard")}>Leaderboard</div>
        <div className="nl cta" onClick={() => setPage("submit")}>Submit Your Regret</div>
      </div>
    </nav>
  );
}

// Payment banner shown on homepage only, below nav
function PaymentBanner() {
  return (
    <div className="pay-banner">
      <span className="pay-banner-text">
        Accepting <strong>PayPal</strong> globally &amp; <strong>Razorpay</strong> for India — UPI, cards, netbanking, all of it.
        Your regret transcends borders. So should your payment options.
      </span>
      <span className="pay-pill">🌏 Global</span>
      <span className="pay-pill">🇮🇳 India</span>
    </div>
  );
}

function Footer({ setPage }) {
  const [clicks, setClicks] = useState(0);
  const handleClick = () => { const n = clicks + 1; setClicks(n); if (n >= 3) { setPage("admin"); setClicks(0); } };
  return (
    <footer>
      <div className="foot-in">
        <div className="foot-copy" onClick={handleClick}>© 2025 Regret Registry™ — The Official Museum of Questionable Decisions</div>
        <div className="foot-links">
          {[["Terms & Conditions","terms"],["Privacy Policy","privacy"],["Refund Policy","refund"],["Contact","contact"]].map(([l,p]) => (
            <button key={p} className="fl-link" onClick={() => setPage(p)}>{l}</button>
          ))}
        </div>
      </div>
    </footer>
  );
}

function LandingPage({ setPage }) {

  return (
    <div className="page">
      <h1 style={{position:"absolute", left:"-9999px"}}>
       Anonymous regret confessions archive
    </h1>

      <PaymentBanner />
      <div className="hero">
        <div className="stamp">Est. Today · Regretting Since Always</div>
        <h1 className="hero-title">The <em>Regret</em><br />Registry</h1>
        <p className="hero-sub">The Official Museum of Questionable Decisions™</p>
        <p className="hero-desc">
          Some people journal. Some people heal. You archive your mistakes on the internet.<br />
          Bold. Welcome to the permanent record of human "what was I thinking?"
        </p>
        <div className="hero-ctas">
          <button className="btn btn-p" onClick={() => setPage("archive")}>View Regret Archive</button>
          <button className="btn btn-s" onClick={() => setPage("submit")}>Submit Your Regret — $1</button>
        </div>
      </div>

      <hr className="divider" />

      <div className="stats">
        {[["22","Documented Disasters"],["$22","Paid to Confess"],["0","Lessons Learned"]].map(([n,l]) => (
          <div className="stat" key={l}><div className="n">{n}</div><div className="l">{l}</div></div>
        ))}
      </div>

      <div className="dark-section">
        <div className="dark-inner">
          <div className="section-label">// Hall of Recent Shame</div>
          <div className="feat-grid">
            {MOCK_REGRETS.slice(0,3).map(r => (
              <div className="feat-card" key={r.id}>
                <div className="feat-cat">{r.category}</div>
                <div className="feat-text">"{r.text}"</div>
                <div className="feat-meta"><span>— {r.name}</span><span>▲ {r.votes.toLocaleString()}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>


      <div className="cta-section">
        <div className="cta-title">Ready to contribute to<br />humanity's permanent record?</div>
        <p className="cta-sub">One dollar. One confession. Your therapist charges more and listens less.</p>
        <button className="btn btn-p" onClick={() => setPage("submit")}>Archive My Poor Decision — $1</button>
      </div>
    </div>
  );
}

function ShareRegret({ text }) {

  const url = "https://regretregistry.in";

  const message = `I found this regret on the Regret Registry 💀

"${text}"

Archive yours → ${url}`;

  const open = (link) => window.open(link, "_blank");

  return (
    <div style={{
      marginTop: "6px",
      display: "flex",
      gap: "4px",
      flexWrap: "wrap"
    }}>

      <button className="share-btn" onClick={() =>
        open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`)
      }>X</button>

      <button className="share-btn" onClick={() =>
        open(`https://www.reddit.com/submit?title=${encodeURIComponent(message)}`)
      }>Reddit</button>

      <button className="share-btn" onClick={() =>
        open(`https://wa.me/?text=${encodeURIComponent(message)}`)
      }>WhatsApp</button>

      <button className="share-btn" onClick={() => {
        navigator.clipboard.writeText(message);
        alert("Copied!");
      }}>Copy</button>

    </div>
  );
}

function ArchivePage({ setPage }) {
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("popular");
  const [dbRegrets, setDbRegrets] = useState([]);
  useEffect(() => {
  fetchRegrets()
}, [])

async function fetchRegrets() {
  const { data, error } = await supabase
    .from("regrets")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error(error)
  } else {
    setDbRegrets(data)
  }
}
  const filtered = dbRegrets
    .filter(r => filter==="All" || r.category===filter)
    .sort((a,b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return sort==="popular" ? b.votes-a.votes : b.id-a.id;
    });
  return (
    <div className="page">
      <h1 style={{position:"absolute", left:"-9999px"}}>
       Real anonymous regret stories archive
     </h1>
      <div className="arch-head">
        <div className="arch-title">The Regret Archive</div>
        <div className="arch-sub">Permanent documentation of temporary bad judgment</div>
        <button className="btn btn-ghost" onClick={() => setPage("submit")}>+ Contribute Your Own Disaster</button>
      </div>
      <div className="arch-controls">
        {["All",...CATEGORIES.slice(0,5)].map(f => (
          <button key={f} className={`fbtn ${filter===f?"act":""}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
        <select className="sort-sel" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="popular">Most Voted</option>
          <option value="newest">Newest</option>
        </select>
      </div>
      <div className="arch-grid">
  {filtered.map(r => (
    <div className="rcard" key={r.id}>

      <div className="rcard-top">
        <div className="rcat">{r.category || "General"}</div>
        <div className="rvotes">▲ 0</div>
      </div>

      <div className="rtext">"{r.text}"</div>

      <div className="rfoot">
        <div className="rname">
          — {r.display_name || "Anonymous"} · {new Date(r.created_at).toLocaleDateString()}
        </div>
      </div>

      {/* 🔥 SHARE BUTTONS */}
      <ShareRegret text={r.text} />

    </div>
  ))}
</div>
    </div>
  );
}

function PaypalSuccess({ setPage }) {

  useEffect(() => {

    const capture = async () => {

      const params = new URLSearchParams(window.location.search);
      const orderID = params.get("token");

      const res = await fetch("/api/paypal-capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID })
      });

      const data = await res.json();

      if (data.status === "COMPLETED") {
        alert("Payment successful!");
        setPage("archive");
      } else {
        alert("Payment capture failed");
      }
    };

    capture();

  }, []);

  return (
    <div className="page">
      <div className="success-pg">
        Processing PayPal payment...
      </div>
    </div>
  );
}

function SubmitPage({ setPage }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ text:"", category:"", name:"", email:"", confirmed:false });
  const [payment, setPayment] = useState("paypal");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const max = 300;
  const ok1 = form.text.trim().length > 0 && form.category && form.confirmed;

  

       const pay = async () => {
  try {
    setLoading(true);

    // =============================
    // PAYPAL
    // =============================
    if (payment === "paypal") {

      const res = await fetch("/api/paypal-create-order", {
        method: "POST"
      });

      const data = await res.json();

      if (!data.id) {
        alert("PayPal order failed");
        setLoading(false);
        return;
      }

      window.location.href =
        `https://www.paypal.com/checkoutnow?token=${data.id}`;

      return;
    }

    // =============================
    // RAZORPAY
    // =============================
    if (payment === "razorpay") {

      const res = await fetch("/api/create-order", {
        method: "POST"
      });

      const order = await res.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        currency: order.currency,
        name: "Regret Registry",
        description: "Archive your regret",
        order_id: order.id,

        prefill: {
          email: form.email || ""
        },

        handler: async function (response) {

          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              regretData: {
                text: form.text,
                display_name: form.name,
                category: form.category
              }
            })
          });

          const verifyData = await verifyRes.json();

          if (!verifyData.success) {
            alert("Payment verification failed");
            return;
          }

          setDone(true);
        },

        theme: {
          color: "#c8392b"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    }

  } catch (err) {
    console.error(err);
    alert("Payment failed");
  }

  setLoading(false);
};


  const reset = () => {
    setDone(false); setStep(1);
    setForm({text:"",category:"",name:"",email:"",confirmed:false});
  };

  if (done) return (
  <div className="page">
    <h1 style={{position:"absolute", left:"-9999px"}}>
     Submit your anonymous regret confession
   </h1>
    <div className="success-pg">

      <div style={{textAlign:"center",marginBottom:"2.5rem"}}>
        <div className="suc-stamp">OFFICIALLY ARCHIVED</div>

        <h1 className="suc-title">
          Congratulations.<br />It's permanent now.
        </h1>

        <p className="suc-sub">
          Your regret is now part of documented human history.
          Future generations won't learn from it… but at least they'll read it.
          <br /><br />
          Thank you for your contribution to collective poor judgment.
        </p>
      </div>

    {/* SHARE BUTTONS */}
    <div style={{
      marginBottom: "2rem",
      textAlign: "center"
    }}>

     <p style={{
       fontSize: ".8rem",
       color: "var(--gray)",
       marginBottom: ".8rem"
     }}>
       Share your regret with the world ↓
     </p>

      <ShareButtons regretText={form.text} />

    </div>

      <div style={{display:"flex",gap:"1rem",flexWrap:"wrap"}}>
        <button
          className="btn btn-s"
          onClick={() => setPage("archive")}
        >
          View the Archive
        </button>

        <button
          className="btn btn-p"
          onClick={reset}
        >
          Confess Another
        </button>
      </div>

    </div>
  </div>
);

  return (
    <div className="page">
      <div className="sub-wrap">
        <div className="sub-head">
          <div className="stamp" style={{marginBottom:"1.5rem"}}>One Dollar. One Confession. No Refunds on the Regret.</div>
          <h1 className="sub-title">Archive Your<br /><em style={{color:"var(--red)"}}>Poor Decision</em></h1>
          <p className="sub-desc">Tell us the decision that keeps you staring at the ceiling at 2am.<br />Be honest. We already know it was probably avoidable.</p>
        </div>

        <div className="steps">
          {["Write","Review","Pay"].map((s,i) => (
            <div key={s} className={`step ${step===i+1?"active":step>i+1?"done":""}`}>
              {step>i+1?"✓ ":""}{s}
            </div>
          ))}
        </div>

        {/* STEP 1: WRITE */}
        {step === 1 && <>
          <div className="fg">
            <label className="fl">The Regret</label>
            <span className="fsl">What decision haunts you? Be specific. Vague regrets are unimpressive.</span>
            <textarea className="fta" placeholder="I told my entire department I was 'emotionally unavailable for spreadsheets' in a quarterly review…" value={form.text} maxLength={max} onChange={e => setForm({...form,text:e.target.value})} />
            <div className={`cc ${form.text.length > max*.85?"warn":""}`}>{form.text.length}/{max} — {max-form.text.length} characters remaining to document your downfall</div>
          </div>

          <div className="fg">
            <label className="fl">Category</label>
            <span className="fsl">Where did things go… wrong?</span>
            <div className="cat-grid">
              {CATEGORIES.map(c => (
                <button key={c} className={`copt ${form.category===c?"sel":""}`} onClick={() => setForm({...form,category:c})}>
                  {CAT_ICONS[c]} {c}
                </button>
              ))}
            </div>
          </div>

          <div className="fg">
            <label className="fl">Archive Name <span style={{color:"var(--gray)",fontWeight:400}}>(optional)</span></label>
            <span className="fsl">Your name will be forever associated with this decision. No pressure.</span>
            <input className="fi" placeholder="Regretful Legend" value={form.name} onChange={e => setForm({...form,name:e.target.value})} />
          </div>

          <div className="fg">
            <label className="fl">Email <span style={{color:"var(--gray)",fontWeight:400}}>(optional, but recommended)</span></label>
            <span className="fsl">Optional. For payment receipts and the rare event your poor decision goes viral.</span>
            <input className="fi" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({...form,email:e.target.value})} />
          </div>

          <div className="fg">
            <label className="cbwrap">
              <input type="checkbox" checked={form.confirmed} onChange={e => setForm({...form,confirmed:e.target.checked})} />
              <span className="cblabel">I understand this will be <strong>permanently published</strong> (no regrets… allegedly). I confirm this is my own regret and not someone else's personal information.</span>
            </label>
          </div>

          <div className="fnav">
            <div />
            <button className="btn btn-p" onClick={() => ok1 && setStep(2)} style={{opacity:ok1?1:.38,cursor:ok1?"pointer":"not-allowed"}}>
              Review My Confession →
            </button>
          </div>
        </>}

        {/* STEP 2: REVIEW */}
        {step === 2 && <>
          <div className="rv-box">
            <div className="section-label" style={{marginBottom:".5rem"}}>// Confirm before we immortalize this</div>
            <div className="rv-row"><div className="rv-lbl">The Regret</div><div className="rv-val">"{form.text}"</div></div>
            <div className="rv-row"><div className="rv-lbl">Category</div><div className="rv-val sm">{form.category}</div></div>
            <div className="rv-row"><div className="rv-lbl">Archive Name</div><div className="rv-val sm">{form.name||"Anonymous Coward"}</div></div>
          </div>
          <div className="price-box">
            <div style={{fontSize:".6rem",letterSpacing:".15em",textTransform:"uppercase",color:"var(--gray)",marginBottom:".5rem"}}>Cost of documenting your failure</div>
            <div className="price-big">$1.00</div>
            <div className="price-note">Cheaper than therapy. More permanent than a tattoo.</div>
          </div>
          <div className="fnav">
            <button className="btn btn-s" onClick={() => setStep(1)}>← Edit</button>
            <button className="btn btn-p" onClick={() => setStep(3)}>Proceed to Payment →</button>
          </div>
        </>}

        {/* STEP 3: PAYMENT */}
{step === 3 && <>
  <div className="fg">
    <label className="fl" style={{marginBottom:"1rem"}}>
      Select Payment Method
    </label>

    <div className="pay-methods">

      {[
        ["paypal","🅿️","PayPal","Global · Cards, PayPal balance"],
        ["razorpay","₹","Razorpay","India · UPI, Cards, Netbanking"]
      ].map(([id,logo,name,region]) => {

        return (
          <div
            key={id}
            className={`popt ${payment===id?"sel":""}`}
            onClick={() => setPayment(id)}
            style={{
              opacity: 1,
              cursor: "pointer"
            }}
          >
            <div className="plogo">{logo}</div>
            <div className="pname">{name}</div>
            <div className="pregion">{region}</div>
          </div>
        );
      })}

    </div>
  </div>

  <div className="price-box">
    <div className="price-big">$1.00</div>
    <div className="price-note">
      via {payment==="paypal" ? "PayPal (coming soon)" : "Razorpay"}
    </div>
  </div>

  <div className="secure">
    🔒 Your regret only goes live after payment clears. Failed payments save nothing.
  </div>

  <div className="fnav">
    <button className="btn btn-s" onClick={() => setStep(2)}>
      ← Back
    </button>

    <button
      className="btn btn-p"
      onClick={() => {
        pay();
      }}
      style={{opacity: loading ? 0.6 : 1}}
    >
      {loading ? "Processing…" : "Pay $1 & Archive My Regret 🔒"}
    </button>

  </div>
</>}
      </div>
    </div>
  );
}

function ManagePage({ setPage }) {
  return (
    <div className="page">
      <div className="mgmt-wrap">

        <div className="mgmt-header">
          <div className="mgmt-title">Manage Your Regret</div>
          <div className="mgmt-sub">
            This is where you make additional questionable decisions about your existing questionable decision.
          </div>
        </div>

        <div className="mgmt-regret">
          <div className="mgmt-regret-cat">Your Published Regret</div>
          <div className="mgmt-regret-text">
            Your regret is live in the archive. It is now part of recorded human history.
          </div>
          <div className="mgmt-regret-name">— You</div>
        </div>

        <div className="mgmt-status-row">
          <div className="status-badge live">Live</div>
        </div>

        <div style={{marginTop:"1.5rem",display:"flex",gap:"1rem",flexWrap:"wrap"}}>
          <button className="btn btn-s" onClick={() => setPage("archive")}>
            View Archive
          </button>

          <button className="btn btn-s" onClick={() => setPage("submit")}>
            Submit Another Regret
          </button>
        </div>

      </div>
    </div>
  );
}

function LeaderboardPage({ setPage }) {
  const [dumbest, setDumbest] = useState([]);
  const [dramatic, setDramatic] = useState([]);
  const [funniest, setFunniest] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {

    setLoading(true);

    const { data, error } = await supabase
      .from("regrets")
      .select("*")
      .not("leaderboard_type", "is", null);

    if (error) {
      console.error(error);
      alert("Failed to load leaderboard");
      setLoading(false);
      return;
    }

    setDumbest(
  data
    .filter(r => r.leaderboard_type === "dumbest")
    .sort((a,b) => (a.leaderboard_rank ?? 999) - (b.leaderboard_rank ?? 999))
);

setDramatic(
  data
    .filter(r => r.leaderboard_type === "dramatic")
    .sort((a,b) => (a.leaderboard_rank ?? 999) - (b.leaderboard_rank ?? 999))
);

setFunniest(
  data
    .filter(r => r.leaderboard_type === "funniest")
    .sort((a,b) => (a.leaderboard_rank ?? 999) - (b.leaderboard_rank ?? 999))
);
    setLoading(false);
  }

  const sections = [
    ["🏆","Dumbest","// Peer-reviewed by people who've also made dumb decisions.", dumbest],
    ["🎭","Most Dramatic","// A standing ovation for the audacity.", dramatic],
    ["😂","Funniest","// It's only funny because it happened to someone else.", funniest],
  ];

  return (
    <div className="page">
     <h1 style={{position:"absolute", left:"-9999px"}}>
      Funniest and dumbest regret confessions leaderboard
    </h1>
      <div className="lb-head">
        <div className="lb-title">Hall of Shame</div>
        <div className="lb-sub">Manually curated. Admin approved.</div>
      </div>

      <div className="lb-content">

        <div className="lb-cta">
          <p className="lb-cta-txt">Want a shot at immortality in the wrong direction?</p>
          <button className="btn btn-p" onClick={() => setPage("submit")}>
            Submit Your Regret — $1
          </button>
        </div>

        {loading && (
          <p style={{ textAlign:"center", color:"var(--gray)" }}>
            Loading leaderboard...
          </p>
        )}

        {!loading && sections.map(([icon,title,desc,list]) => (

          <div className="lb-sec" key={title}>

            <div className="lb-sec-title">
              {icon} <em>{title}</em> Regrets
            </div>

            <div className="lb-sec-desc">{desc}</div>

            <div className="lb-entries">

              {list.length === 0 && (
                <div style={{padding:"1.5rem",color:"var(--gray)"}}>
                  No regrets assigned yet.
                </div>
              )}

              {list.map((r, i) => (

                <div className="lb-entry" key={r.id}>

                  <div className="lb-rank">#{i+1}</div>

                  <div>
                    <div className="lb-etext">"{r.text}"</div>
                    <div className="lb-ename">
                      — {r.display_name || "Anonymous"}
                    </div>
                  </div>

                </div>

              ))}

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [regrets, setRegrets] = useState([]);
  const [loading, setLoading] = useState(true);

  // load regrets from database
  useEffect(() => {
    if (authed) fetchRegrets();
  }, [authed]);

  async function fetchRegrets() {
    setLoading(true);

    const { data, error } = await supabase
      .from("regrets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("Failed to load regrets");
    } else {
      setRegrets(data);
    }

    setLoading(false);
  }

   async function updateRank(id, rank) {

  const { error } = await supabase
    .from("regrets")
    .update({ leaderboard_rank: rank })
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Rank update failed");
    return;
  }

  setRegrets(prev =>
    prev.map(r =>
      r.id === id ? { ...r, leaderboard_rank: rank } : r
    )
  );
}

  // delete regret from database
  async function deleteRegret(id) {

  const regret = regrets.find(r => r.id === id);

  if (regret?.is_locked) {
    alert("This regret is locked and cannot be deleted.");
    return;
  }

  const confirmDelete = window.confirm(
    "Delete this regret permanently?"
  );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("regrets")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Delete failed");
      return;
    }

    // remove from UI instantly
    setRegrets(prev => prev.filter(r => r.id !== id));
  }
// assign leaderboard category
async function setLeaderboard(id, type) {
  const { error } = await supabase
    .from("regrets")
    .update({ leaderboard_type: type })
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Failed to assign leaderboard");
    return;
  }

  setRegrets(prev =>
    prev.map(r =>
      r.id === id ? { ...r, leaderboard_type: type } : r
    )
  );
}

// remove from leaderboard
async function removeLeaderboard(id) {
  const { error } = await supabase
    .from("regrets")
    .update({ leaderboard_type: null })
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Failed to remove leaderboard");
    return;
  }

  setRegrets(prev =>
    prev.map(r =>
      r.id === id ? { ...r, leaderboard_type: null } : r
    )
  );
}

async function toggleLock(id, currentState) {

  const { error } = await supabase
    .from("regrets")
    .update({ is_locked: !currentState })
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Failed to update lock");
    return;
  }

  setRegrets(prev =>
    prev.map(r =>
      r.id === id ? { ...r, is_locked: !currentState } : r
    )
  );
}

async function login() {

  try {
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pass })
    });

    const data = await res.json();

    if (data.success) {
      setAuthed(true);
      localStorage.setItem("admin", "true");
    } else {
      alert("Wrong password");
    }

  } catch (err) {
    alert("Login failed");
  }
}

  // login screen
  if (!authed)
    return (
      <div className="page">
        <div className="login-box">
          <div className="login-title">Admin Access</div>

          <p style={{
            fontSize:".68rem",
            color:"var(--gray)",
            marginBottom:"1.5rem",
            textAlign:"center"
          }}>
            If you don't know the password, you're not admin.
          </p>

          <input
            className="fi"
            type="password"
            placeholder="Password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            style={{marginBottom:"1rem"}}
            onKeyDown={e => {
              if (e.key === "Enter") login();
             }}
           />

           <button
            className="btn btn-p"
            style={{width:"100%"}}
            onClick={login}
          >
            Enter
          </button>
        </div>
      </div>
    );

   // admin panel
  return (
    <div className="page">
      <div className="adm-wrap">

        <div className="adm-title">
          Admin Panel — Regret Manager
        </div>

        <p style={{
          fontSize:".73rem",
          color:"var(--gray)",
          marginBottom:"2rem"
        }}>
          {loading ? "Loading..." : `${regrets.length} regrets in database`}
        </p>

        <div className="adm-grid">

          {regrets.map(r => (
            <div className="adm-card" key={r.id}>

              <div className="adm-cat">
                {r.category} · {r.display_name || "Anonymous"}
              </div>

              <div className="adm-text">
                "{r.text}"
              </div>

              {r.is_locked && (
                <div style={{
                  fontSize: ".6rem",
                  color: "var(--gold)",
                  marginBottom: ".5rem"
                }}>
                  🔒 Locked from deletion
                </div>
              )}

              {r.leaderboard_type && (
                <div style={{
                  fontSize: ".6rem",
                  color: "var(--red)",
                  marginBottom: ".5rem"
                }}>
                  Leaderboard: {r.leaderboard_type}
                </div>
              )}

              {r.leaderboard_type && (
                <div style={{ marginBottom: ".6rem" }}>
                  <input
                    type="number"
                    placeholder="Rank"
                    value={r.leaderboard_rank || ""}
                    onChange={(e) => updateRank(r.id, Number(e.target.value))}
                    style={{
                      width: "70px",
                      padding: "4px",
                      fontSize: ".7rem"
                    }}
                  />
                </div>
              )}

              <div className="adm-acts">

                <button
                  className="abtn del"
                  onClick={() => deleteRegret(r.id)}
                >
                  Delete
                </button>

                <button
                  className="abtn feat"
                  onClick={() => setLeaderboard(r.id, "dumbest")}
                >
                  Dumbest
                </button>

                <button
                  className="abtn feat"
                  onClick={() => setLeaderboard(r.id, "dramatic")}
                >
                  Dramatic
                </button>

                <button
                  className="abtn feat"
                  onClick={() => setLeaderboard(r.id, "funniest")}
                >
                  Funniest
                </button>

                <button
                  className="abtn lb"
                  onClick={() => removeLeaderboard(r.id)}
                >
                  Remove LB
                </button>

                <button
                  className="abtn feat"
                  onClick={() => toggleLock(r.id, r.is_locked)}
                >
                  {r.is_locked ? "Unlock" : "Lock"}
                </button>

              </div>

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}

function ShareButtons({ regretText }) {

  const url = "https://regretregistry.in";

  const text = `I paid ₹87 to permanently archive this regret 💀

"${regretText}"

Archive yours → ${url}`;

  const open = (link) => window.open(link, "_blank");

  return (
    <div style={{
      display: "flex",
      gap: "10px",
      justifyContent: "center",
      flexWrap: "wrap"
    }}>

      <button onClick={() =>
        open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`)
      }>
        X
      </button>

      <button onClick={() =>
        open(`https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`)
      }>
        Threads
      </button>

      <button onClick={() =>
        open(`https://www.reddit.com/submit?title=${encodeURIComponent(text)}`)
      }>
        Reddit
      </button>

      <button onClick={() =>
        open(`https://wa.me/?text=${encodeURIComponent(text)}`)
      }>
        WhatsApp
      </button>

      <button onClick={() => {
        navigator.clipboard.writeText(text);
        alert("Copied! Paste on Instagram");
      }}>
        Instagram
      </button>

    </div>
  );
}

const LEGAL = {
  terms:{title:"Terms & Conditions",sub:"The legal bit. We know you won't read it. That's kind of on brand.",sections:[{h:"1. The Service",b:"Regret Registry is a platform for anonymous public confession of personal regrets. By submitting, you confirm the regret is yours, not fabricated, and not containing personal information about others."},{h:"2. Payment",b:"All submissions require a $1 payment via PayPal or Razorpay. Additional features (edits, deletions, pins, badges, locks, bumps) are priced separately. All fees are non-refundable once applied."},{h:"3. Content",b:"Submissions must not include real names of others, personal contact information, defamatory statements, or illegal content. We reserve the right to remove submissions at any time."},{h:"4. Anonymity",b:"We do not publish your real name. The archive name is chosen by you. Your payment processor handles billing per their own terms."},{h:"5. Management Links",b:"Private management links are generated per submission. We do not store accounts. Losing your link means losing management access. We cannot recover lost links."},{h:"6. Liability",b:"We are a museum of poor decisions, not a therapist or legal advisor. Nothing on this platform constitutes advice of any kind."}]},
  privacy:{title:"Privacy Policy",sub:"We collect the minimum. We regret nothing.",sections:[{h:"What We Collect",b:"Submission text, category, archive name (optional), email (optional, for management link delivery), and payment confirmation. Full payment card details are not stored by us."},{h:"What We Don't Collect",b:"Your real name (unless you use it as your archive name). We do not track you across the internet."},{h:"Email Use",b:"If provided, your email is used exclusively to send your management link. We do not send marketing emails. Ever."},{h:"Third Parties",b:"PayPal and Razorpay process payments per their own privacy policies. Supabase stores submission data. Vercel/Netlify handles infrastructure."},{h:"Data Retention",b:"Published regrets are retained indefinitely. Deleted regrets (via Escape Fee) are removed from public view within 24 hours."}]},
  refund:{title:"Refund Policy",sub:"Short version: no. Long version: still no.",sections:[{h:"Submission Fee",b:"The $1 submission fee is non-refundable once your regret is published. This mirrors the permanence of regret itself."},{h:"Feature Purchases",b:"All feature fees (edit, delete, pin, badge, lock, bump) are non-refundable once applied. If a feature was purchased but not applied due to a technical error on our end, contact us."},{h:"The Escape Fee",b:"Paying $5 to delete your regret removes it from public view. The $5 fee is non-refundable. This is your closure."},{h:"Contact",b:"regretregistry@yahoo.com with your transaction ID for any billing queries."}]},
  contact:{title:"Contact",sub:"We're here. Reluctantly.",sections:[{h:"General",b:"regretregistry@yahoo.com"},{h:"Billing",b:"Include your PayPal Transaction ID or Razorpay Order ID."},{h:"Content Removal",b:"include your archive name and approximate submission date."},{h:"Press",b:"Open to coverage. Closed to anything that compromises submitter anonymity."}]},
};

function LegalPage({ type }) {
  const c = LEGAL[type];
  return (
    <div className="page">
      <div className="legal-wrap">
        <div className="legal-title">{c.title}</div>
        <div className="legal-date">Last updated: January 2025 · Like our regrets, subject to change.</div>
        <p style={{fontSize:".78rem",color:"var(--gray)",fontStyle:"italic",marginBottom:"2.5rem"}}>{c.sub}</p>
        {c.sections.map((s,i) => (
          <div className="leg-sec" key={i}>
            <div className="leg-h">{s.h}</div>
            <div className="leg-b">{s.b}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");

  useEffect(() => {

  const seo = {
    home: {
      title: "Regret Registry — Archive Your Regret Permanently",
      desc: "Archive your regrets permanently. One dollar. One confession."
    },
    archive: {
      title: "Regret Archive — Real Human Mistakes",
      desc: "Browse real regrets submitted by people around the world."
    },
    leaderboard: {
      title: "Regret Leaderboard — Most Legendary Mistakes",
      desc: "The most unforgettable regrets ever archived."
    },
    submit: {
      title: "Submit Your Regret | Regret Registry",
      desc: "Confess your biggest mistake and archive it forever."
    }
  };

  const current = seo[page] || seo.home;

  // title
  document.title = current.title;

  // description
  let meta = document.querySelector("meta[name='description']");
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "description";
    document.head.appendChild(meta);
  }
  meta.content = current.desc;

}, [page]);

useEffect(() => {

  console.log("PAGE CHANGED:", page);   // 👈 debug line

  if (page === "home")
    document.title = "Regret Registry — Archive Your Poor Decisions";

  else if (page === "archive")
    document.title = "Regret Archive | Regret Registry";

  else if (page === "submit")
    document.title = "Submit Your Regret | Regret Registry";

  else if (page === "leaderboard")
    document.title = "Hall of Shame | Regret Registry";

  else
    document.title = "Regret Registry";

}, [page]);
   useEffect(() => {

    const titles = {
      home: "Regret Registry — Archive Your Poor Decisions",
      archive: "Regret Archive | Regret Registry",
      leaderboard: "Hall of Shame | Regret Registry",
      submit: "Submit Your Regret | Regret Registry"
    };

    document.title = titles[page] || "Regret Registry";

  }, [page]);
  const [draftRegret, setDraftRegret] = useState(null);
  const render = () => {
    switch(page) {
        case "paypal-success":
    return <PaypalSuccess setPage={setPage} />;
      case "home": return <LandingPage setPage={setPage} />;
      case "manage":
  return <ManagePage setPage={setPage} />;
      case "archive": return <ArchivePage setPage={setPage} />;
      case "submit":
  return (
    <SubmitPage
      setPage={setPage}
      setDraftRegret={setDraftRegret}
    />
  );
  
      case "leaderboard": return <LeaderboardPage setPage={setPage} />;
      case "admin": return <AdminPage />;
      case "terms": case "privacy": case "refund": case "contact": return <LegalPage type={page} />;
      default: return <LandingPage setPage={setPage} />;
    }
  };
  return (
    <>
      <style>{css}</style>
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
        <Nav page={page} setPage={setPage} />
        <div style={{flex:1}}>{render()}</div>
        <Footer setPage={setPage} />
      </div>
    </>
  );
}