const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const CustomError = require('../Utils/CustomError');
const Lab = require('../Models/Laboratory');
const Apifeatures = require('./../Utils/ApiFeatures');
const mongoose = require('mongoose');




exports.createLaboratory = AsyncErrorHandler(async (req, res, next) => {
    // Create new laboratory
    const newLab = await Lab.create(req.body);

    const newLaboratory = await Lab.aggregate([
        {
                $match: { _id: newLab._id } // Match only the filtered Lab
            
          },
        {
            $lookup:{
                from:"users",
                localField:"Encharge",
                foreignField:"_id",
                as:"EnchargeInfo"
            }
        },
        {
            $unwind:{
                path:"$EnchargeInfo"
            }
        },
        {
            $lookup:{
                from: 'departments', // The department collection
                localField: 'department', // Field in encharge collection
                foreignField: '_id', // Field in departments collection
                as: 'DepartmentInfo' // The alias to store the joined data
            }
        },
        {
            $unwind:{
                path:"$DepartmentInfo",
                
            }
        },
        {
          $project:{
            id:1,
            RefNo:1,
            LaboratoryName:1,
            EnchargeName: {
                $concat: [
                    '$EnchargeInfo.FirstName', 
                    ' ',  // Space between names
                    { $ifNull: ['$EnchargeInfo.Middle', ''] }, 
                    ' ',  // Space before Last Name
                    '$EnchargeInfo.LastName'
                ]
            },
            department: { $ifNull: ['$DepartmentInfo.DepartmentName', ''] }
            
          }
            
        }

    ])
    res.status(200).json({
        status:'success',
        totalLaboratory:newLaboratory.length,
        data:newLaboratory[0]
     });
});



exports.DisplayLaboratory = AsyncErrorHandler(async (req, res) => {
    const features = new Apifeatures(Lab.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
  
    const filteredLab = await features.query;
  
    const laboratory = await Lab.aggregate([
      {
        $match: {
          _id: { $in: filteredLab.map((lab) => lab._id) }, // Match only the filtered labs
        },
      },
      {
        $lookup: {
          from: "users",//collection
          localField: "Encharge",//gi declare na foreignkey sa model or ang match
          foreignField: "_id",
          as: "EnchargeInfo",
        },
      },
      {
        $unwind: {
          path: "$EnchargeInfo",
          preserveNullAndEmptyArrays: true, // Prevents dropping documents without a match
        },
      },
      {
        $lookup: {
          from: "departments", // The department collection
          localField: "department", // Field in the laboratory collection
          foreignField: "_id", // Field in departments collection
          as: "DepartmentInfo", // The alias to store the joined data
        },
      },
      {
        $unwind: {
          path: "$DepartmentInfo",
          preserveNullAndEmptyArrays: true, // Prevents dropping documents without a match
        },
      },
      {
        $project: {
          id: 1,
          RefNo: 1,
          LaboratoryName: 1,
          EnchargeName: {
            $trim: {
              input: {
                $concat: [
                  { $ifNull: ["$EnchargeInfo.FirstName", "N/A"] },
                  " ", // Space between names
                  { $ifNull: ["$EnchargeInfo.Middle", ""] },
                  " ", // Space before Last Name
                  { $ifNull: ["$EnchargeInfo.LastName", ""] },
                ],
              },
            },
          },
          EnchargeId: '$EnchargeInfo._id',
          department: { $ifNull: ["$DepartmentInfo.DepartmentName", "N/A"] },
          DepartmentId: '$DepartmentInfo._id', // Include the Category ID from the joined data
          _id: 1
        },
      },
    ]);
  
    res.status(200).json({
      status: "success",
      totalLaboratory: laboratory.length,
      data: laboratory,
    });
  });
  

exports.deleteLaboratory = AsyncErrorHandler(async(req,res,next)=>{
    await Lab.findByIdAndDelete(req.params.id)

    res.status(200).json({
        status:'success',
        data:null
     });
  })


  exports.UpdateLab = AsyncErrorHandler(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ status: 'fail', message: 'Invalid ID format' });
    }

    // Update the laboratory
    const updatelab = await Lab.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!updatelab) {
        return res.status(404).json({
            status: 'fail',
            message: 'Laboratory not found'
        });
    }

    // Fetch updated laboratory with populated data
    const toolWithLaboratory = await Lab.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(req.params.id) }
        },
        {
            $lookup: {
                from: "users",
                localField: "Encharge",
                foreignField: "_id",
                as: "EnchargeInfo"
            }
        },
        { $unwind: { path: "$EnchargeInfo" } },
        {
            $lookup: {
                from: 'departments',
                localField: 'department',
                foreignField: '_id',
                as: 'DepartmentInfo'
            }
        },
        { $unwind: { path: "$DepartmentInfo" } },
        {
            $project: {
                id: 1,
                RefNo: 1,
                LaboratoryName: 1,
                EnchargeName: {
                    $concat: [
                        '$EnchargeInfo.FirstName',
                        ' ',
                        { $ifNull: ['$EnchargeInfo.Middle', ''] },
                        ' ',
                        '$EnchargeInfo.LastName'
                    ]
                },
                department: { $ifNull: ['$DepartmentInfo.DepartmentName', 'N/A'] }
            }
        }
    ]);

    if (!toolWithLaboratory.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Laboratory not found after update.'
        });
    }

    res.status(200).json({
        status: 'success',
        totalLaboratory: toolWithLaboratory.length,
        data: toolWithLaboratory[0]
    });
});

