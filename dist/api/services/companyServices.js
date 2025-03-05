"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyServices = void 0;
require("dotenv/config");
const companyModels_1 = require("../models/companyModels");
const usersValidator_1 = require("../validators/usersValidator");
const zod_validation_error_1 = require("zod-validation-error");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
require("../types/usersTypes");
const minio_1 = require("../utilities/minio");
const env_1 = require("../utilities/env");
const utilFunctions_1 = require("../utilities/utilFunctions");
const profileValidator_1 = require("../validators/profileValidator");
class companyServices {
    // singleton design
    static companyService;
    static instance() {
        if (!this.companyService) {
            this.companyService = new companyServices();
        }
        return this.companyService;
    }
    // {Business Logic}
    // register company
    async register(userForm) {
        // user form validation
        try {
            usersValidator_1.companyRegisterSchema.parse(userForm);
        }
        catch (error) {
            const formattedError = (0, zod_validation_error_1.fromError)(error).toString();
            console.log(formattedError);
            return { success: false, msg: formattedError, status: 403 };
        }
        const validatedUserForm = userForm;
        // Duplicated name or email check
        let duplicatedUserCheck;
        try {
            duplicatedUserCheck = await companyModels_1.companyModels
                .instance()
                .duplicateNameEmail(validatedUserForm.officialName, validatedUserForm.email);
        }
        catch (error) {
            console.log(error);
            return { success: false, msg: "Something went wrong", status: 403 };
        }
        // there's duped user of some kind
        if (duplicatedUserCheck) {
            // duped name
            if (validatedUserForm.officialName ===
                duplicatedUserCheck.officialName &&
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
            officialName: validatedUserForm.officialName,
            email: validatedUserForm.email,
            hashedPassword
        };
        // insert into database
        let registeredUser;
        try {
            registeredUser = await companyModels_1.companyModels.instance().register(formattedUser);
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
    // login company (passport form)
    async login(username, password, done) {
        let users;
        // get all match name or email
        try {
            users = await companyModels_1.companyModels.instance().matchNameEmail(username);
        }
        catch (error) {
            console.log(error);
            return done(error, false, { message: "Something went wrong" });
        }
        if (users.length === 0) {
            return done(null, false, { message: "User doesn't existed" });
        }
        // match password
        let exactUser;
        let approvedExisted = false;
        for (const user of users) {
            if (user.approvalStatus === "APPROVED") {
                approvedExisted = true;
            }
            const matched = await bcryptjs_1.default.compare(password, user.password);
            if (matched) {
                exactUser = user;
                break;
            }
        }
        // wrong password
        if (!exactUser) {
            return done(null, false, { message: "Wrong password" });
        }
        // not approved
        if (exactUser.approvalStatus === "UNAPPROVED") {
            return done(null, false, { message: "User isn't approved yet" });
        }
        // format user
        const formattedUser = {
            id: exactUser.id,
            type: "COMPANY",
        };
        done(null, formattedUser, { message: "Successfully logged in" });
    }
    async checkCurrent(user, type) {
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
        if (userObj.type !== type) {
            return { success: false, status: 401, msg: "User isn't logged in" };
        }
        return {
            success: true,
            status: 200,
            msg: "Sucessfully retrieve checked user",
            data: { id: userObj.id, officialName: userObj.officialName },
        };
    }
    // get current user
    async getCurrent(user) {
        if (!user) {
            return { success: false, status: 403, msg: "Something went wrong" };
        }
        let userObj;
        try {
            userObj = user;
            if (userObj.type !== "COMPANY") {
                throw Error();
            }
        }
        catch (error) {
            return { success: false, status: 400, msg: "User isn't logged in" };
        }
        return {
            success: true,
            status: 200,
            msg: "Successfully retrieve user",
            data: user,
        };
    }
    // upload register proof image
    async uploadRegistrationImage(approvalId, image) {
        // upload iamge to minio and get image url
        await (0, minio_1.createBucketIfNotExisted)(minio_1.registrationApprovalImageBucket);
        await minio_1.minioClient.putObject(minio_1.registrationApprovalImageBucket, `${approvalId}_register`, image.buffer, image.size, { "Content-Type": image.mimetype });
        const imageUrl = await minio_1.minioClient.presignedUrl("GET", minio_1.registrationApprovalImageBucket, `${approvalId}_register`, env_1.minioUrlExpire // url is valid for 3 hours
        );
        // insert into approval table
        const [error, result] = await (0, utilFunctions_1.catchError)(companyModels_1.companyModels.instance().uploadRegistrationImage(approvalId, imageUrl));
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
    // deserialized user (passport calls)
    async deserializer(id) {
        let user;
        // getting user
        try {
            user = await companyModels_1.companyModels.instance().getById(id);
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
        if (formattedUser.type !== "COMPANY") {
            return { status: 400, success: false, msg: "User isn't logged in" };
        }
        // insert into minio
        const imageName = `${formattedUser.id}_company_profile`;
        await (0, minio_1.createBucketIfNotExisted)(minio_1.userProfileImageBucket);
        await minio_1.minioClient.putObject(minio_1.userProfileImageBucket, imageName, image.buffer, image.size, { "Content-Type": image.mimetype });
        // get image url (temp presigned)
        const imageUrl = `http://localhost:1982/profile/${imageName}`;
        // call model
        const [error, result] = await (0, utilFunctions_1.catchError)(companyModels_1.companyModels.instance().uploadProfilePicture(imageUrl, formattedUser));
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
    async editOfficialName(body, user) {
        let parsedBody;
        try {
            parsedBody = profileValidator_1.editOfficialNameSchema.parse(body);
        }
        catch (error) {
            console.error(error);
            return { status: 400, success: false, msg: "Wrong credentials format" };
        }
        const formattedUser = user;
        // wrong user type
        if (formattedUser.type !== "COMPANY") {
            return { status: 401, success: false, msg: "User isn't logged in" };
        }
        const [error, result] = await (0, utilFunctions_1.catchError)(companyModels_1.companyModels
            .instance()
            .editOfficialName(parsedBody.officialName, parsedBody.password, formattedUser));
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
        if (formattedUser.type !== "COMPANY") {
            return { status: 401, success: false, msg: "User isn't logged in" };
        }
        // check dupe email
        const [error, result] = await (0, utilFunctions_1.catchError)(companyModels_1.companyModels.instance().editEmail(parsedBody.email, formattedUser));
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
        if (formattedUser.type !== "COMPANY") {
            return { status: 401, success: false, msg: "User isn't logged in" };
        }
        const [error, result] = await (0, utilFunctions_1.catchError)(companyModels_1.companyModels.instance().editAbout(parsedBody.about, formattedUser));
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
        if (formattedUser.type !== "COMPANY") {
            return { status: 401, success: false, msg: "User isn't logged in" };
        }
        const [error, result] = await (0, utilFunctions_1.catchError)(companyModels_1.companyModels
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
        if (formattedUser.type !== "COMPANY") {
            return { status: 401, success: false, msg: "User isn't logged in" };
        }
        const [error, result] = await (0, utilFunctions_1.catchError)(companyModels_1.companyModels.instance().editContact(parsedBody.contact, formattedUser));
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
        if (formattedUser.type !== "COMPANY") {
            return { status: 401, success: false, msg: "User isn't logged in" };
        }
        const [error, result] = await (0, utilFunctions_1.catchError)(companyModels_1.companyModels
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
exports.companyServices = companyServices;
