const Problem = require('../Models/ProblemEquipmet');
const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const Apifeatures = require('../Utils/ApiFeatures');
const CustomError = require('../Utils/CustomError');

// CREATE - Gumawa ng bagong problema
exports.createProblem = AsyncErrorHandler(async (req, res) => {
    const problem = await Problem.create(req.body);
    res.status(201).json({
        status: 'success',
        data: problem
    });
});

// DISPLAY - Ipakita ang lahat ng problema
exports.displayProblem = AsyncErrorHandler(async (req, res) => {
    const features = new Apifeatures(Problem.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const problems = await features.query;

    res.status(200).json({
        status: 'success',
        totalProblems: problems.length,
        data: problems
    });
});

// UPDATE - I-update ang isang problema
exports.updateProblem = AsyncErrorHandler(async (req, res, next) => {
    const updatedProblem = await Problem.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!updatedProblem) {
        const error = new CustomError('Problem with the ID is not found', 404);
        return next(error);
    }

    res.status(200).json({
        status: 'success',
        data: updatedProblem
    });
});

// DELETE - Burahin ang isang problema
exports.deleteProblem = AsyncErrorHandler(async (req, res, next) => {
    const deletedProblem = await Problem.findByIdAndDelete(req.params.id);

    if (!deletedProblem) {
        const error = new CustomError('Problem with the ID is not found', 404);
        return next(error);
    }

    res.status(200).json({
        status: 'success',
        data: null
    });
});