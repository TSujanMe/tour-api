const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');


exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // this will return newly updated document
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('no doc found with that id', 404));
    }
    console.log(req.body);
    res.status(200).json({
      status: 'Success',
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'Success',
      data: {
        data: doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    console.log(req.params.id);
    const doc = await Model.findOne({ _id: req.params.id });
    if (!doc) {
      return next(new AppError('no doc found with that id', 404));
    }
    await doc.remove();
    res.status(200).json({
      status: 'Success',
      data: {
        res: 'deleted sucessfully',
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query.populate(popOptions);

    const doc = await query;

    // await doc.findOne({_id:req.params.id})
    if (!doc) {
      return next(new AppError('no doc found with that id', 404));
    }
    res.status(201).json({
      status: 'Success',
      data: {
        doc,
      },
    });
  });


exports.getAll = Model=>catchAsync(async (req, res, next) => {
    // to allow for nested get reviewson tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
  
    const doc = await features.query;
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        doc,
      },
    });
  });
  