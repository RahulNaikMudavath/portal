import { createContext, useContext, useState } from "react";

const WorkRequestContext = createContext();

export const WorkRequestProvider = ({ children }) => {

    const [draftRequest, setDraftRequest] = useState(null);

    return (

        <WorkRequestContext.Provider
            value={{
                draftRequest,
                setDraftRequest
            }}
        >

            {children}

        </WorkRequestContext.Provider>

    );

};

export const useWorkRequest = () => useContext(WorkRequestContext);