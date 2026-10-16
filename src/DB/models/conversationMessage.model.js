import mongoose from "mongoose";

// Messages Exchanged Between Users (Sender and Receiver)
const conversationMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversations",
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    content: {
      type: String,
      required: true,
      minLength: [3, "Content must be at least 3 characters."],
      maxLength: [50000, "Content must be at most 50000 characters."],
    },

    attachment: [String],
  },
  {
    collection: "conversationMessages",
    timestamps: true,
    autoIndex: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Create Indexes For senderId (Ascending) and createdAt (Descending)
conversationMessageSchema.index({ conversationId: 1, createdAt: -1 });

export const ConversationMessageModel =
  mongoose.models.conversationMessages ||
  mongoose.model("conversationMessages", conversationMessageSchema);
