(function (root) {
  'use strict';
  const VERSION = 2;
  const FIELDS = [
    ['plant_id','Plant ID','text'],['asset_id','Production line','text'],['event_id','Record ID','text'],
    ['shift_id','Shift ID','text'],['timestamp_utc','Timestamp with timezone','time'],['product_family','Product family','text'],
    ['total_units','Total output','count'],['good_units','Good output','count'],['scrap_units','Scrap output','count'],
    ['run_minutes','Running time','duration'],['planned_minutes','Planned production time','duration']
  ].map(([id,label,kind])=>({id,label,kind}));
  const SAMPLE_CSV = 'plant_id,asset_id,event_id,shift_id,timestamp_utc,source_timezone,product_family,TotalQty,GoodQty,RejectQty,RunSeconds,PlannedMin,CycleCount,Energy_kWh\nSYN-P12,SYN-LINE-A,SYN-E01,SYN-01,2026-10-20T08:00:00Z,UTC,SYN-Product-A,1000,900,100,21600,480,400,84\nSYN-P12,SYN-LINE-A,SYN-E02,SYN-02,2026-10-20T16:00:00Z,UTC,SYN-Product-A,1000,950,50,24000,480,450,91\nSYN-P12,SYN-LINE-A,SYN-E03,SYN-03,2026-10-21T00:00:00Z,UTC,SYN-Product-A,1000,850,150,18000,480,350,79\n';
  const SAMPLE_DEFS = {
    plant_id:['plant_id','text','Atlas reporting identifier of the plant owning this record.'],
    asset_id:['asset_id','text','Identifier of the production line; the scoped export contains one line only.'],
    event_id:['event_id','text','Unique record identifier within the plant and production line.'],
    shift_id:['shift_id','text','Identifier of a single reporting shift.'],
    timestamp_utc:['timestamp_utc','UTC timestamp','End of the reporting shift, supplied in UTC with a Z suffix.'],
    product_family:['product_family','text','All counts describe one comparable product population identified by product_family.'],
    TotalQty:['total_units','count','All units produced in the shift, including good and scrap units.'],
    GoodQty:['good_units','count','Accepted output units included in TotalQty; no rework in this fixture.'],
    RejectQty:['scrap_units','count','Scrapped output units included in TotalQty; no rework in this fixture.'],
    RunSeconds:['run_minutes','s','Actual running duration in seconds for this shift and line.'],
    PlannedMin:['planned_minutes','min','Planned production duration in minutes for the same reporting shift.']
  };
  function copy(x){return JSON.parse(JSON.stringify(x));}
  function uid(prefix='id'){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);}
  function fingerprint(p){
    const text=JSON.stringify({id:p.id,line:p.line,product:p.product,revision:p.revision,readiness:p.readiness,owners:p.owners,source:p.source,mappings:p.mappings});
    let h=2166136261; for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);
    return 'local-'+(h>>>0).toString(16).padStart(8,'0');
  }
  function parseCSV(text){
    if(typeof text!=='string'||text.length>2*1024*1024)throw new Error('Use a UTF-8 CSV file up to 2 MB.');
    text=text.replace(/^\uFEFF/,'');
    let rows=[],row=[],cell='',quoted=false,closed=false;
    const pushCell=()=>{row.push(cell);cell='';closed=false;};
    const pushRow=()=>{pushCell();if(row.some(c=>c.trim()!==''))rows.push(row);row=[];};
    for(let i=0;i<text.length;i++){
      const c=text[i];
      if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=c;continue;}
      if(c==='"'){if(cell.length||closed)throw new Error('Malformed CSV: a quote must begin a field.');quoted=true;}
      else if(c===',')pushCell();
      else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;pushRow();}
      else {if(closed)throw new Error('Malformed CSV: unexpected text after a quoted field.');cell+=c;}
    }
    if(quoted)throw new Error('Malformed CSV: a quoted field was not closed.');
    if(cell!==''||row.length||closed)pushRow();
    if(rows.length<2)throw new Error('Add a header row and at least one data row.');
    const headers=rows.shift().map(h=>h.trim());
    if(headers.some(h=>!h)||new Set(headers).size!==headers.length)throw new Error('Column headers must be non-empty and unique.');
    if(headers.length>60)throw new Error('The MVP supports up to 60 columns.');
    if(rows.length>10000)throw new Error('The MVP supports up to 10,000 data rows.');
    rows.forEach((r,i)=>{if(r.length!==headers.length)throw new Error('CSV row '+(i+2)+' has '+r.length+' cells; expected '+headers.length+'.');});
    return {headers,rows:rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i].trim()]))) };
  }
  function newMappings(headers){return headers.map(source=>({source,target:FIELDS.some(f=>f.id===source)?source:'unresolved',unit:'',transform:'identity',definition:'',evidence:'',reviewed:false,reason:''}));}
  function sampleMappings(headers){return headers.map((source,i)=>{
    const d=SAMPLE_DEFS[source];
    if(d)return {source,target:d[0],unit:d[1],transform:source==='RunSeconds'?'seconds_to_minutes':'identity',definition:d[2],evidence:'Synthetic source dictionary v1 · '+source,reviewed:false,reason:''};
    if(source==='source_timezone')return {source,target:'excluded',unit:'text',transform:'identity',definition:'Timezone context is already represented by the explicit UTC timestamp.',evidence:'Synthetic source dictionary v1',reviewed:false,reason:'UTC offset is already explicit in every timestamp.'};
    if(source==='Energy_kWh')return {source,target:'excluded',unit:'kWh',transform:'identity',definition:'Energy is outside the three-metric MVP contract.',evidence:'Reporting contract v1 · scope',reviewed:false,reason:'Energy reporting is outside the agreed MVP scope.'};
    return {source,target:'unresolved',unit:'cycles',transform:'identity',definition:'Machine cycles; no verified pieces-per-cycle relationship is supplied.',evidence:'Synthetic source dictionary v1 · CycleCount',reviewed:false,reason:''};
  });}
  function createPlant({id,name,line,product,acquired,owners}){
    return {id,name,line:line||'',product:product||'',acquired:acquired||'',owners:owners||{integration:'',operations:'',steward:''},revision:1,
      readiness:{access:false,owners:false,contract:false},source:null,mappings:[],validation:null,approvals:{steward:null,operations:null},report:null,history:[],
      benchmark:{output:3600,scrap:8,availability:80,period:'',evidence:'',confirmed:false},tasks:[],effort:[]};
  }
  function invalidate(p){p.revision++;p.validation=null;p.approvals={steward:null,operations:null};if(p.benchmark)p.benchmark.confirmed=false;if(p.report){p.history.unshift(p.report);p.report=null;}}
  function loadSource(p,text,name,isSample=false){
    const parsed=parseCSV(text);
    invalidate(p);
    p.source={...parsed,name,received:new Date().toISOString(),isSample};
    p.mappings=isSample?sampleMappings(parsed.headers):newMappings(parsed.headers);
    p.benchmark.confirmed=false;
    return p.source;
  }
  function applyMapping(p,source,values){const m=p.mappings.find(x=>x.source===source);if(!m)throw new Error('Unknown source column.');invalidate(p);Object.assign(m,values);}
  function normalized(p){
    if(!p.source)return [];
    return p.source.rows.map((r,index)=>{
      const n={_row:index+2};
      p.mappings.forEach(m=>{
        if(!FIELDS.some(f=>f.id===m.target))return;
        const kind=FIELDS.find(f=>f.id===m.target).kind;
        const raw=r[m.source];
        if(kind==='count'||kind==='duration'){
          let v=raw!==''&&/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)?Number(raw):NaN;
          if(m.transform==='seconds_to_minutes')v/=60;
          if(m.transform==='hours_to_minutes')v*=60;
          n[m.target]=v;
        } else n[m.target]=raw;
      });return n;
    });
  }
  function validate(p){
    const checks=[],add=(id,title,pass,detail,rows=[])=>checks.push({id,title,pass,detail,rows:rows.slice(0,20)});
    add('source','Source file available',!!p.source,p.source?p.source.rows.length+' source records; all records remain in scope.':'Upload a source export.');
    add('readiness','Access, owners and metric scope confirmed',Object.values(p.readiness).every(Boolean)&&Object.values(p.owners).every(x=>x.trim()),'Confirm authorized file access, named reviewers and the reporting contract in Plant setup.');
    const unresolved=p.mappings.filter(m=>m.target==='unresolved');
    add('resolved','All source columns have an explicit decision',!!p.source&&!unresolved.length,unresolved.length?'Resolve or exclude with a reason: '+unresolved.map(m=>m.source).join(', '):'Every column is mapped or explicitly excluded.');
    const missing=FIELDS.filter(f=>p.mappings.filter(m=>m.target===f.id).length!==1);
    add('required','Required targets are mapped exactly once',!!p.source&&!missing.length,missing.length?'Missing or repeated targets: '+missing.map(f=>f.label).join(', '):'All eleven required targets have one source.');
    const unsupported=p.mappings.filter(m=>m.target!=='excluded'&&m.target!=='unresolved'&&!FIELDS.some(f=>f.id===m.target));
    add('targets','Only contract fields are included',!unsupported.length,unsupported.length?'Unsupported targets: '+unsupported.map(m=>m.target).join(', '):'All included targets are defined in reporting contract v1.');
    const unreviewed=p.mappings.filter(m=>!m.reviewed||(m.target==='excluded'?m.reason.trim().length<10:m.definition.trim().length<10||m.evidence.trim().length<5));
    add('evidence','Field decisions carry reviewed definitions and evidence',!!p.source&&!unreviewed.length,unreviewed.length?'Review documentation or exclusion reasons for '+unreviewed.map(m=>m.source).join(', '):'All field decisions were explicitly reviewed; evidence support remains a human responsibility.');
    const badUnits=p.mappings.filter(m=>{
      const f=FIELDS.find(x=>x.id===m.target);if(!f)return false;
      if(f.kind==='count')return m.unit!=='count'||m.transform!=='identity';
      if(f.kind==='duration')return !({identity:'min',seconds_to_minutes:'s',hours_to_minutes:'h'}[m.transform]===m.unit);
      if(f.kind==='time')return m.unit!=='UTC timestamp'||m.transform!=='identity';
      return m.unit!=='text'||m.transform!=='identity';
    });
    add('units','Units and transformations agree',!!p.source&&!badUnits.length,badUnits.length?'Check units or conversion for '+badUnits.map(m=>m.source).join(', '):'Counts stay counts; duration conversions use an explicit source unit.');
    const records=normalized(p),complete=!missing.length&&!!p.source;
    const rowFailures=predicate=>records.filter(predicate).map(r=>r._row);
    const numBad=rowFailures(r=>FIELDS.filter(f=>['count','duration'].includes(f.kind)).some(f=>!Number.isFinite(r[f.id])||r[f.id]<0||(f.kind==='count'&&!Number.isSafeInteger(r[f.id]))));
    const totalsSafe=FIELDS.filter(f=>['count','duration'].includes(f.kind)).every(f=>{const total=records.reduce((n,r)=>n+r[f.id],0);return f.kind==='count'?Number.isSafeInteger(total):Number.isFinite(total);});
    add('numbers','Counts and durations are valid',complete&&!numBad.length&&totalsSafe,numBad.length?'Non-numeric, negative, fractional or unsafe count values in CSV rows '+numBad.slice(0,8).join(', '):!totalsSafe?'Aggregate totals exceed safe numeric precision. Supply a smaller reporting window.':'Non-negative finite values; count values and totals have safe integer precision.',numBad);
    const countBad=rowFailures(r=>r.good_units+r.scrap_units!==r.total_units);
    add('counts','Good output + scrap reconciles to total',complete&&!countBad.length,countBad.length?'Reconcile output populations in CSV rows '+countBad.slice(0,8).join(', '):'Every row reconciles exactly for the agreed population.',countBad);
    const durBad=rowFailures(r=>!(r.planned_minutes>0)||r.run_minutes>r.planned_minutes);
    add('durations','Running time fits planned production time',complete&&!durBad.length,durBad.length?'Check planned time or conversion in CSV rows '+durBad.slice(0,8).join(', '):'Planned time is positive and running time does not exceed it.',durBad);
    const scopeBad=rowFailures(r=>r.plant_id!==p.id||r.asset_id!==p.line||r.product_family!==p.product||!r.event_id||!r.shift_id);
    add('scope','One plant, line and comparable product population',complete&&!scopeBad.length,scopeBad.length?'Workspace scope does not match CSV rows '+scopeBad.slice(0,8).join(', ')+'. Correct setup or supply a scoped export.':'All records match the configured plant, line and product.',scopeBad);
    const seen=new Set(),duplicate=rowFailures(r=>{const k=JSON.stringify([r.plant_id,r.asset_id,r.event_id]);if(seen.has(k))return true;seen.add(k);return false;});
    add('duplicates','No duplicate record keys',complete&&!duplicate.length,duplicate.length?'Duplicate records in CSV rows '+duplicate.slice(0,8).join(', '):'Plant + line + record ID is unique.',duplicate);
    const seenShifts=new Set(),duplicateShifts=rowFailures(r=>{const k=JSON.stringify([r.plant_id,r.asset_id,r.shift_id,r.product_family]);if(seenShifts.has(k))return true;seenShifts.add(k);return false;});
    add('shift-grain','One record per line, product and shift',complete&&!duplicateShifts.length,duplicateShifts.length?'Repeated shift populations in CSV rows '+duplicateShifts.slice(0,8).join(', ')+'. Supply an aggregated shift export.':'The shift-level reporting grain is unique.',duplicateShifts);
    const timeBad=rowFailures(r=>!validTimestamp(r.timestamp_utc));
    add('timestamps','Timestamps have an explicit timezone',complete&&!timeBad.length,timeBad.length?'Supply ISO timestamps with Z or an offset in CSV rows '+timeBad.slice(0,8).join(', '):'Every record has an explicit timezone.',timeBad);
    return {at:new Date().toISOString(),fingerprint:fingerprint(p),pass:checks.every(c=>c.pass),checks,records:records.length};
  }
  function validTimestamp(value){
    const m=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(Z|([+-])(\d{2}):(\d{2}))$/.exec(value||'');
    if(!m)return false;
    const y=Number(m[1]),mo=Number(m[2]),d=Number(m[3]),hour=Number(m[4]),minute=Number(m[5]),second=Number(m[6]||0);
    const leap=y%4===0&&(y%100!==0||y%400===0),days=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
    const oh=Number(m[9]||0),om=Number(m[10]||0);
    return y>0&&mo>=1&&mo<=12&&d>=1&&d<=days[mo-1]&&hour<24&&minute<60&&second<60&&oh<=14&&om<60&&(oh<14||om===0)&&Number.isFinite(Date.parse(value));
  }
  function calculate(p){
    const rows=normalized(p),sum=k=>rows.reduce((n,r)=>n+r[k],0),total=sum('total_units'),planned=sum('planned_minutes');
    const times=rows.map(r=>new Date(r.timestamp_utc).toISOString()).sort();
    return {total,good:sum('good_units'),scrap:sum('scrap_units'),scrapRate:total?sum('scrap_units')/total*100:null,
      availability:planned?sum('run_minutes')/planned*100:null,runMinutes:sum('run_minutes'),plannedMinutes:planned,
      rows:rows.length,shifts:new Set(rows.map(r=>r.shift_id)).size,from:times[0],to:times.at(-1),
      series:rows.map(r=>({shift:r.shift_id,total:r.total_units,good:r.good_units,scrap:r.scrap_units,availability:r.planned_minutes?r.run_minutes/r.planned_minutes*100:null}))};
  }
  function approve(p,role,person){
    if(!['steward','operations'].includes(role))throw new Error('Choose a reviewer role.');
    const v=validate(p);if(!p.validation?.pass||!v.pass||p.validation.fingerprint!==v.fingerprint)throw new Error('Run passing validation on this exact version first.');
    if(!person?.trim())throw new Error('A named reviewer is required.');
    p.approvals[role]={person,at:new Date().toISOString(),fingerprint:v.fingerprint};return p.approvals[role];
  }
  function publish(p){
    const v=validate(p),fp=fingerprint(p);
    if(!v.pass||!p.validation?.pass||p.validation.fingerprint!==fp||!['steward','operations'].every(r=>p.approvals[r]?.fingerprint===fp))throw new Error('Current validation and both current-version approvals are required.');
    if(p.report?.fingerprint===fp)return p.report;
    p.report={id:uid('report'),at:new Date().toISOString(),fingerprint:fp,revision:p.revision,sourceName:p.source.name,sourceReceived:p.source.received,metrics:calculate(p),approvals:copy(p.approvals),contract:'atlas-shift-reporting-v1',scope:{plant:p.id,line:p.line,product:p.product}};
    return p.report;
  }
  function deviations(p){
    if(!p.report||!p.benchmark.confirmed||p.benchmark.reportFingerprint!==p.report.fingerprint||!p.benchmark.evidence||!p.benchmark.period)return [];
    const b=p.benchmark,m=p.report.metrics,out=[];
    if(m.total<b.output)out.push({key:'output',label:'Output below plan',actual:m.total,target:b.output,unit:'units',delta:(m.total-b.output)/b.output*100,description:'Output is below the supplied benchmark for this reporting window. Investigate mix, demand, capacity and data scope before attributing a cause.'});
    if(m.scrapRate!==null&&m.scrapRate>b.scrap)out.push({key:'scrap',label:'Scrap above threshold',actual:m.scrapRate,target:b.scrap,unit:'%',delta:m.scrapRate-b.scrap,description:'The reported scrap rate exceeds the supplied threshold. Review the quality records and confirm the reject definition.'});
    if(m.availability!==null&&m.availability<b.availability)out.push({key:'availability',label:'Availability below plan',actual:m.availability,target:b.availability,unit:'%',delta:m.availability-b.availability,description:'Running time is below the supplied availability benchmark. Inspect downtime and planned-time definitions; this is not a causal diagnosis.'});
    return out;
  }
  function initial(){
    const p=createPlant({id:'SYN-P12',name:'North works',line:'SYN-LINE-A',product:'SYN-Product-A',acquired:'2026-10-02',owners:{integration:'Maya Chen',operations:'Alex Morgan',steward:'Sam Rivera'}});
    loadSource(p,SAMPLE_CSV,'north-works-shift-export.csv',true);
    p.tasks=[{id:'access',label:'Confirm authorized export access',owner:'Maya Chen',done:false},{id:'owners',label:'Confirm local and group reviewers',owner:'Alex Morgan',done:false},{id:'contract',label:'Agree output, scrap and availability definitions',owner:'Sam Rivera',done:false}];
    const q=createPlant({id:'SYN-P08',name:'Riverside works',line:'SYN-LINE-A',product:'SYN-Product-A',acquired:'2026-08-01',owners:{integration:'Jordan Lee',operations:'Taylor Reed',steward:'Sam Rivera'}});
    loadSource(q,SAMPLE_CSV.replaceAll('SYN-P12','SYN-P08'),'riverside-shift-export.csv',true);
    q.readiness={access:true,owners:true,contract:true};q.mappings.forEach(m=>{if(m.target==='unresolved'){m.target='excluded';m.reason='Cycle count is not required; independently defined TotalQty supplies output.';}m.reviewed=true;});
    q.validation=validate(q);approve(q,'steward',q.owners.steward);approve(q,'operations',q.owners.operations);publish(q);
    q.benchmark={output:3600,scrap:8,availability:80,period:'Three sample shifts, 20–21 Oct 2026',evidence:'Synthetic acquisition operating plan v1 · same line and product',confirmed:true,reportFingerprint:q.report.fingerprint};
    const r=createPlant({id:'SYN-P13',name:'East assembly',line:'SYN-LINE-B',product:'SYN-Product-B',acquired:'2026-10-22',owners:{integration:'Maya Chen',operations:'',steward:'Sam Rivera'}});
    return {version:VERSION,selected:p.id,view:'overview',role:'Integration lead',plants:[p,q,r],investigations:[],activity:[{id:uid(),at:new Date().toISOString(),plant:p.id,actor:'Demo setup',action:'Sample workspace created',detail:'All plants, people, records and benchmarks are synthetic.'}]};
  }
  const api={VERSION,FIELDS,SAMPLE_CSV,SAMPLE_DEFS,copy,uid,fingerprint,parseCSV,newMappings,sampleMappings,createPlant,invalidate,loadSource,applyMapping,normalized,validate,calculate,approve,publish,deviations,initial};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.AtlasCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
