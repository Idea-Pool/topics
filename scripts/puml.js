const fs = require('fs');
const { default: fetch } = require('node-fetch');

const BASE = 'docs/uml/';

const files = fs.readdirSync(BASE).filter(f => /\.puml$/.test(f));
(async () => {
  for (const f of files) {
    console.log('Processing', BASE + f);
    const out = f.replace('.puml', '.svg');
    const puml = fs.readFileSync(BASE + f, 'utf-8');
    const response = await fetch('http://www.plantuml.com/plantuml/svg/~h' + Buffer.from(puml, 'utf-8').toString('hex'));
    fs.writeFileSync(BASE + out, await response.text());
    console.log('Added', BASE + out);
  }
})();