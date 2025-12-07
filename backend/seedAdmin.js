const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const email = 'admin@docstring.io';
        const password = 'adminpassword';

        // Check if exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('Admin already exists');
        } else {
            user = new User({
                email,
                role: 'admin',
                ipAddress: '127.0.0.1'
            });
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            console.log(`Admin created: ${email} / ${password}`);
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
