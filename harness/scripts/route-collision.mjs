#!/usr/bin/env node
// Gate 8: route-collision script per gates-and-hooks.md §Route-collision.
// Extract registered routes (Fastify-style .get/.post/…('path')); fail on
// exact duplicate METHOD+path and near-duplicates by normalization (case,
// trailing slash, singular/plural segments, :param name differences).
// usage: route-collision.mjs [dir=.]
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROUTE_RE = /\.(get|post|put|delete|patch|head|options)\(\s*['"`]([^'"`]+)['"`]/g;

function normalize(path) {
  return path
    .toLowerCase()
    .replace(/\/+$/, '')
    .split('/')
    .map((seg) => {
      if (seg.startsWith(':')) return ':p';
      return seg.endsWith('s') && seg.length > 1 ? seg.slice(0, -1) : seg;
    })
    .join('/');
}

const root = process.argv[2] ?? '.';
const files = execFileSync('git', ['ls-files', '*.ts', '*.js', '*.mjs'], { cwd: root, encoding: 'utf8' })
  .split('\n')
  .filter((f) => f !== '' && !f.includes('route-collision') && !f.startsWith('tests/') && !f.includes('.test.'));

const routes = [];
for (const file of files) {
  let text;
  try {
    text = readFileSync(join(root, file), 'utf8');
  } catch {
    continue;
  }
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    for (const m of lines[i].matchAll(ROUTE_RE)) {
      routes.push({ method: m[1].toUpperCase(), path: m[2], where: `${file}:${i + 1}` });
    }
  }
}

let collisions = 0;
for (let i = 0; i < routes.length; i++) {
  for (let j = i + 1; j < routes.length; j++) {
    const a = routes[i];
    const b = routes[j];
    if (a.method !== b.method) continue;
    if (a.path === b.path) {
      console.error(`ROUTE COLLISION (exact): ${a.method} ${a.path} at ${a.where} and ${b.where}`);
      collisions++;
    } else if (normalize(a.path) === normalize(b.path)) {
      console.error(`ROUTE COLLISION (near): ${a.method} ${a.path} (${a.where}) ~ ${b.path} (${b.where})`);
      collisions++;
    }
  }
}
if (collisions > 0) {
  console.error(`route-collision: ${collisions} colliding pair(s) — gate 8 FAIL`);
  process.exit(1);
}
console.log(`route-collision: clean (${routes.length} route(s))`);
