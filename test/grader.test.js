import test from 'node:test';import assert from 'node:assert/strict';
import {normalize,gradeQuestion} from '../js/grader.js';
import {tests} from '../js/data.js';
test('normalizes case and spaces',()=>assert.equal(normalize('  Half   Past Seven '),'half past seven'));
test('accepts listed variants',()=>assert.equal(gradeQuestion({type:'gap',answers:['Friday','Fri']},' fri ').correct,true));
test('does not grade writing',()=>assert.equal(gradeQuestion({type:'writing'},'draft').graded,false));
const schoolsListening=tests.find(test=>test.id==='a2-key-schools-2020').papers.find(paper=>paper.id==='listening');
const listeningQuestion=number=>schoolsListening.parts.flatMap(part=>part.questions).find(question=>question.number===number);
test('accepts optional Schools Listening Q6-10 words',()=>{
  const passing=[[6,'Mrs Fairford'],[7,'on Fri'],[8,'at 7.30 a.m.'],[8,'half seven'],[9,'by train'],[9,'the trains'],[10,'boots'],[10,'walking boots']];
  for(const [number,answer] of passing)assert.equal(gradeQuestion(listeningQuestion(number),answer).correct,true,`Q${number}: ${answer}`);
});
test('rejects incorrect Schools Listening Q6-10 words',()=>{
  const failing=[[6,'Fairfield'],[7,'Monday'],[9,'bus']];
  for(const [number,answer] of failing)assert.equal(gradeQuestion(listeningQuestion(number),answer).correct,false,`Q${number}: ${answer}`);
});
