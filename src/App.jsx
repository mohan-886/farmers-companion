import { useState } from 'react'
import { useCropData } from './useCropData'

const AREAS = ['< 1 Acre','1–2 Acres','2–5 Acres','5–10 Acres','10–20 Acres','20+ Acres']
const MULT  = {'< 1 Acre':0.5,'1–2 Acres':1.5,'2–5 Acres':3.5,'5–10 Acres':7.5,'10–20 Acres':15,'20+ Acres':25}
const MSP   = {Wheat:2275,Rice:2183,Maize:1962,Bajra:2350,Jowar:3180,Groundnut:6377,Soyabean:4600,Sugarcane:340,'Cotton(lint)':6620,Gram:5440,'Rapeseed &Mustard':5650,Sunflower:6400}
const LANGS = [{name:'English',native:'English'},{name:'Hindi',native:'हिंदी'},{name:'Odia',native:'ଓଡ଼ିଆ'},{name:'Telugu',native:'తెలుగు'}]
const serif = (sz,wt=700) => ({fontFamily:"'Lora',serif",         fontSize:sz, fontWeight:wt})
const sans  = (sz,wt=400) => ({fontFamily:"'Source Sans 3',sans-serif", fontSize:sz, fontWeight:wt})
const CARD  = {background:'rgba(255,255,255,0.82)',border:'1px solid rgba(180,130,50,0.2)',borderRadius:20,backdropFilter:'blur(12px)',boxShadow:'0 8px 40px rgba(100,60,10,0.1)'}
const BTVS  = {dark:{background:'#2a1608',color:'#f5e8d0'},red:{background:'#e63329',color:'white',boxShadow:'0 3px 12px rgba(230,51,41,0.35)'},outline:{background:'rgba(255,255,255,0.6)',color:'#6a4020',border:'1.5px solid #c8a060'}}

const Btn     = ({children,onClick,disabled,v='dark'}) => <button onClick={onClick} disabled={disabled} style={{...(disabled?{background:'#d8c0a0',color:'#a89070'}:BTVS[v]),border:'none',borderRadius:9,...sans(13,600),letterSpacing:'0.06em',padding:'14px 36px',cursor:disabled?'not-allowed':'pointer',display:'flex',alignItems:'center',gap:10}}>{children}</button>
const Sel     = ({value,onChange,placeholder,options}) => <div style={{position:'relative',width:'100%'}}><select value={value} onChange={e=>onChange(e.target.value)} style={{width:'100%',padding:'13px 40px 13px 16px',border:'1.5px solid rgba(160,100,30,0.3)',borderRadius:10,background:'rgba(255,255,255,0.8)',color:value?'#2a1608':'#a08050',...sans(15),appearance:'none',cursor:'pointer',outline:'none'}}><option value="">{placeholder}</option>{options.map(o=><option key={o} value={o}>{o}</option>)}</select><span style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:'#a08050'}}>▾</span></div>
const StatRow = ({label,value}) => <div style={{background:'rgba(245,220,185,0.5)',border:'1px solid rgba(180,130,50,0.15)',borderRadius:10,padding:'11px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={sans(12)}>{label}</span><span style={serif(14,600)}>{value}</span></div>
const Spin    = () => <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12}}><div style={{width:36,height:36,border:'3px solid rgba(160,100,30,0.2)',borderTop:'3px solid #c87820',borderRadius:'50%',animation:'spin 0.9s linear infinite'}}/><span style={{...sans(13),color:'#9a7040'}}>Loading CSV data...</span></div>

const MiniChart = ({data}) => {
  const v=data.map(d=>d.avgYield), mx=Math.max(...v), mn=Math.min(...v), r=mx-mn||1, w=100/(data.length-1)
  const pts = data.map((d,i)=>`${i*w},${100-((d.avgYield-mn)/r)*100}`).join(' ')
  return <div><svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{width:'100%',height:55}}><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6baa3a" stopOpacity="0.3"/><stop offset="100%" stopColor="#6baa3a" stopOpacity="0"/></linearGradient></defs><polygon points={`0,100 ${pts} 100,100`} fill="url(#g)"/><polyline points={pts} fill="none" stroke="#6baa3a" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>{data.map((d,i)=><circle key={i} cx={i*w} cy={100-((d.avgYield-mn)/r)*100} r="1.5" fill="#6baa3a" vectorEffect="non-scaling-stroke"/>)}</svg><div style={{display:'flex',justifyContent:'space-between',...sans(9),color:'#8a6840',marginTop:3}}>{data.map(d=><span key={d.year}>{d.year}</span>)}</div></div>
}

const LogoIcon = () => <div style={{width:46,height:46,borderRadius:'50%',background:'#e63329',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 10px rgba(230,51,41,0.4)',flexShrink:0}}><svg viewBox="0 0 40 40" width="30" height="30"><ellipse cx="20" cy="13" rx="10" ry="11" fill="#d4a876"/><ellipse cx="20" cy="9" rx="14" ry="6" fill="#c09030"/><rect x="14" y="7" width="12" height="8" rx="3" fill="#c09030"/><circle cx="16.5" cy="15" r="2" fill="#6a3818"/><circle cx="23.5" cy="15" r="2" fill="#6a3818"/><path d="M16.5 20 Q20 23 23.5 20" stroke="#6a3818" strokeWidth="1.4" fill="none" strokeLinecap="round"/><path d="M8 34 Q8 24 20 24 Q32 24 32 34Z" fill="#d4a876"/></svg></div>

export default function App() {
  const [screen, setScreen] = useState('login')
  const [f, setF] = useState({ state:'', land:'', crop:'', season:'', lang:'English' })
  const upd = k => v => setF(p => ({ ...p, [k]: v }))
  const { loading, error, allCrops, allStates, allSeasons, getYieldStats, getIrrigationStats } = useCropData()

  if (error) return <div style={{minHeight:'100vh',background:'#f5dfc8',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:10}}><span style={{fontSize:36}}>⚠️</span><p style={{...sans(14),fontFamily:'monospace',color:'#c03020'}}>CSV error: {error}</p><p style={{...sans(12),color:'#9a7040'}}>Put crop_yield.csv and irrigation.csv in <code>/public/data/</code></p></div>

  return (
    <div style={{minHeight:'100vh',background:'#f5dfc8',fontFamily:"'Lora',serif",display:'flex',flexDirection:'column',position:'relative',overflow:'hidden'}}>
      <img src="/Group_12.png" alt="farmer" style={{position:'fixed',bottom:0,left:0,height:'82%',zIndex:1,pointerEvents:'none',userSelect:'none'}}/>
      <nav style={{position:'relative',zIndex:20,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 48px',borderBottom:'1px solid rgba(160,110,40,0.18)',background:'rgba(245,223,200,0.8)',backdropFilter:'blur(12px)'}}>
        <button onClick={()=>setScreen('login')} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:12}}>
          <LogoIcon/><span style={{...serif(19),color:'#2a1a08'}}>Farmer's Companion</span>
        </button>
        <div style={{display:'flex',gap:34}}>
          {['About Us','Dashboard','Contact Us','Profile'].map(l=><button key={l} style={{background:'none',border:'none',...sans(15),color:'#5a3a18',cursor:'pointer'}}>{l}</button>)}
          <button onClick={()=>setScreen('language')} style={{background:'none',border:'none',...sans(15),color:'#5a3a18',cursor:'pointer'}}>Change Language</button>
        </div>
      </nav>
      <div style={{flex:1,position:'relative',zIndex:10,display:'flex',alignItems:'center',justifyContent:'center',padding:'40px 48px 60px'}}>

        {screen==='login' && <div style={{textAlign:'center'}}>
          <h1 style={{...serif(72),color:'#2a1608',marginBottom:8,letterSpacing:'-0.03em'}}>Hello!</h1>
          <p style={{...sans(16),color:'#8a6040',marginBottom:36}}>Your AI-powered crop intelligence platform</p>
          <div style={{display:'flex',flexDirection:'column',gap:14,alignItems:'center'}}>
            <Btn v="red" onClick={()=>setScreen('language')}><svg viewBox="0 0 20 20" width="18" height="18"><circle cx="10" cy="10" r="9" fill="white"/><text x="10" y="14.5" textAnchor="middle" fontSize="11" fill="#e63329" fontFamily="sans-serif" fontWeight="700">G</text></svg>Continue with Google</Btn>
            <Btn v="outline" onClick={()=>setScreen('language')}>Continue with Phone</Btn>
          </div>
          <p style={{...sans(11),color:'#9a7848',marginTop:24,letterSpacing:'0.06em',textTransform:'uppercase'}}>By continuing, you agree to our Terms of Service</p>
        </div>}

        {screen==='language' && <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:28}}>
          <h2 style={{...serif(36),color:'#2a1608'}}>Select your language</h2>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,width:380}}>
            {LANGS.map(l=><button key={l.name} onClick={()=>upd('lang')(l.name)} style={{background:f.lang===l.name?'rgba(180,120,30,0.15)':'rgba(255,255,255,0.75)',border:`1.5px solid ${f.lang===l.name?'#b07820':'rgba(160,110,40,0.25)'}`,borderRadius:10,padding:'16px 18px',cursor:'pointer',textAlign:'left'}}><div style={{...sans(15,600),color:'#2a1608'}}>{l.name}</div><div style={{...sans(13),color:'#8a6040',marginTop:3}}>{l.native}</div></button>)}
          </div>
          <Btn onClick={()=>setScreen('location')}>Confirm Selection</Btn>
        </div>}

        {screen==='location' && <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:44}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14,width:360}}>
            <h2 style={{...serif(30),color:'#2a1608',textAlign:'center'}}>What's your location?</h2>
            {loading ? <Spin/> : <Sel value={f.state} onChange={upd('state')} placeholder="States & UTs" options={allStates}/>}
            <p style={{...sans(13),color:'#8a6040',textAlign:'center'}}>Select your current state or union territory</p>
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14,width:360}}>
            <h2 style={{...serif(30),color:'#2a1608',textAlign:'center'}}>What's the area of your land?</h2>
            <Sel value={f.land} onChange={upd('land')} placeholder="Area of land" options={AREAS}/>
            <p style={{...sans(13),color:'#8a6040',textAlign:'center'}}>Select the area you're planning to harvest</p>
          </div>
          <Btn onClick={()=>setScreen('predict')} disabled={!f.state||!f.land}>Continue →</Btn>
        </div>}

        {screen==='predict' && <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:'100%',maxWidth:600}}>
          <div style={{...CARD,padding:'40px 52px',width:'100%'}}>
            <h2 style={{...serif(30),color:'#2a1608',textAlign:'center',marginBottom:28}}>Yield Prediction</h2>
            {loading ? <div style={{display:'flex',justifyContent:'center',padding:'20px 0'}}><Spin/></div> : <>
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                <Sel value={f.crop}   onChange={upd('crop')}   placeholder="Choose your type of crop"  options={allCrops}/>
                <Sel value={f.season} onChange={upd('season')} placeholder="Select season (optional)"   options={['All',...allSeasons]}/>
              </div>
              <p style={{...sans(13),color:'#8a6040',textAlign:'center',marginTop:14}}>Select your desired crop to predict the quality of yield</p>
              <div style={{display:'flex',justifyContent:'center',marginTop:28}}><Btn onClick={()=>setScreen('results')} disabled={!f.crop}>Predict Yield →</Btn></div>
            </>}
          </div>
          <div style={{marginTop:14,padding:'9px 20px',background:'rgba(255,255,255,0.55)',border:'1px solid rgba(160,110,40,0.2)',borderRadius:100,...sans(12),color:'#8a6040'}}>
            📍 {f.state||'—'} &nbsp;·&nbsp; {f.land||'—'}
          </div>
        </div>}

        {screen==='results' && (()=>{
          const stats = getYieldStats({ crop:f.crop, state:f.state, season:f.season&&f.season!=='All'?f.season:null })
          const irrig = getIrrigationStats(f.state)
          const mult=MULT[f.land]||1, msp=MSP[f.crop]||2000
          if (!stats) return <div style={{textAlign:'center'}}><div style={{...CARD,padding:'44px 52px',maxWidth:500}}><div style={{fontSize:40,marginBottom:14}}>🌾</div><p style={{...serif(20),color:'#2a1608',marginBottom:8}}>No data found</p><p style={{...sans(13),color:'#8a6040',marginBottom:24}}>No records for <b>{f.crop}</b> in <b>{f.state}</b>. Try a different combo.</p><Btn onClick={()=>setScreen('predict')}>← Go Back</Btn></div></div>
          const totalYield=(stats.avgYield*mult).toFixed(2), estRevenue=Math.round((stats.avgYield*mult/1000)*msp)
          return <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:'100%',maxWidth:820}}>
            <div style={{...CARD,padding:'44px 52px',width:'100%'}}>
              <h2 style={{...serif(28),color:'#2a1608',textAlign:'center',marginBottom:4}}>Yield Prediction for <em style={{fontWeight:400,color:'#b86820'}}>{f.crop}</em></h2>
              <p style={{...sans(13),color:'#8a6040',textAlign:'center',marginBottom:30}}>{f.state} · {f.land}{f.season&&f.season!=='All'?` · ${f.season}`:''} · {stats.recordCount} records used</p>
              <div style={{display:'flex',gap:14,marginBottom:22}}>
                {[{num:`${totalYield}`,unit:'kg / ha',label:'Predicted Yield',color:'#4a8a1a'},{num:`₹${msp.toLocaleString()}`,unit:'per ton',label:'Current MSP',color:'#b86820'},{num:`₹${estRevenue.toLocaleString()}`,unit:'estimated',label:'Gross Revenue',color:'#1a7a6a'}].map(c=><div key={c.label} style={{flex:1,background:'rgba(245,225,195,0.6)',border:'1px solid rgba(180,130,50,0.2)',borderRadius:14,padding:'22px 16px',textAlign:'center'}}><div style={{...serif(30),color:c.color,lineHeight:1,marginBottom:4}}>{c.num}</div><div style={{...sans(10),color:'#9a7848',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:5}}>{c.unit}</div><div style={{...sans(11),color:'#6a5030',textTransform:'uppercase',letterSpacing:'0.05em'}}>{c.label}</div></div>)}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:22}}>
                <StatRow label="Avg Annual Rainfall"  value={`${stats.avgRainfall.toFixed(0)} mm`}/>
                <StatRow label="Avg Fertilizer Used"  value={`${(stats.avgFertilizer/1000).toFixed(1)} tonnes`}/>
                <StatRow label="Avg Area (historic)"  value={`${stats.avgArea.toFixed(0)} ha`}/>
                <StatRow label="Avg Production"       value={`${(stats.avgProduction/1000).toFixed(1)}K units`}/>
                {irrig && <><StatRow label="Surface Water (NIA)" value={`${irrig.sw.toFixed(2)} M ha`}/><StatRow label="Ground Water (NIA)" value={`${irrig.gw.toFixed(2)} M ha`}/></>}
              </div>
              {stats.trend.length>1 && <div style={{marginBottom:26}}><p style={{...sans(11),color:'#8a6840',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:8}}>10-Year Yield Trend (avg kg/ha)</p><MiniChart data={stats.trend}/></div>}
              <div style={{display:'flex',gap:12,justifyContent:'center'}}>
                <Btn v="outline" onClick={()=>setScreen('predict')}>← Change Crop</Btn>
                <Btn onClick={()=>{setF(p=>({...p,crop:'',season:''}));setScreen('predict')}}>Re-calculate</Btn>
              </div>
            </div>
          </div>
        })()}

      </div>
    </div>
  )
}