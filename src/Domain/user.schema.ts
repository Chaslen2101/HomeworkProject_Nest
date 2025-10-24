import mongoose, {Schema} from "mongoose";
import {UserDBType, UserInstanceMethodsType, UserModelType, UserViewType} from "../Types/Types";
import {ObjectId} from "mongodb";
import {UsersModel} from "../db/MongoDB";
import {add} from "date-fns";


export const UserSchema: Schema<UserDBType, UserModelType, UserInstanceMethodsType> = new mongoose.Schema(
    {
        id: String,
        login: String,
        email: String,
        password: String,
        createdAt: Schema.Types.Date,
        emailConfirmationInfo: {
            confirmationCode: String,
            expirationDate: Schema.Types.Date,
            isConfirmed: Boolean
        },
        passwordRecoveryCode: {
            confirmationCode: String,
            expirationDate: Schema.Types.Date
        }
    },
    {
        statics: {
            createNewUser(user: UserViewType, hashedPassword: string, confirmCode?: string) {
                return new UsersModel({
                    id: new ObjectId().toString(),
                    login: user.login,
                    email: user.email,
                    password: hashedPassword,
                    createdAt: new Date(),
                    emailConfirmationInfo: {
                        confirmationCode: confirmCode ? confirmCode : null,
                        expirationDate: confirmCode ? add(new Date(), {days: 1}) : null,
                        isConfirmed: false
                    },
                    passwordRecoveryCode: {
                        confirmationCode: null,
                        expirationDate: null
                    }
                })
            }
        }
    })