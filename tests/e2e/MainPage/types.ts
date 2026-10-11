import { Product } from "../types";

interface Thread<T extends Product> {
  type: T;
}

interface Comments<T extends Product> {
  type: T;
}

interface GitHubThread extends Thread<"github"> {
  commentIds: number[];
}

interface GitHubComments extends Comments<"github"> {
  id: number;
  commentIds: number[];
}

interface GitLabThread extends Thread<"gitlab"> {
  id: string;
  noteIds: number[];
}

interface GitLabComments extends Comments<"gitlab"> {
  noteIds: string[];
}

type AzureDevOpsThread = Thread<"azure-devops">;

type AzureDevOpsComments = Thread<"azure-devops">;

type ThreadTypeByProduct = {
  github: GitHubThread;
  gitlab: GitLabThread;
  "azure-devops": AzureDevOpsThread;
};

export type ThreadMap = {
  [P in Product]: ThreadTypeByProduct[P];
};

type CommentsTypeByProduct = {
  github: GitHubComments;
  gitlab: GitLabComments;
  "azure-devops": AzureDevOpsComments;
};

export type CommentsMap = {
  [P in Product]: CommentsTypeByProduct[P];
};
