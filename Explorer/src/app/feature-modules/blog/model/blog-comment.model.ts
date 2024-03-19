export interface BlogComment {
    id?: number;
    userId : number;
    username: string;
    blogId : string;
    text: string;
    creationTime : Date;
    lastModification : Date;
}