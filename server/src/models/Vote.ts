// server/src/models/Vote.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
  userId: mongoose.Types.ObjectId;
  reviewId: mongoose.Types.ObjectId;
  value: 1 | -1;
}

const VoteSchema = new Schema<IVote>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
    },
    value: {
      type: Number,
      enum: [1, -1],   // upvote or downvote, nothing else
      required: true,
    },
  },
  { timestamps: true }
);

// Enforce one vote per user per review at the database level
VoteSchema.index({ userId: 1, reviewId: 1 }, { unique: true });

export default mongoose.model<IVote>('Vote', VoteSchema);