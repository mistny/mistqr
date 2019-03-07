'use strict';
const mongoose = require('mongoose');
require('mongoose-type-email');
const URLSlugs = require('mongoose-url-slugs');

const UserSchema = new mongoose.Schema({
    email: {
        type: [mongoose.SchemaTypes.Email, "Please enter a valid email address"], 
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        required: true
    }
});

// Same ID from Umbrella to Umbrella
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
        type: [Date],
        required: true
    }
});

const EventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type:  Date,
        required: true
    },
    scanned: [{
        type: String, /* The ID of each person scanned */
        required: true
    }]
});
EventSchema.plugin(URLSlugs('name'));

const UmbrellaSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	start: {
		type: Date,
		required: true
	},
	end: {
		type: Date,
		required: true
	},
	events: [{
		type: EventSchema,
		required: true
	}]
})
UmbrellaSchema.plugin(URLSlugs('name'));

mongoose.model('User', UserSchema);
mongoose.model('ID', IDSchema);
mongoose.model('Umbrella', UmbrellaSchema);
mongoose.model('Event', EventSchema);

const uristring = process.env.MONGODB_URI || 'mongodb://localhost:27017/mistqr';
mongoose.connect(uristring, { useNewUrlParser: true })
    .then(()=>{console.log('Connected to', uristring)})
    .catch((err)=>{console.log(err)});

module.exports = {
    connection: mongoose.connection
}