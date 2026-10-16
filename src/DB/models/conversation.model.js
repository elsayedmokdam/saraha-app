import mongoose from "mongoose";

// The Conversation That Connect Between The Two Users After Accepting The Identity Request
const conversationSchema = new mongoose.Schema(
  {
    identifyRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "identityRequests",
      required: true,
      unique: true,
    },

    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "messages",
      required: true,
      unique: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  {
    collection: "conversations",
    timestamps: true,
    autoIndex: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Create Indexes for senderId and receiverId Accending
conversationSchema.index({ senderId: 1, receiverId: 1 });

export const ConversationModel =
  mongoose.models.conversations ||
  mongoose.model("conversations", conversationSchema);
