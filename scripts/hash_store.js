const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const HASH_STORE_FILE = path.join(__dirname, '..', '.hash.json');

class HashStore {
    constructor() {
        if (fs.existsSync(HASH_STORE_FILE)) {
            this.hashes = JSON.parse(fs.readFileSync(HASH_STORE_FILE, 'utf-8'));
        } else {
            this.hashes = {};
        }
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
            HASH_STORE_FILE,
            JSON.stringify(this.hashes, null, 2),
            'utf-8',
        );
    }
}

module.exports = {HashStore};