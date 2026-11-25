#!/usr/bin/env node
/** 사람이 직접 실행하는 글자 기본값 복원. 모델·네트워크 호출 없음. */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runTypographyReset } from './lib/typography-reset.mjs';
try {
  const root = process.env.DS_ROOT ? resolve(process.env.DS_ROOT) : resolve(dirname(fileURLToPath(import.meta.url)), '..');
  await runTypographyReset({ root, args: process.argv.slice(2) });
} catch (error) { console.error(`Text style reset stopped: ${error.message}`); process.exitCode = 1; }
