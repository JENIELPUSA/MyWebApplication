import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import ResetPassword from "./components/ResetPassword/ResetPassword.jsx";
import "./index.css"; // Import your Tailwind CSS here
import ForgotPassword from "./ForgotPassword.jsx";
import UserForm from "./UserForm";
import DashboardFinal from "./DashboardFinal";
import SignUpForm from "./components/USER/SignUpForm";
import { LaboratorytProvider, UserProvider } from "./components/CountContext"; // Import UserProvider
import EquipmentForm from "./EquipmentForm";
import LaboratoryHome from "./LaboratoryHome";
import DepartmentContent from "./DepartmentContent";
import CategoryContent from "./CategoryContent";
import LaboratoryContent from "./LaboratoryContent";
import { EquipmentProvider } from "./components/CountContext"; // Import EquipmentProvider
import { AssignProvider } from "./components/Context/DisplayAssignContext.jsx";
import { DeleteAssignProvider } from "./components/CountContext";
import { AddAssignProvider } from "./components/Context/AssignContext/AddAssignContext.jsx";
import { EquipmentDisplayProvider } from "./components/Context/EquipmentContext/DisplayContext.jsx";
import { LaboratoryDisplayProvider } from "./components/Context/Laboratory/Display.jsx";
import { UserDisplayProvider } from "./components/Context/User/DisplayUser.jsx";
import { CategoryDisplayProvider } from "./components/Context/Category/Display.jsx";
import { DepartmentDisplayProvider } from "./components/Context/Department/Display.jsx";
import RequestMaintenance from "./RequestMaintenance"; // Named import
import PrivateRoute from "../../Front-End/src/components/PrivateRoute.jsx";
import { AuthProvider } from "./components/Context/AuthContext.jsx";
import { DisplayRequestProvider } from "./components/Context/MaintenanceRequest/DisplayRequest.jsx";
import { FilterSpecificAssignProvider } from "./components/Context/AssignContext/FilterSpecificAssign.jsx";
import { MessagePostProvider } from "./components/Context/MessageContext/POSTmessage.jsx";
import { DisplayMessageProvider } from "./components/Context/MessageContext/DisplayMessgae.jsx";
import { ModalProvider } from "./components/Context/ModalContex/modaleffect.jsx";
import { AddEmailProvider } from "./components/Context/EmailContext/SendNotificationContext.jsx";
import { AddTypeMaintenanceProvider } from "./components/Context/TypesofMainten/addmaintenance.jsx";
import { SchedDisplayProvider } from "./components/Context/TypesOfSchedContext.jsx";
import SocketListener from "./components/SocketListener.jsx";
import { IncomingDisplayProvider } from "./components/Context/ProcessIncomingRequest/IncomingRequestContext.jsx";
import { AuthContext } from "./components/Context/AuthContext.jsx";
import { useContext, useEffect } from "react";
function App() {
const {logout}=useContext(AuthContext)
  useEffect(() => {
    // Set up axios interceptor
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          // Token expired or invalid, call logout
          logout();
        }
        return Promise.reject(error);
      }
    );

    // Cleanup the interceptor when the component unmounts
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  return (
    <AuthProvider>
     
        <SchedDisplayProvider>
          <ModalProvider>
            <AddTypeMaintenanceProvider>
              <DisplayMessageProvider>
                <MessagePostProvider>
                  <AssignProvider>
                    <FilterSpecificAssignProvider>
                      <UserDisplayProvider>
                        <AddEmailProvider>
                          <DisplayRequestProvider>
                          <IncomingDisplayProvider>
                            <DepartmentDisplayProvider>
                              <CategoryDisplayProvider>
                                <LaboratoryDisplayProvider>
                                  <EquipmentDisplayProvider>
                                    <AddAssignProvider>
                                      <DeleteAssignProvider>
                                        <EquipmentProvider>
                                          <UserProvider>
                                            <LaboratorytProvider>
                                              <BrowserRouter>
                                                <SocketListener />
                                                <Routes>
                                                  <Route
                                                    path="/login"
                                                    element={<Login />}
                                                  />
                                                  <Route
                                                    path="/User"
                                                    element={<UserForm />}
                                                  />
                                                  <Route
                                                    path="/forgot-password"
                                                    element={<ForgotPassword />}
                                                  />
                                                  <Route
                                                    path="/reset_password/:token"
                                                    element={<ResetPassword />}
                                                  />

                                                  <Route
                                                    element={<PrivateRoute />}
                                                  >
                                                    <Route
                                                      path="/dashboardfinal"
                                                      element={
                                                        <DashboardFinal />
                                                      }
                                                    />{" "}
                                                    {/* No need for additional UserProvider here */}
                                                    <Route
                                                      path="/dashboardfinal/:laboratoryId"
                                                      element={
                                                        <DashboardFinal />
                                                      }
                                                    />{" "}
                                                    {/* No need for additional UserProvider here */}
                                                    <Route
                                                      path="/Signupform/:id"
                                                      element={<SignUpForm />}
                                                    />
                                                    <Route
                                                      path="/Equipment"
                                                      element={
                                                        <EquipmentForm />
                                                      }
                                                    />
                                                    <Route
                                                      path="/department"
                                                      element={
                                                        <DepartmentContent />
                                                      }
                                                    />
                                                    <Route
                                                      path="/category"
                                                      element={
                                                        <CategoryContent />
                                                      }
                                                    />
                                                    <Route
                                                      path="/laboratory"
                                                      element={
                                                        <LaboratoryContent />
                                                      }
                                                    />
                                                    <Route
                                                      path="/LaboratoryAssign"
                                                      element={
                                                        <LaboratoryHome />
                                                      }
                                                    />
                                                    <Route
                                                      path="/RequestMaintenances"
                                                      element={
                                                        <RequestMaintenance />
                                                      }
                                                    />
                                                  </Route>
                                                </Routes>
                                              </BrowserRouter>
                                            </LaboratorytProvider>
                                          </UserProvider>
                                        </EquipmentProvider>
                                      </DeleteAssignProvider>
                                    </AddAssignProvider>
                                  </EquipmentDisplayProvider>
                                </LaboratoryDisplayProvider>
                              </CategoryDisplayProvider>
                            </DepartmentDisplayProvider>
                            </IncomingDisplayProvider>
                          </DisplayRequestProvider>
                        </AddEmailProvider>
                      </UserDisplayProvider>
                    </FilterSpecificAssignProvider>
                  </AssignProvider>
                </MessagePostProvider>
              </DisplayMessageProvider>
            </AddTypeMaintenanceProvider>
          </ModalProvider>
        </SchedDisplayProvider>
      
    </AuthProvider>
  );
}

export default App;
