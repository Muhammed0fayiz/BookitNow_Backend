import { FavoriteDocument } from "../../../../infrastructure/models/FavoriteScema";
import { UpcomingEventDocument } from "../../../../domain/entities/upcomingevent";
import { BookingDocument } from "../../../../infrastructure/models/bookingEvents";
import { getNameOfJSDocTypedef } from "typescript";
import { OtpUser } from "../../../../domain/entities/otpUser";
import { User, UserDocument } from "../../../../domain/entities/user";
import { checkOtp } from "../../../../domain/entities/checkOtp";
import {
  TempPerformer,
  TempPerformerDocument,
} from "../../../../domain/entities/tempPerformer";
import { UserDocuments } from "../../../../infrastructure/models/userModel";
import mongoose from "mongoose";
import { EventDocument } from "../../../../infrastructure/models/eventsModel";
import { Performer } from "../../../../domain/entities/performer";
import { WalletDocument } from "../../../../infrastructure/models/walletHistory";
import { ChatRoomDocument } from "../../../../infrastructure/models/chatRoomModel";
import { MessageDocument } from "../../../../infrastructure/models/messageModel";
import { ChatRoom } from "../../../../domain/entities/chatRoom";
import { MessageNotification } from "../../../../domain/entities/messageNotification";
import {  eventRating } from "../../../../domain/entities/eventRating";
export interface IuserEventUseCase {


 

  getAllEvents(id: mongoose.Types.ObjectId): Promise<EventDocument[] | null>;

  userBookEvent(
    formData: Record<string, any>,
    eventId: string,
    performerId: string,
    userId: string
  ): Promise<BookingDocument | null>;
  getAllUpcomingEvents(
    id: mongoose.Types.ObjectId
  ): Promise<{ totalCount: number; upcomingEvents: UpcomingEventDocument[] }>;
  cancelEvent(id: mongoose.Types.ObjectId): Promise<BookingDocument | null>;
  getUpcomingEvents(
    userId: mongoose.Types.ObjectId,
    page: number
  ): Promise<UpcomingEventDocument[]>;
  getAllEventHistory(id: mongoose.Types.ObjectId): Promise<{
    totalCount: number;
    pastEventHistory: UpcomingEventDocument[];
  }>;
  getEventHistory(
    userId: mongoose.Types.ObjectId,
    page: number
  ): Promise<{
    pastEventHistory: UpcomingEventDocument[];
  }>;
  getFilteredEvents(
    id: mongoose.Types.ObjectId,
    filterOptions: any,
    sortOptions: any,
    skip: number,
    limit: number
  ): Promise<{ events: EventDocument[]; totalCount: number } | null>;
  ratingAdded(
    bookingId: mongoose.Types.ObjectId,
    rating: number,
    review: string
  ): Promise<EventDocument | null>;
  getEventRating(eventId:mongoose.Types.ObjectId):Promise<eventRating[]|null>
  favaroiteEvents(
    id: mongoose.Types.ObjectId
  ): Promise<{ totalEvent: number; events: EventDocument[] | null }>;
  toggleFavoriteEvent(
    uid: mongoose.Types.ObjectId,
    eid: mongoose.Types.ObjectId
  ): Promise<FavoriteDocument | null>;
  userWalletBookEvent(
    formData: Record<string, any>,
    eventId: string,
    performerId: string,
    userId: string
  ): Promise<BookingDocument | null>;

  getAllPerformer(id: mongoose.Types.ObjectId): Promise<Performer[] | null>;
  availableDate(
    formData: Record<string, any>,
    eventId: string,
    performerId: string
  ): Promise<boolean>;
  getFilteredPerformers(
    id: mongoose.Types.ObjectId,
    filterOptions: any,
    sortOptions: any,
    skip: number,
    limit: number
  ): Promise<{ performers: Performer[]; totalCount: number } | null>;
  getTopRatedEvent(userId:mongoose.Types.ObjectId):Promise<EventDocument[]|null >

}
