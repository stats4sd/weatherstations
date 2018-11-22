const express = require('express');
const bodyParser = require('body-parser');
const port = 7555;
const rw = require('./index');
const d3 = require('d3-dsv');
const multer = require('multer');
const upload = multer({
  dest: 'uploads/' // this saves your file into a directory called "uploads"
});

//*** Stuff below here is only for when we want to run this on a server ***//

function init() {

    const app = express()


    app.use(express.static('public'))


    app.use(bodyParser.json())


    //file uploader
    app.post('/upload', upload.single('customFile'), rw.main);


    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    })
}

exports.init = init;