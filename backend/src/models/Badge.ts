import mongoose, { Document, Schema } from 'mongoose';

export interface IBadge extends Document {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  title: string;
  description: string;
  issuedAt: Date;
}

const badgeSchema = new Schema<IBadge>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IBadge>('Badge', badgeSchema);
