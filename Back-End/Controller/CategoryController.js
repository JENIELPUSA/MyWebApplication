const Apifeatures = require('../Utils/ApiFeatures');
const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const CustomError = require('../Utils/CustomError');
const category = require('./../Models/category');

// ============================================
// CREATE CATEGORY
// ============================================
exports.createcategory = AsyncErrorHandler(async (req, res, next) => {
    try {
        console.log("📥 req.body:", req.body);
        console.log("📥 Content-Type:", req.headers['content-type']);

        // Validate na may laman ang req.body
        if (!req.body || Object.keys(req.body).length === 0) {
            return next(
                new CustomError(
                    'Request body is empty. Please provide category data.',
                    400
                )
            );
        }

        // Validate na may CategoryName
        if (!req.body.CategoryName || !req.body.CategoryName.trim()) {
            return next(
                new CustomError('CategoryName is required.', 400)
            );
        }

        const addCategory = await category.create(req.body);

        res.status(201).json({
            status: 'success',
            data: addCategory
        });
    } catch (error) {
        console.error('❌ Error in createCategory:', error);

        // Duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return next(
                new CustomError(
                    `Duplicate value for field "${field}". Please use another value.`,
                    400
                )
            );
        }

        // Mongoose validation error
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(el => el.message);
            return next(
                new CustomError(
                    `Invalid input data. ${messages.join('. ')}`,
                    400
                )
            );
        }

        // Cast error
        if (error.name === 'CastError') {
            return next(
                new CustomError(
                    `Invalid value for ${error.path}: ${error.value}`,
                    400
                )
            );
        }

        // Fallback
        return next(
            new CustomError(
                error.message || 'Failed to create category.',
                500
            )
        );
    }
});

// ============================================
// GET ALL CATEGORIES
// ============================================
exports.displayCategory = AsyncErrorHandler(async (req, res, next) => {
    try {
        //  STEP 1: Kunin ang total count (BEFORE pagination)
        const totalCount = await category.countDocuments();

        //  STEP 2: Apply features (filter, sort, limit, paginate)
        const features = new Apifeatures(category.find(), req.query)

        const displayCategories = await features.query;

        //  STEP 3: Compute pagination info
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 100;
        const totalPages = Math.ceil(totalCount / limit);

        console.log("📊 Total in DB:", totalCount);
        console.log("📊 Returned in this page:", displayCategories.length);
        console.log("📊 Page:", page, "of", totalPages);

        res.status(200).json({
            status: 'success',
            totalCategory: totalCount,        //  Total sa DB
            results: displayCategories.length, //  Bilang sa current page
            totalPages,                       //  Total pages
            currentPage: page,                //  Current page
            data: displayCategories
        });
    } catch (error) {
        console.error('❌ Error in displayCategory:', error);
        return next(
            new CustomError(error.message || 'Failed to fetch categories.', 500)
        );
    }
});


// ============================================
// UPDATE CATEGORY
// ============================================
exports.UpdateCategory = AsyncErrorHandler(async (req, res, next) => {
    try {
        const updateCategory = await category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updateCategory) {
            return next(
                new CustomError('Category with the ID is not found', 404)
            );
        }

        res.status(200).json({
            status: 'success',
            data: updateCategory
        });
    } catch (error) {
        console.error('❌ Error in UpdateCategory:', error);

        if (error.name === 'CastError') {
            return next(
                new CustomError(`Invalid category ID: ${error.value}`, 400)
            );
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(el => el.message);
            return next(
                new CustomError(`Invalid input data. ${messages.join('. ')}`, 400)
            );
        }

        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return next(
                new CustomError(`Duplicate value for field "${field}".`, 400)
            );
        }

        return next(
            new CustomError(error.message || 'Failed to update category.', 500)
        );
    }
});

// ============================================
// DELETE CATEGORY
// ============================================
exports.deleteCategory = AsyncErrorHandler(async (req, res, next) => {
    try {
        const deleteCategory = await category.findByIdAndDelete(req.params.id);

        if (!deleteCategory) {
            return next(
                new CustomError('Category with the ID is not found', 404)
            );
        }

        res.status(200).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        console.error('❌ Error in deleteCategory:', error);

        if (error.name === 'CastError') {
            return next(
                new CustomError(`Invalid category ID: ${error.value}`, 400)
            );
        }

        return next(
            new CustomError(error.message || 'Failed to delete category.', 500)
        );
    }
});