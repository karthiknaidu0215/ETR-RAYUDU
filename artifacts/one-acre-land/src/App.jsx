import { useEffect, useState, useRef } from 'react'
import {
  ArrowRight, Check, ChevronRight, CircleDollarSign, Download, FileText, Leaf, Library,
  LogOut, Map, MapPinned, Menu, Minus, Pencil, Plus, Receipt, Search, Settings2,
  Save, Shield, Sprout, Trash2, Truck, Users, X, TrendingUp, TrendingDown, BarChart3, Info, IndianRupee,
  Upload,
} from 'lucide-react'
import PlannerWorkspace from './PlannerWorkspace'
import { useStore } from './store'
import { calculatePlan, calculateLiveEstimate, calculatePlantIncome, money, useETRStore, PLANT_SIZES, getPlantSizePrices, getPlantSizeImage, getPlantSizeDetails, getPlantSizeAvailability, isPlantSizeAvailable, INDIAN_MACRO_CONTEXT, getPlantHistoricalData } from './etrState'
import './index.css'

const CATEGORIES = ['All', 'Fruit plants', 'Timber / Wood', 'Avenue', 'Flower', 'Landscaping']

function BrandMark({ light = false }) {
  return (
    <div className={`brand-lockup ${light ? 'brand-light' : ''}`}>
      <div className="brand-mark"><Leaf size={17} strokeWidth={1.5} /></div>
      <div>
        <div className="brand-name">ETR NURSERY</div>
        <div className="brand-sub">PLANTATION INTELLIGENCE</div>
      </div>
    </div>
  )
}

function Intro({ onSkip }) {
  return (
    <main className="intro-screen">
      <div className="intro-noise" />
      <div className="intro-orbit intro-orbit-one" />
      <div className="intro-orbit intro-orbit-two" />
      <div className="intro-content">
        <div className="intro-mark"><Leaf size={38} strokeWidth={1.2} /></div>
        <div className="eyebrow">EST. 2024 · LAND, PLANNED WELL</div>
        <h1>ETR<br /><em>NURSERY</em></h1>
        <p>A considered way to turn one acre into a living future.</p>
        <button className="btn-primary intro-skip" onClick={onSkip}>Enter the nursery <ArrowRight size={15} /></button>
      </div>
      <button className="intro-skip-link" onClick={onSkip}>Skip intro</button>
    </main>
  )
}

function Landing({ content, state, onToggleSelect, onNavigate }) {
  const scrollToLibrary = () => {
    document.getElementById('plant-library-section')?.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <main className="landing">
      <div className="landing-grid" />
      <nav className="landing-nav">
        <BrandMark />
        <div className="landing-nav-actions">
          <button className="btn-quiet" onClick={scrollToLibrary}>Explore plants</button>
          <button className="btn-primary" onClick={() => onNavigate('user-auth')}>Start planning <ArrowRight size={14} /></button>
        </div>
      </nav>
      <section className="landing-main">
        <div className="landing-copy">
          <div className="eyebrow">PLANTATION PLANNING, REFINED</div>
          <h1 className="landing-title">{content.heroTitle.split('. ')[0]}<span>{content.heroTitle.split('. ')[1] || 'Grow your future.'}</span></h1>
          <p className="landing-sub">{content.heroSubtitle} ETR NURSERY brings land size, location, plant spacing, investment, and estimated requirements into one clear plan.</p>
          <div className="landing-ctas">
            <button className="btn-primary btn-large" onClick={() => onNavigate('planner')}>Plan my acre <ArrowRight size={16} /></button>
            <button className="btn-outline btn-large" onClick={scrollToLibrary}>Explore plant collection</button>
          </div>
          <div className="landing-proof">
            <span><strong>01</strong> choose</span><span><strong>02</strong> arrange</span><span><strong>03</strong> grow</span>
          </div>
        </div>
        <div className="landing-orbit-wrap">
          <div className="landing-orbit">
            <div className="orbit-satellite satellite-one">1 ACRE</div>
            <div className="orbit-satellite satellite-two">LIVE PLAN</div>
            <div className="orbit-center"><Sprout size={35} strokeWidth={1} /><strong>1</strong><small>ACRE<br />READY</small></div>
          </div>
          <div className="floating-stat floating-stat-top"><span>Estimated capacity</span><strong>43560 <small>sq ft</small></strong></div>
          <div className="floating-stat floating-stat-bottom"><span>Planning signal</span><strong className="signal-dot">● <small>healthy</small></strong></div>
        </div>
      </section>

      {/* PLANT LIBRARY SECTION DIRECTLY BELOW HERO */}
      {state && (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px 48px', position: 'relative', zIndex: 2 }}>
          <PlantLibrarySection 
            state={state} 
            onToggleSelect={onToggleSelect} 
            onNavigate={onNavigate} 
          />
        </div>
      )}

      <div className="landing-foot"><span>Smart plantation planning for every acre</span><button className="admin-access" onClick={() => onNavigate('admin-auth')}><Shield size={12} /> Admin access</button></div>
    </main>
  )
}

function AuthPage({ mode, onBack, onUserLogin, onAdminLogin }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const isAdmin = mode === 'admin'

  function submit(event) {
    event.preventDefault()
    if (isAdmin) {
      if (!onAdminLogin(username, password)) setError('That admin sign-in was not accepted.')
      return
    }
    if (name.trim().length < 2 || phone.trim().length < 6) {
      setError('Enter your name and a valid phone number to continue.')
      return
    }
    onUserLogin(name, phone)
  }

  return (
    <main className="auth-page">
      <section className="auth-art">
        <BrandMark light />
        <div>
          <div className="eyebrow">ETR NURSERY / {isAdmin ? 'CONTROL ROOM' : 'FIELD ACCESS'}</div>
          <h1 className="auth-quote">{isAdmin ? <>Keep every <em>planting decision</em> in view.</> : <>Your next acre starts with a <em>clearer plan.</em></>}</h1>
          <p className="auth-caption">{isAdmin ? 'Manage the living catalog, business settings, and every confirmed plantation plan from one place.' : 'Save your plans, compare plants, and return to the field layout whenever the idea changes.'}</p>
        </div>
        <div className="auth-art-footer">ETR / 01 — PLANTATION INTELLIGENCE</div>
      </section>
      <section className="auth-form-side">
        <div className="auth-box">
          <button className="back-link" onClick={onBack}><ArrowRight size={14} className="back-arrow" /> Back to ETR</button>
          <div className="eyebrow">{isAdmin ? 'ADMIN ACCESS' : 'USER ACCESS'}</div>
          <h1>{isAdmin ? 'Control room' : 'Welcome in'}</h1>
          <p>{isAdmin ? 'Sign in to manage the nursery operating layer.' : 'A name and phone number are all we need for this prototype.'}</p>
          <form onSubmit={submit}>
            {isAdmin ? (
              <>
                <Field label="Username" value={username} onChange={setUsername} placeholder="Your admin username" />
                <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Your password" />
              </>
            ) : (
              <>
                <Field label="Your name" value={name} onChange={setName} placeholder="e.g. Ananya Rao" />
                <Field label="Phone number" value={phone} onChange={setPhone} placeholder="+91 00000 00000" />
              </>
            )}
            {error && <div className="error-note">{error}</div>}
            <button className="btn-primary btn-block" type="submit">{isAdmin ? 'Enter dashboard' : 'Create my workspace'} <ArrowRight size={15} /></button>
          </form>
          {!isAdmin && <p className="auth-note">By continuing, you agree to keep your planning details private to this workspace.</p>}
          {isAdmin && <button className="text-link auth-switch" onClick={() => onBack('user-auth')}>Return to user login</button>}
        </div>
      </section>
    </main>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return <div className="form-field"><label>{label}</label><input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></div>
}

function Shell({ admin, user, active, onNavigate, onLogout, children }) {
  const [open, setOpen] = useState(false)
  const userLinks = [
    ['dashboard', 'Overview', LayoutDashboardIcon],
    ['catalog', 'Plant library', Library],
    ['planner', 'Plan Maker', MapIcon],
    ['plan', 'Live estimate', CircleDollarSign],
    ['bill', 'Bills & plans', Receipt],
  ]
  const adminLinks = [
    ['admin', 'Command center', LayoutDashboardIcon],
    ['admin-plants', 'Plants & categories', Library],
    ['admin-pricing', 'Pricing & taxes', CircleDollarSign],
    ['admin-content', 'Website content', Pencil],
    ['admin-users', 'Users', Users],
    ['admin-orders', 'Plans & bills', FileText],
  ]
  const links = admin ? adminLinks : userLinks
  return (
    <div className="etr-shell">
      <aside className={`etr-sidebar ${open ? 'open' : ''}`}>
        <BrandMark />
        <div className="nav-label">{admin ? 'OPERATIONS' : 'YOUR WORKSPACE'}</div>
        <nav className="side-nav">
          {links.map(([id, label, Icon]) => (
            <button 
              key={id} 
              className={`side-link ${active === id ? 'active' : ''}`} 
              onClick={() => {
                if (id === 'catalog') {
                  if (active !== 'dashboard') {
                    onNavigate('dashboard')
                    setTimeout(() => {
                      document.getElementById('plant-library-section')?.scrollIntoView({ behavior: 'smooth' })
                    }, 80)
                  } else {
                    document.getElementById('plant-library-section')?.scrollIntoView({ behavior: 'smooth' })
                  }
                } else {
                  onNavigate(id)
                }
                setOpen(false)
              }}
            >
              <Icon size={16} />{label}
            </button>
          ))}
        </nav>
        <div className="sidebar-rail-note"><span className="rail-line" /><span>{admin ? 'ETR CONTROL ROOM' : 'FIELD NOTES / 01'}</span></div>
        <div className="sidebar-foot">
          <div className="account-mini"><div className="avatar">{admin ? 'R' : user?.name?.slice(0, 1).toUpperCase()}</div><span>{admin ? 'Rayudu · Admin' : user?.name}</span></div>
          <button className="logout-button" onClick={onLogout}><LogOut size={13} /> Sign out</button>
        </div>
      </aside>
      <div className="main-stage">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setOpen(!open)}><Menu size={17} /></button>
          <div className="breadcrumb">ETR NURSERY <ChevronRight size={12} /> <strong>{admin ? 'Control room' : labelFor(active)}</strong></div>
          <div className="top-actions">
            <span className="status-pulse"><span /> {admin ? 'LIVE OPERATIONS' : 'PLAN IN PROGRESS'}</span>
            {!admin && <button className="btn-quiet top-plan-button" onClick={() => onNavigate('plan')}><Receipt size={14} /> My estimate</button>}
          </div>
        </header>
        {children}
      </div>
    </div>
  )
}

function LayoutDashboardIcon(props) { return <MapPinned {...props} /> }
function MapIcon(props) { return <Map {...props} /> }
function labelFor(active) {
  return { dashboard: 'Overview', planner: '1-acre planner', catalog: 'Plant library', plan: 'Live estimate', bill: 'Bills & plans', admin: 'Command center', 'admin-plants': 'Plants', 'admin-pricing': 'Pricing & taxes', 'admin-content': 'Website content', 'admin-users': 'Users', 'admin-orders': 'Plans & bills' }[active] || 'Overview'
}

function getTimeBasedGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) {
    return 'Good Morning'
  }
  if (hour >= 12 && hour < 17) {
    return 'Good Afternoon'
  }
  if (hour >= 17 && hour < 21) {
    return 'Good Evening'
  }
  return 'Good Night'
}

function Dashboard({ user, state, onNavigate }) {
  const confirmed = state.plans.filter((plan) => plan.userId === user.id && plan.status !== 'draft')
  const draft = state.plans.find((plan) => plan.userId === user.id && plan.status === 'draft')
  const greeting = getTimeBasedGreeting()
  const scrollToLibrary = () => {
    document.getElementById('plant-library-section')?.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <PageWrap eyebrow="FIELD NOTES / OVERVIEW" title={<>{greeting}, <em>{user.name.split(' ')[0]}.</em></>} intro="Your land plan, nursery shortlist, and latest estimate stay together here.">
      <div className="metric-grid">
        <Metric label="Land in focus" value="1 acre" note="A clear starting point" />
        <Metric label="Plants shortlisted" value={String(draft?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0)} note="Across your live plan" />
        <Metric label="Saved plans" value={String(confirmed.length)} note="Ready for review" />
        <Metric label="Catalog signal" value={String(state.plants.length)} note="Nursery selections" />
      </div>
      <div className="dashboard-grid">
        <div className="glass-card plan-preview card-pad">
          <div className="plan-preview-content">
            <div><div className="card-kicker">YOUR NEXT FIELD</div><h2 className="card-title">One acre, made legible.</h2><p className="page-intro">Set spacing, place infrastructure, and see the farm before the first sapling arrives.</p></div>
            <div><div className="plan-preview-figure">01</div><div className="progress-line"><span style={{ width: draft?.items?.length ? '64%' : '18%' }} /></div><div className="preview-foot"><span>{draft?.items?.length ? 'Plan is taking shape' : 'Start with a plant shortlist'}</span><button className="text-link" onClick={() => onNavigate('planner')}>Open planner <ArrowRight size={13} /></button></div></div>
          </div>
        </div>
        <div className="glass-card card-pad">
          <div className="card-kicker">RECENT ACTIVITY</div>
          <div className="activity-list">
            <Activity title="Workspace opened" detail="Your 1-acre plan is ready" />
            {draft?.items?.length ? <Activity title="Plants shortlisted" detail={`${draft.items.length} varieties in estimate`} /> : <Activity title="No plants selected" detail="Visit the library to begin" />}
            {confirmed.length ? <Activity title="Plan confirmed" detail={`${confirmed.length} bill${confirmed.length > 1 ? 's' : ''} generated`} /> : <Activity title="No confirmed bills" detail="Your final bill appears here" />}
          </div>
        </div>
      </div>
      <div className="section-heading"><div><h2>Make the next move</h2><p>Everything you need for a considered first pass.</p></div></div>
      <div className="action-grid">
        <ActionCard icon={<Map size={18} />} eyebrow="01 / ARRANGE" title="Plan my acre" text="Use the living layout to test spacing and infrastructure." onClick={() => onNavigate('planner')} />
        <ActionCard icon={<Library size={18} />} eyebrow="02 / CHOOSE" title="Explore plants" text="Build a shortlist from the nursery collection." onClick={scrollToLibrary} />
        <ActionCard icon={<CircleDollarSign size={18} />} eyebrow="03 / COMMIT" title="Review estimate" text="See current prices, tax, and services in one view." onClick={() => onNavigate('plan')} />
      </div>

      {/* PLANT LIBRARY SECTION DIRECTLY BELOW */}
      <PlantLibrarySection 
        state={state} 
        onToggleSelect={state.togglePlantSelection} 
        onNavigate={onNavigate} 
      />
    </PageWrap>
  )
}

function Metric({ label, value, note }) { return <div className="glass-card metric-card"><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-note">{note}</div></div> }
function Activity({ title, detail }) { return <div className="activity-row"><span className="activity-dot" /><div className="activity-main"><strong>{title}</strong><br />{detail}</div><span className="activity-time">now</span></div> }
function ActionCard({ icon, eyebrow, title, text, onClick }) { return <button className="action-card glass-card" onClick={onClick}><div className="action-icon">{icon}</div><div className="card-kicker">{eyebrow}</div><h3>{title}</h3><p>{text}</p><ArrowRight size={15} /></button> }
function PageWrap({ eyebrow, title, intro, children }) { return <main className="page-wrap"><div className="eyebrow">{eyebrow}</div><h1 className="display-title">{title}</h1><p className="page-intro">{intro}</p>{children}</main> }

function PlantLibrarySection({ state, onToggleSelect, onNavigate, id = "plant-library-section" }) {
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState(null)
  
  const selectedPlantIds = state.selectedPlantIds || []
  const selectedPlantSizes = state.selectedPlantSizes || {}
  const selectedPlants = state.plants.filter((p) => selectedPlantIds.includes(p.id))
  const shown = state.plants.filter((plant) => (category === 'All' || plant.category === category) && `${plant.name} ${plant.category} ${plant.shortName || ''}`.toLowerCase().includes(search.toLowerCase()))

  const handleSelectSize = (plantId, size) => {
    if (state.setPlantSelectedSize) {
      state.setPlantSelectedSize(plantId, size)
    }
  }

  const handleToggleSelect = (plantId, optionalSize) => {
    if (onToggleSelect) {
      onToggleSelect(plantId, optionalSize || selectedPlantSizes[plantId] || 'M')
    }
  }

  return (
    <section id={id} className="plant-library-section" style={{ marginTop: '54px', paddingTop: '36px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="section-heading" style={{ marginBottom: '20px' }}>
        <div>
          <div className="eyebrow">THE COLLECTION / PLANT LIBRARY</div>
          <h2>Choose with <em>intention.</em></h2>
          <p>Select plants and their nursery sapling size (S, M, or L) to include in your Plan My Acre layout. Real photographs, recommended spacing, and sapling requirements help shape your farm.</p>
        </div>
      </div>

      {/* 1. PLANT LIBRARY → PLAN MAKER NEXT ACTION BANNER */}
      <div className="planner-connection-banner glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px 24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--primary)', marginBottom: '4px' }}>
              STEP 1: SELECT PLANTS ({selectedPlants.length} SELECTED)
            </div>
            <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text)' }}>Selected Plants:</h3>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            Choose S, M, or L size on each plant card below
          </span>
        </div>

        {selectedPlants.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {selectedPlants.map(p => {
              const sz = selectedPlantSizes[p.id] || 'M';
              const isAvail = isPlantSizeAvailable(p, sz);
              return (
                <div key={p.id} style={{
                  background: isAvail ? 'rgba(184, 220, 145, 0.1)' : 'rgba(239, 68, 68, 0.12)',
                  border: isAvail ? '1px solid rgba(184, 220, 145, 0.4)' : '1px solid rgba(239, 68, 68, 0.45)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  color: '#fff'
                }}>
                  <strong style={{ color: isAvail ? 'var(--primary)' : '#ef4444' }}>{p.shortName || p.name}</strong>
                  <span style={{ color: 'var(--text-dim)' }}>—</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{sz}</span>
                  <span style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isAvail ? '#22c55e' : '#ef4444'
                  }} />
                  <span style={{ fontSize: '11px', color: isAvail ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                    {isAvail ? 'Available' : 'Not Available'}
                  </span>
                  <button 
                    onClick={() => handleToggleSelect(p.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', marginLeft: '4px', padding: 0, fontSize: '14px', lineHeight: 1 }}
                    title="Remove plant"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: '13px', color: 'var(--text-dim)', fontStyle: 'italic', padding: '4px 0' }}>
            No plants selected yet. Click any plant card below to select it and choose its S, M, or L plant size.
          </div>
        )}

        {/* Action directly below selected plants: "Plan Maker →" */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '12px', color: selectedPlants.some(p => !isPlantSizeAvailable(p, selectedPlantSizes[p.id] || 'M')) ? '#ef4444' : 'var(--text-muted)' }}>
            {selectedPlants.some(p => !isPlantSizeAvailable(p, selectedPlantSizes[p.id] || 'M'))
              ? '⚠️ Please select an Available size on marked plants before proceeding to Plan Maker.'
              : selectedPlants.length > 0 
                ? `Carries ${selectedPlants.length} selected plant${selectedPlants.length !== 1 ? 's' : ''} directly into Plan Maker.` 
                : 'Select plants below to unlock Plan Maker.'}
          </div>
          <button 
            className="btn-primary" 
            disabled={selectedPlants.length === 0 || selectedPlants.some(p => !isPlantSizeAvailable(p, selectedPlantSizes[p.id] || 'M'))}
            style={{ 
              padding: '0 28px', 
              minHeight: '44px', 
              fontSize: '14px', 
              fontWeight: 600,
              opacity: (selectedPlants.length === 0 || selectedPlants.some(p => !isPlantSizeAvailable(p, selectedPlantSizes[p.id] || 'M'))) ? 0.45 : 1,
              cursor: (selectedPlants.length === 0 || selectedPlants.some(p => !isPlantSizeAvailable(p, selectedPlantSizes[p.id] || 'M'))) ? 'not-allowed' : 'pointer'
            }}
            onClick={() => {
              if (selectedPlants.length > 0 && !selectedPlants.some(p => !isPlantSizeAvailable(p, selectedPlantSizes[p.id] || 'M'))) {
                if (typeof state.syncPlannerWithSelectedPlants === 'function') {
                  state.syncPlannerWithSelectedPlants(selectedPlantIds, selectedPlantSizes);
                }
                onNavigate('planner');
              }
            }}
          >
            Plan Maker →
          </button>
        </div>
      </div>

      <div className="catalog-toolbar">
        <div className="search-box">
          <Search size={15} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search plant collection..." />
        </div>
        <div className="filter-pills">
          {CATEGORIES.map((item) => (
            <button key={item} className={`filter-pill ${category === item ? 'active' : ''}`} onClick={() => setCategory(item)}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="catalog-grid">
        {shown.map((plant) => (
          <PlantCard 
            key={plant.id} 
            plant={plant} 
            isSelected={selectedPlantIds.includes(plant.id)}
            selectedSize={selectedPlantSizes[plant.id] || 'M'}
            onSelectSize={handleSelectSize}
            onToggleSelect={handleToggleSelect}
            onDetail={() => setDetail(plant)} 
          />
        ))}
      </div>
      {!shown.length && <div className="empty-state glass-card"><Sprout size={24} /><h3>No plants in this view</h3><p>Try another search or category.</p></div>}
      {detail && (
        <PlantDetail 
          plant={detail} 
          isSelected={selectedPlantIds.includes(detail.id)}
          selectedSize={selectedPlantSizes[detail.id] || 'M'}
          onSelectSize={handleSelectSize}
          onClose={() => setDetail(null)} 
          onToggleSelect={handleToggleSelect} 
        />
      )}
    </section>
  )
}

function CatalogPage({ state, onToggleSelect, onNavigate, onNeedLogin, onBack, publicView = false }) {
  return (
    <PageWrap eyebrow="THE COLLECTION / PLANT LIBRARY" title={<>Choose with <em>intention.</em></>} intro="Select plants to include in your Plan My Acre layout. Real photographs, recommended spacing, and sapling requirements help shape your farm.">
      {publicView && <button className="back-link page-back" onClick={onBack}><ArrowRight size={14} className="back-arrow" /> Back to ETR</button>}
      <PlantLibrarySection state={state} onToggleSelect={onToggleSelect} onNavigate={onNavigate} />
    </PageWrap>
  )
}

function PlantCard({ plant, isSelected, selectedSize = 'M', onSelectSize, onToggleSelect, onDetail }) {
  const [activeSize, setActiveSize] = useState(selectedSize)

  // Auto-switch to available size if current active size is marked unavailable
  useEffect(() => {
    if (!isPlantSizeAvailable(plant, activeSize)) {
      const firstAvail = ['S', 'M', 'L'].find((code) => isPlantSizeAvailable(plant, code))
      if (firstAvail) {
        setActiveSize(firstAvail)
        if (isSelected && onSelectSize) {
          onSelectSize(plant.id, firstAvail)
        }
      }
    }
  }, [plant.sizeAvailability, activeSize, plant.id, isSelected, onSelectSize])

  useEffect(() => {
    if (selectedSize && selectedSize !== activeSize && isPlantSizeAvailable(plant, selectedSize)) {
      setActiveSize(selectedSize)
    }
  }, [selectedSize])

  const prices = getPlantSizePrices(plant)
  const activeImage = getPlantSizeImage(plant, activeSize)
  const activeDetails = getPlantSizeDetails(plant, activeSize)
  const unitPrice = prices[activeSize] || plant.price
  const isCurrentActiveAvailable = isPlantSizeAvailable(plant, activeSize)
  const hasAnyAvailableSize = ['S', 'M', 'L'].some((code) => isPlantSizeAvailable(plant, code))

  const handleSizeClick = (sizeCode) => {
    if (!isPlantSizeAvailable(plant, sizeCode)) return
    setActiveSize(sizeCode)
    if (onSelectSize) {
      onSelectSize(plant.id, sizeCode)
    }
  }

  const handleSelectClick = () => {
    if (!isCurrentActiveAvailable && !isSelected) return
    if (onToggleSelect) {
      onToggleSelect(plant.id, activeSize)
    }
  }

  return (
    <article className={`plant-card glass-card ${isSelected ? 'is-selected-card' : ''}`}>
      <div className="plant-visual" style={{ '--plant-color': plant.color }}>
        <img 
          src={activeImage} 
          alt={`${plant.name} - ${activeDetails.name}`} 
          className="plant-photo-img" 
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="plant-photo-overlay" />
        <div className="plant-category">{plant.category}</div>
        <div style={{ position: 'absolute', bottom: '12px', left: '12px', zIndex: 2, background: 'rgba(10,22,20,0.85)', padding: '3px 8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
          {activeSize} — {activeDetails.label} ({activeDetails.height})
        </div>
        {isSelected && (
          <div className="plant-selected-badge">
            <Check size={11} strokeWidth={2.5} /> In Plan My Acre ({activeSize})
          </div>
        )}
      </div>
      <div className="plant-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
          <h3 style={{ margin: 0 }}>{plant.name}</h3>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>
            {money(unitPrice)}
          </span>
        </div>
        <p>{plant.description}</p>
        <div className="plant-meta">
          <div className="meta-stat">SPACING<strong>{plant.spacing}</strong></div>
          <div className="meta-stat">PER ACRE<strong>{plant.plantsPerAcre} plants</strong></div>
        </div>

        {/* 5. USER AVAILABILITY DISPLAY: S, M, L */}
        <div style={{
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '7px',
          padding: '8px 10px',
          margin: '10px 0 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontWeight: 600 }}>
              Stock Availability:
            </span>
            <span style={{ fontSize: '9px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              {plant.shortName || plant.name}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {['S', 'M', 'L'].map((code) => {
              const isAvail = isPlantSizeAvailable(plant, code)
              return (
                <div key={code} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
                  <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{code} —</strong>
                  <span style={{
                    display: 'inline-block',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: isAvail ? '#22c55e' : '#ef4444',
                    boxShadow: isAvail ? '0 0 6px rgba(34, 197, 94, 0.45)' : '0 0 6px rgba(239, 68, 68, 0.45)'
                  }} />
                  <span style={{
                    color: isAvail ? '#22c55e' : '#ef4444',
                    fontWeight: 600
                  }}>
                    {isAvail ? 'Available' : 'Not Available'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* PLANT SELECTION SIZE: S, M, L */}
        <div className="plant-selection-size-block">
          <div className="selection-size-header">
            <span className="size-label-kicker">Plant Selection Size:</span>
            <span className="current-size-preview">
              <strong>{activeSize}</strong> — {activeDetails.label} Plant
              {!isCurrentActiveAvailable && (
                <span style={{ color: '#ef4444', marginLeft: '6px', fontSize: '11px' }}>(Not Available)</span>
              )}
            </span>
          </div>
          <div className="plant-size-selector">
            {PLANT_SIZES.map((sz) => {
              const isAvail = isPlantSizeAvailable(plant, sz.code)
              const price = prices[sz.code]
              const isActive = activeSize === sz.code
              return (
                <button
                  key={sz.code}
                  type="button"
                  disabled={!isAvail}
                  className={`size-choice-btn ${isActive ? 'active' : ''}`}
                  style={!isAvail ? {
                    opacity: 0.5,
                    cursor: 'not-allowed',
                    borderColor: 'rgba(239, 68, 68, 0.35)',
                    background: 'rgba(239, 68, 68, 0.05)'
                  } : {}}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isAvail) {
                      handleSizeClick(sz.code)
                    }
                  }}
                  title={isAvail ? `${sz.code} — ${sz.label} Plant (${sz.height}) — ${money(price)}` : `${sz.code} — Not Available`}
                >
                  <span className="size-code-badge">{sz.code} — {sz.label}</span>
                  <div className="size-info">
                    <strong className="size-price">{money(price)}</strong>
                  </div>
                  {/* Status dot & text */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '3px', fontSize: '10px' }}>
                    <span style={{
                      display: 'inline-block',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: isAvail ? '#22c55e' : '#ef4444'
                    }} />
                    <span style={{ color: isAvail ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                      {isAvail ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
          <div className="size-detail-note">
            <span className="size-note-badge">{activeDetails.height}</span>
            <span className="size-note-text">{activeDetails.details}</span>
          </div>
        </div>

        <div className="plant-actions">
          <span className="plant-price">{money(unitPrice)} <small>/ {activeSize} plant</small></span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="icon-text-button" onClick={() => onDetail({ ...plant, initialSize: activeSize })}>Details</button>
            {!hasAnyAvailableSize ? (
              <button 
                className="btn-outline btn-small"
                disabled
                style={{ opacity: 0.5, cursor: 'not-allowed', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
                title="All sizes of this plant are currently out of stock"
              >
                Out of Stock
              </button>
            ) : !isCurrentActiveAvailable ? (
              <button 
                className="btn-outline btn-small"
                disabled
                style={{ opacity: 0.5, cursor: 'not-allowed', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
                title="Please select an Available size above"
              >
                {activeSize} Not Available
              </button>
            ) : (
              <button 
                className={isSelected ? 'btn-primary btn-small is-selected-btn' : 'btn-outline btn-small'}
                onClick={handleSelectClick}
                title={isSelected ? `Deselect ${plant.name} from Plan My Acre` : `Select ${activeSize} for Plan My Acre`}
              >
                {isSelected ? (
                  <>Selected ({activeSize}) <Check size={12} /></>
                ) : (
                  <>+ Select {activeSize}</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

function PlantDetail({ plant, isSelected, selectedSize = 'M', onSelectSize, onClose, onToggleSelect }) {
  const [activeSize, setActiveSize] = useState(plant.initialSize || selectedSize || 'M')

  useEffect(() => {
    if (!isPlantSizeAvailable(plant, activeSize)) {
      const firstAvail = ['S', 'M', 'L'].find((code) => isPlantSizeAvailable(plant, code))
      if (firstAvail) setActiveSize(firstAvail)
    }
  }, [plant.sizeAvailability, activeSize])

  const prices = getPlantSizePrices(plant)
  const activeImage = getPlantSizeImage(plant, activeSize)
  const activeDetails = getPlantSizeDetails(plant, activeSize)
  const unitPrice = prices[activeSize] || plant.price
  const isCurrentActiveAvailable = isPlantSizeAvailable(plant, activeSize)

  const handleSizeClick = (sizeCode) => {
    if (!isPlantSizeAvailable(plant, sizeCode)) return
    setActiveSize(sizeCode)
    if (onSelectSize) {
      onSelectSize(plant.id, sizeCode)
    }
  }

  const handleSelectClick = () => {
    if (!isCurrentActiveAvailable && !isSelected) return
    if (onToggleSelect) {
      onToggleSelect(plant.id, activeSize)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="detail-modal glass-card">
        <button className="modal-close" onClick={onClose}><X size={16} /></button>
        <div className="detail-visual-wrap">
          <img 
            src={activeImage} 
            alt={`${plant.name} - ${activeDetails.name}`} 
            className="detail-photo-img" 
            referrerPolicy="no-referrer" 
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="detail-photo-overlay" />
          <div className="detail-category-tag">{plant.category}</div>
          <div style={{ position: 'absolute', bottom: '14px', left: '14px', zIndex: 2, background: 'rgba(10,22,20,0.85)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
            Plant Size: {activeSize} — {activeDetails.label} ({activeDetails.height})
          </div>
          {isSelected && (
            <div className="detail-selected-badge">
              <Check size={12} strokeWidth={2.5} /> In Plan My Acre ({activeSize})
            </div>
          )}
        </div>
        <div className="detail-body-pad">
          <div className="eyebrow">{plant.category} / NURSERY RECORD</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2>{plant.name}</h2>
            <strong style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--primary)' }}>
              {money(unitPrice)} <small style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/ {activeSize} plant</small>
            </strong>
          </div>
          <p>{plant.description}</p>

          {/* AVAILABILITY SUMMARY IN DETAIL MODAL */}
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px',
            padding: '8px 12px',
            margin: '12px 0 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontWeight: 600 }}>
              Stock Availability:
            </span>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {['S', 'M', 'L'].map((code) => {
                const isAvail = isPlantSizeAvailable(plant, code)
                return (
                  <div key={code} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
                    <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{code} —</strong>
                    <span style={{
                      display: 'inline-block',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: isAvail ? '#22c55e' : '#ef4444'
                    }} />
                    <span style={{
                      color: isAvail ? '#22c55e' : '#ef4444',
                      fontWeight: 600
                    }}>
                      {isAvail ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* PLANT SELECTION SIZE: S, M, L */}
          <div className="detail-size-breakdown">
            <div className="detail-size-heading">Plant Selection Size:</div>
            <div className="detail-size-options">
              {PLANT_SIZES.map((sz) => {
                const isAvail = isPlantSizeAvailable(plant, sz.code)
                const price = prices[sz.code]
                const isActive = activeSize === sz.code
                return (
                  <div
                    key={sz.code}
                    className={`detail-size-row ${isActive ? 'active' : ''}`}
                    style={!isAvail ? { opacity: 0.5, cursor: 'not-allowed', borderColor: 'rgba(239, 68, 68, 0.35)' } : {}}
                    onClick={() => {
                      if (isAvail) handleSizeClick(sz.code)
                    }}
                  >
                    <div className="detail-size-info">
                      <div className="detail-size-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <strong>{sz.code} — {sz.label} Plant</strong> · <span style={{ color: 'var(--primary)' }}>{sz.height}</span>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          color: isAvail ? '#22c55e' : '#ef4444',
                          fontWeight: 600,
                          marginLeft: 'auto'
                        }}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: isAvail ? '#22c55e' : '#ef4444'
                          }} />
                          {isAvail ? 'Available' : 'Not Available'}
                        </span>
                      </div>
                      <div className="detail-size-desc">{sz.stage} · {sz.details}</div>
                    </div>
                    <div className="detail-size-cost">
                      {money(price)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="detail-facts">
            <Fact label={`Unit price (${activeSize})`} value={money(unitPrice)} />
            <Fact label="Recommended spacing" value={plant.spacing} />
            <Fact label="Fertilizer" value={plant.fertilizer} />
            <Fact label="Growth signal" value={plant.growth} />
            <Fact label="Maintenance" value={plant.maintenance} />
            <Fact label="Plants / acre" value={`${plant.plantsPerAcre} plants`} />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
            <button 
              className={isSelected ? 'btn-primary btn-block is-selected-btn' : 'btn-primary btn-block'} 
              disabled={!isCurrentActiveAvailable}
              style={!isCurrentActiveAvailable ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              onClick={handleSelectClick}
            >
              {!isCurrentActiveAvailable ? (
                <>Size {activeSize} is Not Available (Choose Available size above)</>
              ) : isSelected ? (
                <>Selected ({activeSize} — {activeDetails.label}) for Plan My Acre <Check size={15} /></>
              ) : (
                <>+ Select {activeSize} ({activeDetails.label} — {money(unitPrice)}) for Plan My Acre <ArrowRight size={15} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
function Fact({ label, value }) { return <div><span>{label}</span><strong>{value}</strong></div> }

function PlanPage({ state, draft, onUpdateItems, onNavigate, onConfirm, onSelectPlantSize }) {
  // Automatically sync placed plants from 3D planner when opening Live Estimate
  useEffect(() => {
    if (typeof state.syncPlannerCountsToDraft === 'function') {
      state.syncPlannerCountsToDraft();
    }
  }, []);

  const [selectedAddOns, setSelectedAddOns] = useState(() => ({
    transportation: true,
    fencing: false,
    dripIrrigation: false,
    honeyBeeBox: false,
  }));

  const items = draft?.items || [];

  // Live calculation based on plan items, Admin plant prices, and Admin add-on rates
  const estimate = calculateLiveEstimate(draft, state.plants, state.settings, selectedAddOns);

  const updateQty = (plantId, delta) => {
    onUpdateItems(
      items
        .map((item) => (item.plantId === plantId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0),
      draft?.landAcres || 1
    );
  };

  const setItemQty = (plantId, qty) => {
    const num = Math.max(0, parseInt(qty, 10) || 0);
    onUpdateItems(
      items
        .map((item) => (item.plantId === plantId ? { ...item, quantity: num } : item))
        .filter((item) => item.quantity > 0),
      draft?.landAcres || 1
    );
  };

  const switchItemSize = (plantId, size) => {
    const plant = state.plants.find((p) => p.id === plantId);
    const sizePrices = getPlantSizePrices(plant);
    const price = sizePrices[size] || plant?.price || 100;

    if (onSelectPlantSize) {
      onSelectPlantSize(plantId, size);
    }
    onUpdateItems(
      items.map((item) => (item.plantId === plantId ? { ...item, size, price } : item)),
      draft?.landAcres || 1
    );
  };

  const toggleAddOn = (key) => {
    setSelectedAddOns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfirm = () => {
    onConfirm({
      ...estimate,
      selectedAddOns,
      items,
      landAcres: draft?.landAcres || 1,
    });
  };

  const macro = estimate.macroContext || INDIAN_MACRO_CONTEXT;

  return (
    <PageWrap
      eyebrow="LIVE ESTIMATE / 01 ACRE"
      title={<>Live Estimate, <em>Billing & Income.</em></>}
      intro="Itemized plant billing, optional turnkey add-ons, 2021–2025 official market historical data, and projected harvest return ranges calculated live from your 1-acre farm plan."
    >
      <div className="plan-toolbar">
        <button className="btn-primary" onClick={() => onNavigate('planner')}>
          <Map size={14} /> Plan Maker / 3D Layout
        </button>
        <button className="btn-outline" onClick={() => onNavigate('catalog')}>
          <Plus size={14} /> Add plants from library
        </button>
        <button className="btn-quiet" onClick={() => state.syncPlannerCountsToDraft?.()}>
          <Sprout size={14} /> Sync from 3D layout
        </button>
      </div>

      {!items.length ? (
        <div className="empty-state glass-card">
          <CircleDollarSign size={27} />
          <h3>Complete Your Plan in Plan Maker First</h3>
          <p>
            The Live Estimate is calculated directly from your finalized farm plan. Please arrange your plants in Plan Maker, then click "Live Estimate" to view your billing, harvest income forecast, and historical market data.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px' }}>
            <button className="btn-primary" onClick={() => onNavigate('planner')}>
              Open Plan Maker <Map size={14} />
            </button>
            <button className="btn-outline" onClick={() => onNavigate('catalog')}>
              Select Plants in Library <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div className="live-estimate-container">
          {/* 4. ESTIMATED INVESTMENT */}
          {/* PLANT BILLING */}
          <section className="glass-card live-estimate-panel">
            <div className="live-estimate-panel-head">
              <div>
                <div className="eyebrow" style={{ color: 'var(--primary)', marginBottom: '4px' }}>01 / INVESTMENT · PLANT BILLING</div>
                <h2><Leaf size={20} color="var(--primary)" /> Plant Billing</h2>
                <p>Calculated automatically from your Plan Maker selections and Admin-controlled nursery prices.</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  {items.reduce((s, i) => s + i.quantity, 0)} TOTAL PLANTS
                </span>
              </div>
            </div>

            <div className="plant-billing-table-wrap">
              <table className="plant-billing-table">
                <thead>
                  <tr>
                    <th>Plant Name</th>
                    <th style={{ width: '130px' }}>Size</th>
                    <th>Quantity</th>
                    <th>Price per Plant</th>
                    <th>Total</th>
                    <th style={{ width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const plant = state.plants.find((p) => p.id === item.plantId);
                    if (!plant) return null;
                    const size = item.size || state.selectedPlantSizes?.[plant.id] || 'M';
                    const sizePrices = getPlantSizePrices(plant);
                    const unitPrice = item.price || sizePrices[size] || plant.price;
                    const sizeDetails = getPlantSizeDetails(plant, size);
                    const lineTotal = unitPrice * item.quantity;
                    const image = getPlantSizeImage(plant, size);

                    return (
                      <tr key={item.plantId}>
                        <td>
                          <div className="plant-col-info">
                            <img
                              src={image}
                              alt={plant.name}
                              className="plant-col-img"
                              referrerPolicy="no-referrer"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <div className="plant-col-name">
                              <strong>{plant.shortName || plant.name}</strong>
                              <small>{plant.name} · {plant.spacing}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="size-switcher-group" title="Select nursery sapling size">
                            {['S', 'M', 'L'].map((sz) => {
                              const isAvail = isPlantSizeAvailable(plant, sz)
                              return (
                                <button
                                  key={sz}
                                  disabled={!isAvail}
                                  className={`size-pill-btn ${size === sz ? 'active' : ''}`}
                                  style={!isAvail ? { opacity: 0.45, cursor: 'not-allowed', borderColor: 'rgba(239, 68, 68, 0.4)' } : {}}
                                  onClick={() => {
                                    if (isAvail) switchItemSize(plant.id, sz)
                                  }}
                                  title={isAvail ? `Switch to size ${sz} (Available)` : `Size ${sz} is Not Available`}
                                >
                                  {sz}
                                </button>
                              )
                            })}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{
                              display: 'inline-block',
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: isPlantSizeAvailable(plant, size) ? '#22c55e' : '#ef4444'
                            }} />
                            <span style={{ color: isPlantSizeAvailable(plant, size) ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                              {isPlantSizeAvailable(plant, size) ? 'Available' : 'Not Available'}
                            </span>
                            <span>· {sizeDetails.badge}</span>
                          </div>
                        </td>
                        <td>
                          <div className="qty-control" style={{ justifyContent: 'flex-end' }}>
                            <button onClick={() => updateQty(plant.id, -1)} aria-label="Decrease quantity">
                              <Minus size={12} />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => setItemQty(plant.id, e.target.value)}
                              min="1"
                              style={{
                                width: '50px',
                                textAlign: 'center',
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid var(--line)',
                                borderRadius: '4px',
                                color: '#fff',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '12px',
                                padding: '3px 0'
                              }}
                            />
                            <button onClick={() => updateQty(plant.id, 1)} aria-label="Increase quantity">
                              <Plus size={12} />
                            </button>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          {money(unitPrice)}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--text)', fontSize: '14px' }}>
                          {money(lineTotal)}
                        </td>
                        <td>
                          <button
                            className="remove-icon"
                            onClick={() => onUpdateItems(items.filter((entry) => entry.plantId !== plant.id), draft?.landAcres || 1)}
                            title="Remove plant"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="total-plant-cost-strip">
              <span className="total-plant-cost-label">Total Plant Cost:</span>
              <span className="total-plant-cost-value">{money(estimate.plantCost)}</span>
            </div>
          </section>

          {/* OPTIONAL ADD-ONS */}
          <section className="glass-card live-estimate-panel">
            <div className="live-estimate-panel-head">
              <div>
                <div className="eyebrow" style={{ color: 'var(--primary)', marginBottom: '4px' }}>02 / OPTIONAL TURNKEY INFRASTRUCTURE</div>
                <h2><Shield size={20} color="var(--primary)" /> Optional Add-ons</h2>
                <p>Toggle optional turnkey services and infrastructure. All rates are Admin-controlled.</p>
              </div>
            </div>

            <div className="addons-grid">
              {/* Transportation */}
              <div
                className={`addon-card ${selectedAddOns.transportation ? 'selected' : ''}`}
                onClick={() => toggleAddOn('transportation')}
              >
                <div className="addon-checkbox">
                  {selectedAddOns.transportation && <Check size={14} strokeWidth={3} />}
                </div>
                <div className="addon-details">
                  <div className="addon-header-line">
                    <span className="addon-title">Transportation</span>
                    <span className="addon-price-tag">{money(estimate.addOnPrices.transportation)}</span>
                  </div>
                  <p className="addon-desc">
                    Specialized transit and climate-protected logistics delivery directly to your farm gate.
                  </p>
                </div>
              </div>

              {/* Fencing */}
              <div
                className={`addon-card ${selectedAddOns.fencing ? 'selected' : ''}`}
                onClick={() => toggleAddOn('fencing')}
              >
                <div className="addon-checkbox">
                  {selectedAddOns.fencing && <Check size={14} strokeWidth={3} />}
                </div>
                <div className="addon-details">
                  <div className="addon-header-line">
                    <span className="addon-title">Fencing</span>
                    <span className="addon-price-tag">{money(estimate.addOnPrices.fencing)}</span>
                  </div>
                  <p className="addon-desc">
                    1-acre boundary fence posts, tension wire, and perimeter protection setup.
                  </p>
                </div>
              </div>

              {/* Drip Irrigation */}
              <div
                className={`addon-card ${selectedAddOns.dripIrrigation ? 'selected' : ''}`}
                onClick={() => toggleAddOn('dripIrrigation')}
              >
                <div className="addon-checkbox">
                  {selectedAddOns.dripIrrigation && <Check size={14} strokeWidth={3} />}
                </div>
                <div className="addon-details">
                  <div className="addon-header-line">
                    <span className="addon-title">Drip Irrigation</span>
                    <span className="addon-price-tag">{money(estimate.addOnPrices.dripIrrigation)}</span>
                  </div>
                  <p className="addon-desc">
                    Turnkey mainline, lateral distribution pipes, filtration, and pressure-compensating emitters.
                  </p>
                </div>
              </div>

              {/* Honey Bee Box / Beekeeping */}
              <div
                className={`addon-card ${selectedAddOns.honeyBeeBox ? 'selected' : ''}`}
                onClick={() => toggleAddOn('honeyBeeBox')}
              >
                <div className="addon-checkbox">
                  {selectedAddOns.honeyBeeBox && <Check size={14} strokeWidth={3} />}
                </div>
                <div className="addon-details">
                  <div className="addon-header-line">
                    <span className="addon-title">Honey Bee Box / Beekeeping</span>
                    <span className="addon-price-tag">{money(estimate.addOnPrices.honeyBeeBox)}</span>
                  </div>
                  <p className="addon-desc">
                    Apiculture bee colonies to accelerate orchard pollination, fruit set, and harvest yields.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* TOTAL ESTIMATED INVESTMENT */}
          <section className="glass-card investment-summary-card">
            <div className="live-estimate-panel-head" style={{ borderBottom: '1px solid rgba(184, 220, 145, 0.2)' }}>
              <div>
                <div className="eyebrow" style={{ color: 'var(--primary)', marginBottom: '4px' }}>03 / INVESTMENT BREAKDOWN</div>
                <h2 style={{ fontSize: '26px' }}><CircleDollarSign size={22} color="var(--primary)" /> Total Estimated Investment</h2>
              </div>
            </div>

            <div className="investment-lines">
              <div className="investment-row">
                <span>Plant Cost</span>
                <strong>{money(estimate.plantCost)}</strong>
              </div>

              <div className={`investment-row ${!selectedAddOns.transportation ? 'unselected' : ''}`}>
                <span>+ Transportation {selectedAddOns.transportation ? '' : '(Not selected)'}</span>
                <strong>{selectedAddOns.transportation ? money(estimate.transportationCost) : '₹0'}</strong>
              </div>

              <div className={`investment-row ${!selectedAddOns.fencing ? 'unselected' : ''}`}>
                <span>+ Fencing {selectedAddOns.fencing ? '' : '(Not selected)'}</span>
                <strong>{selectedAddOns.fencing ? money(estimate.fencingCost) : '₹0'}</strong>
              </div>

              <div className={`investment-row ${!selectedAddOns.dripIrrigation ? 'unselected' : ''}`}>
                <span>+ Drip Irrigation {selectedAddOns.dripIrrigation ? '' : '(Not selected)'}</span>
                <strong>{selectedAddOns.dripIrrigation ? money(estimate.dripIrrigationCost) : '₹0'}</strong>
              </div>

              <div className={`investment-row ${!selectedAddOns.honeyBeeBox ? 'unselected' : ''}`}>
                <span>+ Honey Bee Box {selectedAddOns.honeyBeeBox ? '' : '(Not selected)'}</span>
                <strong>{selectedAddOns.honeyBeeBox ? money(estimate.honeyBeeBoxCost) : '₹0'}</strong>
              </div>

              <div className="investment-divider" />

              <div className="investment-total-row">
                <span className="investment-total-label">TOTAL ESTIMATED INVESTMENT</span>
                <span className="investment-total-amount">{money(estimate.totalInvestment)}</span>
              </div>
            </div>
          </section>

          {/* 5. ESTIMATED INCOME (DIRECTLY BELOW INVESTMENT SUMMARY) */}
          <section className="glass-card income-section">
            <div className="live-estimate-panel-head">
              <div>
                <div className="eyebrow" style={{ color: 'var(--primary)', marginBottom: '4px' }}>04 / HARVEST FORECAST</div>
                <h2><TrendingUp size={22} color="var(--primary)" /> Estimated Income</h2>
                <p>Calculated per plant item using Admin-controlled yield parameters, plant size, and market references.</p>
              </div>
            </div>

            <div className="income-cards-grid">
              {estimate.plantIncomes.map((item) => {
                const inc = item.incomeData;
                return (
                  <div key={item.plantId} className="income-plant-card">
                    <div className="income-card-head">
                      <h4>{item.shortName || item.plantName}</h4>
                      <span className="income-card-badge">{item.quantity} plants ({item.size})</span>
                    </div>

                    <div className="income-plant-meta-strip" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', marginBottom: '12px', fontSize: '12px' }}>
                      <span><strong>Plant:</strong> {item.plantName}</span>
                      <span><strong>Size:</strong> {item.size}</span>
                      <span><strong>Qty:</strong> {item.quantity}</span>
                    </div>

                    {inc.hasData ? (
                      <div className="income-params-list">
                        <div className="income-param-item">
                          <span>Expected Yield</span>
                          <strong>{inc.yieldPerPlant} {inc.yieldUnit} / plant</strong>
                        </div>
                        <div className="income-param-item">
                          <span>Reference Market Price</span>
                          <strong>₹{inc.sellingPrice} / {inc.yieldUnit}</strong>
                        </div>
                        <div className="income-param-item">
                          <span>Harvest Frequency</span>
                          <strong>{inc.harvestsPerYear} harvest{inc.harvestsPerYear !== 1 ? 's' : ''} / year</strong>
                        </div>
                        <div className="income-param-item">
                          <span>Estimated Income per Harvest</span>
                          <strong style={{ color: 'var(--primary)' }}>{money(inc.incomePerHarvest)}</strong>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '16px 0', color: 'var(--text-dim)', fontSize: '12px', fontStyle: 'italic' }}>
                        Income data not configured
                      </div>
                    )}

                    <div className="income-card-foot">
                      <span className="income-foot-label">Estimated Annual Income:</span>
                      <span className="income-foot-val">
                        {inc.hasData ? money(inc.annualIncome) : '—'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="income-annual-banner">
              <div className="income-banner-label">
                <TrendingUp size={20} />
                <span>Total Estimated Annual Income:</span>
              </div>
              <div className="income-banner-value">
                {money(estimate.totalAnnualIncome)}
              </div>
            </div>
          </section>

          {/* 6. HISTORICAL & MARKET TREND (2021–2025) */}
          <section className="glass-card live-estimate-panel">
            <div className="live-estimate-panel-head">
              <div>
                <div className="eyebrow" style={{ color: 'var(--primary)', marginBottom: '4px' }}>05 / BENCHMARKS & VERIFICATION</div>
                <h2><BarChart3 size={20} color="var(--primary)" /> Historical & Market Trend</h2>
                <p>
                  Official year-wise historical reference prices (2021–2025) sourced from Indian public agricultural marketing divisions (Agmarknet, NHB, CDB, CAMPCO, State Forest Development Corporations).
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {estimate.plantIncomes.map((item) => (
                <div key={item.plantId} style={{ background: 'rgba(0,0,0,0.22)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text)' }}>
                      {item.plantName} — Historical Price & Yield Trend ({item.quantity} plants, Size {item.size})
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      2021 – 2025 SERIES
                    </span>
                  </div>

                  {Array.isArray(item.historicalTrend) && item.historicalTrend.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="data-table" style={{ width: '100%', fontSize: '12px' }}>
                        <thead>
                          <tr>
                            <th style={{ width: '70px' }}>Year</th>
                            <th>Reference Market Price</th>
                            <th>Expected Yield</th>
                            <th>Estimated Income</th>
                            <th>Data Source</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.historicalTrend.map((h) => (
                            <tr key={h.year}>
                              <td style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                                {h.year}
                              </td>
                              <td style={{ fontFamily: 'var(--font-mono)' }}>
                                ₹{h.referenceMarketPrice} / {h.yieldUnit || 'kg'}
                              </td>
                              <td>
                                {h.expectedYield} {h.yieldUnit || 'kg'} / plant
                              </td>
                              <td style={{ fontWeight: 'bold', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                                {money(h.estimatedIncome)}
                              </td>
                              <td style={{ fontSize: '11px', color: 'var(--text-dim)', maxWidth: '320px', lineHeight: 1.4 }}>
                                {h.dataSource}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ padding: '16px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', color: 'var(--text-dim)', fontSize: '13px', fontStyle: 'italic' }}>
                      Market data unavailable for this estimate.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 7. CURRENT INDIA MARKET CONTEXT */}
          <section className="glass-card live-estimate-panel">
            <div className="live-estimate-panel-head">
              <div>
                <div className="eyebrow" style={{ color: 'var(--primary)', marginBottom: '4px' }}>06 / MACROECONOMIC BACKGROUND</div>
                <h2><Info size={20} color="var(--primary)" /> Current India Market Context</h2>
                <p>
                  Official Indian economic indicators provided strictly as context. General economic inflation is kept distinct from crop-specific mandi prices.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '18px' }}>
              <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '14px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>Headline CPI Inflation</span>
                <strong style={{ fontSize: '20px', color: 'var(--primary)', fontFamily: 'var(--font-mono)', display: 'block', margin: '4px 0' }}>{macro.headlineCPI}</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MoSPI national consumer index</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '14px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>Rural Food Price Index (CFPI)</span>
                <strong style={{ fontSize: '20px', color: 'var(--primary)', fontFamily: 'var(--font-mono)', display: 'block', margin: '4px 0' }}>{macro.ruralCFPI}</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Agricultural labour consumer basket</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '14px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>WPI Agri Food Articles</span>
                <strong style={{ fontSize: '20px', color: 'var(--primary)', fontFamily: 'var(--font-mono)', display: 'block', margin: '4px 0' }}>{macro.wpiFoodArticles}</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Wholesale agricultural commodities</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '14px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>Fertilizer & Input Support</span>
                <strong style={{ fontSize: '14px', color: '#fff', display: 'block', margin: '4px 0', lineHeight: 1.3 }}>{macro.fertilizerSubsidySupport}</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dept of Fertilisers / DAC&FW</span>
              </div>
            </div>

            {/* SEPARATING CROP-SPECIFIC MARKET PRICE VS GENERAL INFLATION */}
            <div style={{ background: 'rgba(184, 220, 145, 0.06)', border: '1px solid rgba(184, 220, 145, 0.25)', borderRadius: '8px', padding: '14px 18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <strong style={{ color: 'var(--primary)', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                  A. Crop-Specific Market Price
                </strong>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Governed by real farmgate and APMC mandi auctions based on harvest arrival volumes, seasonality, perishability, moisture grading, and export demand.
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--primary)', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                  B. General India Inflation Context
                </strong>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Economy-wide benchmark reflecting consumer purchasing power and input costs (diesel, irrigation electricity, packaging, labor wages). <em>General inflation rate is NOT applied as the crop price.</em>
                </p>
              </div>
            </div>
          </section>

          {/* 8. FUTURE ESTIMATED RANGE */}
          <section className="glass-card live-estimate-panel">
            <div className="live-estimate-panel-head">
              <div>
                <div className="eyebrow" style={{ color: 'var(--primary)', marginBottom: '4px' }}>07 / FORWARD-LOOKING SCENARIOS</div>
                <h2><TrendingUp size={20} color="var(--primary)" /> Future Estimated Range</h2>
                <p>
                  Multi-scenario projections across conservative, expected, and higher-range outcomes. All values are clearly labelled as estimates.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(232, 141, 127, 0.08)', border: '1px solid rgba(232, 141, 127, 0.25)', borderRadius: '8px', padding: '16px' }}>
                <span style={{ fontSize: '11px', color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 'bold' }}>Conservative Estimate</span>
                <strong style={{ fontSize: '24px', color: '#fff', fontFamily: 'var(--font-mono)', display: 'block', margin: '6px 0' }}>
                  {money(estimate.totalConservativeAnnual)}
                </strong>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>
                  Accounts for lower yield realizations, erratic monsoon timing, or temporary APMC market supply gluts (~ -20%).
                </p>
              </div>

              <div style={{ background: 'rgba(184, 220, 145, 0.1)', border: '1px solid rgba(184, 220, 145, 0.4)', borderRadius: '8px', padding: '16px' }}>
                <span style={{ fontSize: '11px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 'bold' }}>Expected Estimate</span>
                <strong style={{ fontSize: '24px', color: '#fff', fontFamily: 'var(--font-mono)', display: 'block', margin: '6px 0' }}>
                  {money(estimate.totalAnnualIncome)}
                </strong>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>
                  Baseline projection based on Admin-controlled catalog yield parameters and 2025 modal mandi reference pricing.
                </p>
              </div>

              <div style={{ background: 'rgba(39, 174, 96, 0.1)', border: '1px solid rgba(39, 174, 96, 0.35)', borderRadius: '8px', padding: '16px' }}>
                <span style={{ fontSize: '11px', color: '#2ecc71', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 'bold' }}>Higher-Range Estimate</span>
                <strong style={{ fontSize: '24px', color: '#fff', fontFamily: 'var(--font-mono)', display: 'block', margin: '6px 0' }}>
                  {money(estimate.totalHigherRangeAnnual)}
                </strong>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>
                  Reflects optimal agronomic management, A-grade post-harvest sorting, and peak off-season mandi market realization (~ +20%).
                </p>
              </div>
            </div>

            {/* Per-crop breakdown */}
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Plant & Size</th>
                    <th>Quantity</th>
                    <th>Conservative Estimate (₹)</th>
                    <th>Expected Estimate (₹)</th>
                    <th>Higher-Range Estimate (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {estimate.plantIncomes.map((item) => {
                    const fr = item.futureRange;
                    return (
                      <tr key={item.plantId}>
                        <td>
                          <strong>{item.plantName}</strong>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: '6px' }}>Size {item.size}</span>
                        </td>
                        <td>{item.quantity} plants</td>
                        {fr.hasData ? (
                          <>
                            <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                              {money(fr.conservative)}
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--primary)' }}>
                              {money(fr.expected)}
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', color: '#2ecc71' }}>
                              {money(fr.higherRange)}
                            </td>
                          </>
                        ) : (
                          <td colSpan={3} style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
                            Market data unavailable for this estimate.
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
              * Future values must be clearly understood as indicative agricultural scenario estimates and do not guarantee returns.
            </div>
          </section>

          {/* 9. FINAL LIVE ESTIMATE SUMMARY */}
          <section className="glass-card live-estimate-panel" style={{ border: '1px solid rgba(184, 220, 145, 0.35)', background: 'linear-gradient(180deg, rgba(22, 38, 30, 0.75), rgba(12, 24, 18, 0.95))' }}>
            <div className="live-estimate-panel-head" style={{ borderBottom: '1px solid rgba(184, 220, 145, 0.25)' }}>
              <div>
                <div className="eyebrow" style={{ color: 'var(--primary)', marginBottom: '4px' }}>08 / EXECUTIVE SUMMARY</div>
                <h2 style={{ fontSize: '26px' }}><CircleDollarSign size={24} color="var(--primary)" /> Final Live Estimate Summary</h2>
                <p>Comprehensive overview of capital investment, annual harvest cashflow, and estimated net returns.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '14px' }}>
              <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Estimated Investment</span>
                <strong style={{ fontSize: '24px', color: '#fff', fontFamily: 'var(--font-mono)', display: 'block', margin: '4px 0' }}>
                  {money(estimate.totalInvestment)}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Plant saplings + active add-ons</span>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px' }}>
                <span style={{ fontSize: '11px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Estimated Annual Income</span>
                <strong style={{ fontSize: '24px', color: 'var(--primary)', fontFamily: 'var(--font-mono)', display: 'block', margin: '4px 0' }}>
                  {money(estimate.totalAnnualIncome)}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>* Clearly Estimated annual gross yield</span>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Estimated Income Range</span>
                <strong style={{ fontSize: '17px', color: '#fff', fontFamily: 'var(--font-mono)', display: 'block', margin: '6px 0' }}>
                  {money(estimate.totalConservativeAnnual)} – {money(estimate.totalHigherRangeAnnual)}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Conservative to higher-range</span>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Estimated Net Return</span>
                <strong style={{ fontSize: '22px', color: estimate.firstYearNetReturn >= 0 ? 'var(--primary)' : '#f39c12', fontFamily: 'var(--font-mono)', display: 'block', margin: '4px 0' }}>
                  {estimate.firstYearNetReturn >= 0 ? '+' : ''}{money(estimate.firstYearNetReturn)}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Net 1st-yr balance (Payback: ~{(estimate.totalInvestment / (estimate.totalAnnualIncome || 1)).toFixed(1)} yr)
                </span>
              </div>
            </div>

            <div className="income-disclaimer-note" style={{ marginTop: '20px' }}>
              * Clearly Estimated — All income and future market values are estimates based on published historical reference benchmarks. Actual agricultural income can vary based on weather, market demand, seasonal timing, soil fertility, location, and other factors.
            </div>
          </section>

          {/* CONFIRMATION / ACTIONS */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', marginBottom: '40px' }}>
            <button className="btn-quiet" onClick={() => onNavigate('planner')}>
              <Map size={14} /> Back to Plan Maker
            </button>
            <button className="btn-primary" style={{ padding: '0 28px', minHeight: '48px', fontSize: '14px' }} onClick={handleConfirm}>
              Confirm & Save Bill <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </PageWrap>
  );
}

function areaFor(plant, quantity) {
  const side = Number.parseFloat(String(plant.spacing).replace(/[^0-9.]/g, '')) || 1
  return Math.round(side * side * quantity).toLocaleString('en-IN')
}

function PlannerPage({ onBack, onNavigate, store }) {
  const handleGoToEstimate = () => {
    if (typeof store?.syncPlannerCountsToDraft === 'function') {
      store.syncPlannerCountsToDraft();
    }
    onNavigate('plan');
  };

  useEffect(() => { 
    const plannerState = useStore.getState();
    if (typeof plannerState.setLandAcres === 'function' && !plannerState.landAcres) {
      plannerState.setLandAcres(1);
    }
    if (store && typeof plannerState.syncWithLibrary === 'function') {
      plannerState.syncWithLibrary(store.plants, store.selectedPlantIds, store.selectedPlantSizes);
    }
    window.__navigateToPlantLibrary = () => onNavigate('catalog');
    window.__navigateToLiveEstimate = handleGoToEstimate;
    return () => { 
      window.__navigateToPlantLibrary = null;
      window.__navigateToLiveEstimate = null;
    };
  }, [onNavigate, store?.plants, store?.selectedPlantIds, store?.selectedPlantSizes]);

  return (
    <main className="planner-page-wrap">
      <div className="planner-page-bar">
        <div>
          <div className="eyebrow">FIELD LAB / INTERACTIVE</div>
          <h1>1-acre plantation planner</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-primary" onClick={handleGoToEstimate}>
            <CircleDollarSign size={14} /> Live estimate
          </button>
          <button className="btn-outline" onClick={() => onNavigate('catalog')}>
            <Library size={14} /> Plant library
          </button>
          <button className="btn-quiet" onClick={onBack}>
            <ArrowRight size={14} className="back-arrow" /> Back to workspace
          </button>
        </div>
      </div>
      <div className="planner-page">
        <PlannerWorkspace onNavigateToLibrary={() => onNavigate('catalog')} />
      </div>
    </main>
  );
}

function BillPage({ state, draft, onConfirm, onNavigate }) {
  const latest = state.bills.filter((bill) => bill.userId === state.currentUser?.id).at(-1)
  const confirmedPlan = latest ? state.plans.find((plan) => plan.id === latest.planId) : null
  const plan = confirmedPlan || draft
  const quote = calculatePlan(plan, state.plants, state.settings)
  const billId = latest?.id || 'ETR-DRAFT'
  const printBill = () => window.print()

  // Use stored estimate properties if present
  const totalAmount = latest?.totalInvestment || latest?.amount || quote.total
  const plantCost = latest?.plantCost || quote.subtotal
  const selectedAddOns = latest?.selectedAddOns || {}
  const totalAnnualIncome = latest?.totalAnnualIncome || 0

  return <PageWrap eyebrow="BILLING / CONFIRMATION" title={<>Your plantation <em>plan.</em></>} intro="A clear final check before this acre moves from screen to soil.">
    {!plan?.items?.length ? <div className="empty-state glass-card"><Receipt size={26} /><h3>No bill yet</h3><p>Build a plant shortlist and confirm the estimate to generate your first bill.</p><button className="btn-primary" onClick={() => onNavigate('catalog')}>Choose plants <ArrowRight size={14} /></button></div> : <><div className="bill-paper"><div className="bill-head"><div><div className="bill-brand"><Leaf size={17} /> ETR NURSERY</div><small>PLANTATION INTELLIGENCE</small></div><div className="bill-meta">BILL {billId}<br />{new Date().toLocaleDateString('en-IN')}<br />STATUS: {latest?.status || 'DRAFT'}</div></div><h1>Plantation plan</h1><p className="bill-intro">Prepared for {state.currentUser?.name} · {state.currentUser?.phone} · Land size: {plan.landAcres || 1} acre</p><table className="bill-table"><thead><tr><th>Plant & Size</th><th>Spacing</th><th>Unit Price</th><th>Qty</th><th>Amount</th></tr></thead><tbody>{plan.items.map((item) => { 
      const plant = state.plants.find((entry) => entry.id === item.plantId); 
      if (!plant) return null;
      const size = item.size || state.selectedPlantSizes?.[plant.id] || 'M';
      const sizePrices = getPlantSizePrices(plant);
      const unitPrice = item.price || sizePrices[size] || plant.price;
      const sizeDetails = getPlantSizeDetails(plant, size);
      return <tr key={plant.id}>
        <td>
          <strong>{plant.name}</strong>
          <div style={{ fontSize: '10px', color: '#67766b' }}>
            Size: {size} — {sizeDetails.name} ({sizeDetails.height})
          </div>
        </td>
        <td>{plant.spacing}</td>
        <td>{money(unitPrice)}</td>
        <td>{item.quantity}</td>
        <td>{money(unitPrice * item.quantity)}</td>
      </tr> 
    })}</tbody></table>
    
    <div className="bill-total-wrap">
      <div className="bill-totals" style={{ minWidth: '320px' }}>
        <div className="bill-total-line">
          <span>Plant cost</span>
          <strong>{money(plantCost)}</strong>
        </div>
        {selectedAddOns.transportation && (
          <div className="bill-total-line">
            <span>+ Transportation</span>
            <strong>{money(latest?.addOnCosts?.transportation ?? state.settings.transportation)}</strong>
          </div>
        )}
        {selectedAddOns.fencing && (
          <div className="bill-total-line">
            <span>+ Fencing</span>
            <strong>{money(latest?.addOnCosts?.fencing ?? state.settings.fencing)}</strong>
          </div>
        )}
        {selectedAddOns.dripIrrigation && (
          <div className="bill-total-line">
            <span>+ Drip Irrigation</span>
            <strong>{money(latest?.addOnCosts?.dripIrrigation ?? state.settings.dripIrrigation)}</strong>
          </div>
        )}
        {selectedAddOns.honeyBeeBox && (
          <div className="bill-total-line">
            <span>+ Honey Bee Box</span>
            <strong>{money(latest?.addOnCosts?.honeyBeeBox ?? state.settings.honeyBeeBox)}</strong>
          </div>
        )}
        <div className="bill-total-line grand">
          <span>Total Investment</span>
          <strong>{money(totalAmount)}</strong>
        </div>
        {totalAnnualIncome > 0 && (
          <div style={{ marginTop: '12px', padding: '10px 12px', background: 'rgba(39, 174, 96, 0.1)', border: '1px solid rgba(39, 174, 96, 0.3)', borderRadius: '6px', textAlign: 'right' }}>
            <span style={{ fontSize: '10px', color: '#27ae60', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>Estimated Annual Harvest Income</span>
            <strong style={{ fontSize: '16px', color: '#172619', fontFamily: 'var(--font-mono)' }}>{money(totalAnnualIncome)}</strong>
          </div>
        )}
      </div>
    </div>
    
    <div className="bill-footer">
      <span>ETR NURSERY · GROW WITH CLARITY</span>
      <span>{state.content.contact}</span>
    </div></div>
    <div className="bill-actions">
      {!latest && <button className="btn-primary" onClick={onConfirm}>Confirm & generate bill <Check size={14} /></button>}
      {latest && <button className="btn-primary" onClick={printBill}><Download size={14} /> Print / save as PDF</button>}
      <button className="btn-quiet" onClick={() => onNavigate('plan')}>Edit Live Estimate</button>
    </div></>}
  </PageWrap>
}

function ImageUploadField({ label = "Plant Photo / Image", value, onChange }) {
  const fileInputRef = useRef(null)
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP).')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result
      if (typeof dataUrl === 'string') {
        onChange(dataUrl)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="admin-field full" style={{ margin: '6px 0 12px' }}>
      <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '8px' }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
        {value ? (
          <div style={{ position: 'relative', width: '96px', height: '96px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(184, 220, 145, 0.5)', background: 'rgba(0,0,0,0.5)', flexShrink: 0 }}>
            <img 
              src={value} 
              alt="Uploaded plant photo" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
        ) : (
          <div style={{ width: '96px', height: '96px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '11px', textAlign: 'center', padding: '6px', flexShrink: 0 }}>
            <Upload size={20} style={{ marginBottom: '4px', opacity: 0.7 }} />
            No photo uploaded
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '220px' }}>
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="btn-outline btn-small"
              onClick={() => fileInputRef.current?.click()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: 'rgba(184, 220, 145, 0.12)', borderColor: 'var(--primary)', color: 'var(--primary)', fontWeight: 600 }}
            >
              <Upload size={14} />
              {value ? 'Change Plant Photo' : 'Upload Plant Image'}
            </button>
            {value && (
              <button 
                type="button" 
                className="btn-quiet btn-small"
                onClick={() => onChange('')}
                style={{ color: 'var(--danger)', fontSize: '12px' }}
              >
                Remove photo
              </button>
            )}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
            Upload a real plant photograph from your device. That exact photo will be stored and used directly on the customer-facing plant card.
          </span>
          {error && <span style={{ color: 'var(--danger)', fontSize: '11px' }}>{error}</span>}
        </div>
      </div>
    </div>
  )
}

function AdminPage({ state, activeTab, setActiveTab, onUpdatePlant, onAddPlant, onRemovePlant, onUpdateSettings, onUpdateContent, onUpdateStatus }) {
  const [newPlant, setNewPlant] = useState({ 
    name: '', 
    category: 'Fruit plants', 
    image: '',
    description: 'A considered nursery selection for plantation plans.', 
    spacing: '12 × 12 ft', 
    plantsPerAcre: 300, 
    fertilizer: '6 kg / year', 
    maintenance: 'Moderate', 
    growth: '3–4 years', 
    priceS: 70, 
    priceM: 100, 
    priceL: 150, 
    sizeInfoS: '1–2 ft nursery polybag sapling',
    sizeInfoM: '3–4 ft established container tree',
    sizeInfoL: '5–6 ft mature stock with developed rootball',
    availabilityS: 'Available',
    availabilityM: 'Available',
    availabilityL: 'Available',
    expectedYieldPerPlant: 30,
    yieldUnit: 'kg',
    expectedSellingPricePerKg: 40,
    harvestsPerYear: 1,
    color: '#98bf77' 
  })
  const [editingPlant, setEditingPlant] = useState(null)
  const [settings, setSettings] = useState(state.settings)
  const [content, setContent] = useState(state.content)
  const [plantPricingBatch, setPlantPricingBatch] = useState(() => {
    const batch = {}
    state.plants.forEach((p) => {
      const sp = getPlantSizePrices(p)
      batch[p.id] = { S: sp.S, M: sp.M, L: sp.L }
    })
    return batch
  })
  const [plantYieldBatch, setPlantYieldBatch] = useState(() => {
    const batch = {}
    state.plants.forEach((p) => {
      batch[p.id] = {
        expectedYieldPerPlant: p.expectedYieldPerPlant ?? 0,
        expectedSellingPricePerKg: p.expectedSellingPricePerKg ?? 0,
        harvestsPerYear: p.harvestsPerYear ?? 1,
        yieldUnit: p.yieldUnit || 'kg'
      }
    })
    return batch
  })
  const [pricingSavedNotice, setPricingSavedNotice] = useState(false)
  const [yieldSavedNotice, setYieldSavedNotice] = useState(false)
  const [addOnSavedNotice, setAddOnSavedNotice] = useState(false)

  const tab = activeTab.replace('admin-', '')
  const title = tab === 'admin' ? 'Command center' : tab === 'plants' ? 'Plants & categories' : tab === 'pricing' ? 'Pricing & taxes' : tab === 'content' ? 'Website content' : tab === 'users' ? 'Users' : 'Plans & bills'
  return <PageWrap eyebrow="ETR NURSERY / ADMINISTRATION" title={<>{title.split(' ')[0]} <em>{title.split(' ').slice(1).join(' ')}</em></>} intro="A private operating layer for keeping the customer experience accurate and current.">
    <div className="admin-tabs">{[['admin', 'Overview'], ['admin-plants', 'Plants'], ['admin-pricing', 'Pricing & taxes'], ['admin-content', 'Website content'], ['admin-users', 'Users'], ['admin-orders', 'Plans & bills']].map(([id, label]) => <button key={id} className={`admin-tab ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>{label}</button>)}</div>
    {tab === 'admin' && <AdminOverview state={state} setActiveTab={setActiveTab} />}
    {tab === 'plants' && <div className="admin-grid"><section className="glass-card admin-panel"><h3>Plant catalog</h3><div className="admin-list">{state.plants.map((plant) => {
      const sizePrices = getPlantSizePrices(plant)
      const plantImg = getPlantSizeImage(plant, 'M')
      return (
        <div key={plant.id}>
          <div className="admin-list-row admin-plant-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {plantImg ? (
                <img 
                  src={plantImg} 
                  alt={plant.name} 
                  style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }} 
                />
              ) : (
                <div style={{ width: '42px', height: '42px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Leaf size={16} color="var(--primary)" />
                </div>
              )}
              <div>
                <strong>{plant.name}</strong>
                <span>{plant.category} · {plant.spacing} · S: {money(sizePrices.S)} · M: {money(sizePrices.M)} · L: {money(sizePrices.L)}</span>
                
                {/* 3. ADMIN AVAILABILITY CONTROL (QUICK TOGGLES) */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Stock:</span>
                  {['S', 'M', 'L'].map((sz) => {
                    const isAvail = isPlantSizeAvailable(plant, sz)
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          onUpdatePlant(plant.id, {
                            sizeAvailability: {
                              ...(plant.sizeAvailability || { S: true, M: true, L: true }),
                              [sz]: !isAvail
                            }
                          })
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: isAvail ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                          background: isAvail ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          color: isAvail ? '#22c55e' : '#ef4444',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                        title={`Click to set ${plant.name} (${sz}) to ${isAvail ? 'Not Available' : 'Available'}`}
                      >
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: isAvail ? '#22c55e' : '#ef4444'
                        }} />
                        {sz}: {isAvail ? 'Available' : 'Not Available'}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="row-actions">
              <button className="icon-button" title="Edit plant & size details" onClick={() => setEditingPlant({ 
                ...plant, 
                image: plant.image || '',
                priceS: sizePrices.S, 
                priceM: sizePrices.M, 
                priceL: sizePrices.L,
                sizePrices: { ...sizePrices },
                sizeInfoS: plant.sizeDetails?.S || '1–2 ft nursery polybag sapling',
                sizeInfoM: plant.sizeDetails?.M || '3–4 ft established container tree',
                sizeInfoL: plant.sizeDetails?.L || '5–6 ft mature stock with developed rootball',
                availabilityS: isPlantSizeAvailable(plant, 'S') ? 'Available' : 'Not Available',
                availabilityM: isPlantSizeAvailable(plant, 'M') ? 'Available' : 'Not Available',
                availabilityL: isPlantSizeAvailable(plant, 'L') ? 'Available' : 'Not Available',
                expectedYieldPerPlant: plant.expectedYieldPerPlant ?? 0,
                expectedSellingPricePerKg: plant.expectedSellingPricePerKg ?? 0,
                harvestsPerYear: plant.harvestsPerYear ?? 1,
                yieldUnit: plant.yieldUnit || 'kg'
              })}><Pencil size={14} /></button>
              <button className="icon-button danger-icon" title="Remove plant from catalog" onClick={() => onRemovePlant(plant.id)}><Trash2 size={14} /></button>
            </div>
          </div>
          {editingPlant?.id === plant.id && (
            <div className="admin-inline-editor">
              <div className="admin-form-grid">
                {/* 2. ADMIN UPLOAD PLANT IMAGE */}
                <ImageUploadField 
                  label="Upload Plant Image" 
                  value={editingPlant.image} 
                  onChange={(img) => setEditingPlant({ ...editingPlant, image: img })} 
                />

                <AdminField label="Plant Name" value={editingPlant.name} onChange={(value) => setEditingPlant({ ...editingPlant, name: value })} />
                <div className="admin-label">
                  Category
                  <select 
                    value={editingPlant.category} 
                    onChange={(e) => setEditingPlant({ ...editingPlant, category: e.target.value })}
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="Agroforestry">Agroforestry</option>
                    <option value="Cash Crops">Cash Crops</option>
                    <option value="Palm / Plantation">Palm / Plantation</option>
                  </select>
                </div>
                <AdminField label="Spacing" value={editingPlant.spacing} onChange={(value) => setEditingPlant({ ...editingPlant, spacing: value })} />
                <AdminField label="Plants per acre" value={editingPlant.plantsPerAcre} type="number" onChange={(value) => setEditingPlant({ ...editingPlant, plantsPerAcre: value })} />
                <AdminField label="Growth" value={editingPlant.growth} onChange={(value) => setEditingPlant({ ...editingPlant, growth: value })} />
                <AdminField label="Fertilizer" value={editingPlant.fertilizer} onChange={(value) => setEditingPlant({ ...editingPlant, fertilizer: value })} />
                <AdminField label="Maintenance" value={editingPlant.maintenance} onChange={(value) => setEditingPlant({ ...editingPlant, maintenance: value })} />
                
                {/* S SIZE SECTION */}
                <div className="full" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', marginTop: '6px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    S — Small Plant (Information, Price & Availability)
                  </div>
                </div>
                <AdminField 
                  label="S — Small Plant Information" 
                  value={editingPlant.sizeInfoS || ''} 
                  onChange={(value) => setEditingPlant({ ...editingPlant, sizeInfoS: value })} 
                />
                <AdminField 
                  label="S — Small Plant Price (₹)" 
                  value={editingPlant.priceS} 
                  type="number" 
                  onChange={(value) => setEditingPlant({ ...editingPlant, priceS: value })} 
                />
                <div className="admin-label">
                  S — Small Plant Availability
                  <select 
                    value={editingPlant.availabilityS || 'Available'} 
                    onChange={(e) => setEditingPlant({ ...editingPlant, availabilityS: e.target.value })}
                  >
                    <option value="Available">🟢 Available</option>
                    <option value="Not Available">🔴 Not Available</option>
                  </select>
                </div>

                {/* M SIZE SECTION */}
                <div className="full" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', marginTop: '6px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    M — Medium Plant (Information, Price & Availability)
                  </div>
                </div>
                <AdminField 
                  label="M — Medium Plant Information" 
                  value={editingPlant.sizeInfoM || ''} 
                  onChange={(value) => setEditingPlant({ ...editingPlant, sizeInfoM: value })} 
                />
                <AdminField 
                  label="M — Medium Plant Price (₹)" 
                  value={editingPlant.priceM} 
                  type="number" 
                  onChange={(value) => setEditingPlant({ ...editingPlant, priceM: value, price: value })} 
                />
                <div className="admin-label">
                  M — Medium Plant Availability
                  <select 
                    value={editingPlant.availabilityM || 'Available'} 
                    onChange={(e) => setEditingPlant({ ...editingPlant, availabilityM: e.target.value })}
                  >
                    <option value="Available">🟢 Available</option>
                    <option value="Not Available">🔴 Not Available</option>
                  </select>
                </div>

                {/* L SIZE SECTION */}
                <div className="full" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', marginTop: '6px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    L — Large Plant (Information, Price & Availability)
                  </div>
                </div>
                <AdminField 
                  label="L — Large Plant Information" 
                  value={editingPlant.sizeInfoL || ''} 
                  onChange={(value) => setEditingPlant({ ...editingPlant, sizeInfoL: value })} 
                />
                <AdminField 
                  label="L — Large Plant Price (₹)" 
                  value={editingPlant.priceL} 
                  type="number" 
                  onChange={(value) => setEditingPlant({ ...editingPlant, priceL: value })} 
                />
                <div className="admin-label">
                  L — Large Plant Availability
                  <select 
                    value={editingPlant.availabilityL || 'Available'} 
                    onChange={(e) => setEditingPlant({ ...editingPlant, availabilityL: e.target.value })}
                  >
                    <option value="Available">🟢 Available</option>
                    <option value="Not Available">🔴 Not Available</option>
                  </select>
                </div>

                <div className="full" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', marginTop: '6px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Income Estimation Data (Admin Controlled)
                  </div>
                </div>
                <AdminField 
                  label="Expected Yield per Plant (kg)" 
                  value={editingPlant.expectedYieldPerPlant} 
                  type="number" 
                  onChange={(value) => setEditingPlant({ ...editingPlant, expectedYieldPerPlant: value })} 
                />
                <AdminField 
                  label="Expected Selling Price per kg (₹)" 
                  value={editingPlant.expectedSellingPricePerKg} 
                  type="number" 
                  onChange={(value) => setEditingPlant({ ...editingPlant, expectedSellingPricePerKg: value })} 
                />
                <AdminField 
                  label="Harvests per Year" 
                  value={editingPlant.harvestsPerYear} 
                  type="number" 
                  onChange={(value) => setEditingPlant({ ...editingPlant, harvestsPerYear: value })} 
                />

                <AdminField label="Description" value={editingPlant.description} full textarea onChange={(value) => setEditingPlant({ ...editingPlant, description: value })} />
              </div>
              <div className="admin-actions">
                <button className="btn-quiet" onClick={() => setEditingPlant(null)}>Cancel</button>
                <button className="btn-primary" onClick={() => { 
                  const sVal = Number(editingPlant.priceS || editingPlant.sizePrices?.S || 1)
                  const mVal = Number(editingPlant.priceM || editingPlant.price || editingPlant.sizePrices?.M || 1)
                  const lVal = Number(editingPlant.priceL || editingPlant.sizePrices?.L || 1)
                  onUpdatePlant(plant.id, {
                    ...editingPlant,
                    image: editingPlant.image,
                    price: mVal,
                    sizePrices: { S: sVal, M: mVal, L: lVal },
                    sizeAvailability: {
                      S: editingPlant.availabilityS === 'Available',
                      M: editingPlant.availabilityM === 'Available',
                      L: editingPlant.availabilityL === 'Available',
                    },
                    sizeDetails: {
                      S: editingPlant.sizeInfoS || '1–2 ft nursery polybag sapling',
                      M: editingPlant.sizeInfoM || '3–4 ft established container tree',
                      L: editingPlant.sizeInfoL || '5–6 ft mature stock with developed rootball',
                    },
                    expectedYieldPerPlant: Number(editingPlant.expectedYieldPerPlant || 0),
                    expectedSellingPricePerKg: Number(editingPlant.expectedSellingPricePerKg || 0),
                    harvestsPerYear: Number(editingPlant.harvestsPerYear || 1)
                  })
                  setEditingPlant(null) 
                }}>
                  <Save size={14} /> Save plant
                </button>
              </div>
            </div>
          )}
        </div>
      )
    })}</div></section>
    
    {/* 1. ADMIN SHOULD ADD PLANTS/PLANS WITH IMAGE UPLOAD & AVAILABILITY */}
    <section className="glass-card admin-panel">
      <h3>Add a plant / plan</h3>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Add a new nursery plant or plantation crop with real photo upload, S/M/L nursery size prices, size details, and stock availability.
      </p>
      <div className="admin-form-grid">
        {/* 2. ADMIN UPLOAD PLANT IMAGE */}
        <ImageUploadField 
          label="Upload Plant Image" 
          value={newPlant.image} 
          onChange={(img) => setNewPlant({ ...newPlant, image: img })} 
        />

        <AdminField label="Plant Name" value={newPlant.name} onChange={(value) => setNewPlant({ ...newPlant, name: value })} />
        <div className="admin-label">
          Category
          <select 
            value={newPlant.category} 
            onChange={(e) => setNewPlant({ ...newPlant, category: e.target.value })}
          >
            {CATEGORIES.filter(c => c !== 'All').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="Agroforestry">Agroforestry</option>
            <option value="Cash Crops">Cash Crops</option>
            <option value="Palm / Plantation">Palm / Plantation</option>
          </select>
        </div>
        <AdminField label="Spacing" value={newPlant.spacing} onChange={(value) => setNewPlant({ ...newPlant, spacing: value })} />
        <AdminField label="Plants per acre" value={newPlant.plantsPerAcre} type="number" onChange={(value) => setNewPlant({ ...newPlant, plantsPerAcre: value })} />
        <AdminField label="Growth" value={newPlant.growth} onChange={(value) => setNewPlant({ ...newPlant, growth: value })} />
        <AdminField label="Fertilizer" value={newPlant.fertilizer} onChange={(value) => setNewPlant({ ...newPlant, fertilizer: value })} />
        <AdminField label="Maintenance" value={newPlant.maintenance} onChange={(value) => setNewPlant({ ...newPlant, maintenance: value })} />
        
        {/* S SIZE SECTION */}
        <div className="full" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', marginTop: '6px' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            S — Small Plant (Information, Price & Availability)
          </div>
        </div>
        <AdminField 
          label="S — Small Plant Information" 
          value={newPlant.sizeInfoS} 
          onChange={(value) => setNewPlant({ ...newPlant, sizeInfoS: value })} 
        />
        <AdminField 
          label="S — Small Plant Price (₹)" 
          value={newPlant.priceS} 
          type="number" 
          onChange={(value) => setNewPlant({ ...newPlant, priceS: value })} 
        />
        <div className="admin-label">
          S — Small Plant Availability
          <select 
            value={newPlant.availabilityS} 
            onChange={(e) => setNewPlant({ ...newPlant, availabilityS: e.target.value })}
          >
            <option value="Available">🟢 Available</option>
            <option value="Not Available">🔴 Not Available</option>
          </select>
        </div>

        {/* M SIZE SECTION */}
        <div className="full" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', marginTop: '6px' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            M — Medium Plant (Information, Price & Availability)
          </div>
        </div>
        <AdminField 
          label="M — Medium Plant Information" 
          value={newPlant.sizeInfoM} 
          onChange={(value) => setNewPlant({ ...newPlant, sizeInfoM: value })} 
        />
        <AdminField 
          label="M — Medium Plant Price (₹)" 
          value={newPlant.priceM} 
          type="number" 
          onChange={(value) => setNewPlant({ ...newPlant, priceM: value, price: value })} 
        />
        <div className="admin-label">
          M — Medium Plant Availability
          <select 
            value={newPlant.availabilityM} 
            onChange={(e) => setNewPlant({ ...newPlant, availabilityM: e.target.value })}
          >
            <option value="Available">🟢 Available</option>
            <option value="Not Available">🔴 Not Available</option>
          </select>
        </div>

        {/* L SIZE SECTION */}
        <div className="full" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', marginTop: '6px' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            L — Large Plant (Information, Price & Availability)
          </div>
        </div>
        <AdminField 
          label="L — Large Plant Information" 
          value={newPlant.sizeInfoL} 
          onChange={(value) => setNewPlant({ ...newPlant, sizeInfoL: value })} 
        />
        <AdminField 
          label="L — Large Plant Price (₹)" 
          value={newPlant.priceL} 
          type="number" 
          onChange={(value) => setNewPlant({ ...newPlant, priceL: value })} 
        />
        <div className="admin-label">
          L — Large Plant Availability
          <select 
            value={newPlant.availabilityL} 
            onChange={(e) => setNewPlant({ ...newPlant, availabilityL: e.target.value })}
          >
            <option value="Available">🟢 Available</option>
            <option value="Not Available">🔴 Not Available</option>
          </select>
        </div>
        
        {/* INCOME PARAMETERS */}
        <div className="full" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', marginTop: '6px' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Income Estimation Data (Admin Controlled)
          </div>
        </div>
        <AdminField label="Expected Yield per Plant (kg)" value={newPlant.expectedYieldPerPlant} type="number" onChange={(value) => setNewPlant({ ...newPlant, expectedYieldPerPlant: value })} />
        <AdminField label="Expected Selling Price per kg (₹)" value={newPlant.expectedSellingPricePerKg} type="number" onChange={(value) => setNewPlant({ ...newPlant, expectedSellingPricePerKg: value })} />
        <AdminField label="Harvests per Year" value={newPlant.harvestsPerYear} type="number" onChange={(value) => setNewPlant({ ...newPlant, harvestsPerYear: value })} />

        <AdminField label="Description" value={newPlant.description} full textarea onChange={(value) => setNewPlant({ ...newPlant, description: value })} />
      </div>
      <div className="admin-actions">
        <button className="btn-primary" onClick={() => { 
          if (newPlant.name.trim()) { 
            const sVal = Number(newPlant.priceS || Math.round(Number(newPlant.priceM || 100) * 0.68))
            const mVal = Number(newPlant.priceM || 100)
            const lVal = Number(newPlant.priceL || Math.round(Number(newPlant.priceM || 100) * 1.48))
            onAddPlant({
              ...newPlant,
              image: newPlant.image,
              shortName: newPlant.name,
              price: mVal,
              sizePrices: { S: sVal, M: mVal, L: lVal },
              sizeAvailability: {
                S: newPlant.availabilityS === 'Available',
                M: newPlant.availabilityM === 'Available',
                L: newPlant.availabilityL === 'Available',
              },
              sizeDetails: {
                S: newPlant.sizeInfoS || '1–2 ft nursery polybag sapling',
                M: newPlant.sizeInfoM || '3–4 ft established container tree',
                L: newPlant.sizeInfoL || '5–6 ft mature stock with developed rootball',
              },
              expectedYieldPerPlant: Number(newPlant.expectedYieldPerPlant || 0),
              expectedSellingPricePerKg: Number(newPlant.expectedSellingPricePerKg || 0),
              harvestsPerYear: Number(newPlant.harvestsPerYear || 1)
            })
            setNewPlant({ 
              name: '', 
              category: 'Fruit plants', 
              image: '',
              description: 'A considered nursery selection for plantation plans.', 
              spacing: '12 × 12 ft', 
              plantsPerAcre: 300, 
              fertilizer: '6 kg / year', 
              maintenance: 'Moderate', 
              growth: '3–4 years', 
              priceS: 70, 
              priceM: 100, 
              priceL: 150, 
              sizeInfoS: '1–2 ft nursery polybag sapling',
              sizeInfoM: '3–4 ft established container tree',
              sizeInfoL: '5–6 ft mature stock with developed rootball',
              availabilityS: 'Available',
              availabilityM: 'Available',
              availabilityL: 'Available',
              expectedYieldPerPlant: 30,
              yieldUnit: 'kg',
              expectedSellingPricePerKg: 40,
              harvestsPerYear: 1,
              color: '#98bf77' 
            }) 
          } 
        }}>
          Add plant to catalog <Plus size={14} />
        </button>
      </div>
    </section>
  </div>}
    {tab === 'pricing' && <>
      {/* 1. ADMIN ADD-ON PRICING */}
      <section className="glass-card admin-panel narrow-panel">
        <div className="section-intro">
          <div className="eyebrow">OPTIONAL SERVICES & PRODUCTS</div>
          <h3>Add-on Pricing (Controlled by Admin)</h3>
          <p>Admin-controlled pricing for optional items in the Live Estimate. Changes immediately reflect in customer bills.</p>
        </div>
        <div className="admin-form-grid">
          <AdminField 
            label="Transportation Price (₹)" 
            value={settings.transportation ?? 5000} 
            type="number" 
            onChange={(value) => setSettings({ ...settings, transportation: Number(value) })} 
          />
          <AdminField 
            label="Fencing Price (₹)" 
            value={settings.fencing ?? 25000} 
            type="number" 
            onChange={(value) => setSettings({ ...settings, fencing: Number(value) })} 
          />
          <AdminField 
            label="Drip Irrigation Price (₹)" 
            value={settings.dripIrrigation ?? 35000} 
            type="number" 
            onChange={(value) => setSettings({ ...settings, dripIrrigation: Number(value) })} 
          />
          <AdminField 
            label="Honey Bee Box / Beekeeping Price (₹)" 
            value={settings.honeyBeeBox ?? 8000} 
            type="number" 
            onChange={(value) => setSettings({ ...settings, honeyBeeBox: Number(value) })} 
          />
        </div>
        {addOnSavedNotice && <div className="notice" style={{ marginTop: '12px', color: 'var(--primary)' }}>Add-on prices saved successfully and active in Live Estimate!</div>}
        <div className="admin-actions">
          <button className="btn-primary" onClick={() => {
            onUpdateSettings(settings);
            setAddOnSavedNotice(true);
            setTimeout(() => setAddOnSavedNotice(false), 3000);
          }}>
            <Save size={14} /> Save add-on pricing
          </button>
        </div>
      </section>

      {/* 2. PLANT YIELD & INCOME DATA (ADMIN CONTROLLED) */}
      <section className="glass-card admin-panel narrow-panel" style={{ marginTop: '20px' }}>
        <div className="section-intro">
          <div className="eyebrow">AGRICULTURAL YIELD & INCOME</div>
          <h3>Plant Yield & Income Data</h3>
          <p>Control agricultural yield parameters and expected selling price for each plant. If external/current market data is connected later, it can update these parameters seamlessly.</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Plant</th>
                <th>Expected Yield (kg/plant)</th>
                <th>Selling Price (₹/kg)</th>
                <th>Harvests / Year</th>
                <th>Est. Annual / Plant</th>
              </tr>
            </thead>
            <tbody>
              {state.plants.map((plant) => {
                const yieldVal = plantYieldBatch[plant.id]?.expectedYieldPerPlant ?? plant.expectedYieldPerPlant ?? 0;
                const priceVal = plantYieldBatch[plant.id]?.expectedSellingPricePerKg ?? plant.expectedSellingPricePerKg ?? 0;
                const harvestsVal = plantYieldBatch[plant.id]?.harvestsPerYear ?? plant.harvestsPerYear ?? 1;
                const estAnnualPerPlant = Math.round(yieldVal * priceVal * harvestsVal);
                return (
                  <tr key={plant.id}>
                    <td>
                      <strong>{plant.name}</strong>
                      <small style={{ display: 'block', color: 'var(--text-dim)', fontSize: '9px' }}>{plant.category}</small>
                    </td>
                    <td>
                      <input
                        type="number"
                        style={{ width: '80px', padding: '6px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)', borderRadius: '4px', color: '#fff', fontSize: '11px' }}
                        value={yieldVal}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPlantYieldBatch(prev => ({
                            ...prev,
                            [plant.id]: {
                              expectedYieldPerPlant: val,
                              expectedSellingPricePerKg: prev[plant.id]?.expectedSellingPricePerKg ?? plant.expectedSellingPricePerKg ?? 0,
                              harvestsPerYear: prev[plant.id]?.harvestsPerYear ?? plant.harvestsPerYear ?? 1,
                            }
                          }));
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        style={{ width: '80px', padding: '6px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)', borderRadius: '4px', color: '#fff', fontSize: '11px' }}
                        value={priceVal}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPlantYieldBatch(prev => ({
                            ...prev,
                            [plant.id]: {
                              expectedYieldPerPlant: prev[plant.id]?.expectedYieldPerPlant ?? plant.expectedYieldPerPlant ?? 0,
                              expectedSellingPricePerKg: val,
                              harvestsPerYear: prev[plant.id]?.harvestsPerYear ?? plant.harvestsPerYear ?? 1,
                            }
                          }));
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        style={{ width: '60px', padding: '6px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)', borderRadius: '4px', color: '#fff', fontSize: '11px' }}
                        value={harvestsVal}
                        min="1"
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPlantYieldBatch(prev => ({
                            ...prev,
                            [plant.id]: {
                              expectedYieldPerPlant: prev[plant.id]?.expectedYieldPerPlant ?? plant.expectedYieldPerPlant ?? 0,
                              expectedSellingPricePerKg: prev[plant.id]?.expectedSellingPricePerKg ?? plant.expectedSellingPricePerKg ?? 0,
                              harvestsPerYear: val,
                            }
                          }));
                        }}
                      />
                    </td>
                    <td style={{ color: estAnnualPerPlant > 0 ? 'var(--primary)' : 'var(--text-dim)', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
                      {estAnnualPerPlant > 0 ? `₹${estAnnualPerPlant.toLocaleString('en-IN')}` : 'Not configured'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {yieldSavedNotice && <div className="notice" style={{ marginTop: '12px', color: 'var(--primary)' }}>Plant yield and income data saved successfully!</div>}
        <div className="admin-actions">
          <button 
            className="btn-primary" 
            onClick={() => {
              state.plants.forEach((plant) => {
                const batch = plantYieldBatch[plant.id];
                if (batch) {
                  onUpdatePlant(plant.id, {
                    expectedYieldPerPlant: Number(batch.expectedYieldPerPlant),
                    expectedSellingPricePerKg: Number(batch.expectedSellingPricePerKg),
                    harvestsPerYear: Number(batch.harvestsPerYear)
                  });
                }
              });
              setYieldSavedNotice(true);
              setTimeout(() => setYieldSavedNotice(false), 3000);
            }}
          >
            <Save size={14} /> Save all plant income data
          </button>
        </div>
      </section>

      {/* 3. PLANT SELECTION SIZE (S, M, L) PRICING MANAGER */}
      <section className="glass-card admin-panel narrow-panel" style={{ marginTop: '20px' }}>
        <div className="section-intro">
          <div className="eyebrow">PLANT LIBRARY PRICING</div>
          <h3>Plant Selection Size Pricing (S, M, L)</h3>
          <p>Update physical nursery plant size prices for every plant in the collection. S = Small Plant, M = Medium Plant, L = Large Plant.</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Plant</th>
                <th>S — Small Plant (₹)</th>
                <th>M — Medium Plant (₹)</th>
                <th>L — Large Plant (₹)</th>
              </tr>
            </thead>
            <tbody>
              {state.plants.map((plant) => {
                const currentSizes = plantPricingBatch[plant.id] || getPlantSizePrices(plant)
                return (
                  <tr key={plant.id}>
                    <td>
                      <strong>{plant.name}</strong>
                      <small style={{ display: 'block', color: 'var(--text-dim)', fontSize: '9px' }}>{plant.category} · {plant.spacing}</small>
                    </td>
                    <td>
                      <input
                        type="number"
                        style={{ width: '90px', padding: '6px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)', borderRadius: '4px', color: '#fff', fontSize: '11px' }}
                        value={currentSizes.S}
                        onChange={(e) => {
                          const val = Number(e.target.value)
                          setPlantPricingBatch(prev => ({
                            ...prev,
                            [plant.id]: { ...(prev[plant.id] || getPlantSizePrices(plant)), S: val }
                          }))
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        style={{ width: '90px', padding: '6px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)', borderRadius: '4px', color: '#fff', fontSize: '11px' }}
                        value={currentSizes.M}
                        onChange={(e) => {
                          const val = Number(e.target.value)
                          setPlantPricingBatch(prev => ({
                            ...prev,
                            [plant.id]: { ...(prev[plant.id] || getPlantSizePrices(plant)), M: val }
                          }))
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        style={{ width: '90px', padding: '6px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)', borderRadius: '4px', color: '#fff', fontSize: '11px' }}
                        value={currentSizes.L}
                        onChange={(e) => {
                          const val = Number(e.target.value)
                          setPlantPricingBatch(prev => ({
                            ...prev,
                            [plant.id]: { ...(prev[plant.id] || getPlantSizePrices(plant)), L: val }
                          }))
                        }}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {pricingSavedNotice && <div className="notice" style={{ marginTop: '12px' }}>Plant Selection Size prices updated and saved successfully!</div>}
        <div className="admin-actions">
          <button 
            className="btn-primary" 
            onClick={() => {
              state.plants.forEach((plant) => {
                const pricesObj = plantPricingBatch[plant.id]
                if (pricesObj) {
                  onUpdatePlant(plant.id, {
                    sizePrices: {
                      S: Number(pricesObj.S),
                      M: Number(pricesObj.M),
                      L: Number(pricesObj.L)
                    },
                    price: Number(pricesObj.M)
                  })
                }
              })
              setPricingSavedNotice(true)
              setTimeout(() => setPricingSavedNotice(false), 3000)
            }}
          >
            <Save size={14} /> Save all plant size prices
          </button>
        </div>
      </section>

      {/* 4. LAND PACKAGES */}
      <section className="glass-card admin-panel narrow-panel" style={{ marginTop: '20px' }}>
        <div className="section-intro">
          <div className="eyebrow">LAND PACKAGES</div>
          <h3>Land Collection pricing (S, M, L)</h3>
          <p>Update base planning and allocation prices for Small (S), Medium (M), and Large (L) parcels.</p>
        </div>
        <div className="admin-form-grid">
          <AdminField 
            label="Small Plot (S — 0.5 Acre) Price (₹)" 
            value={settings.landPricing?.S?.price ?? defaultLandPricing.S.price} 
            type="number" 
            onChange={(value) => setSettings({
              ...settings,
              landPricing: {
                ...settings.landPricing,
                S: { ...(settings.landPricing?.S || defaultLandPricing.S), price: Number(value) }
              }
            })} 
          />
          <AdminField 
            label="Standard Acre (M — 1.0 Acre) Price (₹)" 
            value={settings.landPricing?.M?.price ?? defaultLandPricing.M.price} 
            type="number" 
            onChange={(value) => setSettings({
              ...settings,
              landPricing: {
                ...settings.landPricing,
                M: { ...(settings.landPricing?.M || defaultLandPricing.M), price: Number(value) }
              }
            })} 
          />
          <AdminField 
            label="Estate Acreage (L — 2.5 Acres) Price (₹)" 
            value={settings.landPricing?.L?.price ?? defaultLandPricing.L.price} 
            type="number" 
            onChange={(value) => setSettings({
              ...settings,
              landPricing: {
                ...settings.landPricing,
                L: { ...(settings.landPricing?.L || defaultLandPricing.L), price: Number(value) }
              }
            })} 
          />
        </div>
        <div className="admin-actions">
          <button className="btn-primary" onClick={() => onUpdateSettings(settings)}>
            <Save size={14} /> Save land pricing
          </button>
        </div>
      </section>
    </>}
    {tab === 'content' && <section className="glass-card admin-panel narrow-panel"><div className="section-intro"><h3>Website language</h3><p>Keep the public ETR story aligned with the business.</p></div><div className="admin-form-grid"><AdminField label="Hero title" value={content.heroTitle} full onChange={(value) => setContent({ ...content, heroTitle: value })} /><AdminField label="Hero subtitle" value={content.heroSubtitle} full onChange={(value) => setContent({ ...content, heroSubtitle: value })} /><AdminField label="Nursery description" value={content.description} full textarea onChange={(value) => setContent({ ...content, description: value })} /><AdminField label="Services" value={content.services} full textarea onChange={(value) => setContent({ ...content, services: value })} /><AdminField label="Contact information" value={content.contact} full onChange={(value) => setContent({ ...content, contact: value })} /></div><div className="admin-actions"><button className="btn-primary" onClick={() => onUpdateContent(content)}><Check size={14} /> Save website content</button></div></section>}
    {tab === 'users' && <section className="glass-card admin-panel"><h3>Registered users</h3><DataTable headers={['Name', 'Phone', 'Registered', 'Plans']} rows={state.users.map((user) => [<strong>{user.name}</strong>, user.phone, new Date(user.registeredAt).toLocaleDateString('en-IN'), state.plans.filter((plan) => plan.userId === user.id && plan.status !== 'draft').length])} empty="No user workspaces yet." /></section>}
    {tab === 'orders' && <section className="glass-card admin-panel"><h3>Plans & bills</h3><DataTable headers={['Bill', 'Customer', 'Amount', 'Status', 'Update']} rows={state.bills.map((bill) => { const user = state.users.find((entry) => entry.id === bill.userId); return [bill.id, user?.name || 'Guest', money(bill.amount), <span className={`status-tag ${bill.status === 'review' ? 'pending' : ''}`}>{bill.status}</span>, <select className="status-select" value={bill.status} onChange={(event) => onUpdateStatus(bill.id, event.target.value)}><option value="review">Review</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option></select>] })} empty="Confirmed bills will appear here." /></section>}
  </PageWrap>
}

function AdminOverview({ state, setActiveTab }) {
  const revenue = state.bills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0)
  return <><div className="metric-grid"><Metric label="Plant catalog" value={String(state.plants.length)} note="Live selections" /><Metric label="Registered users" value={String(state.users.length)} note="Customer workspaces" /><Metric label="Bills generated" value={String(state.bills.length)} note="Across all plans" /><Metric label="Gross estimate" value={money(revenue)} note="Confirmed value" /></div><div className="admin-overview-grid"><div className="glass-card admin-panel"><div className="card-kicker">OPERATING LAYER</div><h3>What needs attention</h3><div className="admin-list"><button className="admin-list-row clickable" onClick={() => setActiveTab('admin-plants')}><span><strong>Review catalog pricing</strong><small>Keep live nursery prices accurate</small></span><ChevronRight size={15} /></button><button className="admin-list-row clickable" onClick={() => setActiveTab('admin-orders')}><span><strong>Review incoming plans</strong><small>{state.bills.filter((bill) => bill.status === 'review').length} bills waiting for a response</small></span><ChevronRight size={15} /></button><button className="admin-list-row clickable" onClick={() => setActiveTab('admin-content')}><span><strong>Refresh the public story</strong><small>Edit hero, services, and contact details</small></span><ChevronRight size={15} /></button></div></div><div className="glass-card admin-panel admin-signal"><Shield size={25} /><div className="eyebrow">CONTROL SIGNAL</div><h3>All systems are local and live.</h3><p>Changes to the catalog and pricing rules are reflected in the customer estimate immediately in this prototype.</p></div></div></>
}

function AdminField({ label, value, onChange, type = 'text', full = false, textarea = false }) { const Tag = textarea ? 'textarea' : 'input'; return <label className={`admin-label ${full ? 'full' : ''}`}>{label}<Tag type={textarea ? undefined : type} value={value} onChange={(event) => onChange(event.target.value)} /></label> }
function DataTable({ headers, rows, empty }) { return rows.length ? <div className="table-scroll"><table className="data-table"><thead><tr>{headers.map((head) => <th key={head}>{head}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div> : <div className="empty-table">{empty}</div> }

export default function App() {
  const store = useETRStore()
  const [view, setView] = useState(store.currentUser ? 'dashboard' : 'landing')
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminTab, setAdminTab] = useState('admin')

  useEffect(() => { if (store.currentUser && view === 'landing') setView('dashboard') }, [store.currentUser, view])
  const draft = store.draftPlan
  const navigate = (next) => {
    if (next === 'lands') {
      if (store.currentUser) {
        setView('dashboard')
        setTimeout(() => {
          document.getElementById('land-collection-section')?.scrollIntoView({ behavior: 'smooth' })
        }, 80)
      } else {
        setView('landing')
        setTimeout(() => {
          document.getElementById('land-collection-section')?.scrollIntoView({ behavior: 'smooth' })
        }, 80)
      }
    } else if (next === 'catalog') {
      if (store.currentUser) {
        setView('dashboard')
        setTimeout(() => {
          document.getElementById('plant-library-section')?.scrollIntoView({ behavior: 'smooth' })
        }, 80)
      } else {
        setView('landing')
        setTimeout(() => {
          document.getElementById('plant-library-section')?.scrollIntoView({ behavior: 'smooth' })
        }, 80)
      }
    } else if (next === 'catalog-public') {
      setView('landing')
      setTimeout(() => {
        document.getElementById('plant-library-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 80)
    } else if (next === 'plan') {
      if (typeof store.syncPlannerCountsToDraft === 'function') {
        store.syncPlannerCountsToDraft()
      }
      setView('plan')
    } else if (next === 'user-auth' || next === 'admin-auth') {
      setView(next)
    } else if (next === 'admin' || next.startsWith('admin-')) {
      setIsAdmin(true)
      setAdminTab(next)
      setView('admin')
    } else {
      setView(next)
    }
  }
  const userLogin = (name, phone) => { store.loginUser(name, phone); setView('dashboard') }
  const adminLogin = (username, password) => { const valid = store.adminLogin(username, password); if (valid) { setIsAdmin(true); setAdminTab('admin'); setView('admin') } return valid }
  const logout = () => { store.logout(); setIsAdmin(false); setView('landing') }
  const confirmPlan = (customQuote) => { 
    if (customQuote && customQuote.totalInvestment !== undefined) {
      store.savePlan(customQuote);
    } else {
      const quote = calculatePlan(draft, store.plants, store.settings);
      store.savePlan({ ...quote, items: draft?.items || [], landAcres: 1 });
    }
    setView('bill');
  }

  if (view === 'intro') return <Intro onSkip={() => { store.patch({ introSeen: true }); setView('landing') }} />
  if (view === 'landing') return <Landing content={store.content} state={store} onToggleSelect={store.togglePlantSelection} onNavigate={navigate} />
  if (view === 'user-auth') return <AuthPage mode="user" onBack={() => setView('landing')} onUserLogin={userLogin} onAdminLogin={adminLogin} />
  if (view === 'admin-auth') return <AuthPage mode="admin" onBack={(next) => next ? setView(next) : setView('landing')} onUserLogin={userLogin} onAdminLogin={adminLogin} />
  if (view === 'catalog-public') return <Landing content={store.content} state={store} onToggleSelect={store.togglePlantSelection} onNavigate={navigate} />
  if (isAdmin && view === 'admin') return <Shell admin active={adminTab} onNavigate={(next) => { setAdminTab(next); setView('admin') }} onLogout={logout}>{<AdminPage state={store} activeTab={adminTab} setActiveTab={setAdminTab} onUpdatePlant={store.updatePlant} onAddPlant={store.addPlant} onRemovePlant={store.removePlant} onUpdateSettings={store.updateSettings} onUpdateContent={store.updateContent} onUpdateStatus={(id, status) => store.patch((current) => ({ bills: current.bills.map((bill) => bill.id === id ? { ...bill, status } : bill), plans: current.plans.map((plan) => { const bill = current.bills.find((entry) => entry.id === id); return bill && plan.id === bill.planId ? { ...plan, status } : plan }) }))} />}</Shell>
  const effectiveUser = store.currentUser || { id: 'usr-karthik', name: 'Karthik Naidu', phone: '+91 98490 21212', registeredAt: '2026-01-01' }
  if (!store.currentUser && view !== 'planner') return <AuthPage mode="user" onBack={() => setView('landing')} onUserLogin={userLogin} onAdminLogin={adminLogin} />
  let page = null
  if (view === 'dashboard' || view === 'catalog') page = <Dashboard user={effectiveUser} state={store} onNavigate={navigate} />
  if (view === 'planner') page = <PlannerPage store={store} onBack={() => setView(store.currentUser ? 'dashboard' : 'landing')} onNavigate={navigate} />
  if (view === 'plan') page = <PlanPage state={store} draft={draft} onUpdateItems={store.updatePlanItems} onNavigate={navigate} onConfirm={confirmPlan} onSelectPlantSize={store.setPlantSelectedSize} />
  if (view === 'bill') page = <BillPage state={store} draft={draft} onConfirm={confirmPlan} onNavigate={navigate} />
  return <Shell user={effectiveUser} active={view === 'catalog' ? 'dashboard' : view} onNavigate={navigate} onLogout={logout}>{page}</Shell>
}

function LandingPublicBar({ onBack, onLogin }) { return <div className="public-bar"><button className="back-link" onClick={onBack}><ArrowRight size={14} className="back-arrow" /> Back to ETR</button><BrandMark /><button className="btn-primary" onClick={onLogin}>Sign in <ArrowRight size={14} /></button></div> }