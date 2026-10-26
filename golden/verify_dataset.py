#!/usr/bin/env python3
"""Offline dataset integrity and supported-schema-subset check (stdlib only)."""
import json,hashlib,collections,sys,tempfile,subprocess
from pathlib import Path
from evaluate import load
ROOT=Path(__file__).parent

def schema_check(v,s):
 if 'enum' in s:assert v in s['enum']
 if 'type' in s:
  tt=s['type'];tt=[tt] if isinstance(tt,str) else tt
  actual='null' if v is None else 'boolean' if type(v) is bool else 'integer' if type(v) is int else 'number' if type(v) is float else 'string' if isinstance(v,str) else 'array' if isinstance(v,list) else 'object' if isinstance(v,dict) else 'unsupported'
  assert actual in tt or actual=='integer' and 'number' in tt,(actual,tt)
 if v is None:return
 if isinstance(v,dict) and s.get('properties') is not None:
  assert set(s.get('required',[]))<=set(v)
  if s.get('additionalProperties') is False:assert set(v)<=set(s['properties'])
  for k,x in v.items():
   if k in s['properties']:schema_check(x,s['properties'][k])
 if isinstance(v,list):
  if s.get('uniqueItems'):assert len({json.dumps(x,sort_keys=True) for x in v})==len(v)
  for x in v:schema_check(x,s.get('items',{}))

def main():
 rows=load(ROOT/'golden.jsonl');groups=collections.defaultdict(list)
 for r in rows:groups[r['family_id']].append(r);schema_check(r['expected'],r['output_schema'])
 assert len(rows)==80 and len(groups)==40
 for fam,pair in groups.items():
  assert len(pair)==2 and len({r['split'] for r in pair})==1
  assert pair[0]['output_schema']==pair[1]['output_schema'],('Schema reveals pair verdict',fam)
 seen=set();input_count=0
 for p in (ROOT/'inputs').glob('*.jsonl'):
  for r in load(p):
   assert set(r)=={'id','task','policy_context','input','output_schema'}
   assert r['id'] not in seen;seen.add(r['id']);input_count+=1
   if 'fixture_path' in r['input']:assert r['input']['source_csv']==(ROOT/r['input']['fixture_path']).read_text()
 assert seen=={r['id'] for r in rows}
 failed_checks={c for r in rows if r['task']=='validation' for c in r['expected']['failed_check_ids']}
 assert failed_checks==set(next(r for r in rows if r['task']=='validation')['output_schema']['properties']['failed_check_ids']['items']['enum'])
 # Exercise the actual CLI's input validation with duplicate IDs and non-finite JSON.
 with tempfile.TemporaryDirectory() as tmp:
  f=Path(tmp)/'bad.jsonl'
  for text in ['{"id":"X","output":NaN}\n','{"id":"X","output":{}}\n{"id":"X","output":{}}\n']:
   f.write_text(text);r=subprocess.run([sys.executable,str(ROOT/'evaluate.py'),'--predictions',str(f)],capture_output=True,text=True);assert r.returncode==2
 report={'dataset_sha256':hashlib.sha256((ROOT/'golden.jsonl').read_bytes()).hexdigest(),'cases':len(rows),'families':len(groups),'model_inputs':input_count,'schema_subset_checks':'passed','paired_output_schemas_equal':True,'family_split_overlap':0,'all_14_validation_checks_exercised':True,'verdict_metadata_absent_from_model_inputs':True,'duplicate_ids_and_nonfinite_json_rejected':True,'model_calls':0}
 (ROOT/'reports/dataset-integrity.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
if __name__=='__main__':main()
