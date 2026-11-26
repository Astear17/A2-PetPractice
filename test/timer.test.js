import test from 'node:test';import assert from 'node:assert/strict';
import {remainingSeconds,formatTime,crossedWarning} from '../js/timer.js';
test('uses absolute deadline',()=>assert.equal(remainingSeconds(61000,1000),60));
test('formats time',()=>assert.equal(formatTime(65),'1:05'));
test('detects warning crossing',()=>assert.equal(crossedWarning(301,300),300));
