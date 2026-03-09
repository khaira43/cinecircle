import mongoose, { Schema, Document } from "mongoose";

export interface IMedia extends Document {
  title: string;
  type: "movie" | "show";
  genre?: string;
  synopsis?: string;
  releaseYear?: number;
  posterUrl?: string;
}

const MediaSchema = new Schema<IMedia>({
  title: { type: String, required: true },
  type: { type: String, enum: ["movie", "show"], required: true },
  genre: { type: String },
  synopsis: { type: String },
  releaseYear: { type: Number },
  posterUrl: { type: String },
});

const Media = mongoose.model<IMedia>("Media", MediaSchema);

export default Media;