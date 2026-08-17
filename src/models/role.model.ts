import {Schema, model, Document, Types} from 'mongoose';

export interface IRole extends Document {
    _id: Types.ObjectId;
    role: string;
    description?:  string;
    active: boolean;
}

const RoleSchema = new Schema<IRole>({
    role: {type: String, required: true, unique: true},
    description: {type: String},
    active: {type: Boolean, default: true}
},{
    collection: 'roles',
    timestamps: true
});

export default model<IRole>("Role", RoleSchema);