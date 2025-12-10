import {
    offAvatarUpdated,
    offCoverUpdated,
    onAvatarUpdated,
    onCoverUpdated,
} from "@/utils/image-event-emitter";
import { useEffect, useState } from "react";

export const useReRenderImage = (imageType: "avatar" | "cover") => {
    const [reRenderImage, setReRenderImage] = useState(false);
    useEffect(() => {
        const handleUpdate = () => {
            setReRenderImage((prevState) => !prevState);
        };

        imageType === "avatar"
            ? onAvatarUpdated(handleUpdate)
            : onCoverUpdated(handleUpdate);

        return () => {
            imageType === "avatar"
                ? offAvatarUpdated(handleUpdate)
                : offCoverUpdated(handleUpdate);
        };
    }, []);
};
