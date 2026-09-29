import { useState } from 'react'
import { useStore } from '../store'

const ICON = {
  'Gate': 'GT',
  'Road': 'RD',
  'Farm House': 'FH',
  'Pond': 'PN',
  'Borewell': 'BW',
  'Water Tank': 'WT',
  'Pump Room': 'PR',
  'Storage Shed': 'SH',
  'Custom Obstacle': 'OB',
}

function DimRow({ label, value, onDec, onInc, step = 2, unit = 'ft', min = 1 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button onClick={onDec} style={btnSm} disabled={value <= min}>−</button>
        <span style={{ color: '#fff', fontWeight: '700', minWidth: '48px', textAlign: 'center', fontVariantNumeric: 'tabular-nums', fontSize: '0.9rem' }}>{value} {unit}</span>
        <button onClick={onInc} style={btnSm}>+</button>
      </div>
    </div>
  )
}

const btnSm = {
  width: '26px', height: '26px', borderRadius: '6px',
  background: '#334155', border: '1px solid #475569',
  color: 'white', cursor: 'pointer', fontWeight: 'bold',
  fontSize: '1rem', lineHeight: 1, display: 'flex',
  alignItems: 'center', justifyContent: 'center', flexShrink: 0
}

const ROT_STEPS = [5, 10, 15, 30, 45, 90]

export default function ObjectPropertiesPanel() {
  const {
    infrastructure, selectedInfraId, setSelectedInfraId,
    updateInfrastructure, removeInfrastructure, landSideFt
  } = useStore()

  const [rotStep, setRotStep] = useState(5)
  const [moveStep, setMoveStep] = useState(1)
  const [dimStep, setDimStep] = useState(2)

  const inf = infrastructure.find(i => i.id === selectedInfraId)
  if (!inf) return null

  const isRound = inf.type === 'Borewell' || inf.type === 'Water Tank'
  const isRoad = inf.type === 'Road'
  const halfL = landSideFt / 2

  const upd = (changes) => updateInfrastructure(inf.id, changes)
  const clamp = (v) => Math.max(-halfL, Math.min(halfL, v))
  const deg = (r) => Math.round((r * 180) / Math.PI)
  const rad = (d) => d * (Math.PI / 180)

  const adjustEnd = (isFront, delta) => {
    const r = inf.rotation || 0;
    const vx = Math.sin(r);
    const vz = -Math.cos(r);
    const newLen = Math.max(1, inf.length + delta);
    const actualDelta = newLen - inf.length;
    if (actualDelta === 0) return;
    const shiftDirX = isFront ? vx : -vx;
    const shiftDirZ = isFront ? vz : -vz;
    upd({
      length: newLen,
      x: clamp(inf.x + shiftDirX * (actualDelta / 2)),
      z: clamp(inf.z + shiftDirZ * (actualDelta / 2))
    });
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, right: 0, bottom: 0,
      width: '280px',
      background: 'rgba(15,23,42,0.97)',
      backdropFilter: 'blur(10px)',
      borderLeft: '1px solid #1e293b',
      zIndex: 20,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-8px 0 32px rgba(0,0,0,0.5)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Selected Object</div>
          <div style={{ fontSize: '1rem', fontWeight: '700', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>{ICON[inf.type] || 'OBJ'}</span>
            {inf.type.toUpperCase()}
          </div>
        </div>
        <button
          onClick={() => setSelectedInfraId(null)}
          style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, flexShrink: 0 }}
          title="Deselect"
        >✕</button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>

        {/* POSITION */}
        <div style={{ marginBottom: '18px' }}>
          <div style={sectionLabel}>Position</div>
          <DimRow
            label="X (West ↔ East)"
            value={Math.round(inf.x)}
            onDec={() => upd({ x: clamp(inf.x - moveStep) })}
            onInc={() => upd({ x: clamp(inf.x + moveStep) })}
            step={moveStep}
            unit="ft"
            min={-halfL}
          />
          <DimRow
            label="Z (North ↔ South)"
            value={Math.round(inf.z)}
            onDec={() => upd({ z: clamp(inf.z - moveStep) })}
            onInc={() => upd({ z: clamp(inf.z + moveStep) })}
            step={moveStep}
            unit="ft"
            min={-halfL}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Move step</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[0.5, 1, 2, 5, 10].map(s => (
                <button
                  key={s}
                  onClick={() => setMoveStep(s)}
                  style={{
                    ...btnSm, width: 'auto', padding: '0 7px',
                    background: moveStep === s ? '#10b981' : '#1e293b',
                    border: `1px solid ${moveStep === s ? '#10b981' : '#334155'}`,
                    fontSize: '0.72rem', fontWeight: '600'
                  }}
                >{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* DIMENSIONS */}
        <div style={{ marginBottom: '18px' }}>
          <div style={sectionLabel}>Dimensions</div>
          {!isRound ? (
            <>
              <DimRow
                label="Width"
                value={Math.round(inf.width)}
                onDec={() => upd({ width: Math.max(1, inf.width - dimStep) })}
                onInc={() => upd({ width: inf.width + dimStep })}
              />
              <DimRow
                label="Length"
                value={Math.round(inf.length)}
                onDec={() => upd({ length: Math.max(1, inf.length - dimStep) })}
                onInc={() => upd({ length: inf.length + dimStep })}
              />
            </>
          ) : (
            <DimRow
              label="Radius"
              value={Math.round(inf.radius || inf.width / 2)}
              onDec={() => upd({ radius: Math.max(1, (inf.radius || inf.width/2) - dimStep), width: Math.max(2, inf.width - (dimStep*2)) })}
              onInc={() => upd({ radius: (inf.radius || inf.width/2) + dimStep, width: inf.width + (dimStep*2) })}
            />
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Size step</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 5, 10, 50].map(s => (
                <button
                  key={s}
                  onClick={() => setDimStep(s)}
                  style={{
                    ...btnSm, width: 'auto', padding: '0 7px',
                    background: dimStep === s ? '#10b981' : '#1e293b',
                    border: `1px solid ${dimStep === s ? '#10b981' : '#334155'}`,
                    fontSize: '0.72rem', fontWeight: '600'
                  }}
                >{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* ROTATION */}
        {!isRound && (
          <div style={{ marginBottom: '18px' }}>
            <div style={sectionLabel}>Rotation — {deg(inf.rotation || 0)}°</div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <button
                onClick={() => upd({ rotation: (inf.rotation || 0) - rad(rotStep) })}
                style={{ ...btnSm, flex: 1, width: 'auto', height: '36px', fontSize: '1.1rem' }}
              >↺</button>
              <button
                onClick={() => upd({ rotation: 0 })}
                style={{ ...btnSm, flex: 1, width: 'auto', height: '36px', fontSize: '0.7rem', color: '#94a3b8' }}
              >Reset</button>
              <button
                onClick={() => upd({ rotation: (inf.rotation || 0) + rad(rotStep) })}
                style={{ ...btnSm, flex: 1, width: 'auto', height: '36px', fontSize: '1.1rem' }}
              >↻</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Rotation step</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {ROT_STEPS.map(s => (
                  <button
                    key={s}
                    onClick={() => setRotStep(s)}
                    style={{
                      ...btnSm, width: 'auto', padding: '0 6px',
                      background: rotStep === s ? '#10b981' : '#1e293b',
                      border: `1px solid ${rotStep === s ? '#10b981' : '#334155'}`,
                      fontSize: '0.7rem', fontWeight: '600'
                    }}
                  >{s}°</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ROAD D-PAD */}
        {isRoad && (
          <div style={{ marginBottom: '18px' }}>
            <div style={sectionLabel}>Quick Move (D-Pad)</div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: 'repeat(3, 38px)',
              gap: '4px',
              marginTop: '6px'
            }}>
              {[
                ['↖', -moveStep, -moveStep], ['↑', 0, -moveStep], ['↗', moveStep, -moveStep],
                ['←', -moveStep, 0],         ['', 0, 0],           ['→', moveStep, 0],
                ['↙', -moveStep, moveStep],  ['↓', 0, moveStep],   ['↘', moveStep, moveStep],
              ].map(([label, dx, dz], i) => (
                <button
                  key={i}
                  disabled={!label}
                  onClick={() => label && upd({ x: clamp(inf.x + dx), z: clamp(inf.z + dz) })}
                  style={{
                    ...btnSm, width: '100%', height: '100%', fontSize: '1rem',
                    background: label ? '#1e293b' : 'transparent',
                    border: label ? '1px solid #334155' : 'none',
                    cursor: label ? 'pointer' : 'default'
                  }}
                >{label}</button>
              ))}
            </div>
          </div>
        )}

        {/* ENDS ADJUSTMENT (Non-Round Objects) */}
        {!isRound && (
          <div style={{ marginBottom: '18px' }}>
            <div style={sectionLabel}>Extend / Shrink Ends</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', textAlign: 'center' }}>Front End</div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => adjustEnd(true, -dimStep)} style={{ ...btnSm, flex: 1, width: 'auto' }}>−</button>
                  <button onClick={() => adjustEnd(true, dimStep)} style={{ ...btnSm, flex: 1, width: 'auto' }}>+</button>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', textAlign: 'center' }}>Back End</div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => adjustEnd(false, -dimStep)} style={{ ...btnSm, flex: 1, width: 'auto' }}>−</button>
                  <button onClick={() => adjustEnd(false, dimStep)} style={{ ...btnSm, flex: 1, width: 'auto' }}>+</button>
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px', textAlign: 'center' }}>
              Uses the 'Size step' value ({dimStep} ft)
            </div>
          </div>
        )}

        {/* GATE boundary snap */}
        {inf.type === 'Gate' && (
          <div style={{ marginBottom: '18px' }}>
            <div style={sectionLabel}>Snap to Boundary</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
              {[
                ['North', 0, -halfL, Math.PI/2],
                ['South', 0, halfL, Math.PI/2],
                ['West', -halfL, 0, 0],
                ['East', halfL, 0, 0],
              ].map(([dir, nx, nz, nr]) => (
                <button
                  key={dir}
                  onClick={() => upd({ x: nx, z: nz, rotation: nr })}
                  style={{ ...btnSm, width: '100%', height: '32px', fontSize: '0.8rem', background: '#1e293b', border: '1px solid #334155' }}
                >{dir}</button>
              ))}
            </div>
          </div>
        )}

        {/* Tip */}
        <div style={{
          background: 'rgba(16,185,129,0.07)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: '6px',
          padding: '10px',
          fontSize: '0.75rem',
          color: '#6ee7b7',
          lineHeight: 1.5,
          marginBottom: '14px'
        }}>
          Drag the object directly on the farm to move it freely. Use the controls above for precise adjustments.
        </div>

        {/* DELETE */}
        <button
          onClick={() => { removeInfrastructure(inf.id); setSelectedInfraId(null); }}
          style={{
            width: '100%', padding: '12px', borderRadius: '8px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444',
            color: '#ef4444', cursor: 'pointer', fontWeight: '700',
            fontSize: '0.9rem', letterSpacing: '0.05em'
          }}
        >
          Delete {inf.type}
        </button>
      </div>
    </div>
  )
}

const sectionLabel = {
  fontSize: '0.7rem',
  fontWeight: '700',
  letterSpacing: '0.12em',
  color: '#475569',
  textTransform: 'uppercase',
  marginBottom: '6px',
  paddingBottom: '4px',
  borderBottom: '1px solid rgba(255,255,255,0.04)'
}
