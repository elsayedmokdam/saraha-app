import {
  IdentityRequestStatusEnum,
  MessageTypeEnum,
} from "../../common/enum/index.js";
import {
  ConflictException,
  NotFoundException,
} from "../../common/exceptions/index.js";
import {
  findById,
  create,
  find,
  deleteOne,
  findOne,
  findOneAndUpdate,
  aggregate,
} from "../../common/repository/index.js";
import { decryption } from "../../common/security/encryption.security.js";
import { toObjectId } from "../../common/utils/index.js";
import {
  ConversationModel,
  IdentityRequestModel,
  MessageModel,
  UserModel,
} from "../../DB/models/index.js";

export const createMessage = async (
  { content, receiverId } = {},
  files = [],
  user,
) => {
  const checkReceiverExist = await findById({
    model: UserModel,
    id: receiverId,
  });

  if (!checkReceiverExist) {
    throw NotFoundException({ message: "Invalid Receiver Id" });
  }

  const message = await create({
    model: MessageModel,
    data: [
      {
        content,
        receiverId,
        attachment: files.map((file) => file.path),
        senderId: user?._id,
      },
    ],
  });
  return message;
};

export const getAllMessages = async (
  { type = MessageTypeEnum.BOTH, page = 1, limit = 10, search = "" } = {},
  user,
) => {
  let filter = {
    // Get The Content that Match The Search Using Regex and it is not case sensitive
    content: { $regex: search, $options: "i" },
    ...(type === MessageTypeEnum.SENDER && { senderId: user._id }),
    ...(type === MessageTypeEnum.RECEIVER && { receiverId: user._id }),
    ...(type === MessageTypeEnum.BOTH && {
      $or: [{ senderId: user._id }, { receiverId: user._id }],
    }),
  };

  const messages = await find({
    model: MessageModel,
    filter,
    options: {
      page,
      limit,
      sort: { createdAt: -1 },
    },
  });
  return messages;
};

export const deleteMessage = async ({ messageId }, user) => {
  const message = await deleteOne({
    model: MessageModel,
    filter: { _id: messageId, receiverId: user._id },
  });

  if (message.deletedCount === 0)
    throw NotFoundException({ message: "Message Not Found" });
  return message;
};

export const createIdentityRequest = async ({ messageId }, user) => {
  const message = await findOne({
    model: MessageModel,
    filter: { _id: messageId, receiverId: user._id },
  });

  if (!message) throw NotFoundException({ message: "Message Not Found" });

  const request = await findOne({
    model: IdentityRequestModel,
    filter: { messageId: message._id },
  });

  if (request) throw ConflictException({ message: "Request Already Sent" });

  const identityRequest = await create({
    model: IdentityRequestModel,
    data: [
      {
        messageId: message._id,
        senderId: user._id, // User That Send The Request
        receiverId: message.senderId, // User That Receive The Request (The One That Sent The Message)
      },
    ],
  });

  return identityRequest;
};

export const respondToIdentityRequest = async ({ requestId, status }, user) => {
  const request = await findOne({
    model: IdentityRequestModel,
    filter: { _id: requestId, receiverId: user._id },
  });

  if (!request) throw NotFoundException({ message: "Request Not Found" });

  if (
    request.status === IdentityRequestStatusEnum.REJECTED ||
    request.status === IdentityRequestStatusEnum.ACCEPTED
  )
    throw ConflictException({ message: `Request Already ${request.status}` });

  const updatedRequest = await findOneAndUpdate({
    model: IdentityRequestModel,
    filter: { _id: requestId },
    update: { status },
  });

  // Create Conversation
  if (updatedRequest.status === IdentityRequestStatusEnum.ACCEPTED) {
    const conversation = await create({
      model: ConversationModel,
      data: [
        {
          identifyRequestId: updatedRequest._id,
          messageId: updatedRequest.messageId,
          senderId: updatedRequest.senderId,
          receiverId: updatedRequest.receiverId,
        },
      ],
    });

    // Update The Message To Not Be Anonymous
    await findOneAndUpdate({
      model: MessageModel,
      filter: { _id: updatedRequest.messageId },
      update: { isAnonymous: false },
    });

    return {
      request: updatedRequest,
      conversation,
    };
  }

  return {
    request: updatedRequest,
  };
};

export const getIdentityRequests = async ({ page = 1, limit = 10 }, user) => {
  let requests = await aggregate({
    model: IdentityRequestModel,
    pipeline: [
      {
        $match: {
          receiverId: toObjectId(user._id),
        },
      },
      {
        $sort: {
          createdAt: -1,
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
        $lookup: {
          from: "users",
          localField: "receiverId",
          foreignField: "_id",
          as: "receiver",
        },
      },
    ],
    page,
    limit,
    project: {
      senderId: 0,
      "message.senderId": 0,
      "message.receiverId": 0,
      "receiver.password": 0,
      "receiver.confirmPassword": 0,
      "receiver.confirmEmail": 0,
      "receiver.role": 0,
    },
  });

  // Hanlde Decryption of The Phone
  const handled = await Promise.all(
    requests.data.map(async (request) => {
      const phone = await decryption(request.receiver[0].phone);
      return {
        ...request,
        receiver: {
          ...request.receiver[0],
          phone,
        },
      };
    }),
  );

  requests = {
    ...requests,
    data: handled,
  };

  return requests;
};
