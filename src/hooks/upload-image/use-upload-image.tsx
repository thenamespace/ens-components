import { useCropImgContext } from "@/context/crop-image-context";
import { Web3Network } from "@/types";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useMainChain } from "..";

type useUploadImageHookTypes = {
    isPending: boolean,
    error: AxiosError | null,
    startUpload: (image: Blob | null, ensName: string, token: string) => void,
}

export const useUploadImage = (): useUploadImageHookTypes => {
    const { networkName } = useMainChain();
    const [isPending, setIsPending] = useState<boolean>(false);
    const [error, setError] = useState<AxiosError | null>(null);
    const [startUploading, setStartUploading] = useState<boolean>(false);
    const [imgBlob, setImgBlob] = useState<Blob | null>(null);
    const [ens, setEns] = useState<string | null>(null);
    const [token, setToken] = useState("");
    const {uploadedImgSrc, setUploadedImgSrc, imageCategory} = useCropImgContext();
    

    const startUpload = (image: Blob | null, ensName: string, token: string): void => {
        setImgBlob(image);
        setEns(ensName);
        setToken(token);
        setStartUploading(true);
    }

    useEffect(() => {
        if(startUploading) {
            uploadedImgSrc && setUploadedImgSrc("");
            error && setError(null);
            const formData = new FormData();
            token && formData.append('token', token);
            formData.append("network", networkName);
            imgBlob && formData.append('image', imgBlob);
            ens && formData.append('ensName', ens);
            imageCategory && formData.append('imageCategory', imageCategory);

            const postRequest = async () => {
                setIsPending(true);
                try {
                    const resp = await axios.post('/api/upload-image', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                          },
                    });
                    setUploadedImgSrc(resp.data.imageUrl);
                } catch (error) {
                    console.error(error);
                    if (axios.isAxiosError(error)) {
                        setError(error);
                    } else {
                        setError(new AxiosError("An unexpected error occurred."));
                    }
                } finally {
                    setIsPending(false);
                    setToken("");
                    setStartUploading(false);
                }
            }

            postRequest();
        }

    }, [startUploading])


    return {isPending, error, startUpload};
}
