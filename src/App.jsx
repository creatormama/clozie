import { useState, useRef, useEffect } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON;
const supabase = (SUPABASE_URL && SUPABASE_ANON) ? createClient(SUPABASE_URL, SUPABASE_ANON) : null;

const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY;
const REMOVEBG_KEY = import.meta.env.VITE_REMOVEBG_KEY;
// ── VIP accounts — always Pro, always unlimited ───────────────────────────────
const VIP_EMAILS = [
"insuredbyjacek@msn.com",
"zuzia.starz@gmail.com",
"stefka992001@gmail.com"
];

const STYLE_OPTIONS = ["Minimalist","Streetwear","Classic","Bohemian","Sporty","Romantic","Edgy","Business"];
const COLOR_OPTIONS = ["Neutrals","Earth Tones","Bold Colors","Pastels","Monochrome","Black & White","Warm Tones","Cool Tones"];
const WEATHER_OPTIONS = ["Sunny & Hot","Warm & Breezy","Mild & Cloudy","Cold & Dry","Rainy","Snowy"];
const OCCASION_OPTIONS = ["Casual Day","Work / Office","Date Night","Party","Outdoor / Sport","Formal Event","Weekend Errands","Travel"];
const CATEGORIES = ["Tops","Bottoms","Dresses","Outerwear","Shoes","Accessories"];
const G = "#C9A96E", BG = "#0D0C0A", CARD = "#161512", BORDER = "#252320";

const css = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} .tag{cursor:pointer;padding:7px 16px;border-radius:100px;font-size:12px;font-family:'DM Mono',monospace;border:1px solid #383430;transition:all 0.18s;color:#888;background:transparent;} .tag:hover{border-color:#C9A96E;color:#C9A96E;} .tag.on{background:#C9A96E;color:#0D0C0A;border-color:#C9A96E;} .inp{background:#0F0E0B;border:1px solid #252320;color:#DDD5C5;border-radius:8px;padding:11px 14px;font-family:'DM Mono',monospace;font-size:13px;outline:none;transition:border-color 0.2s;width:100%;} .inp:focus{border-color:#C9A96E50;} .inp::placeholder{color:#2A2820;} select.inp option{background:#161512;} .card{background:#161512;border:1px solid #252320;border-radius:14px;} .gbtn{cursor:pointer;border:none;font-family:'Playfair Display',serif;transition:all 0.2s;width:100%;padding:16px;border-radius:12px;font-size:16px;} .gbtn:hover:not(:disabled){opacity:0.85;transform:translateY(-1px);} .gbtn:disabled{opacity:0.35;cursor:default;} .social{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:13px;border-radius:10px;font-family:'DM Mono';font-size:13px;cursor:pointer;border:1px solid #252320;background:#111009;color:#777;transition:all 0.18s;} .social:hover{border-color:#C9A96E50;color:#DDD5C5;} .ntab{cursor:pointer;padding:10px 0 12px;font-size:10px;font-family:'DM Mono';letter-spacing:0.04em;border:none;background:transparent;display:flex;flex-direction:column;align-items:center;gap:5px;transition:color 0.18s;border-bottom:2px solid transparent;margin-bottom:-1px;} @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} .fade{animation:fadeUp 0.3s ease forwards;} @keyframes spin{to{transform:rotate(360deg)}} .spin{animation:spin 1.2s linear infinite;display:inline-block;} @keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}} .pulse{animation:pulse 1.4s infinite;} @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}} .ai-scanning{background:linear-gradient(90deg,#C9A96E20 25%,#C9A96E60 50%,#C9A96E20 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;}`;

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

// ── Supabase helpers ──────────────────────────────────────────────────────────
async function sbGet(table, userId) {
  if (!supabase || !userId) return null;
  try {
    const { data } = await supabase.from(table).select("data").eq("user_id", userId).single();
    return data ? JSON.parse(data.data) : null;
  } catch(e) { return null; }
}
async function sbSet(table, userId, val) {
  if (!supabase || !userId) return false;
  try {
    await supabase.from(table).upsert({ user_id: userId, data: JSON.stringify(val) }, { onConflict: "user_id" });
    return true;
  } catch(e) { return false; }
}

async function storageGet(key, userId) {
  const tableMap = { "clozie-profile": "profiles", "clozie-learnings": "profiles", "clozie-favs": "favorites" };
  if (supabase && userId && tableMap[key]) {
    const d = await sbGet(tableMap[key], userId + "-" + key);
    if (d !== null) return d;
  }
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch(e) { return null; }
}
async function storageSet(key, val, userId) {
  const tableMap = { "clozie-profile": "profiles", "clozie-learnings": "profiles", "clozie-favs": "favorites" };
  if (supabase && userId && tableMap[key]) {
    await sbSet(tableMap[key], userId + "-" + key, val);
  }
  try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch(e) { return false; }
}

async function saveCloset(closet, userId) {
  try { localStorage.setItem("clozie-closet", JSON.stringify(closet)); } catch(e) {}
  if (supabase && userId) {
    const slim = closet.map(({image, ...rest}) => rest);
    await sbSet("closet", userId, slim);
  }
  return true;
}

async function loadCloset(userId) {
  try {
    const v = localStorage.getItem("clozie-closet");
    if (v) { const p = JSON.parse(v); if (Array.isArray(p) && p.length > 0) return p; }
  } catch(e) {}
  if (supabase && userId) {
    const d = await sbGet("closet", userId);
    if (Array.isArray(d) && d.length > 0) return d;
  }
  return null;
}

// ── AI PHOTO RECOGNITION ──────────────────────────────────────────────────────
async function removeBackground(imageBase64) {
  if (!REMOVEBG_KEY) return imageBase64;
  try {
    const blob = await fetch(imageBase64).then(r => r.blob());
    const formData = new FormData();
    formData.append("image_file", blob, "image.jpg");
    formData.append("size", "auto");
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": REMOVEBG_KEY },
      body: formData
    });
    if (!response.ok) return imageBase64;
    const resultBlob = await response.blob();
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const padding = Math.round(Math.max(img.width, img.height) * 0.15);
        const canvas = document.createElement("canvas");
        canvas.width = img.width + padding * 2;
        canvas.height = img.height + padding * 2;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, padding, padding);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = URL.createObjectURL(resultBlob);
    });
  } catch(e) {
    return imageBase64;
  }
}
async function analyseClothingPhoto(imageBase64) {
  if (!ANTHROPIC_KEY) return null;
  
  // Strip the data URL prefix to get just the base64 data
  const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
  const mediaType = imageBase64.includes("image/png") ? "image/png" : 
                    imageBase64.includes("image/webp") ? "image/webp" : "image/jpeg";

  const prompt = `You are a fashion expert analysing a clothing item photo for a wardrobe app called Clozie.

Look at this clothing item and return ONLY a JSON object with these exact fields:
- "name": a short descriptive name (2-4 words, e.g. "White linen shirt", "Black midi skirt", "Brown leather boots")
- "category": MUST be exactly one of: Tops, Bottoms, Dresses, Outerwear, Shoes, Accessories
- "color": the main color(s) and pattern (e.g. "Navy blue", "Floral print", "Black and white stripe")
- "description": one short phrase about style/fit/fabric (e.g. "Relaxed fit", "Knee length", "Ankle boots with heel")

Rules:
- category must be EXACTLY one of the 6 options listed
- name should be concise and clear
- color should describe what you actually see
- description should be brief and useful for outfit matching

Respond ONLY with valid JSON, nothing else. Example:
{"name":"White linen shirt","category":"Tops","color":"White","description":"Relaxed fit, slightly sheer"}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Data
              }
            },
            { type: "text", text: prompt }
          ]
        }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    
    // Validate category is one of the allowed ones
    if (!CATEGORIES.includes(parsed.category)) {
      parsed.category = "Tops"; // safe fallback
    }
    
    return parsed;
  } catch(e) {
    console.error("Photo analysis failed:", e);
    return null;
  }
}

// ── Fallback rule-based outfits ───────────────────────────────────────────────
function makeOutfitsFallback(closet, context) {
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

// ── AI outfit generation ──────────────────────────────────────────────────────
async function makeOutfitsAI(closet, context, profile, learnings) {
  if (!ANTHROPIC_KEY) return makeOutfitsFallback(closet, context);

  const occasion = context.occasion || "";
  const weather = context.weather || "";

  const isSporty = occasion === "Outdoor / Sport";
  const isCasual = ["Casual Day","Weekend Errands","Travel"].includes(occasion);
  const isDressy = ["Date Night","Party","Formal Event"].includes(occasion);
  const isHot = ["Sunny & Hot","Warm & Breezy"].includes(weather);
  const isCold = ["Cold & Dry","Rainy","Snowy"].includes(weather);
  const isRainy = weather === "Rainy";

  const desc = item => (item.name + " " + item.description + " " + item.color).toLowerCase();
  const isHeel = item => desc(item).match(/heel|pump|stiletto/);
  const isSneaker = item => desc(item).match(/sneaker|trainer|running|sport shoe/);
  const isSleeveless = item => desc(item).match(/sleeveless|tank|cami|strapless/);
  const isLongSleeve = item => desc(item).match(/long.?sleeve|longsleeve/);

  const filterItems = (items, category) => {
    return items.filter(item => {
      if (category === "Shoes") {
        const hasNonHeels = items.filter(s => !isHeel(s)).length > 0;
        const hasNonSneakers = items.filter(s => !isSneaker(s)).length > 0;
        if (isSporty && isHeel(item)) return false;
        if (isCasual && isHeel(item) && hasNonHeels) return false;
        if (isDressy && isSneaker(item) && hasNonSneakers) return false;
      }
      if (category === "Dresses") {
        if (isSporty) return false;
      }
      if (category === "Tops") {
        const hasNonSleeveless = items.filter(t => !isSleeveless(t)).length > 0;
        const hasNonLongSleeve = items.filter(t => !isLongSleeve(t)).length > 0;
        if (isCold && isSleeveless(item) && hasNonSleeveless) return false;
        if (isHot && isLongSleeve(item) && hasNonLongSleeve) return false;
      }
      return true;
    });
  };

  const byCategory = cat => closet.filter(c => c.category === cat);
  const allTops = byCategory("Tops");
  const allBottoms = byCategory("Bottoms");
  const allDresses = byCategory("Dresses");
  const allShoes = byCategory("Shoes");
  const allOuterwear = byCategory("Outerwear");
  const allAccessories = byCategory("Accessories");

  const tops = filterItems(allTops, "Tops").length > 0 ? filterItems(allTops, "Tops") : allTops;
  const bottoms = allBottoms;
  const dresses = filterItems(allDresses, "Dresses");
  const shoes = filterItems(allShoes, "Shoes").length > 0 ? filterItems(allShoes, "Shoes") : allShoes;
  const outerwear = allOuterwear;
  const accessories = allAccessories;

  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
  const sTops = shuffle(tops);
  const sBottoms = shuffle(bottoms);
  const sShoes = shuffle(shoes);
  const sDresses = shuffle(dresses);
  const sOuterwear = shuffle(outerwear);
  const sAccessories = shuffle(accessories);

  const outfitCombinations = [];

  for (let i = 0; i < 3; i++) {
    const items = [];
    const usedIds = new Set();
    const add = item => { if (item && !usedIds.has(item.id)) { items.push(item); usedIds.add(item.id); } };

    const useDress = !isSporty && i === 0 && sDresses.length > 0;

    if (useDress) {
      add(sDresses[0]);
    } else {
      add(sTops[i % sTops.length]);
      add(sBottoms[i % sBottoms.length]);
    }

    if ((isCold || isRainy) && sOuterwear.length > 0) {
      add(sOuterwear[i % sOuterwear.length]);
    }

    add(sShoes[i % sShoes.length]);

    if (sAccessories.length > 0) {
      add(sAccessories[i % sAccessories.length]);
    }

    if (items.length > 0) outfitCombinations.push(items);
  }

  const styleInfo = [
    profile.styles.length > 0 ? `Style: ${profile.styles.join(", ")}` : null,
    profile.colors.length > 0 ? `Favourite colors: ${profile.colors.join(", ")}` : null,
    profile.dislikes ? `Dislikes: ${profile.dislikes}` : null
  ].filter(Boolean).join(" | ") || "No style profile yet";

  const pastLearnings = learnings.slice(-8).join("\n");

  const outfitList = outfitCombinations.map((items, i) =>
    `Outfit ${i+1}: ${items.map(it => [it.color, it.name, it.description].filter(Boolean).join(" ")).join(" + ")}`
  ).join("\n");

  const prompt = `You are Clozie, a personal AI stylist. I have selected the items for 3 outfits. Give each a creative name, vibe word, and warm description.

Person's style: ${styleInfo}
Weather: ${weather} | Occasion: ${occasion}${context.extraNote ? ` | Note: "${context.extraNote}"` : ""}
${pastLearnings ? `Past preferences:\n${pastLearnings}` : ""}

${outfitList}

For each outfit give:
- A creative stylish name
- One vibe word (Chic, Bold, Relaxed, Elegant, Sporty, Fresh, Romantic, Polished, Effortless, Edgy)
- A warm 1-2 sentence description of why these pieces work together

Respond ONLY with valid JSON:
{"outfits":[{"name":"","vibe":"","items":[],"description":""},{"name":"","vibe":"","items":[],"description":""},{"name":"","vibe":"","items":[],"description":""}]}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return outfitCombinations.map((itemObjects, i) => {
      const ai = parsed.outfits?.[i] || {};
      return {
        id: Date.now() + i,
        name: ai.name || ["Today's Look","Fresh Pick","Style Edit"][i] || "Outfit "+(i+1),
        vibe: ai.vibe || ["Chic","Relaxed","Bold"][i] || "Stylish",
        items: itemObjects.map(it => [it.color, it.name, it.description].filter(Boolean).join(" ")),
        itemObjects,
        description: ai.description || "A perfect look for "+occasion+" in "+weather+" weather."
      };
    });

  } catch(e) {
    console.error("AI naming failed, using defaults:", e);
    return outfitCombinations.map((itemObjects, i) => ({
      id: Date.now() + i,
      name: ["Today's Look","Fresh Pick","Style Edit"][i] || "Outfit "+(i+1),
      vibe: ["Chic","Relaxed","Bold"][i] || "Stylish",
      items: itemObjects.map(it => [it.color, it.name, it.description].filter(Boolean).join(" ")),
      itemObjects,
      description: "A perfect look for "+occasion+" in "+weather+" weather."
    }));
  }
}

// ── PEEK INSIDE SCREEN ───────────────────────────────────────────────────────
function PeekInside({onSignup, onLogin}) {
  const steps = [
    {
      icon: "📸",
      title: "Snap & Add Your Clothes",
      desc: "Take a photo of any item — AI instantly fills in all the details. Your wardrobe is ready in minutes.",
      visual: (
        <div style={{background:CARD,borderRadius:12,padding:14,border:"1px solid "+BORDER}}>
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
            <div style={{width:56,height:56,borderRadius:10,background:"#1A1815",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>👗</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'DM Mono'",fontSize:10,color:G,marginBottom:3}}>AI DETECTED ✦</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,color:"#EDE5D8"}}>Navy Blue Wrap Dress</div>
              <div style={{fontFamily:"'DM Mono'",fontSize:10,color:"#666",marginTop:2}}>Dresses · Navy blue · Midi length</div>
            </div>
            <div style={{width:20,height:20,borderRadius:"50%",background:"#1A3A1A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>✅</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            {["👗 Tops · 3","👖 Bottoms · 2","👠 Shoes · 3"].map((t,i)=>(
              <div key={i} style={{flex:1,padding:"5px 4px",background:BG,borderRadius:8,fontFamily:"'DM Mono'",fontSize:9,color:"#666",textAlign:"center"}}>{t}</div>
            ))}
          </div>
        </div>
      )
    },
    {
      icon: "🌤",
      title: "Tell Clozie Your Day",
      desc: "Pick the weather and your occasion. Heading to work? Date night? Weekend errands? Clozie styles you perfectly for the moment.",
      visual: (
        <div style={{background:CARD,borderRadius:12,padding:14,border:"1px solid "+BORDER}}>
          <div style={{fontFamily:"'DM Mono'",fontSize:9,color:G,letterSpacing:"0.12em",marginBottom:10}}>TODAY'S VIBE</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
            {["Sunny & Hot","Warm & Breezy","Cold & Dry"].map((w,i)=>(
              <div key={i} style={{padding:"5px 12px",borderRadius:100,fontFamily:"'DM Mono'",fontSize:10,background:i===0?G:"transparent",color:i===0?BG:"#555",border:"1px solid "+(i===0?G:BORDER)}}>{w}</div>
            ))}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {["Date Night","Casual Day","Work / Office"].map((o,i)=>(
              <div key={i} style={{padding:"5px 12px",borderRadius:100,fontFamily:"'DM Mono'",fontSize:10,background:i===0?G+"20":"transparent",color:i===0?G:"#555",border:"1px solid "+(i===0?G+"60":BORDER)}}>{o}</div>
            ))}
          </div>
        </div>
      )
    },
    {
      icon: "✨",
      title: "Get 3 Perfect Outfits",
      desc: "Clozie creates 3 styled outfits from YOUR actual clothes. See them in a mood board or on the mannequin. Rate them and Clozie learns your taste.",
      visual: (
        <div style={{background:CARD,borderRadius:12,padding:14,border:"1px solid #C9A96E40"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <div style={{fontFamily:"'DM Mono'",fontSize:9,color:G,letterSpacing:"0.15em"}}>ROMANTIC</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:16,color:"#EDE5D8"}}>Evening Glow</div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <div style={{padding:"4px 8px",background:"#1A1512",borderRadius:8,fontFamily:"'DM Mono'",fontSize:9,color:G,border:"1px solid "+BORDER}}>🖼 Mood Board</div>
              <div style={{padding:"4px 8px",background:G+"20",borderRadius:8,fontFamily:"'DM Mono'",fontSize:9,color:G,border:"1px solid "+G+"60"}}>✦ On Body</div>
            </div>
          </div>
          <div style={{display:"flex",gap:6}}>
            {["Navy Wrap Dress","Brown Flats","Gold Earrings"].map((item,i)=>(
              <div key={i} style={{flex:1,padding:"5px 4px",background:BG,borderRadius:8,fontFamily:"'DM Mono'",fontSize:9,color:"#8A7A68",textAlign:"center",border:"1px solid "+BORDER}}>{item}</div>
            ))}
          </div>
          <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:11,color:"#7A6A58",marginTop:8,lineHeight:1.5}}>
            "The wrap silhouette is perfect for date night — elegant and effortless."
          </div>
        </div>
      )
    }
  ];

  const [active, setActive] = useState(0);
  const s = steps[active];

  return (
    <div style={{minHeight:"100vh",background:BG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px"}}>
      <style>{css}</style>
      <div style={{width:"100%",maxWidth:400}} className="fade">

        {/* Header */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <Logo/>
          <div style={{fontFamily:"'DM Mono'",fontSize:10,color:G,letterSpacing:"0.2em",marginTop:12}}>✦ HERE'S HOW IT WORKS ✦</div>
        </div>

        {/* Step tabs */}
        <div style={{display:"flex",gap:6,marginBottom:20}}>
          {steps.map((_,i)=>(
            <button key={i} onClick={()=>setActive(i)} style={{
              flex:1,padding:"10px 4px",borderRadius:10,border:"1px solid "+(active===i?G:BORDER),
              background:active===i?G+"15":CARD,cursor:"pointer",
              fontFamily:"'DM Mono'",fontSize:10,
              color:active===i?G:"#444",
              transition:"all 0.2s",
            }}>
              <div style={{fontSize:18,marginBottom:3}}>{steps[i].icon}</div>
              <div style={{fontSize:9,letterSpacing:"0.04em"}}>STEP {i+1}</div>
            </button>
          ))}
        </div>

        {/* Active step */}
        <div className="card" style={{padding:20,marginBottom:16,borderColor:G+"30"}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontWeight:300,fontSize:22,color:"#EDE5D8",marginBottom:8}}>{s.title}</div>
          <div style={{fontFamily:"'DM Mono'",fontSize:11,color:"#6A6058",lineHeight:1.8,marginBottom:16}}>{s.desc}</div>
          {s.visual}
        </div>

        {/* Step dots */}
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:24}}>
          {steps.map((_,i)=>(
            <div key={i} onClick={()=>setActive(i)} style={{width:i===active?24:8,height:8,borderRadius:100,background:i===active?G:"#252320",transition:"all 0.3s",cursor:"pointer"}}/>
          ))}
        </div>

        {/* CTA */}
        <GBtn onClick={onSignup} style={{marginBottom:12}}>
          ✦ Start Styling — It's Free
        </GBtn>
        <div style={{textAlign:"center",fontFamily:"'DM Mono'",fontSize:12,color:"#444"}}>
          Already have an account?{" "}
          <span onClick={onLogin} style={{color:G,cursor:"pointer"}}>Sign in</span>
        </div>

      </div>
    </div>
  );
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
        <button onClick={onSignup} style={{padding:"18px 64px",background:G,color:BG,borderRadius:100,fontSize:16,fontFamily:"'Playfair Display',serif",border:"none",cursor:"pointer",display:"block",margin:"0 auto 14px"}}>
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
  const accessories = allItems.filter(i=>i.category==="Accessories");

  const [bg, setBg] = useState("#F5F2EE");
  const bgOptions = [
    {color:"#F5F2EE",label:"Cream"},
    {color:"#FFFFFF",label:"White"},
    {color:"#F0F0F0",label:"Grey"},
    {color:"#0D0C0A",label:"Dark"},
    {color:"#E8F0E8",label:"Sage"},
  ];

  return (
    <div style={{background:bg,padding:"16px",transition:"background 0.3s"}}>
      {/* Background picker */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,justifyContent:"center"}}>
        <span style={{fontFamily:"'DM Mono'",fontSize:9,color:"#999",letterSpacing:"0.1em"}}>BACKGROUND</span>
        {bgOptions.map(o=>(
          <div key={o.color} onClick={()=>setBg(o.color)} style={{width:20,height:20,borderRadius:"50%",background:o.color,border:"2px solid "+(bg===o.color?"#C9A96E":"#ccc"),cursor:"pointer",transition:"border 0.15s",boxShadow:"0 1px 4px #00000020"}}/>
        ))}
      </div>

      {allItems.filter(i=>i.image).length === 0 ? (
        <div style={{padding:"40px 0",textAlign:"center"}}>
          <div style={{fontSize:44,marginBottom:12}}>👗</div>
          <div style={{fontFamily:"'DM Mono'",fontSize:11,color:"#999"}}>Add photos to your closet items to see them here</div>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>

          {/* TOP or DRESS — large */}
          {top && (
            <div style={{width:"70%"}}>
              <div style={{width:"100%",height:200,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:12,overflow:"hidden"}}>
                {top.image
                  ? <img src={top.image} alt={top.name} style={{width:"100%",height:"100%",objectFit:"contain"}}/>
                  : <div style={{fontSize:48,opacity:0.2}}>👕</div>
                }
              </div>
            </div>
          )}

          {/* BOTTOM — large, directly below top */}
          {bottom && (
            <div style={{width:"70%"}}>
              <div style={{width:"100%",height:200,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:12,overflow:"hidden"}}>
                {bottom.image
                  ? <img src={bottom.image} alt={bottom.name} style={{width:"100%",height:"100%",objectFit:"contain"}}/>
                  : <div style={{fontSize:48,opacity:0.2}}>👖</div>
                }
              </div>
            </div>
          )}

          {/* SHOES + ACCESSORIES — small, side by side in a row */}
          {(shoes || accessories.length > 0) && (
            <div style={{display:"flex",justifyContent:"center",gap:6,width:"100%",marginTop:2}}>
              {shoes && (
                <div style={{width:90,height:90,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:10,overflow:"hidden"}}>
                  {shoes.image
                    ? <img src={shoes.image} alt={shoes.name} style={{width:"100%",height:"100%",objectFit:"contain"}}/>
                    : <div style={{fontSize:28,opacity:0.2}}>👟</div>
                  }
                </div>
              )}
              {accessories.map((acc,i)=>(
                <div key={i} style={{width:90,height:90,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:10,overflow:"hidden"}}>
                  {acc.image
                    ? <img src={acc.image} alt={acc.name} style={{width:"100%",height:"100%",objectFit:"contain"}}/>
                    : <div style={{fontSize:28,opacity:0.2}}>✨</div>
                  }
                </div>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}

// ── IMPROVED MoodBoard with obvious tabs ──────────────────────────────────────
function MoodBoard({outfit, onClose}) {
  const [view, setView] = useState("moodboard");
  const items = outfit.itemObjects || [];
  const withPhoto = items.filter(it => it && it.image);

  const tabs = [
    { id: "moodboard", icon: "🖼", label: "Mood Board", sub: "Photos side by side" },
    { id: "avatar",    icon: "✦",  label: "On Body",    sub: "Styled on mannequin" },
  ];

  return (
    <div style={{position:"fixed",inset:0,background:"#000000EE",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}} onClick={onClose}>
      <div style={{background:"#F5F0E8",borderRadius:20,width:"100%",maxWidth:460,position:"relative",boxShadow:"0 32px 80px #000000AA"}} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{background:BG,padding:"18px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",borderRadius:"20px 20px 0 0"}}>
          <div>
            <div style={{fontFamily:"'DM Mono'",fontSize:9,color:G,letterSpacing:"0.15em"}}>{(outfit.vibe||"OUTFIT").toUpperCase()}</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontWeight:300,fontSize:20,color:"#EDE5D8"}}>{outfit.name}</div>
          </div>
          <button onClick={onClose} style={{background:"#1A1815",border:"1px solid "+BORDER,borderRadius:10,color:"#888",fontFamily:"'DM Mono'",fontSize:11,padding:"7px 14px",cursor:"pointer",transition:"all 0.15s"}}>✕ Close</button>
        </div>

        {/* ── TAB SWITCHER — big, bold, impossible to miss ── */}
        <div style={{background:BG,padding:"14px 16px 0",borderBottom:"2px solid "+BORDER}}>
          <div style={{display:"flex",gap:8}}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                style={{
                  flex: 1,
                  padding: "12px 8px 14px",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "10px 10px 0 0",
                  background: view === tab.id ? "#F5F0E8" : "#111009",
                  borderTop: "2px solid " + (view === tab.id ? G : "transparent"),
                  borderLeft: "1px solid " + (view === tab.id ? BORDER : "transparent"),
                  borderRight: "1px solid " + (view === tab.id ? BORDER : "transparent"),
                  transition: "all 0.2s",
                  position: "relative",
                  marginBottom: view === tab.id ? "-2px" : "0",
                }}
              >
                <div style={{
                  fontSize: 20,
                  marginBottom: 4,
                  filter: view === tab.id ? "none" : "grayscale(1) opacity(0.4)"
                }}>
                  {tab.icon}
                </div>
                <div style={{
                  fontFamily: "'DM Mono'",
                  fontSize: 11,
                  fontWeight: view === tab.id ? "bold" : "normal",
                  color: view === tab.id ? "#1A1612" : "#555",
                  letterSpacing: "0.04em",
                  marginBottom: 2,
                }}>
                  {tab.label}
                </div>
                <div style={{
                  fontFamily: "'DM Mono'",
                  fontSize: 9,
                  color: view === tab.id ? "#8A7A68" : "#333",
                  letterSpacing: "0.02em",
                }}>
                  {tab.sub}
                </div>
                {view === tab.id && (
                  <div style={{
                    position: "absolute",
                    top: -2,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 32,
                    height: 2,
                    background: G,
                    borderRadius: 2,
                  }}/>
                )}
              </button>
            ))}
          </div>
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

        {/* Avatar / On Body view */}
        {view==="avatar"&&<AvatarView outfit={outfit}/>}

        {/* Items list footer */}
        <div style={{background:BG,padding:"14px 20px",borderRadius:"0 0 20px 20px"}}>
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
                  {true ? (
                    <div style={{display:"flex",gap:8,padding:"10px 10px 0",background:CARD,position:"relative"}}>
                      {(o.itemObjects||[]).filter(it=>it&&it.image).slice(0,4).map((item,j)=>(
                        <div key={j} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                          <div style={{width:"100%",height:120,borderRadius:6,background:"#F5F2EE",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}><img src={item.image} alt={item.name} style={{width:"100%",height:"100%",objectFit:"contain"}}/></div>
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
  // AI photo recognition state
  const [aiScanning,setAiScanning]=useState(false);
  const [aiScanResult,setAiScanResult]=useState(null);
  const fileRef=useRef();
  const cameraRef=useRef();

  const toggle=(key,val)=>setProfile(p=>({...p,[key]:p[key].includes(val)?p[key].filter(x=>x!==val):[...p[key],val]}));

  // ── handleImg: shows photo instantly, then AI scans ──────────────────────
  const handleImg = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    // Reset input so same file can be re-selected if needed
    e.target.value = "";
    const r = new FileReader();
    r.onload = (ev) => {
      const imageData = ev.target.result;
      // Show photo immediately while background removal + AI runs
      setNewItem(p => ({...p, image: imageData}));
      setAiScanning(true);
      setAiScanResult(null);
      // Remove background first, then AI scan
      removeBackground(imageData).then(cleanImage => {
        setNewItem(p => ({...p, image: cleanImage}));
        return analyseClothingPhoto(cleanImage).then(result => {
          if (result) {
            setAiScanResult(result);
            setNewItem(p => ({
              ...p,
              image: cleanImage,
              name: result.name || p.name,
              category: result.category || p.category,
              color: result.color || p.color,
              description: result.description || p.description,
            }));
          }
        });
      }).catch(err => {
        console.error("Photo processing failed:", err);
      }).finally(() => {
        setAiScanning(false);
      });
    };
    r.readAsDataURL(f);
  };

  const addItem=()=>{
    if(!newItem.name.trim()) return;
    setCloset(p=>[...p,{...newItem,id:Date.now()}]);
    setNewItem({name:"",category:"Tops",color:"",description:""});
    setAiScanResult(null);
    setAddingItem(false);
  };

  const doGenerate=async()=>{
    setLoading(true);
    setOutfits([]);
    setFeedback({});
    setStep("outfits");
    try {
      const generated = await makeOutfitsAI(closet, context, profile, learnings);
      setOutfits(generated);
    } catch(e) {
      setOutfits(makeOutfitsFallback(closet, context));
    }
    setLoading(false);
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
                    {item.image&&<div style={{width:"100%",height:140,borderRadius:8,marginBottom:10,background:"#F5F2EE",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}><img src={item.image} alt={item.name} style={{width:"100%",height:"100%",objectFit:"contain"}}/></div>}
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

                  {/* ── AI PHOTO UPLOAD — camera + gallery options ── */}
                  <div style={{
                    border: "2px dashed " + (newItem.image ? G : BORDER),
                    borderRadius: 12,
                    overflow: "hidden",
                    transition: "border-color 0.2s",
                    position: "relative",
                  }}>
                    {/* State: no photo yet, not scanning */}
                    {!newItem.image && !aiScanning && (
                      <div style={{padding:"20px 16px"}}>
                        <div style={{textAlign:"center",marginBottom:14}}>
                          <div style={{fontSize:32,marginBottom:6}}>📷</div>
                          <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:15,color:"#EDE5D8",marginBottom:3}}>Add a Photo</div>
                          <div style={{fontFamily:"'DM Mono'",fontSize:10,color:G,letterSpacing:"0.06em"}}>✦ AI fills in all details automatically</div>
                        </div>
                        {/* Two clear buttons */}
                        <div style={{display:"flex",gap:8}}>
                          <button
                            onClick={()=>cameraRef.current.click()}
                            style={{flex:1,padding:"10px 8px",background:"#111009",border:"1px solid "+BORDER,borderRadius:9,cursor:"pointer",fontFamily:"'DM Mono'",fontSize:11,color:"#AAA",display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"all 0.18s"}}
                          >
                            <span style={{fontSize:18}}>📸</span>
                            <span>Take Photo</span>
                          </button>
                          <button
                            onClick={()=>fileRef.current.click()}
                            style={{flex:1,padding:"10px 8px",background:"#111009",border:"1px solid "+BORDER,borderRadius:9,cursor:"pointer",fontFamily:"'DM Mono'",fontSize:11,color:"#AAA",display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"all 0.18s"}}
                          >
                            <span style={{fontSize:18}}>🖼</span>
                            <span>Upload File</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* State: scanning but photo not loaded yet */}
                    {!newItem.image && aiScanning && (
                      <div style={{textAlign:"center",padding:"28px 16px"}}>
                        <div className="spin" style={{fontSize:28,color:G,display:"block",margin:"0 auto 12px"}}>✦</div>
                        <div style={{fontFamily:"'DM Mono'",fontSize:11,color:G,letterSpacing:"0.08em"}} className="pulse">AI IS READING YOUR ITEM...</div>
                        <div style={{fontFamily:"'DM Mono'",fontSize:10,color:"#444",marginTop:6}}>Detecting category, color & style</div>
                      </div>
                    )}

                    {/* State: photo loaded */}
                    {newItem.image && (
                      <div>
                        <img src={newItem.image} alt="preview" style={{width:"100%",maxHeight:220,objectFit:"contain",background:"#F5F2EE",display:"block"}}/>
                        {aiScanning && (
                          <div className="ai-scanning" style={{padding:"10px 14px",textAlign:"center"}}>
                            <span className="spin" style={{fontSize:14,color:G}}>✦</span>
                            <span style={{fontFamily:"'DM Mono'",fontSize:10,color:G,marginLeft:8,letterSpacing:"0.06em"}} className="pulse">AI SCANNING YOUR ITEM...</span>
                          </div>
                        )}
                        {aiScanResult && !aiScanning && (
                          <div style={{padding:"10px 14px",background:"#0A1A0A",borderTop:"1px solid #1A3A1A",display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontSize:14}}>✅</span>
                            <span style={{fontFamily:"'DM Mono'",fontSize:10,color:"#5BA85A",letterSpacing:"0.04em"}}>AI filled in your details — check and edit below!</span>
                          </div>
                        )}
                        {!aiScanning && !aiScanResult && (
                          <div style={{padding:"8px 12px",background:"#111009",display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontFamily:"'DM Mono'",fontSize:10,color:"#555"}}>No AI key — fill in details manually below</span>
                          </div>
                        )}
                        <div style={{padding:"6px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#0D0C0A"}}>
                          <span style={{fontFamily:"'DM Mono'",fontSize:10,color:G}}>✓ Photo ready</span>
                          <button onClick={e=>{e.stopPropagation();setNewItem(p=>({...p,image:null}));setAiScanResult(null);setAiScanning(false);}} style={{background:"none",border:"none",color:"#666",fontSize:12,cursor:"pointer",fontFamily:"'DM Mono'"}}>Remove ×</button>
                        </div>
                      </div>
                    )}

                    {/* Hidden inputs — camera and gallery */}
                    <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handleImg}/>
                    <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImg}/>
                  </div>

                  {/* Photo tip — shown when no photo yet */}
                  {!newItem.image && (
                    <div style={{display:"flex",alignItems:"flex-start",gap:6,padding:"8px 10px",background:"#0D0C0A",borderRadius:8,border:"1px solid #1E1C18"}}>
                      <span style={{color:G,fontSize:12,flexShrink:0}}>💡</span>
                      <span style={{fontFamily:"'DM Mono'",fontSize:10,color:"#555",lineHeight:1.7}}>Best results: photograph on a <span style={{color:G}}>white or light background</span> — AI reads colors more accurately.</span>
                    </div>
                  )}

                  {/* Fields — always shown, AI fills them in */}
                  <input className="inp" placeholder="Name * (e.g. White linen shirt)" value={newItem.name} onChange={e=>setNewItem(p=>({...p,name:e.target.value}))}
                    style={{borderColor: aiScanResult && newItem.name ? G+"60" : undefined}}/>
                  <select className="inp" value={newItem.category} onChange={e=>setNewItem(p=>({...p,category:e.target.value}))}>
                    {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                  <input className="inp" placeholder="Colour / pattern (e.g. navy blue)" value={newItem.color} onChange={e=>setNewItem(p=>({...p,color:e.target.value}))}
                    style={{borderColor: aiScanResult && newItem.color ? G+"60" : undefined}}/>
                  <input className="inp" placeholder="Notes — fit, fabric (optional)" value={newItem.description} onChange={e=>setNewItem(p=>({...p,description:e.target.value}))}
                    style={{borderColor: aiScanResult && newItem.description ? G+"60" : undefined}}/>

                  <div style={{display:"flex",gap:8,marginTop:4}}>
                    <GBtn onClick={addItem} disabled={!newItem.name.trim()||aiScanning} style={{padding:12,fontSize:15}}>
                      {aiScanning ? "Scanning..." : "Add to Closet"}
                    </GBtn>
                    <button onClick={()=>{setAddingItem(false);setAiScanResult(null);}} style={{padding:"12px 20px",background:"#111009",color:"#777",border:"1px solid "+BORDER,borderRadius:10,fontFamily:"'DM Mono'",fontSize:11,cursor:"pointer"}}>Cancel</button>
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
                          <div style={{width:"100%",height:140,borderRadius:8,background:"#F5F2EE",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}><img src={item.image} alt={item.name} style={{width:"100%",height:"100%",objectFit:"contain"}}/></div>
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
  const savedUser = (() => { try { const u=localStorage.getItem("clozie-user"); return u?JSON.parse(u):null; } catch(e){return null;} })();
  const [page,setPage]=useState(savedUser?"app":"splash");
  const [user,setUser]=useState(savedUser||null);
  const [forgotSent,setForgotSent]=useState(false);

  const [closet,setCloset]=useState([]);
  const [profile,setProfile]=useState({styles:[],colors:[],dislikes:""});
  const [learnings,setLearnings]=useState([]);
  const [favOutfits,setFavOutfits]=useState([]);
  const [saveStatus,setSaveStatus]=useState("");
  const [ready,setReady]=useState(false);

  useEffect(()=>{
    (async()=>{
      const uid = user?.email || null;
      const sc=await loadCloset(uid);
      const sp=await storageGet("clozie-profile", uid);
      const sl=await storageGet("clozie-learnings", uid);
      const sf=await storageGet("clozie-favs", uid);
      if(sc&&Array.isArray(sc)) setCloset(sc);
      if(sp&&sp.styles) setProfile(sp);
      if(sl&&Array.isArray(sl)) setLearnings(sl);
      if(sf&&Array.isArray(sf)) setFavOutfits(sf);
      setReady(true);
    })();
  },[]);

  useEffect(()=>{
    if(!ready) return;
    const uid = user?.email || null;
    (async()=>{
      const ok1=await saveCloset(closet, uid);
      const favsToSave=favOutfits.map(o=>({
        id:o.id,name:o.name,vibe:o.vibe,
        items:o.items||[],description:o.description||"",
        itemObjects:(o.itemObjects||[]).map(it=>({name:it.name,image:it.image||null,category:it.category||""}))
      }));
      const ok2=await storageSet("clozie-profile",profile, uid);
      await storageSet("clozie-learnings",learnings, uid);
      await storageSet("clozie-favs",favsToSave, uid);
      setSaveStatus(ok1&&ok2?"saved":"error");
      setTimeout(()=>setSaveStatus(""),2000);
    })();
  },[closet,profile,learnings,favOutfits,ready]);

  const handleAuth=({email,name,mode})=>{
    if(mode==="forgot"){ setForgotSent(true); return; }
    const isVip = VIP_EMAILS.includes(email.trim().toLowerCase());
    const u = {email,name:name||email.split("@")[0],pro:isVip,vip:isVip};
    try { localStorage.setItem("clozie-user", JSON.stringify(u)); } catch(e){}
    setUser(u);
    setPage("app");
  };

  const sharedProps={closet,setCloset,profile,setProfile,learnings,setLearnings,favOutfits,setFavOutfits,saveStatus};

  if(!user) {
    if(page==="splash") return <Splash onDone={()=>setPage("onboarding")}/>;
    if(page==="onboarding") return <Onboarding onDone={()=>setPage("welcome")}/>;
    if(page==="peek") return <PeekInside onSignup={()=>setPage("signup")} onLogin={()=>setPage("login")}/>;
    if(page==="signup") return <AuthPage mode="signup" onDone={handleAuth} onSwitch={()=>setPage("login")} onForgot={()=>setPage("forgot")}/> ;
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
    return <Welcome onLogin={()=>setPage("login")} onSignup={()=>setPage("peek")}/>;
  }

  return (
    <div>
      <MainApp
        user={user}
        onLogout={()=>{try{localStorage.removeItem("clozie-user");}catch(e){}setUser(null);setPage("welcome");}}
        onSettings={()=>setPage("settings")}
        onSubscription={()=>setPage("subscription")}
        {...sharedProps}
      />
      {page==="settings"&&(
        <div style={{position:"fixed",inset:0,zIndex:500,overflowY:"auto",background:BG}}>
          <Settings user={user} onBack={()=>setPage("app")} onLogout={()=>{try{localStorage.removeItem("clozie-user");}catch(e){}setUser(null);setPage("welcome");}} onSubscription={()=>setPage("subscription")}/>
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
