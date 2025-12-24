// const mongoose = require("mongoose");
// const Business = require("../models/businesses");
// const User = require("../models/users");
// const MeetingAttendance = require("../models/meeting_attendances"); 
// const Meeting = require("../models/meetings"); 

// exports.getAttendanceReport = async (req, res) => {
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

//         // ---  Date Logic ---
//         let startDate = new Date("2000-01-01");
//         const endDate = new Date();
//         endDate.setHours(23, 59, 59, 999);

//         if (dateRange) {
//             const today = new Date();
//             switch (dateRange) {
//                 case 'This Week': startDate = new Date(today.setDate(today.getDate() - 7)); break;
//                 case 'Last Week': startDate = new Date(today.setDate(today.getDate() - 14)); break;
//                 case 'Last 3 Months': startDate = new Date(today.setMonth(today.getMonth() - 3)); break;
//                 case 'Last 4 Months': startDate = new Date(today.setMonth(today.getMonth() - 4)); break;
//                 case 'Last 6 Months': startDate = new Date(today.setMonth(today.getMonth() - 6)); break;
//                 case 'Last 9 Months': startDate = new Date(today.setMonth(today.getMonth() - 9)); break;
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

//             // --- FILTERING ---
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

//                         // --- LOOKUP USER DETAILS ---
//                         {
//                             $lookup: {
//                                 from: "users",
//                                 localField: "user_id",
//                                 foreignField: "_id",
//                                 as: "userData"
//                             }
//                         },
//                         { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },

//                         // --- LOOKUP ATTENDANCE RECORDS ---
//                         {
//                             $lookup: {
//                                 from: "meeting_attendances",
//                                 let: { userId: "$user_id" },
//                                 pipeline: [
//                                     {
//                                         $match: {
//                                             $expr: { $eq: ["$member_id", "$$userId"] }  
//                                         }
//                                     }, 
//                                     {
//                                         $lookup: {
//                                             from: "meetings",
//                                             localField: "meeting_id",
//                                             foreignField: "_id",
//                                             as: "meetingDetails"
//                                         }
//                                     },
//                                     { $unwind: "$meetingDetails" }, 
//                                     {
//                                         $match: {
//                                             "meetingDetails.date": { $gte: startDate, $lte: endDate }
//                                         }
//                                     }, 
//                                     {
//                                         $project: {
//                                             date: "$meetingDetails.date",
//                                             status: "$attendance_status"
//                                         }
//                                     }
//                                 ],
//                                 as: "attendanceRecords"
//                             }
//                         },

//                         // --- FINAL PROJECTION ---
//                         {
//                             $project: {
//                                 _id: 1,  
//                                 user_id: 1, 
//                                 name: { $concat: ["$userData.first_name", " ", "$userData.last_name"] },
//                                 mobile: "$personal_phone_number",
//                                 business: "$business_name",
//                                 city_name: "$cityData.name",
//                                 chapter_name: "$chapterData.name", 
//                                 attendance_logs: {
//                                     $map: {
//                                         input: "$attendanceRecords",
//                                         as: "log",
//                                         in: {
//                                             date: { $dateToString: { format: "%Y-%m-%d", date: "$$log.date" } }, 
//                                             status: {
//                                                 $cond: {
//                                                     if: { $or: [
//                                                         { $eq: ["$$log.status", "attended"] },
//                                                         { $eq: ["$$log.status", "present"] } 
//                                                     ]},
//                                                     then: "P",
//                                                     else: "A"
//                                                 }
//                                             }
//                                         }
//                                     }
//                                 }
//                             }
//                         }
//                     ]
//                 }
//             }
//         ];

//         const result = await Business.aggregate(pipeline);

//         const data = result[0].data;
//         const totalCount = result[0].metadata[0] ? result[0].metadata[0].total : 0;
//         const totalPages = Math.ceil(totalCount / limitNum); 
//         const uniqueDates = new Set();
//         data.forEach(member => {
//             member.attendance_logs.forEach(log => uniqueDates.add(log.date));
//         });
//         const sortedDates = Array.from(uniqueDates).sort(); 
//         const formattedData = data.map(member => {
//             const attendanceMap = {};
//             member.attendance_logs.forEach(log => {
//                 attendanceMap[log.date] = log.status;
//             });

//             return {
//                 id: member._id,
//                 name: member.name,
//                 mobile: member.mobile,
//                 business: member.business,
//                 city: member.city_name,
//                 chapter: member.chapter_name,
//                 attendance: attendanceMap
//             };
//         });

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
//             meeting_dates: sortedDates,  
//             data: formattedData
//         });

//     } catch (error) {
//         console.error("Attendance Report Error:", error);
//         return res.status(500).json({
//             code : 500,
//             success: false,
//             message: "Error fetching attendance report",
//             error: error.message
//         });
//     }
// };

const mongoose = require("mongoose");
const Business = require("../models/businesses");
const User = require("../models/users");
const MeetingAttendance = require("../models/meeting_attendances");
const Meeting = require("../models/meetings");

exports.getAttendanceReport = async (req, res) => {
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
 
        const meetingQuery = { date: { $gte: startDate, $lte: endDate } };
        const meetingsFound = await Meeting.find(meetingQuery).select("date").sort({ date: 1 }).lean();
        const meetingDatesSet = new Set(meetingsFound.map(m => new Date(m.date).toISOString().split('T')[0]));
        const sortedDates = Array.from(meetingDatesSet).sort();
 
        let dbSortKey = "business_name";  
        if (sortBy === 'mobile') dbSortKey = "personal_phone_number";
        if (sortBy === 'name') dbSortKey = "userData.first_name";  
        if (sortBy === 'business_name') dbSortKey = "business_name";
 
        const pipeline = [ 
            { $lookup: { from: "cities", localField: "city_id", foreignField: "_id", as: "cityData" } },
            { $unwind: { path: "$cityData", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "chapters", localField: "chapter_id", foreignField: "_id", as: "chapterData" } },
            { $unwind: { path: "$chapterData", preserveNullAndEmptyArrays: true } },
             
            { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "userData" } },
            { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
 
            {
                $match: {
                    ...(city && { "cityData.name": { $regex: new RegExp(city, "i") } }),
                    ...(chapter && { "chapterData.name": { $regex: new RegExp(chapter, "i") } })
                }
            },
 
            { $sort: { [dbSortKey]: sortDirection } },
 
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [
                        { $skip: skip },
                        { $limit: limitNum },
 
                        {
                            $lookup: {
                                from: "meeting_attendances",
                                let: { userId: "$user_id" },
                                pipeline: [
                                    { $match: { $expr: { $eq: ["$user_id", "$$userId"] } } },
                                    { $lookup: { from: "meetings", localField: "meeting_id", foreignField: "_id", as: "meetingDetails" } },
                                    { $unwind: "$meetingDetails" },
                                    { $match: { "meetingDetails.date": { $gte: startDate, $lte: endDate } } },
                                    { $project: { date: "$meetingDetails.date", status: "$attendance_status" } }
                                ],
                                as: "attendanceRecords"
                            }
                        },
 
                        {
                            $project: {
                                _id: 1, 
                                name: { $concat: ["$userData.first_name", " ", "$userData.last_name"] },
                                mobile: "$personal_phone_number",
                                business: "$business_name",
                                city_name: "$cityData.name",
                                chapter_name: "$chapterData.name",
                                attendance_logs: {
                                    $map: {
                                        input: "$attendanceRecords",
                                        as: "log",
                                        in: {
                                            date: { $dateToString: { format: "%Y-%m-%d", date: "$$log.date" } },
                                            status: {
                                                $cond: {
                                                    if: { $or: [ { $eq: ["$$log.status", "attended"] }, { $eq: ["$$log.status", "present"] } ] },
                                                    then: "P",
                                                    else: "A"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ];

        const result = await Business.aggregate(pipeline);
        const data = result[0].data;
        const totalCount = result[0].metadata[0] ? result[0].metadata[0].total : 0;
        const totalPages = Math.ceil(totalCount / limitNum);

        const formattedData = data.map(member => {
            const attendanceMap = {};
            if (member.attendance_logs) {
                member.attendance_logs.forEach(log => { attendanceMap[log.date] = log.status; });
            }
            return {
                id: member._id,
                name: member.name || "Unknown",
                mobile: member.mobile || "-",
                business: member.business || "-",
                city: member.city_name,
                chapter: member.chapter_name,
                attendance: attendanceMap
            };
        });

        return res.status(200).json({
            code: 200,
            success: true,
            pagination: {
                total_records: totalCount,
                total_pages: totalPages,
                current_page: pageNum,
                limit: limitNum
            },
            filters_applied: { city, chapter, dateRange },
            meeting_dates: sortedDates,
            data: formattedData
        });

    } catch (error) {
        console.error("Attendance Report Error:", error);
        return res.status(500).json({ code: 500, success: false, error: error.message });
    }
};