// Actual deterministic MVP adapter. It does not infer labels or invoke a model.
const fs=require('node:fs'),path=require('node:path');
const C=require(process.env.ATLAS_CORE_PATH||'./system_under_test/core.js');
const root=__dirname,gold=fs.readFileSync(path.join(root,'golden.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
function ready(r){const p=C.initial().plants[0];p.readiness={access:true,owners:true,contract:true};p.owners={integration:'Synthetic integration reviewer',operations:'Synthetic operations reviewer',steward:'Synthetic group reviewer'};if(r.input.fixture_path){C.loadSource(p,fs.readFileSync(path.join(root,r.input.fixture_path),'utf8'),r.input.fixture_path,true);}p.mappings.forEach(m=>{if(m.target==='unresolved'){m.target='excluded';m.reason='Cycle count is outside scope because TotalQty independently records output.';}m.reviewed=true;});for(const patch of r.input.state_patches||[]){if(patch.mapping_source){Object.assign(p.mappings.find(m=>m.source===patch.mapping_source),patch.values);}else{let x=p;for(const k of patch.path.slice(0,-1))x=x[k];x[patch.path.at(-1)]=patch.value;}}return p;}
function released(r){const p=ready(r);p.validation=C.validate(p);C.approve(p,'steward',p.owners.steward);C.approve(p,'operations',p.owners.operations);C.publish(p);return p;}
function output(r){
 if(r.task==='validation'){const p=ready(r),v=C.validate(p);return {decision:v.pass?'pass':'block',failed_check_ids:v.checks.filter(c=>!c.pass).map(c=>c.id).sort(),affected_csv_rows:Object.fromEntries(v.checks.filter(c=>!c.pass&&c.rows.length).map(c=>[c.id,c.rows])),can_publish:false};}
 if(r.task==='kpi'){const p=ready(r),v=C.validate(p);if(!v.pass)return {decision:'block',metrics:null,reason_code:'INVALID_PLANNED_TIME'};const m=C.calculate(p);return {decision:'compute',metrics:{total_units:m.total,good_units:m.good,scrap_units:m.scrap,run_minutes:m.runMinutes,planned_minutes:m.plannedMinutes,scrap_rate_percent:m.scrapRate,availability_percent:m.availability},reason_code:null};}
 if(r.task==='workflow'){
  const op=r.input.operation;let p,decision;
  if(op==='publish'){p=ready(r);p.validation=C.validate(p);for(const role of r.input.reviews)C.approve(p,role,p.owners[role]);try{C.publish(p);decision='publish';}catch{decision='block';}}
  else{p=released(r);if(op==='mapping_change'){C.applyMapping(p,'TotalQty',{definition:'Updated definition requires a new review.'});try{C.publish(p);decision='publish';}catch{decision='block';}}
  else if(op==='source_mutation'){Object.assign(p.source.rows[0],{TotalQty:'1200',GoodQty:'1100'});try{C.publish(p);decision='publish';}catch{decision='block';}}
  else if(op==='valid_source_replace'){C.loadSource(p,C.SAMPLE_CSV,'replacement.csv',true);decision='replace_and_invalidate';}
  else if(op==='invalid_source_replace'){try{C.loadSource(p,'a,a\n1,2','replacement.csv');decision='replace';}catch{decision='reject_preserve';}}
  else throw Error('Unsupported MVP operation '+op);}
  return {decision,report_object_present:!!p.report,report_is_current:!!p.report&&p.report.fingerprint===C.fingerprint(p),history_count:p.history.length};
 }
 throw Error('Unsupported executable task '+r.task);
}
const records=gold.filter(r=>r.execution_target==='mvp_core').map(r=>({id:r.id,output:output(r),metadata:{system:'current_MVP_rules_engine',model_calls:0}}));
const file=process.argv[2]||path.join(root,'reports','mvp-predictions.jsonl');fs.writeFileSync(file,records.map(r=>JSON.stringify(r)).join('\n')+'\n');console.log(JSON.stringify({executed:records.length,output:file,model_calls:0}));
