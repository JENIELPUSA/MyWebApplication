const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const tools = require('./../Models/Equipment');
const mongoose = require('mongoose');
const Apifeatures = require('./../Utils/ApiFeatures');


exports.createtool = AsyncErrorHandler(async (req, res) => {
    // Optional: validate if an ID field is being passed and is valid (if required)
    if (req.body.Category && !mongoose.Types.ObjectId.isValid(req.body.Category)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid Category ID format'
      });
    }
  
    // Create the new tool
    const newTool = await tools.create(req.body);
  
    // Use aggregation to fetch the newly created tool with joined category details
    const toolWithCategory = await tools.aggregate([
      {
        $match: { _id: newTool._id } // Match the newly created tool by its ID
      },
      {
        $lookup: {
          from: 'categories',         // The collection to join
          localField: 'Category',     // Field in tools that references category ID
          foreignField: '_id',        // Field in categories to join on
          as: 'CategoryData'          // Alias for the joined data
        }
      },
      {
        $unwind: {
          path: '$CategoryData',
          preserveNullAndEmptyArrays: true // Allow null if no matching category
        }
      },
      {
        $project: {
          Brand: 1,
          SerialNumber: 1,
          Specification: 1,
          status: 1,
          CategoryName: {
            $ifNull: ['$CategoryData.CategoryName', 'N/A'] // Use 'N/A' if CategoryName is missing
          },
          CategoryId: '$CategoryData._id', // Include the Category ID from the joined data
          _id: 1
        }
      }
    ]);
  
    // Respond with the tool including category details
    res.status(201).json({
      status: 'success',
      data: toolWithCategory[0] // Send the first item in the aggregation result
    });
    
  });

  exports.Displaytool = AsyncErrorHandler(async (req, res) => {
    // Apply Apifeatures methods on the query
    const features = new Apifeatures(tools.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
  
    // Fetch filtered and paginated data first
    const filteredTools = await features.query;
  
    // Apply aggregation only on the filteredTools
    const Equipment = await tools.aggregate([
      {
        $match: {
          _id: { $in: filteredTools.map((tool) => tool._id) } // Match only the filtered tools
        }
      },
      {
        $lookup: {
          from: 'categories', // The name of the collection to join
          localField: 'Category', // Field in the Equipment collection
          foreignField: '_id', // Field in the Category collection
          as: 'CategoryData' // The field where joined data will be added
        }
      },
      {
        $unwind: { 
          path: '$CategoryData', 
          preserveNullAndEmptyArrays: true // Handle items without associated categories
        }
      },
      {
        $project: {
          Brand: 1,
          SerialNumber: 1,
          Specification: 1,
          status: 1,
          CategoryName: {
            $ifNull: ['$CategoryData.CategoryName', 'N/A'] // Fallback to 'N/A' if CategoryName is missing
          },
          CategoryId: '$CategoryData._id', // Include the category's ID
          _id: 1
        }
      }
    ]);
  
    res.status(200).json({
      status: 'success',
      totalEquipment: Equipment.length,
      data: Equipment
    });
  });
  



exports.Updatetool = AsyncErrorHandler(async (req, res, next) => {
    try {
      // Check if ID is valid
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ status: 'fail', message: 'Invalid ID format' });
      }
      
  
      // Update the tool
      const updateTool = await tools.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
  
      if (!updateTool) {
        return res.status(404).json({
          status: 'fail',
          message: 'Tool not found'
        });
      }
  
      // Use aggregation to retrieve the updated tool with category details
      const toolWithCategory = await tools.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(req.params.id) }  // Ensure `new` is used with ObjectId
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'Category',
            foreignField: '_id',
            as: 'CategoryData'
          }
        },
        {
          $unwind: {
            path: '$CategoryData',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            Brand: 1,
            SerialNumber: 1,
            Specification: 1,
            status: 1,
            CategoryName: { 
              $ifNull: ['$CategoryData.CategoryName', 'N/A']
            },
            CategoryId: '$CategoryData._id',
            _id: 1
          }
        }
      ]);
      
  
      // Return the updated tool data along with category details
      res.status(200).json({
        status: 'Success',
        totalEquipment: toolWithCategory.length,
        data: toolWithCategory[0] // Return the first (and only) result
      });
  
    } catch (error) {
      console.error('Error updating tool:', error.message);
      res.status(500).json({
        status: 'error',
        message: 'An internal server error occurred',
        error: error.message
      });
    }
  });
  

  exports.deletetool = AsyncErrorHandler(async(req,res,next)=>{
    await tools.findByIdAndDelete(req.params.id)

    res.status(200).json({
        status:'success',
        data:null
     });
  })

  exports.Getidequip =AsyncErrorHandler(async (req,res,next) =>{

    const tool = await tools.findById(req.params.id);
    if(!tool){
       const error = new CustomError('User with the ID is not found',404); 
       return next(error);
    }
    res.status(200).json({
       status:'Success',
       data:tool
    }); 
 })
