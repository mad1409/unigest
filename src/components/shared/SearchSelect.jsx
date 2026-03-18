
import React, { useState, useEffect, useRef } from "react";

/**
 * SearchSelect — select avec barre de recherche intégrée
 * Props:
 *   value        — valeur sélectionnée
 *   onChange     — fonction(value)
 *   options      — [{value, label, sub?}]
 *   placeholder  — texte placeholder
 *   allLabel     — label pour "tout" (optionnel)
 *   style        — style supplémentaire sur le container
 *   color        — couleur accent (défaut #38bdf8)
 */
export default function SearchSelect({
  value, onChange, options = [], placeholder = "Rechercher...",
  allLabel = null, style = {}, color = "#38bdf8"
}) {
  const [open,   setOpen]   = useState(false);
  const [query,  setQuery]  = useState("");
  const [active, setActive] = useState(-1);
  const ref    = useRef();
  const inputRef = useRef();

  // Fermer si clic extérieur
  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Focus input à l'ouverture
  useEffect(() => {
    if (open && inputRef.current) { inputRef.current.focus(); setQuery(""); setActive(-1); }
  }, [open]);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(query.toLowerCase()) ||
    (o.sub||"").toLowerCase().includes(query.toLowerCase())
  );

  const selected = allLabel && (value === "all" || value === "" || value === null || value === undefined)
    ? null
    : options.find(o => String(o.value) === String(value));

  function select(v) { onChange(v); setOpen(false); setQuery(""); }

  function handleKey(e) {
    if (!open) { if (e.key === "Enter" || e.key === " ") setOpen(true); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a+1, filtered.length-1+(allLabel?1:0))); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive(a => Math.max(a-1, 0)); }
    if (e.key === "Enter") {
      e.preventDefault();
      if (active === 0 && allLabel) select("all");
      else if (active > 0 || (!allLabel && active >= 0)) select(filtered[allLabel ? active-1 : active]?.value);
    }
    if (e.key === "Escape") setOpen(false);
  }

  const triggerStyle = {
    background:"rgba(255,255,255,0.05)", border:"1px solid var(--border, rgba(255,255,255,0.1))",
    borderRadius:8, padding:"9px 32px 9px 12px", color:"var(--text, #fff)",
    fontSize:13, cursor:"pointer", width:"100%", textAlign:"left",
    display:"flex", alignItems:"center", justifyContent:"space-between",
    outline:"none", boxSizing:"border-box", minHeight:38,
    ...style,
  };

  const dropStyle = {
    position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:9999,
    background:"var(--bg2, #111520)", border:"1px solid var(--border, rgba(255,255,255,0.1))",
    borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,0.5)",
    maxHeight:260, display:"flex", flexDirection:"column", overflow:"hidden",
  };

  const itemStyle = (i, isAll) => ({
    padding:"9px 14px", cursor:"pointer", flexShrink:0,
    background: active === i ? color+"18" : "transparent",
    borderBottom:"1px solid var(--border, rgba(255,255,255,0.06))",
    display:"flex", alignItems:"center", gap:10,
  });

  return (
    <div ref={ref} style={{position:"relative", width:"100%"}} onKeyDown={handleKey} tabIndex={0}>
      {/* Trigger */}
      <div onClick={()=>setOpen(o=>!o)} style={triggerStyle}>
        <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1,
          color: selected ? "var(--text, #fff)" : "var(--text3, #666)"}}>
          {selected ? selected.label : (allLabel || placeholder)}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{flexShrink:0, transition:"transform 0.2s", transform:open?"rotate(180deg)":"rotate(0)"}}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={dropStyle}>
          {/* Barre de recherche */}
          <div style={{padding:"8px 10px", borderBottom:"1px solid var(--border, rgba(255,255,255,0.1))", flexShrink:0}}>
            <div style={{position:"relative"}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text3,#666)" strokeWidth="2"
                style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)"}}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input ref={inputRef} value={query} onChange={e=>{setQuery(e.target.value);setActive(-1);}}
                placeholder={placeholder}
                style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.07)",
                  border:"1px solid var(--border,rgba(255,255,255,0.1))",borderRadius:6,
                  padding:"6px 8px 6px 28px",color:"var(--text,#fff)",fontSize:12,outline:"none"}}
              />
            </div>
          </div>

          {/* Options */}
          <div style={{overflowY:"auto"}}>
            {allLabel && (
              <div onMouseDown={()=>select("all")} onMouseEnter={()=>setActive(0)}
                style={{...itemStyle(0,true), color:(!selected)?color:"var(--text2,#aaa)"}}>
                <div style={{fontSize:13,fontWeight:(!selected)?700:400}}>{allLabel}</div>
              </div>
            )}
            {filtered.length===0 ? (
              <div style={{padding:"20px",textAlign:"center",color:"var(--text3,#666)",fontSize:12}}>
                Aucun résultat pour "{query}"
              </div>
            ) : filtered.map((o,i)=>{
              const idx = allLabel ? i+1 : i;
              const isSelected = String(o.value) === String(value);
              return (
                <div key={o.value} onMouseDown={()=>select(o.value)} onMouseEnter={()=>setActive(idx)}
                  style={{...itemStyle(idx), background: isSelected ? color+"22" : active===idx ? color+"12" : "transparent"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:isSelected?700:400,color:isSelected?color:"var(--text,#fff)",
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.label}</div>
                    {o.sub && <div style={{fontSize:11,color:"var(--text3,#666)",marginTop:1}}>{o.sub}</div>}
                  </div>
                  {isSelected && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
