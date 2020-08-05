'use strict'
let url = require('url')
let extend = require('extend')
let rp = require('request-promise')
let Agent = require('socks5-http-client/lib/Agent')
let Agents = require('socks5-https-client/lib/Agent')

class Request {
    constructor () {
        this.rejectUnauthorized = false
        this.followRedirect = true
        this.usingSocks = false
        this.usingProxies = false
        this.manualCookie = false
        this.FullResponse = false
        this.cookies = rp.jar()
        this.proxyUserNameVIP = 'lum-customer-hl_18b8a06c-zone-static'
        this.proxyPasswordVIP = 'vykt6vjcf405'
        this.headers
        this.optionProxies
        this.optionCookie
        this.optionMethod
    }

    Execute(uri, optionsmethod) {
        let parse = url.parse(uri)

        let options = {
            uri: uri,
            rejectUnauthorized: false,
            simple: false,
            headers: {},
            gzip: true,
            followRedirect: this.followRedirect
            //strictSSL:  false,
        }
        if (optionsmethod) {
            extend(options, optionsmethod)
            //options = Object.assign(options, optionsmethod);
        }
        if (this.usingSocks === true) {
            options['agentClass'] = this.AgentClass(parse.protocol)
            options = Object.assign(options, this.optionProxies)
        }
        if (this.usingProxies === true) {
            options = Object.assign(options, this.optionProxies)
        }
        if (this.manualCookie === true) {
            extend(options.headers, this.optionCookie)
            //options = Object.assign(options.headers, this.optionCookie);
        } else {
            options['jar'] = this.cookies
        }
        if (this.FullResponse === true) {
            options['resolveWithFullResponse'] = this.FullResponse
        }
        extend(options.headers, this.headers)

        //options = Object.assign(options.headers, this.headers);
        return rp(options)
    }

    AddHeader(arr) {
        this.headers = {}
        arr.forEach((value) => {
            let preHeader = value.split(':')
            if (preHeader[1] && preHeader[1].charAt(0) == ' ') {
                preHeader[1] = preHeader[1].substring(1)
            }
            this.headers[preHeader[0]] = preHeader[1]
        })
        return false
    }

    AddProxy(host, port, type = 'SOCKS', session = 0) {
        if (type == 'HTTP') {
            this.optionProxies = {
                proxy: 'http://' + host + ':' + port
            }
            this.usingProxies = true
        } else if (type == 'VIP') {
            if (session == 0) {
                session = Math.floor(Math.random() * 100000000000) + 1
            }
            let proxyUrl = "http://" + this.proxyUserNameVIP + '-country-us-session-' + session + ":" + this.proxyPasswordVIP + "@zproxy.luminati.io:22225"
            //console.log(proxyUrl);
            this.optionProxies = {
                proxy: proxyUrl
            }
            this.usingProxies = true
        } else {
            this.optionProxies = {
                agentOptions: {
                    socksHost: host, // Defaults to 'localhost'.
                    socksPort: port // Defaults to 1080.
                }
            }
            this.usingSocks = true
        }
    }

    AgentClass(protocol) {
        if (protocol === 'https') return Agents
        return Agent
    }

    FullResponse(req = true) {
        if (req === true) {
            this.FullResponse = true
        } else {
            this.FullResponse = false
        }
    }

    CustomCookies(stt = false, cookie) {
        if (stt == true) {
            this.manualCookie = true
            this.optionCookie = {
                Cookie: 'jar=123'
            }
        } else {
            this.manualCookie = false
        }
    }

    GET(uri) {
        return this.Execute(uri)
    }

    POST(uri, dataPost) {
        let optionsPost = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: dataPost
        }
        return this.Execute(uri, optionsPost)
    }
}
module.exports = Request