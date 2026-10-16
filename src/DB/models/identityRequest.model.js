import mongoose from "mongoose";
import { IdentityRequestStatusEnum } from "../../common/enum/index.js";

const identityRequestSchema = new mongoose.Schema(
  {
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

    status: {
      type: String,
      enum: Object.values(IdentityRequestStatusEnum),
      default: IdentityRequestStatusEnum.PENDING,
      required: true,
    },

    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversations",
    },
  },
  {
    collection: "identityRequests",
    timestamps: true,
    autoIndex: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Create Indexes for senderId Accending and createdAt Descending
identityRequestSchema.index({ senderId: 1, createdAt: -1 });

export const IdentityRequestModel =
  mongoose.models.identityRequests ||
  mongoose.model("identityRequests", identityRequestSchema);
