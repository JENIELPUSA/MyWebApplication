import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import ResetPassword from "./ResetPassword";
import "./index.css"; // Import your Tailwind CSS here
import ForgotPassword from "./forgotpassword";
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
function App() {
  return (
    <AuthProvider>
      <DisplayMessageProvider>
      <MessagePostProvider>
        <AssignProvider>
          <FilterSpecificAssignProvider>
            <DisplayRequestProvider>
              <DepartmentDisplayProvider>
                <CategoryDisplayProvider>
                  <UserDisplayProvider>
                    <LaboratoryDisplayProvider>
                      <EquipmentDisplayProvider>
                        <AddAssignProvider>
                          <DeleteAssignProvider>
                            <EquipmentProvider>
                              <UserProvider>
                                <LaboratorytProvider>
                                  <BrowserRouter>
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

                                      <Route element={<PrivateRoute />}>
                                        <Route
                                          path="/dashboardfinal"
                                          element={<DashboardFinal />}
                                        />{" "}
                                        {/* No need for additional UserProvider here */}
                                        <Route
                                          path="/dashboardfinal/:laboratoryId"
                                          element={<DashboardFinal />}
                                        />{" "}
                                        {/* No need for additional UserProvider here */}
                                        <Route
                                          path="/Signupform/:id"
                                          element={<SignUpForm />}
                                        />
                                        <Route
                                          path="/Equipment"
                                          element={<EquipmentForm />}
                                        />
                                        <Route
                                          path="/department"
                                          element={<DepartmentContent />}
                                        />
                                        <Route
                                          path="/category"
                                          element={<CategoryContent />}
                                        />
                                        <Route
                                          path="/laboratory"
                                          element={<LaboratoryContent />}
                                        />
                                        <Route
                                          path="/LaboratoryAssign"
                                          element={<LaboratoryHome />}
                                        />
                                        <Route
                                          path="/RequestMaintenances"
                                          element={<RequestMaintenance />}
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
                  </UserDisplayProvider>
                </CategoryDisplayProvider>
              </DepartmentDisplayProvider>
            </DisplayRequestProvider>
          </FilterSpecificAssignProvider>
        </AssignProvider>
      </MessagePostProvider>
            
      </DisplayMessageProvider>
    </AuthProvider>
  );
}

export default App;
