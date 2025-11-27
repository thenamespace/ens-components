import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";

export type EditProfileStepsType = ["profile", "crop-image", "upload-image"];

export type EditProfileContextType = {
    step: "profile" | "crop-image" | "upload-image";
    setStep: Dispatch<SetStateAction<"profile" | "crop-image" | "upload-image">>;
};

export const EditProfileContext = createContext<EditProfileContextType>({
    step: "profile",
    setStep: () => {},
});

type EditProfileProviderProps = {
    children: ReactNode;
};

export const EditProfileProvider: React.FC<EditProfileProviderProps> = ({ children }) => {
    const [step, setStep] = useState<"profile" | "crop-image" | "upload-image">("profile");
    
    return (
      <EditProfileContext.Provider value={{ step, setStep }}>
        {children}
      </EditProfileContext.Provider>
    );
  };

export const useEditProfileContext = () => useContext(EditProfileContext);
