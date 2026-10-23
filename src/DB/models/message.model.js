import mongoose from "mongoose";
import { IdentityRequestStatusEnum } from "../../common/enum/index.js";

const MessageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: function () {
        return this.attachment?.length === 0;
      },
      minLength: [3, "Content must be at least 3 characters."],
      maxLength: [50000, "Content must be at most 50000 characters."],
    },

    attachment: [String],

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    isAnonymous: {
      type: Boolean,
      default: true,
    },

    requestStatus: {
      type: String,
      default: IdentityRequestStatusEnum.NOTASKED,
    },
  },
  {
    collection: "messages",
    timestamps: true,
    autoIndex: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const MessageModel =
  mongoose.models.messages || mongoose.model("messages", MessageSchema);
