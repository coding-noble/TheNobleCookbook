const mongoose = require('../data/database').mongoose;

const oauthProviderSchema = new mongoose.Schema({
    provider: { type: String, required: true },
    providerId: { type: String, required: true }
});

const profileSchema = new mongoose.Schema({
    name: { type: String, default: '' },
    bio: { type: String, default: '' },
    avatarUrl: { type: String, default: '' }
});

const userSchema = new mongoose.Schema({
    email: { type: String, required: false, unique: true },
    oauthProviders: [oauthProviderSchema],
    profile: profileSchema,
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
