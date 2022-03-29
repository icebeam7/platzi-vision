"use strict";
const helpers = require('./js/helpers.js');

const express = require('express'); // Include ExpressJS
const app = express(); // Create an ExpressJS app

const multer = require('multer');
const path = require('path');

const bodyParser = require('body-parser'); // middleware
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },

    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

const computerVision = require("./js/computervision.js")
const customVision = require("./js/customvision.js")
const face = require("./js/face.js")

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/static/index.html');
});

app.get('/computervision', (req, res) => {
  res.sendFile(__dirname + '/static/computervision.html');
});

app.post('/computervision', (req, res) => {
  let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).single('picture');

  upload(req, res, function(err) {
    if (req.fileValidationError) {
        return res.send(req.fileValidationError);
    }
    else if (!req.file) {
        return res.send('Please select an image to upload');
    }
    else if (err instanceof multer.MulterError) {
        return res.send(err);
    }
    else if (err) {
        return res.send(err);
    }

    computerVision.imageAnalysis(req.file.path)
    .then((visionResult) => {
        res.render(__dirname + "/static/computervision2.html", 
        { 
            visionResult: visionResult
        });
    });
  });
});

app.get('/customvision', (req, res) => {
  res.sendFile(__dirname + '/static/customvision.html');
});

app.post('/customvision', (req, res) => {
    let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).single('picture');
  
    upload(req, res, function(err) {
      if (req.fileValidationError) {
          return res.send(req.fileValidationError);
      }
      else if (!req.file) {
          return res.send('Please select an image to upload');
      }
      else if (err instanceof multer.MulterError) {
          return res.send(err);
      }
      else if (err) {
          return res.send(err);
      }
  
      customVision.imageAnalysis(req.file.path)
      .then((visionResult) => {
          res.render(__dirname + "/static/customvision2.html", 
          { 
              visionResult: visionResult
          });
      });
    });
  });
    
app.get('/face', (req, res) => {
  res.sendFile(__dirname + '/static/face.html');
});

app.post('/face', (req, res) => {
    let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).single('picture');
  
    upload(req, res, function(err) {
      if (req.fileValidationError) {
          return res.send(req.fileValidationError);
      }
      else if (!req.file) {
          return res.send('Please select an image to upload');
      }
      else if (err instanceof multer.MulterError) {
          return res.send(err);
      }
      else if (err) {
          return res.send(err);
      }
  
      face.imageAnalysis(req.file.path)
      .then((faceResult) => {
          res.render(__dirname + "/static/face2.html", 
          { 
              faceResult: faceResult
          });
      });
    });
  });

const port = 3000 // Port we will listen on

// Function to listen on the port
app.listen(port, () => console.log(`This app is listening on port ${port}`));