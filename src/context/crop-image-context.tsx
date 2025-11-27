import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";
import { Area } from "react-easy-crop";

export type CropImgContextType = {
    newImgSrc: string;
    setNewImgSrc: Dispatch<SetStateAction<string>>;
    newCroppedImgSrc: string;
    setNewCroppedImgSrc: Dispatch<SetStateAction<string>>;
    croppedAreaPixels: Area;
    setCroppedAreaPixels: Dispatch<SetStateAction<Area>>;
    processingImg: boolean;
    setProcessingImg: Dispatch<SetStateAction<boolean>>;
    uploadedImgSrc: string;
    setUploadedImgSrc: Dispatch<SetStateAction<string>>;
    imageCategory: "avatar" | "header" | null;
    setImageCategory: Dispatch<SetStateAction<"avatar" | "header" | null>>;
    hideCoverUpload: boolean;
    setHideCoverUpload: Dispatch<SetStateAction<boolean>>;
    disableUploads: boolean;
    setDisableUploads: Dispatch<SetStateAction<boolean>>;
}

export const CropImgContext = createContext<CropImgContextType>({
    newImgSrc: "",
    setNewImgSrc: () => {},
    newCroppedImgSrc: "",
    setNewCroppedImgSrc: () => {},
    croppedAreaPixels: {width: 0, height: 0, x: 0, y: 0},
    setCroppedAreaPixels: () => {},
    processingImg: false,
    setProcessingImg: () => {},
    uploadedImgSrc: "",
    setUploadedImgSrc: () => {},
    imageCategory: null,
    setImageCategory: () => {},
    hideCoverUpload: false,
    setHideCoverUpload: () => {},
    disableUploads: false,
    setDisableUploads: () => {},
});

type CropImgContextProps = {
    children: ReactNode;
};

export const CropImgProvider: React.FC<CropImgContextProps> = ({ children }) => {
    const [newImgSrc, setNewImgSrc] = useState<string>("");
    const [newCroppedImgSrc, setNewCroppedImgSrc] = useState<string>("");
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>({width: 0, height: 0, x: 0, y: 0});
    const [processingImg, setProcessingImg] = useState<boolean>(false);
    const [uploadedImgSrc, setUploadedImgSrc] = useState<string>("");
    const [imageCategory, setImageCategory] = useState<"avatar" | "header" | null>(null);
    const [hideCoverUpload, setHideCoverUpload] = useState<boolean>(false);
    const [disableUploads, setDisableUploads] = useState<boolean>(false);

    return (
      <CropImgContext.Provider value={{ 
        newImgSrc, setNewImgSrc, 
        newCroppedImgSrc, setNewCroppedImgSrc, 
        croppedAreaPixels, setCroppedAreaPixels,
        uploadedImgSrc, setUploadedImgSrc,
        imageCategory, setImageCategory,
        hideCoverUpload, setHideCoverUpload,
        disableUploads, setDisableUploads,
        processingImg, setProcessingImg,
      }}>
        {children}
      </CropImgContext.Provider>
    );
  };

export const useCropImgContext = () => useContext(CropImgContext);
