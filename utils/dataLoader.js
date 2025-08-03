const fs = require('fs');
const path = require('path');

class DataLoader {
    static loadJsonData(filename) {
        try {
            const filePath = path.join(__dirname, '..', 'data', filename);
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error loading JSON data from ${filename}:`, error);
            return null;
        }
    }
}

module.exports = DataLoader;

