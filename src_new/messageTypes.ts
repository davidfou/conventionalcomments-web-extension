export interface GetRegisteredUrlsMessage {
  type: "get-registered-urls";
}

export interface GetRegisteredUrlsResponseMessage {
  urls: string[];
}

export interface RegisterUrlMessage {
  type: "register-url";
  url: string;
}

export type RegisterUrlResponseMessage = undefined;

export interface UnregisterUrlMessage {
  type: "unregister-url";
  url: string;
}

export type UnregisterUrlResponseMessage = undefined;

export interface GetAnnouncementsMessage {
  type: "get-announcements";
}

export interface RemoveAnnouncementMessage {
  type: "remove-announcement";
  announcement: string;
}

export type RemoveAnnouncementResponseMessage = undefined;

export interface GetAnnouncementsResponseMessage {
  announcements: string[];
}

export interface NotifyUnregisterMessage {
  type: "notify-unregister";
}

export type BackgroundRequestMessage =
  | GetRegisteredUrlsMessage
  | RegisterUrlMessage
  | UnregisterUrlMessage
  | GetAnnouncementsMessage
  | RemoveAnnouncementMessage;

export type BackgroundResponseMessage =
  | GetRegisteredUrlsResponseMessage
  | RegisterUrlResponseMessage
  | UnregisterUrlResponseMessage
  | GetAnnouncementsResponseMessage
  | RemoveAnnouncementResponseMessage;

export type ContentRequestMessage = NotifyUnregisterMessage;
