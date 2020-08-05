"use strict";
var pushResult = {
    SockDie: str => {
        var result = {
            error: 1,
            msg: str
        };
        return result;
    },
    Blacklist: str => {
        var result = {
            error: 7,
            msg: str
        };
        return result;
    },
    Die: str => {
        var result = {
            error: 2,
            msg: str
        };
        return result;
    },
    Live: str => {
        var result = {
            error: 0,
            msg: str
        };
        return result;
    },
    Cant: str => {
        var result = {
            error: 4,
            msg: str
        };
        return result;
    }
};

function GetRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function GetStr(str, from, to, result = "NULL", removeSpace = false) {
    var ccc = !0 >= 0;
    if (!str) {
        return "NULL";
    } else {
        try {
            if (removeSpace) {
                str = str.replace(/\s+/g, "");
                from = from.replace(/\s+/g, "");
                to = to.replace(/\s+/g, "");
            }

            let start = str.indexOf(from);
            if (!(start >= 0)) return result;
            let end = str.indexOf(to, start + from.length);
            if (end < 0) return result;
            var rs = str.substring(
                start + from.length,
                end - start - from.length
            );
            if (!rs) return result;
        } catch (error) {
            return "NULL";
        }
    }
    return rs;
}

function GetInput(jsonData, callback) {
    if (!jsonData.mailpass) {
        return callback(this.pushResult.Cant("Error Input"));
    } else {
        let mailpass = jsonData.mailpass.split("|");
        if (mailpass.length === 2 && mailpass[0].indexOf("@") != -1) {
            let email = mailpass[0].trim();
            let pwd = mailpass[1].trim();
            let username = email.split("@")[0];
            let input = {
                email: email,
                pwd: pwd,
                username: username
            };
            return callback(undefined, input);
        } else {
            return callback(pushResult.Cant("Wrong Email"));
        }
    }
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function GetProxy(jsonData, callback) {
    if (jsonData.config.nosocks === true) {
        let result = {
            sockip: "127.0.0.1",
            sockport: 8080,
            type: "NOSOCKS",
            fullsock: "127.0.0.1:8080"
        };
        return callback(undefined, result);
    }
    if (jsonData.config.vip === true) {
        let result = {
            sockip: "127.0.0.1",
            sockport: 8080,
            type: "VIP",
            fullsock: "127.0.0.1:8080"
        };
        return callback(undefined, result);
    }
    if (jsonData.config.sock && jsonData.config.protocol) {
        if (jsonData.config.protocol === "SSH") {
            var sock = jsonData.config.sock.match(
                /\d{1,3}(\.\d{1,3}){3}[|:][A-z0-9]+[|:][A-z0-9!@#$%^&*().]+/
            );
            if (sock) {
                var ssh = sock[0].split(/[:|]/);
                var sshIP = ssh[0].trim();
                var sshUsername = ssh[1].trim();
                var sshPassword = ssh[2].trim();
                let result = {
                    sockip: sshIP,
                    sockusername: sshUsername,
                    sockpassword: sshPassword,
                    sockport: GetRandomInt(10000, 65000),
                    type: "HTTP",
                    fullsock: sshIP + "|" + sshUsername + "|" + sshPassword
                };
                return callback(undefined, result);
            } else {
                return callback(pushResult.SockDie("Wrong SSH"));
            }
        } else {
            var sock = jsonData.config.sock.match(
                /\d{1,3}([.])\d{1,3}([.])\d{1,3}([.])\d{1,3}((:)|(\s)+)\d{1,5}/g
            );
            if (sock) {
                var sock = sock[0].split(":");
                var sockip = sock[0].trim();
                var sockport = sock[1].trim();
                if (jsonData.config.protocol === "HTTP") {
                    let result = {
                        sockip: sockip,
                        sockport: sockport,
                        type: "HTTP",
                        fullsock: sockip + ":" + sockport
                    };
                    return callback(undefined, result);
                } else if (jsonData.config.protocol === "SOCKS") {
                    let result = {
                        sockip: sockip,
                        sockport: sockport,
                        type: "SOCKS",
                        fullsock: sockip + ":" + sockport
                    };
                    return callback(undefined, result);
                } else {
                    return callback(
                        pushResult.SockDie("Please check options's Proxy!")
                    );
                }
            } else {
                return callback(pushResult.SockDie("Wrong Socks / Proxy"));
            }
        }
    } else {
        return callback(pushResult.SockDie("No input options Proxy!"));
    }
}

module.exports = {
    pushResult,
    GetStr,
    GetInput,
    GetProxy,
    IsJsonString,
    GetRandomInt
};
