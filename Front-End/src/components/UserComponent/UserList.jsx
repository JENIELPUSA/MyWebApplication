import React, { useState, useEffect, useContext } from "react";
import { UserDataContext } from "../../contexts/UserContext/UserContext";
import UserTable from "../../components/USER/UserTable";

function UserForm() {
    // Use the context functions directly
    return (
        <div className="flex-1 p-4 overflow-hidden">
            <div className="h-full w-full">
                <UserTable/>
            </div>
        </div>
    );
}

export default UserForm;