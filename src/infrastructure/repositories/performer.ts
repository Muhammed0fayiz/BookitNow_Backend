 import { PerformerDocuments, PerformerModel } from './../models/performerModel';
import { TempPerformerDocument } from "./../models/tempPerformer";
import mongoose from 'mongoose';
import { IperformerRepository } from "../../application/interfaces/IperformerRepository";
import { User, UserDocument } from "../../domain/entities/user";
import { OtpUser } from "../../domain/entities/otpUser";
// import { OtpDocument, OtpModel } from "../models/otpSession";
import { UserDocuments, UserModel } from "../models/userModel";

import bcrypt from "bcrypt";

import { TempPerformerModel } from "../models/tempPerformer";
import { TempPerformer } from "../../domain/entities/tempPerformer";
import { generateOTP } from "../../shared/utils/generateOtp";
import{tempUserModel} from "../models/tempUser";
import { asPerformer } from "../../domain/entities/asPerformer";
import { Types } from "mongoose";
import { performerDocument } from "../../domain/entities/performer";
export class performerRepository implements IperformerRepository {


  loginPerformer = async (email: string, password: string): Promise<asPerformer | null | string> => {
    try {
      // Find the performer by email
      const performer = await UserModel.findOne({ email: email });
      console.log('performer is ok', performer);
  
      // Check if the performer exists, is blocked, or is not verified
      if (!performer) {
        return null; // Performer not found
      } else if (performer.isPerformerBlocked) {
        return "Performer is Blocked"; // Performer is blocked
      } else if (!performer.isVerified) {
        return "Performer is not Verified"; // Performer is not verified
      }
  
      // Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, performer.password);
      if (!isMatch) {
        return null; // Passwords do not match
      }
  
      // Return performer details if login is successful
      return {
        username: performer.username,
        email: performer.email,
        password: performer.password, // Consider omitting this for security reasons
        _id: performer._id?.toString(),
        isVerified: performer.isVerified,
        isPerformerBlocked: performer.isPerformerBlocked,
      };
    } catch (error) {
      throw error; // Rethrow any caught errors
    }
  };
  

      getPerformerDetails = async (userId: Types.ObjectId): Promise<PerformerDocuments | null> => {
        try {
            // Find performer by userId
         
            const performer = await PerformerModel.findOne({ userId }).lean().exec();
          
            if (!performer) throw new Error("Performer not found");
          
            return performer;
        } catch (error) {
            console.error("Error occurred while finding performer:", error);
            return null;
        }
    }
  //    videoUploadDB = async (val: any, location: string): Promise<TempPerformerDocument | null> => {
  //     try {
  //         console.log("values", val);
  //         console.log("location", location);
  
  //         // Create a new TempPerformer document
  //         const newTempPerformer = new TempPerformerModel({
  //             bandName: val.bandName,
  //             mobileNumber: val.mobileNumber,
  //             video: location,
  //             description: val.description,
  //             user_id: new mongoose.Types.ObjectId(val.user_id)
  //         });
  
  //         // Save the document to the database
  //         const savedTempPerformer = await newTempPerformer.save();
  
  //         return savedTempPerformer;
  //     } catch (error) {
  //         console.error("Error occurred while creating temp performer:", error);
  //         return null;
  //     }
  // };
    




  videoUploadDB=async(bandName: string, mobileNumber: string, description: string, user_id: mongoose.Types.ObjectId,  s3Location: any): Promise<TempPerformerDocument | null> =>{
    try {
         console.log('sssssssssssseeeeeeeddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',mobileNumber,description,user_id,s3Location)
              console.log("location", s3Location);
      
              // Create a new TempPerformer document
              const newTempPerformer = new TempPerformerModel({
                  bandName: bandName,
                  mobileNumber: mobileNumber,
                  video: s3Location,
                  description:description,
                  user_id: user_id
              });

              console.log('new yearrrrrrrrrrrrrrrrrrr',newTempPerformer)
      
              // Save the document to the database
              const savedTempPerformer = await newTempPerformer.save();

              console.log('saveddddddddddddddddddddddddddddddddddddddddddddddddddd',savedTempPerformer)
      
              return savedTempPerformer;
          } catch (error) {
              console.error("Error occurred while creating temp performer:", error);
              return null;
          }
  }
}
