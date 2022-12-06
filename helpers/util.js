module.exports = {
    isLoggedIn: (req, res, next) => {
        if (req.session.user) {
            next()
        } else {
            res.redirect('/')
        }
    },

    isLoggedIn_admin: (req, res, next) => {
        if (req.session.user.role == 'admin') {
            next()
        } else {
            res.redirect('/sales')
        }
    }
}

