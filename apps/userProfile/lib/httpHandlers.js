const http = require('http')

exports.httpHandlers = {
    signUp: {
        PUT: {
            function: signUp
        }
    }
};


function signUp(request, response) {


    console.log('-----------------sign up -------------------')
    let info = {
        username: request.data.username,
        password: request.data.password,
        org: request.data.org,
        nationalCode: request.data.nationalCode,
        skill: request.data.skill,
        job: request.data.job,
        managerFName: request.data.managerFName,
        managerLName: request.data.managerLName,
        gender: request.data.gender,
        education: request.data.education,
    }

    console.log(info.username)

    let options = {
        host: '127.0.0.1',
        port: 81,
        path: '/dataService',
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'org': info.org
        }
    };

    const req = http.request(options, res => {
       // console.log(`statusCode: ${res.statusCode}`)

        res.on('data', d => {
            console.log(d)
        })
    })

    req.on('end', error => {
        console.error(error)
    })

    req.end()

}