import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
let html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'dist/styles.css'),'utf8');
const core=fs.readFileSync(path.join(root,'dist/core.js'),'utf8');
const app=fs.readFileSync(path.join(root,'dist/app.js'),'utf8');
html=html.replace('<link rel="stylesheet" href="styles.css">',`<style>\n${css}\n</style>`)
  .replace('<script defer src="core.js"></script>','')
  .replace('<script defer src="app.js"></script>','')
  .replace('</body>',`<script>\n${core}\n${app}\n</script></body>`);
const out=path.join(root,'artifacts');
fs.mkdirSync(out,{recursive:true});
const legacy=path.join(out,'Atlas-Onboard-prototype.html');
const backup=path.join(out,'Atlas-Onboard-prototype-v1.html');
if(fs.existsSync(legacy)&&!fs.existsSync(backup))fs.copyFileSync(legacy,backup);
for(const name of ['Atlas-Onboard-MVP.html','Atlas-Onboard-prototype.html'])fs.writeFileSync(path.join(out,name),html);
console.log(JSON.stringify({standalone:path.join(out,'Atlas-Onboard-MVP.html'),bytes:Buffer.byteLength(html),networkDependencies:0}));
