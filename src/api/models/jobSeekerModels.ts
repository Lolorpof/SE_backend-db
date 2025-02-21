import "dotenv/config";
import { drizzlePool } from "../../db/conn";
import {
  jobSeekerSkillTable,
  jobSeekerTable,
  jobSeekerVulnerabilityTable,
  oauthJobSeekerSkillTable,
  oauthJobSeekerTable,
  oauthJobSeekerVulnerabilityTable,
  registrationApprovalTable,
  skillTable,
  vulnerabilityTypeTable,
} from "../../db/schema";
import "../types/usersTypes";
import { and, eq, or } from "drizzle-orm";
import {
  jobSeekerModelInterfaces,
  userModelInterfaces,
  userOauthModelInterfaces,
} from "../interfaces/userModelInterfaces";
import { Profile as GoogleProfile } from "passport-google-oauth20";
import { TApprovedRequest } from "../validators/usersValidator";
import {
  TEditAboutResponse,
  TEditAddressResponse,
  TEditContactResponse,
  TEditEmailResponse,
  TEditFullNameResponse,
  TEditJobSeekerSkillResponse,
  TEditJobSeekerVulnerabilityResponse,
  TEditPasswordResponse,
  TEditUsernameResponse,
} from "../types/editUserProfile";
import { catchError } from "../utilities/utilFunctions";
import bcrypt from "bcryptjs";
import { saltRounds } from "../utilities/env";
import {
  createBucketIfNotExisted,
  userProfileImageBucket,
} from "../utilities/minio";

export class jobSeekerModels implements jobSeekerModelInterfaces {
  // singleton design
  private static jobSeekerModel: jobSeekerModels | undefined;
  static instance() {
    if (!this.jobSeekerModel) {
      this.jobSeekerModel = new jobSeekerModels();
    }
    return this.jobSeekerModel;
  }

  // duplicate name or email check
  async duplicateNameEmail(firstName: string, lastName: string, email: string) {
    let duplicatedNameOrEmail;
    // getting duplicated first name & last name
    duplicatedNameOrEmail = await drizzlePool
      .select({
        firstName: jobSeekerTable.firstName,
        lastName: jobSeekerTable.lastName,
        email: jobSeekerTable.email,
      })
      .from(jobSeekerTable)
      .where(
        or(
          and(
            eq(jobSeekerTable.firstName, firstName),
            eq(jobSeekerTable.lastName, lastName)
          ),
          eq(jobSeekerTable.email, email)
        )
      );

    return duplicatedNameOrEmail[0];
  }

  // register
  async register(user: TFormattedSingleUserRegister): Promise<TRegisterUser> {
    // job seeker
    const registeredUser = await drizzlePool
      .insert(jobSeekerTable)
      .values({
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.firstName,
        email: user.email,
        password: user.hashedPassword,
      })
      .returning({ id: jobSeekerTable.id });

    //registration approval
    const registeredApproval = await drizzlePool
      .insert(registrationApprovalTable)
      .values({ userType: "JOBSEEKER", jobSeekerId: registeredUser[0].id })
      .returning({ id: registrationApprovalTable.id });

    // format return data
    const registered: TRegisterUser = {
      userId: registeredUser[0].id,
      approvalId: registeredApproval[0].id,
    };

    return registered;
  }

  // oauth first time
  async oauthUserInsert(
    profile: GoogleProfile,
    provider: "GOOGLE" | "LINE"
  ): Promise<TRegisterUser> {
    const loginUser = await drizzlePool
      .insert(oauthJobSeekerTable)
      .values({
        firstName: profile._json.given_name as string,
        lastName: profile._json.family_name as string,
        email: profile._json.email as string,
        provider: "GOOGLE",
        providerId: profile.id,
        username: profile._json.given_name as string,
      })
      .returning({ id: oauthJobSeekerTable.id });

    // insert into registration approval
    const registeredApproval = await drizzlePool
      .insert(registrationApprovalTable)
      .values({ userType: "OAUTHJOBSEEKER", oauthJobSeekerId: loginUser[0].id })
      .returning({ id: registrationApprovalTable.id });

    // format return data
    const registered: TRegisterUser = {
      userId: loginUser[0].id,
      approvalId: registeredApproval[0].id,
    };

    return registered;
  }

  // update oauth profile
  async oauthUserUpdate(
    profile: GoogleProfile,
    currentUser: TJobSeeker,
    provider: "GOOGLE" | "LINE"
  ): Promise<TJobSeeker> {
    // remove true if done
    let updateUser;
    if (provider === "GOOGLE" || true) {
      if (
        currentUser.lastName !== profile._json.family_name ||
        currentUser.firstName !== profile._json.given_name ||
        currentUser.email !== profile._json.email ||
        currentUser.profilePicture !== profile._json.picture
      ) {
        updateUser = await drizzlePool
          .update(oauthJobSeekerTable)
          .set({
            firstName: profile._json.given_name,
            lastName: profile._json.family_name,
            email: profile._json.email,
            profilePicture: profile._json.picture,
          })
          .where(eq(oauthJobSeekerTable.id, currentUser.id))
          .returning();
      }
    }

    // no updated done
    if (!updateUser) {
      return currentUser;
    }

    const user: TJobSeeker = updateUser[0] as TJobSeeker;
    return user;
  }

  // get approval id for oauth
  async oauthGetApprovalId(userId: string): Promise<TGetId> {
    const approvalId =
      await drizzlePool.query.registrationApprovalTable.findFirst({
        columns: { id: true },
        where: eq(registrationApprovalTable.oauthJobSeekerId, userId),
      });
    if (!approvalId) {
      throw Error("No approval id existed");
    }

    return approvalId;
  }

  // {login}
  async matchNameEmail(nameEmail: string) {
    // find users with name or email
    const users = await drizzlePool.query.jobSeekerTable.findMany({
      columns: { id: true, password: true, approvalStatus: true },
      where: or(
        eq(jobSeekerTable.username, nameEmail),
        eq(jobSeekerTable.email, nameEmail)
      ),
    });

    return users;
  }

  // get all
  async getAll() {
    // get all user's info
    const result = await drizzlePool.query.jobSeekerTable.findMany({
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
  async getById(
    idOrProviderId: string,
    getByProviderId?: boolean,
    provider?: "GOOGLE" | "LINE"
  ) {
    let user: TJobSeeker | undefined;
    if (!provider) {
      user = await drizzlePool.query.jobSeekerTable.findFirst({
        columns: {
          password: false,
          createdAt: false,
          updatedAt: false,
        },
        where: eq(jobSeekerTable.id, idOrProviderId),
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
    } else if (getByProviderId) {
      user = await drizzlePool.query.oauthJobSeekerTable.findFirst({
        columns: { createdAt: false, updatedAt: false },
        where: and(
          eq(oauthJobSeekerTable.providerId, idOrProviderId),
          eq(oauthJobSeekerTable.provider, provider)
        ),
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
    } else {
      user = await drizzlePool.query.oauthJobSeekerTable.findFirst({
        columns: { createdAt: false, updatedAt: false },
        where: eq(oauthJobSeekerTable.id, idOrProviderId),
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
  async approved(
    user: TApprovingUser,
    isOauth: boolean
  ): Promise<TApproveUser> {
    let result: TApproveUser[];
    if (user.status === "APPROVED") {
      if (isOauth) {
        result = await drizzlePool
          .update(oauthJobSeekerTable)
          .set({ approvalStatus: user.status })
          .where(eq(oauthJobSeekerTable.id, user.id))
          .returning({ id: oauthJobSeekerTable.id });
      } else {
        result = await drizzlePool
          .update(jobSeekerTable)
          .set({ approvalStatus: user.status })
          .where(eq(jobSeekerTable.id, user.id))
          .returning({ id: jobSeekerTable.id });
      }
    } else {
      if (isOauth) {
        result = await drizzlePool
          .delete(oauthJobSeekerTable)
          .where(eq(oauthJobSeekerTable.id, user.id))
          .returning({ id: oauthJobSeekerTable.id });
      } else {
        result = await drizzlePool
          .delete(jobSeekerTable)
          .where(eq(jobSeekerTable.id, user.id))
          .returning({ id: jobSeekerTable.id });
      }
    }

    return result[0];
  }

  // check if approval id existed
  async approvalExisted(approvalId: string): Promise<boolean> {
    const approval =
      await drizzlePool.query.registrationApprovalTable.findFirst({
        columns: { id: true },
        where: eq(registrationApprovalTable.id, approvalId),
      });

    if (!approval) return false;

    return true;
  }

  // upload registration image into approval table
  async uploadRegistrationImage(
    approvalId: string,
    imageUrl: string
  ): Promise<TRegisterImage> {
    // update approval table at approvalId with image
    await drizzlePool
      .update(registrationApprovalTable)
      .set({ imageUrl: imageUrl })
      .where(eq(registrationApprovalTable.id, approvalId));

    return { approvalId, url: imageUrl };
  }

  // upload profile image and return link, no oauth
  async uploadProfilePicture(
    imageUrl: string,
    user: TGenericUserSession
  ): Promise<TProfileImage> {
    const formattedUser = user as TJobSeekerSession;

    await drizzlePool
      .update(jobSeekerTable)
      .set({ profilePicture: imageUrl })
      .where(eq(jobSeekerTable.id, formattedUser.id));

    return { url: imageUrl, userId: formattedUser.id };
  }

  // upload resume image and return link
  async uploadResume(
    imageUrl: string,
    user: TJobSeekerSession
  ): Promise<TResumeImage> {
    // update url in table
    // check oauth
    if (user.isOauth) {
      await drizzlePool
        .update(oauthJobSeekerTable)
        .set({ resume: imageUrl })
        .where(eq(oauthJobSeekerTable.id, user.id));
    } else {
      await drizzlePool
        .update(jobSeekerTable)
        .set({ resume: imageUrl })
        .where(eq(jobSeekerTable.id, user.id));
    }

    return { url: imageUrl, userId: user.id };
  }

  // credentials auth only
  async editUsername(
    username: string,
    password: string,
    user: TGenericUserSession
  ): Promise<TEditUsernameResponse | null> {
    const formattedUser = user as TJobSeekerSession;
    // check for true duplicate
    const currentUserPassword =
      await drizzlePool.query.jobSeekerTable.findFirst({
        columns: { password: true },
        where: eq(jobSeekerTable.id, user.id),
      });

    // password check
    if (!currentUserPassword) {
      return null;
    }
    const passwordMatched = await bcrypt.compare(
      password,
      currentUserPassword.password
    );
    if (!passwordMatched) {
      return null;
    }

    // username is empty string
    if (username.length === 0) {
      return { userId: user.id, username: username, case: "empty username" };
    }

    // duplicate username check
    const dupedUsernames = await drizzlePool.query.jobSeekerTable.findMany({
      columns: { username: true, password: true },
      where: eq(jobSeekerTable.username, username),
    });

    // exact dupe check
    for (const dupedUsername of dupedUsernames) {
      const exactDuped = await bcrypt.compare(password, dupedUsername.password);

      if (exactDuped) {
        return {
          userId: user.id,
          username: dupedUsername.username,
          case: "exact dupe",
        };
      }
    }

    // no dupe
    await drizzlePool
      .update(jobSeekerTable)
      .set({ username: username })
      .where(eq(jobSeekerTable.id, user.id));
    return {
      userId: user.id,
      username: username,
    };
  }

  async editEmail(
    email: string,
    user: TGenericUserSession
  ): Promise<TEditEmailResponse | null> {
    // duplicate email check
    const dupeEmail = await drizzlePool.query.jobSeekerTable.findFirst({
      columns: { email: true },
      where: eq(jobSeekerTable.email, email),
    });

    if (dupeEmail) {
      return null;
    }

    // editable email
    await drizzlePool
      .update(jobSeekerTable)
      .set({ email: email })
      .where(eq(jobSeekerTable.id, user.id));

    return { email: email, userId: user.id };
  }

  async editFullName(
    firstName: string,
    lastName: string,
    user: TGenericUserSession
  ): Promise<TEditFullNameResponse | null> {
    const formattedUser = user as TJobSeekerSession;

    // check dupe
    const dupedName = await drizzlePool.query.jobSeekerTable.findFirst({
      columns: { firstName: true, lastName: true },
      where: and(
        eq(jobSeekerTable.firstName, firstName),
        eq(jobSeekerTable.lastName, lastName)
      ),
    });
    if (dupedName) {
      return null;
    }

    // no dupe
    await drizzlePool
      .update(jobSeekerTable)
      .set({ firstName: firstName, lastName: lastName })
      .where(eq(jobSeekerTable.id, formattedUser.id));

    return {
      userId: formattedUser.id,
      firstName: firstName,
      lastName: lastName,
    };
  }

  async editAbout(
    about: string,
    user: TGenericUserSession
  ): Promise<TEditAboutResponse | null> {
    const formattedUser = user as TJobSeekerSession;
    // new about is empty
    if (about.length === 0) {
      return null;
    }

    // oauth check
    if (formattedUser.isOauth) {
      await drizzlePool
        .update(oauthJobSeekerTable)
        .set({ aboutMe: about })
        .where(eq(oauthJobSeekerTable.id, formattedUser.id));
    } else {
      await drizzlePool
        .update(jobSeekerTable)
        .set({ aboutMe: about })
        .where(eq(jobSeekerTable.id, formattedUser.id));
    }

    return { userId: formattedUser.id, about: about };
  }

  async editAddress(
    address: string,
    provinceAddress: string,
    user: TGenericUserSession
  ): Promise<TEditAddressResponse | null> {
    const formattedUser = user as TJobSeekerSession;

    // check empty string
    if (address.length === 0 || provinceAddress.length === 0) {
      return null;
    }

    // oauth check
    if (formattedUser.isOauth) {
      await drizzlePool
        .update(oauthJobSeekerTable)
        .set({ address: address, provinceAddress: provinceAddress })
        .where(eq(oauthJobSeekerTable.id, formattedUser.id));
    } else {
      await drizzlePool
        .update(jobSeekerTable)
        .set({ address: address, provinceAddress: provinceAddress })
        .where(eq(jobSeekerTable.id, formattedUser.id));
    }

    return {
      userId: formattedUser.id,
      address: address,
      provinceAddress: provinceAddress,
    };
  }

  async editContact(
    contact: string,
    user: TGenericUserSession
  ): Promise<TEditContactResponse | null> {
    const formattedUser = user as TJobSeekerSession;

    // contact empty string
    if (contact.length === 0) {
      return null;
    }

    // oauth check
    if (formattedUser.isOauth) {
      await drizzlePool
        .update(oauthJobSeekerTable)
        .set({ contact: contact })
        .where(eq(oauthJobSeekerTable.id, formattedUser.id));
    } else {
      await drizzlePool
        .update(jobSeekerTable)
        .set({ contact: contact })
        .where(eq(jobSeekerTable.id, formattedUser.id));
    }

    return { userId: formattedUser.id, contact: contact };
  }

  async editPassword(
    password: string,
    oldPassword: string,
    user: TGenericUserSession
  ): Promise<TEditPasswordResponse | null> {
    const formattedUser = user as TJobSeekerSession;

    // empty string check
    if (password.length === 0) {
      return null;
    }

    // old password check
    const userPassword = await drizzlePool.query.jobSeekerTable.findFirst({
      columns: { password: true },
      where: eq(jobSeekerTable.id, formattedUser.id),
    });
    if (!userPassword) {
      console.error("***No user found***");
      return {
        userId: formattedUser.id,
        case: "no user",
      };
    }
    const correct = await bcrypt.compare(oldPassword, userPassword.password);
    if (!correct) {
      return {
        userId: formattedUser.id,
        case: "wrong password",
      };
    }

    // dupe check
    const dupedUsernames = await drizzlePool.query.jobSeekerTable.findMany({
      columns: { username: true, password: true },
      where: eq(jobSeekerTable.username, formattedUser.username),
    });
    for (const du of dupedUsernames) {
      const exactMatch = await bcrypt.compare(password, du.password);

      if (exactMatch) {
        return {
          userId: formattedUser.id,
          case: "exactDupe",
        };
      }
    }

    // password changeable
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await drizzlePool
      .update(jobSeekerTable)
      .set({ password: hashedPassword })
      .where(eq(jobSeekerTable.id, formattedUser.id));

    return { userId: formattedUser.id };
  }

  async editSkill(
    skillsId: string[],
    user: TJobSeekerSession
  ): Promise<TEditJobSeekerSkillResponse> {
    const addedSkillsId: string[] = [];
    let notExist = false;
    // check oauth
    if (user.isOauth) {
      // delete all user skill first
      await drizzlePool
        .delete(oauthJobSeekerSkillTable)
        .where(eq(oauthJobSeekerSkillTable.oauthJobSeekerId, user.id));

      // then insert everything again
      for (const skillId of skillsId) {
        const checkSkillExist = await drizzlePool.query.skillTable.findFirst({
          columns: { id: true },
          where: eq(skillTable.id, skillId),
        });
        if (!checkSkillExist) {
          notExist = true;
          continue;
        }

        await drizzlePool
          .insert(oauthJobSeekerSkillTable)
          .values({ skillId: skillId, oauthJobSeekerId: user.id });
        addedSkillsId.push(skillId);
      }
    } else {
      // delete all user skill first
      await drizzlePool
        .delete(jobSeekerSkillTable)
        .where(eq(jobSeekerSkillTable.jobSeekerId, user.id));

      // then insert everything again
      for (const skillId of skillsId) {
        const checkSkillExist = await drizzlePool.query.skillTable.findFirst({
          columns: { id: true },
          where: eq(skillTable.id, skillId),
        });
        if (!checkSkillExist) {
          notExist = true;
          continue;
        }

        await drizzlePool
          .insert(jobSeekerSkillTable)
          .values({ skillId: skillId, jobSeekerId: user.id });
        addedSkillsId.push(skillId);
      }
    }

    if (notExist) {
      return { skillsId: addedSkillsId, userId: user.id, case: "not exist" };
    }
    return { skillsId, userId: user.id };
  }

  async editVulnerability(
    vulnerabilitiesId: string[],
    user: TJobSeekerSession
  ): Promise<TEditJobSeekerVulnerabilityResponse> {
    const addedVulnerabilitiesId: string[] = [];
    let notExist = false;

    // check oauth
    if (user.isOauth) {
      // delete all user skill first
      await drizzlePool
        .delete(oauthJobSeekerVulnerabilityTable)
        .where(eq(oauthJobSeekerVulnerabilityTable.oauthJobSeekerId, user.id));

      // then insert everything again
      for (const vulnerabilityId of vulnerabilitiesId) {
        const checkVulnerabilityExist =
          await drizzlePool.query.vulnerabilityTypeTable.findFirst({
            columns: { id: true },
            where: eq(vulnerabilityTypeTable.id, vulnerabilityId),
          });
        if (!checkVulnerabilityExist) {
          notExist = true;
          continue;
        }

        await drizzlePool.insert(oauthJobSeekerVulnerabilityTable).values({
          vulnerabilityTypeId: vulnerabilityId,
          oauthJobSeekerId: user.id,
        });
        addedVulnerabilitiesId.push(vulnerabilityId);
      }
    } else {
      // delete all user skill first
      await drizzlePool
        .delete(jobSeekerVulnerabilityTable)
        .where(eq(jobSeekerVulnerabilityTable.jobSeekerId, user.id));

      // then insert everything again
      for (const vulnerabilityId of vulnerabilitiesId) {
        const checkVulnerabilityExist =
          await drizzlePool.query.vulnerabilityTypeTable.findFirst({
            columns: { id: true },
            where: eq(vulnerabilityTypeTable.id, vulnerabilityId),
          });
        if (!checkVulnerabilityExist) {
          notExist = true;
          continue;
        }

        await drizzlePool.insert(jobSeekerVulnerabilityTable).values({
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
