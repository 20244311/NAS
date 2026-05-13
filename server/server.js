const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 5000;

// Configurations
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const METADATA_FILE = path.join(__dirname, 'metadata.json');

// Initialize local storage
fs.ensureDirSync(UPLOADS_DIR);
if (!fs.existsSync(METADATA_FILE)) {
    fs.writeJsonSync(METADATA_FILE, []);
}

app.use(cors());
app.use(express.json());

// 한글 파일명 깨짐 방지 함수
const decodeFilename = (name) => Buffer.from(name, 'latin1').toString('utf8');

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const utf8Name = decodeFilename(file.originalname);
        cb(null, `${Date.now()}-${utf8Name}`);
    }
});
const upload = multer({ storage });

// Helpers
const getMetadata = () => fs.readJsonSync(METADATA_FILE);
const saveMetadata = (data) => fs.writeJsonSync(METADATA_FILE, data, { spaces: 2 });

// --- Endpoints ---

// Get all files
app.get('/api/files', (req, res) => {
    res.json(getMetadata());
});

// Upload a file
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');

    const metadata = getMetadata();
    const originalName = decodeFilename(req.file.originalname);
    
    const newFile = {
        id: Date.now().toString(),
        name: originalName,
        storedName: req.file.filename,
        size: req.file.size,
        date: new Date().toISOString(),
        mimeType: req.file.mimetype
    };

    metadata.push(newFile);
    saveMetadata(metadata);
    res.status(201).json(newFile);
});

// Download a file
app.get('/api/download/:storedName', (req, res) => {
    const filePath = path.join(UPLOADS_DIR, req.params.storedName);
    if (!fs.existsSync(filePath)) return res.status(404).send('File not found.');

    const metadata = getMetadata();
    const fileInfo = metadata.find(f => f.storedName === req.params.storedName);
    res.download(filePath, fileInfo ? fileInfo.name : req.params.storedName);
});

// Delete a file
app.delete('/api/files/:id', (req, res) => {
    let metadata = getMetadata();
    const index = metadata.findIndex(f => f.id === req.params.id);
    if (index === -1) return res.status(404).send('File not found.');

    const file = metadata[index];
    fs.removeSync(path.join(UPLOADS_DIR, file.storedName));
    metadata.splice(index, 1);
    saveMetadata(metadata);
    res.send('File deleted.');
});

app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
