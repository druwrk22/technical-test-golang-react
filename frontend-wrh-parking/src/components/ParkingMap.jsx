import { useEffect, useRef, useState } from 'react';
import Konva from 'konva';
import { SPOT_CONFIG } from '../utils/constants';

const COLORS = {
  available: '#a3ffac',
  occupied: '#ff9e9e',
  selected: '#a3c1ff',
  stroke: '#000000',
  bg: '#e6e6e6',
  text: '#000000',
  shadow: 'rgba(0,0,0,0.3)',
};

const ParkingMap = ({ spots, onSelectSpot, selectedSpot }) => {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const tooltipRef = useRef(null);
  const [hoveredSpot, setHoveredSpot] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });

  useEffect(() => {
    if (!containerRef.current) return;

    const stage = new Konva.Stage({
      container: containerRef.current,
      width: containerRef.current.clientWidth,
      height: 400,
    });
    const layer = new Konva.Layer();
    stage.add(layer);
    stageRef.current = stage;
    layerRef.current = layer;

    const tooltipEl = document.createElement('div');
    tooltipEl.style.cssText = `
      position: absolute;
      background: #000;
      color: #fff;
      padding: 8px 12px;
      font-size: 13px;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 600;
      border: 2px solid #ffcc00;
      pointer-events: none;
      display: none;
      z-index: 1000;
      white-space: nowrap;
    `;
    containerRef.current.appendChild(tooltipEl);
    tooltipRef.current = tooltipEl;

    const drawLanes = () => {
      const w = stage.width();
      const h = stage.height();
      
      const lane = new Konva.Rect({
        x: 0,
        y: h / 2 - 15,
        width: w,
        height: 30,
        fill: '#d4d4d4',
        stroke: '#000',
        strokeWidth: 2,
      });
      layer.add(lane);

      const dashLine = new Konva.Line({
        points: [0, h / 2, w, h / 2],
        stroke: '#ffcc00',
        strokeWidth: 3,
        dash: [15, 10],
      });
      layer.add(dashLine);

      const roadLabel = new Konva.Text({
        x: w / 2 - 60,
        y: h / 2 - 8,
        text: ' JALAN PARKIR',
        fontSize: 12,
        fontFamily: 'Space Grotesk',
        fontStyle: 'bold',
        fill: '#666',
      });
      layer.add(roadLabel);
    };

    const drawSpots = () => {
      layer.destroyChildren();
      drawLanes();

      const w = stage.width();
      const h = stage.height();
      const spotW = (w - 60) / 6;
      const spotH = (h - 60) / 2;

      SPOT_CONFIG.forEach((spot) => {
        const isOccupied = spots[spot.id]?.occupied;
        const isSel = selectedSpot === spot.id;
        const isHovered = hoveredSpot === spot.id;

        const fillColor = isSel ? COLORS.selected : isOccupied ? COLORS.occupied : COLORS.available;
        const offsetY = spot.row === 0 ? 20 : h / 2 + 20;

        const rect = new Konva.Rect({
          x: 30 + spot.col * spotW + 5,
          y: offsetY,
          width: spotW - 10,
          height: spotH - 25,
          fill: fillColor,
          stroke: COLORS.stroke,
          strokeWidth: isSel || isHovered ? 4 : 3,
          cornerRadius: 0,
          shadowColor: COLORS.shadow,
          shadowBlur: isSel ? 10 : 5,
          shadowOffset: { x: isSel ? 4 : 3, y: isSel ? 4 : 3 },
          shadowOpacity: isSel ? 0.4 : 0.3,
        });

        const label = new Konva.Text({
          x: rect.x(),
          y: rect.y() + 8,
          width: rect.width(),
          text: spot.label,
          fontSize: isSel ? 22 : 18,
          fontFamily: 'Space Grotesk',
          fontStyle: 'bold',
          fill: isSel ? '#000' : COLORS.text,
          align: 'center',
        });

        const line = new Konva.Line({
          points: [rect.x() + rect.width() / 2 - 30, rect.y() + 35, rect.x() + rect.width() / 2 + 30, rect.y() + 35],
          stroke: COLORS.stroke,
          strokeWidth: 2,
        });
        layer.add(line);

        const statusText = new Konva.Text({
          x: rect.x(),
          y: rect.y() + rect.height() - 40,
          width: rect.width(),
          text: isOccupied ? ' TERISI' : isSel ? ' DIPILIH' : '✅ KOSONG',
          fontSize: 11,
          fontFamily: 'Space Grotesk',
          fontStyle: 'bold',
          fill: COLORS.text,
          align: 'center',
        });

        if (isSel) {
          const pulse = new Konva.Circle({
            x: rect.x() + rect.width() / 2,
            y: rect.y() + rect.height() / 2,
            radius: 20,
            fill: 'rgba(163, 193, 255, 0.3)',
            stroke: COLORS.stroke,
            strokeWidth: 2,
          });
          layer.add(pulse);

          let scale = 1;
          let growing = true;
          const anim = new Konva.Animation(() => {
            scale += growing ? 0.02 : -0.02;
            if (scale >= 2) growing = false;
            if (scale <= 1) growing = true;
            pulse.scale({ x: scale, y: scale });
            pulse.opacity(2 - scale);
          }, layer);
          anim.start();
        }

        layer.add(rect, label, statusText);

        rect.on('mouseenter', () => {
          if (isOccupied) {
            stage.container().style.cursor = 'not-allowed';
            setTooltip({
              visible: true,
              content: ' Tempat ini sudah terisi!',
              x: rect.x() + rect.width() / 2,
              y: rect.y(),
            });
          } else {
            stage.container().style.cursor = 'pointer';
            rect.stroke('#000');
            rect.shadowBlur(10);
            rect.shadowOffset({ x: 5, y: 5 });
            setTooltip({
              visible: true,
              content: isSel ? `🔵 ${spot.label} - Sudah dipilih` : `🟢 ${spot.label} - Klik untuk memilih`,
              x: rect.x() + rect.width() / 2,
              y: rect.y(),
            });
          }
        });

        rect.on('mousemove', (e) => {
          const pos = e.evt.target.getBoundingClientRect();
          tooltipEl.style.left = `${e.evt.clientX - containerRef.current.getBoundingClientRect().left}px`;
          tooltipEl.style.top = `${e.evt.clientY - containerRef.current.getBoundingClientRect().top - 40}px`;
          tooltipEl.style.display = 'block';
          tooltipEl.textContent = isOccupied ? '🚫 Tempat ini sudah terisi!' : isSel ? `🔵 ${spot.label} - Sudah dipilih` : `🟢 ${spot.label} - Klik untuk memilih`;
        });

        rect.on('mouseleave', () => {
          if (!isSel) {
            rect.stroke('#000');
            rect.shadowBlur(5);
            rect.shadowOffset({ x: 3, y: 3 });
          }
          stage.container().style.cursor = 'default';
          tooltipEl.style.display = 'none';
        });

        rect.on('click tap', () => {
          if (isOccupied) return;
          onSelectSpot(spot.id);
        });
      });
      layer.batchDraw();
    };

    drawSpots();

    const handleResize = () => {
      stage.width(containerRef.current.clientWidth);
      stage.height(400);
      drawSpots();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      tooltipEl.remove();
      stage.destroy();
    };
  }, [spots, selectedSpot, hoveredSpot, onSelectSpot]);

  return (
    <div className="position-relative">
      <div id="parking-canvas-container" ref={containerRef} className="wrh-card p-0"></div>
      
      <div className="mt-3 d-flex flex-wrap gap-3 justify-content-center">
        <span className="d-flex align-items-center gap-2">
          <span className="d-inline-block" style={{
            width: 20, height: 20, background: COLORS.available, border: '2px solid #000', display: 'inline-block'
          }}></span>
          <small className="fw-bold">Tersedia</small>
        </span>
        <span className="d-flex align-items-center gap-2">
          <span className="d-inline-block" style={{
            width: 20, height: 20, background: COLORS.occupied, border: '2px solid #000', display: 'inline-block'
          }}></span>
          <small className="fw-bold">Terisi</small>
        </span>
        <span className="d-flex align-items-center gap-2">
          <span className="d-inline-block" style={{
            width: 20, height: 20, background: COLORS.selected, border: '2px solid #000', display: 'inline-block'
          }}></span>
          <small className="fw-bold">Dipilih</small>
        </span>
      </div>
    </div>
  );
};

export default ParkingMap;