var showViewModal = (id) => {
    var modalEl = $("#modalView")
    var modal = bootstrap.Modal.getOrCreateInstance(modalEl)
    let modalBody = $(".modal-body", modalEl)

    $(".modal-header h5", modalEl).html(`Transaction #${id}`)

    $.get({
        url: `${URL}/api/transactions/${id}`,
        dataType: "json",
        beforeSend: function () {
            $('.global-spinner').show();
        },
        success: function (res) {
            let table = $("table", modalBody)
            table.removeClass("d-none")

            $("td.transaction-id", table).html(res.id)
            $("td.transaction-type", table).html(res.type)
            $("td.transaction-amount", table).html(res.amount)
            $("td.transaction-comment", table).html(res.comment)

            modal.show()
        },
        complete: function () {
            $('.global-spinner').hide()
        },
    })
}

var showEditModal = (id) => {
    let modalEl = $("#modalEdit")
    let modal = bootstrap.Modal.getOrCreateInstance(modalEl)
    let modalBody = $(".modal-body", modalEl)

    $(".modal-title span.id", modalEl).html(id)

    $.get({
        url: `${URL}/api/transactions/${id}`,
        dataType: 'json',
        beforeSend: function () {
            $('.global-spinner').show()
        },
        success: function (response) {
            $(`[name='type'][value='${response.typeValue}']`, modalBody).prop('checked', true);
            $("[name='amount']", modalBody).val(response.amount);
            $("[name='currency']", modalBody).val(response.currencyValue).change();
            $("[name='comment']", modalBody).val(response.comment);

            modal.show()
        },
        complete: function () {
            $('.global-spinner').hide()
        }
    })

    let form = $('form#edit-form', modalBody);

    form.on('submit', function (e) {
        e.preventDefault();

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
        };

        $.ajax({
            url: URL + "/api/transactions/" + id,
            type: "PUT",
            contentType: "application/json",
            dataType: 'json',
            data: JSON.stringify(data),
            beforeSend: () => {
                $(".errors", form).html("");
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
            complete: () => {
                $("button[type=submit] span", form).addClass("d-none")
                $("button[type=submit]", form).attr("disabled", false)
            },
        });
    })

}

var showDeleteModal = (id) => {
    let modalEl = $("#modalDelete")
    let modal = bootstrap.Modal.getOrCreateInstance(modalEl)
    let modalBody = $(".modal-body", modalEl)

    $("p span.id", modalBody).html(id)

    modal.show();

    $("button.delete", modalBody).click(() => {
        $("button.delete span", modalBody).removeClass("d-none")
        $.ajax({
            url: `${URL}/api/transactions/${id}`,
            type: "DELETE",
            dataType: "json",
            success: (res) => {
                modal.hide()
                window.location.reload()
            },
        })
    })
}

var Transactions = (function () {
    var numberWithCommas = function (x) {
        return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
    };

    var handleAllTransactions = (endpoint = "") => {
        $.ajax({
            url: URL + "/api/transactions" + endpoint,
            type: "GET",
            contentType: "application/json",
            dataType: 'json',
            beforeSend: function () {
                $("#transactions-table tbody").html("");
                $("#table-spinner").toggleClass("d-none")
            },
            success: function (res) {
                $("#table-spinner").toggleClass("d-none")
                let balance = 0

                $.each(res, function (index, item) {
                    let row = `
                    <tr class="${item.type == "Expense" ? "table-danger" : "table-success"}">
                        <td>${item.id}</td>
                        <td>${item.created_at}</td>
                        <td>${item.type}</td>
                        <td>
                            ${item.type == "Expense" ? "-" : "+"}
                            ${numberWithCommas(item.amount)} ${item.currency}
                        </td>
                        <td>${item.comment}</td>
                        <td class="d-flex justify-content-center">
                            <button type="button" onclick="showViewModal(${item.id})" class="btn btn-primary me-1">View</a>
                            <button type="button" onclick="showEditModal(${item.id})" class="btn btn-warning me-1">Edit</a>
                            <button type="button" onclick="showDeleteModal(${item.id})" class="btn btn-danger">Delete</a>
                        </td>
                    </tr>
                    `
                    $("#transactions-table tbody").append(row)
                    if (item.type == "Expense") {
                        balance -= item.amount
                    } else {
                        balance += item.amount
                    }
                })
                if (res.length === 0) {
                    let row = `<tr><td class="text-center" colspan="6">No records were found</td></tr>`
                    $("#transactions-table tbody").html(row)
                }
                $("#transactions-table tfoot .balance").html(numberWithCommas(balance))
            },
        })
    };

    let handleRadioChange = () => {
        $("[name='filter-btn']").change(function () {
            $("#transactions-table tfoot .balance").html("")
            handleAllTransactions($(this).val());
        })
    };

    return {
        init: function () {
            handleAllTransactions();
            handleRadioChange();
        },
    }
})()

$(document).ready(function () {
    Transactions.init()
})
