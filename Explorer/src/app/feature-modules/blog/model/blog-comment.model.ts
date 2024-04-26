export interface BlogComment {
    id?: string;
    userId : number;
    username: string;
    text: string;
    creationTime : Date;
    lastModification : Date;
}