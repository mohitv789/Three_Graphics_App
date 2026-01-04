export type Operation =
  | AddObjectOp
  | UpdateObjectOp
  | DeleteObjectOp;

export interface AddObjectOp {
  type: 'add_object';
  objectId: string;
  payload: any;
}

export interface UpdateObjectOp {
  type: 'update_object';
  objectId: string;
  payload: Partial<any>;
}

export interface DeleteObjectOp {
  type: 'delete_object';
  objectId: string;
}
