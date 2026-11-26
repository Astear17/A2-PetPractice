import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tests} from '../js/data.js';
import {libraryFiles} from '../js/data.js';
import {gradeQuestion} from '../js/grader.js';

const normalize=value=>String(value).trim().toLowerCase().replace(/\s+/g,' ');
const choice=text=>text.split(/\s+/).map(value=>[value]);
const gaps=text=>text.split(',').map(group=>group.trim().split('/'));
const combine=(...groups)=>groups.flat();
const phrases=(...groups)=>groups.reduce((rows,group)=>rows.flatMap(row=>group.map(value=>`${row}${value}`)),['']).map(value=>value.trim());
const schoolsListeningGaps=[
  phrases(['','mrs '],['fairford']),
  phrases(['','on '],['friday','fri']),
  phrases(['','at ','for '],['7.30','7.30 a.m.','seven thirty','half seven','half past seven']),
  phrases(['','by '],['','a ','an ','the '],['train','trains'],['',' for a change']),
  phrases(['','a ','an ','the '],['','walking '],['boots'])
];

const expectedKeys={
  'a2-key-2020/rw':combine(
    choice('B C B A B C'),choice('C B A B C C A'),choice('B A C B A'),
    choice('B B A B C C'),gaps('a/this, in/during, of, go, play/watch, when/after')
  ),
  'a2-key-2020/listening':combine(
    choice('A C C A A'),gaps('August, 19, drive, 65, photograph'),
    choice('B A C B B'),choice('A B C B A'),choice('F C A D H')
  ),
  'a2-key-schools-2020/rw':combine(
    choice('B C A A B B'),choice('B C B A C A C'),choice('B C A C B'),
    choice('C B A C B B'),gaps('your/the, Is, lot, on, they, to')
  ),
  'a2-key-schools-2020/listening':combine(
    choice('C A C A A'),schoolsListeningGaps,
    choice('B A C B A'),choice('B C B A B'),choice('E F G A B')
  )
};

const sourcePdfs={
  'a2-key-2020/rw':'a2-key-2020-reading-writing-question-paper.pdf',
  'a2-key-2020/listening':'a2-key-2020-listening-question-paper.pdf',
  'a2-key-schools-2020/rw':'a2-key-for-schools-2020-reading-writing-question-paper.pdf',
  'a2-key-schools-2020/listening':'a2-key-for-schools-2020-listening-question-paper.pdf'
};

const ranges=(entries)=>Object.fromEntries(entries.flatMap(([from,to,pages])=>
  Array.from({length:to-from+1},(_,index)=>[from+index,pages])
));

const pageMaps={
  'a2-key-2020/rw':ranges([[1,3,[2]],[4,6,[3]],[7,13,[4,5]],[14,18,[6,7]],[19,24,[8]],[25,30,[9]],[31,31,[10]],[32,32,[11]]]),
  'a2-key-schools-2020/rw':ranges([[1,3,[2]],[4,6,[3]],[7,13,[4,5]],[14,18,[6,7]],[19,24,[8]],[25,30,[9]],[31,31,[10]],[32,32,[11]]]),
  'a2-key-2020/listening':ranges([[1,3,[2]],[4,5,[3]],[6,10,[4]],[11,15,[5]],[16,20,[6]],[21,25,[7]]]),
  'a2-key-schools-2020/listening':ranges([[1,3,[2]],[4,5,[3]],[6,10,[4]],[11,15,[5]],[16,20,[6]],[21,25,[7]]])
};

const mismatches=[];
for(const [key,expected] of Object.entries(expectedKeys)){
  const [testId,paperId]=key.split('/');
  const paper=tests.find(test=>test.id===testId)?.papers.find(item=>item.id===paperId);
  if(!paper){mismatches.push(`${key}: paper missing`);continue}
  const questions=paper.parts.flatMap(part=>part.questions).filter(question=>question.number<=expected.length);
  if(questions.length!==expected.length)mismatches.push(`${key}: expected ${expected.length} questions, found ${questions.length}`);
  expected.forEach((answers,index)=>{
    const question=questions.find(item=>item.number===index+1);
    if(!question){mismatches.push(`${key} Q${index+1}: missing`);return}
    const actual=question.answers.map(normalize).sort();
    const wanted=answers.map(normalize).sort();
    if(JSON.stringify(actual)!==JSON.stringify(wanted))mismatches.push(`${key} Q${index+1}: expected [${wanted.join(', ')}], found [${actual.join(', ')}]`);
  });
}

const schoolsListening=tests.find(test=>test.id==='a2-key-schools-2020')?.papers.find(paper=>paper.id==='listening');
const listeningQuestion=number=>schoolsListening?.parts.flatMap(part=>part.questions).find(question=>question.number===number);
for(const [number,answer] of [[6,'Mrs Fairford'],[7,'on Fri'],[8,'at 7.30 a.m.'],[8,'half seven'],[9,'by train'],[9,'the trains'],[10,'boots'],[10,'walking boots']]){
  if(!gradeQuestion(listeningQuestion(number),answer).correct)mismatches.push(`Required pass failed: Q${number} “${answer}”`);
}
for(const [number,answer] of [[6,'Fairfield'],[7,'Monday'],[9,'bus']]){
  if(gradeQuestion(listeningQuestion(number),answer).correct)mismatches.push(`Required failure was accepted: Q${number} “${answer}”`);
}

for(const test of tests){
  for(const paper of test.papers){
    const key=`${test.id}/${paper.id}`;const map=pageMaps[key];
    if(!map)continue;
    for(const part of paper.parts){
      for(const question of part.questions){
        const expectedPages=map[question.number];
        if(!expectedPages){mismatches.push(`${key} Q${question.number}: no page mapping`);continue}
        const actualPages=part.sourcePages.map(path=>Number(path.match(/-(\d+)\.png$/)?.[1])).filter(Number.isFinite);
        const missing=expectedPages.filter(page=>!actualPages.includes(page));
        if(missing.length)mismatches.push(`${key} Q${question.number}: fallback omits PDF page ${missing.join(', ')}`);
        for(const page of expectedPages){
          const image=part.sourcePages.find(path=>path.endsWith(`-${page}.png`));
          if(!image||!existsSync(image))mismatches.push(`${key} Q${question.number}: missing rendered page ${page}`);
        }
        console.log(`PAGE ${key} Q${question.number} -> ${sourcePdfs[key]} page ${expectedPages.join(' + ')}`);
      }
    }
  }
}

const gitignore=readFileSync(new URL('../.gitignore',import.meta.url),'utf8').split(/\r?\n/).map(line=>line.trim());
if(!gitignore.includes('library/'))mismatches.push('.gitignore: library/ is missing');
if(!gitignore.includes('assets/pages/vn-*.png'))mismatches.push('.gitignore: Vietnamese rendered pages rule is missing');

const vietnamese=tests.find(test=>test.id==='vietnamese-a2');
for(const part of vietnamese?.papers.flatMap(paper=>paper.parts)||[]){
  if(part.sourcePages?.length)mismatches.push(`${part.id}: Vietnamese paper still depends on page images`);
  if(!part.sourceText?.trim())mismatches.push(`${part.id}: typed Vietnamese source text is missing`);
}

for(const filename of libraryFiles){
  if(!/^[a-z0-9][a-z0-9.-]*$/.test(filename))mismatches.push(`Unsafe deployed filename: ${filename}`);
  if(!existsSync(new URL(`../materials/${filename}`,import.meta.url)))mismatches.push(`Missing deployed material: ${filename}`);
}
const tracked=execFileSync('git',['-c','safe.directory=D:/GitHub/A2-PetPractice','ls-files'],{encoding:'utf8'}).split(/\r?\n/).filter(Boolean);
const localOnly=tracked.filter(path=>path.startsWith('library/')||/^assets\/pages\/vn-/i.test(path)||/complete preliminary|pet reading|de-thi-tieng-anh-a2|(^|\/)~\$/i.test(path));
if(localOnly.length)mismatches.push(`Local-only files are tracked: ${localOnly.join(', ')}`);
const deployedMaterials=tracked.filter(path=>path.startsWith('materials/')).map(path=>path.slice('materials/'.length)).sort();
if(JSON.stringify(deployedMaterials)!==JSON.stringify([...libraryFiles].sort()))mismatches.push('Tracked materials do not exactly match the deployed Library manifest');

if(mismatches.length){
  console.error('\nMISMATCHES');
  mismatches.forEach(item=>console.error(`- ${item}`));
  process.exitCode=1;
}else{
  console.log('\nPASS: keys, required pass/fail cases, page mappings, deployed materials, local-only exclusions, and ignore rules match the verification specification.');
}
