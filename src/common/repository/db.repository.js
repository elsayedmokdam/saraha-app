export const create = async ({ model, data = [], options = {} } = {}) => {
  const result = await model.create(data, options);
  return result;
};

export const find = async ({
  model,
  query = {},
  select = "",
  options = {},
} = {}) => {
  let { page = 1, limit = 5, sort, populate, lean = false } = options;
  page = Math.ceil(page < 1 ? 1 : page);
  limit = Math.ceil(limit < 1 ? 1 : limit);
  const skip = (page - 1) * limit;

  let doc = model.find(query).select(select).skip(skip).limit(limit);

  if (sort) {
    doc = doc.sort(sort);
  }
  if (populate) {
    doc = doc.populate(populate);
  }
  if (lean) {
    doc = doc.lean();
  }

  const [data, total] = await Promise.all([doc, model.countDocuments(query)]);

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
  query = {},
  select = "",
  options = {},
} = {}) => {
  const { lean = false } = options;
  let doc = model.findOne(query).select(select);

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
  query = {},
  update = {},
  options = {},
} = {}) => {
  const result = await model.findOneAndUpdate(
    query,
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

export const findOneAndReplace = async ({
  model,
  query = {},
  update = {},
  options = {},
} = {}) => {
  const result = await model.findOneAndReplace(
    query,
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
  query = {},
  update = {},
  options = {},
} = {}) => {
  const result = await model.updateMany(
    query,
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
  query = {},
  options = {},
} = {}) => {
  const result = await model.findOneAndDelete(query, options);
  return result;
};

export const findByIdAndDelete = async ({ model, id, options = {} } = {}) => {
  const result = await model.findByIdAndDelete(id, options);
  return result;
};

export const deleteMany = async ({ model, query = {}, options = {} } = {}) => {
  const result = await model.deleteMany(query, options);
  return result;
};

export const aggregate = async ({
  model,
  pipeline = [],
  skip = 0,
  limit = 5,
  project = {},
} = {}) => {
  const result = await model
    .aggregate(pipeline)
    .skip(skip)
    .limit(limit)
    .project(project);
  return result;
};
