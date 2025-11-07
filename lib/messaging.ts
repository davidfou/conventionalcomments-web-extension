import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  getRegisteredUrls(): string[];
  registerUrl(url: string): void;
  unregisterUrl(url: string): void;
  getAnnouncements(): string[];
  markAnnoucementAsRead(announcement: string): void;
  notifyUnregister(tabId: number): void;
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
