export function normalize(value){return String(value??'').trim().toLowerCase().replace(/\s+/g,' ')}
export function gradeQuestion(question,value){
  if(question.type==='writing'||question.noOfficialKey)return {graded:false,correct:null};
  const accepted=(question.answers||[]).map(normalize);
  const actual=normalize(value);
  return {graded:true,correct:actual!==''&&accepted.includes(actual),actual,accepted};
}
export function gradePart(part,answers){
  const rows=part.questions.map(q=>({question:q,value:answers[q.id]??'',...gradeQuestion(q,answers[q.id])}));
  return {rows,correct:rows.filter(r=>r.correct).length,total:rows.filter(r=>r.graded).length};
}
