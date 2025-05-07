import mongoose, { Document } from 'mongoose';

export interface IGroup extends Document {
    name: string;
    description?: string;
    createdBy: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
}

const groupSchema = new mongoose.Schema<IGroup>({
    name: { type: String, required: true },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export default mongoose.model<IGroup>('Group', groupSchema);