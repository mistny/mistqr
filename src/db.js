const mongoose = require('mongoose');
require('mongoose-type-email');

const UserSchema = new mongoose.Schema({
    email: {
        type: [mongoose.SchemaTypes.Email, 'Please enter a valid email address'], 
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    rank: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        required: true
    }
});

const IDSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String
    },
    scans: {
        type: [Date]
    }
});

/*const ArticleSchema = new mongoose.Schema({
    title: {type: String, required: true},
    url: String,
    description: String,
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
});

ArticleSchema.plugin(URLSlugs("title"));*/

mongoose.model('User', UserSchema);
mongoose.model('ID', IDSchema);

const uristring = process.env.MONGODB_URI || 'mongodb://localhost/mistqr';
mongoose.connect(uristring, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Successfully connected to: " + uristring);
    }
});