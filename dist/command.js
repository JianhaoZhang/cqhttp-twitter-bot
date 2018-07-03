"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const log4js = require("log4js");
const path = require("path");
const datetime_1 = require("./datetime");
const logger = log4js.getLogger('command');
logger.level = global.loglevel;
function parseLink(link) {
    let match = link.match(/twitter.com\/([^\/?#]+)\/lists\/([^\/?#]+)/);
    if (match) {
        link = `https://twitter.com/${match[1]}/lists/${match[2]}`;
        return {
            link,
            match: [match[1], match[2]],
        };
    }
    match = link.match(/twitter.com\/([^\/?#]+)/);
    if (match) {
        link = `https://twitter.com/${match[1]}`;
        return {
            link,
            match: [match[1]],
        };
    }
    match = link.match(/^([^\/?#]+)\/([^\/?#]+)$/);
    if (match) {
        link = `https://twitter.com/${match[1]}/lists/${match[2]}`;
        return {
            link,
            match: [match[1], match[2]],
        };
    }
    match = link.match(/^([^\/?#]+)$/);
    if (match) {
        link = `https://twitter.com/${match[1]}`;
        return {
            link,
            match: [match[1]],
        };
    }
    return undefined;
}
function sub(chat, args, lock, lockfile) {
    if (args.length === 0) {
        return '找不到要订阅的链接。';
    }
    const match = parseLink(args[0]);
    if (!match) {
        return `订阅链接格式错误：
示例：
https://twitter.com/Saito_Shuka
https://twitter.com/rikakomoe/lists/lovelive`;
    }
    const link = match.link;
    let flag = false;
    lock.feed.forEach(fl => {
        if (fl === link)
            flag = true;
    });
    if (!flag)
        lock.feed.push(link);
    if (!lock.threads[link]) {
        lock.threads[link] = {
            offset: 0,
            subscribers: [],
            updatedAt: '',
        };
    }
    flag = false;
    lock.threads[link].subscribers.forEach(c => {
        if (c.chatID === chat.chatID && c.chatType === chat.chatType)
            flag = true;
    });
    if (!flag)
        lock.threads[link].subscribers.push(chat);
    logger.warn(`chat ${JSON.stringify(chat)} has subscribed ${link}`);
    fs.writeFileSync(path.resolve(lockfile), JSON.stringify(lock));
    return `已为此聊天订阅 ${link}`;
}
exports.sub = sub;
function unsub(chat, args, lock, lockfile) {
    if (args.length === 0) {
        return '找不到要退订的链接。';
    }
    const match = parseLink(args[0]);
    if (!match) {
        return '链接格式有误。';
    }
    const link = match.link;
    if (!lock.threads[link]) {
        return '您没有订阅此链接。\n' + list(chat, args, lock);
    }
    let flag = false;
    lock.threads[link].subscribers.forEach((c, index) => {
        if (c.chatID === chat.chatID && c.chatType === chat.chatType) {
            flag = true;
            lock.threads[link].subscribers.splice(index, 1);
        }
    });
    if (flag) {
        fs.writeFileSync(path.resolve(lockfile), JSON.stringify(lock));
        logger.warn(`chat ${JSON.stringify(chat)} has unsubscribed ${link}`);
        return `已为此聊天退订 ${link}`;
    }
    return '您没有订阅此链接。\n' + list(chat, args, lock);
}
exports.unsub = unsub;
function list(chat, args, lock) {
    const links = [];
    Object.keys(lock.threads).forEach(key => {
        lock.threads[key].subscribers.forEach(c => {
            if (c.chatID === chat.chatID && c.chatType === chat.chatType)
                links.push(`${key} ${datetime_1.relativeDate(lock.threads[key].updatedAt)}`);
        });
    });
    return '此聊天中订阅的链接：\n' + links.join('\n');
}
exports.list = list;
