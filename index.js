const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const UserModel = require('./Models/imgModel');
require('dotenv').config();
const fs = require('fs');


mongoose.set('strictQuery', false);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
const PORT = process.env.PORT;

//MongoDB connection 
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch(error => {
  console.error('Error connecting to MongoDB:', error.message);
});

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads'); // Store uploaded files in ./public/uploads folder
  },
  filename: function (req, file, cb) {
    // Generate a unique name for the uploaded file
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

//Multer Upload Configuration
const upload = multer({ storage: storage });

// Upload endpoint to handle file uploads and title
app.post('/admin/upload', upload.single('image'), (req, res) => {
  const { title } = req.body;
  const image = req.file.filename; // Multer stores uploaded file details in req.file

// Save image and title to MongoDB using Mongoose
  const newImage = new UserModel({
    title: title,
    image: image
  });
//console.log(newImage);

  newImage.save()
    .then(() => {
      res.status(200).json({ message: 'Image uploaded successfully' });
    })
    .catch((err) => {
      console.error('Error uploading image:', err);
      res.status(500).json({ error: 'Failed to upload image' });
    });
});


//Get all images
app.get('/admin/images', async (req, res) => {
    try {
      const images = await UserModel.find();
      res.status(200).json(images);
    } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).json({ error: 'Failed to fetch images' });
    }
  });


// Delete image
app.delete('/admin/images/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const image = await UserModel.findOneAndDelete({ _id: id });
      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }
      const imagePath = path.join(__dirname, './public/uploads', image.image);
      fs.unlinkSync(imagePath);
      res.json({ message: 'Image deleted successfully' });
    } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({ error: 'Failed to delete image' });
    }
  });
  

app.listen(PORT, () => {
  console.log(`Server Running on ${PORT}`);
});
