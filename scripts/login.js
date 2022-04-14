var LoginPage = function () {
    let handleLogin = function () {
        let form = $("form#login");

        form.on('submit', function (e) {
            e.preventDefault();

            let data = {
                email: $("[name='email']", form).val(),
                password: $("[name='password']", form).val(),
            };

            $.ajax({
                url: URL + '/api/login',
                type: 'POST',
                data: data,
                dataType: 'json',
                beforeSend: function () {
                    $("button[type=submit] span", form).removeClass("d-none");
                    $("button[type=submit]", form).attr("disabled", true);
                    $(".errors", form).html("");
                },
                success: function (res) {
                    Cookies.set('token', res.token);
                    Cookies.set('username', res.user.name);
                    window.location.href = '/transactions.html';
                },
                error: function (error) {
                    console.log(error.responseJSON)
                    let errorList = error.responseJSON.errors;
                    let message = error.responseJSON.message;

                    let alertMessage = `
                        <div class="alert alert-danger fw-bold" role="alert">
                          ${message}
                        </div>
                    `;
                    $(".errors", form).append(alertMessage);

                    $.each(errorList, (index, value) => {
                        let alert = `
                            <div class="alert alert-danger" role="alert">
                              ${value}
                            </div>
                        `;
                        $(".errors", form).append(alert);
                    })
                },
                complete: function () {
                    $("button[type=submit] span", form).addClass("d-none")
                    $("button[type=submit]", form).attr("disabled", false)
                },
            })
        })
    };

    return {
        init: function () {
            handleLogin();
        },
    }
}()

$(document).ready(function () {
    LoginPage.init();
})