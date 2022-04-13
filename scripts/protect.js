var Auth = function () {
    var checkToken = function () {
        if (!Cookies.get('token')) {
            window.location.href = '/login.html'
        }

        $.ajaxSetup({
            headers: {
                Authorization: 'Bearer ' + Cookies.get('token')
            }
        });

        let username = Cookies.get('username') || 'User';

        $("#navbarNav .user-details>a").text(username);
    };

    var logout = function () {
        $(".user-details a.logout-btn").on('click', function (e) {
            e.preventDefault();

            $.post({
                url: 'http://localhost/api/logout',
                dataType: 'json',
                success: function () {
                    Cookies.remove('token');
                    window.location.href = '/login.html'
                },
                error: function (error) {
                    console.log(error)
                },
            })

        });
    };

    return {
        init: function () {
            checkToken();
            logout();
        },
    }
}();

$(document).ready(function () {
    Auth.init();
})