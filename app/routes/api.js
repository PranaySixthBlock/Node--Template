var router = express.Router();
var AuthController = require('../controllers/AuthController');
var UserController = require('../controllers/UserController');
var MenuController = require('../controllers/MenuController');
var SubscriptionController = require('../controllers/SubscriptionController');
var CompanyController = require('../controllers/CompanyController');
var PaymentController = require('../controllers/PaymentController');
var DashboardController = require('../controllers/DashboardController');
var TokenAuth = require('../middlewares/tokenAuthentication');
var CompanySubscriptionController = require('../controllers/CompanySubscriptionController');
var AdminActivityLogController = require('../controllers/AdminActivityLogController');
var AdminPaymentReportController = require('../controllers/AdminPaymentReportsController');

router.post("/admin/user/authenticate", AuthController.token)

router.get("/user/:userId", TokenAuth, UserController.getOneUser);
router.get("/all/users", TokenAuth, UserController.getUsers);
router.post("/add/user", UserController.createNew);
router.put("/update/user/:userId", TokenAuth, UserController.updateUser);
router.put("/update/user/status/:userId", TokenAuth, UserController.destroy);

// Menu Routes
router.get("/all/menus",  MenuController.getAllDropDowns);
router.get("/menu/:menuId", MenuController.getDropDown);
router.post("/create/menu", MenuController.createNew);
router.put("/update/menu/:menuId", MenuController.updateDropDown);
router.put("/menu/status/update/:menuId", MenuController.dropdownInactive);

// Subscription Routes
router.get("/all/subscriptions", TokenAuth, SubscriptionController.getAll);
router.get("/subscription/:subId", TokenAuth, SubscriptionController.getSubscription);
router.post("/create/new/subscription", TokenAuth, SubscriptionController.createSubscription);
router.put("/subscription/update/:subId", TokenAuth, SubscriptionController.subscriptionUpdate);
router.put("/subscription/status/update/:subId", TokenAuth, SubscriptionController.changeStatus);

// Company Routes
router.get("/company/details/:companyId", TokenAuth.UserAdmin_Auth, CompanyController.getCompanyById);
router.get("/list/all/company", TokenAuth, CompanyController.listCompanies);
router.post("/company/edit/user/status/:contactId", TokenAuth, CompanyController.changeContactStatus);
router.post("/company/edit/:companyId", TokenAuth, CompanyController.updateCompany);
router.get("/get/company/subscriptions/:companyId", TokenAuth, CompanySubscriptionController.getAll);
router.get("/get/company/invoices/:companyId", PaymentController.listInvoices);

// Paypal Plans Routes
router.post("/create/new/paypal/plan/subscription/:id", PaymentController.createPlan);
router.get("/paypal/plan/detailed/:BillingId", PaymentController.getPlanDetils);
router.post("/activate/paypal/plan/:BillingId", PaymentController.activatePlan);

// Dashboard Routes
router.get("/dashboard/counts", DashboardController.adminDashboardCounts);

// Activity Log Routes
router.get("/get/admin/activity/log", TokenAuth, AdminActivityLogController.getAdminActivityLog);
router.get("/get/user/activity/log", TokenAuth, AdminActivityLogController.getUserActivityLog);

// Payments Reports Routes
router.get("/get/all/invoices", TokenAuth, AdminPaymentReportController.getAllInvoices);
router.get("/get/all/transcations", TokenAuth, AdminPaymentReportController.getAllTransactions);
router.post("/get/filtered/transcations",  AdminPaymentReportController.getFilteredTransactions);

module.exports = router;
