export const warningThresholds=[600,300,60];
export function remainingSeconds(endsAt,now=Date.now()){return Math.max(0,Math.ceil((endsAt-now)/1000))}
export function formatTime(seconds){const s=Math.max(0,Math.floor(seconds));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`}
export function crossedWarning(previous,current){return warningThresholds.find(t=>previous>t&&current<=t)??null}
