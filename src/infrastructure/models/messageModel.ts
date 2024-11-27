import mongoose, { Schema, Document, Types } from 'mongoose';

export interface MessageDocument extends Document {
  roomId: Types.ObjectId; 
  senderId: Types.ObjectId; 
  message: string; 
  timestamp: Date; 
}

const MessageSchema: Schema<MessageDocument> = new Schema(
  {
    roomId: { type: Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }, 
  },
  { timestamps: true } 
);

export const MessageModel = mongoose.model<MessageDocument>('Message', MessageSchema);
