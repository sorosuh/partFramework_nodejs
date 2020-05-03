process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const request = require('request')
const Q = require('q')
const rp = require('request-promise');
const uuid = require('uuid4');

exports.httpHandlers = {
    signUp: {
        PUT: {
            function: signUp
        }
    },
    login: {
        POST: {
            function: login
        }
    },
    logout: {
        POST: {
            function: logout
        }
    },
    changePass: {
        POST: {
            function: changePass
        }
    },
    profile: {
        GET: {
            function: getProfile
        },
        POST: {
            function: editProfile
        }
    }

};

//------------------------------SIGN UP------------------------------

function signUp(request, response) {

    console.log('-----------------sign up-------------------')
    var res = []
    var errors = []


    Q.allSettled([
        authService(request, response),
        employeeService(request, response),
        profile(request, response),
        samad(request, response)
    ])
        .then(function (results) {
            var success = 0;
            results.forEach(function (result) {
                if (result.state === "fulfilled") {


                    // if (typeof result.value.data[0] !== 'undefined') {
                    if (Array.isArray(result.value.data)) {
                        if (result.value.data[0].status === 'Already exists!') {
                            errors.push("samad Already exists!")

                        } else if (result.value.data[0].status === 'ok') {
                            res.push('samad')
                            success++
                        }

                    } else if (result.value === 'داده ها باموفقیت ذخیره شدdata insert in dataStorage,data insert in dataMap') {
                        res.push('employee')
                        success++
                    } else if (typeof result.value.data[0] === 'undefined') {
                        if (result.value.data.function === 'undefined') {
                            errors.push('invalid function')
                            //res.push(result.value)
                            // success++
                        } else {
                            res.push(result.value.data.function)
                            success++
                        }

                    }


                } else {
                    if (typeof result.reason.error.meta === 'undefined') {
                        errors.push(result.reason.error)
                    } else {
                        errors.push(result.reason.error.meta.code)
                    }

                }
            });
            console.log(success)
            if (success === 4) {
                response.sendOk('ثبت نام موفقیت امیز')
            } else {

                res.forEach(function (deleteItem) {
                    if (deleteItem === "auth") removeFromAuth(request, response)
                    if (deleteItem === "employee") removeEmployee(request, response)
                    if (deleteItem === "samad") removeFromSamad(request, response)
                    if (deleteItem === "profile") removeFromProfile(request, response)
                })

                // console.log(JSON.stringify(reason.value))
                console.log(JSON.stringify(res))
                response.sendFail(JSON.stringify(errors))
            }
        });

}

function employeeService(request, response) {
    let deferred = Q.defer()
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
            deferred.resolve(result)
        })
        .catch(function (error) {
            deferred.reject(error)
        })

    return deferred.promise;
}

function authService(request, response) {
    let deferred = Q.defer();

    const options = {
        url: 'http://publicservices.partdp.ir/service/authentication@7/authEntry',
        method: 'PUT',
        headers: {"user": "intern_6", "pass": "intern_6", "Content-Type": "application/json"},
        body: {
            "system": "intern_6",
            "fields": {
                "username": request.data.data.username,
                "password": request.data.data.password
            },
            "status": "active"
        },
        json: true
    }

    rp(options)
        .then(function (result) {
            console.log('add to auth')
            result.data.function = 'auth'
            deferred.resolve(result)
        })
        .catch(function (error) {
            deferred.reject(error)
        })
    return deferred.promise
}

function profile(request, response) {
    let deferred = Q.defer();
    const options = {
        url: 'http://publicservices.partdp.ir/service/profile@7/profile',
        method: 'PUT',
        headers: {"user": "intern_6", "pass": "123456", "Content-Type": "application/json"},
        body: {
            "uniqueKey": request.data.data.username,
            "firstName": request.data.data.firstName,
            "lastName": request.data.data.lastName,
            "gender": request.data.data.gender,
            "idNumber": request.data.data.nationalCode,
            "education": request.data.data.education,
            "type": "real"
        },
        json: true
    }

    rp(options)
        .then(function (result) {
            console.log('add to profile')
            deferred.resolve(result, result.data.function = 'profile')
        })
        .catch(function (error) {
            deferred.reject(error)
        })


    return deferred.promise;
}

function addUserTosamad(request, response) {
    let deferred = Q.defer();
    const options = {
        url: 'http://publicservices.partdp.ir/service/samad@8/users',
        method: 'PUT',
        headers: {"user": "intern_6", "pass": "intern_6", "Content-Type": "application/json"},
        body: {
            "org": "intern_6",
            "users": [
                {
                    "username": request.data.data.username
                }
            ]
        },
        json: true
    }


    rp(options)
        .then(function (result) {
            deferred.resolve(result)
        })
        .catch(function (error) {
            deferred.reject(error)
        })
    return deferred.promise;
}

function assignUserToRoleSamad(request, response) {
    let deferred = Q.defer();
    const options = {
        url: 'http://publicservices.partdp.ir/service/samad@8/users',
        method: 'PUT',
        headers: {"user": "intern_6", "pass": "intern_6", "Content-Type": "application/json"},
        body: {
            "org": "intern_6",
            "roleName": "manager",
            "users": [request.data.data.username]
        },
        json: true
    }


    rp(options)
        .then(function (result) {
            deferred.resolve(result)
        })
        .catch(function (error) {
            deferred.reject(error)
        })
    return deferred.promise
}

function samad(request, response) {
    let deferred = Q.defer();

    addUserTosamad(request, response)
        .then(assignUserToRoleSamad(request, response))
        .then(function (result) {
            deferred.resolve(result)
        })
        .catch(function (error) {
            deferred.reject(error)
        })

    return deferred.promise
}


//------------------------------REMOVE METHOD------------------------------


function removeEmployee(request, response) {
    let deferred = Q.defer();
    const options = {
        url: 'http://localhost:81/dataService',
        method: 'DELETE',
        headers: request.headers,
        body: {
            id: request.data.data.nationalCode,
            data: request.data.data,
            parent: request.data.parent
        },
        json: true
    }

    rp(options)
        .then(function (result) {
            console.log('deleted from employee')
            deferred.resolve(result)
        })
        .catch(function (error) {
            deferred.reject(error)
        })

    return deferred.promise;
}

function removeFromAuth(request, response) {
    let deferred = Q.defer();

    const options = {
        url: 'http://publicservices.partdp.ir/service/authentication@7/authEntry',
        method: 'DELETE',
        headers: {"user": "intern_6", "pass": "intern_6", "Content-Type": "application/json"},
        body: {
            "system": "intern_6",
            "uniqueFields": {
                "username": request.data.data.username
            }
        },
        json: true
    }

    rp(options)
        .then(function (result) {
            console.log('deleted from auth')
            deferred.resolve(result)
        })
        .catch(function (error) {
            // deferred.reject("سرویس اصالت سنجی : ".concat(error.message))
            //console.log("سرویس اصالت سنجی : ".concat(error.message))
        })
    return deferred.promise
}

function removeFromSamad(request, response) {
    let deferred = Q.defer();
    const options = {
        url: 'http://publicservices.partdp.ir/service/samad@8/users',
        method: 'DELETE',
        headers: {"user": "intern_6", "pass": "intern_6", "Content-Type": "application/json"},
        body: {
            "org": "intern_6",
            "filters": [
                {
                    "username": request.data.data.username
                }
            ]
        },
        json: true
    }


    rp(options)
        .then(function (result) {
            console.log('deleted from samad')
            deferred.resolve(result)
        })
        .catch(function (error) {
            deferred.reject(error)
        })
    return deferred.promise;
}

function removeFromProfile(request, response) {
    let deferred = Q.defer();
    const options = {
        url: 'http://publicservices.partdp.ir/service/profile@7/profile',
        method: 'DELETE',
        headers: {"user": "intern_6", "pass": "123456", "Content-Type": "application/json"},
        body: {
            "idNumber": request.data.data.nationalCode
        },
        json: true
    }

    rp(options)
        .then(function (result) {
            console.log('deleted from profile')
            deferred.resolve(result)
        })
        .catch(function (error) {
            deferred.reject("سرویس پروفایل: ".concat(error.message))
            //console.log("سرویس پروفایل: ".concat(error.message))
        })


    return deferred.promise;
}


//------------------------------LOGIN-----------------------------------
function login(request, response) {
    console.log('--------------login-------------- ')

    Q.all([
        authConfirm(request, response),
        setSessionByRole(request, response)
    ])
        .then((result) => {
            response.sendOk('ورود موفقیت امیز')
        })
        .fail((error) => {
            if (error.error.meta.function === 'auth') {
                request.session.remove(function (err, res) {
                    if (err) {
                        response.sendFail(err)
                    } else {
                        request.headers.cookie = null
                        response.sendFail(error.error.data.message.fa)
                    }
                });
            } else {
                response.sendFail(error.error.data.message.fa)
            }
        })
}

function authConfirm(request, response) {
    let deferred = Q.defer();
    const options = {
        url: 'http://publicservices.partdp.ir/service/authentication@7/authenticate',
        method: 'POST',
        headers: {"user": "intern_6", "pass": "intern_6", "Content-Type": "application/json"},
        body: {
            "system": "intern_6",
            "fields": {
                "username": request.data.username,
                "password": request.data.password
            }
        },
        json: true
    }

    rp(options)
        .then(function (result) {
            if (response.statusCode === 200) {
                deferred.resolve(result)
            } else {
                deferred.reject()
            }

        })
        .catch(function (error) {
            error.error.meta.function = 'auth'
            deferred.reject(error)
        })


    return deferred.promise;
}

/**
 * @ get role from samad and profile information from profile service then set session & cookie
 * @param request
 * @param response
 * @returns {*}
 */
function setSessionByRole(request, response) {


    let deferred = Q.defer();
    const optionsSamad = {
        url: 'http://publicservices.partdp.ir/service/samad@8/users',
        method: 'POST',
        headers: {"user": "intern_6", "pass": "intern_6", "Content-Type": "application/json"},
        body: {
            "org": "intern_6",
            "filters": [
                {
                    "username": request.data.username
                }
            ]
        },
        json: true
    }
    const optionsProfile = {
        url: 'http://publicservices.partdp.ir/service/profile@7/profile?uniqueKey=' + request.data.username,
        method: 'GET',
        headers: {"user": "intern_6", "pass": "intern_6", "Content-Type": "application/json"},
        json: true
    }

    rp(optionsSamad)
        .then(function (result) {

            let data = {samadUsername: request.data.username, roles: result.data[0].roles}

            request.session.start(data, (err, res) => {
                if (err) {
                    deferred.reject(err + 'کاربر در سیستم موجود نیست')
                } else {

                    rp(optionsProfile)
                        .then(function (result) {

                            request.session.set({
                                idNumber: result.data.real[0].idNumber,
                                type: result.data.real[0].type
                            }, function (error, result) {

                                if (error) {
                                    response.sendFail(err)
                                } else {
                                    response.setHeader('Set-Cookie', `token=${res.token};Path=/`);
                                    // deferred.resolve('سشن و کوکی با موفقیت ست شد')
                                    deferred.resolve(result)
                                }

                            })

                        }).catch(function (err) {
                        console.log(err)
                    })

                }
            });
        })
        .catch(function (error) {
            deferred.reject(error.message)
        })

    return deferred.promise;
}


//------------------------------LOG OUT----------------------------------

function logout(request, response) {

    console.log('----------------you call logout-----------------')

    request.session.remove(function (err, res) {
        if (err) {
            response.sendFail(err)
        } else {
            console.log('سشن حذف شد')
            console.log(request.headers.cookie)
            request.headers.cookie = null
            response.sendOk('خروج موفقیت امیز')
        }
    });
}

//------------------------------CHANGE_PASS-------------------------------

function changePass(request, response) {
    console.log('-----------changePass called-----------')
    request.session.get(['type'], (err, res) => {
        if (err) {
            response.sendFail(err)
        } else {

            if (res.type === null) {
                response.sendFail('نشست کاری شما به پایان رسیده است')
            }

            let options = {
                url: 'http://publicservices.partdp.ir/service/profile@7/profile?type=' + res.type + '&idNumber=' + request.data.nationalCode,
                method: 'GET',
                headers: {"user": "intern_6", "pass": "intern_6", "Content-Type": "application/json"},
                body: {},
                json: true
            }

            rp(options)
                .then(function (result) {
                    if (response.statusCode === 200) {
                        if (request.data.email === result.data.real[0].email) {
                            console.log('editable')
                            changeAuthPass(request, response)
                                .then((result) => {
                                    console.log(result)
                                    response.end('رمز عبور با موفقیت تغییر کرد.')
                                }, (reason) => {
                                    console.log(reason)
                                    response.sendFail('خطا در تغییر رمز عبور');
                                });

                        } else {
                            response.sendFail('ایمیل صحیح نیست!')
                        }
                    } else {
                        response.sendFail(result.error.data.message.fa)
                    }

                })
                .catch(function (error) {
                    response.sendFail(error.error.data.message.fa)
                })
        }
    })

}

function changeAuthPass(request, response) {

    let deferred = Q.defer();
    request.session.getSession((err, res) => {
        if (err) {
            return err
        } else {
            let options = {
                url: 'http://publicservices.partdp.ir/service/authentication@7/authEntry',
                method: 'POST',
                headers: {"user": "intern_6", "pass": "123456", "Content-Type": "application/json"},
                body: {
                    "system": "intern_6",
                    "uniqueFields": {
                        "username": res.samadUsername
                    },
                    "newValues": {
                        "password": request.data.newPassword
                    }
                },
                json: true
            }

            rp(options)
                .then(function (result) {
                    if (response.statusCode === 200) {
                        deferred.resolve(result)
                    } else {
                        deferred.reject(result)
                    }
                })
                .catch(function (error) {
                    deferred.reject(error)
                })
        }
    })
    return deferred.promise;
}

//------------------------------PROFILE-----------------------------------

function getProfile(request, response) {
    console.log('------------getProfile called------------')
    request.session.get(['idNumber', 'samadUsername', 'roles'], (err, res) => {
        if (err) {
            response.sendFail(err)
        } else {

            let options = {
                url: 'http://publicservices.partdp.ir/service/profile@7/profile?idNumber=' + res.idNumber,
                method: 'GET',
                headers: {"user": "intern_6", "pass": "intern_6", "Content-Type": "application/json"},
                body: {},
                json: true
            }

            rp(options)
                .then(function (result) {
                    if (response.statusCode === 200) {
                        response.sendOk(result.data.real[0])
                    } else {
                        response.sendFail(result)
                    }
                })
                .catch(function (error) {
                    response.sendFail(error)
                })

        }
    })


}

function editProfile(request, response) {
    console.log('---------editProfile called------------')


    request.session.get(['idNumber', 'type'], (err, res) => {
        if (err) {
            response.sendFail(err)
        } else {
            console.log(res)
            if (res.type == null || res.idNumber == null) {
                response.sendFail('نشست کاری شما به پایان رسیده است')
            }

            let options = {
                url: 'http://publicservices.partdp.ir/service/profile@7/profile',
                method: 'POST',
                headers: {"user": "intern_6", "pass": "intern_6", "Content-Type": "application/json"},
                body: {
                    "type": res.type,
                    "idNumber": res.idNumber.toString(),
                    "firstName": request.data.firstName,
                    "lastName": request.data.lastName,
                    "gender": request.data.gender,
                    "maritalStatus": request.data.maritalStatus,
                    "fatherName": request.data.fatherName,
                    "identityNumber": request.data.identityNumber,
                    "issuedFrom": request.data.issuedFrom,
                    "identitySerialNumber": request.data.identitySerialNumber,
                    "birthday": request.data.birthday,
                    "education": request.data.education,
                    "email": request.data.email
                },
                json: true
            }
            rp(options)
                .then(function (result) {
                    console.log('--------result---------')
                    //console.log(JSON.stringify(result.data.real[0]))
                    if (response.statusCode === 200) {
                        response.sendOk('پروفایل باموفقیت ویرایش شد.')
                    }else{
                        response.sendFail(error.error.meta.code)
                    }
                })
                .catch(function (error) {
                    console.log('-------error-------')
                    response.sendFail(error.error.meta.code)
                })
        }
    })
}