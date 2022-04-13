$(document).ready(function () {
    if (!Cookies.get('token')) {
        window.location.href = '/login.html'
    }

    $.ajaxSetup({
        headers: {
            Authorization: 'Bearer ' + Cookies.get('token')
        }
    });
})