// server/src/models/Review.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IRatings {
  story: number;
  acting: number;
  cinematography: number;
}

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  mediaId: mongoose.Types.ObjectId;
  content: string;
  ratings: IRatings;
  voteScore: number;
}

const RatingsSchema = new Schema<IRatings>(
  {
    story: { type: Number, required: true, min: 1, max: 10 },
    acting: { type: Number, required: true, min: 1, max: 10 },
    cinematography: { type: Number, required: true, min: 1, max: 10 },
  },
  { _id: false } // this is a sub-document, it doesn't need its own _id
);

const ReviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',    // tells Mongoose this links to the User collection
      required: true,
    },
    mediaId: {
      type: Schema.Types.ObjectId,
      ref: 'Media',   // links to the Media collection
      required: true,
    },
    content: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 2000,
    },
    ratings: {
      type: RatingsSchema,
      required: true,
    },
    voteScore: {
      type: Number,
      default: 0,  // starts at 0, increments/decrements as votes come in
    },
  },
  { timestamps: true }
);

// Enforce one review per user per media at the database level
ReviewSchema.index({ userId: 1, mediaId: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', ReviewSchema);