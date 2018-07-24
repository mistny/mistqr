const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');

const UserSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    email: {type: String, unique: true, required: true},
    password: {type: String, unique: true, required: true},
});

const ArticleSchema = new mongoose.Schema({
    title: {type: String, required: true},
    url: String,
    description: String,
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
});

ArticleSchema.plugin(URLSlugs("title"));

mongoose.model('User', UserSchema);
mongoose.model('Article', ArticleSchema);

mongoose.connect('mongodb://localhost/hw06');
