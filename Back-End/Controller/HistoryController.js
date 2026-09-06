const History = require('../Models/HistorySchema');
const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const Apifeatures = require('../Utils/ApiFeatures');
const CustomError = require('../Utils/CustomError');

// ==========================================
// DISPLAY - Ipakita ang lahat ng history records
// ==========================================
exports.displayHistory = AsyncErrorHandler(async (req, res) => {
    const features = new Apifeatures(History.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const histories = await features.query;

    res.status(200).json({
        status: 'success',
        totalHistories: histories.length,
        data: histories
    });
});

// ==========================================
// DISPLAY ONE - Ipakita ang isang history record
// ==========================================
exports.displayOneHistory = AsyncErrorHandler(async (req, res, next) => {
    const history = await History.findById(req.params.id);

    if (!history) {
        const error = new CustomError('History record not found', 404);
        return next(error);
    }

    res.status(200).json({
        status: 'success',
        data: history
    });
});

// ==========================================
// UPDATE - I-update ang isang history record
// ==========================================
exports.updateHistory = AsyncErrorHandler(async (req, res, next) => {
    const updatedHistory = await History.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!updatedHistory) {
        const error = new CustomError('History record not found', 404);
        return next(error);
    }

    res.status(200).json({
        status: 'success',
        data: updatedHistory
    });
});

// ==========================================
// DELETE - Burahin ang isang history record
// ==========================================
exports.deleteHistory = AsyncErrorHandler(async (req, res, next) => {
    const deletedHistory = await History.findByIdAndDelete(req.params.id);

    if (!deletedHistory) {
        const error = new CustomError('History record not found', 404);
        return next(error);
    }

    res.status(200).json({
        status: 'success',
        data: null
    });
});