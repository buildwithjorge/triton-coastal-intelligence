import { motion } from "framer-motion";
import { severityColors, type Severity } from "@triton/shared";

type Props = {
  tsi: number;
  severity: Severity;
  size?: number;
};

export function TsiArcGauge({ tsi, severity, size = 240 }: Props) {
  const radius = size * 0.36;
  const strokeWidth = Math.max(12, Math.round(size * 0.075));
  const center = size / 2;
  const start = 135;
  const end = 405;
  const sweep = end - start;
  const progress = Math.max(0, Math.min(1, tsi / 100));

  const describeArc = (angleStart: number, angleEnd: number) => {
    const polarToCartesian = (angle: number) => {
      const rad = ((angle - 90) * Math.PI) / 180;
      return {
        x: center + radius * Math.cos(rad),
        y: center + radius * Math.sin(rad)
      };
    };

    const p0 = polarToCartesian(angleStart);
    const p1 = polarToCartesian(angleEnd);
    const largeArcFlag = angleEnd - angleStart <= 180 ? "0" : "1";
    return `M ${p0.x} ${p0.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${p1.x} ${p1.y}`;
  };

  const fullArcPath = describeArc(start, end);
  const progressArcPath = describeArc(start, start + sweep * progress);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path d={fullArcPath} stroke="rgba(74,122,155,0.32)" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
        <motion.path
          d={progressArcPath}
          stroke={severityColors[severity]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-7xl leading-none tracking-tight text-ice">{tsi}</span>
        <span className="mt-1 font-mono text-xs uppercase tracking-[0.2em]" style={{ color: severityColors[severity] }}>
          {severity}
        </span>
        <span className="mt-1 text-[11px] uppercase tracking-[0.18em] text-steel">Triton Sargassum Index</span>
      </div>
    </div>
  );
}
