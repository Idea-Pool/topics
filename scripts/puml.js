const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const {default: fetch} = require('node-fetch');

const BASE = 'docs/uml/';

class HashStore {
    constructor() {
        if (fs.existsSync(this.HASH_STORE_FILE)) {
            this.hashes = JSON.parse(fs.readFileSync(this.HASH_STORE_FILE, 'utf-8'));
        } else {
            this.hashes = {};
        }
    }

    get HASH_STORE_FILE() {
        return path.join(__dirname, '..', '.hash.json');
    }

    hashFile(file) {
        const fileBuffer = fs.readFileSync(file);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        const hex = hashSum.digest('hex');
        if (hex === this.hashes[file]) {
            return false;
        }
        this.hashes[file] = hex;
        return true;
    }

    flush() {
        fs.writeFileSync(
            this.HASH_STORE_FILE,
            JSON.stringify(this.hashes, null, 2),
            'utf-8',
        );
    }
}

class PUMLConverter {
    constructor(file, hashStore) {
        this.sourceFile = file;
        this.updated = hashStore.hashFile(file);
    }

    get png() {
        return this.sourceFile.replace('.puml', '.png');
    }

    get svg() {
        return this.sourceFile.replace('.puml', '.svg');
    }

    get puml() {
        return fs.readFileSync(this.sourceFile, 'utf-8');
    }

    get hex() {
        return Buffer.from(this.puml, 'utf-8').toString('hex');
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
            const response = await fetch(`http://www.plantuml.com/plantuml/${type}/~h${this.hex}`);
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

const files = fs.readdirSync(BASE).filter(f => /\.puml$/.test(f));
(async () => {
    const hashStore = new HashStore();
    for (const f of files) {
        const converter = new PUMLConverter(BASE + f, hashStore);
        await converter.convert();
    }
    hashStore.flush();
})();