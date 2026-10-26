#!/usr/bin/env python3
"""Offline contract evaluator. Makes no model calls and reads no credentials."""
import argparse,copy,json,math,sys
from collections import Counter
from pathlib import Path

def load_jsonl(path):
 rows=[];ids=set()
 for i,line in enumerate(Path(path).read_text().splitlines(),1):
  if not line.strip():continue
  r=json.loads(line)
  if not isinstance(r,dict) or not isinstance(r.get('id'),str):raise ValueError(f'Invalid record at line {i}')
  if r['id'] in ids:raise ValueError(f'Duplicate ID {r["id"]}')
  ids.add(r['id']);rows.append(r)
 return rows

def errors(expected,actual,path='output'):
 if type(expected) is not type(actual) and not (type(expected) in [int,float] and type(actual) in [int,float]):return [f'{path}: wrong type']
 if isinstance(expected,dict):
  result=[]
  if set(actual)!=set(expected):result.append(f'{path}: expected exactly keys {sorted(expected)}, got {sorted(actual)}')
  for k in expected:
   if k in actual:result+=errors(expected[k],actual[k],path+'.'+k)
  return result
 if isinstance(expected,list):
  return [] if actual==expected else [f'{path}: list mismatch']
 if type(expected) in [int,float]:
  return [] if math.isfinite(actual) and math.isclose(expected,actual,rel_tol=1e-6,abs_tol=1e-6) else [f'{path}: numerical mismatch']
 return [] if actual==expected else [f'{path}: expected {expected!r}, got {actual!r}']

def evaluate(gold,preds):
 byid={r['id']:r for r in preds};details=[];counts={};critical=0
 expected_ids={r['id'] for r in gold};unexpected=sorted(set(byid)-expected_ids)
 for r in gold:
  p=byid.get(r['id']);errs=['missing prediction'] if p is None else errors(r['expected'],p.get('output'))
  passed=not errs
  if r['task'] not in counts:counts[r['task']]={'total':0,'passed':0}
  counts[r['task']]['total']+=1;counts[r['task']]['passed']+=int(passed)
  if not passed and r['risk']=='critical':critical+=1
  details.append({'id':r['id'],'task':r['task'],'passed':passed,'errors':errs})
 n=sum(x['passed'] for x in details)
 return {'evaluation_type':'offline_task_contract','rows':len(gold),'independent_groups':len({r['group_id'] for r in gold}),'passed':n,'pass_rate':n/len(gold) if gold else None,'critical_failures':critical,'unexpected_ids':unexpected,'by_task':counts,'details':details,'all_passed':bool(gold) and n==len(gold) and not unexpected,'note':'Passing these synthetic examples does not establish real-plant or production model quality.'}

def main():
 p=argparse.ArgumentParser();p.add_argument('--gold',default=str(Path(__file__).with_name('golden.jsonl')));p.add_argument('--predictions');p.add_argument('--split',choices=['all','development','validation','proposed_holdout'],default='all');p.add_argument('--output');p.add_argument('--self-test',action='store_true');a=p.parse_args()
 gold=load_jsonl(a.gold)
 if a.split!='all':gold=[r for r in gold if r['split']==a.split]
 if a.self_test:
  oracle=[{'id':r['id'],'output':copy.deepcopy(r['expected'])} for r in gold]
  exact=evaluate(gold,oracle)
  broken=copy.deepcopy(oracle)
  for r in broken:r['output']['decision']='INTENTIONALLY_WRONG'
  mutated=evaluate(gold,broken)
  assert exact['all_passed'] and mutated['passed']==0
  # Authorization-sensitive extra keys must fail even when expected fields are correct.
  badextra=copy.deepcopy(oracle);badextra[0]['output']['unapproved_action']='publish'
  assert not evaluate(gold,badextra)['all_passed']
  report={'test_type':'evaluator_self_test_only','oracle_passes':exact['passed'],'mutations_rejected':len(gold)-mutated['passed'],'unexpected_output_keys_rejected':True,'model_calls':0,'production_model_evaluation':False}
  result=0
 else:
  if not a.predictions:p.error('--predictions is required unless --self-test is set')
  report=evaluate(gold,load_jsonl(a.predictions));result=0 if report['all_passed'] else 1
 text=json.dumps(report,indent=2)
 if a.output:Path(a.output).write_text(text+'\n')
 print(text);return result
if __name__=='__main__':sys.exit(main())
