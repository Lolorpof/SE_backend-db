"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobSeekerModels = void 0;
require("dotenv/config");
const conn_1 = require("../../db/conn");
const schema_1 = require("../../db/schema");
require("../types/usersTypes");
const drizzle_orm_1 = require("drizzle-orm");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../utilities/env");
class jobSeekerModels {
    // singleton design
    static jobSeekerModel;
    static instance() {
        if (!this.jobSeekerModel) {
            this.jobSeekerModel = new jobSeekerModels();
        }
        return this.jobSeekerModel;
    }
    // duplicate name or email check
    async duplicateNameEmail(firstName, lastName, email) {
        let duplicatedNameOrEmail;
        // getting duplicated first name & last name
        duplicatedNameOrEmail = await conn_1.drizzlePool
            .select({
            firstName: schema_1.jobSeekerTable.firstName,
            lastName: schema_1.jobSeekerTable.lastName,
            email: schema_1.jobSeekerTable.email,
        })
            .from(schema_1.jobSeekerTable)
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.jobSeekerTable.firstName, firstName), (0, drizzle_orm_1.eq)(schema_1.jobSeekerTable.lastName, lastName)), (0, drizzle_orm_1.eq)(schema_1.jobSeekerTable.email, email)));
        return duplicatedNameOrEmail[0];
    }
    // register
    async register(user) {
        // job seeker
        const registeredUser = await conn_1.drizzlePool
            .insert(schema_1.jobSeekerTable)
            .values({
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.firstName,
            email: user.email,
            password: user.hashedPassword,
        })
            .returning({ id: schema_1.jobSeekerTable.id });
        //registration approval
        const registeredApproval = await conn_1.drizzlePool
            .insert(schema_1.registrationApprovalTable)
            .values({ userType: "JOBSEEKER", jobSeekerId: registeredUser[0].id })
            .returning({ id: schema_1.registrationApprovalTable.id });
        // format return data
        const registered = {
            userId: registeredUser[0].id,
            approvalId: registeredApproval[0].id,
        };
        return registered;
    }
    // oauth first time
    async oauthUserInsert(profile, provider) {
        const loginUser = await conn_1.drizzlePool
            .insert(schema_1.oauthJobSeekerTable)
            .values({
            firstName: profile._json.given_name,
            lastName: profile._json.family_name,
            email: profile._json.email,
            provider: "GOOGLE",
            providerId: profile.id,
            username: profile._json.given_name,
        })
            .returning({ id: schema_1.oauthJobSeekerTable.id });
        // insert into registration approval
        const registeredApproval = await conn_1.drizzlePool
            .insert(schema_1.registrationApprovalTable)
            .values({ userType: "OAUTHJOBSEEKER", oauthJobSeekerId: loginUser[0].id })
            .returning({ id: schema_1.registrationApprovalTable.id });
        // format return data
        const registered = {
            userId: loginUser[0].id,
            approvalId: registeredApproval[0].id,
        };
        return registered;
    }
    // update oauth profile
    async oauthUserUpdate(profile, currentUser, provider) {
        // remove true if done
        let updateUser;
        if (provider === "GOOGLE" || true) {
            if (currentUser.lastName !== profile._json.family_name ||
                currentUser.firstName !== profile._json.given_name ||
                currentUser.email !== profile._json.email ||
                currentUser.profilePicture !== profile._json.picture) {
                updateUser = await conn_1.drizzlePool
                    .update(schema_1.oauthJobSeekerTable)
                    .set({
                    firstName: profile._json.given_name,
                    lastName: profile._json.family_name,
                    email: profile._json.email,
                    profilePicture: profile._json.picture,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.oauthJobSeekerTable.id, currentUser.id))
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
            where: (0, drizzle_orm_1.eq)(schema_1.registrationApprovalTable.oauthJobSeekerId, userId),
        });
        if (!approvalId) {
            throw Error("No approval id existed");
        }
        return approvalId;
    }
    // {login}
    async matchNameEmail(nameEmail) {
        // find users with name or email
        const users = await conn_1.drizzlePool.query.jobSeekerTable.findMany({
            columns: { id: true, password: true, approvalStatus: true },
            where: (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.jobSeekerTable.username, nameEmail), (0, drizzle_orm_1.eq)(schema_1.jobSeekerTable.email, nameEmail)),
        });
        return users;
    }
    // get all
    async getAll() {
        // get all user's info
        const result = await conn_1.drizzlePool.query.jobSeekerTable.findMany({
            columns: {
                id: false,
                password: false,
                createdAt: false,
                updatedAt: false,
                approvalStatus: false,
            },
            with: {
                skills: { with: { toSkill: { columns: { name: true } } } },
                vulnerabilities: {
                    with: { toVulnerabilityType: { columns: { name: true } } },
                },
            },
        });
        return result;
    }
    // get user by id
    async getById(idOrProviderId, getByProviderId, provider) {
        let user;
        if (!provider) {
            user = await conn_1.drizzlePool.query.jobSeekerTable.findFirst({
                columns: {
                    password: false,
                    createdAt: false,
                    updatedAt: false,
                },
                where: (0, drizzle_orm_1.eq)(schema_1.jobSeekerTable.id, idOrProviderId),
                with: {
                    skills: {
                        columns: {
                            jobSeekerId: false,
                            skillId: false,
                            createdAt: false,
                            updatedAt: false,
                        },
                        with: { toSkill: { columns: { name: true, description: true } } },
                    },
                    vulnerabilities: {
                        columns: { severity: true, publicStatus: true },
                        with: {
                            toVulnerabilityType: {
                                columns: { name: true, description: true },
                            },
                        },
                    },
                },
            });
        }
        else if (getByProviderId) {
            user = await conn_1.drizzlePool.query.oauthJobSeekerTable.findFirst({
                columns: { createdAt: false, updatedAt: false },
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.oauthJobSeekerTable.providerId, idOrProviderId), (0, drizzle_orm_1.eq)(schema_1.oauthJobSeekerTable.provider, provider)),
                with: {
                    skills: {
                        columns: {
                            oauthJobSeekerId: false,
                            skillId: false,
                            createdAt: false,
                            updatedAt: false,
                        },
                        with: { toSkill: { columns: { name: true, description: true } } },
                    },
                    vulnerabilities: {
                        columns: { severity: true, publicStatus: true },
                        with: {
                            toVulnerabilityType: {
                                columns: { name: true, description: true },
                            },
                        },
                    },
                },
            });
        }
        else {
            user = await conn_1.drizzlePool.query.oauthJobSeekerTable.findFirst({
                columns: { createdAt: false, updatedAt: false },
                where: (0, drizzle_orm_1.eq)(schema_1.oauthJobSeekerTable.id, idOrProviderId),
                with: {
                    skills: {
                        with: { toSkill: { columns: { name: true, description: true } } },
                    },
                    vulnerabilities: {
                        with: {
                            toVulnerabilityType: {
                                columns: { name: true, description: true },
                            },
                        },
                    },
                },
            });
        }
        return user;
    }
    // user approved by admin
    async approved(user, isOauth) {
        let result;
        if (user.status === "APPROVED") {
            if (isOauth) {
                result = await conn_1.drizzlePool
                    .update(schema_1.oauthJobSeekerTable)
                    .set({ approvalStatus: user.status })
                    .where((0, drizzle_orm_1.eq)(schema_1.oauthJobSeekerTable.id, user.id))
                    .returning({ id: schema_1.oauthJobSeekerTable.id });
            }
            else {
                result = await conn_1.drizzlePool
                    .update(schema_1.jobSeekerTable)
                    .set({ approvalStatus: user.status })
                    .where((0, drizzle_orm_1.eq)(schema_1.jobSeekerTable.id, user.id))
                    .returning({ id: schema_1.jobSeekerTable.id });
            }
        }
        else {
            if (isOauth) {
                result = await conn_1.drizzlePool
                    .delete(schema_1.oauthJobSeekerTable)
                    .where((0, drizzle_orm_1.eq)(schema_1.oauthJobSeekerTable.id, user.id))
                    .returning({ id: schema_1.oauthJobSeekerTable.id });
            }
            else {
                result = await conn_1.drizzlePool
                    .delete(schema_1.jobSeekerTable)
                    .where((0, drizzle_orm_1.eq)(schema_1.jobSeekerTable.id, user.id))
                    .returning({ id: schema_1.jobSeekerTable.id });
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
    // upload registration image into approval table
    async uploadRegistrationImage(approvalId, imageUrl) {
        // update approval table at approvalId with image
        await conn_1.drizzlePool
            .update(schema_1.registrationApprovalTable)
            .set({ imageUrl: imageUrl })
            .where((0, drizzle_orm_1.eq)(schema_1.registrationApprovalTable.id, approvalId));
        return { approvalId, url: imageUrl };
    }
    // upload profile image and return link, no oauth
    async uploadProfilePicture(imageUrl, user) {
        const formattedUser = user;
        await conn_1.drizzlePool
            .update(schema_1.jobSeekerTable)
            .set({ profilePicture: imageUrl })
            .where((0, drizzle_orm_1.eq)(schema_1.jobSeekerTable.id, formattedUser.id));
        return { url: imageUrl, userId: formattedUser.id };
    }
    // upload resume image and return link
    async uploadResume(imageUrl, user) {
        // update url in table
        // check oauth
        if (user.isOauth) {
            await conn_1.drizzlePool
                .update(schema_1.oauthJobSeekerTable)
                .set({ resume: imageUrl })
                .where((0, drizzle_orm_1.eq)(schema_1.oauthJobSeekerTable.id, user.id));
        }
        else {
            await conn_1.drizzlePool
                .update(schema_1.jobSeekerTable)
                .set({ resume: imageUrl })
                .where((0, drizzle_orm_1.eq)(schema_1.jobSeekerTable.id, user.id));
        }
        return { url: imageUrl, userId: user.id };
    }
    // credentials auth only
    async editUsername(username, password, user) {
        const formattedUser = user;
        // check for true duplicate
        const currentUserPassword = await conn_1.drizzlePool.query.jobSeekerTable.findFirst({
            columns: { password: true },
            where: (0, drizzle_orm_1.eq)(schema_1.jobSeekerTable.id, user.id),
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
            return { userId: user.id, username: username, case: "empty username" };
        }
        // duplicate username check
        const dupedUsernames = await conn_1.drizzlePool.query.jobSeekerTable.findMany({
            columns: { username: true, password: true },
            where: (0, drizzle_orm_1.eq)(schema_1.jobSeekerTable.username, username),
        });
        // exact dupe check
        let dupeCounter = 0;
        for (const dupedUsername of dupedUsernames) {
            const exactDuped = await bcryptjs_1.default.compare(password, dupedUsername.password);
            if (exactDuped) {
                dupeCounter++;
            }
        }
        if (dupeCounter > 1) {
            return {
                userId: user.id,
                username: username,
                case: "exact dupe",
            };
        }
        // no dupe
        await conn_1.drizzlePool
            .update(schema_1.jobSeekerTable)
            .set({ username: username })
            .where((0, drizzle_orm_1.eq)(schema_1.jobSeekerTable.id, user.id));
        return {
            userId: user.id,
            username: username,
        };
    }
    async editEmail(email, user) {
        // duplicate email check
        const dupeEmail = await conn_1.drizzlePool.query.jobSeekerTable.findMany({
            columns: { email: true },
            where: (0, drizzle_orm_1.eq)(schema_1.jobSeekerTable.email, email),
        });
        if (dupeEmail.length > 1) {
            return null;
        }
        // editable email
        await conn_1.drizzlePool
            .update(schema_1.jobSeekerTable)
            .set({ email: email })
            .where((0, drizzle_orm_1.eq)(schema_1.jobSeekerTable.id, user.id));
        return { email: email, userId: user.id };
    }
    async editFullName(firstName, lastName, user) {
        const formattedUser = user;
        // check dupe
        const dupedName = await conn_1.drizzlePool.query.jobSeekerTable.findMany({
            columns: { firstName: true, lastName: true },
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.jobSeekerTable.firstName, firstName), (0, drizzle_orm_1.eq)(schema_1.jobSeekerTable.lastName, lastName)),
        });
        if (dupedName.length > 1) {
            return null;
        }
        // no dupe
        await conn_1.drizzlePool
            .update(schema_1.jobSeekerTable)
            .set({ firstName: firstName, lastName: lastName })
            .where((0, drizzle_orm_1.eq)(schema_1.jobSeekerTable.id, formattedUser.id));
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
                .update(schema_1.oauthJobSeekerTable)
                .set({ aboutMe: about })
                .where((0, drizzle_orm_1.eq)(schema_1.oauthJobSeekerTable.id, formattedUser.id));
        }
        else {
            await conn_1.drizzlePool
                .update(schema_1.jobSeekerTable)
                .set({ aboutMe: about })
                .where((0, drizzle_orm_1.eq)(schema_1.jobSeekerTable.id, formattedUser.id));
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
                .update(schema_1.oauthJobSeekerTable)
                .set({ address: address, provinceAddress: provinceAddress })
                .where((0, drizzle_orm_1.eq)(schema_1.oauthJobSeekerTable.id, formattedUser.id));
        }
        else {
            await conn_1.drizzlePool
                .update(schema_1.jobSeekerTable)
                .set({ address: address, provinceAddress: provinceAddress })
                .where((0, drizzle_orm_1.eq)(schema_1.jobSeekerTable.id, formattedUser.id));
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
                .update(schema_1.oauthJobSeekerTable)
                .set({ contact: contact })
                .where((0, drizzle_orm_1.eq)(schema_1.oauthJobSeekerTable.id, formattedUser.id));
        }
        else {
            await conn_1.drizzlePool
                .update(schema_1.jobSeekerTable)
                .set({ contact: contact })
                .where((0, drizzle_orm_1.eq)(schema_1.jobSeekerTable.id, formattedUser.id));
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
        const userPassword = await conn_1.drizzlePool.query.jobSeekerTable.findFirst({
            columns: { password: true },
            where: (0, drizzle_orm_1.eq)(schema_1.jobSeekerTable.id, formattedUser.id),
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
        const dupedUsernames = await conn_1.drizzlePool.query.jobSeekerTable.findMany({
            columns: { username: true, password: true },
            where: (0, drizzle_orm_1.eq)(schema_1.jobSeekerTable.username, formattedUser.username),
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
            .update(schema_1.jobSeekerTable)
            .set({ password: hashedPassword })
            .where((0, drizzle_orm_1.eq)(schema_1.jobSeekerTable.id, formattedUser.id));
        return { userId: formattedUser.id };
    }
    async editSkill(skillsId, user) {
        const addedSkillsId = [];
        let notExist = false;
        // check oauth
        if (user.isOauth) {
            // delete all user skill first
            await conn_1.drizzlePool
                .delete(schema_1.oauthJobSeekerSkillTable)
                .where((0, drizzle_orm_1.eq)(schema_1.oauthJobSeekerSkillTable.oauthJobSeekerId, user.id));
            // then insert everything again
            for (const skillId of skillsId) {
                const checkSkillExist = await conn_1.drizzlePool.query.skillTable.findFirst({
                    columns: { id: true },
                    where: (0, drizzle_orm_1.eq)(schema_1.skillTable.id, skillId),
                });
                if (!checkSkillExist) {
                    notExist = true;
                    continue;
                }
                await conn_1.drizzlePool
                    .insert(schema_1.oauthJobSeekerSkillTable)
                    .values({ skillId: skillId, oauthJobSeekerId: user.id });
                addedSkillsId.push(skillId);
            }
        }
        else {
            // delete all user skill first
            await conn_1.drizzlePool
                .delete(schema_1.jobSeekerSkillTable)
                .where((0, drizzle_orm_1.eq)(schema_1.jobSeekerSkillTable.jobSeekerId, user.id));
            // then insert everything again
            for (const skillId of skillsId) {
                const checkSkillExist = await conn_1.drizzlePool.query.skillTable.findFirst({
                    columns: { id: true },
                    where: (0, drizzle_orm_1.eq)(schema_1.skillTable.id, skillId),
                });
                if (!checkSkillExist) {
                    notExist = true;
                    continue;
                }
                await conn_1.drizzlePool
                    .insert(schema_1.jobSeekerSkillTable)
                    .values({ skillId: skillId, jobSeekerId: user.id });
                addedSkillsId.push(skillId);
            }
        }
        if (notExist) {
            return { skillsId: addedSkillsId, userId: user.id, case: "not exist" };
        }
        return { skillsId, userId: user.id };
    }
    async editVulnerability(vulnerabilitiesId, user) {
        const addedVulnerabilitiesId = [];
        let notExist = false;
        // check oauth
        if (user.isOauth) {
            // delete all user skill first
            await conn_1.drizzlePool
                .delete(schema_1.oauthJobSeekerVulnerabilityTable)
                .where((0, drizzle_orm_1.eq)(schema_1.oauthJobSeekerVulnerabilityTable.oauthJobSeekerId, user.id));
            // then insert everything again
            for (const vulnerabilityId of vulnerabilitiesId) {
                const checkVulnerabilityExist = await conn_1.drizzlePool.query.vulnerabilityTypeTable.findFirst({
                    columns: { id: true },
                    where: (0, drizzle_orm_1.eq)(schema_1.vulnerabilityTypeTable.id, vulnerabilityId),
                });
                if (!checkVulnerabilityExist) {
                    notExist = true;
                    continue;
                }
                await conn_1.drizzlePool.insert(schema_1.oauthJobSeekerVulnerabilityTable).values({
                    vulnerabilityTypeId: vulnerabilityId,
                    oauthJobSeekerId: user.id,
                });
                addedVulnerabilitiesId.push(vulnerabilityId);
            }
        }
        else {
            // delete all user skill first
            await conn_1.drizzlePool
                .delete(schema_1.jobSeekerVulnerabilityTable)
                .where((0, drizzle_orm_1.eq)(schema_1.jobSeekerVulnerabilityTable.jobSeekerId, user.id));
            // then insert everything again
            for (const vulnerabilityId of vulnerabilitiesId) {
                const checkVulnerabilityExist = await conn_1.drizzlePool.query.vulnerabilityTypeTable.findFirst({
                    columns: { id: true },
                    where: (0, drizzle_orm_1.eq)(schema_1.vulnerabilityTypeTable.id, vulnerabilityId),
                });
                if (!checkVulnerabilityExist) {
                    notExist = true;
                    continue;
                }
                await conn_1.drizzlePool.insert(schema_1.jobSeekerVulnerabilityTable).values({
                    vulnerabilityTypeId: vulnerabilityId,
                    jobSeekerId: user.id,
                });
                addedVulnerabilitiesId.push(vulnerabilityId);
            }
        }
        if (notExist) {
            return {
                vulnerabilitiesId: addedVulnerabilitiesId,
                userId: user.id,
                case: "not exist",
            };
        }
        return { vulnerabilitiesId, userId: user.id };
    }
}
exports.jobSeekerModels = jobSeekerModels;
