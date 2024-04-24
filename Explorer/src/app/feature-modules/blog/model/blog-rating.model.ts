export interface Rating {
    id? : string;
    isUpvote : boolean;
    userId : number;
    creationTime: Date;
}