
import { useState } from "react";

export default function Layout({
  user, role, onLogout,
  navItems, activeTab, setActiveTab,
  children, data,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const colors = {
    admin:       "#f0c040",
    prof:        "#4f8ef7",
    etudiant:    "#34d399",
    secretaire:  "#34d399",
    surveillant: "#fb923c",
  };
  const labels = {
    admin:       "Administrateur",
    prof:        "Enseignant",
    etudiant:    "Etudiant",
    secretaire:  "Secretaire",
    surveillant: "Surveillant",
  };
  const color    = colors[role] || "#34d399";
  const label    = labels[role] || role;
  const logo     = data?.parametres?.logo;
  const nomEtab  = data?.parametres?.nomEtablissement || "UniGest";
  const initials = (user?.name||"").split(" ").map(p=>p[0]?.toUpperCase()||"").join("").slice(0,2);

  function handleNav(id) {
    setActiveTab(id);
    setMenuOpen(false);
  }

  const SidebarContent = () => (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      {/* Logo */}
      <div style={{marginBottom:28,paddingLeft:8}}>
        {logo
          ? <img src={logo} alt="Logo" style={{maxHeight:44,maxWidth:150,objectFit:"contain",borderRadius:6}}/>
          : <div style={{fontFamily:"'Lora',serif",fontSize:20,fontWeight:900,color:"#fff"}}>{nomEtab}</div>
        }
        <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:4,letterSpacing:1,textTransform:"uppercase"}}>
          Plateforme Universitaire
        </div>
      </div>

      {/* User card */}
      <div style={{
        background:color+"15",border:"1px solid "+color+"25",
        borderRadius:12,padding:"12px 14px",marginBottom:20,
        display:"flex",alignItems:"center",gap:10,
      }}>
        <div style={{
          width:36,height:36,borderRadius:"50%",
          background:color+"20",border:"2px solid "+color+"40",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:13,fontWeight:700,color,flexShrink:0,
        }}>{initials||"?"}</div>
        <div style={{minWidth:0}}>
          <div style={{fontSize:12,fontWeight:700,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {user?.name}
          </div>
          <div style={{fontSize:10,color,fontWeight:600,marginTop:1}}>{label}</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{flex:1,display:"flex",flexDirection:"column",gap:2,overflowY:"auto"}}>
        {navItems.map(item => {
          const active = activeTab === item.id;
          return (
            <button key={item.id} onClick={()=>handleNav(item.id)} style={{
              display:"flex",alignItems:"center",gap:10,
              padding:"11px 12px",borderRadius:10,
              background:active?color+"18":"transparent",
              border:active?"1px solid "+color+"30":"1px solid transparent",
              color:active?color:"rgba(255,255,255,0.5)",
              fontWeight:active?700:400,
              fontSize:13,cursor:"pointer",
              textAlign:"left",width:"100%",
              transition:"all 0.15s",
            }}>
              <span style={{flexShrink:0,color:active?color:"rgba(255,255,255,0.3)",display:"flex"}}>{item.icon}</span>
              <span style={{flex:1}}>{item.label}</span>
              {item.badge > 0 && (
                <span style={{
                  background:"#ef4444",color:"#fff",
                  borderRadius:"50%",width:18,height:18,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:10,fontWeight:900,flexShrink:0,
                }}>{item.badge > 9 ? "9+" : item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{marginTop:16,paddingTop:12,borderTop:"1px solid rgba(52,211,153,0.1)"}}>
        <button onClick={onLogout} style={{
          display:"flex",alignItems:"center",gap:10,
          padding:"10px 12px",borderRadius:10,
          background:"rgba(239,68,68,0.08)",
          border:"1px solid rgba(239,68,68,0.15)",
          color:"#ef4444",fontSize:13,fontWeight:600,
          cursor:"pointer",width:"100%",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Deconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",display:"flex",background:"transparent",position:"relative",zIndex:1}}>

      {/* ── SIDEBAR DESKTOP ── */}
      <aside style={{
        width:240,minWidth:240,
        background:"rgba(5,20,10,0.75)",
        backdropFilter:"blur(24px)",
        WebkitBackdropFilter:"blur(24px)",
        borderRight:"1px solid rgba(52,211,153,0.1)",
        boxShadow:"4px 0 24px rgba(0,0,0,0.4)",
        display:"flex",flexDirection:"column",
        padding:"24px 12px",
        height:"100vh",overflowY:"auto",
        position:"sticky",top:0,flexShrink:0,
      }} className="desktop-sidebar">
        <SidebarContent/>
      </aside>

      {/* ── HEADER MOBILE ── */}
      <div className="mobile-header" style={{
        display:"none",
        position:"fixed",top:0,left:0,right:0,
        background:"rgba(5,20,10,0.9)",
        backdropFilter:"blur(20px)",
        WebkitBackdropFilter:"blur(20px)",
        borderBottom:"1px solid rgba(52,211,153,0.1)",
        padding:"10px 16px",
        zIndex:100,
        alignItems:"center",justifyContent:"space-between",
      }}>
        {/* Logo mobile */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {logo
            ? <img src={logo} alt="Logo" style={{height:32,objectFit:"contain",borderRadius:4}}/>
            : <div style={{fontSize:16,fontWeight:900,color:"#fff"}}>{nomEtab}</div>
          }
        </div>
        {/* User + Hamburger */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{
            width:32,height:32,borderRadius:"50%",
            background:color+"20",border:"2px solid "+color+"40",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:12,fontWeight:700,color,
          }}>{initials}</div>
          <button onClick={()=>setMenuOpen(!menuOpen)} style={{
            background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",
            borderRadius:8,padding:"8px",cursor:"pointer",
            display:"flex",flexDirection:"column",gap:4,
          }}>
            <span style={{display:"block",width:18,height:2,background:menuOpen?"#ef4444":"#fff",borderRadius:2,transition:"all 0.2s",transform:menuOpen?"rotate(45deg) translate(4px,4px)":"none"}}/>
            <span style={{display:"block",width:18,height:2,background:menuOpen?"transparent":"#fff",borderRadius:2,transition:"all 0.2s"}}/>
            <span style={{display:"block",width:18,height:2,background:menuOpen?"#ef4444":"#fff",borderRadius:2,transition:"all 0.2s",transform:menuOpen?"rotate(-45deg) translate(4px,-4px)":"none"}}/>
          </button>
        </div>
      </div>

      {/* ── MENU MOBILE OVERLAY ── */}
      {menuOpen && (
        <div style={{
          position:"fixed",inset:0,zIndex:99,
          display:"flex",
        }}>
          {/* Backdrop */}
          <div onClick={()=>setMenuOpen(false)} style={{
            position:"absolute",inset:0,
            background:"rgba(0,0,0,0.7)",
            backdropFilter:"blur(4px)",
          }}/>
          {/* Menu */}
          <div style={{
            position:"relative",zIndex:1,
            width:280,height:"100%",
            background:"rgba(5,20,10,0.95)",
            backdropFilter:"blur(24px)",
            WebkitBackdropFilter:"blur(24px)",
            borderRight:"1px solid rgba(52,211,153,0.15)",
            padding:"80px 12px 24px",
            overflowY:"auto",
            boxShadow:"8px 0 32px rgba(0,0,0,0.5)",
          }}>
            <SidebarContent/>
          </div>
        </div>
      )}

      {/* ── MAIN ── */}
      <main style={{
        flex:1,overflowY:"auto",
        padding:"28px 24px",
        maxWidth:"100%",boxSizing:"border-box",
        animation:"fadeIn 0.3s ease",
        position:"relative",zIndex:1,
      }} className="main-content">
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-header { display: flex !important; }
          .main-content {
            padding: 80px 14px 24px !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
