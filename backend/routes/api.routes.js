const express = require("express");
const router = express.Router();
const users = require("../controllers/user.controller");
const city = require("../controllers/cities.controller");
const chapter = require("../controllers/chapter.controller");
const ask = require("../controllers/ask.controller");
const business = require("../controllers/business.controller");
const businessPortfolios = require("../controllers/businessportfolios.controller");
const businessexchanges = require("../controllers/businessexchanges.controller");
const meetings = require("../controllers/meetings.controller");
const businessService = require('../controllers/businessservice.controller');
const personalMeetings = require('../controllers/personalmeetings.controller');  
const reference = require('../controllers/reference.controller');
const event  = require('../controllers/event.controller.js');
const ruleBook = require("../controllers/rulebook.controller.js");
const attendances = require("../controllers/attendances.controllers");
const privacyPolicy = require("../controllers/privacyPolicy.controller.js");
const termsAndConditions = require("../controllers/termsandconditions.controller.js");
const membership = require("../controllers/membership.controller"); 
const chapterReport = require("../controllers/chapterreport.controller.js");
const attendanceReport = require("../controllers/attendancereport.controller.js");
const auth = require('../middleware/auth.middleware');

// User routes
router.get("/users/upcoming-birthdays", users.getUpcomingBirthdays);  
router.get("/users/total-members", users.getTotalMembers);
router.post("/users/", users.createUser);
router.get("/users/", users.getAllUsers);
router.get("/users/:id", users.getUserById);
router.put("/users/:id", users.updateUser);
router.post("/users/login", users.loginUser);
router.delete("/users/:id", users.deleteUser);
router.put("/users/change-password/:id", users.changePassword);

// City routes
router.post("/cities/", city.createCity); 
router.get("/cities/", city.getAllCities); 
router.get("/cities/:id", city.getCityById); 
router.put("/cities/:id", city.updateCity); 
router.delete("/cities/:id", city.deleteCity);

// Chapter routes
router.post("/chapters/", chapter.createChapter);
router.get("/chapters/", chapter.getAllChapters);
router.get("/chapters/count", chapter.getChapterCount);
router.get("/chapters/:id", chapter.getChapterById);
router.get("/chapters/city/:city", chapter.getChaptersByCity);
router.put("/chapters/:id", chapter.updateChapter);
router.delete("/chapters/:id", chapter.deleteChapter);

// Ask routes
router.post("/asks/", ask.createAsk);
router.get("/asks/", ask.getAllAsks);
router.get("/asks/:id", ask.getAskById);
router.put("/asks/:id", ask.updateAsk);
router.delete("/asks/:id", ask.deleteAsk);

// Business routes
router.post("/businesses", business.createBusiness);
router.get("/businesses", business.getAllBusinesses);
router.get("/businesses/:id", business.getBusinessById);
router.put("/businesses/:id", business.updateBusiness);
router.delete("/businesses/:id", business.deleteBusiness);
router.get("/businesses/user/:userId", business.getBusinessesByUserId);

// Business Portfolio routes
router.post("/portfolios/", businessPortfolios.createPortfolio);
router.get("/portfolios/", businessPortfolios.getAllPortfolios);
router.get("/portfolios/:id", businessPortfolios.getPortfolioById);
router.put("/portfolios/:id", businessPortfolios.updatePortfolio);
router.delete("/portfolios/:id", businessPortfolios.softDeletePortfolio);

// Business Exchange routes
router.get("/business-exchanges/total-revenue", businessexchanges.getTotalRevenue);
router.post("/business-exchanges/", businessexchanges.createExchange);
router.get("/business-exchanges/", businessexchanges.getAllExchanges);
router.get("/business-exchanges/:id", businessexchanges.getExchangeById);
router.put("/business-exchanges/:id", businessexchanges.updateExchange);
router.delete("/business-exchanges/:id", businessexchanges.softDeleteExchange);

// Meeting routes
router.get('/meetings/upcoming-meetings', meetings.getNext30DaysMeetings);
router.post("/meetings/", meetings.createMeeting); 
router.get("/meetings/", meetings.getAllMeetings); 
router.get("/meetings/:id", meetings.getMeetingById); 
router.put("/meetings/:id", meetings.updateMeeting); 
router.delete("/meetings/:id", meetings.deleteMeeting); 
router.post('/meetings/attend', meetings.markAttendanceFromQR);

router.post('/meetings/attend', meetings.markAttendanceFromQR); 
router.get('/meetings/:meetingId/export-attendance', meetings.exportToCsv);
router.get('/:meetingId/export-attendance', meetings.exportToCsv);

// Business Service routes
router.post('/business-services/', businessService.createService);
router.get('/business-services/', businessService.getAllServices);
router.get('/business-services/:id', businessService.getServiceById);
router.put('/business-services/:id', businessService.updateService);
router.delete('/business-services/:id', businessService.deleteService);
router.get('/business-services/business/:businessId', businessService.getServiceByBusinessId);

// Personal Meetings routes
router.get("/personal-meetings/total-meetings", personalMeetings.getTotalPersonalMeetings);
router.post("/personal-meetings", personalMeetings.createPersonalMeeting);
router.get("/personal-meetings", personalMeetings.getAllPersonalMeetings);
router.get("/personal-meetings/:id", personalMeetings.getPersonalMeetingById);
router.put("/personal-meetings/:id", personalMeetings.updatePersonalMeeting);
router.delete("/personal-meetings/:id", personalMeetings.deletePersonalMeeting);
router.get('/personal-meetings/visitor', personalMeetings.getVisitorPersonalMeetings);
router.get('/personal-meetings/host/:hostId', personalMeetings.getPersonalMeetingsByHostId);

//  Reference Pass routes
router.get("/reference-passes/total-passes", reference.getTotalReferencePasses);
router.post('/reference-passes/', reference.createReferencePass);
router.get('/reference-passes/', reference.getAllReferencePasses);
router.get('/reference-passes/:id', reference.getReferencePassById);
router.put('/reference-passes/:id', reference.updateReferencePass);
router.delete('/reference-passes/:id', reference.deleteReferencePass);

// Event routes
router.post("/events/", event.createEvent);
router.get("/events/", event.getEvents);
router.get("/events/:id", event.getEventById);
router.put("/events/:id", event.updateEvent);

// Rulebook routes
router.get("/rule-book/", ruleBook.getRuleBook);
router.put("/rule-book/", ruleBook.updateRuleBook);

// Meeting Attendance routes
router.get("/meeting-attendances/:meetingId/total-attendances", attendances.getTotalAttendances);

// Privacy Policy routes
router.get("/privacy-policy/", privacyPolicy.getPrivacyPolicy);
router.put("/privacy-policy/", privacyPolicy.updatePrivacyPolicy);

// Terms & Conditions routes
router.get("/terms-and-conditions/", termsAndConditions.getTermsAndConditions);
router.put("/terms-and-conditions/", termsAndConditions.updateTermsAndConditions);

// Membership routes
router.post("/membership/", membership.createMembership);
router.get("/membership/", membership.getAllMemberships);
router.get("/membership/expiring", membership.getExpiringMemberships);
// router.get("/membership/:id", membership.getMembershipById);
router.put("/membership/renew/:id", membership.renewMembership);
router.delete("/membership/:id", membership.deleteMembership);

// Chapter Report routes
router.get("/chapter-reports", chapterReport.getChapterReport);

// Attendance Report routes
router.get("/attendance-reports", attendanceReport.getAttendanceReport);

module.exports = router;