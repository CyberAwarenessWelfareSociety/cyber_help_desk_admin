import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Signup from "./pages/Auth/Signup";
import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import ApiKeyAccess from "./pages/APIKey/ApiKey";
import GetClients from "./pages/APIKey/getClients";
import ForgotPassword from "./pages/Auth/ForgetPassword";
import UpdatePassword from "./pages/Auth/UpdatePassword";
import ClientPayment from "./pages/APIKey/ClientPayment";
import ClientWallets from "./pages/APIKey/ClientWallet";
import ApiHitBalance from "./pages/APIKey/ApiHitBalance";
import ApiUsesLog from "./pages/APIKey/ApiUsesLog";
import Banners from "./pages/APIKey/Banner/Banners";
import Announcement from "./pages/APIKey/Announcement/Announcement";
import ApiKeys from "./pages/APIKey/ApiKeys";
import ApiHitLogs from "./pages/APIKey/ApiHitLogs";
import OverRidePrice from "./pages/OverRidePrice/OverRidePrice";
import VandorOutStanding from "./pages/APIKey/VandorOutStanding";
import VandorPayment from "./pages/APIKey/VandorPayment";
import CustomerVerification from "./pages/CustomerVerfication/CustomerVerification";
import Aadhar from "./pages/APIKey/Aadhar/Aadhar";
import Pan from "./pages/APIKey/PAN/Pan";
import Ration from "./pages/APIKey/Ration/Ration";
import Other from "./pages/APIKey/Others/Other";
import LogoutModal from "./pages/Auth/LogoutModal";
import AdminLayout from "./layout/AdminLayout/AdminLayout";
import BackgroundCheck from "./pages/BackgroundCheck/BackgroundCheck";
import Tracking from "./pages/APIKey/Tracking/Tracking";
import Mobile from "./pages/Mobile/Mobile";
import UnAuthorized from "./pages/Auth/UnAuthorized";
import { ROLES } from "./constants/Role";
import PrivateRoute from "./layout/PrivateRoute";
import MobileSuperior from "./pages/MobileSuperior/MobileSuperior";
import DigitalFootPrint from "./pages/DigitalFootPrint/DigitalFootPrint";
import BankVPACredit from "./pages/BankVPACredit/BankVPACredit";
import WhatsAppGmailCheck from "./pages/WhatsAppGmailCheck/WhatsAppGmailCheck";
import VehicleMobile from "./pages/VehicleMobile/VehicleMobile";
import UAN from "./pages/UAN/UAN";
import ClientPayments from "./pages/APIKey/Client_Payment";
import Client_Wallet from "./pages/APIKey/Client-wallet";
import ApiLogs from "./pages/APIKey/api-logs";
import Apilogs from "./pages/APIKey/Apilogs";
import Profile from "./pages/APIKey/profile";
import WalletBalance from "./pages/APIKey/Wallet-balance";
import ClientApiKeyAccess from "./pages/APIKey/Client-Api-key-Access";
import OtherVehicle from "./pages/APIKey/OtherVehicle/OtherVehicle";
import MCAServices from "./pages/APIKey/company-background/OtherVehicle";
import SearchByAadharModal from "./pages/searchBy/Aadhar/SearchByAadhar";
import SearchByPan from "./pages/searchBy/PAN/Pan";
import SearchByMobile from "./pages/searchBy/Mobile/Mobile";
import SearchByVehicle from "./pages/searchBy/Tracking/Tracking";
import Gallery from "./pages/gallery/Gallery";
import Complain from "./pages/APIKey/complain/Complain";
import GroundVerification from "./pages/groundVerification/GroundVerification";
import Course from "./pages/APIKey/Course";
import Class from "./pages/APIKey/Class";
import Enrollment from "./pages/APIKey/Enrollment";
import GetClassQuestions from "./pages/GetClassQuestions";
import GetClassMaterials from "./pages/GetClassMaterials";
import ClassQuizStats from "./pages/Answer";
import Video from "./pages/Video/Video";
import Notification from "./pages/notification/page";
import SendNotification from "./pages/notification/page";
import AppVersion from "./pages/appVersion/AppVersion";
import MissingMobile from "./pages/missingReport/Mobile";
import DeadBody from "./pages/missingReport/DeadBody";
import MissingPerson from "./pages/missingReport/missingPerson";
import MissingVehicle from "./pages/missingReport/MissingVehicle";
import UnclaimedVehicle from "./pages/missingReport/UnclaimedVehicle";
import AccidentVehicle from "./pages/missingReport/AccidentVehicle";
import UnclaimedSeizedVehicles from "./pages/missingReport/UnclaimedVehicle";
import InsuranceCRUD from "./pages/insurance";
import GetCyberFrauds from "./pages/cyberFraud/CyberFraud";
import GetBlackmails from "./pages/blackMail/BlackMail";
import GetContentTakedowns from "./pages/contentTakedown/ContentTakedown";
import GetVolunteers from "./pages/Volunteer/Volunteer";
import GetAccountFreezes from "./pages/AccountFreeze/AccountFreeze";
import BulkCheckClients from "./pages/BulkCheckClients/index";
import BulkCheckLogs from "./pages/BulkCheckClients/logs";
import FaceMatching from "./pages/FaceMatching/FaceMatching";
function App() {
  return (
    <Router>
      {/* <Toaster position="top-right" reverseOrder={false}/> */}
      <Routes>
        {/* Public routes */}
        {/* Public routes - only accessible when not logged in */}
        <Route element={<PrivateRoute isPublic />}>
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route
          element={
            <PrivateRoute
              allowedRoles={[ROLES.ADMIN, ROLES.POLICE, ROLES.USER]}
            />
          }
        >
          {/* <Route path="/api-logs" element={<ApiLogs />} /> */}
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/api-key-access" element={<ApiKeyAccess />} />
            <Route
              path="/client-api-key-access"
              element={<ClientApiKeyAccess />}
            />
            <Route path="/mobile-missing-report" element={<MissingMobile />} />
            <Route path="/dead-body-reports" element={<DeadBody />} />
            <Route path="/missing-person" element={<MissingPerson />} />
            <Route path="/insurance" element={<InsuranceCRUD />} />
            <Route path="/missing-vehicle" element={<MissingVehicle />} />
            <Route
              path="/unclaimed-vehicle"
              element={<UnclaimedSeizedVehicles />}
            />
              <Route path="/bulkcheck-logs" element={<BulkCheckLogs />} />
            <Route path="/accident-vehicle" element={<AccidentVehicle />} />
            <Route path="/complain" element={<Complain />} />
            <Route path="/banners" element={<Banners />} />
            <Route path="/api-logs" element={<Apilogs />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wallet-balance" element={<WalletBalance />} />
            <Route path="/announcement" element={<Announcement />} />
            <Route path="/get-all-clients" element={<GetClients />} />
              <Route path="/bulkcheck" element={<BulkCheckClients />} />
            <Route path="/client-wallet" element={<Client_Wallet />} />
            <Route path="/client-payment" element={<ClientPayment />} />
            <Route path="/cyberfraud" element={<GetCyberFrauds />} />
            <Route path="/blackmail" element={<GetBlackmails />} />
            <Route path="/content-takedown" element={<GetContentTakedowns />} />
            <Route path="/face-matching" element={<FaceMatching />} />
              <Route path="/accountfreeze" element={<GetAccountFreezes />} />
                     <Route path="/volunteer" element={<GetVolunteers />} />
            {/* <Route path="/get-client-payment" element={<ClientPayment />} /> */}
            <Route path="/payments" element={<ClientPayment />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/get-client-wallet" element={<ClientWallets />} />
            <Route path="/get-api-hit" element={<ApiHitBalance />} />
            {/* <Route path="/get-apiUses-log" element={<ApiUsesLog />} /> */}
            <Route path="/override-price" element={<OverRidePrice />} />
            <Route path="/course" element={<Course />} />
            <Route path="/app-version" element={<AppVersion />} />
            <Route path="/set-question/:id" element={<GetClassQuestions />} />
            <Route
              path="/class-materials/:id"
              element={<GetClassMaterials />}
            />
            <Route path="/class/:id" element={<Class />} />
            <Route path="/video/:classId" element={<Video />} />
            <Route path="/send-notification" element={<SendNotification />} />
            <Route path="/answer/:id" element={<ClassQuizStats />} />
            <Route path="/enrollment/:id" element={<Enrollment />} />
            <Route path="/aadhar" element={<Aadhar />} />
            <Route path="/pan" element={<Pan />} />
            <Route path="/ration" element={<Ration />} />
            <Route path="/other" element={<Other />} />
            <Route path="/api-logs" element={<ApiLogs />} />
            <Route path="/logout" element={<LogoutModal />} />
            <Route path="/company-background-check" element={<MCAServices />} />
            <Route path="/background-check" element={<BackgroundCheck />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/mobile" element={<Mobile />} />
            <Route path="/mobile-superior" element={<MobileSuperior />} />
            <Route path="/digital-footprint" element={<DigitalFootPrint />} />
            <Route path="/bankVpa-credit" element={<BankVPACredit />} />
            <Route
              path="/whatsapp-gmail-check"
              element={<WhatsAppGmailCheck />}
            />
            <Route path="/multiple-vehicle" element={<VehicleMobile />} />
            <Route path="/uan" element={<UAN />} />
            <Route path="/search-by-aadhar" element={<SearchByAadharModal />} />
            <Route path="/search-by-pan" element={<SearchByPan />} />
            <Route path="search-by-mobile" element={<SearchByMobile />} />
            <Route path="search-by-vehicle" element={<SearchByVehicle />} />
            {/* ------------------------ Static Part As Per Figma ----------------------------------  */}

            <Route path="/client-api-hit" element={<ApiHitBalance />} />
            <Route path="/api-keys" element={<ApiKeys />} />
            <Route path="/other-vehicle" element={<OtherVehicle />} />
            {/* <Route path="/api-hit-logs" element={<ApiHitLogs />} /> */}
            <Route path="/api-hit-logs" element={<ApiUsesLog />} />
            <Route
              path="/ground-verification"
              element={<GroundVerification />}
            />
            {/* <Route path="/api-hit-logs" element={<ApiHitLogs />} /> */}

            <Route
              path="/vandor-out-standing"
              element={<VandorOutStanding />}
            />
            <Route path="/vandor-payment" element={<VandorPayment />} />
            {/* <Route
              path="/customer-verification"
              element={<CustomerVerification />}
            /> */}
          </Route>
        </Route>

        <Route element={<PrivateRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route element={<Layout />}>
            {/* <Route path="/admin-dashboard" element={<Dashboard />} /> */}
          </Route>
        </Route>

        <Route path="/unauthorized" element={<UnAuthorized />} />

        {/* <Route element={<AdminLayout />}>
          <Route path="/admin-dashboard" element={<Dashboard />} />
        </Route> */}

        {/* ----------------Admin Routes----------- */}
      </Routes>
    </Router>
  );
}

export default App;
