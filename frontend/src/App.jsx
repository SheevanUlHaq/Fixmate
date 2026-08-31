import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RequestDetails from "./pages/RequestDetails";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import EmployeeDashboard from "./pages/employee/Dashboard";
import EmployeeRequests from "./pages/employee/Requests";
import CreateRequest from "./pages/employee/CreateRequest";
import TechnicianDashboard from "./pages/technician/Dashboard";
import TechnicianRequests from "./pages/technician/Requests";
import TechnicianProfile from "./pages/technician/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminRequests from "./pages/admin/Requests";
import Technicians from "./pages/admin/Technicians";
import Users from "./pages/admin/Users";
import NotFound from "./pages/NotFound";

export default function App(){
 return <AuthProvider><BrowserRouter><Routes>
   <Route path="/" element={<Landing/>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/>
   <Route element={<ProtectedRoute/>}><Route element={<AppLayout/>}>
     <Route path="/request/:id" element={<RequestDetails/>}/><Route path="/notifications" element={<Notifications/>}/><Route path="/profile" element={<Profile/>}/>
     <Route element={<ProtectedRoute roles={["employee"]}/>}><Route path="/employee" element={<EmployeeDashboard/>}/><Route path="/employee/requests" element={<EmployeeRequests/>}/><Route path="/employee/create" element={<CreateRequest/>}/></Route>
     <Route element={<ProtectedRoute roles={["technician"]}/>}><Route path="/technician" element={<TechnicianDashboard/>}/><Route path="/technician/requests" element={<TechnicianRequests/>}/><Route path="/technician/profile" element={<TechnicianProfile/>}/></Route>
     <Route element={<ProtectedRoute roles={["admin"]}/>}><Route path="/admin" element={<AdminDashboard/>}/><Route path="/admin/requests" element={<AdminRequests/>}/><Route path="/admin/technicians" element={<Technicians/>}/><Route path="/admin/users" element={<Users/>}/></Route>
   </Route></Route>
   <Route path="*" element={<NotFound/>}/>
 </Routes><Toaster position="top-right"/></BrowserRouter></AuthProvider>;
}
