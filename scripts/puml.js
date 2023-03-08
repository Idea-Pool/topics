const fs = require('fs');
const puml = require('plantuml');

const BASE = 'docs/uml/';

(async () => {
  const files = fs.readdirSync(BASE).filter(f => /\.puml$/.test(f));
  for (const f of files) {
    console.log('Processing', BASE + f);
    const fSvg = f.replace('.puml', '.svg');
    const uml = fs.readFileSync(BASE + f);
    const svg = await puml(uml);
    fs.writeFileSync(BASE + fSvg, svg, 'utf-8');
    console.log('Added', BASE + fSvg);
  }
})();