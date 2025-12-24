// const mongoose = require("mongoose");
// const Business = require("../models/businesses"); 
// const User = require("../models/users");
// const BusinessExchange = require("../models/business_exchanges");
// const PersonalMeeting = require("../models/personal_meetings");
// const MeetingAttendance = require("../models/meeting_attendances");
// const ReferencePass = require("../models/reference_passes");

// exports.getChapterReport = async (req, res) => {
//     try {
//         const { 
//             city,      
//             chapter,   
//             dateRange,
//             page = 1,      
//             limit = 10      
//         } = req.query;

//         const pageNum = parseInt(page);
//         const limitNum = parseInt(limit);
//         const skip = (pageNum - 1) * limitNum;

//         // --- Date Logic ---
//         let startDate = new Date("2000-01-01"); 
//         const endDate = new Date();
//         endDate.setHours(23, 59, 59, 999);

//         if (dateRange) {
//             const today = new Date();
//             switch (dateRange) {
//                 case 'This Week': startDate = new Date(today.setDate(today.getDate() - 7)); break;
//                 case 'Last Week': startDate = new Date(today.setDate(today.getDate() - 14)); break;
//                 case 'Last 3 Months': startDate = new Date(today.setMonth(today.getMonth() - 3)); break;
//                 case 'Last 6 Months': startDate = new Date(today.setMonth(today.getMonth() - 6)); break;
//                 case 'Last 12 Months': startDate = new Date(today.setMonth(today.getMonth() - 12)); break;
//             }
//         }

//         // --- Aggregation Pipeline ---
//         const pipeline = [ 
//             {
//                 $lookup: {
//                     from: "cities",
//                     localField: "city_id",
//                     foreignField: "_id",
//                     as: "cityData"
//                 }
//             },
//             { $unwind: { path: "$cityData", preserveNullAndEmptyArrays: true } },

//             {
//                 $lookup: {
//                     from: "chapters",
//                     localField: "chapter_id",
//                     foreignField: "_id",
//                     as: "chapterData"
//                 }
//             },
//             { $unwind: { path: "$chapterData", preserveNullAndEmptyArrays: true } },
 
//             {
//                 $match: {
//                     ...(city && { "cityData.name": { $regex: new RegExp(city, "i") } }),
//                     ...(chapter && { "chapterData.name": { $regex: new RegExp(chapter, "i") } })
//                 }
//             },

//             // --- PAGINATION FACET --- 
//             {
//                 $facet: {
//                     metadata: [{ $count: "total" }],
//                     data: [
//                         { $sort: { "business_name": 1 } },  
//                         { $skip: skip },
//                         { $limit: limitNum },
 
                        
//                         // Get User Details
//                         {
//                             $lookup: {
//                                 from: "users",
//                                 localField: "user_id",
//                                 foreignField: "_id",
//                                 as: "userData"
//                             }
//                         },
//                         { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },

//                         // Business GIVEN
//                         {
//                             $lookup: {
//                                 from: "business_exchanges",
//                                 let: { userId: "$user_id" },
//                                 pipeline: [
//                                     {
//                                         $match: {
//                                             $expr: {
//                                                 $and: [
//                                                     { $eq: ["$from_member_id", "$$userId"] },
//                                                     { $gte: ["$created_at", startDate] },
//                                                     { $lte: ["$created_at", endDate] }
//                                                 ]
//                                             }
//                                         }
//                                     },
//                                     { $group: { _id: null, totalGiven: { $sum: { $toDouble: "$amount" } } } }
//                                 ],
//                                 as: "givenData"
//                             }
//                         },

//                         // Business RECEIVED
//                         {
//                             $lookup: {
//                                 from: "business_exchanges",
//                                 let: { userId: "$user_id" },
//                                 pipeline: [
//                                     {
//                                         $match: {
//                                             $expr: {
//                                                 $and: [
//                                                     { $eq: ["$to_member_id", "$$userId"] },
//                                                     { $gte: ["$created_at", startDate] },
//                                                     { $lte: ["$created_at", endDate] }
//                                                 ]
//                                             }
//                                         }
//                                     },
//                                     { $group: { _id: null, totalReceived: { $sum: { $toDouble: "$amount" } } } }
//                                 ],
//                                 as: "receivedData"
//                             }
//                         },

//                         // Meetings
//                         {
//                             $lookup: {
//                                 from: "personal_meetings",
//                                 let: { userId: "$user_id" },
//                                 pipeline: [
//                                     {
//                                         $match: {
//                                             $expr: {
//                                                 $and: [
//                                                     { $or: [ { $eq: ["$host_id", "$$userId"] }, { $eq: ["$visitor_id", "$$userId"] } ] },
//                                                     { $gte: ["$created_at", startDate] },
//                                                     { $lte: ["$created_at", endDate] }
//                                                 ]
//                                             }
//                                         }
//                                     },
//                                     { $count: "count" }
//                                 ],
//                                 as: "meetingData"
//                             }
//                         },

//                         // Attendance (Absent)
//                         {
//                             $lookup: {
//                                 from: "meeting_attendances",
//                                 let: { userId: "$user_id" },
//                                 pipeline: [
//                                     {
//                                         $match: {
//                                             $expr: {
//                                                 $and: [
//                                                     { $eq: ["$member_id", "$$userId"] },
//                                                     { $regexMatch: { input: "$attendance_status", regex: /absent/i } }, 
//                                                     { $gte: ["$created_at", startDate] },
//                                                     { $lte: ["$created_at", endDate] }
//                                                 ]
//                                             }
//                                         }
//                                     },
//                                     { $count: "count" }
//                                 ],
//                                 as: "absentData"
//                             }
//                         },

//                         // Ref GIVEN
//                         {
//                             $lookup: {
//                                 from: "reference_passes",
//                                 let: { userId: "$user_id" },
//                                 pipeline: [
//                                     {
//                                         $match: {
//                                             $expr: {
//                                                 $and: [
//                                                     { $eq: ["$from_member_id", "$$userId"] },
//                                                     { $gte: ["$created_at", startDate] },
//                                                     { $lte: ["$created_at", endDate] }
//                                                 ]
//                                             }
//                                         }
//                                     },
//                                     { $count: "count" }
//                                 ],
//                                 as: "refGivenData"
//                             }
//                         },

//                         // Ref RECEIVED
//                         {
//                             $lookup: {
//                                 from: "reference_passes",
//                                 let: { userId: "$user_id" },
//                                 pipeline: [
//                                     {
//                                         $match: {
//                                             $expr: {
//                                                 $and: [
//                                                     { $eq: ["$to_member_id", "$$userId"] },
//                                                     { $gte: ["$created_at", startDate] },
//                                                     { $lte: ["$created_at", endDate] }
//                                                 ]
//                                             }
//                                         }
//                                     },
//                                     { $count: "count" }
//                                 ],
//                                 as: "refReceivedData"
//                             }
//                         },

//                         // --- FINAL PROJECT ---
//                         {
//                             $project: {
//                                 _id: 1,
//                                 user_id: 1,
//                                 full_name: { $concat: ["$userData.first_name", " ", "$userData.last_name"] },
//                                 business_name: "$business_name",
//                                 personal_phone_number: "$personal_phone_number",
//                                 profile_picture: "$userData.profile_picture",
//                                 city_name: "$cityData.name",
//                                 chapter_name: "$chapterData.name",
                                
//                                 business_given: { $ifNull: [{ $arrayElemAt: ["$givenData.totalGiven", 0] }, 0] },
//                                 business_received: { $ifNull: [{ $arrayElemAt: ["$receivedData.totalReceived", 0] }, 0] },
//                                 one_to_one_count: { $ifNull: [{ $arrayElemAt: ["$meetingData.count", 0] }, 0] },
//                                 absent_count: { $ifNull: [{ $arrayElemAt: ["$absentData.count", 0] }, 0] },
//                                 reference_given: { $ifNull: [{ $arrayElemAt: ["$refGivenData.count", 0] }, 0] },
//                                 reference_received: { $ifNull: [{ $arrayElemAt: ["$refReceivedData.count", 0] }, 0] }
//                             }
//                         }
//                     ]
//                 }
//             }
//         ];

//         const result = await Business.aggregate(pipeline);

//         // Parse Facet Result
//         const data = result[0].data;
//         const totalCount = result[0].metadata[0] ? result[0].metadata[0].total : 0;
//         const totalPages = Math.ceil(totalCount / limitNum);

//         return res.status(200).json({
//             code : 200,
//             success: true,
//             pagination: {
//                 total_records: totalCount,
//                 total_pages: totalPages,
//                 current_page: pageNum,
//                 limit: limitNum
//             },
//             filters_applied: { city, chapter, dateRange },
//             data: data
//         });

//     } catch (error) {
//         console.error("Report Error:", error);
//         return res.status(500).json({
//             code : 500,
//             success: false,
//             message: "Error fetching chapter report",
//             error: error.message
//         });
//     }
// };

const mongoose = require("mongoose");
const Business = require("../models/businesses");
const User = require("../models/users");
const BusinessExchange = require("../models/business_exchanges");
const PersonalMeeting = require("../models/personal_meetings");
const MeetingAttendance = require("../models/meeting_attendances");
const ReferencePass = require("../models/reference_passes");

exports.getChapterReport = async (req, res) => {
    try {
        const { 
            city, chapter, dateRange,
            page = 1, limit = 10,
            sortBy = 'business_name', sortOrder = 'asc' 
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const sortDirection = sortOrder === 'desc' ? -1 : 1;
 
        let startDate = new Date("1970-01-01"); 
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        if (dateRange) {
            const today = new Date();
            switch (dateRange) {
                case 'This Week': startDate = new Date(today.setDate(today.getDate() - 7)); break;
                case 'Last Week': startDate = new Date(today.setDate(today.getDate() - 14)); break;
                case 'Last 3 Months': startDate = new Date(today.setMonth(today.getMonth() - 3)); break;
                case 'Last 6 Months': startDate = new Date(today.setMonth(today.getMonth() - 6)); break;
                case 'Last 12 Months': startDate = new Date(today.setMonth(today.getMonth() - 12)); break;
            }
        }
 
        const calculatedFields = [
            'reference_received', 'reference_given', 
            'business_received', 'business_given', 
            'one_to_one_count', 'absent_count', 'full_name'
        ];
        const isComplexSort = calculatedFields.includes(sortBy);

        const initialMatch = { 
        };

        const lookupStages = [ 
            {
                $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "userData" }
            },
            { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } }, 
            {
                $lookup: {
                    from: "business_exchanges",
                    let: { userId: "$user_id" },
                    pipeline: [
                        { $match: { $expr: { $and: [ { $eq: ["$from_member_id", "$$userId"] }, { $gte: ["$created_at", startDate] }, { $lte: ["$created_at", endDate] } ] } } },
                        { $group: { _id: null, totalGiven: { $sum: { $toDouble: "$amount" } } } }
                    ],
                    as: "givenData"
                }
            }, 
            {
                $lookup: {
                    from: "business_exchanges",
                    let: { userId: "$user_id" },
                    pipeline: [
                        { $match: { $expr: { $and: [ { $eq: ["$to_member_id", "$$userId"] }, { $gte: ["$created_at", startDate] }, { $lte: ["$created_at", endDate] } ] } } },
                        { $group: { _id: null, totalReceived: { $sum: { $toDouble: "$amount" } } } }
                    ],
                    as: "receivedData"
                }
            }, 
            {
                $lookup: {
                    from: "personal_meetings",
                    let: { userId: "$user_id" },
                    pipeline: [
                        { $match: { $expr: { $and: [ { $or: [ { $eq: ["$host_id", "$$userId"] }, { $eq: ["$visitor_id", "$$userId"] } ] }, { $gte: ["$created_at", startDate] }, { $lte: ["$created_at", endDate] } ] } } },
                        { $count: "count" }
                    ],
                    as: "meetingData"
                }
            }, 
            {
                $lookup: {
                    from: "meeting_attendances",
                    let: { userId: "$user_id" },
                    pipeline: [
                        { $match: { $expr: { $and: [ { $eq: ["$member_id", "$$userId"] }, { $regexMatch: { input: "$attendance_status", regex: /absent/i } }, { $gte: ["$created_at", startDate] }, { $lte: ["$created_at", endDate] } ] } } },
                        { $count: "count" }
                    ],
                    as: "absentData"
                }
            }, 
            {
                $lookup: {
                    from: "reference_passes",
                    let: { userId: "$user_id" },
                    pipeline: [
                        { $match: { $expr: { $and: [ { $eq: ["$from_member_id", "$$userId"] }, { $gte: ["$created_at", startDate] }, { $lte: ["$created_at", endDate] } ] } } },
                        { $count: "count" }
                    ],
                    as: "refGivenData"
                }
            }, 
            {
                $lookup: {
                    from: "reference_passes",
                    let: { userId: "$user_id" },
                    pipeline: [
                        { $match: { $expr: { $and: [ { $eq: ["$to_member_id", "$$userId"] }, { $gte: ["$created_at", startDate] }, { $lte: ["$created_at", endDate] } ] } } },
                        { $count: "count" }
                    ],
                    as: "refReceivedData"
                }
            }
        ];

        const projectStage = {
            $project: {
                _id: 1, user_id: 1,
                full_name: { $concat: ["$userData.first_name", " ", "$userData.last_name"] },
                business_name: "$business_name",
                personal_phone_number: "$personal_phone_number",
                profile_picture: "$userData.profile_picture",
                city_name: "$cityData.name",
                chapter_name: "$chapterData.name",
                business_given: { $ifNull: [{ $arrayElemAt: ["$givenData.totalGiven", 0] }, 0] },
                business_received: { $ifNull: [{ $arrayElemAt: ["$receivedData.totalReceived", 0] }, 0] },
                one_to_one_count: { $ifNull: [{ $arrayElemAt: ["$meetingData.count", 0] }, 0] },
                absent_count: { $ifNull: [{ $arrayElemAt: ["$absentData.count", 0] }, 0] },
                reference_given: { $ifNull: [{ $arrayElemAt: ["$refGivenData.count", 0] }, 0] },
                reference_received: { $ifNull: [{ $arrayElemAt: ["$refReceivedData.count", 0] }, 0] }
            }
        };

        const commonStages = [
            { $lookup: { from: "cities", localField: "city_id", foreignField: "_id", as: "cityData" } },
            { $unwind: { path: "$cityData", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "chapters", localField: "chapter_id", foreignField: "_id", as: "chapterData" } },
            { $unwind: { path: "$chapterData", preserveNullAndEmptyArrays: true } },
            {
                $match: {
                    ...(city && { "cityData.name": { $regex: new RegExp(city, "i") } }),
                    ...(chapter && { "chapterData.name": { $regex: new RegExp(chapter, "i") } })
                }
            }
        ];

        let pipeline = [];

        if (isComplexSort) { 
            pipeline = [
                ...commonStages,
                ...lookupStages,
                projectStage,
                { $sort: { [sortBy]: sortDirection } },  
                {
                    $facet: {
                        metadata: [{ $count: "total" }],
                        data: [{ $skip: skip }, { $limit: limitNum }]
                    }
                }
            ];
        } else { 
            pipeline = [
                ...commonStages,
                { $sort: { [sortBy]: sortDirection } },
                {
                    $facet: {
                        metadata: [{ $count: "total" }],
                        data: [
                            { $skip: skip }, 
                            { $limit: limitNum },
                            ...lookupStages,
                            projectStage
                        ]
                    }
                }
            ];
        }

        const result = await Business.aggregate(pipeline);

        const data = result[0].data;
        const totalCount = result[0].metadata[0] ? result[0].metadata[0].total : 0;
        const totalPages = Math.ceil(totalCount / limitNum);

        return res.status(200).json({
            success: true,
            pagination: {
                total_records: totalCount,
                total_pages: totalPages,
                current_page: pageNum,
                limit: limitNum
            },
            data: data
        });

    } catch (error) {
        console.error("Report Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};