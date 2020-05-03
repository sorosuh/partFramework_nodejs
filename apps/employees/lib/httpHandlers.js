var rp = require('request-promise');
exports.httpHandlers = {
    employee: {
        GET: {
            function: getAllEmployees
        },
        POST: {
            function: addEmployee
        }
    }
};

function addEmployee(request, response) {

    const options = {
        url: 'http://localhost:81/dataService',
        method: 'PUT',
        headers: request.headers,
        body: {
            "id": request.data.data.nationalCode,
            "data": request.data.data,
            "parent": request.data.parent
        },
        json: true
    }

    rp(options)
        .then(function (result) {
            console.log('add to employee')
           response.sendOk('کارمند با موفقیت اضافه شد')
        })
        .catch(function (error) {
            console.log(error)
            response.sendFail(error.error)
        })
}

function getAllEmployees(request, response) {
    console.log('-----------getAllEmployees--------')

    const options = {
        url: 'http://localhost:81/getAllEmployee',
        method: 'GET',
        headers: request.headers,
        json: true
    }
    rp(options)
        .then(function (result) {
            console.log(result)
            response.sendOk(result)
        })
        .catch(function (error) {
            console.log(error)
            response.sendFail(error)
        })



}