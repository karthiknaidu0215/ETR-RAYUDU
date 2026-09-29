import { useMemo } from 'react'
import { useStore, isPointInRotatedRect, getInfraArea } from '../store'

// Professional unique color per crop type
export const CROP_COLORS = {
  'Mango':    '#e67e22',
  'Kesar Mango': '#e67e22',
  'Banana':   '#f1c40f',
  'Grand Naine Banana': '#f1c40f',
  'Arecanut': '#27ae60',
  'Arecanut Premium': '#27ae60',
  'Coconut':  '#16a085',
  'Tall Coconut': '#16a085',
  'Guava':    '#8e44ad',
  'Allahabad Guava': '#8e44ad',
  'Mosambi':  '#2980b9',
  'Sweet Mosambi': '#2980b9',
  'Timber':   '#7f8c8d',
  'Teak':     '#7f8c8d',
  'Teak Sapling': '#7f8c8d',
  'Moringa':  '#78b582',
  'Jasmine':  '#d7c7a1',
  'Star Jasmine': '#d7c7a1',
  'Border':   '#d35400',
  'default':  '#1abc9c',
}

function Row({ label, value, color, sub, bold, top, danger }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: sub ? '3px 0 3px 14px' : '5px 0',
      borderTop: top ? '1px solid rgba(255,255,255,0.08)' : 'none',
      marginTop: top ? '6px' : 0,
    }}>
      <span style={{ fontSize: sub ? '0.78rem' : '0.85rem', color: sub ? '#94a3b8' : '#cbd5e1' }}>
        {sub && <span style={{ color: danger ? '#ef4444' : '#64748b', marginRight: 4 }}>▸</span>}
        {label}
      </span>
      <span style={{
        fontSize: sub ? '0.78rem' : '0.85rem',
        color: color || (danger ? '#ef4444' : bold ? '#ffffff' : '#94a3b8'),
        fontWeight: bold ? '700' : '500',
        fontVariantNumeric: 'tabular-nums'
      }}>
        {value}
      </span>
    </div>
  )
}

function SectionHeader({ title }) {
  return (
    <div style={{
      fontSize: '0.7rem',
      fontWeight: '700',
      letterSpacing: '0.12em',
      color: '#475569',
      textTransform: 'uppercase',
      marginTop: '1.2rem',
      marginBottom: '4px',
      paddingBottom: '4px',
      borderBottom: '1px solid rgba(255,255,255,0.05)'
    }}>
      {title}
    </div>
  )
}

export default function Stats() {
  const { landAcres, borderAreaSqFt, cropZones, borderZone, plants, infrastructure } = useStore()

  const stats = useMemo(() => {
    let visiblePlants = [];
    let removedCounts = {};

    plants.forEach(p => {
      let isRemoved = false;
      for (const inf of infrastructure) {
        if (inf.type === 'Borewell' || inf.type === 'Water Tank') {
          const dist = Math.hypot(p.x - inf.x, p.z - inf.z);
          if (dist <= (inf.radius || inf.width / 2)) { isRemoved = true; break; }
        } else {
          if (isPointInRotatedRect(p.x, p.z, inf.x, inf.z, inf.width, inf.length, inf.rotation)) {
            isRemoved = true; break;
          }
        }
      }
      if (isRemoved) removedCounts[p.type] = (removedCounts[p.type] || 0) + 1;
      else visiblePlants.push(p);
    });

    const borderPlants = visiblePlants.filter(p => p.zoneId === 'border-zone');
    const borderPlantCountsByType = {};
    borderPlants.forEach(p => {
      borderPlantCountsByType[p.type] = (borderPlantCountsByType[p.type] || 0) + 1;
    });
    
    const borderPlantsAreaUsed = Math.min(borderAreaSqFt, borderPlants.length * 200); // 10ft width * 20ft spacing

    const totalInfraArea = infrastructure.reduce((s, i) => s + getInfraArea(i), 0);
    const roadArea = infrastructure.filter(i => i.type === 'Road').reduce((s, i) => s + getInfraArea(i), 0);
    const buildingArea = infrastructure.filter(i => !['Road', 'Gate'].includes(i.type)).reduce((s, i) => s + getInfraArea(i), 0);
    const gateArea = infrastructure.filter(i => i.type === 'Gate').reduce((s, i) => s + getInfraArea(i), 0);

    // Interior crop zone usage
    const interiorUsed = cropZones.reduce((s, z) => {
      const placed = visiblePlants.filter(p => p.zoneId === z.id).length;
      return s + (z.block?.area || 0);
    }, 0);

    return {
      visiblePlants,
      removedCounts,
      totalInfraArea,
      roadArea,
      buildingArea,
      gateArea,
      borderPlants: borderPlants.length,
      borderPlantCountsByType,
      borderPlantsAreaUsed,
      interiorUsed,
    };
  }, [plants, infrastructure, landAcres, borderAreaSqFt]);

  const totalSqFt = landAcres * 43560;
  const interiorAreaSqFt = totalSqFt - borderAreaSqFt;

  // Land accounting
  const borderFree = Math.max(0, borderAreaSqFt - stats.borderPlantsAreaUsed - stats.gateArea);
  const interiorFree = Math.max(0, interiorAreaSqFt - stats.interiorUsed - stats.buildingArea - stats.roadArea);
  const totalUsed = Math.min(totalSqFt, stats.borderPlantsAreaUsed + stats.gateArea + stats.interiorUsed + stats.buildingArea + stats.roadArea);
  const totalFree = Math.max(0, totalSqFt - totalUsed);
  const usedPct = Math.round((totalUsed / totalSqFt) * 100);

  const fmt = (n) => Math.round(n).toLocaleString() + ' sq.ft';

  return (
    <div className="stats-panel">

      {/* ── TOTAL LAND ── */}
      <div style={{
        background: 'rgba(16,185,129,0.08)',
        border: '1px solid rgba(16,185,129,0.25)',
        borderRadius: '8px',
        padding: '10px 12px',
        marginBottom: '4px'
      }}>
        <div style={{ fontSize: '0.7rem', color: '#10b981', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Total Land</div>
        <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
          {totalSqFt.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: '400', color: '#94a3b8' }}>sq.ft</span>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>{landAcres} acre{landAcres !== 1 ? 's' : ''} • {Math.round(Math.sqrt(totalSqFt))} × {Math.round(Math.sqrt(totalSqFt))} ft</div>
      </div>

      {/* ── USAGE BAR ── */}
      <div style={{ margin: '10px 0 6px', height: '6px', borderRadius: '99px', background: '#1e293b', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(usedPct, 100)}%`, background: 'linear-gradient(90deg, #10b981, #f59e0b)', borderRadius: '99px', transition: 'width 0.4s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: '8px' }}>
        <span>{usedPct}% used</span>
        <span>{100 - usedPct}% free</span>
      </div>

      {/* ── BORDER STRIP ── */}
      <SectionHeader title="Border Strip" />
      <Row label="Border Strip Total" value={fmt(borderAreaSqFt)} color="#d35400" bold />
      <Row label={`Border Plants Total (${stats.borderPlants})`} value={`− ${fmt(stats.borderPlantsAreaUsed)}`} sub danger />
      {Object.entries(stats.borderPlantCountsByType).map(([type, count]) => (
        <div key={type} style={{ fontSize: '0.75rem', color: '#cbd5e1', paddingLeft: '24px', marginBottom: '3px' }}>
          • {type}: {count}
        </div>
      ))}
      {stats.gateArea > 0 && <Row label="Gate" value={`− ${fmt(stats.gateArea)}`} sub danger />}
      <Row label="Border Free" value={fmt(borderFree)} sub color="#10b981" bold />

      {/* ── INTERIOR ── */}
      <SectionHeader title="Interior Land" />
      <Row label="Interior Total" value={fmt(interiorAreaSqFt)} color="#2980b9" bold />
      {cropZones.map(z => {
        const count = stats.visiblePlants.filter(p => p.zoneId === z.id).length;
        return (
          <Row
            key={z.id}
            label={`${z.type} Zone (${z.percentage}%) • ${count} Plants`}
            value={fmt(z.block?.area || 0)}
            sub
            color={CROP_COLORS[z.type] || CROP_COLORS.default}
          />
        );
      })}
      {stats.buildingArea > 0 && <Row label="Buildings / Infra" value={`− ${fmt(stats.buildingArea)}`} sub danger />}
      {stats.roadArea > 0 && <Row label="Roads" value={`− ${fmt(stats.roadArea)}`} sub danger />}
      <Row label="Interior Free" value={fmt(interiorFree)} sub color="#10b981" bold />

      {/* ── NET SUMMARY ── */}
      <SectionHeader title="Net Summary" />
      <Row label="Total Used" value={fmt(totalUsed)} danger bold top />
      <Row label="Total Free" value={fmt(totalFree)} color="#10b981" bold />

      {/* ── REMOVED ── */}
      {Object.keys(stats.removedCounts).length > 0 && (
        <>
          <SectionHeader title="Removed by Infrastructure" />
          {Object.entries(stats.removedCounts).map(([type, count]) => (
            <Row key={type} label={type} value={`${count} removed`} danger />
          ))}
        </>
      )}
    </div>
  )
}
