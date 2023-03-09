const fs = require('fs');
const { default: fetch } = require('node-fetch');

const BASE = 'docs/uml/';
const IMAGE = 'svg';

const files = fs.readdirSync(BASE).filter(f => /\.puml$/.test(f));
(async () => {
  for (const f of files) {
    console.log('Processing', BASE + f);
    const out = f.replace('.puml', '.' + IMAGE);
    const puml = fs.readFileSync(BASE + f, 'utf-8');
    const response = await fetch('http://www.plantuml.com/plantuml/' + IMAGE + '/~h' + Buffer.from(puml, 'utf-8').toString('hex'));
    response.body.pipe(fs.createWriteStream(BASE + out));
    console.log('Added', BASE + out);
  }
})();