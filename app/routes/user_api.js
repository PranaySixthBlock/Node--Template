var router = express.Router();
var AuthController = require('../controllers/AuthController');
var MenuController = require('../controllers/MenuController');
var CompanyController = require('../controllers/CompanyController');
var CompanyContactsController = require('../controllers/CompanyContactsController');
var UsersDataController = require('../controllers/UsersDataController');
var UploadController = require('../controllers/UploadController');
var UserRoleController = require('../controllers/UserRoleController');
var UsersPermissionsController = require('../controllers/UsersPermissionsController');
var DropdownController = require('../controllers/DropdownController');
var LocationController = require('../controllers/LocationController');
var VendorServiceProviderController = require('../controllers/VendorServiceProviderController');
var AssetController = require('../controllers/AssetController');
var TicketController = require('../controllers/TicketController');
var TicketPriortyController = require('../controllers/TicketPrioritiesController');
var CustomFormController = require('../controllers/CustomFormController');
var CompanySubscriptionController = require('../controllers/CompanySubscriptionController');
var TokenAuth = require('../middlewares/tokenAuthentication');
var DashboardController = require('../controllers/DashboardController');
var PaymentController = require('../controllers/PaymentController');
var StoreRoomController = require('../controllers/StoreRoomController');
var EmployeeController = require('../controllers/EmployeeController');
var AuditController = require('../controllers/AuditController');
var CronJobController= require('../controllers/CronJobController');
var ReportsController = require('../controllers/ReportsController');
var AuditAssetsController = require('../controllers/AuditAssetsController');


var CountryDropdownController = require('../controllers/CountryDropdownController');
var StateDropdownController = require('../controllers/StateDropdownController');
var CityDropdownController = require('../controllers/CityDropdownController');
var TenderController = require('../controllers/TenderController');

router.post("/default/registartion/user",AuthController.customerRegister);
router.post("/company/user/signin", AuthController.customerlogin);
router.get("/all/menus", TokenAuth.UserAuth, MenuController.getAllDropDowns);
router.put("/company/contact/password/change", TokenAuth.UserAuth, AuthController.changePassword);
router.get("/company/detailed/view", TokenAuth.UserAuth,CompanyController.getCompanyById);
router.post("/user/profile/edit", TokenAuth.UserAuth, CompanyController.editMyProfile);
router.post("/user/profile/edit/passcode",TokenAuth.UserAuth, CompanyController.changePasscode);
router.post("/company/add/contact", CompanyController.addCompanyUser);
router.post("/company/edit/:companyId", TokenAuth.UserAuth, CompanyController.updateCompany);
router.post("/upload/company/logo/:companyId", UploadController.uploadCompanyLogo);
router.get("/display/company/logo/:companyId", CompanyController.getCompanyLogo);
router.delete("/delete/company/logo/:companyId", CompanyController.deleteCompanyLogo);
router.post("/forgot/password/request", CompanyContactsController.userForgotPasscode);
router.post("/forgot/password", CompanyContactsController.resetPassword);

//Social Login
router.post("/company/social/registartion", AuthController.userSocialRegister);
router.post("/company/user/social/signin",AuthController.userSocialSignIn);


//country Dropdowns Routes
router.post('/create/new/user/dropdown/:companyId', CountryDropdownController.createUserDropdown);
router.get('/all/user/dropdowns/:companyId', CountryDropdownController.getAllCompanyDropdowns);
router.put('/update/company/dropdown/:dId', CountryDropdownController.updateDropdown);
router.get('/get/company/dropdown/:dId', CountryDropdownController.getDropdownData);

router.get('/all/user/dropdowns/bytype/:typeName/:companyId', CountryDropdownController.getAllCompanyDropdownsByType);


//filtered data
router.post('/get/filtered/state/data', StateDropdownController.listOfFilteredCompanystates);
// {
//     "countryId":"",
//     "company":"",
//     "stateId":""
// }

// Tender routes
router.post('/create/new/tender/:companyId',TokenAuth.UserAuth, TenderController.createTender);
router.get('/all/tenders/:companyId', TokenAuth.UserAuth, TenderController.getAllTenders);
router.put('/update/company/tender/:tId',TokenAuth.UserAuth, TenderController.updateTenderData);
router.get('/get/company/tender/:tId',TokenAuth.UserAuth, TenderController.getTenderData);


//all tender page dropdowns

router.get('/get/company/tender/dropdown/values/:companyId', TenderController.TenderDropdowns);

router.get('/get/state/dropdown/values/:countryId', TenderController.TenderStateDropdowns);

router.get('/get/city/dropdown/values/:stateId', TenderController.tenderCityDropdown);

router.get('/get/roles/dropdown/values/:companyId', TenderController.companyRoleDropdown);

//state Dropdowns Routes
router.post('/create/new/state/dropdown/:companyId', StateDropdownController.createStateDropdown);
router.get('/all/state/dropdowns/:companyId', StateDropdownController.getAllCompanyStateDropdowns);
router.put('/update/company/state/dropdown/:dId', StateDropdownController.updateStateDropdown);
router.get('/get/company/state/dropdown/:dId', StateDropdownController.getStateDropdownData);

//city Dropdowns Routes
router.post('/create/new/city/dropdown/:companyId', CityDropdownController.createCityDropdown);
router.get('/all/city/dropdowns/:companyId', CityDropdownController.getAllCompanyCityDropdowns);
router.put('/update/company/city/dropdown/:dId', CityDropdownController.updateCityDropdown);
router.get('/get/company/city/dropdown/:dId', CityDropdownController.getCityDropdownData);









//CronJob API
router.get("/cronjob/:company", CronJobController.cronJobFunction);

//User adding members to Company
router.post("/add/members/company/:userId", TokenAuth.UserAuth, CompanyContactsController.addMemberToCompany);
router.put('/update/company/member/:memberId', TokenAuth.UserAuth, CompanyContactsController.updateMemberDetails);
router.get('/display/company/member/:userId', TokenAuth.UserAuth, CompanyContactsController.getOneMember);
router.get('/all/company/members/:companyId', TokenAuth.UserAuth, CompanyContactsController.getAllMembers);
router.get('/get/searched/company/members/:companyId/:uname', TokenAuth.UserAuth, CompanyContactsController.SearchUsersController);
router.delete('/delete/company/member/:companyId/:userId', TokenAuth.UserAuth, CompanyContactsController.deleteMember);
router.post("/contact/email/verfication", CompanyController.verifyUserEmail);

//Ticket Images uploading Not working
router.post('/upload/tickets/images/:companyId', UploadController.uploadTicketPhotos);
router.get('/display/tickets/images/:companyId/:ticketId', TicketController.getTicketImages);
router.delete('/delete/ticket/image/byId/:ticketId/:imageId', TicketController.deleteTicketImage);

//User Dropdowns Routes
// router.post('/create/new/user/menu/:companyId', TokenAuth.UserAuth, DropdownController.createUserDropdown);
// router.get('/all/user/dropdowns/:companyId', DropdownController.getAllCompanyDropdowns);
// router.put('/update/company/dropdown/:dId', TokenAuth.UserAuth, DropdownController.updateDropdown);
// router.get('/get/company/dropdown/:dId', DropdownController.getDropdownData);
// router.get('/get/company/groupwise/dropdowns/:type/:companyId', TokenAuth.UserAuth, DropdownController.getGroupWiseDropdowns);
// router.put('/update/company/groupwise/dropdown/:type/:dId', TokenAuth.UserAuth, DropdownController.updateGroupWiseDropdown);
router.get('/company/asset/dropdown/values/:companyId', DropdownController.assetDropdowns);

//Locations Routes
router.post('/create/location/:companyId', TokenAuth.UserAuth, LocationController.createNewLocation);
router.get('/get/all/company/locations/:companyId', TokenAuth.UserAuth, LocationController.companyLocationsList);
router.put('/update/company/location/:locationId', TokenAuth.UserAuth, LocationController.updateLocationData);
router.get('/get/company/location/:locationId', TokenAuth.UserAuth, LocationController.getLocationData);

//Vendors And Service Providers Routes
router.post('/create/location/external/:type/:companyId', TokenAuth.UserAuth, VendorServiceProviderController.createExternalStaff);
router.get('/get/all/company/location/external/staff/:companyId', VendorServiceProviderController.companyExternalStaffList);
router.put('/update/company/location/external/staff/:id', TokenAuth.UserAuth, VendorServiceProviderController.updateExternalStaffData);
router.get('/get/company/location/extrenal/staff/:type/:companyId', TokenAuth.UserAuth, VendorServiceProviderController.getGroupWiseExternalStaffData);
router.get('/get/company/external/staff/:id', VendorServiceProviderController.getExternalStaffData);
router.put('/update/company/groupwise/external/staff/:type/:id', TokenAuth.UserAuth, VendorServiceProviderController.updateGroupWiseExternalStaff);
router.get('/get/providers/searched/keywords/:companyId/:keyword', VendorServiceProviderController.ProviderSearchAutoCompleteAssets)

//Assets Routes
router.post('/create/company/assets/:companyId', TokenAuth.UserAuth, AssetController.createAsset);
router.get('/get/all/company/assets/:companyId', TokenAuth.UserAuth, AssetController.listOfCompanyAssets);
router.put('/update/company/asset/:id', TokenAuth.UserAuth, AssetController.updateAssetData);
router.get('/get/location/assets/:locationId', TokenAuth.UserAuth, AssetController.locationAssets);
router.get('/get/asset/data/:assetId', TokenAuth.UserAuth, AssetController.getAssetData);
router.get('/get/searched/assets/:companyId/:asset', TokenAuth.UserAuth, AssetController.SearchCompanyAssets)
router.get('/get/searched/keywords/:companyId/:keyword', AssetController.SearchAutoCompleteAssets)
router.post('/get/filtered/assets/data', TokenAuth.UserAuth, AssetController.listOfFilteredCompanyAssets);
router.get('/get/filtered/keywords/:companyId/:searchtype/:asset', TokenAuth.UserAuth, AssetController.FilterNameAndCode);
router.get('/get/asset/allotment/acitvity/log/:assetId', AssetController.getAssetAllotmentActivityLog);
router.put('/update/asset/allocation/:assetId', TokenAuth.UserAuth, AssetController.allocateAsset);
router.put('/update/asset/purchase/details/:assetId', TokenAuth.UserAuth, AssetController.addAssetPurchaseDetails);
router.put('/update/asset/ppm/:assetId', TokenAuth.UserAuth, AssetController.addAssetPPM);
router.put('/return/asset/:activityId/:assetId', TokenAuth.UserAuth, AssetController.returningAsset);
router.get('/get/asset/acitvity/log/:assetId', AssetController.getAssetActivityLog);
router.post('/get/maintenance/assets', AssetController.maintenanceAssets);
router.post('/get/company/maintenance/assets', TokenAuth.UserAuth, AssetController.getCompanyMaintenanceAssets);
router.get("/get/asset/details/:assetId", TokenAuth.UserAuth, AssetController.assetDetailsUsingAssetId);
// router.get("/get/natvie/asset/data/:asset", TokenAuth.UserAuth, ReportsController.getAssetDataForQRCode);
router.post("/get/natvie/asset/data", TokenAuth.UserAuth, ReportsController.getAssetDataForQRCode);

//Quick Search filter
router.post('/get/quicksearch/assets/data', TokenAuth.UserAuth, AssetController.listOfQuickSearchAssets);

//Tickets Routes
router.post('/create/new/ticket/:companyId/:userId', TokenAuth.UserAuth, TicketController.createNewTicket);
router.get('/get/company/tickets/:companyId', TokenAuth.UserAuth, TicketController.companyTicketsList);
router.get('/get/company/ticket/details/:ticketId', TokenAuth.UserAuth, TicketController.getTicketById);
router.put('/update/company/ticket/detials/:ticketId/:userId', TokenAuth.UserAuth, TicketController.updateTicketData);
router.post('/get/filtered/company/tickets', TokenAuth.UserAuth, TicketController.filteredCompanyTicketsList);
router.get('/get/ticket/comments/:tid', TicketController.displayTicketComments);
router.post('/get/tickets/:type/user', TokenAuth.UserAuth, ReportsController.getTicketsCreatedByUser);

//Tickets Priorities Routes
router.post('/create/new/ticketpriority/:companyId/:userId', TokenAuth.UserAuth, TicketPriortyController.createTicketPriority);
router.get('/get/all/company/ticketpriorities/:companyId', TokenAuth.UserAuth, TicketPriortyController.getAllTicketPriorities);
router.get('/get/company/ticketpriority/:tpId', TokenAuth.UserAuth, TicketPriortyController.getTicketPriorityData);
router.put('/update/company/ticketpriority/:tpId/', TokenAuth.UserAuth, TicketPriortyController.updateTicketPriority);

//UserRoles Routes
router.post('/create/new/user/role/:companyId/:userId', TokenAuth.UserAuth, UserRoleController.createUserRole);
router.get('/get/company/roles/:companyId', TokenAuth.UserAuth, UserRoleController.getCompanyRoles);
router.put('/update/company/role/permissions/:permissionId', TokenAuth.UserAuth, UserRoleController.updatePermissions);
router.get('/get/role/permissions/:permissionId', TokenAuth.UserAuth, UserRoleController.getRolePermissionsById);
router.get('/get/user/permissions/:userId', TokenAuth.UserAuth, UserRoleController.getUserPermissions);
router.get('/menu/create/permissions/:menuName', TokenAuth.UserAuth, UserRoleController.getMenuPermissions);

//Custom Form Routes
router.post('/create/new/custom/form', TokenAuth.UserAuth, CustomFormController.createCustomForm);
router.get('/get/company/custom/forms', TokenAuth.UserAuth, CustomFormController.getCompanyForms);
router.get('/get/custom/form/:formId', TokenAuth.UserAuth, CustomFormController.getFormById);
router.put('/update/custom/form/:formId', TokenAuth.UserAuth, CustomFormController.updateCustomForm);
router.get('/get/active/company/custom/forms/:companyId', TokenAuth.UserAuth, CustomFormController.getActiveCompanyForms);

//Ticket Images Routes
router.post('/upload/ticket/images/:companyId/:ticketId', TokenAuth.UserAuth, UploadController.uploadGroupwiseImages);
router.get('/display/ticket/images/:ticketId', TicketController.getTicketImagesById);
router.delete('/delete/ticket/image/:ticketId/:imageId', TokenAuth.UserAuth, TicketController.removeTicketImageById);

//Assets Images Routes
router.post('/upload/asset/images/:companyId/:assetId', UploadController.uploadGroupwiseAssetImages);
router.get('/display/asset/images/:assetId', AssetController.getAssetImagesById);
router.delete('/delete/asset/image/:assetId/:imageId', AssetController.removeAssetImageById);

//Assets Documents Routes
router.post('/upload/asset/documents/:companyId/:assetId', UploadController.uploadAssetDocuments);
router.get('/display/asset/documents/:assetId', AssetController.getAssetDocumentsById);
router.delete('/delete/asset/document/:assetId/:docId', AssetController.removeAssetDocumentById);

// CompanySubscription Routes - Newly created
router.post("/create/new/companySubscription", CompanySubscriptionController.createCompanySubscription);
router.get("/get/all/companySubscriptions/:companyId", CompanySubscriptionController.getAll);
router.get("/view/company/subscription/:companyId", CompanySubscriptionController.viewCompanySubscription);
router.get("/premium/upgrade/subscriptions", CompanySubscriptionController.premiumUpgradeSubscriptions);

//Dasboard Routes
router.get('/get/tickets/count/:companyId/:days', TokenAuth.UserAuth, DashboardController.TicketsCountController);
router.get('/get/dashboard/counts/:companyId', TokenAuth.UserAuth, DashboardController.AllDashboardCountController);

//Ticket Comments Images Routes
router.post('/upload/ticket/comments/images/:companyId/:ticketId', UploadController.uploadTicketCommentsImages);

// Paypal Routes
router.post("/upgrade/subscription", CompanySubscriptionController.subscrptionUpgrade);
router.post("/paypal/new/agreement/company/:companyId", PaymentController.createAgreement);
router.post("/paypal/execute/agreement/:companyId/:paytoken", PaymentController.executeAgreement);
router.get("/paypal/agreement/details/:agreementId", PaymentController.getAgreementDetails);
router.get("/paypal/agreement/transactions/:agreementId", PaymentController.listTransactions);
router.put("/paypal/agreement/suspend/:agreementId", PaymentController.suspendAgreement);
router.put("/paypal/reactivate/agreement/:agreementId", PaymentController.reActivateAgreement);
router.get("/list/company/subscprtion/invoices/:companyId", PaymentController.listInvoices);

// Company Store-Rooms Routes
router.post("/create/store/room/:companyId", TokenAuth.UserAuth, StoreRoomController.createNewStore);
router.get("/get/company/stores/:companyId", TokenAuth.UserAuth, StoreRoomController.companyStoresList);
router.put("/update/store/room/:storeId", TokenAuth.UserAuth, StoreRoomController.updateStoreRoomData);
router.get("/get/store/room/:id", TokenAuth.UserAuth, StoreRoomController.getStoreRoomData);

// Company Employees Routes
router.post("/create/company/employee/:companyId", TokenAuth.UserAuth, EmployeeController.createNewEmployee);
router.get("/get/company/employees/:companyId", TokenAuth.UserAuth, EmployeeController.companyEmployeesList);
router.put("/update/company/employee/:empId", TokenAuth.UserAuth, EmployeeController.updateEmployeeData);
router.get("/get/company/employee/:id", TokenAuth.UserAuth, EmployeeController.getSingleEmployeeData);

//Audit Routes 
router.post('/create/audit/:companyId', TokenAuth.UserAuth, AuditController.createNewAudit);
router.get('/get/all/company/audits/:companyId', TokenAuth.UserAuth, AuditController.companyAuditsList);
router.put('/update/company/audit/:auditId', TokenAuth.UserAuth, AuditController.updateAuditData);
router.get('/get/company/audit/:auditId', TokenAuth.UserAuth, AuditController.getAuditData);
router.get('/get/assetslist/audit/:auditId', TokenAuth.UserAuth, AuditController.getAssetListData);
router.post('/create/auditreport/:auditasset', TokenAuth.UserAuth, AuditController.createNewReport);
router.get('/get/audit/assets/:audit', TokenAuth.UserAuth, AuditAssetsController.getAuditAssetsList);
router.get('/get/category/wise/audit/assets/:audit', TokenAuth.UserAuth, AuditAssetsController.getAuditAssetsByVerificationStatus);

//Activity log
router.get('/get/activitylist/:Id', TokenAuth.UserAuth, AuditController.getAuditActivity);

//audit images
router.post('/upload/audits/images/:auditReoportId/:auditId', TokenAuth.UserAuth, UploadController.uploadAuditImages);

//New Permission API
router.post('/permission/changes', UserRoleController.permissionChanges);
router.get('/display/cron/activity', DashboardController.displayCronActivity);

//AssetPage Audit Log
router.post('/get/assets/auditlog/:assetId', TokenAuth.UserAuth, AssetController.getAssetsAuditDataLog);

// ------------------------------------------------

//User adding UserData
router.post("/add/newuser", UsersDataController.addingNewUser);
router.put('/update/userdata/:memberId', UsersDataController.updateUserDetails);
router.get('/display/userdata/:userId', UsersDataController.getOneUserData);
router.get('/all/usersdata', UsersDataController.getAllUsersData);
router.delete('/delete/userdata/:userId', UsersDataController.deleteUserData);

//UserRoles and permissions Routes
router.post('/create/new/user/role', UsersPermissionsController.createUserRole);
router.get('/get/company/roles', UsersPermissionsController.getCompanyRoles);
router.put('/update/role/permissions/:permissionId', UsersPermissionsController.updatePermissions);
router.get('/get/role/:permissionId', UsersPermissionsController.getOneRolePermissions);
// router.get('/get/user/permissions/:userId', TokenAuth.UserAuth, UsersPermissionsController.getUserPermissions);
// router.get('/menu/create/permissions/:menuName', TokenAuth.UserAuth, UsersPermissionsController.getMenuPermissions);

// ------------------------------------------------
//Reports APIs
router.post('/get/report/excel', TokenAuth.UserAuth, CronJobController.getAssetsDataReport);
router.post('/get/tickets/report/excel', TokenAuth.UserAuth, CronJobController.getTicketsDataReport);
router.post('/get/tickets/report/excel/:assignType', TokenAuth.UserAuth, CronJobController.getAssignedTicketsDataReport);
router.post('/get/assets/price/report', TokenAuth.UserAuth, ReportsController.getAssetsPriceReport);
router.post('/get/assets/report', TokenAuth.UserAuth, ReportsController.exportAssetsReport);
router.post('/get/asset/type/reports', TokenAuth.UserAuth, ReportsController.getAssetTypeReports);

module.exports = router;