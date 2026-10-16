export const create = async ({ model, data = [], options = {} } = {}) => {
  const result = await model.create(data, options);
  return result;
};

export const find = async ({
  model,
  filter = {},
  select = "",
  options = {},
} = {}) => {
  let { page = 1, limit = 10, sort, populate, lean = false } = options;
  page = Math.ceil(page < 1 ? 1 : page);
  limit = Math.ceil(limit < 1 ? 1 : limit);
  const skip = (page - 1) * limit;

  let doc = model.find(filter).select(select).skip(skip).limit(limit);

  if (sort) {
    doc = doc.sort(sort);
  }
  if (populate) {
    doc = doc.populate(populate);
  }
  if (lean) {
    doc = doc.lean();
  }

  const [data, total] = await Promise.all([doc, model.countDocuments(filter)]);

  return {
    count: data.length,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const findOne = async ({
  model,
  filter = {},
  select = "",
  options = {},
} = {}) => {
  const { lean = false } = options;
  let doc = model.findOne(filter).select(select);

  if (lean) {
    doc = doc.lean();
  }

  return await doc.exec();
};

export const findById = async ({
  model,
  id,
  select = "",
  options = {},
} = {}) => {
  const result = await model.findById(id, options).select(select);
  return result;
};

export const findOneAndUpdate = async ({
  model,
  filter = {},
  update = {},
  options = {},
} = {}) => {
  const result = await model.findOneAndUpdate(
    filter,
    {
      ...update,
      $inc: {
        __v: 1,
      },
    },
    {
      ...options,
      projection: "-password",
      runValidators: true,
      returnDocument: "after",
      lean: true,
    },
  );
  return result;
};

export const findOneAndReplace = async ({
  model,
  filter = {},
  update = {},
  options = {},
} = {}) => {
  const result = await model.findOneAndReplace(
    filter,
    {
      ...update,
    },
    {
      ...options,
      projection: "-password",
      runValidators: true,
      returnDocument: "after",
    },
  );
  return result;
};

export const findByIdAndUpdate = async ({
  model,
  id,
  update = {},
  options = {},
} = {}) => {
  const result = await model.findByIdAndUpdate(
    id,
    { ...update, $inc: { __v: 1 } },
    {
      ...options,
      projection: "-password",
      runValidators: true,
      returnDocument: "after",
    },
  );
  return result;
};

export const updateMany = async ({
  model,
  filter = {},
  update = {},
  options = {},
} = {}) => {
  const result = await model.updateMany(
    filter,
    {
      ...update,
      $inc: {
        __v: 1,
      },
    },
    {
      ...options,
      projection: "-password",
      runValidators: true,
      returnDocument: "after",
    },
  );
  return result;
};

export const findOneAndDelete = async ({
  model,
  filter = {},
  options = {},
} = {}) => {
  const result = await model.findOneAndDelete(filter, options);
  return result;
};

export const findByIdAndDelete = async ({ model, id, options = {} } = {}) => {
  const result = await model.findByIdAndDelete(id, options);
  return result;
};

export const deleteOne = async ({ model, filter = {}, options = {} } = {}) => {
  const result = await model.deleteOne(filter, options);
  return result;
};

export const deleteMany = async ({ model, filter = {}, options = {} } = {}) => {
  const result = await model.deleteMany(filter, options);
  return result;
};

export const aggregate = async ({
  model,
  pipeline = [],
  page = 1,
  limit = 5,
  project = {},
} = {}) => {
  page = Math.ceil(page < 1 ? 1 : page);
  limit = Math.ceil(limit < 1 ? 1 : limit);
  const skip = (page - 1) * limit;

  const result = await model
    .aggregate(pipeline)
    .skip(skip)
    .limit(limit)
    .project(project);

  const total = await model.countDocuments();
  return {
    count: result.length,
    data: result,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
