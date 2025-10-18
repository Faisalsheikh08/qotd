// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";

// const handler = NextAuth({
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_ID,
//       clientSecret: process.env.GOOGLE_SECRET,
//     }),
//   ],
//   pages: {
//     signIn: "/",
//   },
// });

// export { handler as GET, handler as POST };

// src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/db/connection";
import User from "@/lib/db/models/User";
import Activity from "@/lib/db/models/Activity";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      try {
        await connectDB();

        if (user) {
          // User is signing in for the first time
          let dbUser = await User.findByEmail(user.email);

          if (!dbUser) {
            // Create new user in database
            dbUser = await User.create({
              name: user.name || account.providerAccountId,
              email: user.email,
              image: user.image,
              emailVerified: new Date(),
              role: "user",
              googleProfile: {
                sub: account.providerAccountId,
                given_name: user.name?.split(" ")[0] || "",
                family_name: user.name?.split(" ").slice(1).join(" ") || "",
                picture: user.image,
                email_verified: true,
              },
              loginCount: 1,
              lastLoginDate: new Date(),
            });

            console.log("New user created:", dbUser._id);

            // Log login activity
            await Activity.create({
              userId: dbUser._id,
              date: new Date(),
              count: 1,
              activityType: "login",
            });
          } else {
            // Existing user - update last login
            await User.findByIdAndUpdate(
              dbUser._id,
              {
                lastLoginDate: new Date(),
                $inc: { loginCount: 1 },
              },
              { new: true }
            );

            // Log login activity
            await Activity.create({
              userId: dbUser._id,
              date: new Date(),
              count: 1,
              activityType: "login",
            });
          }

          token.id = dbUser._id.toString();
          token.role = dbUser.role;
          token.email = dbUser.email;
        }

        return token;
      } catch (error) {
        console.error("JWT callback error:", error);
        return token;
      }
    },

    async session({ session, token }) {
      try {
        await connectDB();

        if (token.id) {
          const user = await User.findById(token.id).select(
            "-password -adminNotes"
          );

          session.user = {
            ...session.user,
            id: token.id,
            role: token.role,
            ...user?.toObject(),
          };
        }

        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        return session;
      }
    },

    async signIn({ user, account, profile }) {
      try {
        await connectDB();

        const existingUser = await User.findByEmail(user.email);

        if (existingUser && existingUser.isBanned) {
          return false; // Deny access if user is banned
        }

        return true;
      } catch (error) {
        console.error("Sign in error:", error);
        return false;
      }
    },
  },

  events: {
    async signOut({ token }) {
      try {
        await connectDB();

        if (token.id) {
          // Optional: Log logout activity
          await Activity.create({
            userId: token.id,
            date: new Date(),
            count: 1,
            activityType: "logout",
          });
        }
      } catch (error) {
        console.error("Sign out event error:", error);
      }
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
