module.exports = function (app) {
    var authData = {
        email: '1234@naver.com',
        password: '1111',
        nickname: 'Guest'
    }

    var passport = require('passport')
        , LocalStrategy = require('passport-local').Strategy;

    app.use(passport.initialize());
    app.use(passport.session());

    //로그인 시 호출되어, 세션에 데이터를 저장
    passport.serializeUser(function (user, done) {
        console.log("Login")
        done(null, user.email);
    });

    //페이지 이동 시, 데이터를 제공
    //done으로 전달된 데이터는 req.user를 통하여 호출 가능.
    passport.deserializeUser(function (id, done) {
        done(null, authData);
    });

    passport.use(new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'pwd'
        },
        function (username, password, done) {
            if (username === authData.email) {
                if (password === authData.password) {
                    return done(null, authData);
                } else {
                    return done(null, false, { message: 'Incorrect password.' });
                }
            } else {
                return done(null, false, { message: 'Incorrect email.' });
            }
        }
    ));

    app.post('/auth/login_process',
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/auth/login',
            failureFlash: true,
            successFlash: 'Hello!'
        }));

    return passport;
}
