import { useState, useMemo } from 'react'
import { useStore, isPointInRotatedRect } from '../store'

export default function Sidebar({ onNavigateToLibrary }) {
  const { 
    landAcres, 
    borderWidth, setBorderWidth,
    cropZones, addCropZone, updateCropZone, removeCropZone,
    borderZone, updateBorderZone, autoArrangeBorder,
    autoArrangeZone, manualPlacementZoneId, setManualPlacementZoneId,
    measuring, setMeasuring, clearAllPlants, plants,
    activeDrawTool, setActiveDrawTool,
    addInfrastructure, infrastructure, addFullRoad,
    showStats, toggleStats,
    getAvailablePlants, libraryPlants
  } = useStore()

  const availablePlants = useMemo(() => {
    return typeof getAvailablePlants === 'function' ? getAvailablePlants() : []
  }, [getAvailablePlants, cropZones, borderZone, plants])

  const visiblePlants = useMemo(() => {
    return plants.filter(p => {
      let isRemoved = false;
      for (const inf of infrastructure) {
        if (inf.type === 'Borewell' || inf.type === 'Water Tank') {
          const dist = Math.hypot(p.x - inf.x, p.z - inf.z);
          if (dist <= (inf.radius || inf.width/2)) { isRemoved = true; break; }
        } else {
          if (isPointInRotatedRect(p.x, p.z, inf.x, inf.z, inf.width, inf.length, inf.rotation)) {
            isRemoved = true; break;
          }
        }
      }
      return !isRemoved;
    });
  }, [plants, infrastructure]);
  
  const totalPercentage = cropZones.reduce((s, z) => s + z.percentage, 0);
  const isValidAllocation = totalPercentage === 100;

  const borderPlacedCount = visiblePlants.filter(p => p.zoneId === 'border-zone').length;

  const [infraMenuOpen, setInfraMenuOpen] = useState(true);

  // Single source of truth lookup for border plant
  const borderPlantInfo = useMemo(() => {
    const list = libraryPlants && libraryPlants.length > 0 ? libraryPlants : [];
    return list.find(p => (p.shortName || p.name) === borderZone.type || p.name === borderZone.type || p.id === borderZone.type);
  }, [libraryPlants, borderZone.type]);

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Farm Land Planner</h2>
      
      {/* HIGHLIGHTED STATS TOGGLE */}
      <button 
        onClick={toggleStats}
        style={{
          width: '100%',
          padding: '12px',
          background: showStats ? 'var(--primary)' : 'var(--secondary)',
          color: 'white',
          border: showStats ? '1px solid #059669' : '1px solid var(--border)',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '1rem',
          marginBottom: '20px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: showStats ? '0 0 15px rgba(16, 185, 129, 0.4)' : 'none',
          transition: 'all 0.3s'
        }}
      >
        <span>Farm Space Stats</span>
        <span style={{ 
          background: showStats ? 'white' : '#475569', 
          color: showStats ? 'var(--primary)' : 'white',
          padding: '2px 8px', 
          borderRadius: '12px', 
          fontSize: '0.8rem' 
        }}>
          {showStats ? 'ON' : 'OFF'}
        </span>
      </button>

      {/* ACTIVE PLANT LIBRARY SELECTION SUMMARY */}
      {/* SELECTED PLANTS CARRIED FROM PLANT LIBRARY */}
      <div style={{
        background: 'rgba(184, 220, 145, 0.08)',
        border: '1px solid rgba(184, 220, 145, 0.25)',
        borderRadius: '8px',
        padding: '10px 12px',
        marginBottom: '22px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--primary)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 'bold' }}>
            Selected Plants ({availablePlants.length})
          </span>
          {onNavigateToLibrary && (
            <button 
              onClick={onNavigateToLibrary} 
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline', padding: 0 }}
            >
              + Change Plants
            </button>
          )}
        </div>
        <div>
          {availablePlants.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
              {availablePlants.map(p => (
                <span key={p.id} style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(184,220,145,0.3)',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '0.75rem',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <strong>{p.shortName || p.name}</strong>
                  <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                    — {p.selectedSize || 'M'}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              No plants selected yet. Please select plants from Plant Library.
            </div>
          )}
        </div>
      </div>
      
      <div className="control-group">
        <h3>1. LAND</h3>
        <div className="input-row">
          <label>Total Land Size (Acres)</label>
          <input type="number" value={landAcres} onChange={e => useStore.getState().setLandAcres(Number(e.target.value))} min="1" max="1000" />
        </div>
        <div className="input-row" style={{ marginTop: '10px' }}>
          <label>Boundary Strip Width (ft)</label>
          <input type="number" value={borderWidth} onChange={e => setBorderWidth(Number(e.target.value))} min="0" />
        </div>
        <div className="input-row" style={{ marginTop: '10px' }}>
          <label>Border Plant Type</label>
          <select 
            value={borderZone.type} 
            onChange={e => {
              const val = e.target.value;
              updateBorderZone({ type: val });
            }}
          >
            {(availablePlants.length > 0 ? availablePlants : (libraryPlants && libraryPlants.length > 0 ? libraryPlants : [])).map(plant => (
              <option key={plant.id} value={plant.shortName || plant.name}>
                {plant.name} — {plant.selectedSize || 'M'} Plant
              </option>
            ))}
          </select>
        </div>

        {/* Real Plant Photo & Info Badge for Border Plant */}
        {borderPlantInfo && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0,0,0,0.3)',
            padding: '7px 9px',
            borderRadius: '6px',
            marginTop: '8px',
            border: '1px solid var(--border)'
          }}>
            <img 
              src={borderPlantInfo.image} 
              alt={borderPlantInfo.name} 
              referrerPolicy="no-referrer"
              style={{ width: '38px', height: '38px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }} 
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {borderPlantInfo.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                {borderPlantInfo.price ? `₹${borderPlantInfo.price} / sapling` : 'Border Boundary'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Spacing: {borderPlantInfo.spacing} · {borderPlantInfo.plantsPerAcre} / acre
              </div>
            </div>
          </div>
        )}

        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px', marginTop: '10px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Boundary Plants ({borderZone.type}):</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold' }}>{borderPlacedCount}</span>
          </div>
        </div>

        <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexDirection: 'column' }}>
          <button className="btn btn-secondary" onClick={autoArrangeBorder}>
            Auto Arrange Border (20 ft)
          </button>
          <button 
            className={`btn ${manualPlacementZoneId === 'border-zone' ? '' : 'btn-secondary'}`} 
            onClick={() => setManualPlacementZoneId(manualPlacementZoneId === 'border-zone' ? null : 'border-zone')}
            style={{ borderColor: manualPlacementZoneId === 'border-zone' ? 'var(--primary)' : '' }}
          >
            {manualPlacementZoneId === 'border-zone' ? 'Cancel Add' : '+ Add Border Plant'}
          </button>
        </div>
      </div>
      
      <div className="control-group">
        <h3>2. PLANTS ({totalPercentage}%)</h3>
        {totalPercentage > 100 && (
          <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '10px' }}>Error: Allocation &gt; 100%</div>
        )}
        {totalPercentage < 100 && (
          <div style={{ color: 'var(--warning)', fontSize: '0.85rem', marginBottom: '10px' }}>Warning: {100 - totalPercentage}% unallocated</div>
        )}

        {availablePlants.length === 0 && (
          <div style={{ background: 'rgba(232, 141, 127, 0.1)', border: '1px solid rgba(232, 141, 127, 0.3)', padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '0.82rem', color: 'var(--danger)' }}>
            No plants selected from Plant Library yet.
            {onNavigateToLibrary && (
              <button 
                onClick={onNavigateToLibrary}
                style={{ display: 'block', marginTop: '6px', background: 'var(--primary)', color: 'black', border: 'none', borderRadius: '4px', padding: '4px 10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.78rem' }}
              >
                Go to Plant Library →
              </button>
            )}
          </div>
        )}

        {cropZones.map((zone) => {
          const maxRows = Math.floor(zone.block.length / zone.r2r)
          const plantsPerRow = Math.floor(zone.block.width / zone.p2p)
          const capacity = maxRows * plantsPerRow
          const placedCount = visiblePlants.filter(p => p.zoneId === zone.id).length
          
          // Lookup single source of truth plant details from availablePlants (selected in library)
          const zonePlantInfo = availablePlants.find(p => (p.shortName || p.name) === zone.type || p.name === zone.type) || (libraryPlants || []).find(p => (p.shortName || p.name) === zone.type || p.name === zone.type);

          return (
            <div key={zone.id} style={{ background: 'var(--bg)', padding: '10px', borderRadius: '6px', marginBottom: '10px', border: '1px solid var(--border)' }}>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Plant</label>
                  <button onClick={() => removeCropZone(zone.id)} className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.75rem', width: 'auto' }}>Remove</button>
                </div>
                <select 
                  value={zone.type} 
                  onChange={e => {
                    const newType = e.target.value;
                    const plantObj = availablePlants.find(p => (p.shortName || p.name) === newType || p.name === newType);
                    updateCropZone(zone.id, { 
                      type: newType,
                      p2p: plantObj?.p2p || zone.p2p,
                      r2r: plantObj?.r2r || zone.r2r,
                    });
                  }} 
                  style={{ width: '100%', fontWeight: 'bold' }}
                >
                  {availablePlants.map(plant => (
                    <option key={plant.id} value={plant.shortName || plant.name}>
                      {plant.name} · {plant.selectedSize || 'M'} Plant (₹{plant.selectedPrice || plant.price})
                    </option>
                  ))}
                </select>
              </div>

              {/* Plant Photo & Metadata row */}
              {zonePlantInfo && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(0,0,0,0.25)',
                  padding: '6px 8px',
                  borderRadius: '5px',
                  marginBottom: '10px',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}>
                  <img 
                    src={zonePlantInfo.image} 
                    alt={zonePlantInfo.name} 
                    referrerPolicy="no-referrer"
                    style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }} 
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {zonePlantInfo.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                      {zonePlantInfo.selectedSize || 'M'} Plant · ₹{zonePlantInfo.selectedPrice || zonePlantInfo.price} / sapling
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Spacing: {zonePlantInfo.spacing} · {zonePlantInfo.plantsPerAcre} / acre
                    </div>
                  </div>
                </div>
              )}
              
              <div className="input-row">
                <label>Allocation (%)</label>
                <input type="number" value={zone.percentage} onChange={e => updateCropZone(zone.id, { percentage: Number(e.target.value) })} min="1" max="100" />
              </div>
              
              <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                <div className="input-row" style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-start', margin: 0 }}>
                  <label style={{fontSize: '0.8rem'}}>Plant Space (ft)</label>
                  <input type="number" value={zone.p2p} onChange={e => updateCropZone(zone.id, { p2p: Number(e.target.value) })} min="1" style={{width: '100%', boxSizing: 'border-box'}} />
                </div>
                <div className="input-row" style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-start', margin: 0 }}>
                  <label style={{fontSize: '0.8rem'}}>Row Space (ft)</label>
                  <input type="number" value={zone.r2r} onChange={e => updateCropZone(zone.id, { r2r: Number(e.target.value) })} min="1" style={{width: '100%', boxSizing: 'border-box'}} />
                </div>
              </div>
              
              <div className="input-row">
                <label>Target Plants</label>
                <input type="number" value={zone.targetPlants} onChange={e => updateCropZone(zone.id, { targetPlants: Number(e.target.value) })} min="0" />
              </div>
              
              <div style={{ fontSize: '0.8rem', marginBottom: '10px', color: 'var(--text-muted)' }}>
                Placed: <strong style={{color: 'white'}}>{placedCount}</strong> / {capacity} Max
              </div>
              
              <button className="btn btn-secondary" onClick={() => autoArrangeZone(zone.id)} disabled={!isValidAllocation}>
                Plant Field
              </button>
            </div>
          )
        })}
        
        <button 
          className="btn btn-secondary" 
          onClick={() => addCropZone()} 
          disabled={totalPercentage >= 100 || availablePlants.length === 0}
        >
          + Add Crop Zone
        </button>
      </div>

      <div className="control-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid var(--border)', paddingBottom: '5px' }} onClick={() => setInfraMenuOpen(!infraMenuOpen)}>
          <h3 style={{ margin: 0, border: 'none', padding: 0 }}>3. FARM INFRASTRUCTURE</h3>
          <span style={{ color: 'var(--text-muted)' }}>{infraMenuOpen ? '▼' : '▶'}</span>
        </div>
        
        {infraMenuOpen && (
          <div style={{ marginTop: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => addInfrastructure('Gate')}>Gate</button>
              <button className={`btn ${activeDrawTool === 'Road' ? '' : 'btn-secondary'}`} style={{ borderColor: activeDrawTool === 'Road' ? 'var(--primary)' : '' }} onClick={() => setActiveDrawTool(activeDrawTool === 'Road' ? null : 'Road')}>
                {activeDrawTool === 'Road' ? 'Cancel Road' : 'Road'}
              </button>
              <button className="btn btn-secondary" onClick={() => addInfrastructure('Farm House')}>Farm House</button>
              
              <div style={{ gridColumn: 'span 2', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Add: Full-Length Road</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button className="btn btn-secondary" onClick={() => addFullRoad('top')} style={{ fontSize: '0.8rem' }}>Top Edge</button>
                  <button className="btn btn-secondary" onClick={() => addFullRoad('bottom')} style={{ fontSize: '0.8rem' }}>Bottom Edge</button>
                  <button className="btn btn-secondary" onClick={() => addFullRoad('left')} style={{ fontSize: '0.8rem' }}>Left Edge</button>
                  <button className="btn btn-secondary" onClick={() => addFullRoad('right')} style={{ fontSize: '0.8rem' }}>Right Edge</button>
                  <button className="btn btn-secondary" onClick={() => addFullRoad('center-h')} style={{ fontSize: '0.8rem' }}>Center ↔</button>
                  <button className="btn btn-secondary" onClick={() => addFullRoad('center-v')} style={{ fontSize: '0.8rem' }}>Center ↕</button>
                </div>
              </div>
              <button className="btn btn-secondary" onClick={() => addInfrastructure('Pond')}>Pond</button>
              <button className="btn btn-secondary" onClick={() => addInfrastructure('Borewell')}>Borewell</button>
              <button className="btn btn-secondary" onClick={() => addInfrastructure('Water Tank')}>Water Tank</button>
              <button className="btn btn-secondary" onClick={() => addInfrastructure('Pump Room')}>Pump Room</button>
              <button className="btn btn-secondary" onClick={() => addInfrastructure('Storage Shed')}>Storage Shed</button>
              <button className="btn btn-secondary" style={{ gridColumn: 'span 2' }} onClick={() => addInfrastructure('Custom Obstacle')}>Custom Obstacle</button>
            </div>
          </div>
        )}
      </div>

      <div className="control-group">
        <h3>4. TOOLS</h3>
        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
          <button 
            className={`btn ${measuring ? '' : 'btn-secondary'}`} 
            onClick={() => setMeasuring(!measuring)}
          >
            {measuring ? 'Cancel Measurement' : 'Measure Distance'}
          </button>
          <button className="btn btn-secondary" onClick={clearAllPlants} style={{color: 'var(--danger)', borderColor: 'var(--danger)'}}>
            Clear All Plants
          </button>
        </div>
      </div>

      <div className="control-group" style={{ background: 'rgba(184, 220, 145, 0.08)', border: '1px solid rgba(184, 220, 145, 0.35)', borderRadius: '8px', padding: '12px', marginTop: '16px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--primary)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>
          5. LIVE ESTIMATE & BILLING
        </div>
        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: '1.4' }}>
          Review itemized plant billing, optional add-ons, and harvest income estimates.
        </div>
        <button 
          className="btn"
          style={{ width: '100%', background: 'var(--primary)', color: '#0c1514', fontWeight: 'bold', padding: '10px 14px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
          onClick={() => {
            if (typeof window.__navigateToLiveEstimate === 'function') {
              window.__navigateToLiveEstimate()
            }
          }}
        >
          <span>Live Estimate</span>
          <span>→</span>
        </button>
      </div>
    </div>
  )
}
