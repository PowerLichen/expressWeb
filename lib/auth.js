module.exports = {
    isOwner: function (req, res) {
        if (req.user) {
            return true;
        }
        return false;
    },
    statusUI: function (req, res) {
        var authStatusUI = '<a href="/auth/login">login</a>';
        if (this.isOwner(req, res)) {
            authStatusUI = `${req.user.nickname} | <a href="/auth/logout">logout</a>`
        }
        return authStatusUI
    }
}



