import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { getPlantColor } from '../constants/plantColors';

export default function VisualizationLegend() {
  const [collapsed, setCollapsed] = useState(false);
  const { 
    plants, 
    cropZones, 
    borderZone, 
    libraryPlants, 
    selectedCropZoneId, 
    setSelectedCropZoneId,
    getAvailablePlants
  } = useStore();

  const availablePlants = useMemo(() => {
    return typeof getAvailablePlants === 'function' ? getAvailablePlants() : [];
  }, [getAvailablePlants]);

  // Aggregate all unique plant types active in the current farm plan
  const legendItems = useMemo(() => {
    const itemsMap = new Map();

    // 1. Gather from crop zones
    cropZones.forEach((zone) => {
      const type = zone.type;
      if (!type) return;
      const count = plants.filter((p) => p.zoneId === zone.id).length;
      const plantObj = (availablePlants || []).find(
        (p) => (p.shortName || p.name) === type || p.name === type
      ) || (libraryPlants || []).find(
        (p) => (p.shortName || p.name) === type || p.name === type
      );

      const color = getPlantColor(type, libraryPlants);

      itemsMap.set(type, {
        type,
        displayName: plantObj?.name || type,
        shortName: plantObj?.shortName || type,
        color,
        count,
        targetPlants: zone.targetPlants || 0,
        spacing: `${zone.p2p || 15}×${zone.r2r || 15} ft`,
        zoneId: zone.id,
        category: plantObj?.category || 'Crop Zone',
        isBorder: false,
      });
    });

    // 2. Gather border zone plant
    if (borderZone?.type) {
      const borderCount = plants.filter((p) => p.zoneId === 'border-zone').length;
      const borderPlantObj = (availablePlants || []).find(
        (p) => (p.shortName || p.name) === borderZone.type || p.name === borderZone.type
      ) || (libraryPlants || []).find(
        (p) => (p.shortName || p.name) === borderZone.type || p.name === borderZone.type
      );
      const borderColor = getPlantColor(borderZone.type, libraryPlants);

      if (itemsMap.has(borderZone.type)) {
        const existing = itemsMap.get(borderZone.type);
        existing.count += borderCount;
        existing.isAlsoBorder = true;
      } else {
        itemsMap.set(`border_${borderZone.type}`, {
          type: borderZone.type,
          displayName: borderPlantObj?.name ? `${borderPlantObj.name} (Border)` : `${borderZone.type} (Border)`,
          shortName: borderPlantObj?.shortName || borderZone.type,
          color: borderColor,
          count: borderCount,
          targetPlants: borderZone.targetPlants || borderCount,
          spacing: 'Boundary 20 ft',
          zoneId: 'border-zone',
          category: 'Boundary Strip',
          isBorder: true,
        });
      }
    }

    // 3. If no zones yet, show shortlisted plants so colors are immediately visible
    if (itemsMap.size === 0 && availablePlants.length > 0) {
      availablePlants.forEach((p) => {
        const type = p.shortName || p.name;
        itemsMap.set(type, {
          type,
          displayName: p.name,
          shortName: type,
          color: getPlantColor(type, libraryPlants),
          count: 0,
          targetPlants: 0,
          spacing: p.spacing || '15×15 ft',
          zoneId: null,
          category: p.category || 'Selected Plant',
          isBorder: false,
        });
      });
    }

    return Array.from(itemsMap.values());
  }, [plants, cropZones, borderZone, libraryPlants, availablePlants]);

  if (legendItems.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '24px',
        right: '24px',
        zIndex: 25,
        maxWidth: collapsed ? 'auto' : '300px',
        minWidth: collapsed ? 'auto' : '230px',
        background: 'rgba(15, 26, 21, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(184, 220, 145, 0.3)',
        borderRadius: '10px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
        color: '#fff',
        fontFamily: 'inherit',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
      }}
    >
      {/* Legend Header */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'rgba(255, 255, 255, 0.04)',
          borderBottom: collapsed ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--primary, #10b981)',
              boxShadow: '0 0 8px var(--primary, #10b981)',
            }}
          />
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--primary, #b8dc91)',
            }}
          >
            Plant Color Legend
          </span>
          <span
            style={{
              fontSize: '0.68rem',
              background: 'rgba(255,255,255,0.1)',
              padding: '1px 6px',
              borderRadius: '10px',
              color: '#94a3b8',
            }}
          >
            {legendItems.length}
          </span>
        </div>

        <button
          type="button"
          aria-label={collapsed ? 'Expand Legend' : 'Collapse Legend'}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '0.75rem',
            padding: '2px 4px',
          }}
        >
          {collapsed ? '▲ Show' : '▼ Hide'}
        </button>
      </div>

      {/* Legend Items List */}
      {!collapsed && (
        <div
          style={{
            padding: '8px 12px 10px',
            maxHeight: '280px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {legendItems.map((item) => {
            const isSelected = selectedCropZoneId === item.zoneId && item.zoneId !== null;

            return (
              <div
                key={item.displayName}
                onClick={() => {
                  if (item.zoneId && typeof setSelectedCropZoneId === 'function') {
                    setSelectedCropZoneId(isSelected ? null : item.zoneId);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  background: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  border: isSelected ? `1px solid ${item.color}` : '1px solid transparent',
                  cursor: item.zoneId ? 'pointer' : 'default',
                  transition: 'background 0.15s ease',
                }}
                title={item.zoneId ? `Click to focus on ${item.displayName} zone` : item.displayName}
              >
                {/* Circular Color Swatch */}
                <div
                  style={{
                    position: 'relative',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    boxShadow: `0 0 8px ${item.color}55`,
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    flexShrink: 0,
                  }}
                />

                {/* Plant Name and Count */}
                <div style={{ flex: 1, minWidth: 0, lineHeight: 1.25 }}>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#fff',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.displayName}
                  </div>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      color: '#94a3b8',
                      display: 'flex',
                      gap: '6px',
                      alignItems: 'center',
                      marginTop: '1px',
                    }}
                  >
                    <span style={{ color: item.color, fontWeight: 700 }}>
                      {item.count} {item.count === 1 ? 'plant' : 'plants'}
                    </span>
                    <span>·</span>
                    <span>{item.spacing}</span>
                  </div>
                </div>
              </div>
            );
          })}

          <div
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              paddingTop: '6px',
              marginTop: '4px',
              fontSize: '0.68rem',
              color: 'var(--text-dim, #64748b)',
              textAlign: 'center',
            }}
          >
            Distinct color assigned per crop variety
          </div>
        </div>
      )}
    </div>
  );
}
