import { NotFoundException } from "../../common/exceptions/error.exception.js";
import { create, find, findById } from "../../common/repository/index.js";
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

export const getUserConversations = async (user) => {
  const conversations = await find({
    model: ConversationModel,
    filter: { $or: [{ senderId: user._id }, { receiverId: user._id }] },
  });
  return conversations;
}