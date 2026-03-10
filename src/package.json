import { useState, useRef, useEffect } from "react";

const STYLE_OPTIONS = ["Minimalist","Streetwear","Classic","Bohemian","Sporty","Romantic","Edgy","Business"];
const COLOR_OPTIONS = ["Neutrals","Earth Tones","Bold Colors","Pastels","Monochrome","Black & White","Warm Tones","Cool Tones"];
const WEATHER_OPTIONS = ["Sunny & Hot","Warm & Breezy","Mild & Cloudy","Cold & Dry","Rainy","Snowy"];
const OCCASION_OPTIONS = ["Casual Day","Work / Office","Date Night","Party","Outdoor / Sport","Formal Event","Weekend Errands","Travel"];
const CATEGORIES = ["Tops","Bottoms","Dresses","Outerwear","Shoes","Accessories"];
const G = "#C9A96E", BG = "#0D0C0A", CARD = "#161512", BORDER = "#252320";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  .tag{cursor:pointer;padding:7px 16px;border-radius:100px;font-size:12px;font-family:'DM Mono',monospace;border:1px solid #383430;transition:all 0.18s;color:#888;background:transparent;}
  .tag:hover{border-color:#C9A96E;color:#C9A96E;}
  .tag.on{background:#C9A96E;color:#0D0C0A;border-color:#C9A96E;}
  .inp{background:#0F0E0B;border:1px solid #252320;color:#DDD5C5;border-radius:8px;padding:11px 14px;font-family:'DM Mono',monospace;font-size:13px;outline:none;transition:border-color 0.2s;width:100%;}
  .inp:focus{border-color:#C9A96E50;}
  .inp::placeholder{color:#2A2820;}
  select.inp option{background:#161512;}
  .card{background:#161512;border:1px solid #252320;border-radius:14px;}
  .gbtn{cursor:pointer;border:none;font-family:'Playfair Display',serif;transition:all 0.2s;width:100%;padding:16px;border-radius:12px;font-size:16px;}
  .gbtn:hover:not(:disabled){opacity:0.85;transform:translateY(-1px);}
  .gbtn:disabled{opacity:0.35;cursor:default;}
  .social{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:13px;border-radius:10px;font-family:'DM Mono';font-size:13px;cursor:pointer;border:1px solid #252320;background:#111009;color:#777;transition:all 0.18s;}
  .social:hover{border-color:#C9A96E50;color:#DDD5C5;}
  .ntab{cursor:pointer;padding:10px 0 12px;font-size:10px;font-family:'DM Mono';letter-spacing:0.04em;border:none;background:transparent;display:flex;flex-direction:column;align-items:center;gap:5px;transition:color 0.18s;border-bottom:2px solid transparent;margin-bottom:-1px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  .fade{animation:fadeUp 0.3s ease forwards;}
  @keyframes spin{to{transform:rotate(360deg)}}
  .spin{animation:spin 1.2s linear infinite;display:inline-block;}
  @keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
  .pulse{animation:pulse 1.4s infinite;}
`;

const Logo = () => (
  <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,letterSpacing:"-0.02em"}}>
    <span style={{fontWeight:300,color:"#EDE5D8"}}>Clo</span><span style={{fontStyle:"italic",color:G}}>zie</span>
  </div>
);

const GBtn = ({onClick,disabled,children,style={}}) => (
  <button className="gbtn" onClick={onClick} disabled={disabled}
    style={{background:disabled?"#111009":G,color:disabled?"#2A2820":BG,...style}}>
    {children}
  </button>
);

const Label = ({text}) => (
  <div style={{fontFamily:"'DM Mono'",fontSize:10,color:G,letterSpacing:"0.12em",marginBottom:14}}>{text}</div>
);

async function storageGet(key) {
  // Try artifact storage first, fall back to sessionStorage
  try {
    if (window.storage) {
      const r = await window.storage.get(key);
      if (r && r.value !== undefined && r.value !== null) return JSON.parse(r.value);
    }
  } catch(e) {}
  // Fallback: sessionStorage (persists within tab session)
  try {
    const v = sessionStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch(e) { return null; }
}
async function storageSet(key, val) {
  const str = JSON.stringify(val);
  // Try artifact storage
  try {
    if (window.storage) await window.storage.set(key, str);
  } catch(e) {}
  // Always also save to sessionStorage as backup
  try {
    sessionStorage.setItem(key, str);
    return true;
  } catch(e) { return false; }
}

// Save closet items one by one so large images don't bust the 5MB limit
async function saveCloset(closet) {
  // Save entire closet as one JSON blob (sessionStorage handles large data fine)
  try { sessionStorage.setItem("clozie-closet", JSON.stringify(closet)); } catch(e) {}
  // Also try artifact storage per-item
  try {
    if (window.storage) {
      const ids = closet.map(i => i.id);
      await window.storage.set("clozie-closet-index", JSON.stringify(ids));
      for (const item of closet) {
        // Strip image for artifact storage (too large), keep in sessionStorage
        const {image, ...rest} = item;
        await window.storage.set("clozie-item-"+item.id, JSON.stringify(rest));
      }
    }
  } catch(e) {}
  return true;
}

async function loadCloset() {
  // Try sessionStorage first (has images, full data)
  try {
    const v = sessionStorage.getItem("clozie-closet");
    if (v) { const parsed = JSON.parse(v); if (Array.isArray(parsed) && parsed.length>0) return parsed; }
  } catch(e) {}
  // Fall back to artifact storage (no images but persists longer)
  try {
    if (!window.storage) return null;
    const idxRaw = await window.storage.get("clozie-closet-index");
    if (!idxRaw || !idxRaw.value) return null;
    const ids = JSON.parse(idxRaw.value);
    const items = [];
    for (const id of ids) {
      try {
        const r = await window.storage.get("clozie-item-"+id);
        if (r && r.value) items.push(JSON.parse(r.value));
      } catch(e) {}
    }
    return items.length > 0 ? items : null;
  } catch(e) { return null; }
}

function makeOutfits(closet, context) {
  const by = cat => closet.filter(c => c.category === cat);
  const tops=by("Tops"), bottoms=by("Bottoms"), dresses=by("Dresses");
  const outer=by("Outerwear"), shoes=by("Shoes"), acc=by("Accessories");
  const cold = ["Cold & Dry","Rainy","Snowy"].includes(context.weather);
  const sh = a => [...a].sort(() => Math.random()-0.5);
  const NAMES = ["Everyday Edit","The Easy One","Weekend Mood","Classic Pick"];
  const VIBES = ["Relaxed","Chic","Bold","Easy"];
  const results = [];
  for (let i = 0; i < 4; i++) {
    const used = new Set(), items = [];
    const pick = arr => { const a = sh(arr).find(x=>!used.has(x.id)); if(a) used.add(a.id); return a; };
    if (i%2===1 && dresses.length && !cold) { const d=pick(dresses); if(d) items.push(d); }
    if (!items.length) { const t=pick(tops),b=pick(bottoms); if(t)items.push(t); if(b)items.push(b); }
    if (cold && outer.length) { const o=pick(outer); if(o) items.push(o); }
    if (shoes.length) { const s=pick(shoes); if(s) items.push(s); }
    if (i%2===0 && acc.length) { const a=pick(acc); if(a) items.push(a); }
    if (!items.length) continue;
    results.push({
      id: Date.now()+i,
      name: NAMES[i]||"Outfit "+(i+1),
      vibe: VIBES[i]||"Stylish",
      items: items.map(x=>x.name),
      itemObjects: items,
      description: "A great pick for "+context.occasion+" in "+context.weather+" weather."
    });
  }
  return results;
}

function Splash({onDone}) {
  useEffect(()=>{ setTimeout(onDone, 1800); },[]);
  return (
    <div style={{minHeight:"100vh",background:BG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <style>{css}</style>
      <div className="fade" style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:72,letterSpacing:"-0.03em",lineHeight:1}}>
          <span style={{fontWeight:300,color:"#EDE5D8"}}>Clo</span><span style={{fontStyle:"italic",color:G}}>zie</span>
        </div>
        <div style={{fontFamily:"'DM Mono'",fontSize:10,color:G,letterSpacing:"0.25em",marginTop:16}} className="pulse">✦ YOUR PERSONAL STYLIST ✦</div>
      </div>
    </div>
  );
}

function Onboarding({onDone}) {
  const [step, setStep] = useState(0);
  const steps = [
    { icon:"👗", title:"Welcome to Clozie", sub:"Your personal AI stylist", desc:"The more you use Clozie, the better she knows you — and the more perfectly she styles you." },
    { icon:"📸", title:"Build Your Closet", sub:"Add any clothes you love", desc:"Add clothes you own, or pieces you're dreaming of buying. Clozie works with any clothes you add." },
    { icon:"✨", title:"Get Styled Daily", sub:"Your stylist, every day", desc:null },
  ];
  const s = steps[step];
  return (
    <div style={{minHeight:"100vh",background:BG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px"}}>
      <style>{css}</style>
      <div style={{width:"100%",maxWidth:380,textAlign:"center"}} className="fade">
        <Logo/>
        <div style={{margin:"24px 0 20px"}}>
          <div style={{fontSize:88,marginBottom:16}}>{s.icon}</div>
          <div style={{fontFamily:"'DM Mono'",fontSize:10,color:G,letterSpacing:"0.2em",marginBottom:10}}>{s.sub.toUpperCase()}</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontWeight:300,fontSize:30,color:"#EDE5D8",marginBottom:16}}>{s.title}</div>
          {s.desc
            ? <div style={{fontFamily:"'DM Mono'",fontSize:12,color:"#666",lineHeight:1.9}}>{s.desc}</div>
            : <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:8}}>
                {[
                  ["✦","Your outfits, your clothes — nothing new to buy"],
                  ["🌤","Styled for today's weather and occasion"],
                  ["♡","Clozie learns your taste with every rating"],
                ].map(([icon,text],i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px",background:"#161512",borderRadius:14,border:"1px solid #2E2B27"}}>
                    <span style={{color:G,fontSize:18,flexShrink:0,width:24,textAlign:"center"}}>{icon}</span>
                    <span style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontWeight:300,fontSize:14,color:"#DDD5C5",lineHeight:1.6,textAlign:"left"}}>{text}</span>
                  </div>
                ))}
              </div>
          }
        </div>
        {/* Step dots */}
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:32}}>
          {steps.map((_,i)=>(
            <div key={i} style={{width:i===step?24:8,height:8,borderRadius:100,background:i===step?G:"#252320",transition:"all 0.3s"}}/>
          ))}
        </div>
        <GBtn onClick={()=>step<steps.length-1?setStep(step+1):onDone()} style={{marginBottom:14}}>
          {step<steps.length-1?"Next →":"Let's Start ✦"}
        </GBtn>
        {step===0&&(
          <button onClick={onDone} style={{background:"none",border:"none",color:"#444",fontFamily:"'DM Mono'",fontSize:12,cursor:"pointer"}}>
            Skip intro
          </button>
        )}
      </div>
    </div>
  );
}

function Welcome({onLogin, onSignup}) {
  return (
    <div style={{minHeight:"100vh",background:BG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",overflow:"hidden",position:"relative"}}>
      <style>{css}</style>
      <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,#C9A96E08 0%,transparent 65%)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none"}}/>
      <div style={{textAlign:"center",maxWidth:480,position:"relative",zIndex:1}} className="fade">
        <div style={{fontFamily:"'DM Mono'",fontSize:10,letterSpacing:"0.25em",color:G,marginBottom:32}}>✦ PERSONAL STYLIST ✦</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:80,letterSpacing:"-0.03em",lineHeight:1,marginBottom:48}}>
          <span style={{fontWeight:300,color:"#EDE5D8"}}>Clo</span><span style={{fontStyle:"italic",color:G}}>zie</span>
        </div>
        <p style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontWeight:300,fontSize:18,color:"#6A6058",lineHeight:1.8,marginBottom:52}}>
          Your stylist that knows your wardrobe,<br/>learns your taste, and dresses you perfectly.
        </p>
        <div style={{display:"flex",justifyContent:"center",marginBottom:52}}>
          {[["①","Build your closet"],["②","Set today's context"],["③","Get styled outfits"]].map(([num,label],i)=>(
            <div key={i} style={{flex:1,textAlign:"center",position:"relative"}}>
              {i>0&&<div style={{position:"absolute",left:0,top:13,width:"50%",height:1,background:"#C9A96E20"}}/>}
              {i<2&&<div style={{position:"absolute",right:0,top:13,width:"50%",height:1,background:"#C9A96E20"}}/>}
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:G,marginBottom:8,position:"relative",zIndex:1,background:BG,display:"inline-block",padding:"0 8px"}}>{num}</div>
              <div style={{fontFamily:"'DM Mono'",fontSize:10,color:"#666",lineHeight:1.7}}>{label}</div>
            </div>
          ))}
        </div>
        <button onClick={onSignup} style={{padding:"18px 64px",background:G,color:BG,borderRadius:100,fontSize:16,fontFamily:"'Playfair Display',serif",border:"none",cursor:"pointer",display:"block",margin:"0 auto 18px"}}>
          Get Started — It's Free
        </button>
        <div style={{fontFamily:"'DM Mono'",fontSize:12,color:"#666"}}>
          Already have an account?{" "}
          <span onClick={onLogin} style={{color:G,cursor:"pointer"}}>Sign in</span>
        </div>
      </div>
    </div>
  );
}

function AuthPage({mode, onDone, onSwitch, onForgot}) {
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [name,setName]=useState("");
  const [err,setErr]=useState("");
  const isLogin = mode==="login";
  const isForgot = mode==="forgot";

  const handle = () => {
    setErr("");
    if (!email.trim()) { setErr("Email is required"); return; }
    if (!isForgot && !pass.trim()) { setErr("Password is required"); return; }
    if (!isLogin && !isForgot && !name.trim()) { setErr("Name is required"); return; }
    onDone({email:email.trim(), pass, name:name.trim(), mode});
  };

  return (
    <div style={{minHeight:"100vh",background:BG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px"}}>
      <style>{css}</style>
      <div style={{width:"100%",maxWidth:400}} className="fade">
        <div style={{textAlign:"center",marginBottom:40}}>
          <Logo/>
          <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontWeight:300,fontSize:28,color:"#EDE5D8",marginTop:24}}>
            {isForgot?"Reset Password":isLogin?"Welcome back":"Create account"}
          </div>
          <div style={{fontFamily:"'DM Mono'",fontSize:12,color:"#666",marginTop:8}}>
            {isForgot?"We'll send you a reset link":isLogin?"Sign in to your wardrobe":"Your personal stylist awaits"}
          </div>
        </div>

        {!isForgot && (
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            <button className="social" onClick={()=>onDone({email:"google@user.com",name:"Google User",mode:isLogin?"login":"signup"})}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
            <button className="social" onClick={()=>onDone({email:"apple@user.com",name:"Apple User",mode:isLogin?"login":"signup"})}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              Continue with Apple
            </button>
            <div style={{display:"flex",alignItems:"center",gap:12,margin:"4px 0"}}>
              <div style={{flex:1,height:1,background:BORDER}}/><span style={{fontFamily:"'DM Mono'",fontSize:11,color:"#666"}}>or</span><div style={{flex:1,height:1,background:BORDER}}/>
            </div>
          </div>
        )}

        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
          {!isLogin&&!isForgot&&<input className="inp" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)}/>}
          <input className="inp" placeholder="Email address" type="email" value={email} onChange={e=>setEmail(e.target.value)}/>
          {!isForgot&&<input className="inp" placeholder="Password" type="password" value={pass} onChange={e=>setPass(e.target.value)}/>}
        </div>

        {err&&<div style={{fontFamily:"'DM Mono'",fontSize:12,color:"#C96E6E",marginBottom:12}}>{err}</div>}

        {isLogin&&(
          <div style={{textAlign:"right",marginBottom:14}}>
            <span onClick={onForgot} style={{fontFamily:"'DM Mono'",fontSize:12,color:G,cursor:"pointer"}}>Forgot password?</span>
          </div>
        )}

        <GBtn onClick={handle} style={{marginBottom:20}}>
          {isForgot?"Send Reset Link →":isLogin?"Sign In →":"Create Account →"}
        </GBtn>

        {!isForgot&&(
          <div style={{textAlign:"center",fontFamily:"'DM Mono'",fontSize:12,color:"#666"}}>
            {isLogin?"Don't have an account? ":"Already have an account? "}
            <span onClick={onSwitch} style={{color:G,cursor:"pointer"}}>{isLogin?"Sign up":"Sign in"}</span>
          </div>
        )}
        {isForgot&&(
          <div style={{textAlign:"center",fontFamily:"'DM Mono'",fontSize:12,color:"#666"}}>
            <span onClick={()=>onSwitch("login")} style={{color:G,cursor:"pointer"}}>← Back to sign in</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Subscription({user, onBack}) {
  const [billing,setBilling]=useState("monthly");
  const [proMsg,setProMsg]=useState(false);
  const plans=[
    {id:"free",name:"Free",monthly:0,yearly:0,features:["Up to 20 closet items","3 outfits per week","Basic style profile","Smart suggestions"],current:!user.pro},
    {id:"pro",name:"Pro",monthly:9.99,yearly:7.99,badge:"Most Popular",features:["Unlimited closet items","Unlimited outfits","AI-powered styling","Full learning & memory","Saved favorites","Advanced insights"],current:user.pro},
  ];
  return (
    <div style={{minHeight:"100vh",background:BG,color:"#DDD5C5",fontFamily:"'Playfair Display',serif"}}>
      <style>{css}</style>
      <div style={{maxWidth:640,margin:"0 auto",padding:"32px 20px 80px"}}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:40}}>
          <button onClick={onBack} style={{background:"none",border:"none",color:"#888",cursor:"pointer",fontFamily:"'DM Mono'",fontSize:12}}>← Back</button>
          <Logo/>
        </div>
        <div style={{textAlign:"center",marginBottom:44}} className="fade">
          <div style={{fontFamily:"'DM Mono'",fontSize:10,color:G,letterSpacing:"0.2em",marginBottom:12}}>✦ PLANS & PRICING ✦</div>
          <h2 style={{fontWeight:300,fontSize:36,marginBottom:20}}>Choose Your <em>Plan</em></h2>
          <div style={{display:"inline-flex",background:"#111009",borderRadius:100,padding:4,border:"1px solid "+BORDER}}>
            {["monthly","yearly"].map(b=>(
              <button key={b} onClick={()=>setBilling(b)} style={{padding:"8px 22px",borderRadius:100,border:"none",cursor:"pointer",fontFamily:"'DM Mono'",fontSize:12,background:billing===b?G:"transparent",color:billing===b?BG:"#444",transition:"all 0.18s"}}>
                {b==="monthly"?"Monthly":"Yearly"}{b==="yearly"&&<span style={{marginLeft:6,fontSize:10,color:billing==="yearly"?BG:G}}> −20%</span>}
              </button>
            ))}
          </div>
        </div>
        {proMsg&&(
          <div className="fade" style={{background:"#C9A96E20",border:"1px solid #C9A96E60",borderRadius:12,padding:"14px 20px",marginBottom:16,textAlign:"center"}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:16,color:"#EDE5D8",marginBottom:4}}>Pro plan coming soon ✦</div>
            <div style={{fontFamily:"'DM Mono'",fontSize:11,color:"#888"}}>We'll notify you when payments are live!</div>
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {plans.map(plan=>(
            <div key={plan.id} className="card" style={{padding:26,position:"relative",borderColor:plan.current?G+"60":BORDER}}>
              {plan.badge&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:G,color:BG,fontFamily:"'DM Mono'",fontSize:10,padding:"4px 14px",borderRadius:100,whiteSpace:"nowrap"}}>{plan.badge}</div>}
              <div style={{fontFamily:"'DM Mono'",fontSize:10,color:G,letterSpacing:"0.15em",marginBottom:8}}>{plan.name.toUpperCase()}</div>
              <div style={{fontSize:42,fontWeight:300,color:"#EDE5D8",lineHeight:1}}>
                ${billing==="yearly"?plan.yearly:plan.monthly}
                <span style={{fontFamily:"'DM Mono'",fontSize:12,color:"#777"}}>/mo</span>
              </div>
              {billing==="yearly"&&plan.yearly>0&&<div style={{fontFamily:"'DM Mono'",fontSize:11,color:G,marginTop:4}}>Billed ${(plan.yearly*12).toFixed(0)}/year</div>}
              <div style={{height:1,background:BORDER,margin:"18px 0"}}/>
              <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:22}}>
                {plan.features.map(f=>(
                  <div key={f} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                    <span style={{color:G,marginTop:1,flexShrink:0}}>✓</span>
                    <span style={{fontFamily:"'DM Mono'",fontSize:11,color:"#888",lineHeight:1.5}}>{f}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={()=>{ if(!plan.current && plan.name==="Pro") setProMsg(true); setTimeout(()=>setProMsg(false),3000); }}
                style={{width:"100%",padding:12,background:plan.current?"transparent":G,color:plan.current?"#444":BG,border:"1px solid "+(plan.current?BORDER:G),borderRadius:10,fontFamily:"'DM Mono'",fontSize:12,cursor:plan.current?"default":"pointer"}}>
                {plan.current?"✓ Current Plan":plan.name==="Pro"?"Upgrade to Pro →":"Get Started"}
              </button>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:28,fontFamily:"'DM Mono'",fontSize:11,color:"#252320"}}>
          Secure payment · Cancel anytime · No hidden fees
        </div>
      </div>
    </div>
  );
}

function Settings({user, onBack, onLogout, onSubscription}) {
  const [notif,setNotif]=useState(true);
  const Toggle=({on,set})=>(
    <div onClick={()=>set(!on)} style={{width:44,height:24,borderRadius:12,background:on?G:BORDER,cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}>
      <div style={{position:"absolute",top:3,left:on?23:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
    </div>
  );
  const Row=({label,sub,right})=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 0",borderBottom:"1px solid "+BORDER}}>
      <div><div style={{fontSize:15,fontWeight:300}}>{label}</div>{sub&&<div style={{fontFamily:"'DM Mono'",fontSize:11,color:"#6A6058",marginTop:3}}>{sub}</div>}</div>
      <div style={{marginLeft:16}}>{right}</div>
    </div>
  );
  return (
    <div style={{minHeight:"100vh",background:BG,color:"#DDD5C5",fontFamily:"'Playfair Display',serif"}}>
      <style>{css}</style>
      <div style={{maxWidth:640,margin:"0 auto",padding:"32px 20px 80px"}}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:40}}>
          <button onClick={onBack} style={{background:"none",border:"none",color:"#888",cursor:"pointer",fontFamily:"'DM Mono'",fontSize:12}}>← Back</button>
          <Logo/>
        </div>
        <div className="fade">
          <div style={{fontFamily:"'DM Mono'",fontSize:10,color:G,letterSpacing:"0.15em",marginBottom:6}}>SETTINGS</div>
          <h2 style={{fontWeight:300,fontSize:30,marginBottom:32}}>Your <em>Account</em></h2>
          <div className="card" style={{padding:"0 22px",marginBottom:14}}>
            <div style={{fontFamily:"'DM Mono'",fontSize:10,color:G,letterSpacing:"0.12em",padding:"16px 0 4px"}}>ACCOUNT</div>
            <Row label={user.name||"Your Name"} sub={user.email} right={<span style={{fontFamily:"'DM Mono'",fontSize:11,color:G,cursor:"pointer"}}>Edit</span>}/>
            <Row label="Subscription" sub={user.pro?"Pro Plan — Active":"Free Plan"} right={<span onClick={onSubscription} style={{fontFamily:"'DM Mono'",fontSize:11,color:G,cursor:"pointer"}}>{user.pro?"Manage":"Upgrade ✦"}</span>}/>
            <div style={{paddingBottom:8}}/>
          </div>
          <div className="card" style={{padding:"0 22px",marginBottom:14}}>
            <div style={{fontFamily:"'DM Mono'",fontSize:10,color:G,letterSpacing:"0.12em",padding:"16px 0 4px"}}>PREFERENCES</div>
            <Row label="Daily outfit notifications" sub={<span>Get styled every morning <span style={{fontFamily:"'DM Mono'",fontSize:9,color:"#555",letterSpacing:"0.06em"}}>· coming soon</span></span>} right={<Toggle on={notif} set={setNotif}/>}/>
            <div style={{paddingBottom:8}}/>
          </div>
          <div className="card" style={{padding:"0 22px",marginBottom:32}}>
            <div style={{fontFamily:"'DM Mono'",fontSize:10,color:G,letterSpacing:"0.12em",padding:"16px 0 4px"}}>DATA</div>
            <Row label="Clear AI memory" sub="Reset learned preferences" right={<span style={{fontFamily:"'DM Mono'",fontSize:11,color:"#C96E6E",cursor:"pointer"}}>Clear</span>}/>
            <Row label="Change password" sub="Update your password" right={<span style={{fontFamily:"'DM Mono'",fontSize:11,color:G,cursor:"pointer"}}>Update</span>}/>
            <div style={{paddingBottom:8}}/>
          </div>
          <div className="card" style={{padding:"0 22px",marginBottom:32}}>
            <div style={{fontFamily:"'DM Mono'",fontSize:10,color:G,letterSpacing:"0.12em",padding:"16px 0 4px"}}>ABOUT</div>
            <Row label="Clozie" sub="Version 1.0 — Your personal AI stylist" right={<span style={{fontFamily:"'DM Mono'",fontSize:11,color:"#555"}}>v1.0</span>}/>
            <Row label="Delete account" sub="Permanently remove all your data" right={<span style={{fontFamily:"'DM Mono'",fontSize:11,color:"#C96E6E",cursor:"pointer"}}>Delete</span>}/>
            <div style={{paddingBottom:8}}/>
          </div>
          <button onClick={onLogout} style={{width:"100%",padding:14,background:"transparent",border:"1px solid #3A1515",color:"#C96E6E",borderRadius:12,fontFamily:"'DM Mono'",fontSize:13,cursor:"pointer"}}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

function AvatarView({outfit}) {
  const allItems = outfit.itemObjects || [];
  const isDress = allItems.find(i=>i.category==="Dresses");
  const top     = isDress || allItems.find(i=>["Tops","Outerwear"].includes(i.category)) || null;
  const bottom  = isDress ? null : (allItems.find(i=>i.category==="Bottoms") || null);
  const shoes   = allItems.find(i=>i.category==="Shoes") || null;
  // Accessories — split by type
  const allAcc  = allItems.filter(i=>i.category==="Accessories");
  const hat     = allAcc.find(i=>/(hat|cap|beret|beanie|headband)/i.test(i.name||""));
  const earring = allAcc.find(i=>/(earring|ear|stud|hoop)/i.test(i.name||""));
  const bag     = allAcc.find(i=>/(bag|purse|clutch|tote)/i.test(i.name||""));
  // Fallback — if no name match, just show first two
  const acc1 = hat || earring || allAcc[0] || null;
  const acc2 = bag || (hat ? earring : null) || allAcc[1] || null;

  const [bg, setBg] = useState("#F5F0E8");
  const bgOptions = [
    {color:"#F5F0E8",label:"Cream"},
    {color:"#FFFFFF",label:"White"},
    {color:"#F0F0F0",label:"Grey"},
    {color:"#0D0C0A",label:"Dark"},
    {color:"#E8F0E8",label:"Sage"},
  ];

  return (
    <div style={{background:bg,padding:"16px 16px 8px",transition:"background 0.3s"}}>
      {/* Background picker */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,justifyContent:"center"}}>
        <span style={{fontFamily:"'DM Mono'",fontSize:9,color:"#999",letterSpacing:"0.1em"}}>BACKGROUND</span>
        {bgOptions.map(o=>(
          <div key={o.color} onClick={()=>setBg(o.color)} style={{width:20,height:20,borderRadius:"50%",background:o.color,border:"2px solid "+(bg===o.color?"#C9A96E":"#ccc"),cursor:"pointer",transition:"border 0.15s",boxShadow:"0 1px 4px #00000020"}}/>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"center"}}>
      <div style={{position:"relative",width:200,userSelect:"none"}}>

        {/* Mannequin SVG */}
        <svg width="200" height="500" viewBox="0 0 200 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:"block"}}>
          <ellipse cx="100" cy="32" rx="16" ry="20" fill="#DDD0BC" stroke="#C8B8A2" strokeWidth="1"/>
          <rect x="95" y="50" width="10" height="14" rx="3" fill="#DDD0BC"/>
          <path d="M48 74 Q100 60 152 74" stroke="#C8B8A2" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          <path d="M52 74 Q46 104 52 124 Q72 132 100 132 Q128 132 148 124 Q154 104 148 74 Q100 62 52 74Z" fill="#E8DCC8" stroke="#C8B8A2" strokeWidth="0.8"/>
          <path d="M54 122 Q100 130 146 122" stroke="#C8B8A2" strokeWidth="0.5" strokeDasharray="3,2" opacity="0.4"/>
          <path d="M52 124 Q44 144 48 164 Q70 174 100 174 Q130 174 152 164 Q156 144 148 124 Q128 132 100 132 Q72 132 52 124Z" fill="#DDD0BC" stroke="#C8B8A2" strokeWidth="0.8"/>
          <path d="M52 76 Q38 116 40 168" stroke="#DDD0BC" strokeWidth="10" strokeLinecap="round"/>
          <path d="M52 76 Q38 116 40 168" stroke="#C8B8A2" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
          <path d="M148 76 Q162 116 160 168" stroke="#DDD0BC" strokeWidth="10" strokeLinecap="round"/>
          <path d="M148 76 Q162 116 160 168" stroke="#C8B8A2" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
          <path d="M76 170 Q70 300 72 420" stroke="#DDD0BC" strokeWidth="20" strokeLinecap="round"/>
          <path d="M76 170 Q70 300 72 420" stroke="#C8B8A2" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
          <path d="M124 170 Q130 300 128 420" stroke="#DDD0BC" strokeWidth="20" strokeLinecap="round"/>
          <path d="M124 170 Q130 300 128 420" stroke="#C8B8A2" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
          <path d="M60 418 Q72 428 86 424" stroke="#C8B8A2" strokeWidth="8" strokeLinecap="round"/>
          <path d="M114 418 Q126 428 140 424" stroke="#C8B8A2" strokeWidth="8" strokeLinecap="round"/>
        </svg>

        {/* DRESS */}
        {isDress && isDress.image && (
          <div style={{position:"absolute",top:60,left:36,width:128,height:340,borderRadius:10,overflow:"hidden",opacity:0.93,boxShadow:"0 2px 16px #00000025"}}>
            <img src={isDress.image} alt={isDress.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top",mixBlendMode:"multiply"}}/>
          </div>
        )}

        {/* TOP */}
        {!isDress && top && top.image && (
          <div style={{position:"absolute",top:58,left:38,width:124,height:170,borderRadius:8,overflow:"hidden",opacity:0.93,boxShadow:"0 2px 12px #00000022"}}>
            <img src={top.image} alt={top.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top",mixBlendMode:"multiply"}}/>
          </div>
        )}

        {/* BOTTOM */}
        {!isDress && bottom && bottom.image && (
          <div style={{position:"absolute",top:220,left:38,width:124,height:190,borderRadius:8,overflow:"hidden",opacity:0.93,boxShadow:"0 2px 12px #00000022"}}>
            <img src={bottom.image} alt={bottom.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top",mixBlendMode:"multiply"}}/>
          </div>
        )}

        {/* SHOES — single clean display */}
        {shoes && shoes.image && (
          <div style={{position:"absolute",top:402,left:40,width:120,height:70,borderRadius:8,overflow:"hidden",boxShadow:"0 2px 8px #00000020",background:"#f0ede8"}}>
            <img src={shoes.image} alt={shoes.name} style={{width:"100%",height:"100%",objectFit:"contain",mixBlendMode:"multiply"}}/>
          </div>
        )}

        {/* HAT — on top of head */}
        {acc1 && acc1.image && /(hat|cap|beret|beanie|headband)/i.test(acc1.name||"") && (
          <div style={{position:"absolute",top:-10,left:68,width:64,height:44,borderRadius:8,overflow:"hidden",boxShadow:"0 2px 8px #00000030"}}>
            <img src={acc1.image} alt={acc1.name} style={{width:"100%",height:"100%",objectFit:"contain",mixBlendMode:"multiply"}}/>
          </div>
        )}

        {/* EARRING — beside ear, left side */}
        {acc1 && acc1.image && !/(hat|cap|beret|beanie|headband)/i.test(acc1.name||"") && (
          <div style={{position:"absolute",top:18,left:62,width:36,height:36,borderRadius:"50%",overflow:"hidden",border:"2px solid #fff",boxShadow:"0 2px 8px #00000030"}}>
            <img src={acc1.image} alt={acc1.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          </div>
        )}

        {/* SECOND ACCESSORY — right side near ear or as badge */}
        {acc2 && acc2.image && (
          <div style={{position:"absolute",top:18,right:62,width:36,height:36,borderRadius:"50%",overflow:"hidden",border:"2px solid #fff",boxShadow:"0 2px 8px #00000030"}}>
            <img src={acc2.image} alt={acc2.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          </div>
        )}

        {/* Labels */}
        <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:5}}>
          {[top,bottom,shoes,acc1,acc2].filter(Boolean).map((item,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:"#C9A96E",flexShrink:0}}/>
              <span style={{fontFamily:"'DM Mono'",fontSize:9,color:"#888"}}>{item.name}</span>
              {item.category&&<span style={{fontFamily:"'DM Mono'",fontSize:8,color:"#C9A96E",opacity:0.6}}>{item.category}</span>}
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}


function MoodBoard({outfit, onClose}) {
  const [view, setView] = useState("moodboard"); // "moodboard" | "avatar"
  const items = outfit.itemObjects || [];
  const withPhoto = items.filter(it => it && it.image);

  return (
    <div style={{position:"fixed",inset:0,background:"#000000DD",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}} onClick={onClose}>
      <div style={{background:"#F5F0E8",borderRadius:16,width:"100%",maxWidth:460,position:"relative"}} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{background:BG,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderRadius:"16px 16px 0 0"}}>
          <div>
            <div style={{fontFamily:"'DM Mono'",fontSize:9,color:G,letterSpacing:"0.15em"}}>{(outfit.vibe||"OUTFIT").toUpperCase()}</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontWeight:300,fontSize:18,color:"#EDE5D8"}}>{outfit.name}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"1px solid "+BORDER,borderRadius:8,color:"#888",fontFamily:"'DM Mono'",fontSize:11,padding:"5px 12px",cursor:"pointer"}}>Close</button>
        </div>

        {/* View toggle */}
        <div style={{display:"flex",background:BG,borderBottom:"1px solid "+BORDER}}>
          {[["moodboard","🖼 Mood Board"],["avatar","✦ Outfit Preview"]].map(([v,label])=>(
            <button key={v} onClick={()=>setView(v)} style={{
              flex:1,padding:"10px",border:"none",cursor:"pointer",
              fontFamily:"'DM Mono'",fontSize:11,
              background:view===v?G+"20":BG,
              color:view===v?G:"#666",
              borderBottom:"2px solid "+(view===v?G:"transparent"),
              transition:"all 0.18s"
            }}>{label}</button>
          ))}
        </div>

        {/* Mood Board view */}
        {view==="moodboard"&&(
          <div style={{background:"#F5F0E8",padding:16}}>
            {withPhoto.length===0
              ? <div style={{padding:"40px 0",textAlign:"center"}}>
                  <div style={{fontSize:44,marginBottom:12}}>👗</div>
                  <div style={{fontFamily:"'DM Mono'",fontSize:11,color:"#999"}}>Add photos to your closet items to see them here</div>
                </div>
              : <div style={{display:"grid",gridTemplateColumns:withPhoto.length===1?"1fr":"1fr 1fr",gap:12}}>
                  {withPhoto.map((item,i)=>(
                    <div key={i} style={{background:"#fff",borderRadius:12,overflow:"hidden",boxShadow:"0 4px 16px #00000018"}}>
                      <img src={item.image} alt={item.name} style={{width:"100%",display:"block",objectFit:"contain",background:"#f8f8f8",maxHeight:withPhoto.length===1?380:200}}/>
                      <div style={{padding:"8px 10px",borderTop:"1px solid #eee"}}>
                        <div style={{fontFamily:"'DM Mono'",fontSize:9,color:"#999",textAlign:"center"}}>{item.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}

        {/* Avatar view */}
        {view==="avatar"&&<AvatarView outfit={outfit}/>}

        {/* Items list */}
        <div style={{background:BG,padding:"14px 20px",borderRadius:"0 0 16px 16px"}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:withPhoto.length>0?10:0}}>
            {items.map((it,j)=>(
              <span key={j} style={{padding:"4px 10px",background:CARD,borderRadius:100,fontFamily:"'DM Mono'",fontSize:10,color:"#8A7A68",border:"1px solid "+BORDER,display:"flex",alignItems:"center",gap:5}}>
                {it.image&&<img src={it.image} alt={it.name} style={{width:16,height:16,borderRadius:"50%",objectFit:"cover"}}/>}
                {it.name}
              </span>
            ))}
          </div>
          {outfit.description&&<div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:12,color:"#7A6A58",lineHeight:1.5}}>{outfit.description}</div>}
        </div>
      </div>
    </div>
  );
}


function Favorites({favOutfits, onRemove, onBack}) {
  const [viewing, setViewing] = useState(null);
  return (
    <div style={{minHeight:"100vh",background:BG,color:"#DDD5C5",fontFamily:"'Playfair Display',serif"}}>
      <style>{css}</style>
      {viewing && <MoodBoard outfit={viewing} onClose={()=>setViewing(null)}/>}
      <div style={{maxWidth:640,margin:"0 auto",padding:"32px 20px 80px"}}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:32}}>
          <button onClick={onBack} style={{background:"none",border:"none",color:"#888",cursor:"pointer",fontFamily:"'DM Mono'",fontSize:12}}>← Back</button>
          <Logo/>
        </div>
        <div className="fade">
          <div style={{fontFamily:"'DM Mono'",fontSize:10,color:G,letterSpacing:"0.15em",marginBottom:6}}>MY COLLECTION</div>
          <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:8}}>
            <h2 style={{fontWeight:300,fontSize:30}}>Saved <em>Outfits</em></h2>
            {favOutfits.length>0&&<span style={{fontFamily:"'DM Mono'",fontSize:12,color:G}}>{favOutfits.length} saved {favOutfits.length===1?"look":"looks"} ✦</span>}
          </div>
          <p style={{fontFamily:"'DM Mono'",fontSize:11,color:"#6A6058",marginBottom:28}}>Tap an outfit to see the mood board. Tap ❤️ Save on any outfit to keep it here.</p>
          {favOutfits.length===0
            ? <div className="card" style={{padding:64,textAlign:"center"}}>
                <div style={{fontSize:48,marginBottom:16}}>🤍</div>
                <div style={{fontWeight:300,fontSize:22,marginBottom:10}}>No saved outfits yet</div>
                <div style={{fontFamily:"'DM Mono'",fontSize:11,color:"#666",lineHeight:1.8}}>
                  Generate outfits and tap <span style={{color:G}}>❤️ Save</span> to keep them here
                </div>
              </div>
            : favOutfits.map((o,i)=>(
              <div key={o.id||i} className="card" style={{marginBottom:14,overflow:"hidden",cursor:"pointer"}} onClick={()=>setViewing(o)}>
                {/* Photo strip preview */}
                {true ? (
                  <div style={{display:"flex",gap:8,padding:"10px 10px 0",background:CARD,position:"relative"}}>
                    {(o.itemObjects||[]).filter(it=>it&&it.image).slice(0,4).map((item,j)=>(
                      <div key={j} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                        <img src={item.image} alt={item.name} style={{width:"100%",maxHeight:120,objectFit:"contain",borderRadius:6,background:"#111009"}}/>
                        <span style={{fontFamily:"'DM Mono'",fontSize:9,color:"#888",paddingBottom:6,textAlign:"center"}}>{item.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{height:60,background:"#111009",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontFamily:"'DM Mono'",fontSize:10,color:"#666"}}>Tap to view mood board ✦</span>
                  </div>
                )}
                <div style={{padding:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div>
                      <div style={{fontFamily:"'DM Mono'",fontSize:9,color:G,letterSpacing:"0.15em",marginBottom:3}}>{(o.vibe||"OUTFIT").toUpperCase()}</div>
                      <div style={{fontSize:18,fontWeight:300}}>{o.name}</div>
                    </div>
                    <button onClick={e=>{e.stopPropagation();onRemove(o.id||i);}} style={{background:"none",border:"1px solid #3A1515",borderRadius:8,color:"#C96E6E",fontFamily:"'DM Mono'",fontSize:10,padding:"4px 10px",cursor:"pointer"}}>Remove</button>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {(o.items||[]).map((it,j)=>(
                      <span key={j} style={{padding:"3px 10px",background:BG,borderRadius:100,fontFamily:"'DM Mono'",fontSize:10,color:"#8A7A68",border:"1px solid "+BORDER}}>{it}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}


function MainApp({user, onLogout, onSettings, onSubscription, closet, setCloset, profile, setProfile, learnings, setLearnings, favOutfits, setFavOutfits, saveStatus}) {
  const [step,setStep]=useState("profile");
  const [context,setContext]=useState({weather:"",occasion:"",extraNote:""});
  const [outfits,setOutfits]=useState([]);
  const [feedback,setFeedback]=useState({});
  const [loading,setLoading]=useState(false);
  const [addingItem,setAddingItem]=useState(false);
  const [newItem,setNewItem]=useState({name:"",category:"Tops",color:"",description:""});
  const [editingItem,setEditingItem]=useState(null);
  const [moodBoard,setMoodBoard]=useState(null);
  const [showFavs,setShowFavs]=useState(false);
  const fileRef=useRef();

  const toggle=(key,val)=>setProfile(p=>({...p,[key]:p[key].includes(val)?p[key].filter(x=>x!==val):[...p[key],val]}));

  const handleImg=e=>{
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=ev=>setNewItem(p=>({...p,image:ev.target.result}));
    r.readAsDataURL(f);
  };

  const addItem=()=>{
    if(!newItem.name.trim()) return;
    setCloset(p=>[...p,{...newItem,id:Date.now()}]);
    setNewItem({name:"",category:"Tops",color:"",description:""});
    setAddingItem(false);
  };

  const doGenerate=()=>{
    setLoading(true);
    setOutfits([]);
    setFeedback({});
    setStep("outfits");
    setTimeout(()=>{
      setOutfits(makeOutfits(closet,context));
      setLoading(false);
    },1200);
  };

  const saveFeedback=()=>{
    const nl=outfits.map((o,i)=>{
      const f=feedback[i]; if(!f) return null;
      return '"'+o.name+'" was '+(f==="love"?"LOVED":f==="like"?"LIKED":"DISLIKED")+' for '+context.occasion;
    }).filter(Boolean);
    setLearnings(p=>[...p,...nl]);
    setStep("context");
    setContext({weather:"",occasion:"",extraNote:""});
    setOutfits([]);
  };

  const toggleFav=(outfit)=>{
    const id=outfit.id;
    setFavOutfits(p=>p.some(o=>o.id===id)
      ? p.filter(o=>o.id!==id)
      : [...p,{id:outfit.id,name:outfit.name,vibe:outfit.vibe,items:outfit.items||[],description:outfit.description||"",itemObjects:outfit.itemObjects||[]}]
    );
  };

  if(showFavs) return (
    <Favorites favOutfits={favOutfits} onRemove={id=>setFavOutfits(p=>p.filter(o=>o.id!==id))} onBack={()=>setShowFavs(false)}/>
  );

  return (
    <div style={{minHeight:"100vh",background:BG,color:"#DDD5C5",fontFamily:"'Playfair Display',serif",display:"flex",flexDirection:"column",alignItems:"center"}}>
      <style>{css}</style>
      {moodBoard&&<MoodBoard outfit={moodBoard} onClose={()=>setMoodBoard(null)}/>}
      <div style={{width:"100%",maxWidth:680,padding:"20px 20px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <Logo/>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {saveStatus==="saved"&&<span style={{fontFamily:"'DM Mono'",fontSize:10,color:"#3A5A3A"}}>✓ saved</span>}
            {saveStatus==="error"&&<span style={{fontFamily:"'DM Mono'",fontSize:10,color:"#C96E6E"}}>⚠ save failed</span>}
            <button onClick={()=>setShowFavs(true)} style={{background:"none",border:"1px solid "+(favOutfits.length>0?G:BORDER),borderRadius:20,cursor:"pointer",fontFamily:"'DM Mono'",fontSize:11,color:favOutfits.length>0?G:"#444",padding:"5px 12px",display:"flex",alignItems:"center",gap:5}}>
              {favOutfits.length>0?"❤️":"🤍"} Saved{favOutfits.length>0?" ("+favOutfits.length+")":""}
            </button>
            <button onClick={onSettings} style={{background:"none",border:"1px solid "+BORDER,borderRadius:20,cursor:"pointer",fontFamily:"'DM Mono'",fontSize:11,color:"#777",padding:"5px 14px"}}>
              ⚙ Settings
            </button>
            <div style={{width:30,height:30,borderRadius:"50%",background:G,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Mono'",fontSize:12,color:BG,fontWeight:"bold",flexShrink:0}}>
              {(user.name||"U")[0].toUpperCase()}
            </div>
          </div>
        </div>
        <div style={{display:"flex",borderBottom:"1px solid "+BORDER,marginBottom:28}}>
          {[["profile","✦","Style DNA"],["closet","👗","Wardrobe"+(closet.length>0?" · "+closet.length:"")],["context","🌤","Today's Vibe"],["outfits","◈","Your Looks"]].map(([s,icon,label])=>(
            <button key={s} className="ntab" onClick={()=>setStep(s)}
              style={{flex:1,color:step===s?G:"#333",borderBottomColor:step===s?G:"transparent"}}>
              <span style={{fontSize:16}}>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{width:"100%",maxWidth:680,padding:"0 20px 100px"}}>

        {step==="profile"&&(
          <div className="fade">
            <div style={{marginBottom:28}}>
              <div style={{fontFamily:"'DM Mono'",fontSize:10,color:G,letterSpacing:"0.15em",marginBottom:6}}>YOUR STYLE DNA</div>
              <h2 style={{fontWeight:300,fontSize:30}}>Your <em>Style Profile</em></h2>
              <p style={{color:"#6A6058",fontFamily:"'DM Mono'",fontSize:12,marginTop:6}}>Clozie uses this to personalise every outfit, the more you use her the better she knows you ✦</p>
            </div>
            <div className="card" style={{padding:22,marginBottom:12}}>
              <Label text="STYLES I LOVE"/>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {STYLE_OPTIONS.map(s=><span key={s} className={"tag"+(profile.styles.includes(s)?" on":"")} onClick={()=>toggle("styles",s)}>{s}</span>)}
              </div>
            </div>
            <div className="card" style={{padding:22,marginBottom:12}}>
              <Label text="MY COLOUR PALETTE"/>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {COLOR_OPTIONS.map(c=><span key={c} className={"tag"+(profile.colors.includes(c)?" on":"")} onClick={()=>toggle("colors",c)}>{c}</span>)}
              </div>
            </div>
            <div className="card" style={{padding:22,marginBottom:20}}>
              <Label text="I NEVER WANT TO WEAR"/>
              <textarea className="inp" rows={3} placeholder="Tell your stylist what you never want to wear..." value={profile.dislikes} onChange={e=>setProfile(p=>({...p,dislikes:e.target.value}))} style={{resize:"none"}}/>
            </div>
            {learnings.length===0&&(
              <div style={{padding:"14px 18px",background:"#161512",borderRadius:12,border:"1px solid #2E2B27",marginBottom:12}}>
                <span style={{fontFamily:"'DM Mono'",fontSize:11,color:"#555",lineHeight:1.8}}>
                  ✦ Rate your first outfit and Clozie will start learning your taste
                </span>
              </div>
            )}
            {learnings.length>0&&(
              <div className="card" style={{padding:18,marginBottom:20,borderColor:G+"30"}}>
                <Label text={"✦ CLOZIE'S NOTES ON YOU ("+learnings.length+" ratings)"}/>
                {learnings.slice(-4).map((l,i)=><div key={i} style={{fontFamily:"'DM Mono'",fontSize:11,color:"#6A6058",marginBottom:5}}>· {l}</div>)}
              </div>
            )}
            <GBtn onClick={()=>setStep("closet")}>Build My Closet →</GBtn>
            <button onClick={()=>setStep("closet")} style={{width:"100%",marginTop:10,padding:12,background:"transparent",border:"none",color:"#555",fontFamily:"'DM Mono'",fontSize:12,cursor:"pointer",letterSpacing:"0.04em"}}>
              Skip for now →
            </button>
          </div>
        )}

        {step==="closet"&&(
          <div className="fade">
            <div style={{marginBottom:28}}>
              <div style={{fontFamily:"'DM Mono'",fontSize:10,color:G,letterSpacing:"0.15em",marginBottom:6}}>YOUR WARDROBE</div>
              <h2 style={{fontWeight:300,fontSize:30}}>Your <em>Wardrobe</em></h2>
              <p style={{color:"#6A6058",fontFamily:"'DM Mono'",fontSize:12,marginTop:6}}>Clozie only creates outfits from clothes you add here.</p>
            </div>
            {closet.length===0&&!addingItem&&(
              <div className="card" style={{padding:56,textAlign:"center",marginBottom:12}}>
                <div style={{fontSize:40,marginBottom:10}}>👗</div>
                <div style={{color:"#555",fontFamily:"'DM Mono'",fontSize:12}}>
                  <div style={{fontFamily:"'Playfair Display',serif",fontWeight:300,fontSize:16,color:"#EDE5D8",marginBottom:8}}>Your closet is empty</div>
                  <div style={{fontFamily:"'DM Mono'",fontSize:10,color:"#666",lineHeight:1.9}}>For best results add:<br/><span style={{color:"#C9A96E"}}>3–5 tops · 2–3 bottoms · 1–2 shoes</span></div>
                </div>
              </div>
            )}
            {closet.length>0&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                {closet.map(item=>(
                  <div key={item.id} className="card" style={{padding:14,position:"relative"}}>
                    {item.image&&<img src={item.image} alt={item.name} style={{width:"100%",maxHeight:140,objectFit:"contain",borderRadius:8,marginBottom:10,background:"#111009"}}/>}
                    <div style={{display:"flex",alignItems:"center",marginBottom:4}}>
                      <span style={{
                        padding:"2px 8px",borderRadius:100,fontSize:9,
                        fontFamily:"'DM Mono'",letterSpacing:"0.06em",
                        background:{"Tops":"#4A90D920","Bottoms":"#7B68EE20","Dresses":"#E8739A20","Outerwear":"#5BA85A20","Shoes":"#E8A44420","Accessories":"#C9A96E20"}[item.category]||"#C9A96E20",
                        color:{"Tops":"#4A90D9","Bottoms":"#9B88EE","Dresses":"#E8739A","Outerwear":"#5BA85A","Shoes":"#E8A444","Accessories":"#C9A96E"}[item.category]||G
                      }}>{item.category}</span>
                    </div>
                    <div style={{fontSize:15,fontWeight:300}}>{item.name}</div>
                    {item.color&&<div style={{fontFamily:"'DM Mono'",fontSize:11,color:"#6A6058",marginTop:2}}>{item.color}</div>}
<div style={{position:"absolute",top:8,right:8,display:"flex",gap:4}}>
                      <button onClick={()=>setEditingItem(item)} style={{background:"#1A1815",color:G,border:"none",borderRadius:"50%",width:22,height:22,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✎</button>
                      <button onClick={()=>setCloset(p=>p.filter(c=>c.id!==item.id))} style={{background:"#1A1815",color:"#888",border:"none",borderRadius:"50%",width:22,height:22,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Edit item modal */}
            {editingItem&&(
              <div className="card" style={{padding:22,marginBottom:12,borderColor:G+"40"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div style={{fontFamily:"'DM Mono'",fontSize:10,color:G,letterSpacing:"0.12em"}}>EDIT ITEM</div>
                  <button onClick={()=>setEditingItem(null)} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontSize:16}}>×</button>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <input className="inp" placeholder="Name" value={editingItem.name} onChange={e=>setEditingItem(p=>({...p,name:e.target.value}))}/>
                  <select className="inp" value={editingItem.category} onChange={e=>setEditingItem(p=>({...p,category:e.target.value}))}>
                    {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                  <input className="inp" placeholder="Colour / pattern" value={editingItem.color||""} onChange={e=>setEditingItem(p=>({...p,color:e.target.value}))}/>
                  <input className="inp" placeholder="Notes" value={editingItem.description||""} onChange={e=>setEditingItem(p=>({...p,description:e.target.value}))}/>
                  <GBtn onClick={()=>{setCloset(p=>p.map(c=>c.id===editingItem.id?editingItem:c));setEditingItem(null);}} style={{padding:12,fontSize:14}}>Save Changes</GBtn>
                </div>
              </div>
            )}
            {addingItem?(
              <div className="card" style={{padding:22,marginBottom:12}}>
                <Label text="NEW ITEM"/>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <input className="inp" placeholder="Name * (e.g. White linen shirt)" value={newItem.name} onChange={e=>setNewItem(p=>({...p,name:e.target.value}))}/>
                  <select className="inp" value={newItem.category} onChange={e=>setNewItem(p=>({...p,category:e.target.value}))}>
                    {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                  <input className="inp" placeholder="Colour / pattern (e.g. navy blue)" value={newItem.color} onChange={e=>setNewItem(p=>({...p,color:e.target.value}))}/>
                  <input className="inp" placeholder="Notes — fit, fabric (optional)" value={newItem.description} onChange={e=>setNewItem(p=>({...p,description:e.target.value}))}/>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <button onClick={()=>fileRef.current.click()} style={{padding:"8px 14px",background:"#111009",color:"#888",border:"1px solid "+BORDER,borderRadius:8,fontFamily:"'DM Mono'",fontSize:11,cursor:"pointer"}}>📷 Add Photo</button>
                    {newItem.image&&<span style={{fontFamily:"'DM Mono'",fontSize:11,color:G}}>✓ Photo added</span>}
                    <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImg}/>
                  </div>
                  <div style={{display:"flex",alignItems:"flex-start",gap:6,padding:"8px 10px",background:"#0D0C0A",borderRadius:8,border:"1px solid #1E1C18"}}>
                    <span style={{color:G,fontSize:12,flexShrink:0}}>💡</span>
                    <span style={{fontFamily:"'DM Mono'",fontSize:10,color:"#666",lineHeight:1.7}}>For best results photograph on a <span style={{color:G}}>white wall or light background</span> — avoid carpets or busy backgrounds.</span>
                  </div>
                  <div style={{display:"none"}}>
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:4}}>
                    <GBtn onClick={addItem} disabled={!newItem.name.trim()} style={{padding:12,fontSize:15}}>Add to Closet</GBtn>
                    <button onClick={()=>setAddingItem(false)} style={{padding:"12px 20px",background:"#111009",color:"#777",border:"1px solid "+BORDER,borderRadius:10,fontFamily:"'DM Mono'",fontSize:11,cursor:"pointer"}}>Cancel</button>
                  </div>
                </div>
              </div>
            ):(
              <button onClick={()=>setAddingItem(true)} style={{width:"100%",padding:14,background:"transparent",border:"1px dashed "+BORDER,color:G,borderRadius:12,fontFamily:"'DM Mono'",fontSize:12,cursor:"pointer",marginBottom:12}}>
                + Add Clothing Item
              </button>
            )}
            <GBtn onClick={()=>setStep("context")} disabled={closet.length<2}>
              {closet.length<2?"Add "+(2-closet.length)+" more item"+(2-closet.length!==1?"s":"")+" to continue":"Set Today's Context →"}
            </GBtn>
          </div>
        )}

        {step==="context"&&(
          <div className="fade">
            <div style={{marginBottom:28}}>
              <div style={{fontFamily:"'DM Mono'",fontSize:10,color:G,letterSpacing:"0.15em",marginBottom:6}}>TODAY'S VIBE</div>
              <h2 style={{fontWeight:300,fontSize:30}}>Today's <em>Vibe</em></h2>
              <p style={{color:"#6A6058",fontFamily:"'DM Mono'",fontSize:12,marginTop:6}}>Let's dress you perfectly for today ✦</p>
              {closet.length>0&&(
                <div style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:10,padding:"5px 12px",background:"#161512",borderRadius:100,border:"1px solid #2E2B27"}}>
                  <span style={{color:G,fontSize:10}}>✦</span>
                  <span style={{fontFamily:"'DM Mono'",fontSize:10,color:"#888"}}>Styling from <span style={{color:G}}>{closet.length} {closet.length===1?"item":"items"}</span> in your wardrobe</span>
                </div>
              )}
            </div>
            <div className="card" style={{padding:22,marginBottom:12}}>
              <Label text="WEATHER OUTSIDE"/>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {WEATHER_OPTIONS.map(w=><span key={w} className={"tag"+(context.weather===w?" on":"")} onClick={()=>setContext(p=>({...p,weather:w}))}>{w}</span>)}
              </div>
            </div>
            <div className="card" style={{padding:22,marginBottom:12}}>
              <Label text="THE OCCASION"/>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {OCCASION_OPTIONS.map(o=><span key={o} className={"tag"+(context.occasion===o?" on":"")} onClick={()=>setContext(p=>({...p,occasion:o}))}>{o}</span>)}
              </div>
            </div>
            <div className="card" style={{padding:22,marginBottom:28}}>
              <Label text="ANYTHING ELSE?"/>
              <input className="inp" placeholder="e.g. Want to feel confident, prefer comfort today..." value={context.extraNote} onChange={e=>setContext(p=>({...p,extraNote:e.target.value}))}/>
            </div>
            <GBtn onClick={doGenerate} disabled={!context.weather||!context.occasion}>
              ✦ Generate My Outfits →
            </GBtn>
          </div>
        )}

        {step==="outfits"&&(
          <div className="fade">
            <div style={{marginBottom:28}}>
              <div style={{fontFamily:"'DM Mono'",fontSize:10,color:G,letterSpacing:"0.15em",marginBottom:6}}>YOUR LOOKS</div>
              <h2 style={{fontWeight:300,fontSize:30}}>Your <em>Looks</em></h2>
              <p style={{color:"#6A6058",fontFamily:"'DM Mono'",fontSize:12,marginTop:6}}>
                Here are today's looks, styled just for you.
                {learnings.length>0&&<span style={{color:G}}> ✦ Clozie learns your taste with every rating.</span>}
                {learnings.length===0&&<span> Rate an outfit to help Clozie learn your taste.</span>}
              </p>
            </div>

            {loading&&(
              <div style={{textAlign:"center",padding:"80px 0"}}>
                <div className="spin" style={{fontSize:32,color:G}}>✦</div>
                <div style={{fontFamily:"'DM Mono'",fontSize:12,color:"#666",marginTop:20}}><span className="pulse">Styling your outfits...</span></div>
              </div>
            )}

            {!loading&&outfits.length===0&&(
              <div className="card" style={{padding:48,textAlign:"center"}}>
                <div style={{fontSize:36,marginBottom:12}}>🤔</div>
                <div style={{fontFamily:"'DM Mono'",fontSize:12,color:"#777",marginBottom:20}}>Not enough variety in your closet.<br/>Add more tops, bottoms, or shoes.</div>
                <GBtn onClick={()=>setStep("closet")} style={{maxWidth:220,margin:"0 auto",padding:12,fontSize:14}}>Add More Clothes</GBtn>
              </div>
            )}

            {!loading&&outfits.map((outfit,i)=>{
              const isFav=favOutfits.some(o=>o.id===outfit.id);
              return (
                <div key={outfit.id} className="card fade" style={{marginBottom:14,overflow:"hidden",borderColor:feedback[i]==="love"?G+"60":feedback[i]==="dislike"?"#3A1515":BORDER,animationDelay:(i*0.07)+"s"}}>
                  {(outfit.itemObjects||[]).filter(it=>it.image).length>0&&(
                    <div style={{display:"flex",gap:8,padding:"10px 10px 0",background:CARD}}>
                      {(outfit.itemObjects||[]).filter(it=>it.image).slice(0,4).map((item,j)=>(
                        <div key={j} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                          <img src={item.image} alt={item.name} style={{width:"100%",maxHeight:140,objectFit:"contain",borderRadius:8,background:"#111009"}}/>
                          <span style={{fontFamily:"'DM Mono'",fontSize:9,color:"#888",textAlign:"center",paddingBottom:6}}>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{padding:20}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                      <div>
                        <div style={{fontFamily:"'DM Mono'",fontSize:9,color:G,letterSpacing:"0.18em",marginBottom:5}}>{(outfit.vibe||"").toUpperCase()}</div>
                        <div style={{fontSize:22,fontWeight:300}}>{outfit.name}</div>
                        <button onClick={()=>setMoodBoard(outfit)} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Mono'",fontSize:10,color:G,padding:0,marginTop:4,letterSpacing:"0.04em"}}>✦ View mood board</button>
                      </div>
                      <button onClick={()=>toggleFav(outfit)} style={{background:"none",border:"1px solid "+(isFav?G:"#333"),borderRadius:8,padding:"6px 12px",cursor:"pointer",fontFamily:"'DM Mono'",fontSize:11,color:isFav?G:"#555",whiteSpace:"nowrap",transition:"all 0.18s"}}>
                        {isFav?"❤️ Saved":"🤍 Save"}
                      </button>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
                      {(outfit.itemObjects||[]).map((item,j)=>(
                        <div key={j} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",background:BG,borderRadius:100,border:"1px solid "+BORDER}}>
                          {item.image&&<img src={item.image} alt={item.name} style={{width:20,height:20,borderRadius:"50%",objectFit:"cover"}}/>}
                          <span style={{fontFamily:"'DM Mono'",fontSize:11,color:"#8A7A68"}}>{item.name}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontWeight:300,fontSize:14,color:"#7A6A58",lineHeight:1.65,marginBottom:18}}>{outfit.description}</div>
                    <div style={{display:"flex",gap:6}}>
                      {[["love","❤️ Love it"],["like","👍 Like it"],["dislike","👎 Not for me"]].map(([val,label])=>(
                        <button key={val} onClick={()=>setFeedback(p=>({...p,[i]:val}))} style={{flex:1,padding:"9px 4px",borderRadius:9,fontSize:11,fontFamily:"'DM Mono'",cursor:"pointer",border:"1px solid "+(feedback[i]===val?"transparent":BORDER),background:feedback[i]===val?(val==="love"?G:val==="like"?"#152515":"#2A1010"):BG,color:feedback[i]===val?(val==="love"?BG:"#DDD5C5"):"#3A3530",transition:"all 0.15s"}}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {!loading&&outfits.length>0&&(
              <div style={{display:"flex",gap:10,marginTop:8}}>
                <button onClick={doGenerate} style={{flex:1,padding:14,background:CARD,color:G,borderRadius:12,fontSize:15,border:"1px solid "+BORDER,cursor:"pointer",fontFamily:"'Playfair Display',serif"}}>🔄 Regenerate</button>
                <GBtn onClick={saveFeedback} disabled={Object.keys(feedback).length===0} style={{flex:2,padding:14,fontSize:15}}>
                  Save Feedback & Style Again →
                </GBtn>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Root() {
  const [page,setPage]=useState("splash");
  const [user,setUser]=useState(null);
  const [forgotSent,setForgotSent]=useState(false);

  // ── Persistent state lives HERE so it survives page navigation ──
  const [closet,setCloset]=useState([]);
  const [profile,setProfile]=useState({styles:[],colors:[],dislikes:""});
  const [learnings,setLearnings]=useState([]);
  const [favOutfits,setFavOutfits]=useState([]);
  const [saveStatus,setSaveStatus]=useState("");
  const [ready,setReady]=useState(false);

  // Load once on mount
  useEffect(()=>{
    (async()=>{
      const sc=await loadCloset();
      const sp=await storageGet("clozie-profile");
      const sl=await storageGet("clozie-learnings");
      const sf=await storageGet("clozie-favs");
      if(sc&&Array.isArray(sc)) setCloset(sc);
      if(sp&&sp.styles) setProfile(sp);
      if(sl&&Array.isArray(sl)) setLearnings(sl);
      if(sf&&Array.isArray(sf)) setFavOutfits(sf);
      setReady(true);
    })();
  },[]);

  // Save whenever data changes
  useEffect(()=>{
    if(!ready) return;
    (async()=>{
      const ok1=await saveCloset(closet);
      const favsToSave=favOutfits.map(o=>({
        id:o.id,name:o.name,vibe:o.vibe,
        items:o.items||[],description:o.description||"",
        itemObjects:(o.itemObjects||[]).map(it=>({name:it.name,image:it.image||null,category:it.category||""}))
      }));
      const ok2=await storageSet("clozie-profile",profile);
      await storageSet("clozie-learnings",learnings);
      await storageSet("clozie-favs",favsToSave);
      setSaveStatus(ok1&&ok2?"saved":"error");
      setTimeout(()=>setSaveStatus(""),2000);
    })();
  },[closet,profile,learnings,favOutfits,ready]);

  const handleAuth=({email,name,mode})=>{
    if(mode==="forgot"){ setForgotSent(true); return; }
    setUser({email,name:name||email.split("@")[0],pro:false});
    setPage("app");
  };

  const sharedProps={closet,setCloset,profile,setProfile,learnings,setLearnings,favOutfits,setFavOutfits,saveStatus};

  // Auth screens — shown before login
  if(!user) {
    if(page==="splash") return <Splash onDone={()=>setPage("onboarding")}/>;
    if(page==="onboarding") return <Onboarding onDone={()=>setPage("welcome")}/>;
    if(page==="signup") return <AuthPage mode="signup" onDone={handleAuth} onSwitch={()=>setPage("login")} onForgot={()=>setPage("forgot")}/>;
    if(page==="forgot") return forgotSent
      ? <div style={{minHeight:"100vh",background:BG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40}}>
          <style>{css}</style>
          <div style={{textAlign:"center",maxWidth:400}} className="fade">
            <div style={{fontSize:48,marginBottom:20}}>📬</div><Logo/>
            <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:24,color:"#EDE5D8",margin:"20px 0 12px"}}>Check your inbox</div>
            <div style={{fontFamily:"'DM Mono'",fontSize:12,color:"#888",marginBottom:32}}>We sent a reset link to your email.</div>
            <GBtn onClick={()=>{setForgotSent(false);setPage("login");}}>Back to Sign In</GBtn>
          </div>
        </div>
      : <AuthPage mode="forgot" onDone={handleAuth} onSwitch={()=>setPage("login")} onForgot={()=>{}}/>;
    if(page==="login") return <AuthPage mode="login" onDone={handleAuth} onSwitch={()=>setPage("signup")} onForgot={()=>setPage("forgot")}/>;
    return <Welcome onLogin={()=>setPage("login")} onSignup={()=>setPage("signup")}/>;
  }

  // Logged in — MainApp ALWAYS stays mounted so state is never lost
  // Settings and Subscription slide over as fixed overlays
  return (
    <div>
      <MainApp
        user={user}
        onLogout={()=>{setUser(null);setPage("welcome");}}
        onSettings={()=>setPage("settings")}
        onSubscription={()=>setPage("subscription")}
        {...sharedProps}
      />
      {page==="settings"&&(
        <div style={{position:"fixed",inset:0,zIndex:500,overflowY:"auto",background:BG}}>
          <Settings user={user} onBack={()=>setPage("app")} onLogout={()=>{setUser(null);setPage("welcome");}} onSubscription={()=>setPage("subscription")}/>
        </div>
      )}
      {page==="subscription"&&(
        <div style={{position:"fixed",inset:0,zIndex:500,overflowY:"auto",background:BG}}>
          <Subscription user={user} onBack={()=>setPage("settings")}/>
        </div>
      )}
    </div>
  );
}
