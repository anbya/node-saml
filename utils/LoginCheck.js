const express = require("express");
const NodeCache = require("node-cache");

const cache = new NodeCache()

const limit = async (email) => {
    let key =  `login_attemps:${email}`;
    let attemps = await cache.get(key)
    let expiration = 300;

    if(!attemps){
        await cache.set(key, 1, expiration);
    } else {
        await cache.set(key, attemps +1, expiration)
    }

    return attemps ? attemps : 0
};

module.exports = {
    limit
};