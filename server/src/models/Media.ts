// server/src/models/Media.ts
import mongoose, { Schema, Document } from 'mongoose';

export type MediaType = 'movie' | 'tv_show';

export interface IMedia extends Document {
  title: string;
  type: MediaType;
  genre: string[];
  synopsis: string;
  releaseYear: number;
  posterUrl: string;
  director: string;
}

const MediaSchema = new Schema<IMedia>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['movie', 'tv_show'],  // only these two values are valid
      required: true,
    },
    genre: {
      type: [String],  // array of strings e.g. ['Action', 'Thriller']
      required: true,
    },
    synopsis: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    releaseYear: {
      type: Number,
      required: true,
      min: 1888,  // first film ever made
      max: new Date().getFullYear(),
    },
    posterUrl: {
      type: String,
      default: '',
    },
    director: {
      type: String,
      default: 'Unknown',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IMedia>('Media', MediaSchema);