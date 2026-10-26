const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../dist/core.js');

function ready(){
  const p=C.initial().plants[0];
  p.readiness={access:true,owners:true,contract:true};
  p.mappings.forEach(m=>{if(m.target==='unresolved'){m.target='excluded';m.reason='Cycle count is not required because TotalQty independently records output.';}m.reviewed=true;});
  return p;
}
function released(){const p=ready();p.validation=C.validate(p);C.approve(p,'steward','Reviewer A');C.approve(p,'operations','Reviewer B');C.publish(p);return p;}
function fails(p,id){const v=C.validate(p);assert.equal(v.pass,false);assert.equal(v.checks.find(c=>c.id===id).pass,false);}

test('CSV parser preserves quoted commas, escaped quotes, CRLF and multiline cells',()=>{
  const p=C.parseCSV('\uFEFFid,note\r\n1,"line one\nline two, ""quoted"""\r\n');
  assert.deepEqual(p.headers,['id','note']);assert.equal(p.rows[0].note,'line one\nline two, "quoted"');
});
test('CSV rejects malformed quoting, duplicate headers and inconsistent row widths',()=>{
  for(const s of ['id,id\n1,2','a,b\n1','a,b\n1,"broken','a,b\n1,"ok"junk'])assert.throws(()=>C.parseCSV(s));
});
test('CSV rejects files without records and excessive row counts',()=>{
  assert.throws(()=>C.parseCSV('a,b\n'));assert.throws(()=>C.parseCSV('a\n'+Array(10001).fill('1').join('\n')));
});
test('sample starts blocked by readiness and an ambiguous field',()=>{
  const p=C.initial().plants[0];fails(p,'readiness');fails(p,'resolved');assert.equal(p.report,null);
});
test('reviewed source passes all checks and calculates weighted metrics',()=>{
  const p=ready();assert.equal(C.validate(p).pass,true);const m=C.calculate(p);
  assert.equal(m.total,3000);assert.equal(m.good,2700);assert.equal(m.scrap,300);assert.equal(m.scrapRate,10);
  assert.equal(m.runMinutes,1060);assert.equal(m.plannedMinutes,1440);assert.ok(Math.abs(m.availability-73.61111111111111)<1e-10);
});
test('calculations respond to source values instead of using fixed totals',()=>{
  const p=ready();Object.assign(p.source.rows[0],{TotalQty:'1200',GoodQty:'1100'});assert.equal(C.validate(p).pass,true);assert.equal(C.calculate(p).total,3200);assert.equal(C.calculate(p).scrapRate,9.375);
});
test('wrong duration conversion and unsupported units cannot pass',()=>{
  const p=ready();p.mappings.find(m=>m.source==='RunSeconds').transform='identity';fails(p,'units');fails(p,'durations');
});
test('scrap and good populations must reconcile row by row',()=>{
  const p=ready();p.source.rows[0].GoodQty='600';fails(p,'counts');assert.deepEqual(C.validate(p).checks.find(c=>c.id==='counts').rows,[2]);
});
test('missing required targets, duplicate target mappings and unknown targets fail',()=>{
  const p=ready();p.mappings.find(m=>m.target==='good_units').target='total_units';fails(p,'required');
  const q=ready();q.mappings[0].target='unsupported';fails(q,'targets');
});
test('negative, blank, infinite and fractional counts fail',()=>{
  for(const value of ['-1','','Infinity','1.5']){const p=ready();p.source.rows[0].TotalQty=value;fails(p,'numbers');}
});
test('duplicate record IDs and duplicate shift populations fail separately',()=>{
  const p=ready();p.source.rows[1].event_id=p.source.rows[0].event_id;fails(p,'duplicates');
  const q=ready();q.source.rows[1].shift_id=q.source.rows[0].shift_id;fails(q,'shift-grain');
});
test('mixed plant, line or product populations fail the scope gate',()=>{
  for(const key of ['plant_id','asset_id','product_family']){const p=ready();p.source.rows[1][key]='different';fails(p,'scope');}
});
test('timestamps require a real date, valid time and explicit timezone',()=>{
  for(const value of ['2026-10-20T08:00:00','2026-02-30T08:00:00Z','2026-10-20T25:00:00Z','2026-10-20T08:00:00+15:00']){const p=ready();p.source.rows[0].timestamp_utc=value;fails(p,'timestamps');}
  const p=ready();p.source.rows[0].timestamp_utc='2026-10-20T13:30:00+05:30';assert.equal(C.validate(p).pass,true);
});
test('zero planned time is blocked and zero-output scrap rate is unavailable',()=>{
  const p=ready();p.source.rows[0].PlannedMin='0';fails(p,'durations');
  const q=ready();q.source.rows.forEach(r=>Object.assign(r,{TotalQty:'0',GoodQty:'0',RejectQty:'0'}));assert.equal(C.validate(q).pass,true);assert.equal(C.calculate(q).scrapRate,null);
});
test('unreviewed decisions and undocumented exclusions block acceptance',()=>{
  const p=ready();p.mappings[0].reviewed=false;fails(p,'evidence');
  const q=ready();q.mappings.find(m=>m.source==='CycleCount').reason='';fails(q,'evidence');
});
test('publishing requires current validation and two current-version approvals',()=>{
  const p=ready();assert.throws(()=>C.publish(p));p.validation=C.validate(p);C.approve(p,'steward','Reviewer');assert.throws(()=>C.publish(p));C.approve(p,'operations','Reviewer B');const r=C.publish(p);assert.equal(r.metrics.total,3000);assert.equal(C.publish(p).id,r.id);
});
test('mapping edits invalidate validation, approvals, report and benchmark; retain history',()=>{
  const p=released();p.benchmark.confirmed=true;const old=p.report.id;C.applyMapping(p,'TotalQty',{definition:'Updated local definition requires review.'});
  assert.equal(p.validation,null);assert.equal(p.approvals.steward,null);assert.equal(p.report,null);assert.equal(p.benchmark.confirmed,false);assert.equal(p.history[0].id,old);assert.throws(()=>C.publish(p));
});
test('source mutation cannot reuse old acceptance even without explicit invalidation',()=>{
  const p=released();p.source.rows[0].TotalQty='1200';p.source.rows[0].GoodQty='1100';assert.throws(()=>C.publish(p));
});
test('malformed replacement preserves the previous source and publication',()=>{
  const p=released(),before=JSON.stringify(p);assert.throws(()=>C.loadSource(p,'a,a\n1,2','broken.csv'));assert.equal(JSON.stringify(p),before);
});
test('benchmark comparison requires provenance and the current report fingerprint',()=>{
  const p=released();Object.assign(p.benchmark,{confirmed:true,period:'Same three shifts',evidence:'Approved synthetic plan',reportFingerprint:p.report.fingerprint});assert.equal(C.deviations(p).length,3);p.benchmark.reportFingerprint='old';assert.equal(C.deviations(p).length,0);
});
test('workspace serialization preserves source, report and benchmark results',()=>{
  const s=C.initial(),round=C.copy(s),p=round.plants[1];assert.equal(C.validate(p).pass,true);assert.equal(C.deviations(p).length,3);assert.equal(p.report.metrics.total,3000);
});
test('reporting window uses chronological UTC order across timezone offsets',()=>{
  const p=ready();p.source.rows[0].timestamp_utc='2026-10-20T23:00:00-10:00';p.source.rows[1].timestamp_utc='2026-10-21T00:00:00Z';p.source.rows[2].timestamp_utc='2026-10-21T03:00:00Z';assert.equal(C.validate(p).pass,true);assert.equal(C.calculate(p).from,'2026-10-21T00:00:00.000Z');assert.equal(C.calculate(p).to,'2026-10-21T09:00:00.000Z');
});
test('unsafe count precision is rejected at both row and aggregate level',()=>{
  const p=ready();Object.assign(p.source.rows[0],{TotalQty:'9007199254740992',GoodQty:'9007199254740892'});fails(p,'numbers');
  const q=ready();q.source.rows.forEach(r=>Object.assign(r,{TotalQty:'9007199254740000',GoodQty:'9007199254739900'}));fails(q,'numbers');
});
test('overflowing duration aggregates cannot be published',()=>{
  const p=ready(),huge='1'+'0'.repeat(308);p.source.rows.forEach(r=>Object.assign(r,{RunSeconds:huge,PlannedMin:huge}));fails(p,'numbers');assert.throws(()=>C.publish(p));
});
