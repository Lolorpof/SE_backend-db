"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.employerServices = void 0;
require("dotenv/config");
const zod_validation_error_1 = require("zod-validation-error");
const employerModels_1 = require("../models/employerModels");
const usersValidator_1 = require("../validators/usersValidator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
require("../types/usersTypes");
const minio_1 = require("../utilities/minio");
const env_1 = require("../utilities/env");
const utilFunctions_1 = require("../utilities/utilFunctions");
const profileValidator_1 = require("../validators/profileValidator");
class employerServices {
    // singleton design
    static employerService;
    static instance() {
        if (!this.employerService) {
            this.employerService = new employerServices();
        }
        return this.employerService;
    }
    // register employer
    async register(userForm) {
        // {Business Logic}
        // user form validation
        try {
            usersValidator_1.singleUserRegisterSchema.parse(userForm);
        }
        catch (error) {
            const formattedError = (0, zod_validation_error_1.fromError)(error).toString();
            console.log(formattedError);
            return { success: false, msg: formattedError, status: 403 };
        }
        const validatedUserForm = userForm;
        // split to first name and last name
        const [firstName, lastName] = validatedUserForm.name.split(" ");
        // Duplicated name or email check
        let duplicatedUserCheck;
        try {
            duplicatedUserCheck = await employerModels_1.employerModels
                .instance()
                .duplicateNameEmail(firstName, lastName, validatedUserForm.email);
        }
        catch (error) {
            console.log(error);
            return { success: false, msg: "Something went wrong", status: 403 };
        }
        // there's duped user of some kind
        if (duplicatedUserCheck) {
            // duped name
            if (firstName === duplicatedUserCheck.firstName &&
                lastName === duplicatedUserCheck.lastName &&
                validatedUserForm.email !== duplicatedUserCheck.email) {
                return {
                    success: false,
                    msg: "Name was already used",
                    status: 400,
                };
            }
            // duped email
            else if (validatedUserForm.email === duplicatedUserCheck.email) {
                return {
                    success: false,
                    msg: "Email was already used",
                    status: 400,
                };
            }
        }
        // password  & confirmPassword should be the same
        if (validatedUserForm.password !== validatedUserForm.confirmPassword) {
            return {
                success: false,
                msg: "Password does not match",
                status: 400,
            };
        }
        // {Done with Business Logic}
        // hash password
        let hashedPassword;
        try {
            hashedPassword = await bcryptjs_1.default.hash(validatedUserForm.password, Number(process.env.BCRYPT_SALTROUNDS));
        }
        catch (error) {
            console.log(error);
            return { success: false, msg: "Something went wrong", status: 403 };
        }
        // format user
        const formattedUser = {
            firstName,
            lastName,
            email: validatedUserForm.email,
            hashedPassword
        };
        // insert into database
        let registeredUser;
        try {
            registeredUser = await employerModels_1.employerModels.instance().register(formattedUser);
        }
        catch (error) {
            console.log(error);
            return { success: false, msg: "Something went wrong", status: 403 };
        }
        return {
            success: true,
            msg: "Successfully registered",
            data: registeredUser,
            status: 201,
        };
    }
    // login employer (passport form)
    async login(username, password, done) {
        let users;
        try {
            // find user with same name or email
            users = await employerModels_1.employerModels.instance().matchNameEmail(username);
        }
        catch (error) {
            console.log(error);
            return done(error, false, { message: "Something went wrong" });
        }
        if (users.length === 0) {
            return done(null, false, { message: "User doesn't existed" });
        }
        let exactUser;
        let approvedExisted = false;
        try {
            for (const user of users) {
                if (user.approvalStatus === "APPROVED") {
                    approvedExisted = true;
                }
                const matched = await bcryptjs_1.default.compare(password, user.password);
                // exact user found
                if (matched) {
                    exactUser = user;
                    break;
                }
            }
        }
        catch (error) {
            console.log(error);
            return done(error, false, { message: "Something went wrong" });
        }
        if (!exactUser) {
            // wrong password
            if (approvedExisted) {
                return done(null, false, { message: "Wrong password" });
            }
            // none of the username is approved
            else {
                return done(null, false, { message: "User doesn't existed" });
            }
        }
        // user isn't approved yet
        if (exactUser.approvalStatus === "UNAPPROVED") {
            return done(null, false, {
                message: "User isn't approved yet",
            });
        }
        // format user
        const formattedUser = {
            id: exactUser.id,
            isOauth: false,
            type: "EMPLOYER",
        };
        console.log("pre done");
        return done(null, formattedUser, { message: "Successfully logged in" });
    }
    // google oauth login (passport form)
    async googleLogin(accessToken, refreshToken, profile, done) {
        // check if user existed
        let user;
        try {
            user = await employerModels_1.employerModels
                .instance()
                .getById(profile.id, true, "GOOGLE");
        }
        catch (error) {
            console.log(error);
            done(error, false, { message: "Something went wrong" });
        }
        // first time oauth login
        let insertUser;
        if (!user) {
            try {
                insertUser = await employerModels_1.employerModels
                    .instance()
                    .oauthUserInsert(profile, "GOOGLE");
            }
            catch (error) {
                console.log(error);
                return done(error, false, {
                    message: "Something went wrong",
                });
            }
            return done(null, false, {
                message: "Detecting that you have logged in for the first time, please wait until your account is approved",
            });
        }
        // user already existed
        else {
            // update user info, if there's any change made
            try {
                user = await employerModels_1.employerModels
                    .instance()
                    .oauthUserUpdate(profile, user, "GOOGLE");
            }
            catch (error) {
                console.log(error);
                return done(error, false, {
                    message: "Something went wrong",
                });
            }
            // get registration approval id of employer
            const [err, res] = await (0, utilFunctions_1.catchError)(employerModels_1.employerModels.instance().oauthGetApprovalId(user.id));
            if (err) {
                return done(err, false, {
                    message: "Something went wrong",
                });
            }
            // user isn't approved yet
            if (user.approvalStatus === "UNAPPROVED") {
                return done(null, false, {
                    message: "User isn't approved yet",
                    approvalId: res.id,
                });
            }
            // format user
            const formattedUser = {
                id: user.id,
                type: "EMPLOYER",
                provider: "GOOGLE",
            };
            // user is approved
            done(null, formattedUser, { message: "Successfully login" });
        }
    }
    // check current user, for logout
    async checkCurrent(user, type, isOauth) {
        if (!user) {
            return { success: false, status: 403, msg: "Something went wrong" };
        }
        let userObj;
        try {
            userObj = user;
        }
        catch (error) {
            console.log(error);
            return { success: false, status: 403, msg: "Something went wrong" };
        }
        if (userObj.isOauth !== isOauth || userObj.type !== type) {
            return { success: false, status: 401, msg: "User isn't logged in" };
        }
        return {
            success: true,
            status: 200,
            msg: "Successfully retrieve checked user",
            data: { id: userObj.id, username: userObj.username },
        };
    }
    // get current user (passport calls)
    async getCurrent(user) {
        if (!user) {
            return { status: 403, success: false, msg: "Something went wrong" };
        }
        let userObj;
        try {
            userObj = user;
            if (userObj.type !== "EMPLOYER") {
                throw Error();
            }
        }
        catch (error) {
            return { success: false, status: 400, msg: "User isn't logged in" };
        }
        return {
            status: 200,
            success: true,
            msg: "Successfully retrieve user",
            data: user,
        };
    }
    // upload register image service
    async uploadRegistrationImage(approvalId, image) {
        // upload iamge to minio and get image url
        await (0, minio_1.createBucketIfNotExisted)(minio_1.registrationApprovalImageBucket);
        await minio_1.minioClient.putObject(minio_1.registrationApprovalImageBucket, `${approvalId}_register`, image.buffer, image.size, { "Content-Type": image.mimetype });
        const imageUrl = await minio_1.minioClient.presignedUrl("GET", minio_1.registrationApprovalImageBucket, `${approvalId}_register`, env_1.minioUrlExpire // url is valid for 3 hours
        );
        // insert into approval table
        const [error, result] = await (0, utilFunctions_1.catchError)(employerModels_1.employerModels.instance().uploadRegistrationImage(approvalId, imageUrl));
        if (error) {
            console.error(error);
            return {
                success: false,
                status: 400,
                msg: "Something went wrong",
            };
        }
        return {
            success: true,
            status: 201,
            msg: "Successfully upload and insert registraion approval image",
            data: result,
        };
    }
    // deserialize user (passport calls)
    async deserializer(id, provider) {
        let user;
        // getting user
        try {
            if (!provider) {
                user = await employerModels_1.employerModels.instance().getById(id);
            }
            else {
                user = await employerModels_1.employerModels.instance().getById(id, false, provider);
            }
        }
        catch (error) {
            console.log(error);
            return { success: false, msg: "Something went wrong", status: 403 };
        }
        if (!user) {
            return { success: false, msg: "Something went wrong", status: 403 };
        }
        return {
            success: true,
            msg: "Retrieve user successfully",
            data: user,
            status: 200,
        };
    }
    // upload profile image, no oauth
    async uploadProfilePicture(image, user) {
        const formattedUser = user;
        if (formattedUser.type !== "EMPLOYER" || formattedUser.isOauth) {
            return { status: 400, success: false, msg: "User isn't logged in" };
        }
        // insert into minio
        const imageName = `${formattedUser.id}_employer_profile`;
        await (0, minio_1.createBucketIfNotExisted)(minio_1.userProfileImageBucket);
        await minio_1.minioClient.putObject(minio_1.userProfileImageBucket, imageName, image.buffer, image.size, { "Content-Type": image.mimetype });
        // get image url (temp presigned)
        const imageUrl = `http://localhost:1982/profile/${imageName}`;
        // call model
        const [error, result] = await (0, utilFunctions_1.catchError)(employerModels_1.employerModels.instance().uploadProfilePicture(imageUrl, formattedUser));
        if (error) {
            return { status: 403, success: false, msg: "Something went wrong" };
        }
        return {
            status: 201,
            success: true,
            msg: "Successfully uploaded profile image",
            data: result,
        };
    }
    // edit username, no oauth
    async editUsername(body, user) {
        let parsedBody;
        try {
            parsedBody = profileValidator_1.editUsernameSchema.parse(body);
        }
        catch (error) {
            console.error(error);
            return { status: 400, success: false, msg: "Wrong credentials format" };
        }
        const formattedUser = user;
        // wrong user type
        if (formattedUser.type !== "EMPLOYER" || formattedUser.isOauth) {
            return { status: 401, success: false, msg: "User isn't logged in" };
        }
        const [error, result] = await (0, utilFunctions_1.catchError)(employerModels_1.employerModels
            .instance()
            .editUsername(parsedBody.username, parsedBody.password, formattedUser));
        if (error) {
            console.error(error);
            return { status: 403, success: false, msg: "Something went wrong" };
        }
        // wrong password
        if (!result) {
            return {
                status: 400,
                success: false,
                msg: "Wrong password",
            };
        }
        // special case
        if (result.case) {
            if (result.case === "empty username") {
                return {
                    status: 400,
                    success: false,
                    msg: "User field is empty",
                };
            }
            else if (result.case === "exact dupe") {
                return {
                    status: 400,
                    success: false,
                    msg: "Username can't be used",
                };
            }
            delete result.case;
        }
        const { case: _, ...formattedResult } = result;
        return {
            status: 200,
            success: true,
            msg: "Successfully editted username",
            data: formattedResult,
        };
    }
    // edit email, no oauth
    async editEmail(body, user) {
        // validate body
        let parsedBody;
        try {
            parsedBody = profileValidator_1.editEmailSchema.parse(body);
        }
        catch (error) {
            console.error(error);
            return {
                status: 400,
                success: false,
                msg: "Wrong credentials format",
            };
        }
        const formattedUser = user;
        // wrong user type
        if (formattedUser.type !== "EMPLOYER" || formattedUser.isOauth) {
            return { status: 401, success: false, msg: "User isn't logged in" };
        }
        // check dupe email
        const [error, result] = await (0, utilFunctions_1.catchError)(employerModels_1.employerModels.instance().editEmail(parsedBody.email, formattedUser));
        if (error) {
            console.error(error);
            return {
                status: 403,
                success: false,
                msg: "Something went wrong",
            };
        }
        // dupe email
        if (!result) {
            return { status: 400, success: false, msg: "Email is already used" };
        }
        return {
            status: 200,
            success: true,
            msg: "Successfully updated email",
            data: result,
        };
    }
    // edit fullname, no oauth
    async editFullName(body, user) {
        let parsedBody;
        try {
            parsedBody = profileValidator_1.editFullNameSchema.parse(body);
        }
        catch (error) {
            console.error(error);
            return { status: 400, success: false, msg: "Wrong credential format" };
        }
        const formattedUser = user;
        // wrong user type
        if (formattedUser.type !== "EMPLOYER" || formattedUser.isOauth) {
            return { status: 401, success: false, msg: "User isn't logged in" };
        }
        // call models
        const [error, result] = await (0, utilFunctions_1.catchError)(employerModels_1.employerModels
            .instance()
            .editFullName(parsedBody.firstName, parsedBody.lastName, formattedUser));
        if (error) {
            console.error(error);
            return { status: 403, msg: "Something went wrong", success: false };
        }
        if (!result) {
            return { status: 400, msg: "Name is already used", success: false };
        }
        return {
            status: 200,
            msg: "Successfully updated full name",
            success: true,
            data: result,
        };
    }
    // edit about
    async editAbout(body, user) {
        let parsedBody;
        try {
            parsedBody = profileValidator_1.editAboutSchema.parse(body);
        }
        catch (error) {
            console.error(error);
            return { status: 400, success: false, msg: "Wrong credential format" };
        }
        const formattedUser = user;
        if (formattedUser.type !== "EMPLOYER") {
            return { status: 401, success: false, msg: "User isn't logged in" };
        }
        const [error, result] = await (0, utilFunctions_1.catchError)(employerModels_1.employerModels.instance().editAbout(parsedBody.about, formattedUser));
        if (error) {
            console.error(error);
            return { status: 403, success: false, msg: "Something went wrong" };
        }
        // about is empty string
        if (!result) {
            return { status: 400, success: false, msg: "Field is empty" };
        }
        return {
            status: 200,
            success: true,
            msg: "Successfully updated about user",
            data: result,
        };
    }
    // edit address
    async editAddress(body, user) {
        let parsedBody;
        try {
            parsedBody = profileValidator_1.editAddressSchema.parse(body);
        }
        catch (error) {
            console.error(error);
            return { status: 400, success: false, msg: "Wrong credential format" };
        }
        const formattedUser = user;
        if (formattedUser.type !== "EMPLOYER") {
            return { status: 401, success: false, msg: "User isn't logged in" };
        }
        const [error, result] = await (0, utilFunctions_1.catchError)(employerModels_1.employerModels
            .instance()
            .editAddress(parsedBody.address, parsedBody.provinceAddress, formattedUser));
        if (error) {
            console.error(error);
            return { status: 403, success: false, msg: "Something went wrong" };
        }
        // address is empty string
        if (!result) {
            return { status: 400, success: false, msg: "Field is empty" };
        }
        return {
            status: 200,
            success: true,
            msg: "Successfully updated address",
            data: result,
        };
    }
    // edit contact
    async editContact(body, user) {
        let parsedBody;
        try {
            parsedBody = profileValidator_1.editContactSchema.parse(body);
        }
        catch (error) {
            console.error(error);
            return { status: 400, success: false, msg: "Wrong credential format" };
        }
        const formattedUser = user;
        if (formattedUser.type !== "EMPLOYER") {
            return { status: 401, success: false, msg: "User isn't logged in" };
        }
        const [error, result] = await (0, utilFunctions_1.catchError)(employerModels_1.employerModels.instance().editContact(parsedBody.contact, formattedUser));
        if (error) {
            console.error(error);
            return { status: 403, success: false, msg: "Something went wrong" };
        }
        if (!result) {
            return { status: 400, success: false, msg: "Contact field is empty" };
        }
        return {
            status: 200,
            success: true,
            msg: "Successfully updated contact",
            data: result,
        };
    }
    // edit password, no oauth
    async editPassword(body, user) {
        let parsedBody;
        try {
            parsedBody = profileValidator_1.editPasswordSchema.parse(body);
        }
        catch (error) {
            console.error(error);
            return { status: 400, success: false, msg: "Wrong credential format" };
        }
        const formattedUser = user;
        if (formattedUser.type !== "EMPLOYER" || formattedUser.isOauth) {
            return { status: 401, success: false, msg: "User isn't logged in" };
        }
        const [error, result] = await (0, utilFunctions_1.catchError)(employerModels_1.employerModels
            .instance()
            .editPassword(parsedBody.password, parsedBody.oldPassword, formattedUser));
        if (error) {
            console.error(error);
            return { status: 403, success: false, msg: "Something went wrong" };
        }
        if (!result) {
            return { status: 400, success: false, msg: "Password field is empty" };
        }
        if (result.case) {
            if (result.case === "no user") {
                return { status: 403, success: false, msg: "Something went wrong" };
            }
            else if (result.case === "wrong password") {
                return { status: 401, success: false, msg: "Wrong old password" };
            }
            else if (result.case === "exactDupe") {
                return { status: 400, success: false, msg: "Password can't be use" };
            }
            delete result.case;
        }
        const { case: _, ...formattedResult } = result;
        return {
            status: 200,
            success: true,
            msg: "Successfully updated password",
            data: { userId: formattedResult.userId },
        };
    }
}
exports.employerServices = employerServices;
