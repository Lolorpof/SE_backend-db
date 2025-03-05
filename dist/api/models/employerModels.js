"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.employerModels = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const conn_1 = require("../../db/conn");
const schema_1 = require("../../db/schema");
require("../types/usersTypes");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../utilities/env");
class employerModels {
    // singleton design
    static employerModel;
    static instance() {
        if (!this.employerModel) {
            this.employerModel = new employerModels();
        }
        return this.employerModel;
    }
    // duplicate name check
    async duplicateNameEmail(firstName, lastName, email) {
        // getting duplicated first name & last name
        const duplicatedNameOrEmail = await conn_1.drizzlePool
            .select({
            firstName: schema_1.employerTable.firstName,
            lastName: schema_1.employerTable.lastName,
            email: schema_1.employerTable.email,
        })
            .from(schema_1.employerTable)
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.employerTable.firstName, firstName), (0, drizzle_orm_1.eq)(schema_1.employerTable.lastName, lastName)), (0, drizzle_orm_1.eq)(schema_1.employerTable.email, email)));
        return duplicatedNameOrEmail[0];
    }
    // {login}
    async matchNameEmail(nameEmail) {
        const users = await conn_1.drizzlePool.query.employerTable.findMany({
            columns: { id: true, approvalStatus: true, password: true },
            where: (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.employerTable.username, nameEmail), (0, drizzle_orm_1.eq)(schema_1.employerTable.email, nameEmail)),
        });
        return users;
    }
    // insert new employer for oauth
    async oauthUserInsert(profile, provider) {
        const loginUser = await conn_1.drizzlePool
            .insert(schema_1.oauthEmployerTable)
            .values({
            firstName: profile._json.given_name,
            lastName: profile._json.family_name,
            email: profile._json.email,
            provider: "GOOGLE",
            providerId: profile.id,
            username: profile._json.given_name,
        })
            .returning({ id: schema_1.oauthEmployerTable.id });
        // insert into registration approval
        const registeredApproval = await conn_1.drizzlePool
            .insert(schema_1.registrationApprovalTable)
            .values({ userType: "OAUTHEMPLOYER", oauthEmployerId: loginUser[0].id })
            .returning({ id: schema_1.registrationApprovalTable.id });
        // format registered user
        const registered = {
            userId: loginUser[0].id,
            approvalId: registeredApproval[0].id,
        };
        return registered;
    }
    // update oauth employer, if profile is changed
    async oauthUserUpdate(profile, currentUser, provider) {
        // remove true if done
        let updateUser;
        if (provider === "GOOGLE" || true) {
            if (currentUser.lastName !== profile._json.family_name ||
                currentUser.firstName !== profile._json.given_name ||
                currentUser.email !== profile._json.email ||
                currentUser.profilePicture !== profile._json.picture) {
                updateUser = await conn_1.drizzlePool
                    .update(schema_1.oauthEmployerTable)
                    .set({
                    firstName: profile._json.given_name,
                    lastName: profile._json.family_name,
                    email: profile._json.email,
                    profilePicture: profile._json.picture,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.oauthEmployerTable.id, currentUser.id))
                    .returning();
            }
        }
        // no updated done
        if (!updateUser) {
            return currentUser;
        }
        const user = updateUser[0];
        return user;
    }
    // get approval id for oauth
    async oauthGetApprovalId(userId) {
        const approvalId = await conn_1.drizzlePool.query.registrationApprovalTable.findFirst({
            columns: { id: true },
            where: (0, drizzle_orm_1.eq)(schema_1.registrationApprovalTable.oauthEmployerId, userId),
        });
        if (!approvalId) {
            throw Error("No approval id existed");
        }
        return approvalId;
    }
    // register employer
    async register(user) {
        const registeredUser = await conn_1.drizzlePool
            .insert(schema_1.employerTable)
            .values({
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.firstName,
            email: user.email,
            password: user.hashedPassword,
        })
            .returning({ id: schema_1.employerTable.id });
        //registration approval
        const registeredApproval = await conn_1.drizzlePool
            .insert(schema_1.registrationApprovalTable)
            .values({ userType: "EMPLOYER", employerId: registeredUser[0].id })
            .returning({ id: schema_1.registrationApprovalTable.id });
        // format registered user
        const registered = {
            userId: registeredUser[0].id,
            approvalId: registeredApproval[0].id,
        };
        return registered;
    }
    //get by id
    async getById(idOrProviderId, getByProviderId, provider) {
        let user;
        if (!provider) {
            user = await conn_1.drizzlePool.query.employerTable.findFirst({
                columns: { password: false, createdAt: false, updatedAt: false },
                where: (0, drizzle_orm_1.eq)(schema_1.employerTable.id, idOrProviderId),
            });
        }
        else if (!getByProviderId) {
            user = await conn_1.drizzlePool.query.oauthEmployerTable.findFirst({
                columns: { createdAt: false, updatedAt: false },
                where: (0, drizzle_orm_1.eq)(schema_1.oauthEmployerTable.id, idOrProviderId),
            });
        }
        else {
            user = await conn_1.drizzlePool.query.oauthEmployerTable.findFirst({
                columns: { createdAt: false, updatedAt: false },
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.oauthEmployerTable.providerId, idOrProviderId), (0, drizzle_orm_1.eq)(schema_1.oauthEmployerTable.provider, provider)),
            });
        }
        return user;
    }
    // upload register image
    async uploadRegistrationImage(approvalId, imageUrl) {
        // update approval table at approvalId with image
        await conn_1.drizzlePool
            .update(schema_1.registrationApprovalTable)
            .set({ imageUrl: imageUrl })
            .where((0, drizzle_orm_1.eq)(schema_1.registrationApprovalTable.id, approvalId));
        return { approvalId, url: imageUrl };
    }
    // user approved by admin
    async approved(user, isOauth) {
        let result;
        if (user.status === "APPROVED") {
            if (isOauth) {
                result = await conn_1.drizzlePool
                    .update(schema_1.oauthEmployerTable)
                    .set({ approvalStatus: user.status })
                    .where((0, drizzle_orm_1.eq)(schema_1.oauthEmployerTable.id, user.id))
                    .returning({ id: schema_1.oauthEmployerTable.id });
            }
            else {
                result = await conn_1.drizzlePool
                    .update(schema_1.employerTable)
                    .set({ approvalStatus: user.status })
                    .where((0, drizzle_orm_1.eq)(schema_1.employerTable.id, user.id))
                    .returning({ id: schema_1.employerTable.id });
            }
        }
        else {
            if (isOauth) {
                result = await conn_1.drizzlePool
                    .delete(schema_1.oauthEmployerTable)
                    .where((0, drizzle_orm_1.eq)(schema_1.oauthEmployerTable.id, user.id))
                    .returning({ id: schema_1.oauthEmployerTable.id });
            }
            else {
                result = await conn_1.drizzlePool
                    .delete(schema_1.employerTable)
                    .where((0, drizzle_orm_1.eq)(schema_1.employerTable.id, user.id))
                    .returning({ id: schema_1.employerTable.id });
            }
        }
        return result[0];
    }
    // check if approval id existed
    async approvalExisted(approvalId) {
        const approval = await conn_1.drizzlePool.query.registrationApprovalTable.findFirst({
            columns: { id: true },
            where: (0, drizzle_orm_1.eq)(schema_1.registrationApprovalTable.id, approvalId),
        });
        if (!approval)
            return false;
        return true;
    }
    // upload profile image and return link, no oauth
    async uploadProfilePicture(imageUrl, user) {
        const formattedUser = user;
        await conn_1.drizzlePool
            .update(schema_1.employerTable)
            .set({ profilePicture: imageUrl })
            .where((0, drizzle_orm_1.eq)(schema_1.employerTable.id, formattedUser.id));
        return { url: imageUrl, userId: formattedUser.id };
    }
    // credentials auth only
    async editUsername(username, password, user) {
        const formattedUser = user;
        // check for true duplicate
        const currentUserPassword = await conn_1.drizzlePool.query.employerTable.findFirst({
            columns: { password: true },
            where: (0, drizzle_orm_1.eq)(schema_1.employerTable.id, user.id),
        });
        // password check
        if (!currentUserPassword) {
            return null;
        }
        const passwordMatched = await bcryptjs_1.default.compare(password, currentUserPassword.password);
        if (!passwordMatched) {
            return null;
        }
        // username is empty string
        if (username.length === 0) {
            return {
                userId: formattedUser.id,
                username: username,
                case: "empty username",
            };
        }
        // duplicate username check
        const dupedUsernames = await conn_1.drizzlePool.query.employerTable.findMany({
            columns: { username: true, password: true },
            where: (0, drizzle_orm_1.eq)(schema_1.employerTable.username, username),
        });
        // exact dupe check
        let dupedCounter = 0;
        for (const dupedUsername of dupedUsernames) {
            const exactDuped = await bcryptjs_1.default.compare(password, dupedUsername.password);
            if (exactDuped) {
                dupedCounter++;
            }
        }
        if (dupedCounter > 1) {
            return {
                userId: user.id,
                username: username,
                case: "exact dupe",
            };
        }
        // no dupe
        await conn_1.drizzlePool
            .update(schema_1.employerTable)
            .set({ username: username })
            .where((0, drizzle_orm_1.eq)(schema_1.employerTable.id, user.id));
        return {
            userId: user.id,
            username: username,
        };
    }
    async editEmail(email, user) {
        // duplicate email check
        const dupeEmail = await conn_1.drizzlePool.query.employerTable.findMany({
            columns: { email: true },
            where: (0, drizzle_orm_1.eq)(schema_1.employerTable.email, email),
        });
        if (dupeEmail.length > 1) {
            return null;
        }
        // editable email
        await conn_1.drizzlePool
            .update(schema_1.employerTable)
            .set({ email: email })
            .where((0, drizzle_orm_1.eq)(schema_1.employerTable.id, user.id));
        return { email: email, userId: user.id };
    }
    async editFullName(firstName, lastName, user) {
        const formattedUser = user;
        // check dupe
        const dupedName = await conn_1.drizzlePool.query.employerTable.findMany({
            columns: { firstName: true, lastName: true },
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.employerTable.firstName, firstName), (0, drizzle_orm_1.eq)(schema_1.employerTable.lastName, lastName)),
        });
        if (dupedName.length > 1) {
            return null;
        }
        // no dupe
        await conn_1.drizzlePool
            .update(schema_1.employerTable)
            .set({ firstName: firstName, lastName: lastName })
            .where((0, drizzle_orm_1.eq)(schema_1.employerTable.id, formattedUser.id));
        return {
            userId: formattedUser.id,
            firstName: firstName,
            lastName: lastName,
        };
    }
    async editAbout(about, user) {
        const formattedUser = user;
        // new about is empty
        if (about.length === 0) {
            return null;
        }
        // oauth check
        if (formattedUser.isOauth) {
            await conn_1.drizzlePool
                .update(schema_1.oauthEmployerTable)
                .set({ aboutMe: about })
                .where((0, drizzle_orm_1.eq)(schema_1.oauthEmployerTable.id, formattedUser.id));
        }
        else {
            await conn_1.drizzlePool
                .update(schema_1.employerTable)
                .set({ aboutMe: about })
                .where((0, drizzle_orm_1.eq)(schema_1.employerTable.id, formattedUser.id));
        }
        return { userId: formattedUser.id, about: about };
    }
    async editAddress(address, provinceAddress, user) {
        const formattedUser = user;
        // check empty string
        if (address.length === 0 || provinceAddress.length === 0) {
            return null;
        }
        // oauth check
        if (formattedUser.isOauth) {
            await conn_1.drizzlePool
                .update(schema_1.oauthEmployerTable)
                .set({ address: address, provinceAddress: provinceAddress })
                .where((0, drizzle_orm_1.eq)(schema_1.oauthEmployerTable.id, formattedUser.id));
        }
        else {
            await conn_1.drizzlePool
                .update(schema_1.employerTable)
                .set({ address: address, provinceAddress: provinceAddress })
                .where((0, drizzle_orm_1.eq)(schema_1.employerTable.id, formattedUser.id));
        }
        return {
            userId: formattedUser.id,
            address: address,
            provinceAddress: provinceAddress,
        };
    }
    async editContact(contact, user) {
        const formattedUser = user;
        // contact empty string
        if (contact.length === 0) {
            return null;
        }
        // oauth check
        if (formattedUser.isOauth) {
            await conn_1.drizzlePool
                .update(schema_1.oauthEmployerTable)
                .set({ contact: contact })
                .where((0, drizzle_orm_1.eq)(schema_1.oauthEmployerTable.id, formattedUser.id));
        }
        else {
            await conn_1.drizzlePool
                .update(schema_1.employerTable)
                .set({ contact: contact })
                .where((0, drizzle_orm_1.eq)(schema_1.employerTable.id, formattedUser.id));
        }
        return { userId: formattedUser.id, contact: contact };
    }
    async editPassword(password, oldPassword, user) {
        const formattedUser = user;
        // empty string check
        if (password.length === 0) {
            return null;
        }
        // old password check
        const userPassword = await conn_1.drizzlePool.query.employerTable.findFirst({
            columns: { password: true },
            where: (0, drizzle_orm_1.eq)(schema_1.employerTable.id, formattedUser.id),
        });
        if (!userPassword) {
            console.error("***No user found***");
            return {
                userId: formattedUser.id,
                case: "no user",
            };
        }
        const correct = await bcryptjs_1.default.compare(oldPassword, userPassword.password);
        if (!correct) {
            return {
                userId: formattedUser.id,
                case: "wrong password",
            };
        }
        // dupe check
        const dupedUsernames = await conn_1.drizzlePool.query.employerTable.findMany({
            columns: { username: true, password: true },
            where: (0, drizzle_orm_1.eq)(schema_1.employerTable.username, formattedUser.username),
        });
        let dupeCounter = 0;
        for (const du of dupedUsernames) {
            const exactMatch = await bcryptjs_1.default.compare(password, du.password);
            if (exactMatch) {
                dupeCounter++;
            }
        }
        if (dupeCounter > 1) {
            return {
                userId: formattedUser.id,
                case: "exactDupe",
            };
        }
        // password changeable
        const hashedPassword = await bcryptjs_1.default.hash(password, env_1.saltRounds);
        await conn_1.drizzlePool
            .update(schema_1.employerTable)
            .set({ password: hashedPassword })
            .where((0, drizzle_orm_1.eq)(schema_1.employerTable.id, formattedUser.id));
        return { userId: formattedUser.id };
    }
}
exports.employerModels = employerModels;
