"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyModels = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const conn_1 = require("../../db/conn");
const schema_1 = require("../../db/schema");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../utilities/env");
class companyModels {
    // singleton design
    static companyModel;
    static instance() {
        if (!this.companyModel) {
            this.companyModel = new companyModels();
        }
        return this.companyModel;
    }
    // check for same name or email
    async duplicateNameEmail(officialName, email) {
        // getting duplicated name or email
        const duplicatedNameOrEmail = await conn_1.drizzlePool
            .select({
            officialName: schema_1.companyTable.officialName,
            email: schema_1.companyTable.email,
        })
            .from(schema_1.companyTable)
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.companyTable.officialName, officialName), (0, drizzle_orm_1.eq)(schema_1.companyTable.email, email)));
        return duplicatedNameOrEmail[0];
    }
    // get users with matched name or email
    async matchNameEmail(nameEmail) {
        const users = await conn_1.drizzlePool.query.companyTable.findMany({
            columns: { id: true, approvalStatus: true, password: true },
            where: (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.companyTable.officialName, nameEmail), (0, drizzle_orm_1.eq)(schema_1.companyTable.email, nameEmail)),
        });
        return users;
    }
    async register(user) {
        const registeredUser = await conn_1.drizzlePool
            .insert(schema_1.companyTable)
            .values({
            officialName: user.officialName,
            email: user.email,
            password: user.hashedPassword,
        })
            .returning({ id: schema_1.companyTable.id });
        //registration approval
        const registeredApproval = await conn_1.drizzlePool
            .insert(schema_1.registrationApprovalTable)
            .values({ userType: "COMPANY", companyId: registeredUser[0].id })
            .returning({ id: schema_1.registrationApprovalTable.id });
        // format registered user
        const registered = {
            userId: registeredUser[0].id,
            approvalId: registeredApproval[0].id,
        };
        return registered;
    }
    // get by id
    async getById(id) {
        const user = await conn_1.drizzlePool.query.companyTable.findFirst({
            columns: { password: false, createdAt: false, updatedAt: false },
            where: (0, drizzle_orm_1.eq)(schema_1.companyTable.id, id),
        });
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
    async approved(user) {
        let result;
        if (user.status === "APPROVED") {
            result = await conn_1.drizzlePool
                .update(schema_1.companyTable)
                .set({ approvalStatus: user.status })
                .where((0, drizzle_orm_1.eq)(schema_1.companyTable.id, user.id))
                .returning({ id: schema_1.companyTable.id });
        }
        else {
            result = await conn_1.drizzlePool
                .delete(schema_1.companyTable)
                .where((0, drizzle_orm_1.eq)(schema_1.companyTable.id, user.id))
                .returning({ id: schema_1.companyTable.id });
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
            .update(schema_1.companyTable)
            .set({ profilePicture: imageUrl })
            .where((0, drizzle_orm_1.eq)(schema_1.companyTable.id, formattedUser.id));
        return { url: imageUrl, userId: formattedUser.id };
    }
    // credentials auth only
    async editOfficialName(officialName, password, user) {
        const formattedUser = user;
        // check for true duplicate
        const currentUserPassword = await conn_1.drizzlePool.query.companyTable.findFirst({
            columns: { password: true },
            where: (0, drizzle_orm_1.eq)(schema_1.companyTable.id, user.id),
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
        if (officialName.length === 0) {
            return {
                userId: formattedUser.id,
                officialName: officialName,
                case: "empty username",
            };
        }
        // duplicate username check
        const dupedOfficialnames = await conn_1.drizzlePool.query.companyTable.findMany({
            columns: { officialName: true, password: true },
            where: (0, drizzle_orm_1.eq)(schema_1.companyTable.officialName, officialName),
        });
        // exact dupe check
        let dupeCounter = 0;
        for (const dupedOfficialname of dupedOfficialnames) {
            const exactDuped = await bcryptjs_1.default.compare(password, dupedOfficialname.password);
            if (exactDuped) {
                dupeCounter++;
            }
        }
        if (dupeCounter > 1) {
            return {
                userId: user.id,
                officialName: officialName,
                case: "exact dupe",
            };
        }
        // no dupe
        await conn_1.drizzlePool
            .update(schema_1.companyTable)
            .set({ officialName: officialName })
            .where((0, drizzle_orm_1.eq)(schema_1.companyTable.id, user.id));
        return {
            userId: user.id,
            officialName: officialName,
        };
    }
    async editEmail(email, user) {
        // duplicate email check
        const dupeEmail = await conn_1.drizzlePool.query.companyTable.findMany({
            columns: { email: true },
            where: (0, drizzle_orm_1.eq)(schema_1.companyTable.email, email),
        });
        if (dupeEmail.length > 1) {
            return null;
        }
        // editable email
        await conn_1.drizzlePool
            .update(schema_1.companyTable)
            .set({ email: email })
            .where((0, drizzle_orm_1.eq)(schema_1.companyTable.id, user.id));
        return { email: email, userId: user.id };
    }
    async editAbout(about, user) {
        const formattedUser = user;
        // new about is empty
        if (about.length === 0) {
            return null;
        }
        await conn_1.drizzlePool
            .update(schema_1.companyTable)
            .set({ aboutUs: about })
            .where((0, drizzle_orm_1.eq)(schema_1.companyTable.id, formattedUser.id));
        return { userId: formattedUser.id, about: about };
    }
    async editAddress(address, provinceAddress, user) {
        const formattedUser = user;
        // check empty string
        if (address.length === 0 || provinceAddress.length === 0) {
            return null;
        }
        await conn_1.drizzlePool
            .update(schema_1.companyTable)
            .set({ address: address, provinceAddress: provinceAddress })
            .where((0, drizzle_orm_1.eq)(schema_1.companyTable.id, formattedUser.id));
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
        await conn_1.drizzlePool
            .update(schema_1.companyTable)
            .set({ contact: contact })
            .where((0, drizzle_orm_1.eq)(schema_1.companyTable.id, formattedUser.id));
        return { userId: formattedUser.id, contact: contact };
    }
    async editPassword(password, oldPassword, user) {
        const formattedUser = user;
        // empty string check
        if (password.length === 0) {
            return null;
        }
        // old password check
        const userPassword = await conn_1.drizzlePool.query.companyTable.findFirst({
            columns: { password: true },
            where: (0, drizzle_orm_1.eq)(schema_1.companyTable.id, formattedUser.id),
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
        const dupedOfficialnames = await conn_1.drizzlePool.query.companyTable.findMany({
            columns: { officialName: true, password: true },
            where: (0, drizzle_orm_1.eq)(schema_1.companyTable.officialName, formattedUser.officialName),
        });
        let dupeCounter = 0;
        for (const du of dupedOfficialnames) {
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
            .update(schema_1.companyTable)
            .set({ password: hashedPassword })
            .where((0, drizzle_orm_1.eq)(schema_1.companyTable.id, formattedUser.id));
        return { userId: formattedUser.id };
    }
}
exports.companyModels = companyModels;
