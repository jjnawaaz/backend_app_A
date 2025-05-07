import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    password: string;
    isVerified: boolean;
    verificationToken?: string;
    groups: mongoose.Types.ObjectId[];
    createdAt: Date; 
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    country: { type: String, required: true },
    password: { type: String, required: true, select: false },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }]
}, { timestamps: true });

// Password hashing middleware
userSchema.pre<IUser>('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword: string) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);