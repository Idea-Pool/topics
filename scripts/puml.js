const fs = require('fs');
const path = require('path');
const puml = require('node-plantuml');
const {default: fetch} = require('node-fetch');
const {HashStore} = require('./hash_store');

const BASE = 'docs/uml/';

function encodePuml(input) {
    return new Promise((resolve, reject) => {
        puml.encode(input, {
            include: BASE,
        }, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

class PUMLConverter {
    constructor(file, hashStore) {
        this.sourceFile = file;
        this.updated = hashStore.hashFile(file);
    }

    parse() {
        const pumlContent = fs.readFileSync(this.sourceFile, 'utf-8');
        const THEME_RX = /^!theme (\S+) from (\S+)$/gmi;
        return pumlContent.replace(THEME_RX, (_, theme, dir) => {
            const themePath = path.join(BASE, dir, `puml-theme-${theme}.puml`);
            return fs.readFileSync(themePath, 'utf-8');
        });
    }

    static readFiles(directory) {
        return fs.readdirSync(directory)
            .filter(f => /^(?!puml-theme-).*\.pu?ml$/.test(f));
    }

    get png() {
        return this.sourceFile.replace('.puml', '.png');
    }

    get svg() {
        return this.sourceFile.replace('.puml', '.svg');
    }

    async toPNG() {
        return this._convertTo('png');
    }

    async toSVG() {
        return this._convertTo('svg');
    }

    _needToGenerate(type) {
        return process.env.PUML_FORCE_UPDATE || process.argv.includes('--force') || this.updated || !fs.existsSync(this[type])
    }

    async _convertTo(type) {
        if (this._needToGenerate(type)) {
            const gen = await encodePuml(this.parse());
            const response = await fetch(`http://www.plantuml.com/plantuml/${type}/${gen}`);
            response.body.pipe(fs.createWriteStream(this[type]));
            console.log('Added', this[type]);
        } else {
            console.log('Skipping (no change)', this[type]);
        }
    }

    async convert() {
        console.log('Processing', this.sourceFile);
        await this.toPNG();
        await this.toSVG();
    }
}

const files = PUMLConverter.readFiles(BASE);
(async () => {
    const hashStore = new HashStore();
    for (const f of files) {
        const converter = new PUMLConverter(BASE + f, hashStore);
        await converter.convert();
    }
    hashStore.flush();
})();