import { NotFoundException } from "../../common/exceptions/error.exception.js";
import {
  aggregate,
  create,
  find,
  findById,
} from "../../common/repository/index.js";
import { decryption } from "../../common/security/index.js";
import { toObjectId } from "../../common/utils/index.js";
import {
  ConversationMessageModel,
  ConversationModel,
} from "../../DB/models/index.js";

export const createConversationMessage = async (
  { conversationId, content } = {},
  files = [],
  user,
) => {
  const conversation = await findById({
    model: ConversationModel,
    id: conversationId,
  });

  if (!conversation)
    throw NotFoundException({ message: "Conversation Not Found" });

  const conversationMessage = await create({
    model: ConversationMessageModel,
    data: [
      {
        conversationId: conversation._id,
        senderId: user._id,
        content,
        attachment: files.map((file) => file.path),
      },
    ],
  });
  return conversationMessage;
};

export const getAllConversationMessages = async ({
  conversationId,
  page = 1,
  limit = 10,
  search = "",
} = {}) => {
  const conversation = await findById({
    model: ConversationModel,
    id: conversationId,
  });
  if (!conversation)
    throw NotFoundException({ message: "Conversation Not Found" });

  const conversationMessages = await find({
    model: ConversationMessageModel,
    filter: {
      conversationId: conversation._id,
      content: { $regex: search, $options: "i" },
    },
    options: {
      page,
      limit,
      sort: { createdAt: -1 },
    },
  });
  return conversationMessages;
};

export const getUserConversations = async (
  { page = 1, limit = 10, search = "" },
  user,
) => {
  let conversations = await aggregate({
    model: ConversationModel,
    pipeline: [
      {
        $match: {
          $or: [
            { senderId: toObjectId(user._id) },
            { receiverId: toObjectId(user._id) },
          ],
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "senderId",
          foreignField: "_id",
          as: "sender",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "receiverId",
          foreignField: "_id",
          as: "receiver",
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "messageId",
          foreignField: "_id",
          as: "message",
        },
      },
      {
        $unwind: "$sender",
      },
      {
        $unwind: "$receiver",
      },
      {
        $unwind: "$message",
      },
      {
        $addFields: {
          "sender.fullName": {
            $concat: [
              { $ifNull: ["$sender.firstName", ""] },
              " ",
              { $ifNull: ["$sender.lastName", ""] },
            ],
          },
          "receiver.fullName": {
            $concat: [
              { $ifNull: ["$receiver.firstName", ""] },
              " ",
              { $ifNull: ["$receiver.lastName", ""] },
            ],
          },
        },
      },
      {
        $match: {
          $or: [
            { "sender.fullName": { $regex: search, $options: "i" } },
            { "receiver.fullName": { $regex: search, $options: "i" } },
            { "sender.email": { $regex: search, $options: "i" } },
            { "receiver.email": { $regex: search, $options: "i" } },
          ],
        },
      },
    ],
    page,
    limit,
    project: {
      senderId: 0,
      "sender.password": 0,
      "sender.confirmPassword": 0,
      "sender.confirmEmail": 0,
      "sender.role": 0,
      "receiver.password": 0,
      "receiver.confirmPassword": 0,
      "receiver.confirmEmail": 0,
      "receiver.role": 0,
    },
  });

  // Hanlde Decryption of The Phone
  const handled = await Promise.all(
    conversations.data.map(async (conversation) => {
      const [senderPhone, receiverPhone] = await Promise.all([
        conversation.sender.phone
          ? decryption(conversation.sender.phone)
          : undefined,
        conversation.receiver.phone
          ? decryption(conversation.receiver.phone)
          : undefined,
      ]);
      return {
        ...conversation,
        sender: conversation.sender
          ? {
              ...conversation.sender,
              phone: senderPhone,
            }
          : null,
        receiver: conversation.receiver
          ? {
              ...conversation.receiver,
              phone: receiverPhone,
            }
          : null,
      };
    }),
  );

  conversations = {
    ...conversations,
    data: handled,
  };

  return conversations;
};
