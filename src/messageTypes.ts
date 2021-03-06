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

export interface UnregisterUrlMessage {
  type: "unregister-url";
  url: string;
}

export interface GetAnnouncementsMessage {
  type: "get-announcements";
}

export interface RemoveAnnouncementMessage {
  type: "remove-announcement";
  announcement: string;
}

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

export type ContentRequestMessage = NotifyUnregisterMessage;
