// src/config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Tìm kiếm người dùng bằng googleId hoặc email
                let user = await User.findOne({
                    $or: [
                        { googleId: profile.id },
                        { email: profile.emails[0].value },
                    ],
                });

                if (user) {
                    // Kiểm tra xem tài khoản có bị ban không
                    if (user.isBanned) {
                        return done(null, false, { 
                            message: "Your account has been banned. Please contact administrator for more information." 
                        });
                    }

                    // Nếu người dùng tồn tại nhưng chưa có googleId, cập nhật googleId
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        await user.save();
                    }
                    done(null, user);
                } else {
                    // Nếu người dùng chưa tồn tại, tạo mới
                    user = new User({
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        imageUrl: profile.photos[0].value,
                        isBanned: false,
                        role: "JOBSEEKER"
                        // Mật khẩu sẽ không được set nếu đăng nhập bằng Google
                        // Nếu bạn muốn yêu cầu mật khẩu sau này, có thể thêm logic ở đây
                    });
                    await user.save();
                    done(null, user);
                }
            } catch (err) {
                done(err, null);
            }
        }
    )
);

// Passport session setup (không bắt buộc nếu bạn chỉ sử dụng JWT)
// Nhưng nếu bạn muốn giữ session sau khi OAuth, thì cần thiết
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export default passport;
