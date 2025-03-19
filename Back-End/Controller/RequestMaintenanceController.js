const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const requestmaintenance = require('./../Models/RequestMaintenance');
const Apifeatures = require('./../Utils/ApiFeatures');

exports.RequestMaintenance = AsyncErrorHandler(async (req, res) => {
    // Create the AssignEquipment document
    const maintenance = await requestmaintenance.create(req.body);  // Use 'Assign' model with the pre-save hook

    // Send a success response after the document is created and saved
    res.status(201).json({
        status: 'success',
        data: maintenance
    });
});


exports.DisplayRequest = AsyncErrorHandler(async (req, res) => {
    const features = new Apifeatures(requestmaintenance.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Declare and await the query result
    const filteredrequest = await features.query;
    const request = await requestmaintenance.aggregate([
      {
        $match: {
          _id: { $in: filteredrequest.map((Req) => Req._id) }, // Match only the filtered labs
        },
      },
      // Lookup User (Foreign Key)
      {
        $lookup: {
          from: 'users', // Collection name of the User model
          localField: 'Technician',
          foreignField: '_id',
          as: 'TechnicianDetails'
        }
      },
      {
        $unwind:{
          path: "$TechnicianDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "departments",
          localField: "Department",
          foreignField: "_id",
          as: "DepartmentInfo"
        }
      },
      {
        $unwind: {
          path: "$DepartmentInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "laboratories",
          localField: "Laboratory",
          foreignField: "_id",
          as: "LaboratoryInfo"
        }
      },
      {
        $unwind: {
          path: "$LaboratoryInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          id: 1,
          DateTime: 1,
          Ref: 1,
          Status: 1,
          feedback:1,
          feedbackread:1,
          Description: 1,
          Department: { $ifNull: ["$DepartmentInfo.DepartmentName", "N/A"] },
          DepartmentId: "$DepartmentInfo._id",
          _id: 1,

          Remarks: 1,
          remarksread:1,
          laboratoryName: { $ifNull: ["$LaboratoryInfo.LaboratoryName", "N/A"] },
          // Include User Details
          UserId: "$TechnicianDetails._id",
          Technician: {
            $concat: [
              '$TechnicianDetails.FirstName', 
              ' ',  // Space between names
              { $ifNull: ['$TechnicianDetails.Middle', ''] }, 
              ' ',  // Space before Last Name
              '$TechnicianDetails.LastName'
            ]
          }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      totalDepartment: request.length, // Fixed typo here
      data: request,
    });
});


  exports.DisplayNotifictaionRequest = AsyncErrorHandler(async (req, res) => {
    const features = new Apifeatures(
        requestmaintenance.find({ read: false }), // ✅ Only get unread requests
        req.query
    )

    .filter()
    .sort()
    .limitFields()
    .paginate();

    // Declare and await the query result
    const filteredrequest = await features.query;

    const request = await requestmaintenance.aggregate([
        {
            $match: {
                _id: { $in: filteredrequest.map((Req) => Req._id) }, // Match only filtered requests
                read: false // ✅ Only include unread requests
            }
        },
        // Lookup User (Foreign Key)
        {
          $lookup: {
            from: 'users', // Collection name of the User model
            localField: 'Technician',
            foreignField: '_id',
            as: 'TechnicianDetails'
          }
      },
      {
          $unwind:{
              path:"$TechnicianDetails",
              preserveNullAndEmptyArrays: true
          }
      },
        {
            $lookup: {
                from: "departments",
                localField: "Department",
                foreignField: "_id",
                as: "DepartmentInfo"
            }
        },
        {
            $unwind: {
                path: "$DepartmentInfo",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "laboratories",
                localField: "Laboratory",
                foreignField: "_id",
                as: "LaboratoryInfo"
            }
        },
        {
            $unwind: {
                path: "$LaboratoryInfo",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                id: 1,
                DateTime: 1,
                Status: 1,
                Ref: 1,
                Department: { $ifNull: ["$DepartmentInfo.DepartmentName", "N/A"] },
                DepartmentId: "$DepartmentInfo._id",
                _id: 1,
                laboratoryName: { $ifNull: ["$LaboratoryInfo.LaboratoryName", "N/A"] },
                // Include User Details
                UserId: "$TechnicianDetails._id",
                Technician: {
                  $concat: [
                      '$TechnicianDetails.FirstName', 
                      ' ',  // Space between names
                      { $ifNull: ['$TechnicianDetails.Middle', ''] }, 
                      ' ',  // Space before Last Name
                      '$TechnicianDetails.LastName'
                  ]
              }
               
            }
        }
    ]);

    res.status(200).json({
        status: "success",
        totalUnreadRequests: request.length, // ✅ Count only unread requests
        data: request,
    });
});



  exports.DeleteRequest = AsyncErrorHandler(async (req,res)=>{

    await requestmaintenance.findByIdAndDelete(req.params.id)

    res.status(200).json({
        status:'success',
        data:null
     });
  })

  exports.UpdateSenData =AsyncErrorHandler(async (req,res,next) =>{
    const updatedata = await requestmaintenance.findByIdAndUpdate(
      req.params.id,
      { ...req.body, read: true },
      { new: true }
  );
  
   res.status(200).json({
      status:'success',
      data:
      updatedata
   }); 
})

  
