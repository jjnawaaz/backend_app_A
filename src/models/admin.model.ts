import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin extends Document {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'superadmin';
    createdAt: Date; 
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const adminSchema = new mongoose.Schema<IAdmin>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' }
}, { timestamps: true });

// Password hashing middleware
adminSchema.pre<IAdmin>('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Method to compare passwords
adminSchema.methods.comparePassword = async function(candidatePassword: string) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IAdmin>('Admin', adminSchema);