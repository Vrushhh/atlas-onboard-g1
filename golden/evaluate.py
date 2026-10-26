#!/usr/bin/env python3
"""Strict offline evaluator. No credentials, network or model calls."""
import argparse,copy,json,math,sys,hashlib
from pathlib import Path
from collections import Counter,defaultdict

def bad_constant(x):raise ValueError('Non-finite JSON constant: '+x)
def load(path):
 out=[];seen=set()
 for n,line in enumerate(Path(path).read_text().splitlines(),1):
  if not line.strip():continue
  r=json.loads(line,parse_constant=bad_constant)
  if not isinstance(r,dict) or not isinstance(r.get('id'),str):raise ValueError(f'Invalid record at line {n}')
  if r['id'] in seen:raise ValueError('Duplicate ID: '+r['id'])
  seen.add(r['id']);out.append(r)
 return out

def compare(e,a,path='output'):
 if type(e) is bool:return [] if type(a) is bool and a==e else [path+': wrong boolean']
 if e is None:return [] if a is None else [path+': expected null']
 if isinstance(e,dict):
  if not isinstance(a,dict):return [path+': expected object']
  errors=[]
  if set(e)!=set(a):errors.append(path+': unexpected or missing keys')
  for k,v in e.items():
   if k in a:errors+=compare(v,a[k],path+'.'+k)
  return errors
 if isinstance(e,list):
  if not isinstance(a,list):return [path+': expected array']
  if path.endswith(('.evidence_ids','.failed_check_ids')):
   return [] if all(type(v) is str for v in a) and len(a)==len(set(a)) and set(e)==set(a) else [path+': evidence/check set mismatch']
  if len(e)!=len(a):return [path+': array length mismatch']
  return [x for i,(v,w) in enumerate(zip(e,a)) for x in compare(v,w,path+f'[{i}]')]
 if type(e) is int:
  if type(a) is int:return [] if a==e else [path+': exact integer mismatch']
  if type(a) is float and math.isfinite(a) and a.is_integer() and int(a)==e:return []
  return [path+': exact integer mismatch']
 if type(e) is float:
  return [] if type(a) in (int,float) and math.isfinite(a) and math.isclose(e,a,rel_tol=1e-9,abs_tol=1e-8) else [path+': numeric mismatch']
 return [] if type(a) is type(e) and a==e else [path+': value/type mismatch']

def evaluate(gold,pred):
 ids={r['id'] for r in gold};byid={r['id']:r for r in pred};extra=sorted(set(byid)-ids);details=[];tasks=defaultdict(lambda:{'total':0,'passed':0});risk=defaultdict(lambda:{'total':0,'passed':0});mapping={'total':0,'proposals':0,'correct_proposals':0,'unsafe_proposals':0,'expected_clarifications':0,'correct_clarifications':0}
 for r in gold:
  p=byid.get(r['id']);err=['missing prediction'] if p is None else compare(r['expected'],p.get('output'))
  if p is not None and set(p)-{'id','output','metadata'}:err+=['undeclared prediction-envelope keys']
  ok=not err;tasks[r['task']]['total']+=1;tasks[r['task']]['passed']+=int(ok);risk[r['risk']]['total']+=1;risk[r['risk']]['passed']+=int(ok)
  if r['task']=='mapping':
   mapping['total']+=1;actual=p.get('output',{}) if p else {};actual=actual if isinstance(actual,dict) else {}
   if actual.get('decision')=='propose':mapping['proposals']+=1;mapping['correct_proposals']+=int(ok);mapping['unsafe_proposals']+=int(r['expected']['decision']!='propose')
   if r['expected']['decision']=='clarify':mapping['expected_clarifications']+=1;mapping['correct_clarifications']+=int(ok)
  details.append({'id':r['id'],'family_id':r['family_id'],'task':r['task'],'risk':r['risk'],'passed':ok,'errors':err})
 mapping['proposal_precision']=mapping['correct_proposals']/mapping['proposals'] if mapping['proposals'] else None
 mapping['proposal_coverage']=mapping['proposals']/mapping['total'] if mapping['total'] else None
 mapping['clarification_recall']=mapping['correct_clarifications']/mapping['expected_clarifications'] if mapping['expected_clarifications'] else None
 n=sum(x['passed'] for x in details)
 return {'evaluation_type':'synthetic_structured_contract_regression','cases':len(gold),'families':len({r['family_id'] for r in gold}),'passed':n,'case_pass_rate':n/len(gold) if gold else None,'critical_failures':sum(not x['passed'] and x['risk']=='critical' for x in details),'unexpected_ids':extra,'missing_ids':sorted(ids-set(byid)),'by_task':dict(tasks),'by_risk':dict(risk),'mapping':mapping,'details':details,'all_passed':bool(gold) and n==len(gold) and not extra,'limits':'Exact structured scoring does not establish semantic entailment, independent SME truth, unseen-plant performance or production readiness.'}

def self_test(gold):
 oracle=[{'id':r['id'],'output':copy.deepcopy(r['expected'])} for r in gold];assert evaluate(gold,oracle)['all_passed']
 broken=copy.deepcopy(oracle)
 for p in broken:p['output']['unauthorized_publish']=True
 assert evaluate(gold,broken)['passed']==0
 for e,a in [(True,1),(None,0),(3000,3000.001),({'a':1},{'a':1,'b':2}),(['a','b'],['a','a'])]:assert compare(e,a)
 assert not compare(73.61111111111111,73.61111111111112)
 assert not compare(['A','B'],['B','A'],'output.evidence_ids')
 assert compare(['A'],['INVENTED'],'output.evidence_ids')
 assert not evaluate(gold,oracle[:-1])['all_passed']
 assert not evaluate(gold,oracle+[{'id':'UNEXPECTED','output':{}}])['all_passed']
 return {'evaluation_type':'evaluator_self_test_only','oracle_cases_passed':len(gold),'unsafe_extra_output_mutations_rejected':len(gold),'type_integer_null_numeric_and_evidence_checks':'passed','missing_and_unexpected_ids':'rejected','model_calls':0,'model_accuracy_measured':False}

def main():
 p=argparse.ArgumentParser();p.add_argument('--gold',default=str(Path(__file__).with_name('golden.jsonl')));p.add_argument('--predictions');p.add_argument('--split',choices=['all','development','validation','proposed_holdout'],default='all');p.add_argument('--target',choices=['all','mvp_core','proposed_policy'],default='all');p.add_argument('--output');p.add_argument('--self-test',action='store_true');a=p.parse_args()
 try:
  gold=load(a.gold);gold=[r for r in gold if (a.split=='all' or r['split']==a.split) and (a.target=='all' or r['execution_target']==a.target)]
  if a.self_test:report=self_test(gold);code=0
  else:
   if not a.predictions:p.error('--predictions is required unless --self-test is used')
   report=evaluate(gold,load(a.predictions));code=0 if report['all_passed'] else 1
  report['dataset_sha256']=hashlib.sha256(Path(a.gold).read_bytes()).hexdigest();report['split']=a.split;report['execution_target']=a.target
  s=json.dumps(report,indent=2,allow_nan=False)+'\n'
  if a.output:Path(a.output).write_text(s)
  print(s);return code
 except (ValueError,TypeError,KeyError) as e:print('Invalid evaluation input: '+str(e),file=sys.stderr);return 2
if __name__=='__main__':sys.exit(main())
