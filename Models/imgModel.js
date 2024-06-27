const mongoose = require('mongoose');

const imgModelSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true 
    },
    uploadDate: {
        type: Date,
        default: Date.now 
    }
});

const imgModel = mongoose.model('adminimg', imgModelSchema);

module.exports = imgModel;
