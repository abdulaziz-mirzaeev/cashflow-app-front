var CreateForm = (function () {
    let handleForm = () => {
        $("#create-form").on("submit", (e) => {
            let form = $("#create-form")
            e.preventDefault()

            $("button[type=submit] span", form).removeClass("d-none")
            $("button[type=submit]", form).attr("disabled", true)

            let type = $("[name='type']:checked", form).val()
            let amount = $("[name='amount']", form).val()
            let currency = $("[name='currency']", form).val()
            let comment = $("[name='comment']", form).val()

            let data = {
                type: type,
                amount: amount,
                currency: currency,
                comment: comment,
            }

            console.log(data)

            $.ajax({
                url: "http://localhost/api/transactions",
                type: "POST",
                contentType: "application/json",
                dataType: 'json',
                data: JSON.stringify(data),
                beforeSend: () => {
                    $("#create-form .errors").html("");
                },
                success: (res) => {
                    console.log(res)
                    window.location.href = '/transactions.html';
                },
                error: (error) => {
                    console.log(error.responseJSON)
                    let errorList = error.responseJSON.errors;
                    let message = error.responseJSON.message;

                    let alertMessage = `
                            <div class="alert alert-danger fw-bold" role="alert">
                              ${message}
                            </div>
                        `;
                    $("#create-form .errors").append(alertMessage);

                    $.each(errorList, (index, value) => {
                        let alert = `
                            <div class="alert alert-danger" role="alert">
                              ${value}
                            </div>
                        `;
                        $("#create-form .errors").append(alert);
                    })
                },
                complete: () => {
                    $("button[type=submit] span", form).addClass("d-none")
                    $("button[type=submit]", form).attr("disabled", false)
                },
            })
        })
    }
    return {
        init: () => {
            handleForm()
        },
    }
})()

$(document).ready(() => {
    CreateForm.init()
})
