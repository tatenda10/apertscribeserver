const multer = require('multer');
const path = require('path');

// Set storage engine for multer
const storage = multer.diskStorage({
    destination: 'images',
    filename: (req, file, cb) => {
      // Ensure unique filenames by appending a timestamp
      const uniqueFilename = `${file.fieldname}-${Date.now()}-${file.originalname}`;
      cb(null, uniqueFilename);
    }
  });

// Init Upload
const upload = multer({
    storage: storage,
 })

module.exports = upload;
