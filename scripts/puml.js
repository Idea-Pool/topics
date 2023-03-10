const fs = require('fs');
const { default: fetch } = require('node-fetch');

const BASE = 'docs/uml/';

async function convertPuml(file, format) {
  const out = file.replace('.puml', '.' + format);
  const puml = fs.readFileSync(BASE + file, 'utf-8');
  const response = await fetch(
    'http://www.plantuml.com/plantuml/' + format + '/~h' + Buffer.from(puml, 'utf-8').toString('hex')
  );
  response.body.pipe(fs.createWriteStream(BASE + out));
  return BASE + out;
}

const files = fs.readdirSync(BASE).filter(f => /\.puml$/.test(f));
(async () => {
  for (const f of files) {
    console.log('Processing', BASE + f);
    console.log('Added', await convertPuml(f, 'svg'));
    console.log('Added', await convertPuml(f, 'png'));
  }
})();