
import { Response, Request, NextFunction } from "express";
import { isValidEmail } from "../../../shared/utils/validEmail";
import { ResponseStatus } from "../../../constants/responseStatus";
import { IuserUseCase } from "../../../application/interfaces/user/useCase/user";
import { User } from "../../../domain/entities/user";
import { isValidPassword } from "../../../shared/utils/validPassword";
import { isValidFullName } from "../../../shared/utils/validName";



import mongoose, { Types } from "mongoose";

import {
  UserDocuments,
  UserModel,
} from "../../../infrastructure/models/userModel";
import { generateOTP } from "../../../shared/utils/generateOtp";
import { MessageConstants, OTPMessages, UserMessages } from "../../../shared/utils/constant";

export class UserController {
  private _useCase: IuserUseCase;

  constructor(private useCase: IuserUseCase) {
    this._useCase = useCase;
  }

  userLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: UserMessages.NO_USER_DATA });
      }
      const user = {
        email: req.body.email ? req.body.email.trim() : null,
        password: req.body.password ? req.body.password.trim() : null,
      };
      if (!user.password || !user.email) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: UserMessages.PASSWORD_EMAIL_REQUIRED });
      }
      if (!isValidEmail(user.email)) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: UserMessages.INVALID_EMAIL });
      }
      const loginUser = await this._useCase.loginUser(
        user.email,
        user.password
      );

      if (loginUser) {
        if (typeof loginUser === "string") {
          return res
            .status(ResponseStatus.Forbidden)
            .json({ message: loginUser });
        }

        const token = await this._useCase.jwt(loginUser as User);

        res.status(ResponseStatus.Accepted).json({ token: token });
      } else {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: UserMessages.USER_NOT_FOUND });
      }
    } catch (error) {
      console.log(error);
    }
  };
  userSignup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: UserMessages.NO_USER_DATA });
      }
      const user = {
        email: req.body.email ? req.body.email.trim() : null,
        password: req.body.password ? req.body.password.trim() : null,
        username: req.body.fullName,
      };
      if (!user.password || !user.email || !user.username) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: "fullname,email and password is required" });
      }
      if (!isValidEmail(user.email)) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: UserMessages.INVALID_EMAIL });
      }
      if (!isValidPassword(user.password)) {
        return res.status(ResponseStatus.BadRequest).json({
          message:
           UserMessages.INVALID_PASSWORD,
        });
      }
      const tempMailExist = await this.useCase.tempUserExist(user.email);

      if (tempMailExist) {
        return res
          .status(ResponseStatus.Unauthorized)
          .json({ message: OTPMessages.OTP_ALREADY_SENT });
      }

      const mailExist = await this._useCase.userExist(user.email);
      if (mailExist) {
        return res.status(ResponseStatus.Unauthorized).json({ message: UserMessages.EMAIL_EXISTS });
      }

      if (!isValidFullName(user.username)) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: UserMessages.INVALID_FULLNAME });
      }

      const hashedPassword = await this._useCase.bcrypt(user.password);
      user.password = hashedPassword;

      const otp = generateOTP();
      const tempUser = await this._useCase.otpUser(
        user.email,
        otp,
        user.password,
        user.username
      );
      if (tempUser) {
        console.log("otp", otp);
        return res
          .status(ResponseStatus.Created)
          .json({ message: OTPMessages.OTP_GENERATED, tempUser });
      }
      return res
        .status(ResponseStatus.BadRequest)
        .json({ message: UserMessages.USER_NOT_CREATED});
    } catch (error) {
      next(error);
    }
  };
  checkOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = {
        email: req.body.email,
        otp: req.body.otp,
      };
      const otpCheck = await this._useCase.checkOtp(user);

      if (otpCheck === null) {
        console.log("Null result: OTP check failed.");
        return res.status(ResponseStatus.BadRequest).json({ message: OTPMessages.INVALID_OTP });
      }
      res.status(ResponseStatus.OK).json({ message: OTPMessages.OTP_VERIFIED });
    } catch (error) {
      console.error(error);
      res.status(ResponseStatus.InternalSeverError).json({ message: MessageConstants.INTERANAL_SERVER_ERROR });
    }
  };
  resendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = req.params.email;
      if (email) {
        const otp = generateOTP();
        const otpUser = await this._useCase.resendOtp(email, otp);
        res.status(ResponseStatus.OK).json({ message: "resend otp successfull" });
      }
    } catch (error) {
      res.status(ResponseStatus.InternalSeverError).json({ message: "internal server error" });
    }
  };
  async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        let user = req.user;
        const token = await this._useCase.jwt(user as User);
        const userData = encodeURIComponent(JSON.stringify(req.user));
        const tokenData = encodeURIComponent(JSON.stringify(token));

        res.cookie("userToken", tokenData, {
          httpOnly: false,
          secure: true,
          sameSite: "none",
          maxAge: 24 * 60 * 60 * 1000,
        });

        res.redirect(`http://localhost:3000/auth`);
      } else {
        res.redirect("http://localhost:3000/auth");
      }
    } catch (error) {
      console.error("Error during Google callback:", error);
      res.redirect("http://localhost:3000/error");
    }
  }
  getUserDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
    const {id}=req.params
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: UserMessages.INVALID_USER_ID});
      }
      const objectId = new mongoose.Types.ObjectId(id);
      const response = await this._useCase.getUserDetails(objectId);
      if (response) {
        return res
          .status(ResponseStatus.Accepted)
          .json({ message: UserMessages.USER_DETAILS_SUCCESS, response });
      } else {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: UserMessages.USER_DETAILS_FAILED });
      }
    } catch (error) {
      next(error);
    }
  };
  updateUserProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { username } = req.body;
      const userId = new mongoose.Types.ObjectId(req.params.id);
      const image = req.file ? `/uploads/${req.file.filename}` : null;
      const updateData: { username: string; profileImage?: string | null } = {
        username,
      };

      if (image) {
        updateData.profileImage = image;
      }

      const updatedUser = (await UserModel.findByIdAndUpdate(
        userId,
        updateData,
        { new: true }
      )) as UserDocuments;

      if (updatedUser) {
        res
          .status(ResponseStatus.OK)
          .json({ message: UserMessages.PROFILE_UPDATE_SUCCESS, updatedUser });
      } else {
        res.status(ResponseStatus.NotFound).json({ message: UserMessages.USER_NOT_FOUND });
      }
    } catch (error) {
      console.error("Error updating user profile:", error);

      if (error instanceof Error) {
        res
          .status(ResponseStatus.InternalSeverError)
          .json({ message: UserMessages.ERROR_UPDATING_PROFILE, error: error.message });
      } else {
        res.status(ResponseStatus.InternalSeverError).json({ message: UserMessages.UNKNOWN_ERROR });
      }
    }
  };
  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = new mongoose.Types.ObjectId(req.params.id);
      const { currentPassword, newPassword } = req.body;
      if (!id || !currentPassword || !newPassword) {
        return res.status(ResponseStatus.BadRequest).json({ message:UserMessages.MISSING_FIELDS });
      }
      const changedPassword = await this._useCase.changePassword(
        id,
        currentPassword,
        newPassword
      );
      // Send the success response
      return res.status(ResponseStatus.OK).json({ success: true, user: changedPassword });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === UserMessages.PASSWORD_CHANGE_FAILED) {
          return res.status(ResponseStatus.BadRequest).json({ message: error.message });
        }
        return res
          .status(ResponseStatus.InternalSeverError)
          .json({ message: MessageConstants.ERROR_OCCURRED, error: error.message });
      }
      return res.status(ResponseStatus.InternalSeverError).json({ message: UserMessages.UNKNOWN_ERROR });
    }
  };
  walletHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const objectId = new mongoose.Types.ObjectId(id);

      const walletHistory = await this._useCase.walletHistory(objectId);
      res.status(ResponseStatus.OK).json({ success: true, data: walletHistory });
    } catch (error) {
      next(error);
    }
  };
}
