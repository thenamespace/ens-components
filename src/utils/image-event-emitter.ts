import { EventEmitter } from "events";

const eventEmitter = new EventEmitter();
export const AVATAR_UPDATED = "avatarUpdated";
export const COVER_UPDATED = "coverUpdated";

export const notifyAvatarUpdated = () => eventEmitter.emit(AVATAR_UPDATED);
export const onAvatarUpdated = (callback: () => void) => {
  eventEmitter.on(AVATAR_UPDATED, callback);
};
export const offAvatarUpdated = (callback: () => void) => {
  eventEmitter.off(AVATAR_UPDATED, callback);
};

export const notifyCoverUpdated = () => eventEmitter.emit(COVER_UPDATED);
export const onCoverUpdated = (callback: () => void) => {
  eventEmitter.on(COVER_UPDATED, callback);
};
export const offCoverUpdated = (callback: () => void) => {
  eventEmitter.off(COVER_UPDATED, callback);
};