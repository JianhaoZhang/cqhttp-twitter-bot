# CQHTTP Twitter Bot

[![npm](https://img.shields.io/npm/v/cqhttp-twitter-bot.svg)](https://www.npmjs.com/package/cqhttp-twitter-bot)
[![npm](https://img.shields.io/npm/dt/cqhttp-twitter-bot.svg)](https://www.npmjs.com/package/cqhttp-twitter-bot)
[![GitHub issues](https://img.shields.io/github/issues/rikakomoe/cqhttp-twitter-bot.svg)](https://github.com/rikakomoe/cqhttp-twitter-bot/issues)
[![npm](https://img.shields.io/npm/l/cqhttp-twitter-bot.svg)](https://www.npmjs.com/package/cqhttp-twitter-bot)

是一个可以订阅 Twitter 并转发到 QQ 的 Bot。

## 这个项目已经停止维护

+ 因为我已经没有在用它了，所以能不能用是随缘的
+ Issue 反馈是欢迎的，但不保证能够及时处理
+ 代码不多，欢迎阅读/fork，如果有问题我不能及时修理，你其实可以自己试试 :)

## 安装

```bash
npm i -g cqhttp-twitter-bot
```

当然还需要配合 [coolq-http-api](https://github.com/richardchien/coolq-http-api) 和 [酷Q](https://cqp.cc/) 才能工作。  
它们是什么？  
观察它们的文档：[https://cqhttp.cc/](https://cqhttp.cc/) [https://cqp.cc/t/15124](https://cqp.cc/t/15124)

## 食用

```bash
cqhttp-twitter-bot config.json
```

## 配置

它会从命令传入的 JSON 配置文件里读取配置，配置说明如下

| 配置项 | 说明 | 默认 |
| --- | --- | --- |
| cq_ws_host | CQHTTP Websocket 服务端地址 | 127.0.0.1 |
| cq_ws_port | CQHTTP Websocket 服务端口 | 6700 |
| cq_access_token | CQHTTP access_token | （空） |
| twitter_consumer_key | Twitter App consumer_key | （必填） |
| twitter_consumer_secret |  Twitter App consumer_secret | （必填） |
| twitter_access_token_key | Twitter App access_token_key | （必填） |
| twitter_access_token_secret | Twitter App access_token_secret | （必填） |
| mode | 工作模式，0 为图文模式，1 为纯文本模式。图文模式必须使用 [酷Q Pro](https://cqp.cc/t/14901)。 | 0 |
| work_interval | 对单个订阅两次拉取更新的最少间隔时间（秒） | 60 |
| webshot_delay | 抓取网页截图时等待网页加载的延迟时长（毫秒） | 5000 |
| lockfile | 本地保存订阅信息以便下次启动时恢复 | subscriber.lock |
| loglevel | 日志调试等级 | info |
| redis | 启用 Redis | false |
| redis_host | Redis Host | 127.0.0.1 |
| redis_port | Redis Port | 6379 |
| redis_expire_time | Redis Key 过期时间（秒） | 43200 |

示例文件在 `config.example.json`

## 命令

Bot 启动了以后就可以在 QQ 里用命令了。命令有：

- /twitter - 列出当前会话的订阅
- /twitter_sub [链接] - 订阅
- /twitter_unsub [链接] - 退订

链接可以是一个个人的时间轴或者是列表，支持下面几种格式：

个人：
  + https://twitter.com/Saito_Shuka
  + https://mobile.twitter.com/Saito_Shuka
  + Saito_Shuka

列表：
  + https://twitter.com/rikakomoe/lists/lovelive
  + https://mobile.twitter.com/rikakomoe/lists/lovelive
  + rikakomoe/lovelive

## 其他说明

1. Twitter 这两个（时间轴和列表） API 对单个应用的限制是 900次/15min，
也就是最快可以 1s 一次。这个 Bot 的工作方式是轮流拉取，即：
每次从队首拿出任务，完成后放到队尾。在不达到 1s 一次的前提下，
总体请求速度会随着订阅量的增加而加快：例如当 work_interval 设置为 60 时，
如果只有 1 个订阅，那么每分钟只有 1 个请求。如果有 2 个订阅，每分钟则有 2 个请求。
如果有 70 个订阅，每分钟仍然只有 60 个请求。

2. 上面说的每分钟之类指的是休眠的时长，工作时间不算在内。因此实际的 API 调用
频率要比这个低。

3. webshot_delay 如果设成 0 的话肯定不行的，会出现正在加载的界面。这个具体多
少最合适可以自己试，5 秒应该是比较保险了。

4. 如果启用了 Redis，同一聊天中 Redis 过期时间内的重复推文会被去重，
如同一列表中不同人转推等。

5. 原创和转推的推文如果有图片的话会另外拉取一波图片附加在消息里。
如果是视频的话则是封面图。“带评论转推”并不是转推，相当于是分享的链接，
跟从一些其他网站分享的链接是类似的。
这种情况不会拉取图片过来，链接也不会有（因为一般都被墙了）。

6. 怎么查看翻译？QQ 点开图片，长按 -> 提取图中文字 -> 译
