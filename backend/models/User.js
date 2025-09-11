import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now } // Thêm trường updatedAt
});

// Mã hóa password trước khi lưu
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Cập nhật updatedAt trước khi save hoặc update
userSchema.pre('save', function (next) {
    this.updatedAt = Date.now(); // Cập nhật thời gian mỗi khi save
    next();
});

userSchema.pre('findOneAndUpdate', async function (next) {
    this.set({ updatedAt: Date.now() }); // Cập nhật khi dùng findOneAndUpdate
    next();
});

// So sánh password khi đăng nhập
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;