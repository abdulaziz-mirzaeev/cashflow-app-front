var showViewModal = (id) => {
    var modalEl = $("#modalView")
    var modal = bootstrap.Modal.getOrCreateInstance(modalEl)
    let modalBody = $(".modal-body", modalEl)

    modal.show()

    modalEl.on("shown.bs.modal", (event) => {
        $(".modal-header h5", modalEl).html(`Transaction #${id}`)

        $.get({
            url: `http://localhost/api/transactions/${id}`,
            contentType: "application/json",
            success: function (res) {
                $("#modal-view-spinner", modalBody).addClass("d-none")
                let table = $("table", modalBody)
                table.removeClass("d-none")

                $("td.transaction-id", table).html(res.id)
                $("td.transaction-type", table).html(res.type)
                $("td.transaction-amount", table).html(res.amount)
                $("td.transaction-comment", table).html(res.comment)
            },
        })
    })

    modalEl.on("hidden.bs.modal", (event) => {
        $("#modal-view-spinner", modalBody).removeClass("d-none")
        $("table", modalBody).addClass("d-none")
    })
}

var showEditModal = (id) => {
    let modalEl = $("#modalEdit")
    let modal = bootstrap.Modal.getOrCreateInstance(modalEl)
    let modalBody = $(".modal-body", modalEl)

    $(".modal-title span.id", modalEl).html(id)

    $.get({
        url: `http://localhost/api/transactions/${id}`,
        contentType: 'application/json',
        success: function (response) {
            $("[name='type']", modalBody).val(response)
        },
    })

    modal.show()
}

var showDeleteModal = (id) => {
    let modalEl = $("#modalDelete")
    let modal = bootstrap.Modal.getOrCreateInstance(modalEl)
    let modalBody = $(".modal-body", modalEl)

    modal.show();

    modalEl.on("shown.bs.modal", (event) => {
        $("p span.id", modalBody).html(id)

        $("button.delete", modalBody).click(() => {
            $("button.delete span", modalBody).removeClass("d-none")
            $.ajax({
                url: `http://localhost/api/transactions/${id}`,
                type: "DELETE",
                contentType: "application/json",
                success: (res) => {
                    modal.hide()
                    window.location.reload()
                },
            })
        })
    })
}

var Transactions = (function () {
    var numberWithCommas = function (x) {
        return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
    };

    var handleAllTransactions = (endpoint = "") => {
        $.ajax({
            url: "http://localhost/api/transactions" + endpoint,
            type: "GET",
            contentType: "application/json",
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
